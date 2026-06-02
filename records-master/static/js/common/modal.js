window.CommonModal = (function () {
  var defaultTransition = 300;

  function createOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'common-modal-overlay fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-opacity duration-300 opacity-100';
    return overlay;
  }

  function createContent(className) {
    var content = document.createElement('div');
    content.className = (className || 'bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4') + ' transform transition-all duration-300 scale-100';
    return content;
  }

  function close(overlay, content, callback, transition) {
    transition = transition || defaultTransition;
    overlay.classList.add('opacity-0');
    content.classList.add('scale-95');
    setTimeout(function () {
      overlay.remove();
      if (callback) callback();
    }, transition);
  }

  function alert(title, message, options) {
    options = options || {};
    var existing = document.querySelector('.common-modal-overlay');
    if (existing) existing.remove();

    var overlay = createOverlay();
    var content = createContent(options.contentClass);

    content.innerHTML = 
      '<h3 class="text-lg font-bold text-neutral-800 mb-3">' + title + '</h3>' +
      '<div class="text-neutral-600 mb-5 p-4 bg-neutral-50 rounded-lg">' + message + '</div>' +
      '<div class="flex justify-center"><button class="common-modal-close-btn px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">' + (options.buttonText || '我知道了') + '</button></div>';

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    var transition = options.transition || defaultTransition;

    content.querySelector('.common-modal-close-btn').addEventListener('click', function () {
      close(overlay, content, options.onClose, transition);
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        close(overlay, content, options.onClose, transition);
      }
    });
  }

  function confirm(title, message, onConfirm, onCancel, options) {
    options = options || {};
    var existing = document.querySelector('.common-modal-overlay');
    if (existing) existing.remove();

    var overlay = createOverlay();
    var content = createContent(options.contentClass);

    var html = 
      '<h3 class="text-lg font-bold text-neutral-800 mb-3">' + (title || '确认操作') + '</h3>' +
      '<p class="text-neutral-600 mb-4">' + message + '</p>';

    if (options.showInput) {
      html += '<div class="mb-4">' +
        '<label for="commonModalInput" class="block text-sm font-medium text-neutral-700 mb-1">' + options.inputLabel + (options.inputRequired ? ' <span class="text-danger">*</span>' : '') + '</label>' +
        '<input type="text" id="commonModalInput" placeholder="' + (options.inputPlaceholder || '') + '" class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">' +
        '<p id="commonModalInputError" class="text-danger text-xs mt-1 hidden">' + (options.inputErrorText || '此项不能为空') + '</p>' +
        '</div>';
    }

    html += '<div class="flex justify-end space-x-3">' +
      '<button class="common-modal-cancel-btn px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg transition-colors">' + (options.cancelText || '取消') + '</button>' +
      '<button class="common-modal-confirm-btn px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">' + (options.confirmText || '确认') + '</button>' +
      '</div>';

    content.innerHTML = html;
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    var transition = options.transition || defaultTransition;
    var inputEl = content.querySelector('#commonModalInput');
    var errorEl = content.querySelector('#commonModalInputError');

    if (inputEl) {
      inputEl.addEventListener('input', function () {
        if (this.value.trim()) {
          this.classList.remove('border-danger');
          if (errorEl) errorEl.classList.add('hidden');
        }
      });
    }

    content.querySelector('.common-modal-cancel-btn').addEventListener('click', function () {
      close(overlay, content, onCancel, transition);
    });

    content.querySelector('.common-modal-confirm-btn').addEventListener('click', function () {
      if (options.showInput && options.inputRequired) {
        if (!inputEl.value.trim()) {
          inputEl.classList.add('border-danger');
          if (errorEl) errorEl.classList.remove('hidden');
          return;
        }
      }

      var inputValue = inputEl ? inputEl.value.trim() : '';
      close(overlay, content, function () {
        if (onConfirm) onConfirm(inputValue);
      }, transition);
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        close(overlay, content, onCancel, transition);
      }
    });
  }

  function custom(html, options) {
    options = options || {};
    var existing = document.querySelector('.common-modal-overlay');
    if (existing) existing.remove();

    var overlay = createOverlay();
    var content = createContent(options.contentClass);
    content.innerHTML = html;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    var transition = options.transition || defaultTransition;

    return {
      overlay: overlay,
      content: content,
      close: function (callback) {
        close(overlay, content, callback, transition);
      },
      find: function (selector) {
        return content.querySelector(selector);
      },
      findAll: function (selector) {
        return content.querySelectorAll(selector);
      },
      on: function (selector, event, handler) {
        var el = content.querySelector(selector);
        if (el) el.addEventListener(event, handler);
      },
      onClickOverlay: function (handler) {
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) handler(e);
        });
      }
    };
  }

  function hideAll() {
    var overlays = document.querySelectorAll('.common-modal-overlay');
    overlays.forEach(function (overlay) {
      overlay.classList.add('opacity-0');
      setTimeout(function () { overlay.remove(); }, defaultTransition);
    });
  }

  return {
    alert: alert,
    confirm: confirm,
    custom: custom,
    hideAll: hideAll,
  };
})();