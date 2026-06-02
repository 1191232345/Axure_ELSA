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
    updatePaginationInfo();
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
    var items = filteredData[type] || data[type];
    var pag = pagination[type];
    var keys = Object.keys(items);
    var start = (pag.currentPage - 1) * pag.pageSize;
    var end = start + pag.pageSize;
    var pagedKeys = keys.slice(start, end);
    var result = {};
    pagedKeys.forEach(function (key) {
      result[key] = items[key];
    });
    return result;
  }

  return {
    setAll: setAll,
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