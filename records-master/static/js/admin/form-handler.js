// 表单处理器
(function() {
  'use strict';

  window.FormHandler = {
    // 处理员工表单提交
    handleEmployeeFormSubmit: function(e) {
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
          if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
            window.AdminEvents.loadDataAndRefresh();
          }
        } else {
          AdminUI.showNotification('操作失败', res.error || '未知错误', 'error');
        }
      }).catch(function (err) {
        AdminUI.showNotification('操作失败', err.message, 'error');
      });
    },

    // 编辑员工
    editEmployee: function(id) {
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
    },

    // 处理评分项表单提交
    handleRatingItemFormSubmit: function(e) {
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

      var data = { name: name, description: description, enabled: enabled ? 1 : 0 };

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
          if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
            window.AdminEvents.loadDataAndRefresh();
          }
        } else {
          AdminUI.showNotification('操作失败', res.error || '未知错误', 'error');
        }
      }).catch(function (err) {
        AdminUI.showNotification('操作失败', err.message, 'error');
      });
    },

    // 编辑评分项
    editRatingItem: function(id) {
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
  };
})();
