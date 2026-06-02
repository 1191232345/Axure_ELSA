window.AdminUI = (function () {
  function showNotification(title, message, type) {
    var notification = document.getElementById('notification');
    var icon = document.getElementById('notificationIcon');
    var titleEl = document.getElementById('notificationTitle');
    var msgEl = document.getElementById('notificationMessage');

    if (!notification) {
      CommonToast.show(title + ': ' + message, type);
      return;
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    icon.className = 'mr-3 text-xl';
    if (type === 'error') {
      icon.classList.add('text-danger');
      icon.innerHTML = '<i class="fa fa-times-circle"></i>';
    } else if (type === 'warning') {
      icon.classList.add('text-secondary');
      icon.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
    } else {
      icon.classList.add('text-success');
      icon.innerHTML = '<i class="fa fa-check-circle"></i>';
    }

    notification.classList.remove('translate-x-full');

    setTimeout(function () {
      hideNotification();
    }, AdminConfig.toast.duration);
  }

  function hideNotification() {
    var notification = document.getElementById('notification');
    if (notification) {
      notification.classList.add('translate-x-full');
    }
  }

  function showModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function hideModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  function hideAllModals() {
    var modals = document.querySelectorAll('.fixed.inset-0.bg-black\\/50');
    modals.forEach(function (modal) {
      modal.classList.add('hidden');
    });
  }

  function hideErrors(form) {
    var errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(function (err) {
      err.classList.add('hidden');
    });
    var inputs = form.querySelectorAll('.field-error');
    inputs.forEach(function (input) {
      input.classList.remove('field-error');
    });
  }

  function showFieldError(input, message) {
    input.classList.add('field-error');
    var errorEl = input.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  function confirm(message, onConfirm, onCancel) {
    CommonModal.confirm('确认操作', message, onConfirm, onCancel, {
      confirmText: '确认',
      cancelText: '取消'
    });
  }

  return {
    showNotification: showNotification,
    hideNotification: hideNotification,
    showModal: showModal,
    hideModal: hideModal,
    hideAllModals: hideAllModals,
    hideErrors: hideErrors,
    showFieldError: showFieldError,
    confirm: confirm,
  };
})();