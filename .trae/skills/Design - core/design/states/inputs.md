# 输入框交互状态

文本输入框 + 下拉选择框。

```css
.form-input {
    border: 1px solid var(--border-color);
    background-color: var(--color-card-bg);
    transition: all var(--duration-150) var(--ease-smooth);
}
.form-input:hover { border-color: var(--color-neutral-300); }
.form-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1); }
.form-input:disabled { background-color: var(--color-neutral-100); color: var(--color-neutral-400); cursor: not-allowed; border-color: var(--color-neutral-200); }
.form-input.error, .form-input.is-invalid { border-color: var(--color-danger); box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.1); }
.form-input.success, .form-input.is-valid { border-color: var(--color-success); box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.1); }

.form-select {
    border: 1px solid var(--border-color);
    background-color: var(--color-card-bg);
    transition: all var(--duration-150) var(--ease-smooth);
    cursor: pointer;
}
.form-select:hover { border-color: var(--color-neutral-300); }
.form-select:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1); }
.form-select:disabled { background-color: var(--color-neutral-100); color: var(--color-neutral-400); cursor: not-allowed; border-color: var(--color-neutral-200); }
.form-select option:disabled { color: var(--color-neutral-400); background-color: var(--color-neutral-100); }
```
