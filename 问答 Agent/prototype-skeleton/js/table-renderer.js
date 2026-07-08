/** 表格渲染 — 按 spec.columns / rowActions */
(function (global) {
  'use strict';

  function statusBadge(spec, value) {
    var map = spec.statusLabels || {};
    var item = map[value];
    if (item) {
      return '<span class="badge ' + (item.class || 'badge-secondary') + '">' +
        SkelUtils.escapeHtml(item.label) + '</span>';
    }
    return SkelUtils.escapeHtml(value == null ? '-' : value);
  }

  function renderCell(spec, col, row) {
    var val = SkelUtils.getByPath(row, col.field);
    if (col.type === 'status') return statusBadge(spec, val);
    if (col.type === 'datetime') return SkelUtils.escapeHtml(SkelUtils.formatDateTime(val));
    if (col.render === 'html' && col.template) {
      return col.template.replace(/\{\{(\w+)\}\}/g, function (_, key) {
        return SkelUtils.escapeHtml(row[key]);
      });
    }
    return SkelUtils.escapeHtml(val == null ? '-' : val);
  }

  function actionButtons(spec, row) {
    var actions = spec.rowActions || [];
    return actions.map(function (action) {
      if (action === 'edit') {
        return '<button type="button" class="action-btn action-btn-edit" data-action="edit" data-id="' +
          SkelUtils.escapeHtml(row.id) + '" title="编辑"><i class="fas fa-edit"></i></button>';
      }
      if (action === 'delete') {
        return '<button type="button" class="action-btn action-btn-delete" data-action="delete" data-id="' +
          SkelUtils.escapeHtml(row.id) + '" title="删除"><i class="fas fa-trash"></i></button>';
      }
      if (action === 'view') {
        return '<button type="button" class="action-btn action-btn-view" data-action="view" data-id="' +
          SkelUtils.escapeHtml(row.id) + '" title="查看"><i class="fas fa-eye"></i></button>';
      }
      return '';
    }).join('');
  }

  function renderTable(spec, rows) {
    var tbody = document.getElementById('skel-table-body');
    var empty = document.getElementById('skel-empty');
    var total = document.getElementById('skel-total-count');
    if (!tbody) return;

    if (total) total.textContent = String(rows.length);

    if (!rows.length) {
      tbody.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');
    var hasActions = spec.rowActions && spec.rowActions.length;

    tbody.innerHTML = rows.map(function (row) {
      var cells = (spec.columns || []).map(function (col) {
        return '<td>' + renderCell(spec, col, row) + '</td>';
      }).join('');
      var actions = hasActions
        ? '<td><div class="action-buttons">' + actionButtons(spec, row) + '</div></td>'
        : '';
      return '<tr>' + cells + actions + '</tr>';
    }).join('');
  }

  global.SkelTable = {
    render: renderTable,
    statusBadge: statusBadge,
  };
})(window);
