# 公共按钮样式

```css
.erp-btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 6px 16px; font-size: 14px; font-weight: 500;
    border-radius: var(--radius-md); cursor: pointer;
    transition: all var(--duration-200) var(--ease-default);
    border: 1px solid transparent; white-space: nowrap;
}
.erp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.erp-btn-primary { background-color: var(--color-primary); color: var(--color-neutral-50); border-color: var(--color-primary); }
.erp-btn-primary:hover:not(:disabled) { background-color: var(--color-primary-hover); }

.erp-btn-secondary { background: white; color: var(--color-text-primary); border-color: var(--color-border); }
.erp-btn-secondary:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; }

.erp-btn-success { background-color: var(--color-success); color: var(--color-neutral-50); }
.erp-btn-success:hover:not(:disabled) { background: #00a023; }

.erp-btn-warning { background-color: var(--color-warning); color: var(--color-neutral-50); }
.erp-btn-warning:hover:not(:disabled) { background: #e67000; }

.erp-btn-danger { background-color: var(--color-danger); color: var(--color-neutral-50); }
.erp-btn-danger:hover:not(:disabled) { background: #d93636; }
```
