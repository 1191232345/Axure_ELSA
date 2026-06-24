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
    return data.ratingItems[id] || null;
  }

  function getRelations() {
    return data.employeeRatingRelations;
  }

  function getRelationsForEmployee(employeeId) {
    return data.employeeRatingRelations[employeeId] || [];
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

  function collectEmployeeEvaluation(employeeId, evaluatorName) {
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

    var relatedIds = getRelationsForEmployee(employeeId);
    relatedIds.forEach(function (ratingId) {
      var ratingInput = document.querySelector('input[name="rating_' + employeeId + '_' + ratingId + '"]');
      var commentTextarea = document.querySelector('textarea[name="comment_' + employeeId + '_' + ratingId + '"]');

      if (ratingInput && ratingInput.value) {
        evaluationData.rating_details[ratingId] = {
          score: parseFloat(ratingInput.value),
          comment: commentTextarea ? commentTextarea.value : '',
        };
      }
    });

    return evaluationData;
  }

  function collectAllEvaluations(evaluatorName) {
    var all = [];
    Object.keys(data.employees).forEach(function (employeeId) {
      var evalData = collectEmployeeEvaluation(employeeId, evaluatorName);
      if (evalData.rating_details && Object.keys(evalData.rating_details).length > 0) {
        evalData.status = 'submitted';
        all.push(evalData);
      }
    });
    return all;
  }

  function hasAnyLowScoreWithoutComment() {
    var items = document.querySelectorAll('.evaluation-item');
    var found = false;
    items.forEach(function (employeeItem) {
      var ratingItems = employeeItem.querySelectorAll('.rating-item');
      ratingItems.forEach(function (ratingItem) {
        var hiddenInput = ratingItem.querySelector('.rating-input');
        var ratingValue = hiddenInput && hiddenInput.value ? parseFloat(hiddenInput.value) : 0;
        var commentTextarea = ratingItem.querySelector('.comment-textarea');
        if (ratingValue !== 0 && ratingValue < AppConfig.rating.lowScoreThreshold) {
          if (!commentTextarea || !commentTextarea.value || commentTextarea.value.trim() === '') {
            found = true;
          }
        }
      });
    });
    return found;
  }

  function hasAnyRatingOrComment() {
    var canSubmit = false;
    document.querySelectorAll('.evaluation-item').forEach(function (employeeItem) {
      var sliders = employeeItem.querySelectorAll('.rating-slider');
      var textareas = employeeItem.querySelectorAll('textarea');
      sliders.forEach(function (slider) {
        if (parseFloat(slider.value) > 0) canSubmit = true;
      });
      textareas.forEach(function (textarea) {
        if (textarea.value && textarea.value.trim() !== '') canSubmit = true;
      });
    });
    return canSubmit;
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
  };
})();
