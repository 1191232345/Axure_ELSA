window.AdminEvents = (function () {
  function init() {
    initPageNavigation();
    initModalEvents();
    initEmployeeEvents();
    initRatingItemEvents();
    initEvaluationEvents();
    initSearchEvents();
    initNotificationClose();
    
    // 初始化公告弹窗
    if (typeof window.AnnouncementPopup !== 'undefined') {
      window.AnnouncementPopup.init();
      console.log('[系统] 公告弹窗已初始化');
    }
  }

  function initPageNavigation() {
    var navItems = document.querySelectorAll('.nav-item');
    var pageContents = document.querySelectorAll('.page-content');

    navItems.forEach(function (item) {
      item.addEventListener('click', function () {
        navItems.forEach(function (i) { i.classList.remove('active'); });
        this.classList.add('active');

        var target = this.getAttribute('data-target');
        pageContents.forEach(function (page) { page.classList.add('hidden'); });
        document.getElementById(target + '-page').classList.remove('hidden');

        loadDataAndRefresh();
      });
    });
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

    var batchImportBtn = document.getElementById('batchImportEmployeesBtn');
    if (batchImportBtn) {
      batchImportBtn.addEventListener('click', function () {
        initBatchImportModal('employees');
      });
    }

    var selectAll = document.getElementById('selectAllEmployees');
    if (selectAll) {
      selectAll.addEventListener('change', function () {
        var isChecked = this.checked;
        var checkboxes = document.querySelectorAll('.employee-checkbox');
        checkboxes.forEach(function (cb) { cb.checked = isChecked; });
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
    if (window.FormHandler) {
      window.FormHandler.handleEmployeeFormSubmit(e);
    }
  }

  function editEmployee(id) {
    if (window.FormHandler) {
      window.FormHandler.editEmployee(id);
    }
  }

  function deleteEmployee(id) {
    if (window.DeleteHandler) {
      window.DeleteHandler.deleteEmployee(id);
    }
  }

  function handleBatchDeleteEmployees() {
    if (window.DeleteHandler) {
      window.DeleteHandler.handleBatchDeleteEmployees();
    }
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

    var batchImportBtn = document.getElementById('batchImportRatingItemsBtn');
    if (batchImportBtn) {
      batchImportBtn.addEventListener('click', function () {
        initBatchImportModal('ratingItems');
      });
    }

    var selectAll = document.getElementById('selectAllRatingItems');
    if (selectAll) {
      selectAll.addEventListener('change', function () {
        var isChecked = this.checked;
        var checkboxes = document.querySelectorAll('.rating-item-checkbox');
        checkboxes.forEach(function (cb) { cb.checked = isChecked; });
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
    if (window.FormHandler) {
      window.FormHandler.handleRatingItemFormSubmit(e);
    }
  }

  function editRatingItem(id) {
    if (window.FormHandler) {
      window.FormHandler.editRatingItem(id);
    }
  }

  function deleteRatingItem(id) {
    if (window.DeleteHandler) {
      window.DeleteHandler.deleteRatingItem(id);
    }
  }

  function handleBatchDeleteRatingItems() {
    if (window.DeleteHandler) {
      window.DeleteHandler.handleBatchDeleteRatingItems();
    }
  }

  function initEvaluationEvents() {
    if (window.EvaluationManager) {
      window.EvaluationManager.initEvaluationEvents();
    }
  }

  function initSearchEvents() {
    if (window.SearchHandler) {
      window.SearchHandler.initSearchEvents();
    }
  }

  function filterEmployees(searchText, department) {
    if (window.SearchHandler) {
      window.SearchHandler.filterEmployees(searchText, department);
    }
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
    var activeItem = document.querySelector('.nav-item.active');
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
      console.error('加载系统数据失败:', err);
      AdminUI.showNotification('加载失败', '无法加载系统数据: ' + (err.message || err), 'error');
    });

    AdminApi.loadDepartments().then(function (depts) {
      AdminState.setDepartments(depts);
      AdminRenderer.populateDepartmentSelects(depts);
    });
  }

  function initBatchImportModal(type) {
    if (window.BatchImport) {
      window.BatchImport.initBatchImportModal(type);
    }
  }

  return {
    init: init,
    loadDataAndRefresh: loadDataAndRefresh,
  };
})();