window.Validator = (function () {
  var LOW_SCORE_THRESHOLD = AppConfig.rating.lowScoreThreshold;

  function handleLowScoreRequired(slider) {
    var ratingValue = parseFloat(slider.value);
    var ratingItem = slider.closest('.rating-item');
    if (!ratingItem) return;

    var commentTextarea = ratingItem.querySelector('.comment-textarea');
    var requiredIndicator = ratingItem.querySelector('.comment-required');
    var errorMessage = ratingItem.querySelector('.comment-error');

    if (ratingValue === 0 || (ratingValue > 0 && ratingValue < LOW_SCORE_THRESHOLD)) {
      if (requiredIndicator) requiredIndicator.classList.remove('hidden');
      if (commentTextarea) validateCommentField(commentTextarea);
    } else {
      if (requiredIndicator) requiredIndicator.classList.add('hidden');
      if (errorMessage) errorMessage.classList.add('hidden');
      if (commentTextarea) commentTextarea.classList.remove('field-error');
    }

    var employeeItem = slider.closest('.evaluation-item');
    if (employeeItem) checkOverallCommentRequired(employeeItem);
  }

  function checkOverallCommentRequired(employeeItem) {
    if (!employeeItem) return;

    var sliders = employeeItem.querySelectorAll('.rating-slider');
    var hasLowScore = false;

    sliders.forEach(function (slider) {
      var val = parseFloat(slider.value);
      if (val === 0 || (val > 0 && val < LOW_SCORE_THRESHOLD)) {
        hasLowScore = true;
      }
    });

    var overallComment = employeeItem.querySelector('.overall-comment');
    var requiredIndicator = employeeItem.querySelector('.overall-comment-required');
    var errorElement = employeeItem.querySelector('.overall-comment-error');

    if (hasLowScore) {
      if (requiredIndicator) requiredIndicator.classList.remove('hidden');
      if (overallComment) validateOverallComment(overallComment);
    } else {
      if (requiredIndicator) requiredIndicator.classList.add('hidden');
      if (errorElement) errorElement.classList.add('hidden');
      if (overallComment) overallComment.classList.remove('field-error');
    }
  }

  function validateCommentField(textarea) {
    if (!textarea) return true;

    var ratingItem = textarea.closest('.rating-item');
    if (!ratingItem) return true;

    var errorMessage = ratingItem.querySelector('.comment-error');
    var requiredIndicator = ratingItem.querySelector('.comment-required');
    var isRequired = requiredIndicator && !requiredIndicator.classList.contains('hidden');

    if (isRequired && (!textarea.value || textarea.value.trim() === '')) {
      textarea.classList.add('field-error');
      if (errorMessage) errorMessage.classList.remove('hidden');
      return false;
    } else {
      textarea.classList.remove('field-error');
      if (errorMessage) errorMessage.classList.add('hidden');
      return true;
    }
  }

  function validateOverallComment(textarea) {
    if (!textarea) return true;

    var employeeItem = textarea.closest('.evaluation-item');
    if (!employeeItem) return true;

    var errorMessage = employeeItem.querySelector('.overall-comment-error');
    var requiredIndicator = employeeItem.querySelector('.overall-comment-required');
    var isRequired = requiredIndicator && !requiredIndicator.classList.contains('hidden');

    if (isRequired && (!textarea.value || textarea.value.trim() === '')) {
      textarea.classList.add('field-error');
      if (errorMessage) errorMessage.classList.remove('hidden');
      return false;
    } else {
      textarea.classList.remove('field-error');
      if (errorMessage) errorMessage.classList.add('hidden');
      return true;
    }
  }

  return {
    handleLowScoreRequired: handleLowScoreRequired,
    checkOverallCommentRequired: checkOverallCommentRequired,
    validateCommentField: validateCommentField,
    validateOverallComment: validateOverallComment,
  };
})();
