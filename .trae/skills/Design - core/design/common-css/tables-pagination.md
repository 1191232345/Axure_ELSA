# 公共表格与分页样式

```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
.data-table td { padding: 12px 16px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }
.data-table tbody tr { transition: background-color var(--duration-150); }
.data-table tbody tr:hover { background-color: #f9fafb; }

.pagination { display: flex; align-items: center; gap: 4px; }
.page-btn { display: inline-flex; align-items: center; justify-content: center; min-width: 32px; height: 32px; padding: 0 8px; font-size: 14px; border: 1px solid #e5e7eb; border-radius: var(--radius-md); background: white; color: #374151; cursor: pointer; transition: all var(--duration-150); }
.page-btn:hover:not(:disabled):not(.active) { background: #f9fafb; border-color: #d1d5db; }
.page-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
```
