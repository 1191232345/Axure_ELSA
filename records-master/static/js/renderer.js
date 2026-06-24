window.Renderer = (function () {
  function renderEvaluationList() {
    var evaluationForm = document.getElementById('evaluationForm');
    var employeeTemplate = document.getElementById('employeeTemplate');
    var ratingItemTemplate = document.getElementById('ratingItemTemplate');

    var itemsToRemove = [];
    for (var i = 0; i < evaluationForm.children.length; i++) {
      var child = evaluationForm.children[i];
      if (child.id !== 'employeeTemplate' && child.id !== 'ratingItemTemplate') {
        itemsToRemove.push(child);
      }
    }
    itemsToRemove.forEach(function (item) { item.remove(); });

    var employees = State.getEmployees();
    Object.keys(employees).forEach(function (employeeId) {
      var employee = employees[employeeId];
      var employeeItem = employeeTemplate.cloneNode(true);
      employeeItem.removeAttribute('id');
      employeeItem.classList.remove('hidden');
      employeeItem.setAttribute('data-employee-id', employeeId);

      var namePlaceholder = employeeItem.querySelector('h3');
      namePlaceholder.textContent = employee.name;

      var deptPlaceholder = employeeItem.querySelector('p');
      deptPlaceholder.textContent = employee.department + ' \u00B7 员工';

      var textareas = employeeItem.querySelectorAll('textarea, input[type="hidden"]');
      textareas.forEach(function (textarea) {
        if (textarea.name) {
          textarea.name = textarea.name.replace('__ID__', employeeId);
        }
      });

      var saveButton = employeeItem.querySelector('.save-individual');
      if (saveButton) saveButton.setAttribute('data-id', employeeId);

      var relatedRatingIds = State.getRelationsForEmployee(employeeId);
      var ratingItemsContainer = employeeItem.querySelector('.pt-2.border-t.border-neutral-100.space-y-5');

      var elementsToRemove = [];
      for (var j = 0; j < ratingItemsContainer.children.length; j++) {
        var c = ratingItemsContainer.children[j];
        if (c.classList.contains('rating-item') || c.textContent.indexOf('__RATING_ITEMS__') !== -1) {
          elementsToRemove.push(c);
        }
      }
      elementsToRemove.forEach(function (item) { item.remove(); });

      var overallCommentSection = employeeItem.querySelector('.mt-4.pt-4.border-t.border-neutral-100');

      relatedRatingIds.forEach(function (ratingId) {
        var ratingItem = State.getRatingItem(ratingId.toString());
        if (ratingItem && ratingItem.enabled) {
          var newRatingItem = ratingItemTemplate.cloneNode(true);
          newRatingItem.removeAttribute('id');
          newRatingItem.classList.remove('hidden');
          newRatingItem.setAttribute('data-rating-id', ratingId);

          var titlePlaceholder = newRatingItem.querySelector('label.font-medium');
          titlePlaceholder.innerHTML = titlePlaceholder.innerHTML.replace('__RATING_TITLE__', ratingItem.name);

          var descPlaceholder = newRatingItem.querySelector('.rating-description-content');
          descPlaceholder.textContent = ratingItem.description;

          var slider = newRatingItem.querySelector('.rating-slider');
          slider.setAttribute('data-for', 'rating_' + employeeId + '_' + ratingId);

          var hiddenInput = newRatingItem.querySelector('.rating-input');
          hiddenInput.name = 'rating_' + employeeId + '_' + ratingId;

          var commentTextarea = newRatingItem.querySelector('.comment-textarea');
          commentTextarea.name = 'comment_' + employeeId + '_' + ratingId;

          ratingItemsContainer.insertBefore(newRatingItem, overallCommentSection);
        }
      });

      evaluationForm.appendChild(employeeItem);
    });
  }

  function updateEmployeeStatus(employeeItem) {
    if (!employeeItem) return;
    var statusElement = employeeItem.querySelector('.evaluation-status');
    if (!statusElement) return;

    var hasRatingOrComment = false;
    var sliders = employeeItem.querySelectorAll('.rating-slider');
    var textareas = employeeItem.querySelectorAll('textarea');

    sliders.forEach(function (slider) {
      if (parseFloat(slider.value) > 0) hasRatingOrComment = true;
    });
    textareas.forEach(function (textarea) {
      if (textarea.value && textarea.value.trim() !== '') hasRatingOrComment = true;
    });

    if (hasRatingOrComment) {
      statusElement.className = 'evaluation-status text-sm px-2 py-1 rounded-full bg-green-100 text-green-600';
      statusElement.textContent = '已评价';
    } else {
      statusElement.className = 'evaluation-status text-sm px-2 py-1 rounded-full bg-neutral-100 text-neutral-500';
      statusElement.textContent = '未评价';
    }
  }

  function renderFilterButtons() {
    var filterContainer = document.querySelector('.filter-container .flex');
    if (!filterContainer) return;

    var departments = State.getDepartments();
    var existingBtns = filterContainer.querySelectorAll('.filter-btn');
    existingBtns.forEach(function (btn) { btn.remove(); });

    var allBtn = document.createElement('button');
    allBtn.className = 'filter-btn px-3 py-1 rounded-full bg-primary text-white text-sm';
    allBtn.textContent = '全部';
    filterContainer.appendChild(allBtn);

    departments.forEach(function (dept) {
      var btn = document.createElement('button');
      btn.className = 'filter-btn px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-sm transition-colors';
      // 处理部门数据格式：可能是字符串或对象
      btn.textContent = typeof dept === 'string' ? dept : dept.name;
      filterContainer.appendChild(btn);
    });
  }

  function updateSubmitButton() {
    var submitAllBtn = document.getElementById('submitAllBtn');
    if (!submitAllBtn) return;

    if (State.hasAnyRatingOrComment()) {
      submitAllBtn.classList.remove('btn-disabled');
      submitAllBtn.classList.add('btn-primary');
      submitAllBtn.disabled = false;
    } else {
      submitAllBtn.classList.remove('btn-primary');
      submitAllBtn.classList.add('btn-disabled');
      submitAllBtn.disabled = true;
    }
  }

  function resetEmployeeEvaluation(employeeItem) {
    var sliders = employeeItem.querySelectorAll('.rating-slider');
    sliders.forEach(function (slider) {
      slider.value = '0';
      var valueDisplay = slider.nextElementSibling;
      var hiddenInput = slider.parentElement ? slider.parentElement.querySelector('.rating-input') : null;
      if (valueDisplay) valueDisplay.textContent = '未评分';
      if (hiddenInput) hiddenInput.value = '';
    });

    var textareas = employeeItem.querySelectorAll('textarea');
    textareas.forEach(function (textarea) {
      textarea.value = '';
      textarea.classList.remove('field-error');
    });

    var errorMessages = employeeItem.querySelectorAll('.error-message');
    errorMessages.forEach(function (error) { error.classList.add('hidden'); });

    var requiredIndicators = employeeItem.querySelectorAll('.comment-required, .overall-comment-required');
    requiredIndicators.forEach(function (indicator) { indicator.classList.add('hidden'); });

    updateEmployeeStatus(employeeItem);
    var statusElement = employeeItem.querySelector('.evaluation-status');
    if (statusElement) {
      statusElement.className = 'evaluation-status text-sm px-2 py-1 rounded-full bg-neutral-100 text-neutral-500';
      statusElement.textContent = '未评价';
    }
  }

  function showLoading() {
    var indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.classList.remove('hidden');
  }

  function hideLoading() {
    var indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.classList.add('hidden');
  }

  function renderPagination() {
    var container = document.getElementById('paginationContainer');
    if (!container) return;

    var pagination = State.getPagination();
    container.innerHTML = '';

    var info = document.createElement('div');
    info.className = 'text-sm text-neutral-500';
    info.textContent = '共 ' + pagination.total + ' 名员工，当前第 ' + pagination.currentPage + ' 页，共 ' + pagination.totalPages + ' 页';
    container.appendChild(info);

    var controls = document.createElement('div');
    controls.className = 'flex items-center space-x-2 mt-2';

    var prevBtn = createPaginationButton('上一页', pagination.currentPage === 1);
    prevBtn.addEventListener('click', function () {
      if (pagination.currentPage > 1) {
        Events.loadPage(pagination.currentPage - 1);
      }
    });
    controls.appendChild(prevBtn);

    var startPage = Math.max(1, pagination.currentPage - 2);
    var endPage = Math.min(pagination.totalPages, startPage + 4);

    if (startPage > 1) {
      var firstBtn = createPaginationButton('1', false);
      firstBtn.addEventListener('click', function () {
        Events.loadPage(1);
      });
      controls.appendChild(firstBtn);

      if (startPage > 2) {
        var ellipsis1 = document.createElement('span');
        ellipsis1.className = 'px-2 text-neutral-500';
        ellipsis1.textContent = '...';
        controls.appendChild(ellipsis1);
      }
    }

    for (var i = startPage; i <= endPage; i++) {
      var pageBtn = createPaginationButton(i.toString(), false, i === pagination.currentPage);
      pageBtn.addEventListener('click', function (page) {
        Events.loadPage(page);
      }.bind(null, i));
      controls.appendChild(pageBtn);
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        var ellipsis2 = document.createElement('span');
        ellipsis2.className = 'px-2 text-neutral-500';
        ellipsis2.textContent = '...';
        controls.appendChild(ellipsis2);
      }

      var lastBtn = createPaginationButton(pagination.totalPages.toString(), false);
      lastBtn.addEventListener('click', function () {
        Events.loadPage(pagination.totalPages);
      });
      controls.appendChild(lastBtn);
    }

    var nextBtn = createPaginationButton('下一页', pagination.currentPage === pagination.totalPages);
    nextBtn.addEventListener('click', function () {
      if (pagination.currentPage < pagination.totalPages) {
        Events.loadPage(pagination.currentPage + 1);
      }
    });
    controls.appendChild(nextBtn);

    container.appendChild(controls);
  }

  function createPaginationButton(text, disabled, active) {
    var btn = document.createElement('button');
    btn.className = 'px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
    
    if (active) {
      btn.classList.add('bg-primary', 'text-white', 'border-primary');
    }
    
    if (disabled) {
      btn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    }
    
    btn.textContent = text;
    btn.disabled = disabled;
    return btn;
  }

  return {
    renderEvaluationList: renderEvaluationList,
    updateEmployeeStatus: updateEmployeeStatus,
    renderFilterButtons: renderFilterButtons,
    updateSubmitButton: updateSubmitButton,
    resetEmployeeEvaluation: resetEmployeeEvaluation,
    showLoading: showLoading,
    hideLoading: hideLoading,
    renderPagination: renderPagination,
  };
})();
