/** 筛选逻辑 — 按 spec.filters 配置 */
(function (global) {
  'use strict';

  function readFilters(spec) {
    var out = {};
    (spec.filters || []).forEach(function (f) {
      var el = document.getElementById(f.id);
      if (!el) return;
      out[f.id] = {
        field: f.field,
        type: f.type,
        match: f.match || (f.type === 'text' ? 'contains' : 'exact'),
        value: el.value,
      };
    });
    return out;
  }

  function resetFilters(spec) {
    (spec.filters || []).forEach(function (f) {
      var el = document.getElementById(f.id);
      if (!el) return;
      el.value = f.defaultValue != null ? f.defaultValue : '';
    });
  }

  function matchRow(row, filterState) {
    var keys = Object.keys(filterState);
    for (var i = 0; i < keys.length; i++) {
      var f = filterState[keys[i]];
      var raw = SkelUtils.getByPath(row, f.field);
      var val = raw == null ? '' : String(raw);
      var q = f.value == null ? '' : String(f.value).trim();
      if (!q) continue;
      if (f.match === 'contains') {
        if (val.toLowerCase().indexOf(q.toLowerCase()) === -1) return false;
      } else if (val !== q) {
        return false;
      }
    }
    return true;
  }

  function apply(spec, rows) {
    var state = readFilters(spec);
    return rows.filter(function (row) { return matchRow(row, state); });
  }

  global.SkelFilter = {
    read: readFilters,
    reset: resetFilters,
    apply: apply,
  };
})(window);
