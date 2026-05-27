# 表单验证

表单验证和错误提示函数。

## 显示错误

```javascript
function showFormErrors(errors) {
    clearFormErrors();
    errors.forEach(function(error) {
        var field = document.getElementById(error.field);
        if (field) {
            field.classList.add('error');
            var errorEl = document.createElement('span');
            errorEl.className = 'form-error-message';
            errorEl.textContent = error.message;
            field.parentNode.appendChild(errorEl);
        }
    });
}

function clearFormErrors(form) {
    form.querySelectorAll('.error').forEach(function(el) { el.classList.remove('error'); });
    form.querySelectorAll('.form-error-message').forEach(function(el) { el.remove(); });
}
```

## 验证函数

```javascript
function validateAddForm(data) {
    var errors = [];
    if (!data.name || data.name.trim() === '') {
        errors.push({ field: 'name', message: '名称不能为空' });
    }
    if (!data.code || !/^[A-Z]{2,4}\d{3,6}$/.test(data.code)) {
        errors.push({ field: 'code', message: '编码格式不正确' });
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ field: 'email', message: '邮箱格式不正确' });
    }
    return { valid: errors.length === 0, errors: errors };
}
```