window.SourceApi = (function () {
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

  function loadSources(page, pageSize, search, enabled) {
    page = page || 1;
    pageSize = pageSize || 10;
    
    var url = config.sources + '?page=' + page + '&pageSize=' + pageSize;
    if (search) url += '&search=' + encodeURIComponent(search);
    if (enabled !== undefined && enabled !== null && enabled !== '') url += '&enabled=' + enabled;
    
    return request(url);
  }

  function loadEnabledSources() {
    return request(config.sources + '/enabled');
  }

  function getSource(id) {
    return request(config.sources + '/' + id);
  }

  function addSource(data) {
    return request(config.sources, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function updateSource(id, data) {
    return request(config.sources + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  function deleteSource(id) {
    return request(config.sources + '/' + id, { method: 'DELETE' });
  }

  return {
    loadSources: loadSources,
    loadEnabledSources: loadEnabledSources,
    getSource: getSource,
    addSource: addSource,
    updateSource: updateSource,
    deleteSource: deleteSource,
  };
})();