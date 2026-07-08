/** 入口 — 读取 module-config.js 中的 MODULE_SPEC */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var spec = globalThis.MODULE_SPEC;
    if (!spec) {
      console.error('[prototype-skeleton] MODULE_SPEC 未定义，请加载 js/module-config.js');
      return;
    }
    SkelListPage.init(spec).catch(function (err) {
      console.error('[prototype-skeleton] 初始化失败', err);
      SkelUtils.showToast('页面初始化失败', 'error');
    });
  });
})();
