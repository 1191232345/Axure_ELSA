# 表格行交互状态

行悬停 + 选中 + 斑马纹 + 表格内按钮。

```css
.table-hover-row { transition: background-color var(--duration-150) var(--ease-smooth); }
.table-hover-row:hover { background-color: var(--color-neutral-50); }
.table-hover-row.selected { background-color: rgba(42, 59, 125, 0.05); }

tr:nth-child(even) td { background: var(--color-neutral-50); }
.prose tr:hover td { background: rgba(42, 59, 125, 0.05); }

.table-btn {
    padding: var(--spacing-1) var(--spacing-2);
    font-size: var(--font-size-xs);
    border-radius: var(--radius-sm);
    transition: all var(--duration-150) var(--ease-smooth);
    border: none; cursor: pointer; background: transparent;
}
.table-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-button); }
.table-btn-primary:hover { background-color: rgba(42, 59, 125, 0.1); color: var(--color-primary); }
.table-btn-danger:hover { background-color: rgba(245, 63, 63, 0.1); color: var(--color-danger); }
```
