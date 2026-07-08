/** 列表页编排 — 连接 store / filter / table / form */
(function (global) {
  'use strict';

  function findToolbarLogic(spec, label) {
    var rows = (spec.logicDocs && spec.logicDocs.buttons) || [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === label && rows[i][1] === '工具栏') {
        return rows[i][3] || rows[i][2] || '原型演示';
      }
    }
    return '原型演示：' + label;
  }

  function bindToolbarButton(spec, btn) {
    var el = document.getElementById(btn.id);
    if (!el) return;
    var action = btn.action || 'custom';
    if (action === 'create') {
      el.addEventListener('click', function () { SkelForm.openCreate(spec); });
      return;
    }
    var logic = findToolbarLogic(spec, btn.label);
    if (action === 'export') {
      el.addEventListener('click', function () {
        var count = ListPage.filtered.length;
        SkelUtils.showToast('导出：' + logic + '（当前 ' + count + ' 条，原型演示）', 'success');
      });
      return;
    }
    if (action === 'import') {
      el.addEventListener('click', function () {
        SkelUtils.showToast('导入：' + logic + '（原型演示）', 'success');
      });
      return;
    }
    el.addEventListener('click', function () {
      SkelUtils.showToast(btn.label + '：' + logic + '（原型演示）', 'success');
    });
  }

  var ListPage = {
    spec: null,
    filtered: [],

    init: function (spec) {
      this.spec = spec;
      SkelDomBuilder.mountAll(spec);
      return SkelStore.init(spec).then(function () {
        ListPage.bindEvents();
        SkelLogic.init(spec);
        SkelChangelog.init(spec);
        ListPage.refresh();
      });
    },

    bindEvents: function () {
      var spec = this.spec;
      var searchBtn = document.getElementById('skel-search-btn');
      var resetBtn = document.getElementById('skel-reset-btn');
      if (searchBtn) searchBtn.addEventListener('click', function () { ListPage.refresh(); });
      if (resetBtn) resetBtn.addEventListener('click', function () {
        SkelFilter.reset(spec);
        ListPage.refresh();
      });

      (spec.toolbarButtons || []).forEach(function (btn) {
        bindToolbarButton(spec, btn);
      });

      var saveBtn = document.getElementById('skel-save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () {
          SkelForm.save(spec, function () { ListPage.refresh(); });
        });
      }

      var delBtn = document.getElementById('skel-confirm-delete');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          SkelForm.executeDelete(function () { ListPage.refresh(); });
        });
      }

      var tbody = document.getElementById('skel-table-body');
      if (tbody) {
        tbody.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-action]');
          if (!btn) return;
          var id = btn.getAttribute('data-id');
          var action = btn.getAttribute('data-action');
          if (action === 'edit') SkelForm.openEdit(spec, id);
          if (action === 'delete') SkelForm.confirmDelete(id);
          if (action === 'view') SkelUtils.showToast('查看详情（原型演示）', 'success');
        });
      }

      var emptyCreate = document.getElementById('skel-empty-create');
      if (emptyCreate) {
        emptyCreate.addEventListener('click', function () { SkelForm.openCreate(spec); });
      }
    },

    refresh: function () {
      this.filtered = SkelFilter.apply(this.spec, SkelStore.all());
      SkelTable.render(this.spec, this.filtered);
    },
  };

  global.SkelListPage = ListPage;
})(window);
