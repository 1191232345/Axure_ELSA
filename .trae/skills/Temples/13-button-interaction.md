# 按钮交互逻辑模板

本文件定义TOB产品中各类按钮的完整交互逻辑，确保原型具有真实的交互体验。

## 1. 搜索/筛选按钮逻辑

### 1.1 搜索按钮

```javascript
function handleSearch() {
    const searchParams = collectSearchParams();
    
    if (!validateSearchParams(searchParams)) {
        showToast('请输入有效的搜索条件', 'error');
        return;
    }
    
    showLoading();
    
    fetchSearchResults(searchParams)
        .then(function(results) {
            renderSearchResults(results);
            updatePagination(results.total);
            showToast('搜索完成，共 ' + results.total + ' 条结果', 'success');
        })
        .catch(function(error) {
            showToast('搜索失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}

function collectSearchParams() {
    return {
        keyword: document.getElementById('searchKeyword').value.trim(),
        status: document.getElementById('searchStatus').value,
        dateRange: document.getElementById('searchDateRange').value,
        page: currentPage,
        pageSize: pageSize
    };
}

function validateSearchParams(params) {
    if (params.keyword && params.keyword.length < 2) {
        showToast('搜索关键词至少2个字符', 'warning');
        return false;
    }
    return true;
}
```

### 1.2 重置按钮

```javascript
function handleReset() {
    if (confirm('确定要重置所有搜索条件吗？')) {
        resetSearchForm();
        loadDefaultData();
        showToast('搜索条件已重置', 'info');
    }
}

function resetSearchForm() {
    document.querySelectorAll('.search-form input, .search-form select').forEach(function(input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    currentPage = 1;
}
```

## 2. 新增按钮逻辑

### 2.1 打开新增弹窗

```javascript
function handleAdd() {
    resetAddForm();
    openModal('addModal');
    
    setTimeout(function() {
        document.getElementById('addForm').querySelector('input, select').focus();
    }, 100);
}

function resetAddForm() {
    const form = document.getElementById('addForm');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
}
```

### 2.2 保存新增数据

```javascript
function handleSaveAdd() {
    const formData = collectAddFormData();
    const validationResult = validateAddForm(formData);
    
    if (!validationResult.valid) {
        showFormErrors(validationResult.errors);
        showToast('请检查表单填写是否正确', 'error');
        return;
    }
    
    showLoading('正在保存...');
    
    saveAddData(formData)
        .then(function(response) {
            closeModal('addModal');
            refreshDataList();
            showToast('添加成功！', 'success');
            
            if (response.needApproval) {
                showApprovalNotice(response.approvalId);
            }
        })
        .catch(function(error) {
            showToast('保存失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}

function validateAddForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim() === '') {
        errors.push({ field: 'name', message: '名称不能为空' });
    }
    
    if (!data.code || !/^[A-Z]{2,4}\d{3,6}$/.test(data.code)) {
        errors.push({ field: 'code', message: '编码格式不正确' });
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ field: 'email', message: '邮箱格式不正确' });
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

function showFormErrors(errors) {
    clearFormErrors();
    errors.forEach(function(error) {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('error');
            const errorEl = document.createElement('span');
            errorEl.className = 'form-error-message';
            errorEl.textContent = error.message;
            field.parentNode.appendChild(errorEl);
        }
    });
}

function clearFormErrors(form) {
    form.querySelectorAll('.error').forEach(function(el) {
        el.classList.remove('error');
    });
    form.querySelectorAll('.form-error-message').forEach(function(el) {
        el.remove();
    });
}
```

## 3. 编辑按钮逻辑

### 3.1 打开编辑弹窗

```javascript
function handleEdit(id) {
    showLoading('加载数据中...');
    
    fetchDetailData(id)
        .then(function(data) {
            fillEditForm(data);
            openModal('editModal');
            currentEditId = id;
        })
        .catch(function(error) {
            showToast('加载数据失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}

function fillEditForm(data) {
    Object.keys(data).forEach(function(key) {
        const field = document.getElementById('edit_' + key);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else if (field.tagName === 'SELECT') {
                field.value = data[key];
            } else {
                field.value = data[key];
            }
        }
    });
}
```

### 3.2 保存编辑数据

```javascript
function handleSaveEdit() {
    const formData = collectEditFormData();
    const validationResult = validateEditForm(formData);
    
    if (!validationResult.valid) {
        showFormErrors(validationResult.errors);
        return;
    }
    
    if (!confirm('确定要保存修改吗？')) {
        return;
    }
    
    showLoading('正在保存...');
    
    saveEditData(currentEditId, formData)
        .then(function() {
            closeModal('editModal');
            refreshDataList();
            showToast('修改成功！', 'success');
        })
        .catch(function(error) {
            showToast('保存失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}
```

## 4. 删除按钮逻辑

### 4.1 单条删除

```javascript
function handleDelete(id, name) {
    showConfirmDialog({
        title: '确认删除',
        message: '确定要删除 "' + name + '" 吗？此操作不可恢复。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消',
        onConfirm: function() {
            performDelete(id);
        }
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
        .finally(function() {
            hideLoading();
        });
}
```

### 4.2 批量删除

```javascript
function handleBatchDelete() {
    const selectedIds = getSelectedIds();
    
    if (selectedIds.length === 0) {
        showToast('请先选择要删除的数据', 'warning');
        return;
    }
    
    showConfirmDialog({
        title: '批量删除确认',
        message: '确定要删除选中的 ' + selectedIds.length + ' 条数据吗？此操作不可恢复。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消',
        onConfirm: function() {
            performBatchDelete(selectedIds);
        }
    });
}

function getSelectedIds() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkboxes).map(function(cb) {
        return cb.dataset.id;
    });
}
```

## 5. 状态切换按钮逻辑

### 5.1 启用/禁用切换

```javascript
function handleToggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? '启用' : '禁用';
    
    showConfirmDialog({
        title: '确认' + actionText,
        message: '确定要' + actionText + '该记录吗？',
        type: newStatus === 'active' ? 'success' : 'warning',
        confirmText: actionText,
        cancelText: '取消',
        onConfirm: function() {
            performToggleStatus(id, newStatus);
        }
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
        .finally(function() {
            hideLoading();
        });
}

function updateRowStatus(id, status) {
    const row = document.querySelector('tr[data-id="' + id + '"]');
    if (row) {
        const statusBadge = row.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.className = 'status-badge status-badge-' + (status === 'active' ? 'success' : 'danger');
            statusBadge.textContent = status === 'active' ? '启用' : '禁用';
        }
        const toggleBtn = row.querySelector('.toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = function() {
                handleToggleStatus(id, status);
            };
        }
    }
}
```

## 6. 导出按钮逻辑

### 6.1 导出数据

```javascript
function handleExport() {
    const searchParams = collectSearchParams();
    
    showConfirmDialog({
        title: '导出数据',
        message: '确定要导出当前筛选条件下的数据吗？',
        type: 'info',
        confirmText: '导出',
        cancelText: '取消',
        onConfirm: function() {
            performExport(searchParams);
        }
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
        .finally(function() {
            hideLoading();
        });
}

function downloadFile(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
```

## 7. 审批按钮逻辑

### 7.1 提交审批

```javascript
function handleSubmitApproval(id) {
    showConfirmDialog({
        title: '提交审批',
        message: '确定要提交审批吗？提交后将进入审批流程。',
        type: 'info',
        confirmText: '提交',
        cancelText: '取消',
        onConfirm: function() {
            performSubmitApproval(id);
        }
    });
}

function performSubmitApproval(id) {
    showLoading('正在提交...');
    
    submitApproval(id)
        .then(function(response) {
            refreshDataList();
            showToast('已提交审批，审批单号：' + response.approvalNo, 'success');
        })
        .catch(function(error) {
            showToast('提交失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}
```

### 7.2 审批通过/驳回

```javascript
function handleApprove(approvalId) {
    showApprovalDialog({
        title: '审批通过',
        approvalId: approvalId,
        type: 'approve',
        requireComment: false,
        onConfirm: function(comment) {
            performApprove(approvalId, comment);
        }
    });
}

function handleReject(approvalId) {
    showApprovalDialog({
        title: '审批驳回',
        approvalId: approvalId,
        type: 'reject',
        requireComment: true,
        onConfirm: function(comment) {
            performReject(approvalId, comment);
        }
    });
}

function showApprovalDialog(options) {
    const dialog = document.getElementById('approvalDialog');
    dialog.querySelector('.dialog-title').textContent = options.title;
    dialog.querySelector('.approval-comment').required = options.requireComment;
    
    const confirmBtn = dialog.querySelector('.confirm-btn');
    confirmBtn.onclick = function() {
        const comment = dialog.querySelector('.approval-comment').value;
        if (options.requireComment && !comment.trim()) {
            showToast('请填写审批意见', 'warning');
            return;
        }
        options.onConfirm(comment);
        closeDialog('approvalDialog');
    };
    
    openDialog('approvalDialog');
}
```

## 8. 确认对话框组件

### 8.1 确认对话框模板

```html
<div id="confirmDialog" class="dialog-overlay">
    <div class="dialog-content">
        <div class="dialog-header">
            <h3 class="dialog-title">确认操作</h3>
            <button class="dialog-close" onclick="closeDialog('confirmDialog')">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="dialog-body">
            <p class="dialog-message">确定要执行此操作吗？</p>
        </div>
        <div class="dialog-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeDialog('confirmDialog')">取消</button>
            <button class="erp-btn erp-btn-primary confirm-btn">确定</button>
        </div>
    </div>
</div>
```

### 8.2 确认对话框逻辑

```javascript
function showConfirmDialog(options) {
    const dialog = document.getElementById('confirmDialog');
    const titleEl = dialog.querySelector('.dialog-title');
    const messageEl = dialog.querySelector('.dialog-message');
    const confirmBtn = dialog.querySelector('.confirm-btn');
    const dialogContent = dialog.querySelector('.dialog-content');
    
    titleEl.textContent = options.title || '确认操作';
    messageEl.textContent = options.message || '确定要执行此操作吗？';
    
    confirmBtn.textContent = options.confirmText || '确定';
    confirmBtn.className = 'erp-btn';
    
    if (options.type === 'danger') {
        confirmBtn.classList.add('erp-btn-danger');
    } else if (options.type === 'warning') {
        confirmBtn.classList.add('erp-btn-warning');
    } else if (options.type === 'success') {
        confirmBtn.classList.add('erp-btn-success');
    } else {
        confirmBtn.classList.add('erp-btn-primary');
    }
    
    confirmBtn.onclick = function() {
        closeDialog('confirmDialog');
        if (options.onConfirm) {
            options.onConfirm();
        }
    };
    
    dialog.querySelector('.erp-btn-secondary').textContent = options.cancelText || '取消';
    
    openDialog('confirmDialog');
}

function openDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.classList.remove('show');
        document.body.style.overflow = '';
    }
}
```

## 9. 加载状态组件

### 9.1 全局加载

```javascript
function showLoading(message) {
    const loadingEl = document.getElementById('globalLoading');
    if (loadingEl) {
        if (message) {
            loadingEl.querySelector('.loading-text').textContent = message;
        }
        loadingEl.classList.add('show');
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('globalLoading');
    if (loadingEl) {
        loadingEl.classList.remove('show');
    }
}
```

### 9.2 按钮加载状态

```javascript
function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i>处理中...';
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || '确定';
        button.classList.remove('loading');
    }
}
```

## 10. Toast 消息组件

### 10.1 Toast 模板

```html
<div id="toastContainer" class="toast-container"></div>

<style>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.toast {
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: toastIn 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 400px;
}

.toast-success { background-color: #00B42A; }
.toast-error { background-color: #F53F3F; }
.toast-warning { background-color: #FF7D00; }
.toast-info { background-color: #2a3b7d; }

.toast-out {
    animation: toastOut 0.3s ease-in forwards;
}

@keyframes toastIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes toastOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
</style>
```

### 10.2 Toast 逻辑

```javascript
function showToast(message, type) {
    type = type || 'info';
    
    const container = document.getElementById('toastContainer');
    if (!container) {
        createToastContainer();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = '<i class="fa ' + iconMap[type] + '"></i><span>' + message + '</span>';
    
    container.appendChild(toast);
    
    setTimeout(function() {
        toast.classList.add('toast-out');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
}
```

## 11. 分页逻辑

### 11.1 分页组件

```javascript
function renderPagination(total, current, size) {
    const totalPages = Math.ceil(total / size);
    const pagination = document.getElementById('pagination');
    
    let html = '<div class="pagination-info">共 ' + total + ' 条记录</div>';
    html += '<div class="pagination-buttons">';
    
    html += '<button class="page-btn" ' + (current === 1 ? 'disabled' : '') + ' onclick="goToPage(' + (current - 1) + ')">';
    html += '<i class="fa fa-chevron-left"></i></button>';
    
    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(totalPages, current + 2);
    
    if (startPage > 1) {
        html += '<button class="page-btn" onclick="goToPage(1)">1</button>';
        if (startPage > 2) {
            html += '<span class="page-ellipsis">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += '<button class="page-btn ' + (i === current ? 'active' : '') + '" onclick="goToPage(' + i + ')">' + i + '</button>';
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += '<span class="page-ellipsis">...</span>';
        }
        html += '<button class="page-btn" onclick="goToPage(' + totalPages + ')">' + totalPages + '</button>';
    }
    
    html += '<button class="page-btn" ' + (current === totalPages ? 'disabled' : '') + ' onclick="goToPage(' + (current + 1) + ')">';
    html += '<i class="fa fa-chevron-right"></i></button>';
    
    html += '</div>';
    
    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    handleSearch();
}
```

## 12. 表格选择逻辑

### 12.1 全选/取消全选

```javascript
function handleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(function(cb) {
        cb.checked = checkbox.checked;
        toggleRowSelection(cb);
    });
    updateBatchButtons();
}

function handleRowSelect(checkbox) {
    toggleRowSelection(checkbox);
    updateSelectAllCheckbox();
    updateBatchButtons();
}

function toggleRowSelection(checkbox) {
    const row = checkbox.closest('tr');
    if (checkbox.checked) {
        row.classList.add('selected');
    } else {
        row.classList.remove('selected');
    }
}

function updateSelectAllCheckbox() {
    const allCheckboxes = document.querySelectorAll('.row-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
    }
}

function updateBatchButtons() {
    const selectedCount = document.querySelectorAll('.row-checkbox:checked').length;
    const batchButtons = document.querySelectorAll('.batch-btn');
    
    batchButtons.forEach(function(btn) {
        btn.disabled = selectedCount === 0;
        if (btn.querySelector('.selected-count')) {
            btn.querySelector('.selected-count').textContent = selectedCount;
        }
    });
}
```

## 13. 完整交互模板示例

```html
<script>
let currentPage = 1;
let pageSize = 10;
let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    initPage();
    bindEvents();
});

function initPage() {
    loadDefaultData();
}

function bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('addBtn').addEventListener('click', handleAdd);
    document.getElementById('saveAddBtn').addEventListener('click', handleSaveAdd);
    document.getElementById('saveEditBtn').addEventListener('click', handleSaveEdit);
    
    document.querySelectorAll('.row-checkbox').forEach(function(cb) {
        cb.addEventListener('change', function() {
            handleRowSelect(this);
        });
    });
    
    document.getElementById('selectAll').addEventListener('change', function() {
        handleSelectAll(this);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('search-input')) {
            handleSearch();
        }
    });
}

function loadDefaultData() {
    handleSearch();
}
</script>
```
