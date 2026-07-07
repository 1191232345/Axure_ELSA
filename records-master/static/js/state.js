window.State = (function () {
  var data = {
    employees: {},
    ratingItems: {},
    employeeRatingRelations: {},
    evaluationResults: {},
  };

  var pagination = {
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  };

  var filters = {
    search: '',
    department: '',
  };

  // 跨页草稿：换页/筛选时保留未提交的评价
  var draftEvaluations = {};

  function setAll(loaded) {
    data.employees = loaded.employees || {};
    data.ratingItems = loaded.ratingItems || {};
    data.employeeRatingRelations = loaded.employeeRatingRelations || {};
    data.evaluationResults = loaded.evaluationResults || {};
    data.departments = loaded.departments || null;  // 支持部门数据

    if (loaded.pagination) {
      pagination.currentPage = loaded.pagination.page || 1;
      pagination.pageSize = loaded.pagination.pageSize || 10;
      pagination.total = loaded.pagination.total || 0;
      pagination.totalPages = loaded.pagination.totalPages || 1;
    }
  }

  function getEmployees() {
    return data.employees;
  }

  function getEmployee(id) {
    return data.employees[id] || null;
  }

  function getRatingItems() {
    return data.ratingItems;
  }

  function getRatingItem(id) {
    return data.ratingItems[id] || data.ratingItems[String(id)] || null;
  }

  function getRelations() {
    return data.employeeRatingRelations;
  }

  function getRelationsForEmployee(employeeId) {
    return data.employeeRatingRelations[employeeId]
      || data.employeeRatingRelations[String(employeeId)]
      || [];
  }

  function getDepartments() {
    // 如果有部门管理数据，优先使用
    if (data.departments) {
      // 支持数组格式
      if (Array.isArray(data.departments)) {
        return data.departments;
      }
      // 支持对象格式 {id: {name: "xxx"}, ...}
      if (typeof data.departments === 'object' && !Array.isArray(data.departments)) {
        return Object.values(data.departments);
      }
    }
    // 否则从员工数据中提取
    var deptSet = {};
    Object.keys(data.employees).forEach(function (id) {
      var dept = data.employees[id].department;
      if (dept) deptSet[dept] = true;
    });
    return Object.keys(deptSet);
  }

  function getPagination() {
    return pagination;
  }

  function setPaginationPage(page) {
    pagination.currentPage = page;
  }

  function setFilters(search, department) {
    filters.search = search || '';
    filters.department = department || '';
  }

  function getFilters() {
    return filters;
  }

  function collectEmployeeEvaluationFromDom(employeeId, evaluatorName) {
    var employee = getEmployee(employeeId);
    var evaluationData = {
      employee_id: employeeId,
      employee_name: employee ? employee.name : '未知员工',
      employee_department: employee ? employee.department : '未知部门',
      evaluator_name: evaluatorName || '匿名评价人',
      rating_details: {},
      created_at: new Date().toISOString(),
      status: 'draft',
    };

    var employeeItem = typeof Renderer !== 'undefined' && Renderer.findEmployeeItem
      ? Renderer.findEmployeeItem(employeeId)
      : null;
    var scope = employeeItem || document;

    var relatedIds = getRelationsForEmployee(employeeId);
    relatedIds.forEach(function (ratingId) {
      var ratingInput = scope.querySelector('input[name="rating_' + employeeId + '_' + ratingId + '"]');
      var commentTextarea = scope.querySelector('textarea[name="comment_' + employeeId + '_' + ratingId + '"]');

      if (ratingInput && ratingInput.value) {
        evaluationData.rating_details[ratingId] = {
          score: parseFloat(ratingInput.value),
          comment: commentTextarea ? commentTextarea.value : '',
        };
      } else if (commentTextarea && commentTextarea.value && commentTextarea.value.trim() !== '') {
        evaluationData.rating_details[ratingId] = {
          score: 0,
          comment: commentTextarea.value,
        };
      } else if (!employeeItem) {
        var slider = scope.querySelector('.rating-item[data-rating-id="' + ratingId + '"] .rating-slider');
        if (slider && parseFloat(slider.value) > 0) {
          evaluationData.rating_details[ratingId] = {
            score: parseFloat(slider.value),
            comment: commentTextarea ? commentTextarea.value : '',
          };
        }
      }
    });

    return evaluationData;
  }

  function collectEmployeeEvaluation(employeeId, evaluatorName) {
    return collectEmployeeEvaluationFromDom(employeeId, evaluatorName);
  }

  function hasEvaluationContent(evalData) {
    if (!evalData || !evalData.rating_details) return false;
    return Object.keys(evalData.rating_details).some(function (ratingId) {
      var detail = evalData.rating_details[ratingId];
      return (detail.score && detail.score > 0) || (detail.comment && detail.comment.trim() !== '');
    });
  }

  function saveCurrentPageDrafts() {
    Object.keys(data.employees).forEach(function (employeeId) {
      var employeeItem = typeof Renderer !== 'undefined' && Renderer.findEmployeeItem
        ? Renderer.findEmployeeItem(employeeId)
        : null;
      if (!employeeItem) return;

      var evalData = collectEmployeeEvaluationFromDom(employeeId);
      if (hasEvaluationContent(evalData)) {
        draftEvaluations[employeeId] = evalData;
      } else {
        delete draftEvaluations[employeeId];
      }
    });
  }

  function syncCurrentPageDraftsToStore() {
    Object.keys(data.employees).forEach(function (employeeId) {
      var employeeItem = typeof Renderer !== 'undefined' && Renderer.findEmployeeItem
        ? Renderer.findEmployeeItem(employeeId)
        : null;
      if (!employeeItem) return;

      var evalData = collectEmployeeEvaluationFromDom(employeeId);
      if (hasEvaluationContent(evalData)) {
        draftEvaluations[employeeId] = evalData;
      }
    });
  }

  function getDraftEvaluations() {
    return draftEvaluations;
  }

  function getDraftForEmployee(employeeId) {
    return draftEvaluations[employeeId] || null;
  }

  function clearDraftForEmployee(employeeId) {
    delete draftEvaluations[employeeId];
  }

  function clearAllDrafts() {
    draftEvaluations = {};
  }

  function evaluationHasLowScoreWithoutComment(evalData) {
    if (!evalData || !evalData.rating_details) return false;
    return Object.keys(evalData.rating_details).some(function (ratingId) {
      var detail = evalData.rating_details[ratingId];
      var score = detail.score || 0;
      if (score !== 0 && score < AppConfig.rating.lowScoreThreshold) {
        return !detail.comment || detail.comment.trim() === '';
      }
      return false;
    });
  }

  function collectAllEvaluations(evaluatorName) {
    saveCurrentPageDrafts();

    var all = [];
    Object.keys(draftEvaluations).forEach(function (employeeId) {
      var evalData = Object.assign({}, draftEvaluations[employeeId], {
        evaluator_name: evaluatorName || '匿名评价人',
        status: 'submitted',
      });
      if (hasEvaluationContent(evalData)) {
        all.push(evalData);
      }
    });
    return all;
  }

  function hasAnyLowScoreWithoutComment() {
    syncCurrentPageDraftsToStore();
    return Object.keys(draftEvaluations).some(function (employeeId) {
      return evaluationHasLowScoreWithoutComment(draftEvaluations[employeeId]);
    });
  }

  function hasAnyRatingOrComment() {
    syncCurrentPageDraftsToStore();
    return Object.keys(draftEvaluations).length > 0;
  }

  return {
    setAll: setAll,
    getEmployees: getEmployees,
    getEmployee: getEmployee,
    getRatingItems: getRatingItems,
    getRatingItem: getRatingItem,
    getRelations: getRelations,
    getRelationsForEmployee: getRelationsForEmployee,
    getDepartments: getDepartments,
    getPagination: getPagination,
    setPaginationPage: setPaginationPage,
    setFilters: setFilters,
    getFilters: getFilters,
    collectEmployeeEvaluation: collectEmployeeEvaluation,
    collectAllEvaluations: collectAllEvaluations,
    hasAnyLowScoreWithoutComment: hasAnyLowScoreWithoutComment,
    hasAnyRatingOrComment: hasAnyRatingOrComment,
    saveCurrentPageDrafts: saveCurrentPageDrafts,
    getDraftEvaluations: getDraftEvaluations,
    getDraftForEmployee: getDraftForEmployee,
    clearDraftForEmployee: clearDraftForEmployee,
    clearAllDrafts: clearAllDrafts,
  };
})();
