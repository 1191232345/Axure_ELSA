window.DepartmentPage = (function () {
  var state = {
    departments: {},
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
    loadDepartments();
  }

  function bindEvents() {
    var searchInput = document.getElementById('departmentSearch');
    var statusFilter = document.getElementById('departmentStatusFilter');
    var addBtn = document.getElementById('addDepartmentBtn');
    var batchImportBtn = document.getElementById('batchImportDepartmentsBtn');
    var batchDeleteBtn = document.getElementById('batchDeleteDepartmentsBtn');

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

    if (batchImportBtn) {
      batchImportBtn.addEventListener('click', function () {
        openBatchImportModal();
      });
    }

    if (batchDeleteBtn) {
      batchDeleteBtn.addEventListener('click', function () {
        if (window.DeleteHandler) {
          window.DeleteHandler.handleBatchDeleteDepartments();
        }
      });
    }

    // 全选 checkbox
    var selectAll = document.getElementById('selectAllDepartments');
    if (selectAll) {
      selectAll.addEventListener('change', function () {
        var isChecked = this.checked;
        var checkboxes = document.querySelectorAll('.department-checkbox');
        checkboxes.forEach(function (cb) { cb.checked = isChecked; });
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
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-neutral-400">暂无数据</td></tr>';
      return;
    }

    tbody.innerHTML = depts.map(function (dept) {
      var statusBadge = dept.enabled
        ? '<span class="status-badge status-enabled">启用</span>'
        : '<span class="status-badge status-disabled">禁用</span>';

      return '<tr class="border-b border-neutral-200 hover:bg-neutral-50">' +
        '<td class="table-cell">' +
          '<input type="checkbox" class="department-checkbox w-4 h-4 text-primary border-neutral-300 rounded" data-id="' + dept.id + '">' +
        '</td>' +
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
    // 先关闭已存在的模态框
    closeModal();
    
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

    if (!confirm('确定要删除部门“' + dept.name + '”吗？\n部门下的员工将自动解除关联。')) {
      return;
    }

    DepartmentApi.deleteDepartment(id).then(function () {
      loadDepartments();
      alert('部门删除成功');
    }).catch(function (err) {
      alert('删除失败: ' + err.message);
    });
  }

  function openBatchImportModal() {
    // 先关闭已存在的模态框
    closeBatchImportModal();

    var modalHtml = '<div id="batchImportModal" class="modal-overlay">' +
      '<div class="modal-content" style="max-width: 900px;">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">批量导入部门</h3>' +
          '<button onclick="DepartmentPage.closeBatchImportModal()" class="modal-close">&times;</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="mb-4">' +
            '<div class="flex justify-between items-center mb-3">' +
              '<div class="text-sm text-neutral-500">' +
                '<i class="fa fa-info-circle text-primary mr-1"></i>' +
                '提示：可直接在表格中输入，或从Excel粘贴数据到表格' +
              '</div>' +
              '<div class="flex gap-2">' +
                '<button onclick="DepartmentPage.addBatchImportRow()" class="btn-text text-sm">' +
                  '<i class="fa fa-plus mr-1"></i>添加行' +
                '</button>' +
                '<button onclick="DepartmentPage.removeSelectedRows()" class="btn-text text-sm text-danger">' +
                  '<i class="fa fa-trash mr-1"></i>删除选中' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="table-container border border-neutral-200 rounded" style="max-height: 400px; overflow-y: auto;">' +
            '<table class="w-full" id="batchImportTable">' +
              '<thead class="bg-neutral-50 sticky top-0">' +
                '<tr>' +
                  '<th class="table-cell" style="width: 40px;">' +
                    '<input type="checkbox" id="selectAllRows" onchange="DepartmentPage.toggleSelectAllRows()" class="w-4 h-4">' +
                  '</th>' +
                  '<th class="table-cell" style="width: 60px;">序号</th>' +
                  '<th class="table-cell">部门名称 <span class="text-danger">*</span></th>' +
                  '<th class="table-cell">描述</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="batchImportTableBody">' +
                '<tr class="border-b border-neutral-200">' +
                  '<td class="table-cell text-center">' +
                    '<input type="checkbox" class="row-checkbox w-4 h-4">' +
                  '</td>' +
                  '<td class="table-cell text-center text-neutral-500">1</td>' +
                  '<td class="table-cell">' +
                    '<input type="text" class="form-input w-full border-0 focus:ring-2 focus:ring-primary/50" placeholder="请输入部门名称" maxlength="50">' +
                  '</td>' +
                  '<td class="table-cell">' +
                    '<input type="text" class="form-input w-full border-0 focus:ring-2 focus:ring-primary/50" placeholder="请输入描述（可选）" maxlength="200">' +
                  '</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          '<div class="mt-3 text-xs text-neutral-400">' +
            '<i class="fa fa-lightbulb-o mr-1"></i>' +
            '快捷操作：选中表格后可直接从Excel粘贴数据，系统会自动识别并填充' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button onclick="DepartmentPage.closeBatchImportModal()" class="btn-secondary">取消</button>' +
          '<button onclick="DepartmentPage.executeBatchImport()" class="btn-primary">导入</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 绑定粘贴事件
    var table = document.getElementById('batchImportTable');
    table.addEventListener('paste', handleTablePaste);

    // 添加初始行
    for (var i = 0; i < 4; i++) {
      addBatchImportRow();
    }
  }

  function closeBatchImportModal() {
    var modal = document.getElementById('batchImportModal');
    if (modal) modal.remove();
  }

  function addBatchImportRow(data) {
    var tbody = document.getElementById('batchImportTableBody');
    if (!tbody) return;

    var rowCount = tbody.children.length + 1;
    var name = data && data.name ? data.name : '';
    var description = data && data.description ? data.description : '';

    var rowHtml = '<tr class="border-b border-neutral-200 hover:bg-neutral-50">' +
      '<td class="table-cell text-center">' +
        '<input type="checkbox" class="row-checkbox w-4 h-4">' +
      '</td>' +
      '<td class="table-cell text-center text-neutral-500">' + rowCount + '</td>' +
      '<td class="table-cell">' +
        '<input type="text" class="form-input w-full border-0 focus:ring-2 focus:ring-primary/50" placeholder="请输入部门名称" maxlength="50" value="' + escapeHtml(name) + '">' +
      '</td>' +
      '<td class="table-cell">' +
        '<input type="text" class="form-input w-full border-0 focus:ring-2 focus:ring-primary/50" placeholder="请输入描述（可选）" maxlength="200" value="' + escapeHtml(description) + '">' +
      '</td>' +
    '</tr>';

    tbody.insertAdjacentHTML('beforeend', rowHtml);
  }

  function removeSelectedRows() {
    var checkboxes = document.querySelectorAll('#batchImportTableBody .row-checkbox:checked');
    if (checkboxes.length === 0) {
      alert('请先选择要删除的行');
      return;
    }

    checkboxes.forEach(function(checkbox) {
      checkbox.closest('tr').remove();
    });

    // 重新编号
    updateRowNumbers();
  }

  function toggleSelectAllRows() {
    var selectAll = document.getElementById('selectAllRows');
    var checkboxes = document.querySelectorAll('#batchImportTableBody .row-checkbox');
    checkboxes.forEach(function(checkbox) {
      checkbox.checked = selectAll.checked;
    });
  }

  function updateRowNumbers() {
    var rows = document.querySelectorAll('#batchImportTableBody tr');
    rows.forEach(function(row, index) {
      var numberCell = row.querySelector('td:nth-child(2)');
      if (numberCell) {
        numberCell.textContent = index + 1;
      }
    });
  }

  function handleTablePaste(e) {
    e.preventDefault();

    try {
      var pastedText = (e.clipboardData || window.clipboardData).getData('text');
      console.log('粘贴的数据:', pastedText); // 调试日志

      if (!pastedText) {
        console.log('没有粘贴数据');
        return;
      }

      var lines = pastedText.split('\n');
      console.log('分割后的行数:', lines.length); // 调试日志

      var startRow = 0;

      // 获取当前焦点的行
      var focusedInput = document.activeElement;
      if (focusedInput && focusedInput.tagName === 'INPUT') {
        var currentRow = focusedInput.closest('tr');
        if (currentRow) {
          var tbody = document.getElementById('batchImportTableBody');
          startRow = Array.from(tbody.children).indexOf(currentRow);
        }
      }

      // 清空现有行（如果从第一行开始粘贴）
      if (startRow === 0) {
        var tbody = document.getElementById('batchImportTableBody');
        tbody.innerHTML = '';
      }

      // 解析并填充数据
      lines.forEach(function(line, index) {
        line = line.trim();
        if (!line) return;

        // 跳过表头
        if (index === 0 && (line.indexOf('部门') >= 0 || line.indexOf('名称') >= 0 || line.toLowerCase().indexOf('name') >= 0)) {
          console.log('跳过表头:', line);
          return;
        }

        var parts;
        if (line.indexOf('\t') >= 0) {
          parts = line.split('\t');
        } else if (line.indexOf(',') >= 0) {
          parts = line.split(',');
        } else {
          parts = [line];
        }

        parts = parts.map(function(p) { return p.trim(); }).filter(function(p) { return p; });

        console.log('第' + (index + 1) + '行数据:', parts); // 调试日志

        if (parts.length > 0) {
          addBatchImportRow({
            name: parts[0],
            description: parts[1] || ''
          });
        }
      });

      // 如果没有添加任何行，至少保留一行
      var tbody = document.getElementById('batchImportTableBody');
      if (tbody.children.length === 0) {
        addBatchImportRow();
      }

      console.log('粘贴完成，共添加 ' + (tbody.children.length) + ' 行'); // 调试日志

    } catch (error) {
      console.error('粘贴处理出错:', error);
      alert('粘贴数据时出错: ' + error.message);
    }
  }

  function executeBatchImport() {
    var tbody = document.getElementById('batchImportTableBody');
    if (!tbody) return;

    var rows = tbody.querySelectorAll('tr');
    var departments = [];
    var hasData = false;

    rows.forEach(function(row, index) {
      var inputs = row.querySelectorAll('input[type="text"]');
      if (inputs.length >= 2) {
        var name = inputs[0].value.trim();
        var description = inputs[1].value.trim();

        if (name) {
          departments.push({
            name: name,
            description: description
          });
          hasData = true;
        }
      }
    });

    if (!hasData) {
      alert('请至少输入一个部门名称');
      return;
    }

    if (!confirm('确定要导入 ' + departments.length + ' 个部门吗？')) {
      return;
    }

    // 将数据转换为文本格式发送给后端
    var textData = departments.map(function(dept) {
      return dept.name + '\t' + dept.description;
    }).join('\n');

    DepartmentApi.batchImportDepartments(textData).then(function (res) {
      if (res.success) {
        var msg = res.message;
        if (res.data && res.data.failed_count > 0) {
          msg += '\n\n失败详情：\n';
          res.data.failed_list.forEach(function(item) {
            msg += '第' + item.row + '行: ' + item.name + ' - ' + item.error + '\n';
          });
        }
        alert(msg);
        closeBatchImportModal();
        loadDepartments();
      } else {
        var errorMsg = res.error || '导入失败';
        if (res.data && res.data.failed_list) {
          errorMsg += '\n\n失败详情：\n';
          res.data.failed_list.forEach(function(item) {
            errorMsg += '第' + item.row + '行: ' + item.name + ' - ' + item.error + '\n';
          });
        }
        alert(errorMsg);
      }
    }).catch(function (err) {
      alert('导入失败: ' + err.message);
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
    openBatchImportModal: openBatchImportModal,
    closeBatchImportModal: closeBatchImportModal,
    addBatchImportRow: addBatchImportRow,
    removeSelectedRows: removeSelectedRows,
    toggleSelectAllRows: toggleSelectAllRows,
    executeBatchImport: executeBatchImport,
  };
})();