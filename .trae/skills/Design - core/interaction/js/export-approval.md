# 导出审批逻辑

数据导出和审批流程交互函数。

## 导出数据

```javascript
function handleExport() {
    var searchParams = collectSearchParams();
    showConfirmDialog({
        title: '导出数据',
        message: '确定要导出当前筛选条件下的数据吗？',
        type: 'info',
        confirmText: '导出',
        onConfirm: function() { performExport(searchParams); }
    });
}

function performExport(params) {
    showLoading('正在导出...');
    exportData(params)
        .then(function(response) {
            downloadFile(response.fileUrl, response.fileName);
            showToast('导出成功！', 'success');
        })
        .catch(function(error) {
            showToast('导出失败：' + error.message, 'error');
        })
        .finally(function() { hideLoading(); });
}

function downloadFile(url, fileName) {
    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
```

## 审批流程

```javascript
function handleSubmitApproval(id) {
    showConfirmDialog({
        title: '提交审批',
        message: '确定要提交审批吗？',
        type: 'info',
        confirmText: '提交',
        onConfirm: function() { performSubmitApproval(id); }
    });
}

function handleApprove(approvalId) {
    showLoading('正在处理...');
    approveRequest(approvalId, '')
        .then(function() {
            refreshDataList();
            showToast('审批通过！', 'success');
        })
        .catch(function(error) {
            showToast('审批失败：' + error.message, 'error');
        })
        .finally(hideLoading);
}

function handleReject(approvalId) {
    showLoading('正在处理...');
    rejectRequest(approvalId, '驳回')
        .then(function() {
            refreshDataList();
            showToast('已驳回！', 'warning');
        })
        .catch(function(error) {
            showToast('驳回失败：' + error.message, 'error');
        })
        .finally(hideLoading);
}
```