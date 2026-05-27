# 标签页样式

包含：右下角浮动切换标签 + 线型标签页 + 卡片型标签页(Pills)。

## 右下角浮动切换标签

```css
.tabs {
    display: flex;
    gap: 2px;
    background: linear-gradient(135deg, #667eea 0%, var(--color-primary) 100%);
    padding: 4px;
    border-radius: 12px;
    width: fit-content;
    box-shadow: 0 4px 20px rgba(42, 59, 125, 0.3);
}

.tab {
    padding: 10px 20px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab:hover { color: white; transform: translateY(-1px); }

.tab.active {
    background: white;
    color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-weight: 600;
}
```

## 线型标签页

```css
.tabs-header {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    overflow-x: auto;
}

.tab-item {
    position: relative;
    white-space: nowrap;
    background: transparent;
    border: none; cursor: pointer; outline: none;
    padding: 0.75rem 1rem;
    font-size: 0.875rem; font-weight: 500;
    color: var(--color-neutral-600);
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
}

.tab-item:hover:not(.active) {
    background-color: rgba(42, 59, 125, 0.04);
    color: var(--color-primary);
    border-bottom-color: var(--color-neutral-300);
}

.tab-item.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    font-weight: 600;
}
```

## 卡片型标签页(Pills)

```css
.tab-pill {
    white-space: nowrap;
    background: transparent;
    border: none; cursor: pointer; outline: none;
    padding: 0.5rem 1rem;
    font-size: 0.875rem; font-weight: 500;
    color: var(--color-neutral-600);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
}

.tab-pill:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.6);
    color: var(--color-neutral-800);
}

.tab-pill.active {
    background-color: white;
    color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    font-weight: 600;
}

.tab-pane { display: none; animation: tabFadeIn 0.3s ease-out; }
.tab-pane.active { display: block; }

@keyframes tabFadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
```
