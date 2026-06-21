// 删除处理器
(function() {
  'use strict';

  window.DeleteHandler = {
    // 删除员工
    deleteEmployee: function(id) {
      AdminUI.confirm('确定要删除该员工吗？相关评价数据将保留。', function () {
        AdminApi.deleteEmployee(id).then(function (res) {
          if (res.success) {
            AdminUI.showNotification('删除成功', '员工已删除', 'success');
            if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
              window.AdminEvents.loadDataAndRefresh();
            }
          } else {
            AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
          }
        }).catch(function (err) {
          AdminUI.showNotification('删除失败', err.message, 'error');
        });
      });
    },

    // 批量删除员工（智能判断：有勾选删除选中，无勾选删除全部符合条件）
    handleBatchDeleteEmployees: function() {
      var checkboxes = document.querySelectorAll('.employee-checkbox:checked');
      var ids = [];
      checkboxes.forEach(function (cb) { ids.push(cb.getAttribute('data-id')); });

      if (ids.length > 0) {
        // 有勾选项，删除选中的员工
        AdminUI.confirm('确定要删除选中的 ' + ids.length + ' 个员工吗？', function () {
          AdminApi.batchDeleteEmployees({ ids: ids }).then(function (res) {
            if (res.success) {
              AdminUI.showNotification('删除成功', res.message || '已删除 ' + res.data.deleted_count + ' 个员工', 'success');
              if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
                window.AdminEvents.loadDataAndRefresh();
              }
            } else {
              AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
            }
          }).catch(function (err) {
            AdminUI.showNotification('删除失败', err.message, 'error');
          });
        });
      } else {
        // 无勾选项，删除所有符合筛选条件的员工
        var search = document.getElementById('employeeSearch').value.trim();
        var department = document.getElementById('employeeDepartmentFilter').value;
        
        AdminUI.confirm('未选中任何员工，将删除符合当前筛选条件的所有员工。此操作不可撤销，确定要继续吗？', function () {
          AdminApi.deleteEmployeesByFilter({
            search: search,
            department: department
          }).then(function (res) {
            if (res.success) {
              AdminUI.showNotification('删除成功', res.message || '已删除 ' + res.data.deleted_count + ' 个员工', 'success');
              if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
                window.AdminEvents.loadDataAndRefresh();
              }
            } else {
              AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
            }
          }).catch(function (err) {
            AdminUI.showNotification('删除失败', err.message, 'error');
          });
        });
      }
    },

    // 删除评分项
    deleteRatingItem: function(id) {
      var relatedCount = AdminState.getRelationsForRatingItem(parseInt(id));
      var message = relatedCount > 0
        ? '该评分项关联了 ' + relatedCount + ' 名员工，删除后相关关联数据将被清除，确定要继续吗？'
        : '确定要删除该评分项吗？';

      AdminUI.confirm(message, function () {
        AdminApi.deleteRatingItem(id).then(function (res) {
          if (res.success) {
            AdminUI.showNotification('删除成功', res.message || '评分项已删除', 'success');
            if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
              window.AdminEvents.loadDataAndRefresh();
            }
          } else {
            AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
          }
        }).catch(function (err) {
          AdminUI.showNotification('删除失败', err.message, 'error');
        });
      });
    },

    // 批量删除评分项（智能判断：有勾选删除选中，无勾选删除全部）
    handleBatchDeleteRatingItems: function() {
      var checkboxes = document.querySelectorAll('.rating-item-checkbox:checked');
      var ids = [];
      checkboxes.forEach(function (cb) { ids.push(parseInt(cb.getAttribute('data-id'))); });

      if (ids.length > 0) {
        // 有勾选项，删除选中的评分项
        var totalRelated = 0;
        ids.forEach(function (id) {
          totalRelated += AdminState.getRelationsForRatingItem(id);
        });

        var message = totalRelated > 0
          ? '选中的 ' + ids.length + ' 个评分项共关联了 ' + totalRelated + ' 名员工，删除后相关关联数据将被清除，确定要继续吗？'
          : '确定要删除选中的 ' + ids.length + ' 个评分项吗？';

        AdminUI.confirm(message, function () {
          AdminApi.batchDeleteRatingItems(ids).then(function (res) {
            if (res.success) {
              AdminUI.showNotification('删除成功', res.message || '已删除 ' + res.data.deleted_count + ' 个评分项', 'success');
              if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
                window.AdminEvents.loadDataAndRefresh();
              }
            } else {
              AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
            }
          }).catch(function (err) {
            AdminUI.showNotification('删除失败', err.message, 'error');
          });
        });
      } else {
        // 无勾选项，删除所有评分项
        AdminUI.confirm('未选中任何评分项，将删除所有评分项。评分项关联的员工数据将被清除，此操作不可撤销，确定要继续吗？', function () {
          AdminApi.deleteRatingItemsByFilter({}).then(function (res) {
            if (res.success) {
              AdminUI.showNotification('删除成功', res.message || '已删除 ' + res.data.deleted_count + ' 个评分项', 'success');
              if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
                window.AdminEvents.loadDataAndRefresh();
              }
            } else {
              AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
            }
          }).catch(function (err) {
            AdminUI.showNotification('删除失败', err.message, 'error');
          });
        });
      }
    },

    // 批量删除部门（智能判断：有勾选删除选中，无勾选删除全部符合条件）
    handleBatchDeleteDepartments: function() {
      var checkboxes = document.querySelectorAll('.department-checkbox:checked');
      var ids = [];
      checkboxes.forEach(function (cb) { ids.push(parseInt(cb.getAttribute('data-id'))); });

      if (ids.length > 0) {
        // 有勾选项，删除选中的部门
        AdminUI.confirm('确定要删除选中的 ' + ids.length + ' 个部门吗？部门下的员工将自动解除关联。', function () {
          DepartmentApi.batchDeleteDepartments(ids).then(function (res) {
            if (res.success) {
              AdminUI.showNotification('删除成功', res.message || '已删除 ' + res.data.deleted_count + ' 个部门', 'success');
            } else {
              AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
            }
            if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
              window.AdminEvents.loadDataAndRefresh();
            }
          }).catch(function (err) {
            AdminUI.showNotification('删除失败', err.message, 'error');
          });
        });
      } else {
        // 无勾选项，删除所有符合筛选条件的部门
        var search = document.getElementById('departmentSearch').value.trim();
        var status = document.getElementById('departmentStatusFilter').value;
        
        AdminUI.confirm('未选中任何部门，将删除符合当前筛选条件的所有部门。部门下的员工将自动解除关联，此操作不可撤销，确定要继续吗？', function () {
          AdminApi.deleteDepartmentsByFilter({
            search: search,
            enabled: status
          }).then(function (res) {
            if (res.success) {
              AdminUI.showNotification('删除成功', res.message || '已删除 ' + res.data.deleted_count + ' 个部门', 'success');
              if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
                window.AdminEvents.loadDataAndRefresh();
              }
            } else {
              AdminUI.showNotification('删除失败', res.error || '未知错误', 'error');
            }
          }).catch(function (err) {
            AdminUI.showNotification('删除失败', err.message, 'error');
          });
        });
      }
    }
  };
})();
