# 编辑逻辑

编辑按钮交互函数。

## 打开编辑弹窗

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
        .finally(function() { hideLoading(); });
}

function fillEditForm(data) {
    Object.keys(data).forEach(function(key) {
        var field = document.getElementById('edit_' + key);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else {
                field.value = data[key];
            }
        }
    });
}
```

## 保存编辑

```javascript
function handleSaveEdit() {
    var formData = collectEditFormData();
    var validationResult = validateEditForm(formData);
    if (!validationResult.valid) {
        showFormErrors(validationResult.errors);
        return;
    }
    if (!confirm('确定要保存修改吗？')) return;
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
        .finally(function() { hideLoading(); });
}
```