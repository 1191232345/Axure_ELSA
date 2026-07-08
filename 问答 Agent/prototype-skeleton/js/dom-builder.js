/** 根据 module.spec 构建筛选区、表头、表单 */
(function (global) {
  'use strict';

  function optionHtml(options) {
    return (options || []).map(function (opt) {
      return '<option value="' + SkelUtils.escapeHtml(opt.value) + '">' +
        SkelUtils.escapeHtml(opt.label) + '</option>';
    }).join('');
  }

  function buildFilterPanel(spec) {
    var host = document.getElementById('skel-filter-host');
    if (!host || !spec.filters || !spec.filters.length) {
      if (host) host.innerHTML = '';
      return;
    }

    var fields = spec.filters.map(function (f) {
      var control = '';
      if (f.type === 'select') {
        control = '<select id="' + f.id + '" class="skel-input">' + optionHtml(f.options) + '</select>';
      } else {
        control = '<input type="text" id="' + f.id + '" class="skel-input" placeholder="' +
          SkelUtils.escapeHtml(f.placeholder || '') + '">';
      }
      return '<div><label class="skel-label">' + SkelUtils.escapeHtml(f.label) +
        '</label>' + control + '</div>';
    }).join('');

    host.innerHTML =
      '<div class="skel-card p-6 mb-6">' +
      '<h3 class="text-lg font-semibold text-primary mb-4">' +
      '<i class="fas fa-filter mr-2" style="color:#E8A838"></i>筛选条件</h3>' +
      '<div class="skel-filter-grid">' + fields + '</div>' +
      '<div class="mt-4 flex justify-end gap-2">' +
      '<button type="button" id="skel-reset-btn" class="btn btn-secondary btn-sm">' +
      '<i class="fas fa-redo mr-1"></i>重置</button>' +
      '<button type="button" id="skel-search-btn" class="btn btn-primary btn-sm">' +
      '<i class="fas fa-search mr-1"></i>查询</button>' +
      '</div></div>';
  }

  function resolveBtnClass(btn) {
    var variant = btn.variant;
    if (!variant) {
      if (btn.action === 'create') variant = 'primary';
      else variant = 'secondary';
    }
    var map = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'btn-danger',
      purple: 'btn-purple',
      accent: 'btn-accent',
      success: 'btn-success',
      warning: 'btn-warning',
    };
    return 'btn ' + (map[variant] || 'btn-secondary') + ' btn-sm';
  }

  function buildToolbar(spec) {
    var host = document.getElementById('skel-toolbar-host');
    if (!host) return;
    var buttons = (spec.toolbarButtons || []).map(function (btn) {
      return '<button type="button" id="' + btn.id + '" class="' + resolveBtnClass(btn) + '">' +
        '<i class="fas ' + (btn.icon || 'fa-plus') + ' mr-1"></i>' +
        SkelUtils.escapeHtml(btn.label) + '</button>';
    }).join('');
    host.innerHTML = buttons
      ? '<div class="skel-card p-4 mb-4 flex gap-3">' + buttons + '</div>'
      : '';
  }

  function buildTableHead(spec) {
    var thead = document.getElementById('skel-table-head');
    if (!thead) return;
    var cols = (spec.columns || []).map(function (c) {
      return '<th>' + SkelUtils.escapeHtml(c.label) + '</th>';
    }).join('');
    var actionCol = (spec.rowActions && spec.rowActions.length)
      ? '<th>操作</th>' : '';
    thead.innerHTML = '<tr>' + cols + actionCol + '</tr>';
  }

  function buildFormFields(spec) {
    var host = document.getElementById('skel-form-fields');
    if (!host) return;
    host.innerHTML = (spec.formFields || []).map(function (f) {
      var req = f.required ? '<span style="color:#C44536">*</span> ' : '';
      var control = '';
      if (f.type === 'select') {
        control = '<select id="' + f.id + '" class="skel-input" data-field="' + f.field + '">' +
          optionHtml(f.options) + '</select>';
      } else {
        control = '<input type="text" id="' + f.id + '" class="skel-input" data-field="' +
          f.field + '" placeholder="' + SkelUtils.escapeHtml(f.placeholder || '') + '">';
      }
      return '<div class="mb-4"><label class="skel-label">' + req +
        SkelUtils.escapeHtml(f.label) + '</label>' + control +
        '<p id="' + f.id + '-error" class="skel-field-error hidden"></p></div>';
    }).join('');
  }

  function applyChrome(spec) {
    document.title = spec.moduleName + ' - ELSA';
    var titleEl = document.getElementById('skel-module-title');
    if (titleEl) titleEl.textContent = 'ELSA · ' + spec.moduleName;
    var crumb = document.getElementById('skel-breadcrumb');
    if (crumb && spec.breadcrumb) crumb.textContent = spec.breadcrumb;
  }

  global.SkelDomBuilder = {
    applyChrome: applyChrome,
    buildFilterPanel: buildFilterPanel,
    buildToolbar: buildToolbar,
    buildTableHead: buildTableHead,
    buildFormFields: buildFormFields,
    mountAll: function (spec) {
      applyChrome(spec);
      buildFilterPanel(spec);
      buildToolbar(spec);
      buildTableHead(spec);
      buildFormFields(spec);
    },
  };
})(window);
