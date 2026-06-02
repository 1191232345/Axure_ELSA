window.CommonToast = (function () {
  var defaultDuration = 3000;
  var defaultTransition = 300;

  var colorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  function show(message, type, options) {
    type = type || 'info';
    options = options || {};
    var duration = options.duration || defaultDuration;
    var transition = options.transition || defaultTransition;

    var existing = document.querySelector('.common-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'common-toast fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out transform translate-y-0 opacity-90 ' + (colorMap[type] || colorMap.info);
    toast.innerHTML = '<div class="flex items-center justify-between"><span>' + message + '</span><button class="ml-2 text-white opacity-70 hover:opacity-100"><i class="fa fa-times"></i></button></div>';

    document.body.appendChild(toast);

    toast.querySelector('button').addEventListener('click', function () {
      dismiss(toast, transition);
    });

    setTimeout(function () {
      dismiss(toast, transition);
    }, duration);
  }

  function dismiss(toast, transition) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('opacity-0', 'translate-y-[-20px]');
    setTimeout(function () { toast.remove(); }, transition);
  }

  function success(message, options) {
    show(message, 'success', options);
  }

  function error(message, options) {
    show(message, 'error', options);
  }

  function warning(message, options) {
    show(message, 'warning', options);
  }

  function info(message, options) {
    show(message, 'info', options);
  }

  return {
    show: show,
    success: success,
    error: error,
    warning: warning,
    info: info,
    dismiss: dismiss,
  };
})();