# 状态切换逻辑

启用/禁用状态切换交互函数。

## 状态切换

```javascript
function handleToggleStatus(id, currentStatus) {
    var newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    var actionText = newStatus === 'active' ? '启用' : '禁用';
    showConfirmDialog({
        title: '确认' + actionText,
        message: '确定要' + actionText + '该记录吗？',
        type: newStatus === 'active' ? 'success' : 'warning',
        confirmText: actionText,
        onConfirm: function() { performToggleStatus(id, newStatus); }
    });
}

function performToggleStatus(id, newStatus) {
    showLoading('正在处理...');
    updateStatus(id, newStatus)
        .then(function() {
            updateRowStatus(id, newStatus);
            showToast('状态更新成功！', 'success');
        })
        .catch(function(error) {
            showToast('状态更新失败：' + error.message, 'error');
        })
        .finally(function() { hideLoading(); });
}
```

## 更新行内状态

```javascript
function updateRowStatus(id, status) {
    var row = document.querySelector('tr[data-id="' + id + '"]');
    if (row) {
        var statusBadge = row.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.className = 'status-badge status-badge-' + (status === 'active' ? 'success' : 'danger');
            statusBadge.textContent = status === 'active' ? '启用' : '禁用';
        }
        var toggleBtn = row.querySelector('.toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = function() { handleToggleStatus(id, status); };
        }
    }
}
```