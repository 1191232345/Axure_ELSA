window.SourcePage = (function () {
  var state = {
    sources: {},
    pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    search: '',
    enabled: '',
    editingId: null,
    initialized: false,  // 添加初始化标志
  };

  function init() {
    // 只在第一次调用时绑定事件
    if (!state.initialized) {
      bindEvents();
      state.initialized = true;
    }
    // 每次都加载数据
    loadSources();
  }

  function bindEvents() {
    var searchInput = document.getElementById('sourceSearch');
    var statusFilter = document.getElementById('sourceStatusFilter');
    var addBtn = document.getElementById('addSourceBtn');

    if (searchInput) {
      searchInput.addEventListener('input', debounce(function (e) {
        state.search = e.target.value.trim();
        state.pagination.page = 1;
        loadSources();
      }, 300));
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', function (e) {
        state.enabled = e.target.value;
        state.pagination.page = 1;
        loadSources();
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        openModal();
      });
    }
  }

  function loadSources() {
    var enabled = state.enabled !== '' ? parseInt(state.enabled) : null;
    
    SourceApi.loadSources(
      state.pagination.page,
      state.pagination.pageSize,
      state.search,
      enabled
    ).then(function (data) {
      state.sources = data.sources || {};
      state.pagination = data.pagination || state.pagination;
      renderSources();
      renderPagination();
    }).catch(function (err) {
      alert('加载来源列表失败: ' + err.message);
    });
  }

  function renderSources() {
    var tbody = document.getElementById('sourcesTableBody');
    if (!tbody) return;

    var srcs = Object.values(state.sources);
    
    if (srcs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-neutral-400">暂无数据</td></tr>';
      return;
    }

    tbody.innerHTML = srcs.map(function (src) {
      var statusBadge = src.enabled
        ? '<span class="status-badge status-enabled">启用</span>'
        : '<span class="status-badge status-disabled">禁用</span>';

      return '<tr class="border-b border-neutral-200 hover:bg-neutral-50">' +
        '<td class="table-cell">' + src.id + '</td>' +
        '<td class="table-cell font-medium">' + escapeHtml(src.name) + '</td>' +
        '<td class="table-cell">' + escapeHtml(src.description || '-') + '</td>' +
        '<td class="table-cell">' + (src.evaluation_count || 0) + '</td>' +
        '<td class="table-cell">' + statusBadge + '</td>' +
        '<td class="table-cell">' +
          '<button onclick="SourcePage.editSource(' + src.id + ')" class="btn-text">编辑</button> ' +
          '<button onclick="SourcePage.deleteSource(' + src.id + ')" class="btn-text text-danger">删除</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function renderPagination() {
    var container = document.getElementById('sourcesPagination');
    if (!container) return;

    var p = state.pagination;
    if (p.totalPages <= 1) {
      container.innerHTML = '<div class="text-sm text-neutral-500">共 ' + p.total + ' 条记录</div>';
      return;
    }

    var html = '<div class="text-sm text-neutral-500">共 ' + p.total + ' 条记录</div>';
    html += '<div class="flex gap-2">';

    html += '<button onclick="SourcePage.goToPage(' + (p.page - 1) + ')" ' +
      (p.page <= 1 ? 'disabled' : '') + ' class="btn-page">上一页</button>';

    for (var i = 1; i <= p.totalPages; i++) {
      if (i === 1 || i === p.totalPages || (i >= p.page - 2 && i <= p.page + 2)) {
        html += '<button onclick="SourcePage.goToPage(' + i + ')" ' +
          (i === p.page ? 'class="btn-page active"' : 'class="btn-page"') + '>' + i + '</button>';
      } else if (i === p.page - 3 || i === p.page + 3) {
        html += '<span class="px-2">...</span>';
      }
    }

    html += '<button onclick="SourcePage.goToPage(' + (p.page + 1) + ')" ' +
      (p.page >= p.totalPages ? 'disabled' : '') + ' class="btn-page">下一页</button>';

    html += '</div>';
    container.innerHTML = html;
  }

  function goToPage(page) {
    if (page < 1 || page > state.pagination.totalPages) return;
    state.pagination.page = page;
    loadSources();
  }

  function openModal(src) {
    // 先关闭已存在的模态框
    closeModal();
    
    state.editingId = src ? src.id : null;

    var title = src ? '编辑来源' : '添加来源';
    var name = src ? src.name : '';
    var description = src ? (src.description || '') : '';
    var enabled = src ? src.enabled : 1;
    var sort_order = src ? (src.sort_order || 0) : 0;

    var modalHtml = '<div id="sourceModal" class="modal-overlay">' +
      '<div class="modal-content">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + title + '</h3>' +
          '<button onclick="SourcePage.closeModal()" class="modal-close">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="form-group">' +
            '<label class="form-label">来源名称 <span class="text-danger">*</span></label>' +
            '<input type="text" id="srcName" class="form-input" value="' + escapeHtml(name) + '" maxlength="50">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">描述</label>' +
            '<textarea id="srcDescription" class="form-input" rows="3">' + escapeHtml(description) + '</textarea>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">排序</label>' +
            '<input type="number" id="srcSortOrder" class="form-input" value="' + sort_order + '" min="0">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="flex items-center">' +
              '<input type="checkbox" id="srcEnabled" class="w-4 h-4 mr-2" ' + (enabled ? 'checked' : '') + '>' +
              '<span>启用</span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button onclick="SourcePage.closeModal()" class="btn-secondary">取消</button>' +
          '<button onclick="SourcePage.saveSource()" class="btn-primary">保存</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('srcName').focus();
  }

  function closeModal() {
    var modal = document.getElementById('sourceModal');
    if (modal) modal.remove();
    state.editingId = null;
  }

  function saveSource() {
    var name = document.getElementById('srcName').value.trim();
    var description = document.getElementById('srcDescription').value.trim();
    var sort_order = parseInt(document.getElementById('srcSortOrder').value) || 0;
    var enabled = document.getElementById('srcEnabled').checked ? 1 : 0;

    if (!name) {
      alert('请输入来源名称');
      return;
    }

    var data = {
      name: name,
      description: description,
      sort_order: sort_order,
      enabled: enabled,
    };

    var promise;
    if (state.editingId) {
      promise = SourceApi.updateSource(state.editingId, data);
    } else {
      promise = SourceApi.addSource(data);
    }

    promise.then(function () {
      closeModal();
      loadSources();
      alert(state.editingId ? '来源更新成功' : '来源添加成功');
    }).catch(function (err) {
      alert('保存失败: ' + err.message);
    });
  }

  function editSource(id) {
    SourceApi.getSource(id).then(function (src) {
      openModal(src);
    }).catch(function (err) {
      alert('获取来源信息失败: ' + err.message);
    });
  }

  function deleteSource(id) {
    var src = state.sources[id];
    if (!src) return;

    if (!confirm('确定要删除来源"' + src.name + '"吗？\n注意：来源下有评价记录时无法删除。')) {
      return;
    }

    SourceApi.deleteSource(id).then(function () {
      loadSources();
      alert('来源删除成功');
    }).catch(function (err) {
      alert('删除失败: ' + err.message);
    });
  }

  function debounce(func, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return {
    init: init,
    goToPage: goToPage,
    openModal: openModal,
    closeModal: closeModal,
    saveSource: saveSource,
    editSource: editSource,
    deleteSource: deleteSource,
  };
})();