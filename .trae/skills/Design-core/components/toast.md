# Toast提示组件

完整的Toast提示组件规范，包含样式、HTML模板、JavaScript逻辑和使用示例。

## 基础样式

```css
.toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
}

.toast {
    pointer-events: auto;
    animation: slideInRight 0.3s ease-out;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    border-left: 4px solid var(--color-primary);
    min-width: 320px;
}

.toast-success .toast-content {
    border-left-color: var(--color-success);
}

.toast-error .toast-content {
    border-left-color: var(--color-danger);
}

.toast-warning .toast-content {
    border-left-color: var(--color-warning);
}

.toast-info .toast-content {
    border-left-color: var(--color-info);
}

.toast-icon {
    font-size: 1.125rem;
}

.toast-success .toast-icon {
    color: var(--color-success);
}

.toast-error .toast-icon {
    color: var(--color-danger);
}

.toast-warning .toast-icon {
    color: var(--color-warning);
}

.toast-info .toast-icon {
    color: var(--color-info);
}

.toast-message {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
}

.toast-close {
    background: transparent;
    border: none;
    color: var(--color-neutral-400);
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s;
}

.toast-close:hover {
    color: var(--color-neutral-600);
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideOutRight {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}
```

## HTML模板

### Toast容器

```html
<div id="toastContainer" class="toast-container">
    <!-- Toast消息将动态插入这里 -->
</div>
```

### 成功Toast

```html
<div class="toast toast-success">
    <div class="toast-content">
        <i class="fas fa-check-circle toast-icon"></i>
        <span class="toast-message">操作成功完成</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

### 错误Toast

```html
<div class="toast toast-error">
    <div class="toast-content">
        <i class="fas fa-times-circle toast-icon"></i>
        <span class="toast-message">操作失败，请重试</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

### 警告Toast

```html
<div class="toast toast-warning">
    <div class="toast-content">
        <i class="fas fa-exclamation-triangle toast-icon"></i>
        <span class="toast-message">请注意检查输入内容</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

### 信息Toast

```html
<div class="toast toast-info">
    <div class="toast-content">
        <i class="fas fa-info-circle toast-icon"></i>
        <span class="toast-message">数据已加载完成</span>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

## JavaScript逻辑

### Toast显示函数

```javascript
/**
 * 显示Toast提示
 * @param {string} message - 提示内容
 * @param {string} type - 类型：success/error/warning/info，默认为 'info'
 * @param {number} duration - 显示时长（毫秒），默认为 3000ms，设为 0 则不自动关闭
 * @returns {HTMLElement} Toast元素
 */
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration !== undefined ? duration : 3000;

    // 获取或创建容器
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 图标映射
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    // 创建Toast元素
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<div class="toast-content"><i class="fas ' + (icons[type] || icons.info) + ' toast-icon"></i><span class="toast-message">' + message + '</span><button class="toast-close" onclick="this.closest(\'.toast\').remove()"><i class="fas fa-xmark"></i></button></div>';

    // 添加到容器
    container.appendChild(toast);

    // 自动关闭
    if (duration > 0) {
        setTimeout(function() {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, duration);
    }

    return toast;
}
```

### 使用示例

```javascript
// 成功提示
showToast('保存成功', 'success');

// 错误提示
showToast('网络请求失败，请重试', 'error');

// 警告提示
showToast('请检查表单填写是否完整', 'warning');

// 信息提示
showToast('数据已加载完成', 'info');

// 自定义显示时长（5秒）
showToast('这是一条重要消息', 'info', 5000);

// 不自动关闭
showToast('需要手动关闭的消息', 'warning', 0);
```

## 使用规范

1. **消息内容**：简洁明了，建议不超过20个字
2. **类型选择**：
   - `success`：操作成功
   - `error`：操作失败
   - `warning`：警告提示
   - `info`：一般信息
3. **显示时长**：默认3秒，重要信息可延长至5秒
4. **位置固定**：右上角显示，避免遮挡重要内容
5. **自动关闭**：默认自动关闭，特殊情况可手动控制
6. **多个Toast**：支持同时显示多个，按顺序堆叠

## 高级用法

### 批量关闭所有Toast

```javascript
function closeAllToasts() {
    const container = document.getElementById('toastContainer');
    if (container) {
        container.querySelectorAll('.toast').forEach(function(toast) {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(function() {
                toast.remove();
            }, 300);
        });
    }
}
```

### 带回调的Toast

```javascript
function showToastWithCallback(message, type, duration, onClose) {
    const toast = showToast(message, type, duration);

    if (duration > 0 && onClose) {
        setTimeout(function() {
            onClose();
        }, duration + 300);
    }

    return toast;
}

// 使用示例
showToastWithCallback('操作成功', 'success', 3000, function() {
    console.log('Toast已关闭');
    // 执行后续操作
});
```
