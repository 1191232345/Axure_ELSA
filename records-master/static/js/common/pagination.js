window.CommonPagination = (function () {
  function render(containerId, currentPage, totalPages, onPageChange, options) {
    options = options || {};
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    var info = document.createElement('div');
    info.className = options.infoClass || 'text-sm text-neutral-500';
    info.textContent = '第 ' + currentPage + ' 页，共 ' + totalPages + ' 页';
    container.appendChild(info);

    var controls = document.createElement('div');
    controls.className = options.controlsClass || 'flex items-center space-x-1';

    var prevBtn = createButton('上一页', currentPage === 1, options.buttonClass, options.disabledClass);
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1 && onPageChange) {
        onPageChange(currentPage - 1);
      }
    });
    controls.appendChild(prevBtn);

    var startPage = Math.max(1, currentPage - 1);
    var endPage = Math.min(totalPages, startPage + 2);

    if (startPage > 1) {
      var firstBtn = createButton('1', false, options.buttonClass);
      firstBtn.addEventListener('click', function () {
        if (onPageChange) onPageChange(1);
      });
      controls.appendChild(firstBtn);

      if (startPage > 2) {
        var ellipsis1 = createEllipsis(options.ellipsisClass);
        controls.appendChild(ellipsis1);
      }
    }

    for (var i = startPage; i <= endPage; i++) {
      var pageBtn = createButton(i.toString(), false, options.buttonClass, options.disabledClass, i === currentPage);
      pageBtn.addEventListener('click', function (page) {
        if (onPageChange) onPageChange(page);
      }.bind(null, i));
      controls.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        var ellipsis2 = createEllipsis(options.ellipsisClass);
        controls.appendChild(ellipsis2);
      }

      var lastBtn = createButton(totalPages.toString(), false, options.buttonClass);
      lastBtn.addEventListener('click', function () {
        if (onPageChange) onPageChange(totalPages);
      });
      controls.appendChild(lastBtn);
    }

    var nextBtn = createButton('下一页', currentPage === totalPages, options.buttonClass, options.disabledClass);
    nextBtn.addEventListener('click', function () {
      if (currentPage < totalPages && onPageChange) {
        onPageChange(currentPage + 1);
      }
    });
    controls.appendChild(nextBtn);

    container.appendChild(controls);
  }

  function createButton(text, disabled, buttonClass, disabledClass, active) {
    var btn = document.createElement('button');
    btn.className = buttonClass || 'px-3 py-1 border border-neutral-300 rounded text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';
    
    if (active) {
      btn.classList.add('bg-primary', 'text-white', 'border-primary');
    }
    
    if (disabled) {
      btn.classList.add(disabledClass || 'opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    }
    
    btn.textContent = text;
    btn.disabled = disabled;
    return btn;
  }

  function createEllipsis(ellipsisClass) {
    var span = document.createElement('span');
    span.className = ellipsisClass || 'px-2 text-neutral-500';
    span.textContent = '...';
    return span;
  }

  function calculateTotalPages(totalItems, pageSize) {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }

  function getPagedItems(items, currentPage, pageSize) {
    var keys = Object.keys(items);
    var start = (currentPage - 1) * pageSize;
    var end = start + pageSize;
    var pagedKeys = keys.slice(start, end);
    var result = {};
    pagedKeys.forEach(function (key) {
      result[key] = items[key];
    });
    return result;
  }

  return {
    render: render,
    calculateTotalPages: calculateTotalPages,
    getPagedItems: getPagedItems,
  };
})();