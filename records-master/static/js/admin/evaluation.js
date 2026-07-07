// 评价管理功能
(function() {
  'use strict';

  window.EvaluationManager = {
    getEvaluationFilters: function() {
      return {
        employeeName: document.getElementById('evaluationEmployeeSearch')?.value.trim() || '',
        department: document.getElementById('evaluationDepartmentFilter')?.value || '',
        startDate: document.getElementById('evaluationStartDate')?.value || '',
        endDate: document.getElementById('evaluationEndDate')?.value || '',
      };
    },

    getSortedEvaluationResultIds: function(results) {
      return Object.keys(results).sort(function (a, b) {
        var dateA = results[a].created_at || '';
        var dateB = results[b].created_at || '';
        return dateB.localeCompare(dateA);
      });
    },

    validateDateRange: function(startDate, endDate) {
      if (startDate && endDate && startDate > endDate) {
        AdminUI.showNotification('日期无效', '开始日期不能晚于结束日期', 'error');
        return false;
      }
      return true;
    },

    // 初始化评价事件
    initEvaluationEvents: function() {
      // 查看评价详情按钮
      document.addEventListener('click', function (e) {
        if (e.target.classList.contains('view-evaluation') || e.target.parentElement.classList.contains('view-evaluation')) {
          var btn = e.target.classList.contains('view-evaluation') ? e.target : e.target.parentElement;
          var id = btn.getAttribute('data-id');
          window.EvaluationManager.viewEvaluationDetail(id);
        }
        
        // 删除评价详情按钮（动态绑定）
        if (e.target.id === 'deleteEvaluationDetailBtn' || e.target.parentElement.id === 'deleteEvaluationDetailBtn') {
          var btn = e.target.id === 'deleteEvaluationDetailBtn' ? e.target : e.target.parentElement;
          var id = btn.getAttribute('data-id');
          window.EvaluationManager.deleteEvaluationResult(id);
        }
      });

      // 导出按钮
      var exportBtn = document.getElementById('exportEvaluationBtn');
      if (exportBtn) {
        exportBtn.addEventListener('click', window.EvaluationManager.exportEvaluationData);
      }

      var exportStatsBtn = document.getElementById('exportEvaluationStatsBtn');
      if (exportStatsBtn) {
        exportStatsBtn.addEventListener('click', window.EvaluationManager.exportEvaluationStats);
      }

      // 搜索功能
      var searchInput = document.getElementById('evaluationEmployeeSearch');
      if (searchInput) {
        var debounceTimer = null;
        searchInput.addEventListener('input', function () {
          var searchTerm = this.value.trim();
          
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          
          debounceTimer = setTimeout(function () {
            window.EvaluationManager.searchEvaluationResults();
          }, 300);
        });
      }

      // 部门筛选
      var departmentFilter = document.getElementById('evaluationDepartmentFilter');
      if (departmentFilter) {
        departmentFilter.addEventListener('change', function () {
          window.EvaluationManager.searchEvaluationResults();
        });
      }

      // 评价日期筛选
      ['evaluationStartDate', 'evaluationEndDate'].forEach(function (id) {
        var dateInput = document.getElementById(id);
        if (dateInput) {
          dateInput.addEventListener('change', function () {
            window.EvaluationManager.searchEvaluationResults();
          });
        }
      });
    },

    // 搜索评价结果
    searchEvaluationResults: function() {
      var filters = window.EvaluationManager.getEvaluationFilters();
      if (!window.EvaluationManager.validateDateRange(filters.startDate, filters.endDate)) {
        return;
      }

      AdminState.setPaginationPage('evaluationResults', 1);
      var empPage = AdminState.getPagination('evaluationResults');
      AdminApi.loadEvaluationResults(
        empPage.currentPage,
        empPage.pageSize,
        filters.employeeName,
        filters.department,
        filters.startDate,
        filters.endDate
      )
        .then(function (result) {
          // 处理API返回的数据格式
          var evaluationResults = result.evaluationResults || result;
          var pagination = result.pagination || null;
          
          AdminState.setPartial({
            evaluationResults: evaluationResults,
            pagination: {
              evaluationResults: pagination
            }
          });
          AdminRenderer.renderEvaluationResultsTable();
          AdminRenderer.renderEvaluationResultsStats();
        })
        .catch(function (error) {
          console.error('搜索失败:', error);
          AdminUI.showNotification('搜索失败', '请重试', 'error');
        });
    },

    // 查看评价详情
    viewEvaluationDetail: function(id) {
      var results = AdminState.getEvaluationResults();
      var result = results[id];
      if (!result) return;

      AdminRenderer.renderEvaluationDetail(result);
      AdminUI.showModal('evaluationDetailModal');
    },

    // 删除评价结果
    deleteEvaluationResult: function(id) {
      AdminUI.confirm('确定要删除该评价记录吗？此操作不可撤销。', function () {
        AdminApi.deleteEvaluationResult(id).then(function (res) {
          if (res.success) {
            AdminUI.hideModal('evaluationDetailModal');
            AdminUI.showNotification('删除成功', '评价记录已删除', 'success');
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

    // 导出评价数据
    exportEvaluationData: function() {
      var filters = window.EvaluationManager.getEvaluationFilters();
      if (!window.EvaluationManager.validateDateRange(filters.startDate, filters.endDate)) {
        return;
      }

      AdminApi.loadAllEvaluationResults(
        filters.employeeName,
        filters.department,
        filters.startDate,
        filters.endDate
      ).then(function (result) {
        var results = result.evaluationResults || result;
        window.EvaluationManager.downloadEvaluationResults(results, 'evaluation_results.xls');
      }).catch(function (error) {
        console.error('导出失败:', error);
        AdminUI.showNotification('导出失败', '请重试', 'error');
      });
    },

    // 导出评价统计
    exportEvaluationStats: function() {
      var filters = window.EvaluationManager.getEvaluationFilters();
      if (!window.EvaluationManager.validateDateRange(filters.startDate, filters.endDate)) {
        return;
      }

      AdminApi.loadAllEvaluationResults(
        filters.employeeName,
        filters.department,
        filters.startDate,
        filters.endDate
      ).then(function (result) {
        var results = result.evaluationResults || result;
        window.EvaluationManager.downloadEvaluationStats(results, 'evaluation_stats.xls');
      }).catch(function (error) {
        console.error('导出失败:', error);
        AdminUI.showNotification('导出失败', '请重试', 'error');
      });
    },

    downloadEvaluationResults: function(results, filename) {
      var ratingItems = AdminState.getRatingItems();
      var ratingItemIds = Object.keys(ratingItems).sort(function (a, b) {
        return (ratingItems[a].name || '').localeCompare(ratingItems[b].name || '', 'zh-CN');
      });

      var headers = [
        '记录ID',
        '员工姓名',
        '部门',
        '评价人',
        '平均分',
        '评价时间',
      ];
      ratingItemIds.forEach(function (ratingId) {
        var itemName = ratingItems[ratingId].name || ratingId;
        headers.push(itemName + '_得分');
        headers.push(itemName + '_评语');
      });

      var sortedIds = window.EvaluationManager.getSortedEvaluationResultIds(results);
      var rows = sortedIds.map(function (id) {
        var r = results[id];
        var row = [
          id,
          r.employee_name,
          r.employee_department,
          r.evaluator_name,
          AdminRenderer.calculateAverageScore(r.rating_details).toFixed(2),
          AdminRenderer.formatDate(r.created_at),
        ];
        ratingItemIds.forEach(function (ratingId) {
          var detail = (r.rating_details && r.rating_details[ratingId]) || {};
          row.push(detail.score != null ? Number(detail.score).toFixed(1) : '');
          row.push(detail.comment || '');
        });
        return row;
      });

      if (rows.length === 0) {
        AdminUI.showNotification('导出失败', '当前筛选条件下没有可导出的评价数据', 'error');
        return;
      }

      window.EvaluationManager.downloadExcel(headers, rows, filename);
      AdminUI.showNotification('导出成功', '评价数据已导出为 Excel', 'success');
    },

    downloadEvaluationStats: function(results, filename) {
      var sortedIds = window.EvaluationManager.getSortedEvaluationResultIds(results);
      var totalCount = sortedIds.length;
      if (totalCount === 0) {
        AdminUI.showNotification('导出失败', '当前筛选条件下没有可导出的统计数据', 'error');
        return;
      }

      var totalScore = 0;
      var departmentStats = {};
      sortedIds.forEach(function (id) {
        var r = results[id];
        var score = AdminRenderer.calculateAverageScore(r.rating_details);
        totalScore += score;

        var dept = r.employee_department || '未知部门';
        if (!departmentStats[dept]) {
          departmentStats[dept] = { count: 0, totalScore: 0 };
        }
        departmentStats[dept].count++;
        departmentStats[dept].totalScore += score;
      });

      var averageScore = totalCount > 0 ? (totalScore / totalCount).toFixed(2) : '0';
      var rows = [
        ['总记录数', totalCount],
        ['平均得分', averageScore],
        [],
        ['部门', '记录数', '平均得分'],
      ];

      Object.keys(departmentStats).sort(function (a, b) {
        return a.localeCompare(b, 'zh-CN');
      }).forEach(function (dept) {
        var ds = departmentStats[dept];
        rows.push([
          dept,
          ds.count,
          ds.count > 0 ? (ds.totalScore / ds.count).toFixed(2) : '0',
        ]);
      });

      window.EvaluationManager.downloadExcel(null, rows, filename);
      AdminUI.showNotification('导出成功', '统计数据已导出为 Excel', 'success');
    },

    escapeExcelCell: function(value) {
      var text = value == null ? '' : String(value);
      if (/[",\r\n]/.test(text)) {
        return '"' + text.replace(/"/g, '""') + '"';
      }
      return text;
    },

    // 下载 Excel 文件（UTF-8 BOM CSV，Excel 可直接打开）
    downloadExcel: function(headers, rows, filename) {
      var lines = [];
      if (headers && headers.length) {
        lines.push(headers.map(window.EvaluationManager.escapeExcelCell).join(','));
      }
      rows.forEach(function (row) {
        lines.push(row.map(window.EvaluationManager.escapeExcelCell).join(','));
      });

      var blob = new Blob(['\ufeff' + lines.join('\n')], {
        type: 'application/vnd.ms-excel;charset=utf-8;',
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
})();
