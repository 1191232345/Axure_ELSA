# 反馈组件样式

空状态 + 骨架屏 + Alert提示框 + Toast通知。

## 空状态

```css
.empty-state { animation: fadeInUp 0.5s ease-out; }

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.empty-state-icon i { transition: transform 0.3s ease, color 0.3s ease; }
.empty-state:hover .empty-state-icon i { transform: scale(1.05); color: var(--color-neutral-400); }
```

## 骨架屏

```css
@keyframes skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.skeleton-shimmer {
    background: linear-gradient(90deg, var(--color-neutral-100) 25%, var(--border-color) 50%, var(--color-neutral-100) 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
```

## Alert 提示框

```css
.alert {
    display: flex;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    border-left: 4px solid;
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

.alert-success { background: #E8FFEC; border-left-color: var(--color-success); color: #006B19; }
.alert-warning { background: #FFF7E8; border-left-color: var(--color-warning); color: #994D00; }
.alert-danger { background: #FFECE8; border-left-color: var(--color-danger); color: #B3261E; }
.alert-info { background: #E8F3FF; border-left-color: var(--color-info); color: #094D8C; }

.alert-close {
    background: none; border: none; cursor: pointer;
    padding: 0.25rem;
    display: inline-flex; align-items: center; justify-content: center;
    opacity: 0.6; transition: opacity 0.2s;
}
.alert-close:hover { opacity: 1; }
```

## Toast 通知

```css
#toastContainer {
    position: fixed; top: 1rem; right: 1rem; z-index: 60;
    display: flex; flex-direction: column; gap: 0.75rem;
    pointer-events: none;
}

.toast { pointer-events: auto; animation: toastSlideIn 0.3s ease-out; }

@keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes toastSlideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
}

.toast .toast-content {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    border-left: 4px solid;
    min-width: 320px;
}

.toast-success .toast-content { border-left-color: var(--color-success); }
.toast-error .toast-content { border-left-color: var(--color-danger); }
.toast-warning .toast-content { border-left-color: var(--color-warning); }
.toast-info .toast-content { border-left-color: var(--color-info); }
```
