/** 表单弹窗 — 按 spec.formFields */
(function (global) {
  'use strict';

  var state = { editingId: null };

  function readForm(spec) {
    var data = {};
    var valid = true;
    (spec.formFields || []).forEach(function (f) {
      var el = document.getElementById(f.id);
      var err = document.getElementById(f.id + '-error');
      if (!el) return;
      var val = el.value.trim();
      if (f.required && !val) {
        valid = false;
        if (err) {
          err.textContent = f.label + '不能为空';
          err.classList.remove('hidden');
        }
      } else if (err) {
        err.classList.add('hidden');
      }
      data[f.field] = f.type === 'select' ? el.value : val;
    });
    return valid ? data : null;
  }

  function fillForm(spec, row) {
    (spec.formFields || []).forEach(function (f) {
      var el = document.getElementById(f.id);
      var err = document.getElementById(f.id + '-error');
      if (!el) return;
      var val = row ? SkelUtils.getByPath(row, f.field) : (f.defaultValue || '');
      el.value = val == null ? '' : val;
      if (err) err.classList.add('hidden');
    });
  }

  function openCreate(spec) {
    state.editingId = null;
    var title = document.getElementById('skel-form-title');
    if (title) title.textContent = '新增' + spec.moduleName;
    fillForm(spec, null);
    SkelUtils.openModal('skel-form-modal');
  }

  function openEdit(spec, id) {
    var row = SkelStore.find(id);
    if (!row) return;
    state.editingId = id;
    var title = document.getElementById('skel-form-title');
    if (title) title.textContent = '编辑' + spec.moduleName;
    fillForm(spec, row);
    SkelUtils.openModal('skel-form-modal');
  }

  function save(spec, onDone) {
    var data = readForm(spec);
    if (!data) return;
    var p = state.editingId
      ? SkelStore.update(state.editingId, data)
      : SkelStore.add(data);
    p.then(function () {
      SkelUtils.closeModal('skel-form-modal');
      SkelUtils.showToast(state.editingId ? '更新成功' : '新增成功', 'success');
      state.editingId = null;
      if (onDone) onDone();
    });
  }

  var pendingDeleteId = null;

  function confirmDelete(id) {
    pendingDeleteId = id;
    SkelUtils.openModal('skel-delete-modal');
  }

  function executeDelete(onDone) {
    if (!pendingDeleteId) return;
    SkelStore.remove(pendingDeleteId).then(function () {
      SkelUtils.closeModal('skel-delete-modal');
      SkelUtils.showToast('删除成功', 'success');
      pendingDeleteId = null;
      if (onDone) onDone();
    });
  }

  global.SkelForm = {
    openCreate: openCreate,
    openEdit: openEdit,
    save: save,
    confirmDelete: confirmDelete,
    executeDelete: executeDelete,
  };
})(window);
