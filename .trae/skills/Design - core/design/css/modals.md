# 模态框样式

交互状态详见 [states/modals](../states/modals.md)。

```css
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.modal-overlay.show { opacity: 1; visibility: visible; }

.modal-content {
    background-color: white;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%; max-width: 600px; max-height: 80vh;
    overflow-y: auto;
    transform: translateY(-20px);
    transition: transform 0.3s ease;
}

.modal-overlay.show .modal-content { transform: translateY(0); }

.modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.modal-body { padding: 20px; }

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.close-btn {
    background-color: white;
    color: var(--color-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-btn:hover { background-color: var(--bg-color-page); }
```
