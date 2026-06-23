// 搜索和筛选处理器
(function() {
  'use strict';

  window.SearchHandler = {
    // 初始化搜索事件
    initSearchEvents: function() {
      var employeeSearch = document.getElementById('employeeSearch');
      if (employeeSearch) {
        employeeSearch.addEventListener('input', debounce(function () {
          var searchText = employeeSearch.value.trim();
          var department = document.getElementById('employeeDepartmentFilter').value;
          window.SearchHandler.filterEmployees(searchText, department);
        }, 300));
      }

      var employeeDeptFilter = document.getElementById('employeeDepartmentFilter');
      if (employeeDeptFilter) {
        employeeDeptFilter.addEventListener('change', function () {
          var searchText = document.getElementById('employeeSearch').value.trim();
          window.SearchHandler.filterEmployees(searchText, this.value);
        });
      }
    },

    // 筛选员工
    filterEmployees: function(searchText, department) {
      AdminState.setPaginationPage('employees', 1);
      
      AdminApi.loadEmployees(1, 10, searchText, department).then(function (result) {
        var employees = result.employees || result;
        var pagination = result.pagination || null;
        
        // 更新状态
        var data = {
          employees: employees,
          pagination: {
            employees: pagination
          }
        };
        AdminState.setPartial(data);
        
        // 渲染表格
        AdminRenderer.renderEmployeesTable();
      }).catch(function (err) {
        console.error('搜索员工失败:', err);
        AdminUI.showNotification('搜索失败', '无法搜索员工: ' + (err.message || err), 'error');
      });
    }
  };

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
})();
