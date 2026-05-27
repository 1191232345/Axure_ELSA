# Toast 提示

轻量级消息提示组件，支持 success/warning/error/info 四种类型。

## 方法

```javascript
function showToast(message, type)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `message` | `string` | 提示内容 |
| `type` | `string` | 类型：success/warning/error/info |

## 完整代码

```javascript
function showToast(message, type) {
    type = type || 'info';
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + ' mr-2"></i>' + message;
    container.appendChild(toast);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}
```

## 使用示例

```javascript
showToast('保存成功', 'success');
showToast('请检查表单填写', 'warning');
showToast('网络请求失败', 'error');
showToast('数据已加载', 'info');
```

## 样式依赖

需要在 CSS 中定义 `.toast-container` 和 `.toast-*` 样式，详见 [common-css](../../design/common-css.md)。