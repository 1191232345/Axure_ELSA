# 按钮样式

交互状态详见 [states/buttons](../states/buttons.md)。

```css
.erp-btn {
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    text-decoration: none;
}

.erp-btn-primary {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.erp-btn-secondary {
    background-color: white;
    color: #525252;
    border-color: #d4d4d4;
}

.erp-btn-warning {
    background-color: var(--color-warning);
    color: white;
    border-color: var(--color-warning);
}

.erp-btn-danger {
    background-color: var(--color-danger);
    color: white;
    border-color: var(--color-danger);
}

.erp-btn-success {
    background-color: var(--color-success);
    color: white;
    border-color: var(--color-success);
}

.table-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    background: transparent;
}
```
