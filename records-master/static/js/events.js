window.Events = (function () {
  function initSliders() {
    var sliders = document.querySelectorAll('.rating-slider');
    sliders.forEach(function (slider) {
      var valueDisplay = slider.nextElementSibling;
      var hiddenInput = slider.parentElement.querySelector('.rating-input');

      slider.value = '0';
      if (valueDisplay) valueDisplay.textContent = '未评分';
      if (hiddenInput) hiddenInput.value = '';

      slider.oninput = function () {
        var vd = this.nextElementSibling;
        var hi = this.parentElement.querySelector('.rating-input');

        if (this.value) {
          if (vd) vd.textContent = this.value + '分';
          if (hi) hi.value = this.value;
        } else {
          if (vd) vd.textContent = '未评分';
          if (hi) hi.value = '';
        }

        Validator.handleLowScoreRequired(this);
        Renderer.updateSubmitButton();
        Renderer.updateEmployeeStatus(this.closest('.evaluation-item'));
      };
    });
  }

  function initExpandCollapse() {
    var headers = document.querySelectorAll('.evaluation-header');
    headers.forEach(function (header) {
      header.addEventListener('click', function () {
        var content = this.nextElementSibling;
        var icon = this.querySelector('.expand-icon i');
        if (content) content.classList.toggle('hidden');
        if (icon) icon.classList.toggle('rotate-180');
      });
    });

    var expandAllBtn = document.getElementById('expandAllBtn');
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.evaluation-content.hidden').forEach(function (content) {
          content.classList.remove('hidden');
          var prev = content.previousElementSibling;
          if (prev) {
            var icon = prev.querySelector('.expand-icon i');
            if (icon) icon.classList.add('rotate-180');
          }
        });
      });
    }

    var collapseAllBtn = document.getElementById('collapseAllBtn');
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.evaluation-content:not(.hidden)').forEach(function (content) {
          content.classList.add('hidden');
          var prev = content.previousElementSibling;
          if (prev) {
            var icon = prev.querySelector('.expand-icon i');
            if (icon) icon.classList.remove('rotate-180');
          }
        });
      });
    }
  }

  function initRatingEvents() {
    document.querySelectorAll('textarea').forEach(function (textarea) {
      textarea.addEventListener('input', function () {
        Renderer.updateSubmitButton();
        Renderer.updateEmployeeStatus(this.closest('.evaluation-item'));

        if (this.classList.contains('comment-textarea')) {
          var ratingItem = this.closest('.rating-item');
          if (ratingItem) {
            var requiredIndicator = ratingItem.querySelector('.comment-required');
            if (requiredIndicator && !requiredIndicator.classList.contains('hidden')) {
              Validator.validateCommentField(this);
            }
          }
        }
      });
    });
  }

  function initSearch() {
    var searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    var debounceTimer = null;
    
    searchInput.addEventListener('input', function () {
      var searchTerm = this.value.trim();
      
      // 清除之前的定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // 设置新的定时器，300ms 后执行搜索
      debounceTimer = setTimeout(function () {
        // 更新筛选条件
        State.setFilters(searchTerm, State.getFilters().department);
        
        // 调用后端 API 进行搜索
        Renderer.showLoading();
        Api.loadAllData(1, 10, searchTerm, State.getFilters().department)
          .then(function (loaded) {
            State.setAll(loaded);
            Renderer.renderEvaluationList();
            Renderer.renderPagination();
            initSliders();
            initExpandCollapse();
            initRatingEvents();
            initClearEvaluationButtons();
            initCommentTextareaEvents();
            initRatingDescriptionButtons();
            Renderer.updateSubmitButton();
          })
          .catch(function (error) {
            console.error('搜索失败:', error);
            UI.showToast('搜索失败，请重试', 'error');
          })
          .finally(function () {
            Renderer.hideLoading();
          });
      }, 300);
    });
  }

  function initFilterButtons() {
    var filterButtons = document.querySelectorAll('.filter-btn');

    var countElement = document.getElementById('filterCount');
    if (!countElement) {
      countElement = document.createElement('div');
      countElement.id = 'filterCount';
      countElement.className = 'text-sm text-neutral-500 mt-2';
      var filterContainer = document.querySelector('.filter-container');
      if (filterContainer) filterContainer.appendChild(countElement);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (btn) {
          btn.classList.remove('bg-primary', 'text-white');
          btn.classList.add('bg-neutral-100', 'hover:bg-neutral-200', 'text-neutral-600');
        });

        this.classList.remove('bg-neutral-100', 'hover:bg-neutral-200', 'text-neutral-600');
        this.classList.add('bg-primary', 'text-white');

        var filterText = this.textContent.trim();
        
        // 更新筛选条件
        var department = filterText === '全部' ? '' : filterText;
        State.setFilters(State.getFilters().search, department);
        
        // 调用后端 API 进行筛选
        Renderer.showLoading();
        Api.loadAllData(1, 10, State.getFilters().search, department)
          .then(function (loaded) {
            State.setAll(loaded);
            Renderer.renderEvaluationList();
            Renderer.renderPagination();
            initSliders();
            initExpandCollapse();
            initRatingEvents();
            initClearEvaluationButtons();
            initCommentTextareaEvents();
            initRatingDescriptionButtons();
            Renderer.updateSubmitButton();
            
            // 更新显示数量
            var pagination = State.getPagination();
            countElement.textContent = '共 ' + pagination.total + ' 名被评人';
          })
          .catch(function (error) {
            console.error('筛选失败:', error);
            UI.showToast('筛选失败，请重试', 'error');
          })
          .finally(function () {
            Renderer.hideLoading();
          });
      });
    });
  }

  function initClearEvaluationButtons() {
    document.querySelectorAll('.clear-evaluation-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        if (confirm('确定要清空该员工的所有评价吗？此操作不可撤销。')) {
          var employeeItem = this.closest('.evaluation-item');
          if (!employeeItem) return;
          Renderer.resetEmployeeEvaluation(employeeItem);
          Renderer.updateSubmitButton();
          UI.showToast('评价已清空', 'info');
        }
      });
    });
  }

  function initCommentTextareaEvents() {
    document.querySelectorAll('textarea').forEach(function (textarea) {
      textarea.addEventListener('input', function () {
        Renderer.updateSubmitButton();
        Renderer.updateEmployeeStatus(this.closest('.evaluation-item'));

        var ratingItem = this.closest('.rating-item');
        if (ratingItem) {
          var slider = ratingItem.querySelector('.rating-slider');
          if (slider) Validator.handleLowScoreRequired(slider);
        }

        var employeeItem = this.closest('.evaluation-item');
        if (employeeItem && this.classList.contains('overall-comment')) {
          Validator.validateOverallComment(this);
        }
      });
    });
  }

  function initRatingDescriptionButtons() {
    document.querySelectorAll('.rating-description-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        var ratingItem = this.closest('.rating-item');
        if (!ratingItem) return;

        var descriptionElement = ratingItem.querySelector('.rating-description-content');
        var description = descriptionElement ? descriptionElement.textContent.trim() : '';

        var ratingName = '评分说明';
        var labelEl = ratingItem.querySelector('label.font-medium');
        if (labelEl) {
          var firstTextNode = Array.from(labelEl.childNodes).find(function (node) {
            return node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '';
          });
          if (firstTextNode) {
            ratingName = firstTextNode.textContent.trim();
          } else {
            ratingName = labelEl.textContent.trim();
          }
        }

        UI.showRatingDescriptionDialog(ratingName, description);
      });
    });
  }

  function initFormValidation() {
    var submitAllBtn = document.getElementById('submitAllBtn');
    if (!submitAllBtn) return;

    submitAllBtn.addEventListener('click', function () {
      if (State.hasAnyLowScoreWithoutComment()) {
        UI.showToast('存在低分项未填写备注', 'warning');
        return;
      }

      var buttonRef = this;

      UI.showConfirmDialog(
        '确定要提交所有评价吗？提交后将重置所有评分。',
        function (evaluatorName) {
          buttonRef.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i>提交中...';
          buttonRef.disabled = true;

          var allEvaluations = State.collectAllEvaluations(evaluatorName);

          if (allEvaluations.length === 0) {
            UI.showToast('没有可提交的评价数据', 'warning');
            buttonRef.innerHTML = '<i class="fa fa-paper-plane mr-1"></i>提交评价';
            buttonRef.disabled = false;
            return;
          }

          Api.submitEvaluations(allEvaluations)
            .then(function (data) {
              if (data.success) {
                return resetPageToInitialState().then(function () {
                  UI.showToast('所有评价已成功提交，页面已重置', 'success');
                });
              } else {
                throw new Error('提交失败');
              }
            })
            .catch(function (error) {
              console.error('提交评价失败:', error);
              UI.showToast('评价提交失败，请重试', 'error');
              buttonRef.innerHTML = '<i class="fa fa-paper-plane mr-1"></i>提交评价';
              buttonRef.disabled = false;
            })
            .finally(function () {
              setTimeout(function () {
                buttonRef.innerHTML = '<i class="fa fa-paper-plane mr-1"></i>提交评价';
                buttonRef.disabled = true;
                buttonRef.classList.remove('btn-primary');
                buttonRef.classList.add('btn-disabled');
              }, 2000);
            });
        },
        null,
        { type: 'submit-evaluation' }
      );
    });
  }

  function resetPageToInitialState() {
    Renderer.showLoading();

    return Api.loadAllData()
      .then(function (loaded) {
        State.setAll(loaded);
        Renderer.renderEvaluationList();
        initSliders();
        initExpandCollapse();
        initRatingEvents();
        initFormValidation();
        initSearch();
        initFilterButtons();
        initClearEvaluationButtons();
        initCommentTextareaEvents();

        var submitAllBtn = document.getElementById('submitAllBtn');
        if (submitAllBtn) {
          submitAllBtn.innerHTML = '<i class="fa fa-paper-plane mr-1"></i>提交评价';
          submitAllBtn.disabled = true;
          submitAllBtn.classList.remove('btn-primary');
          submitAllBtn.classList.add('btn-disabled');
        }
      })
      .catch(function (error) {
        console.error('重置页面失败:', error);
        UI.showToast('页面重置失败，请刷新页面重试', 'error');
      })
      .finally(function () {
        Renderer.hideLoading();
      });
  }

  function initAll() {
    return Api.loadAllData(1, 10)
      .then(function (loaded) {
        State.setAll(loaded);
        Renderer.renderEvaluationList();
        Renderer.renderFilterButtons();
        Renderer.renderPagination();
        initSliders();
        initExpandCollapse();
        initRatingEvents();
        initFormValidation();
        initSearch();
        initFilterButtons();
        initClearEvaluationButtons();
        initCommentTextareaEvents();
        initRatingDescriptionButtons();
      })
      .catch(function (error) {
        console.error('加载数据失败:', error);
        alert('无法加载评价数据，请刷新页面重试');
      });
  }

  function loadPage(page) {
    Renderer.showLoading();
    
    var filters = State.getFilters();
    
    return Api.loadAllData(page, 10, filters.search, filters.department)
      .then(function (loaded) {
        State.setAll(loaded);
        Renderer.renderEvaluationList();
        Renderer.renderPagination();
        initSliders();
        initExpandCollapse();
        initRatingEvents();
        initClearEvaluationButtons();
        initCommentTextareaEvents();
        initRatingDescriptionButtons();
        Renderer.updateSubmitButton();
      })
      .catch(function (error) {
        console.error('加载页面数据失败:', error);
        UI.showToast('加载失败，请重试', 'error');
      })
      .finally(function () {
        Renderer.hideLoading();
      });
  }

  return {
    initAll: initAll,
    resetPageToInitialState: resetPageToInitialState,
    loadPage: loadPage,
  };
})();
