# 删除逻辑

删除按钮交互函数，包含单条删除和批量删除。

## 单条删除

```javascript
function handleDelete(id, name) {
    showConfirmDialog({
        title: '确认删除',
        message: '确定要删除 "' + name + '" 吗？此操作不可恢复。',
        type: 'danger',
        confirmText: '删除',
        onConfirm: function() { performDelete(id); }
    });
}

function performDelete(id) {
    showLoading('正在删除...');
    deleteData(id)
        .then(function() {
            refreshDataList();
            showToast('删除成功！', 'success');
        })
        .catch(function(error) {
            showToast('删除失败：' + error.message, 'error');
        })
        .finally(function() { hideLoading(); });
}
```

## 批量删除

```javascript
function handleBatchDelete() {
    var selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
        showToast('请先选择要删除的数据', 'warning');
        return;
    }
    showConfirmDialog({
        title: '批量删除确认',
        message: '确定要删除选中的 ' + selectedIds.length + ' 条数据吗？',
        type: 'danger',
        confirmText: '删除',
        onConfirm: function() { performBatchDelete(selectedIds); }
    });
}

function getSelectedIds() {
    var checkboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkboxes).map(function(cb) { return cb.dataset.id; });
}

function performBatchDelete(ids) {
    showLoading('正在批量删除...');
    batchDeleteData(ids)
        .then(function() {
            refreshDataList();
            showToast('批量删除成功！共删除 ' + ids.length + ' 条数据', 'success');
        })
        .catch(function(error) {
            showToast('批量删除失败：' + error.message, 'error');
        })
        .finally(function() { hideLoading(); });
}
```