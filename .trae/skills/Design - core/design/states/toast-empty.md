# Toast与空状态交互

Toast入场/退场 + 空状态动画 + 面包屑链接。

```css
.toast-container {
    position: fixed; top: var(--spacing-4); right: var(--spacing-4); z-index: var(--z-index-toast, 60);
    display: flex; flex-direction: column; gap: var(--spacing-2); pointer-events: none;
}

.toast {
    min-width: 320px; max-width: 480px;
    padding: var(--spacing-3) var(--spacing-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    pointer-events: auto;
    display: flex; align-items: flex-start; gap: var(--spacing-3);
    animation: toastSlideIn var(--duration-300) var(--ease-out);
}
@keyframes toastSlideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
.toast.hiding { animation: toastSlideOut var(--duration-150) var(--ease-in) forwards; }
@keyframes toastSlideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }

.toast-close-btn { transition: all var(--duration-75) var(--ease-smooth); }
.toast-close-btn:hover { color: var(--color-neutral-700); transform: rotate(90deg); }

.toast-progress { position: absolute; bottom: 0; left: 0; height: 3px; border-radius: 0 0 var(--radius-md) var(--radius-md); animation: toastProgress linear forwards; }
@keyframes toastProgress { from { width: 100%; } to { width: 0%; } }

.toast-success { background-color: var(--color-success-bg, #E8FFEC); border-left: 4px solid var(--color-success); color: var(--color-success-text, #006B19); }
.toast-error { background-color: var(--color-danger-bg, #FFECE8); border-left: 4px solid var(--color-danger); color: var(--color-danger-text, #B3261E); }
.toast-warning { background-color: var(--color-warning-bg, #FFF7E8); border-left: 4px solid var(--color-warning); color: var(--color-warning-text, #994D00); }
.toast-info { background-color: var(--color-info-bg, #E8F3FF); border-left: 4px solid var(--color-info, #1677FF); color: var(--color-info-text, #094D8C); }

.empty-state { text-align: center; padding: var(--spacing-16) var(--spacing-4); }
.empty-state-icon { margin-bottom: var(--spacing-6); animation: emptyStateFadeInUp var(--duration-500) var(--ease-out); }
@keyframes emptyStateFadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.empty-state-icon i { transition: transform var(--duration-300) var(--ease-bounce); }
.empty-state:hover .empty-state-icon i { transform: scale(1.05); }

.breadcrumb-item a { color: var(--color-neutral-500); transition: color var(--duration-150) var(--ease-smooth); }
.breadcrumb-item a:hover { color: var(--color-primary); }
.breadcrumb-item.active { color: var(--color-primary); font-weight: var(--font-weight-medium); }
```
