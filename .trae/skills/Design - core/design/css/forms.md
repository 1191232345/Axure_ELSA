# 表单样式

交互状态详见 [states/inputs](../states/inputs.md)。

```css
.form-group { margin-bottom: 16px; }

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-neutral-700);
    margin-bottom: 6px;
}

.form-group .required { color: var(--color-danger); }

.form-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--text-primary);
    background-color: white;
    transition: all 0.2s ease;
    cursor: pointer;
}

.form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--text-primary);
    background-color: white;
    transition: all 0.2s ease;
}

.form-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 14px;
    color: var(--text-primary);
    background-color: white;
    transition: all 0.2s ease;
    resize: vertical;
    min-height: 80px;
}
```
