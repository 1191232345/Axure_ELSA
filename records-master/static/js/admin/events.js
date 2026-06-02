window.AdminEvents = (function () {
  function init() {
    initPageNavigation();
    initModalEvents();
    initEmployeeEvents();
    initRatingItemEvents();
    initEvaluationEvents();
    initSearchEvents();
    initNotificationClose();
  }

  function initPageNavigation() {
    var sidebarItems = document.querySelectorAll('.sidebar-item');
    var pageContents = document.querySelectorAll('.page-content');

    sidebarItems.forEach(function (item) {
      item.addEventListener('click', function () {
        sidebarItems.forEach(function (i) { i.classList.remove('active'); });
        this.classList.add('active');

        var target = this.getAttribute('data-target');
        pageContents.forEach(function (page) { page.classList.add('hidden'); });
        document.getElementById(target + '-page').classList.remove('hidden');

        loadDataAndRefresh();
      });
    });

    var toggleSidebar = document.getElementById('toggleSidebar');
    if (toggleSidebar) {
      toggleSidebar.addEventListener('click', function () {
        var sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('hidden');
      });
    }
  }

  function initModalEvents() {
    document.querySelectorAll('.close-modal').forEach(function (btn) {
      btn.addEventListener('click', function () {
        AdminUI.hideAllModals();
      });
    });
  }

  function initEmployeeEvents() {
    var addBtn = document.getElementById('addEmployeeBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        document.getElementById('employeeModalTitle').textContent = '添加员工';
        document.getElementById('employeeId').value = '';
        document.getElementById('employeeForm').reset();
        AdminUI.hideErrors(document.getElementById('employeeForm'));
        AdminUI.showModal('employeeModal');
      });
    }

    var form = document.getElementById('employeeForm');
    if (form) {
      form.addEventListener('submit', handleEmployeeFormSubmit);
    }

    var batchDeleteBtn = document.getElementById('batchDeleteEmployeesBtn');
    if (batchDeleteBtn) {
      batchDeleteBtn.addEventListener('click', handleBatchDeleteEmployees);
    }

    var selectAll = document.getElementById('selectAllEmployees');
    if (selectAll) {
      selectAll.addEventListener('change', function () {
        var checkboxes = document.querySelectorAll('.employee-checkbox');
        checkboxes.forEach(function (cb) { cb.checked = this.checked; });
        AdminRenderer.updateBatchDeleteEmployeesButtonVisibility();
      });
    }

    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('edit-employee') || e.target.parentElement.classList.contains('edit-employee')) {
        var btn = e.target.classList.contains('edit-employee') ? e.target : e.target.parentElement;
        var id = btn.getAttribute('data-id');
        editEmployee(id);
      }
      if (e.target.classList.contains('delete-employee') || e.target.parentElement.classList.contains('delete-employee')) {
        var btn = e.target.classList.contains('delete-employee') ? e.target : e.target.parentElement;
        var id = btn.getAttribute('data-id');
        deleteEmployee(id);
      }
    });
  }

  function handleEmployeeFormSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var id = document.getElementById('employeeId').value;
    var name = document.getElementById('employeeName').value.trim();
    var departmentSelect = document.getElementById('employeeDepartment');
    var department = departmentSelect.value;
    var departmentId = null;
    
    if (department) {
      var selectedOption = departmentSelect.querySelector('option[value="' + department + '"]');
      if (selectedOption && selectedOption.getAttribute('data-id')) {
        departmentId = parseInt(selectedOption.getAttribute('data-id'));
      }
    }
    
    var checkedBoxes = document.querySelectorAll('#ratingItemsGroup input:checked');
    var ratingItems = [];
    checkedBoxes.forEach(function (cb) { ratingItems.push(parseInt(cb.value)); });

    AdminUI.hideErrors(form);

    var hasError = false;
    if (!name) {
      AdminUI.showFieldError(document.getElementById('employeeName'), '请输入姓名');
      hasError = true;
    }
    if (!department) {
      AdminUI.showFieldError(document.getElementById('employeeDepartment'), '请选择部门');
      hasError = true;
    }
    if (ratingItems.length === 0) {
      document.getElementById('ratingItemsError').classList.remove('hidden');
      hasError = true;
    }

    if (hasError) return;

    var data = { name: name, department: department, rating_items: ratingItems };
    if (departmentId) {
      data.department_id = departmentId;
    }

    var promise;
    if (id) {
      promise = AdminApi.updateEmployee(id, data);
    } else {
      promise = AdminApi.addEmployee(data);
    }

    promise.then(function (res) {
      if (res.success) {
        AdminUI.hideModal('employeeModal');
        AdminUI.showNotification('操作成功', id ? '员工信息已更新' : '员工已添加', 'success');
        loadDataAndRefresh();
      } else {
        AdminUI.showNotification('操作失败', res.error || '未知错误', 'error');
      }
    }).catch(function (err) {
      AdminUI.showNotification('操作失败', err.message, 'error');
    });
  }

  function editEmployee(id) {
    var emp = AdminState.getEmployee(id);
    if (!emp) return;

    document.getElementById('employeeModalTitle').textContent = '编辑员工';
    document.getElementById('employeeId').value = id;
    document.getElementById('employeeName').value = emp.name;
    document.getElementById('employeeDepartment').value = emp.department;

    var relations = AdminState.getRelations()[id] || [];
    var checkboxes = document.querySelectorAll('#ratingItemsGroup input');
    checkboxes.forEach(function (cb) {
      cb.checked = relations.includes(parseInt(cb.value));
    });

    AdminUI.hideErrors(document.getElementById('employeeForm'));
    AdminUI.showModal('employeeModal');
  }

  function deleteEmployee(id) {
    if (!AdminUI.confirm('确定要删除该员工吗？相关评价数据将保留。')) return;

    AdminApi.deleteEmployee(id).then(function (res) {
      if (res.success) {
        AdminUI.showNotification('删除成功', '员工已删除', 'success');
        loadDataAndRefresh();
      } else {
        AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
      }
    }).catch(function (err) {
      AdminUI.showNotification('删除失败', err.message, 'error');
    });
  }

  function handleBatchDeleteEmployees() {
    var checkboxes = document.querySelectorAll('.employee-checkbox:checked');
    var ids = [];
    checkboxes.forEach(function (cb) { ids.push(cb.getAttribute('data-id')); });

    if (ids.length === 0) {
      AdminUI.showNotification('操作失败', '请至少选择一个员工', 'error');
      return;
    }

    if (!AdminUI.confirm('确定要删除选中的 ' + ids.length + ' 个员工吗？')) return;

    AdminApi.batchDeleteEmployees({ ids: ids }).then(function (res) {
      if (res.success) {
        AdminUI.showNotification('删除成功', '已删除 ' + res.deleted_count + ' 个员工', 'success');
        loadDataAndRefresh();
      } else {
        AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
      }
    }).catch(function (err) {
      AdminUI.showNotification('删除失败', err.message, 'error');
    });
  }

  function initRatingItemEvents() {
    var addBtn = document.getElementById('addRatingItemBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        document.getElementById('ratingItemModalTitle').textContent = '添加评分项';
        document.getElementById('ratingItemId').value = '';
        document.getElementById('ratingItemForm').reset();
        document.getElementById('ratingItemEnabled').checked = true;
        AdminUI.hideErrors(document.getElementById('ratingItemForm'));
        AdminUI.showModal('ratingItemModal');
      });
    }

    var form = document.getElementById('ratingItemForm');
    if (form) {
      form.addEventListener('submit', handleRatingItemFormSubmit);
    }

    var batchDeleteBtn = document.getElementById('batchDeleteRatingItemsBtn');
    if (batchDeleteBtn) {
      batchDeleteBtn.addEventListener('click', handleBatchDeleteRatingItems);
    }

    var selectAll = document.getElementById('selectAllRatingItems');
    if (selectAll) {
      selectAll.addEventListener('change', function () {
        var checkboxes = document.querySelectorAll('.rating-item-checkbox');
        checkboxes.forEach(function (cb) { cb.checked = this.checked; });
        AdminRenderer.updateBatchDeleteButtonVisibility();
      });
    }

    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('edit-rating-item') || e.target.parentElement.classList.contains('edit-rating-item')) {
        var btn = e.target.classList.contains('edit-rating-item') ? e.target : e.target.parentElement;
        var id = btn.getAttribute('data-id');
        editRatingItem(id);
      }
      if (e.target.classList.contains('delete-rating-item') || e.target.parentElement.classList.contains('delete-rating-item')) {
        var btn = e.target.classList.contains('delete-rating-item') ? e.target : e.target.parentElement;
        var id = btn.getAttribute('data-id');
        deleteRatingItem(id);
      }
    });
  }

  function handleRatingItemFormSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var id = document.getElementById('ratingItemId').value;
    var name = document.getElementById('ratingItemName').value.trim();
    var description = document.getElementById('ratingItemDescription').value.trim();
    var enabled = document.getElementById('ratingItemEnabled').checked;

    AdminUI.hideErrors(form);

    if (!name) {
      AdminUI.showFieldError(document.getElementById('ratingItemName'), '请输入评分项名称');
      return;
    }

    var data = { name: name, description: description, enabled: enabled };

    var promise;
    if (id) {
      promise = AdminApi.updateRatingItem(id, data);
    } else {
      promise = AdminApi.addRatingItem(data);
    }

    promise.then(function (res) {
      if (res.success) {
        AdminUI.hideModal('ratingItemModal');
        AdminUI.showNotification('操作成功', id ? '评分项已更新' : '评分项已添加', 'success');
        loadDataAndRefresh();
      } else {
        AdminUI.showNotification('操作失败', res.error || '未知错误', 'error');
      }
    }).catch(function (err) {
      AdminUI.showNotification('操作失败', err.message, 'error');
    });
  }

  function editRatingItem(id) {
    var item = AdminState.getRatingItem(id);
    if (!item) return;

    document.getElementById('ratingItemModalTitle').textContent = '编辑评分项';
    document.getElementById('ratingItemId').value = id;
    document.getElementById('ratingItemName').value = item.name;
    document.getElementById('ratingItemDescription').value = item.description || '';
    document.getElementById('ratingItemEnabled').checked = item.enabled;

    AdminUI.hideErrors(document.getElementById('ratingItemForm'));
    AdminUI.showModal('ratingItemModal');
  }

  function deleteRatingItem(id) {
    var relatedCount = AdminState.getRelationsForRatingItem(parseInt(id));
    var message = relatedCount > 0
      ? '该评分项关联了 ' + relatedCount + ' 名员工，删除后相关评价数据将受影响，确定要继续吗？'
      : '确定要删除该评分项吗？';

    if (!AdminUI.confirm(message)) return;

    AdminApi.deleteRatingItem(id).then(function (res) {
      if (res.success) {
        AdminUI.showNotification('删除成功', '评分项已删除', 'success');
        loadDataAndRefresh();
      } else {
        AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
      }
    }).catch(function (err) {
      AdminUI.showNotification('删除失败', err.message, 'error');
    });
  }

  function handleBatchDeleteRatingItems() {
    var checkboxes = document.querySelectorAll('.rating-item-checkbox:checked');
    var ids = [];
    checkboxes.forEach(function (cb) { ids.push(parseInt(cb.getAttribute('data-id'))); });

    if (ids.length === 0) {
      AdminUI.showNotification('操作失败', '请至少选择一个评分项', 'error');
      return;
    }

    var totalRelated = 0;
    ids.forEach(function (id) {
      totalRelated += AdminState.getRelationsForRatingItem(id);
    });

    var message = totalRelated > 0
      ? '选中的 ' + ids.length + ' 个评分项共关联了 ' + totalRelated + ' 名员工，确定要继续吗？'
      : '确定要删除选中的 ' + ids.length + ' 个评分项吗？';

    if (!AdminUI.confirm(message)) return;

    AdminApi.batchDeleteRatingItems(ids).then(function (res) {
      if (res.success) {
        AdminUI.showNotification('删除成功', '已删除 ' + res.deleted_count + ' 个评分项', 'success');
        loadDataAndRefresh();
      } else {
        AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
      }
    }).catch(function (err) {
      AdminUI.showNotification('删除失败', err.message, 'error');
    });
  }

  function initEvaluationEvents() {
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('view-evaluation') || e.target.parentElement.classList.contains('view-evaluation')) {
        var btn = e.target.classList.contains('view-evaluation') ? e.target : e.target.parentElement;
        var id = btn.getAttribute('data-id');
        viewEvaluationDetail(id);
      }
    });

    var deleteDetailBtn = document.getElementById('deleteEvaluationDetailBtn');
    if (deleteDetailBtn) {
      deleteDetailBtn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        deleteEvaluationResult(id);
      });
    }

    var exportBtn = document.getElementById('exportEvaluationBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportEvaluationData);
    }

    var exportStatsBtn = document.getElementById('exportEvaluationStatsBtn');
    if (exportStatsBtn) {
      exportStatsBtn.addEventListener('click', exportEvaluationStats);
    }
  }

  function viewEvaluationDetail(id) {
    var results = AdminState.getEvaluationResults();
    var result = results[id];
    if (!result) return;

    AdminRenderer.renderEvaluationDetail(result);
    AdminUI.showModal('evaluationDetailModal');

    var deleteBtn = document.getElementById('deleteEvaluationDetailBtn');
    if (deleteBtn) {
      deleteBtn.setAttribute('data-id', id);
    }
  }

  function deleteEvaluationResult(id) {
    if (!AdminUI.confirm('确定要删除该评价记录吗？此操作不可撤销。')) return;

    AdminApi.deleteEvaluationResult(id).then(function (res) {
      if (res.success) {
        AdminUI.hideModal('evaluationDetailModal');
        AdminUI.showNotification('删除成功', '评价记录已删除', 'success');
        loadDataAndRefresh();
      } else {
        AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
      }
    }).catch(function (err) {
      AdminUI.showNotification('删除失败', err.message, 'error');
    });
  }

  function exportEvaluationData() {
    var results = AdminState.getEvaluationResults();
    var data = [];
    Object.keys(results).forEach(function (id) {
      var r = results[id];
      data.push({
        id: id,
        employee_name: r.employee_name,
        employee_department: r.employee_department,
        evaluator_name: r.evaluator_name,
        average_score: AdminRenderer.calculateAverageScore(r.rating_details).toFixed(2),
        created_at: r.created_at,
        rating_details: r.rating_details,
      });
    });

    downloadJSON(data, 'evaluation_results.json');
    AdminUI.showNotification('导出成功', '评价数据已导出', 'success');
  }

  function exportEvaluationStats() {
    var results = AdminState.getEvaluationResults();
    var stats = {
      total_count: Object.keys(results).length,
      average_score: 0,
      department_stats: {},
    };

    var totalScore = 0;
    Object.keys(results).forEach(function (id) {
      var r = results[id];
      var score = AdminRenderer.calculateAverageScore(r.rating_details);
      totalScore += score;

      if (!stats.department_stats[r.employee_department]) {
        stats.department_stats[r.employee_department] = { count: 0, total_score: 0 };
      }
      stats.department_stats[r.employee_department].count++;
      stats.department_stats[r.employee_department].total_score += score;
    });

    stats.average_score = stats.total_count > 0 ? (totalScore / stats.total_count).toFixed(2) : 0;

    Object.keys(stats.department_stats).forEach(function (dept) {
      var ds = stats.department_stats[dept];
      ds.average_score = ds.count > 0 ? (ds.total_score / ds.count).toFixed(2) : 0;
    });

    downloadJSON(stats, 'evaluation_stats.json');
    AdminUI.showNotification('导出成功', '统计数据已导出', 'success');
  }

  function downloadJSON(data, filename) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function initSearchEvents() {
    var employeeSearch = document.getElementById('employeeSearch');
    if (employeeSearch) {
      employeeSearch.addEventListener('input', function () {
        filterEmployees(this.value, document.getElementById('employeeDepartmentFilter').value);
      });
    }

    var employeeDeptFilter = document.getElementById('employeeDepartmentFilter');
    if (employeeDeptFilter) {
      employeeDeptFilter.addEventListener('change', function () {
        filterEmployees(document.getElementById('employeeSearch').value, this.value);
      });
    }
  }

  function filterEmployees(searchText, department) {
    var employees = AdminState.getEmployees();
    var filtered = {};

    Object.keys(employees).forEach(function (id) {
      var emp = employees[id];
      var matchSearch = !searchText || emp.name.toLowerCase().includes(searchText.toLowerCase());
      var matchDept = !department || emp.department === department;
      if (matchSearch && matchDept) {
        filtered[id] = emp;
      }
    });

    AdminState.setFilteredData('employees', filtered);
    AdminState.setPaginationPage('employees', 1);
    AdminRenderer.renderEmployeesTable();
  }

  function initNotificationClose() {
    var closeBtn = document.getElementById('closeNotification');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        AdminUI.hideNotification();
      });
    }
  }

  function loadDataAndRefresh() {
    var activeItem = document.querySelector('.sidebar-item.active');
    var target = activeItem ? activeItem.getAttribute('data-target') : 'employees';
    
    if (target === 'departments') {
      if (typeof DepartmentPage !== 'undefined' && DepartmentPage.init) {
        DepartmentPage.init();
      }
      return;
    }
    
    if (target === 'sources') {
      if (typeof SourcePage !== 'undefined' && SourcePage.init) {
        SourcePage.init();
      }
      return;
    }
    
    AdminApi.loadAllData().then(function (data) {
      AdminState.setAll(data);
      AdminRenderer.renderEmployeesTable();
      AdminRenderer.renderRatingItemsTable();
      AdminRenderer.renderEvaluationResultsTable();
      AdminRenderer.populateRatingItemsCheckboxes();
    }).catch(function (err) {
      AdminUI.showNotification('加载失败', '无法加载系统数据', 'error');
    });

    AdminApi.loadDepartments().then(function (depts) {
      AdminState.setDepartments(depts);
      AdminRenderer.populateDepartmentSelects(depts);
    });
  }

  return {
    init: init,
    loadDataAndRefresh: loadDataAndRefresh,
  };
})();