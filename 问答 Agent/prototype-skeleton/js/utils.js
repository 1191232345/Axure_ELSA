/** 通用工具 — prototype-skeleton */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function formatDateTime(iso) {
    if (!iso) return '-';
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function showToast(message, type) {
    type = type || 'success';
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 3000);
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.add('is-open');
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.remove('is-open');
  }

  function getByPath(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, obj);
  }

  function isFileProtocol() {
    try {
      return global.location && global.location.protocol === 'file:';
    } catch (e) {
      return false;
    }
  }

  /** file:// 下 fetch 本地文件会被浏览器拦截 */
  function canFetchLocalFiles() {
    return !isFileProtocol();
  }

  global.SkelUtils = {
    escapeHtml: escapeHtml,
    formatDateTime: formatDateTime,
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    getByPath: getByPath,
    isFileProtocol: isFileProtocol,
    canFetchLocalFiles: canFetchLocalFiles,
  };
})(window);
