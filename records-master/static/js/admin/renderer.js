window.AdminRenderer = (function () {
  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    var div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function renderEmployeesTable() {
    var tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    var employees = AdminState.getPagedItems('employees');
    var relations = AdminState.getRelations();

    Object.keys(employees).forEach(function (id) {
      var emp = employees[id];
      var relatedCount = relations[id] ? relations[id].length : 0;
      var row = createEmployeeRow(id, emp, relatedCount);
      tbody.appendChild(row);
    });

    renderPagination('employees', 'employeesPagination');
  }

  function createEmployeeRow(id, emp, relatedCount) {
    var tr = document.createElement('tr');
    tr.innerHTML = 
      '<td class="table-cell">' +
        '<input type="checkbox" class="employee-checkbox w-4 h-4 text-primary border-neutral-300 rounded" data-id="' + id + '">' +
      '</td>' +
      '<td class="table-cell">' + id + '</td>' +
      '<td class="table-cell">' + escapeHtml(emp.name) + '</td>' +
      '<td class="table-cell">' + escapeHtml(emp.department) + '</td>' +
      '<td class="table-cell">' + relatedCount + '</td>' +
      '<td class="table-cell">' +
        '<button class="text-primary hover:text-primary/80 mr-2 edit-employee" data-id="' + id + '">' +
          '<i class="fa fa-edit"></i>' +
        '</button>' +
        '<button class="text-danger hover:text-danger/80 delete-employee" data-id="' + id + '">' +
          '<i class="fa fa-trash"></i>' +
        '</button>' +
      '</td>';
    return tr;
  }

  function renderRatingItemsTable() {
    var tbody = document.getElementById('ratingItemsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    var items = AdminState.getPagedItems('ratingItems');

    Object.keys(items).forEach(function (id) {
      var item = items[id];
      var relatedCount = AdminState.getRelationsForRatingItem(parseInt(id));
      var row = createRatingItemRow(id, item, relatedCount);
      tbody.appendChild(row);
    });

    renderPagination('ratingItems', 'ratingItemsPagination');
  }

  function createRatingItemRow(id, item, relatedCount) {
    var tr = document.createElement('tr');
    var statusClass = item.enabled ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-500';
    var statusText = item.enabled ? '启用' : '禁用';
    tr.innerHTML = 
      '<td class="table-cell">' +
        '<input type="checkbox" class="rating-item-checkbox w-4 h-4 text-primary border-neutral-300 rounded" data-id="' + id + '">' +
      '</td>' +
      '<td class="table-cell">' + id + '</td>' +
      '<td class="table-cell">' + escapeHtml(item.name) + '</td>' +
      '<td class="table-cell">' +
        '<span class="text-xs ' + statusClass + ' px-2 py-1 rounded-full">' + statusText + '</span>' +
      '</td>' +
      '<td class="table-cell">' + relatedCount + '</td>' +
      '<td class="table-cell">' +
        '<button class="text-primary hover:text-primary/80 mr-2 edit-rating-item" data-id="' + id + '">' +
          '<i class="fa fa-edit"></i>' +
        '</button>' +
        '<button class="text-danger hover:text-danger/80 delete-rating-item" data-id="' + id + '">' +
          '<i class="fa fa-trash"></i>' +
        '</button>' +
      '</td>';
    return tr;
  }

  function renderEvaluationResultsTable() {
    var tbody = document.getElementById('evaluationResultsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    var results = AdminState.getPagedItems('evaluationResults');

    Object.keys(results).forEach(function (id) {
      var result = results[id];
      var row = createEvaluationResultRow(id, result);
      tbody.appendChild(row);
    });

    renderPagination('evaluationResults', 'evaluationResultsPagination');
    renderEvaluationResultsStats();
  }

  function createEvaluationResultRow(id, result) {
    var tr = document.createElement('tr');
    var avgScore = calculateAverageScore(result.rating_details);
    var scoreClass = avgScore < 5 ? 'text-danger' : avgScore < 7 ? 'text-secondary' : 'text-success';
    tr.innerHTML = 
      '<td class="table-cell">' + id + '</td>' +
      '<td class="table-cell">' + escapeHtml(result.employee_name) + '</td>' +
      '<td class="table-cell">' + escapeHtml(result.employee_department) + '</td>' +
      '<td class="table-cell">' + escapeHtml(result.evaluator_name) + '</td>' +
      '<td class="table-cell">' +
        '<span class="' + scoreClass + ' font-medium">' + avgScore.toFixed(1) + '</span>' +
      '</td>' +
      '<td class="table-cell">' + formatDate(result.created_at) + '</td>' +
      '<td class="table-cell">' +
        '<button class="text-primary hover:text-primary/80 view-evaluation" data-id="' + id + '">' +
          '<i class="fa fa-eye"></i>' +
        '</button>' +
      '</td>';
    return tr;
  }

  function calculateAverageScore(ratingDetails) {
    if (!ratingDetails || Object.keys(ratingDetails).length === 0) return 0;
    var total = 0;
    var count = 0;
    Object.keys(ratingDetails).forEach(function (key) {
      if (ratingDetails[key].score) {
        total += ratingDetails[key].score;
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    var date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  function renderPagination(type, containerId) {
    var pag = AdminState.getPagination(type);
    console.log('渲染分页:', type, '当前页:', pag.currentPage, '总页数:', pag.totalPages, '总条数:', pag.totalItems);
    CommonPagination.render(containerId, pag.currentPage, pag.totalPages, function (page) {
      AdminState.setPaginationPage(type, page);
      // 切换页码时重新请求数据
      loadPageData(type, page);
    }, {
      infoClass: 'pagination-info',
      controlsClass: 'pagination-controls',
      buttonClass: 'pagination-btn',
      disabledClass: 'disabled',
      ellipsisClass: 'pagination-ellipsis'
    });
  }

  function loadPageData(type, page) {
    var pag = AdminState.getPagination(type);
    var promise;

    if (type === 'employees') {
      promise = AdminApi.loadEmployees(page, pag.pageSize).then(function (result) {
        AdminState.setPartial({
          employees: result.employees || result,
          pagination: { employees: result.pagination }
        });
        renderEmployeesTable();
      });
    } else if (type === 'ratingItems') {
      promise = AdminApi.loadRatingItems(page, pag.pageSize).then(function (result) {
        AdminState.setPartial({
          ratingItems: result.ratingItems || result,
          pagination: { ratingItems: result.pagination }
        });
        renderRatingItemsTable();
      });
    } else if (type === 'evaluationResults') {
      promise = AdminApi.loadEvaluationResults(page, pag.pageSize).then(function (result) {
        AdminState.setPartial({
          evaluationResults: result.evaluationResults || result,
          pagination: { evaluationResults: result.pagination }
        });
        renderEvaluationResultsTable();
      });
    }

    return promise;
  }

  function rerenderTable(type) {
    if (type === 'employees') renderEmployeesTable();
    else if (type === 'ratingItems') renderRatingItemsTable();
    else if (type === 'evaluationResults') renderEvaluationResultsTable();
  }



  function renderEvaluationResultsStats() {
    var statsEl = document.getElementById('evaluationResultsStats');
    if (!statsEl) return;

    var results = AdminState.getEvaluationResults();
    var total = Object.keys(results).length;
    var avgScore = 0;
    var lowScoreCount = 0;

    Object.keys(results).forEach(function (id) {
      var score = calculateAverageScore(results[id].rating_details);
      avgScore += score;
      if (score < 5) lowScoreCount++;
    });

    avgScore = total > 0 ? avgScore / total : 0;

    statsEl.innerHTML = 
      '<span class="mr-4">总记录数: <strong>' + total + '</strong></span>' +
      '<span class="mr-4">平均得分: <strong>' + avgScore.toFixed(1) + '</strong></span>' +
      '<span>低分记录: <strong class="text-danger">' + lowScoreCount + '</strong></span>';
  }

  function populateRatingItemsCheckboxes() {
    var group = document.getElementById('ratingItemsGroup');
    if (!group) return;

    group.innerHTML = '';
    var items = AdminState.getRatingItems();

    Object.keys(items).forEach(function (id) {
      var item = items[id];
      // 显示所有评分项（包括禁用的），禁用的用灰色标识
      var div = document.createElement('div');
      div.className = 'checkbox-group-item' + (item.enabled ? '' : ' opacity-50');
      div.innerHTML =
        '<input type="checkbox" class="checkbox-group-checkbox" value="' + id + '"' +
        (item.enabled ? '' : ' disabled title="该评分项已禁用"') + '>' +
        '<span>' + item.name + (item.enabled ? '' : ' (已禁用)') + '</span>';
      group.appendChild(div);
    });
  }

  function populateDepartmentSelects(departments) {
    var selects = [
      'employeeDepartmentFilter',
      'employeeDepartment',
      'batchDepartment',
      'associateDepartment',
      'evaluationDepartmentFilter',
    ];

    selects.forEach(function (selectId) {
      var select = document.getElementById(selectId);
      if (!select) return;

      var currentValue = select.value;
      select.innerHTML = '<option value="">请选择部门</option>';

      if (Array.isArray(departments)) {
        departments.forEach(function (dept) {
          var option = document.createElement('option');
          if (typeof dept === 'object') {
            option.value = dept.name;
            option.setAttribute('data-id', dept.id);
            option.textContent = dept.name;
          } else {
            option.value = dept;
            option.textContent = dept;
          }
          select.appendChild(option);
        });
      } else if (typeof departments === 'object') {
        Object.values(departments).forEach(function (dept) {
          var option = document.createElement('option');
          option.value = dept.name;
          option.setAttribute('data-id', dept.id);
          option.textContent = dept.name;
          select.appendChild(option);
        });
      }

      if (currentValue) {
        select.value = currentValue;
      }
    });
  }

  function renderEvaluationDetail(result) {
    var content = document.getElementById('evaluationDetailContent');
    var footer = document.getElementById('evaluationDetailFooter');
    if (!content) return;

    content.innerHTML = '';

    var infoSection = document.createElement('div');
    infoSection.innerHTML = 
      '<div class="grid grid-cols-2 gap-4">' +
        '<div><span class="text-neutral-500">员工姓名:</span> <strong>' + escapeHtml(result.employee_name) + '</strong></div>' +
        '<div><span class="text-neutral-500">部门:</span> <strong>' + escapeHtml(result.employee_department) + '</strong></div>' +
        '<div><span class="text-neutral-500">评价人:</span> <strong>' + escapeHtml(result.evaluator_name) + '</strong></div>' +
        '<div><span class="text-neutral-500">评价时间:</span> <strong>' + formatDate(result.created_at) + '</strong></div>' +
      '</div>';
    content.appendChild(infoSection);

    var ratingsSection = document.createElement('div');
    ratingsSection.className = 'mt-6';
    ratingsSection.innerHTML = '<h4 class="font-medium mb-4">评分详情</h4>';

    var ratingItems = AdminState.getRatingItems();
    Object.keys(result.rating_details).forEach(function (ratingId) {
      var detail = result.rating_details[ratingId];
      var item = ratingItems[ratingId];
      if (item) {
        var scoreClass = detail.score < 5 ? 'text-danger' : detail.score < 7 ? 'text-secondary' : 'text-success';
        var ratingDiv = document.createElement('div');
        ratingDiv.className = 'mb-4 p-3 bg-neutral-50 rounded-lg';
        ratingDiv.innerHTML = 
          '<div class="flex justify-between items-center mb-2">' +
            '<span class="font-medium">' + escapeHtml(item.name) + '</span>' +
            '<span class="' + scoreClass + ' font-bold">' + detail.score.toFixed(1) + '</span>' +
          '</div>' +
          '<div class="text-sm text-neutral-600">' + escapeHtml(detail.comment || '无评语') + '</div>';
        ratingsSection.appendChild(ratingDiv);
      }
    });

    content.appendChild(ratingsSection);

    if (footer) {
      footer.innerHTML = 
        '<button class="btn-danger" id="deleteEvaluationDetailBtn" data-id="' + result.id + '">' +
          '<i class="fa fa-trash mr-1"></i> 删除此记录' +
        '</button>';
    }
  }

  return {
    renderEmployeesTable: renderEmployeesTable,
    renderRatingItemsTable: renderRatingItemsTable,
    renderEvaluationResultsTable: renderEvaluationResultsTable,
    renderPagination: renderPagination,
    loadPageData: loadPageData,

    renderEvaluationResultsStats: renderEvaluationResultsStats,
    populateRatingItemsCheckboxes: populateRatingItemsCheckboxes,
    populateDepartmentSelects: populateDepartmentSelects,
    renderEvaluationDetail: renderEvaluationDetail,
    calculateAverageScore: calculateAverageScore,
    formatDate: formatDate,
  };
})();