window.UI = (function () {
  var DURATION = AppConfig.toast.duration;
  var TRANSITION = AppConfig.dialog.transitionDuration;

  function showToast(message, type) {
    CommonToast.show(message, type, { duration: DURATION, transition: TRANSITION });
  }

  function showRatingDescriptionDialog(title, description) {
    CommonModal.alert(title, description, {
      buttonText: '我知道了',
      transition: TRANSITION,
      contentClass: 'bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100'
    });
  }

  function showConfirmDialog(message, onConfirm, onCancel, options) {
    options = options || {};
    
    var modalOptions = {
      transition: TRANSITION,
      contentClass: 'bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100',
      confirmText: '确认',
      cancelText: '取消'
    };

    if (options.type === 'submit-evaluation') {
      modalOptions.showInput = true;
      modalOptions.inputLabel = '评价人姓名';
      modalOptions.inputRequired = true;
      modalOptions.inputPlaceholder = '请输入您的姓名';
      modalOptions.inputErrorText = '评价人姓名不能为空';
    }

    CommonModal.confirm('确认操作', message, onConfirm, onCancel, modalOptions);
  }

  return {
    showToast: showToast,
    showRatingDescriptionDialog: showRatingDescriptionDialog,
    showConfirmDialog: showConfirmDialog,
  };
})();