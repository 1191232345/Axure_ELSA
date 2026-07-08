/** 变更公告弹窗 — 对齐规则配置 changelog.js，配置驱动 */
(function (global) {
  'use strict';

  var specRef = null;
  var cfg = null;

  function storageKey() {
    if (cfg && cfg.storageKey) return cfg.storageKey;
    if (specRef && specRef.pageId) return 'skel_changelog_' + specRef.pageId;
    return 'skel_changelog_default';
  }

  function version() {
    return (cfg && cfg.version) || '1.0.0';
  }

  function hasUnviewed() {
    return (localStorage.getItem(storageKey()) || '') !== version();
  }

  function markViewed() {
    localStorage.setItem(storageKey(), version());
  }

  function buildEntry(entry) {
    var rows = (entry.changes || []).map(function (c) {
      return '<tr>' +
        '<td class="font-medium text-gray-800 whitespace-nowrap">' + SkelUtils.escapeHtml(c.item) + '</td>' +
        '<td class="text-gray-500 text-xs">' + SkelUtils.escapeHtml(c.desc || '') + '</td>' +
        '<td class="skel-changelog-before">' + SkelUtils.escapeHtml(c.before || '') + '</td>' +
        '<td class="skel-changelog-after">' + SkelUtils.escapeHtml(c.after || '') + '</td>' +
        '</tr>';
    }).join('');

    return '<div class="skel-changelog-entry">' +
      '<div class="skel-changelog-entry__head">' +
      '<i class="fas ' + (entry.icon || 'fa-bullhorn') + ' ' + (entry.color || 'text-blue-600') + ' mr-2"></i>' +
      '<span class="font-semibold text-gray-800">' + SkelUtils.escapeHtml(entry.version || '') +
      ' ' + SkelUtils.escapeHtml(entry.title || '') + '</span>' +
      '<span class="skel-changelog-entry__date">' + SkelUtils.escapeHtml(entry.date || '') + '</span>' +
      '</div>' +
      '<div class="overflow-x-auto"><table class="skel-changelog-table">' +
      '<thead><tr>' +
      '<th>变更项</th><th>描述</th><th>变更前</th><th>变更后</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function removeModal() {
    var modal = document.getElementById('skel-changelog-modal');
    if (modal) modal.remove();
  }

  function close() {
    var modal = document.getElementById('skel-changelog-modal');
    if (!modal) return;
    var dontShow = document.getElementById('skel-changelog-dont-show');
    if (dontShow && dontShow.checked) markViewed();
    modal.classList.remove('is-visible');
    setTimeout(removeModal, 200);
    document.body.style.overflow = '';
  }

  function open() {
    removeModal();
    var entries = (cfg && cfg.entries) || [];
    if (!entries.length) {
      SkelUtils.showToast('暂无变更公告', 'warning');
      return;
    }

    var modal = document.createElement('div');
    modal.id = 'skel-changelog-modal';
    modal.className = 'skel-overlay skel-overlay-fade';
    modal.style.zIndex = '60';

    modal.innerHTML =
      '<div class="skel-overlay-panel skel-overlay-panel--md">' +
      '<div class="skel-overlay-head skel-overlay-head--accent">' +
      '<div class="skel-overlay-head__title">' +
      '<i class="fas fa-bullhorn" style="color:#E8A838"></i>变更公告' +
      '<span class="text-xs text-gray-400 font-normal ml-2">最近更新</span></div>' +
      '<button type="button" class="skel-overlay-close" id="skel-changelog-close">' +
      '<i class="fas fa-times"></i></button></div>' +
      '<div class="skel-overlay-body">' + entries.map(buildEntry).join('') + '</div>' +
      '<div class="skel-overlay-foot">' +
      '<label class="flex items-center text-sm text-gray-500 cursor-pointer">' +
      '<input type="checkbox" id="skel-changelog-dont-show" class="mr-2">不再自动提醒此版本</label>' +
      '<button type="button" class="btn btn-primary btn-sm" id="skel-changelog-ok">我知道了</button>' +
      '</div></div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () { modal.classList.add('is-visible'); });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    document.getElementById('skel-changelog-close').addEventListener('click', close);
    document.getElementById('skel-changelog-ok').addEventListener('click', close);
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function init(spec) {
    specRef = spec || null;
    cfg = (spec && spec.changelog) || null;
    var autoShow = !cfg || cfg.autoShow !== false;
    if (autoShow && hasUnviewed() && cfg && cfg.entries && cfg.entries.length) {
      setTimeout(open, 600);
    }
  }

  global.SkelChangelog = { init: init, open: open, close: close };
  global.openChangelogModal = open;
  global.closeChangelogModal = close;
})(window);
