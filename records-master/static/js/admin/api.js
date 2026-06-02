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
    return Promise.all([
      request(config.employees),
      request(config.ratingItems),
      request(config.evaluationResults),
      request(config.relations),
    ]).then(function (results) {
      return {
        employees: results[0],
        ratingItems: results[1],
        evaluationResults: results[2],
        employeeRatingRelations: results[3],
      };
    });
  }

  function loadDepartments() {
    return request(config.departments);
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
    loadDepartments: loadDepartments,
    addEmployee: addEmployee,
    updateEmployee: updateEmployee,
    deleteEmployee: deleteEmployee,
    batchDeleteEmployees: batchDeleteEmployees,
    addRatingItem: addRatingItem,
    updateRatingItem: updateRatingItem,
    deleteRatingItem: deleteRatingItem,
    batchDeleteRatingItems: batchDeleteRatingItems,
    deleteEvaluationResult: deleteEvaluationResult,
    clearEvaluationResults: clearEvaluationResults,
  };
})();