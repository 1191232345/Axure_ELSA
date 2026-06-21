// 搜索和筛选处理器
(function() {
  'use strict';

  window.SearchHandler = {
    // 初始化搜索事件
    initSearchEvents: function() {
      var employeeSearch = document.getElementById('employeeSearch');
      if (employeeSearch) {
        employeeSearch.addEventListener('input', function () {
          window.SearchHandler.filterEmployees(this.value, document.getElementById('employeeDepartmentFilter').value);
        });
      }

      var employeeDeptFilter = document.getElementById('employeeDepartmentFilter');
      if (employeeDeptFilter) {
        employeeDeptFilter.addEventListener('change', function () {
          window.SearchHandler.filterEmployees(document.getElementById('employeeSearch').value, this.value);
        });
      }
    },

    // 筛选员工
    filterEmployees: function(searchText, department) {
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
  };
})();
