# 标签页交互状态

线型标签页 + 卡片型标签页(Pills)。

```css
.tab-item {
    position: relative;
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-500);
    background: transparent;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    transition: all var(--duration-150) var(--ease-smooth);
    white-space: nowrap;
}
.tab-item:hover { color: var(--color-primary); background-color: var(--color-neutral-50); }
.tab-item.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: var(--font-weight-semibold); }
.tab-item.disabled { color: var(--color-neutral-300); cursor: not-allowed; pointer-events: none; }

.tab-pane { display: none; animation: tabFadeIn var(--duration-300) var(--ease-out); }
.tab-pane.active { display: block; }
@keyframes tabFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.pill-item {
    padding: var(--spacing-2) var(--spacing-4);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-600);
    background: transparent;
    border-radius: var(--radius-xl);
    cursor: pointer;
    transition: all var(--duration-150) var(--ease-smooth);
}
.pill-item:hover { color: var(--color-primary); background-color: var(--color-neutral-50); }
.pill-item.active { color: var(--color-neutral-50); background-color: var(--color-primary); box-shadow: var(--shadow-sm); }
```
