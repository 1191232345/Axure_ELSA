window.AdminApi = (function () {
  var config = AdminConfig.api;

  function request(url, options) {
    return fetch(url, options).then(function (response) {
      if (!response.ok) {
        return response.json().then(function (err) {
          throw new Error(err.error || '服务器响应错误');
        });
      }
      return response.json();
    });
  }

  function loadAllData() {
    // 获取当前分页状态
    var empPage = AdminState.getPagination('employees');
    var ratingPage = AdminState.getPagination('ratingItems');
    var evalPage = AdminState.getPagination('evaluationResults');

    return Promise.all([
      request(config.employees + '?page=' + empPage.currentPage + '&pageSize=' + empPage.pageSize),
      request(config.ratingItems + '?page=1&pageSize=1000'),  // 获取所有评分项（不分页）
      request(config.evaluationResults + '?page=' + evalPage.currentPage + '&pageSize=' + evalPage.pageSize),
      request(config.relations),
    ]).then(function (results) {
      console.log('API 返回数据:', results);
      var data = {
        employees: results[0].employees || results[0],
        ratingItems: results[1].ratingItems || results[1],
        evaluationResults: results[2].evaluationResults || results[2],
        employeeRatingRelations: results[3],
        pagination: {
          employees: results[0].pagination || null,
          ratingItems: results[1].pagination || null,
          evaluationResults: results[2].pagination || null,
        }
      };
      console.log('处理后的数据:', data);
      console.log('员工数量:', Object.keys(data.employees).length);
      console.log('评分项数量:', Object.keys(data.ratingItems).length);
      console.log('评价结果数量:', Object.keys(data.evaluationResults).length);
      console.log('分页信息:', data.pagination);
      return data;
    });
  }

  function loadEmployees(page, pageSize, search, department) {
    var url = config.employees + '?page=' + page + '&pageSize=' + pageSize;
    if (search) url += '&search=' + encodeURIComponent(search);
    if (department) url += '&department=' + encodeURIComponent(department);
    return request(url);
  }

  function loadRatingItems(page, pageSize) {
    return request(config.ratingItems + '?page=' + page + '&pageSize=' + pageSize);
  }

  function loadEvaluationResults(page, pageSize, employeeName, department) {
    var url = config.evaluationResults + '?page=' + page + '&pageSize=' + pageSize;
    if (employeeName) url += '&employee_name=' + encodeURIComponent(employeeName);
    if (department) url += '&department=' + encodeURIComponent(department);
    return request(url);
  }

  function loadDepartments() {
    return request(config.departments + '?page=1&pageSize=1000').then(function (result) {
      // 如果返回的是分页格式，提取 departments 字段
      return result.departments || result;
    });
  }

  function addEmployee(data) {
    return request(config.employees, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function updateEmployee(id, data) {
    return request(config.employees + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function deleteEmployee(id) {
    return request(config.employees + '/' + id, { method: 'DELETE' });
  }

  function batchDeleteEmployees(data) {
    return request(config.batchDeleteEmployees, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function addRatingItem(data) {
    return request(config.ratingItems, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function updateRatingItem(id, data) {
    return request(config.ratingItems + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function deleteRatingItem(id) {
    return request(config.ratingItems + '/' + id, { method: 'DELETE' });
  }

  function batchDeleteRatingItems(ids) {
    return request(config.batchDeleteRatingItems, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ids }),
    });
  }

  function batchImportEmployees(data) {
    return request(config.batchImportEmployees, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: data }),
    });
  }

  function batchImportRatingItems(data) {
    return request(config.batchImportRatingItems, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: data }),
    });
  }

  function deleteEmployeesByFilter(filters) {
    return request(config.deleteEmployeesByFilter, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
  }

  function deleteDepartmentsByFilter(filters) {
    return request(config.deleteDepartmentsByFilter, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
  }

  function deleteRatingItemsByFilter(filters) {
    return request(config.deleteRatingItemsByFilter, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
  }

  function deleteEvaluationResult(id) {
    return request(config.evaluationResults + '/' + id, { method: 'DELETE' });
  }

  function clearEvaluationResults(data) {
    return request(config.clearEvaluationResults, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  return {
    loadAllData: loadAllData,
    loadEmployees: loadEmployees,
    loadRatingItems: loadRatingItems,
    loadEvaluationResults: loadEvaluationResults,
    loadDepartments: loadDepartments,
    addEmployee: addEmployee,
    updateEmployee: updateEmployee,
    deleteEmployee: deleteEmployee,
    batchDeleteEmployees: batchDeleteEmployees,
    batchImportEmployees: batchImportEmployees,
    deleteEmployeesByFilter: deleteEmployeesByFilter,
    addRatingItem: addRatingItem,
    updateRatingItem: updateRatingItem,
    deleteRatingItem: deleteRatingItem,
    batchDeleteRatingItems: batchDeleteRatingItems,
    batchImportRatingItems: batchImportRatingItems,
    deleteRatingItemsByFilter: deleteRatingItemsByFilter,
    deleteEvaluationResult: deleteEvaluationResult,
    clearEvaluationResults: clearEvaluationResults,
    deleteDepartmentsByFilter: deleteDepartmentsByFilter,
  };
})();