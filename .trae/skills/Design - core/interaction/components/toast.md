# 提示消息组件

Toast 和 Alert 提示模板。

## Toast 通知

```html
<div id="toastContainer" class="fixed top-4 right-4 z-[60] space-y-3 pointer-events-none">
    <!-- 成功Toast -->
    <div class="toast pointer-events-auto">
        <div class="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border-l-4 border-success min-w-[320px]">
            <i class="fas fa-check-circle text-success text-lg"></i>
            <span class="flex-1 text-sm font-medium text-gray-800">操作成功完成</span>
            <button onclick="this.closest('.toast').remove()">
                <i class="fas fa-xmark text-gray-400"></i>
            </button>
        </div>
    </div>
</div>
```

## JavaScript工具函数

```javascript
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    const container = document.getElementById('toastContainer') || createToastContainer();
    
    const icons = {
        success: 'fa-check-circle text-success',
        error: 'fa-times-circle text-danger',
        warning: 'fa-exclamation-circle text-warning',
        info: 'fa-circle-info text-info'
    };
    
    const colors = {
        success: 'border-success',
        error: 'border-danger',
        warning: 'border-warning',
        info: 'border-info'
    };
    
    const toast = document.createElement('div');
    toast.className = 'toast pointer-events-auto';
    toast.innerHTML = '<div class="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border-l-4 ' + colors[type] + ' min-w-[320px]"><i class="fas ' + icons[type] + ' text-lg"></i><span class="flex-1 text-sm font-medium text-gray-800">' + message + '</span><button onclick="this.closest(\'.toast\').remove()"><i class="fas fa-xmark text-gray-400"></i></button></div>';
    
    container.appendChild(toast);
    
    if (duration > 0) {
        setTimeout(function() {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(function() { toast.remove(); }, 300);
        }, duration);
    }
    
    return toast;
}

function createToastContainer() {
    var container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-4 right-4 z-[60] space-y-3 pointer-events-none';
    document.body.appendChild(container);
    return container;
}
```

## 使用示例

```javascript
showToast('保存成功', 'success');
showToast('请检查表单填写', 'warning');
showToast('网络请求失败', 'error');
showToast('数据已加载', 'info');
```