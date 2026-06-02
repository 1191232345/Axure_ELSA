window.DepartmentPage = (function () {
  var state = {
    departments: {},
    pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    search: '',
    enabled: '',
    editingId: null,
  };

  function init() {
    bindEvents();
    loadDepartments();
  }

  function bindEvents() {
    var searchInput = document.getElementById('departmentSearch');
    var statusFilter = document.getElementById('departmentStatusFilter');
    var addBtn = document.getElementById('addDepartmentBtn');

    if (searchInput) {
      searchInput.addEventListener('input', debounce(function (e) {
        state.search = e.target.value.trim();
        state.pagination.page = 1;
        loadDepartments();
      }, 300));
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', function (e) {
        state.enabled = e.target.value;
        state.pagination.page = 1;
        loadDepartments();
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        openModal();
      });
    }
  }

  function loadDepartments() {
    var enabled = state.enabled !== '' ? parseInt(state.enabled) : null;
    
    DepartmentApi.loadDepartments(
      state.pagination.page,
      state.pagination.pageSize,
      state.search,
      enabled
    ).then(function (data) {
      state.departments = data.departments || {};
      state.pagination = data.pagination || state.pagination;
      renderDepartments();
      renderPagination();
    }).catch(function (err) {
      alert('加载部门列表失败: ' + err.message);
    });
  }

  function renderDepartments() {
    var tbody = document.getElementById('departmentsTableBody');
    if (!tbody) return;

    var depts = Object.values(state.departments);
    
    if (depts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-neutral-400">暂无数据</td></tr>';
      return;
    }

    tbody.innerHTML = depts.map(function (dept) {
      var statusBadge = dept.enabled
        ? '<span class="status-badge status-enabled">启用</span>'
        : '<span class="status-badge status-disabled">禁用</span>';

      return '<tr class="border-b border-neutral-200 hover:bg-neutral-50">' +
        '<td class="table-cell">' + dept.id + '</td>' +
        '<td class="table-cell font-medium">' + escapeHtml(dept.name) + '</td>' +
        '<td class="table-cell">' + escapeHtml(dept.description || '-') + '</td>' +
        '<td class="table-cell">' + (dept.employee_count || 0) + '</td>' +
        '<td class="table-cell">' + statusBadge + '</td>' +
        '<td class="table-cell">' +
          '<button onclick="DepartmentPage.editDepartment(' + dept.id + ')" class="btn-text">编辑</button> ' +
          '<button onclick="DepartmentPage.deleteDepartment(' + dept.id + ')" class="btn-text text-danger">删除</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function renderPagination() {
    var container = document.getElementById('departmentsPagination');
    if (!container) return;

    var p = state.pagination;
    if (p.totalPages <= 1) {
      container.innerHTML = '<div class="text-sm text-neutral-500">共 ' + p.total + ' 条记录</div>';
      return;
    }

    var html = '<div class="text-sm text-neutral-500">共 ' + p.total + ' 条记录</div>';
    html += '<div class="flex gap-2">';

    html += '<button onclick="DepartmentPage.goToPage(' + (p.page - 1) + ')" ' +
      (p.page <= 1 ? 'disabled' : '') + ' class="btn-page">上一页</button>';

    for (var i = 1; i <= p.totalPages; i++) {
      if (i === 1 || i === p.totalPages || (i >= p.page - 2 && i <= p.page + 2)) {
        html += '<button onclick="DepartmentPage.goToPage(' + i + ')" ' +
          (i === p.page ? 'class="btn-page active"' : 'class="btn-page"') + '>' + i + '</button>';
      } else if (i === p.page - 3 || i === p.page + 3) {
        html += '<span class="px-2">...</span>';
      }
    }

    html += '<button onclick="DepartmentPage.goToPage(' + (p.page + 1) + ')" ' +
      (p.page >= p.totalPages ? 'disabled' : '') + ' class="btn-page">下一页</button>';

    html += '</div>';
    container.innerHTML = html;
  }

  function goToPage(page) {
    if (page < 1 || page > state.pagination.totalPages) return;
    state.pagination.page = page;
    loadDepartments();
  }

  function openModal(dept) {
    state.editingId = dept ? dept.id : null;

    var title = dept ? '编辑部门' : '添加部门';
    var name = dept ? dept.name : '';
    var description = dept ? (dept.description || '') : '';
    var enabled = dept ? dept.enabled : 1;
    var sort_order = dept ? (dept.sort_order || 0) : 0;

    var modalHtml = '<div id="departmentModal" class="modal-overlay">' +
      '<div class="modal-content">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">' + title + '</h3>' +
          '<button onclick="DepartmentPage.closeModal()" class="modal-close">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="form-group">' +
            '<label class="form-label">部门名称 <span class="text-danger">*</span></label>' +
            '<input type="text" id="deptName" class="form-input" value="' + escapeHtml(name) + '" maxlength="50">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">描述</label>' +
            '<textarea id="deptDescription" class="form-input" rows="3">' + escapeHtml(description) + '</textarea>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">排序</label>' +
            '<input type="number" id="deptSortOrder" class="form-input" value="' + sort_order + '" min="0">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="flex items-center">' +
              '<input type="checkbox" id="deptEnabled" class="w-4 h-4 mr-2" ' + (enabled ? 'checked' : '') + '>' +
              '<span>启用</span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button onclick="DepartmentPage.closeModal()" class="btn-secondary">取消</button>' +
          '<button onclick="DepartmentPage.saveDepartment()" class="btn-primary">保存</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('deptName').focus();
  }

  function closeModal() {
    var modal = document.getElementById('departmentModal');
    if (modal) modal.remove();
    state.editingId = null;
  }

  function saveDepartment() {
    var name = document.getElementById('deptName').value.trim();
    var description = document.getElementById('deptDescription').value.trim();
    var sort_order = parseInt(document.getElementById('deptSortOrder').value) || 0;
    var enabled = document.getElementById('deptEnabled').checked ? 1 : 0;

    if (!name) {
      alert('请输入部门名称');
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
      promise = DepartmentApi.updateDepartment(state.editingId, data);
    } else {
      promise = DepartmentApi.addDepartment(data);
    }

    promise.then(function () {
      closeModal();
      loadDepartments();
      alert(state.editingId ? '部门更新成功' : '部门添加成功');
    }).catch(function (err) {
      alert('保存失败: ' + err.message);
    });
  }

  function editDepartment(id) {
    DepartmentApi.getDepartment(id).then(function (dept) {
      openModal(dept);
    }).catch(function (err) {
      alert('获取部门信息失败: ' + err.message);
    });
  }

  function deleteDepartment(id) {
    var dept = state.departments[id];
    if (!dept) return;

    if (!confirm('确定要删除部门"' + dept.name + '"吗？\n注意：部门下有员工时无法删除。')) {
      return;
    }

    DepartmentApi.deleteDepartment(id).then(function () {
      loadDepartments();
      alert('部门删除成功');
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
    saveDepartment: saveDepartment,
    editDepartment: editDepartment,
    deleteDepartment: deleteDepartment,
  };
})();