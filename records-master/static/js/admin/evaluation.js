// 评价管理功能
(function() {
  'use strict';

  window.EvaluationManager = {
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
            window.EvaluationManager.searchEvaluationResults(searchTerm);
          }, 300);
        });
      }

      // 部门筛选
      var departmentFilter = document.getElementById('evaluationDepartmentFilter');
      if (departmentFilter) {
        departmentFilter.addEventListener('change', function () {
          var department = this.value;
          var searchTerm = document.getElementById('evaluationEmployeeSearch')?.value.trim() || '';
          window.EvaluationManager.searchEvaluationResults(searchTerm, department);
        });
      }
    },

    // 搜索评价结果
    searchEvaluationResults: function(searchTerm, department) {
      var empPage = AdminState.getPagination('evaluationResults');
      AdminApi.loadEvaluationResults(empPage.currentPage, empPage.pageSize, searchTerm, department)
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

      window.EvaluationManager.downloadJSON(data, 'evaluation_results.json');
      AdminUI.showNotification('导出成功', '评价数据已导出', 'success');
    },

    // 导出评价统计
    exportEvaluationStats: function() {
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

      window.EvaluationManager.downloadJSON(stats, 'evaluation_stats.json');
      AdminUI.showNotification('导出成功', '统计数据已导出', 'success');
    },

    // 下载JSON文件
    downloadJSON: function(data, filename) {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
})();
