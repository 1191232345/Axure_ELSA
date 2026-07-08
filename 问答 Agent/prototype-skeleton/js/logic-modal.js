/** 逻辑说明弹窗 — 对齐规则配置 openLogicModal 交互 */
(function (global) {
  'use strict';

  var specRef = null;

  function open() {
    var modal = document.getElementById('skel-logic-modal');
    var content = document.getElementById('skel-logic-modal-content');
    if (!modal || !content) return;

    if (specRef && specRef.logicDocsHtml) {
      content.innerHTML = specRef.logicDocsHtml;
    }

    var title = document.getElementById('skel-logic-modal-title');
    if (title && specRef) {
      title.textContent = specRef.moduleName + ' - 逻辑说明';
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    var modal = document.getElementById('skel-logic-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function switchTab(button) {
    var group = button.getAttribute('data-group');
    var tab = button.getAttribute('data-tab');
    if (!group || !tab) return;

    document.querySelectorAll('.skel-logic-tab[data-group="' + group + '"]').forEach(function (el) {
      el.classList.remove('is-active');
    });
    button.classList.add('is-active');

    document.querySelectorAll('.skel-logic-panel[data-group="' + group + '"]').forEach(function (panel) {
      panel.classList.add('hidden');
    });
    var target = document.querySelector(
      '.skel-logic-panel[data-group="' + group + '"][data-panel="' + tab + '"]',
    );
    if (target) target.classList.remove('hidden');
  }

  function bindOverlay() {
    var modal = document.getElementById('skel-logic-modal');
    if (!modal) return;
    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    modal.addEventListener('click', function (e) {
      var tabBtn = e.target.closest('.skel-logic-tab');
      if (tabBtn) switchTab(tabBtn);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) close();
    });
  }

  function init(spec) {
    specRef = spec || null;
    bindOverlay();
  }

  global.SkelLogic = {
    init: init,
    open: open,
    close: close,
    switchTab: switchTab,
  };
  global.openLogicModal = open;
  global.closeLogicModal = close;
  global.switchLogicTab = switchTab;
})(window);
