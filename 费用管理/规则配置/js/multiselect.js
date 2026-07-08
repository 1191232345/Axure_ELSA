// multiselect.js - 下拉多选组件（仓库等）

var MultiSelect = (function() {
  var instances = {};

  function renderTrigger(inst) {
    var labels = inst.selected.map(function(id) {
      var opt = inst.options.find(function(o) { return o.value === id; });
      return opt ? opt.label : id;
    });
    var text = labels.length ? labels.join('、') : (inst.placeholder || '请选择');
    var countBadge = labels.length
      ? '<span class="multiselect-count">' + labels.length + '</span>'
      : '';
    inst.trigger.innerHTML =
      '<span class="multiselect-label' + (labels.length ? '' : ' is-placeholder') + '">' + text + '</span>'
      + '<span class="multiselect-icons">' + countBadge + '<i class="fas fa-chevron-down multiselect-chevron"></i></span>';
  }

  function renderPanel(inst) {
    inst.panel.innerHTML = inst.options.map(function(o) {
      var checked = inst.selected.indexOf(o.value) !== -1;
      return '<label class="multiselect-option' + (checked ? ' is-checked' : '') + '">'
        + '<input type="checkbox" value="' + o.value + '"' + (checked ? ' checked' : '') + '>'
        + '<span>' + o.label + '</span></label>';
    }).join('');

    inst.panel.querySelectorAll('input[type=checkbox]').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var val = cb.value;
        var idx = inst.selected.indexOf(val);
        if (cb.checked && idx === -1) inst.selected.push(val);
        else if (!cb.checked && idx !== -1) inst.selected.splice(idx, 1);
        renderTrigger(inst);
        renderPanel(inst);
        if (typeof inst.onChange === 'function') inst.onChange(inst.selected.slice());
      });
    });
  }

  function closeAll(exceptId) {
    Object.keys(instances).forEach(function(id) {
      if (id !== exceptId) {
        instances[id].panel.classList.add('hidden');
        instances[id].root.classList.remove('is-open');
      }
    });
  }

  function init(containerId, options, settings) {
    settings = settings || {};
    var root = document.getElementById(containerId);
    if (!root) return null;

    root.className = 'multiselect-root';
    root.innerHTML =
      '<button type="button" class="multiselect-trigger form-input"></button>'
      + '<div class="multiselect-panel hidden"></div>';

    var inst = {
      id: containerId,
      root: root,
      trigger: root.querySelector('.multiselect-trigger'),
      panel: root.querySelector('.multiselect-panel'),
      options: options || [],
      selected: (settings.values || []).slice(),
      placeholder: settings.placeholder || '请选择',
      onChange: settings.onChange || null,
    };

    inst.trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var willOpen = inst.panel.classList.contains('hidden');
      closeAll(containerId);
      if (willOpen) {
        inst.panel.classList.remove('hidden');
        root.classList.add('is-open');
      } else {
        inst.panel.classList.add('hidden');
        root.classList.remove('is-open');
      }
    });

    renderTrigger(inst);
    renderPanel(inst);
    instances[containerId] = inst;
    return inst;
  }

  document.addEventListener('click', function() { closeAll(null); });

  return {
    init: init,
    getValues: function(id) {
      var inst = instances[id];
      return inst ? inst.selected.slice() : [];
    },
    setValues: function(id, values) {
      var inst = instances[id];
      if (!inst) return;
      inst.selected = (values || []).slice();
      renderTrigger(inst);
      renderPanel(inst);
    },
    setOptions: function(id, options) {
      var inst = instances[id];
      if (!inst) return;
      inst.options = options || [];
      inst.selected = inst.selected.filter(function(v) {
        return inst.options.some(function(o) { return o.value === v; });
      });
      renderTrigger(inst);
      renderPanel(inst);
    },
  };
})();

window.MultiSelect = MultiSelect;
