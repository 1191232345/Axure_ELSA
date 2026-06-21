window.AdminState = (function () {
  var data = {
    employees: {},
    ratingItems: {},
    employeeRatingRelations: {},
    evaluationResults: {},
    departments: [],
  };

  var pagination = {
    employees: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
    ratingItems: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
    evaluationResults: { currentPage: 1, pageSize: 15, totalItems: 0, totalPages: 1 },
  };

  var filteredData = {
    employees: null,
    ratingItems: null,
    evaluationResults: null,
  };

  function setAll(loaded) {
    data.employees = loaded.employees || {};
    data.ratingItems = loaded.ratingItems || {};
    data.employeeRatingRelations = loaded.employeeRatingRelations || {};
    data.evaluationResults = loaded.evaluationResults || {};

    // 完全使用后端返回的分页信息
    if (loaded.pagination) {
      if (loaded.pagination.employees) {
        pagination.employees.currentPage = loaded.pagination.employees.page;
        pagination.employees.pageSize = loaded.pagination.employees.pageSize;
        pagination.employees.totalItems = loaded.pagination.employees.total;
        pagination.employees.totalPages = loaded.pagination.employees.totalPages;
      }
      if (loaded.pagination.ratingItems) {
        pagination.ratingItems.currentPage = loaded.pagination.ratingItems.page;
        pagination.ratingItems.pageSize = loaded.pagination.ratingItems.pageSize;
        pagination.ratingItems.totalItems = loaded.pagination.ratingItems.total;
        pagination.ratingItems.totalPages = loaded.pagination.ratingItems.totalPages;
      }
      if (loaded.pagination.evaluationResults) {
        pagination.evaluationResults.currentPage = loaded.pagination.evaluationResults.page;
        pagination.evaluationResults.pageSize = loaded.pagination.evaluationResults.pageSize;
        pagination.evaluationResults.totalItems = loaded.pagination.evaluationResults.total;
        pagination.evaluationResults.totalPages = loaded.pagination.evaluationResults.totalPages;
      }
    }
  }

  // 只更新指定字段，不影响其他数据
  function setPartial(loaded) {
    if (loaded.employees) data.employees = loaded.employees;
    if (loaded.ratingItems) data.ratingItems = loaded.ratingItems;
    if (loaded.employeeRatingRelations) data.employeeRatingRelations = loaded.employeeRatingRelations;
    if (loaded.evaluationResults) data.evaluationResults = loaded.evaluationResults;

    if (loaded.pagination) {
      if (loaded.pagination.employees) {
        pagination.employees.currentPage = loaded.pagination.employees.page;
        pagination.employees.pageSize = loaded.pagination.employees.pageSize;
        pagination.employees.totalItems = loaded.pagination.employees.total;
        pagination.employees.totalPages = loaded.pagination.employees.totalPages;
      }
      if (loaded.pagination.ratingItems) {
        pagination.ratingItems.currentPage = loaded.pagination.ratingItems.page;
        pagination.ratingItems.pageSize = loaded.pagination.ratingItems.pageSize;
        pagination.ratingItems.totalItems = loaded.pagination.ratingItems.total;
        pagination.ratingItems.totalPages = loaded.pagination.ratingItems.totalPages;
      }
      if (loaded.pagination.evaluationResults) {
        pagination.evaluationResults.currentPage = loaded.pagination.evaluationResults.page;
        pagination.evaluationResults.pageSize = loaded.pagination.evaluationResults.pageSize;
        pagination.evaluationResults.totalItems = loaded.pagination.evaluationResults.total;
        pagination.evaluationResults.totalPages = loaded.pagination.evaluationResults.totalPages;
      }
    }
  }

  function setDepartments(depts) {
    data.departments = depts || [];
  }

  function getEmployees() {
    return filteredData.employees || data.employees;
  }

  function getEmployee(id) {
    return data.employees[id] || null;
  }

  function getRatingItems() {
    return filteredData.ratingItems || data.ratingItems;
  }

  function getRatingItem(id) {
    return data.ratingItems[id] || null;
  }

  function getRelations() {
    return data.employeeRatingRelations;
  }

  function getRelationsForRatingItem(ratingItemId) {
    var count = 0;
    Object.keys(data.employeeRatingRelations).forEach(function (empId) {
      if (data.employeeRatingRelations[empId].includes(ratingItemId)) {
        count++;
      }
    });
    return count;
  }

  function getEvaluationResults() {
    return filteredData.evaluationResults || data.evaluationResults;
  }

  function getDepartments() {
    return data.departments;
  }

  function getPagination(type) {
    return pagination[type];
  }

  function setPaginationPage(type, page) {
    pagination[type].currentPage = page;
  }

  function updatePaginationInfo() {
    updatePaginationForType('employees');
    updatePaginationForType('ratingItems');
    updatePaginationForType('evaluationResults');
  }

  function updatePaginationForType(type) {
    var items = filteredData[type] || data[type];
    var pag = pagination[type];
    pag.totalItems = Object.keys(items).length;
    pag.totalPages = Math.max(1, Math.ceil(pag.totalItems / pag.pageSize));
  }

  function setFilteredData(type, filtered) {
    filteredData[type] = filtered;
    updatePaginationForType(type);
  }

  function clearFilteredData(type) {
    filteredData[type] = null;
    updatePaginationForType(type);
  }

  function getPagedItems(type) {
    // 数据已经是分页后的，直接返回
    return filteredData[type] || data[type];
  }

  return {
    setAll: setAll,
    setPartial: setPartial,
    setDepartments: setDepartments,
    getEmployees: getEmployees,
    getEmployee: getEmployee,
    getRatingItems: getRatingItems,
    getRatingItem: getRatingItem,
    getRelations: getRelations,
    getRelationsForRatingItem: getRelationsForRatingItem,
    getEvaluationResults: getEvaluationResults,
    getDepartments: getDepartments,
    getPagination: getPagination,
    setPaginationPage: setPaginationPage,
    updatePaginationInfo: updatePaginationInfo,
    setFilteredData: setFilteredData,
    clearFilteredData: clearFilteredData,
    getPagedItems: getPagedItems,
  };
})();