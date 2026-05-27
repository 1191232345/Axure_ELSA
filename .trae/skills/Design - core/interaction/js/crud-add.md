# 新增逻辑

新增按钮交互函数。

## 打开新增弹窗

```javascript
function handleAdd() {
    resetAddForm();
    openModal('addModal');
    setTimeout(function() {
        document.getElementById('addForm').querySelector('input, select').focus();
    }, 100);
}

function resetAddForm() {
    var form = document.getElementById('addForm');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
}
```

## 保存新增

```javascript
function handleSaveAdd() {
    var formData = collectAddFormData();
    var validationResult = validateAddForm(formData);
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
        })
        .catch(function(error) {
            showToast('保存失败：' + error.message, 'error');
        })
        .finally(function() { hideLoading(); });
}
```