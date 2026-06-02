window.DepartmentApi = (function () {
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

  function loadDepartments(page, pageSize, search, enabled) {
    page = page || 1;
    pageSize = pageSize || 10;
    
    var url = config.departments + '?page=' + page + '&pageSize=' + pageSize;
    if (search) url += '&search=' + encodeURIComponent(search);
    if (enabled !== undefined && enabled !== null && enabled !== '') url += '&enabled=' + enabled;
    
    return request(url);
  }

  function loadEnabledDepartments() {
    return request(config.departments + '/enabled');
  }

  function getDepartment(id) {
    return request(config.departments + '/' + id);
  }

  function addDepartment(data) {
    return request(config.departments, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function updateDepartment(id, data) {
    return request(config.departments + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function deleteDepartment(id) {
    return request(config.departments + '/' + id, { method: 'DELETE' });
  }

  return {
    loadDepartments: loadDepartments,
    loadEnabledDepartments: loadEnabledDepartments,
    getDepartment: getDepartment,
    addDepartment: addDepartment,
    updateDepartment: updateDepartment,
    deleteDepartment: deleteDepartment,
  };
})();