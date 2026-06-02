window.Api = (function () {
  var config = AppConfig.api;

  function request(url, options) {
    return fetch(url, options).then(function (response) {
      if (!response.ok) throw new Error('服务器响应错误');
      return response.json();
    });
  }

  function loadAllData(page, pageSize, search, department) {
    page = page || 1;
    pageSize = pageSize || 10;
    
    var employeesUrl = config.employees + '?page=' + page + '&pageSize=' + pageSize;
    if (search) employeesUrl += '&search=' + encodeURIComponent(search);
    if (department) employeesUrl += '&department=' + encodeURIComponent(department);
    
    return Promise.all([
      request(employeesUrl),
      request(config.ratingItems),
      request(config.relations),
      request(config.evaluationResults),
    ]).then(function (results) {
      return {
        employees: results[0].employees || results[0],
        pagination: results[0].pagination || null,
        ratingItems: results[1],
        employeeRatingRelations: results[2],
        evaluationResults: results[3],
      };
    });
  }

  function submitEvaluations(evaluations) {
    return request(config.batchSubmit, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluations),
    });
  }

  function loadDepartments() {
    return request(config.departments);
  }

  return {
    loadAllData: loadAllData,
    submitEvaluations: submitEvaluations,
    loadDepartments: loadDepartments,
  };
})();
