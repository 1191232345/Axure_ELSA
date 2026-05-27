# 模态框交互状态

遮罩层动画 + 内容区动画 + Mermaid放大。

```css
.modal-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0; visibility: hidden;
    transition: opacity var(--duration-300) var(--ease-smooth), visibility var(--duration-300) var(--ease-smooth);
}
.modal-overlay.show { opacity: 1; visibility: visible; }

.modal-content {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
    transition: transform var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1), opacity var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-overlay.show .modal-content { transform: translateY(0) scale(1); opacity: 1; }

.mermaid { cursor: zoom-in; transition: transform var(--duration-300) var(--ease-smooth); }
.mermaid:hover { transform: scale(1.02); }

.mermaid-modal { background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(5px); }
.mermaid-modal-content { animation: modalZoomIn var(--duration-300) var(--ease-out); }
@keyframes modalZoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

.mermaid-modal-close:hover { background: var(--color-neutral-200); transform: rotate(90deg); transition: all var(--duration-150) var(--ease-bounce); }
```
