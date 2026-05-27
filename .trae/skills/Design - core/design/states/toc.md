# 目录导航交互状态

目录链接 + 层级指示器 + 折叠。

```css
.toc a { color: var(--color-neutral-500); transition: all var(--duration-150) var(--ease-smooth); }
.toc a:hover { background: rgba(42, 59, 125, 0.05); color: var(--color-primary); }
.toc a.active { background: rgba(42, 59, 125, 0.05); color: var(--color-primary); font-weight: var(--font-weight-medium); }

.toc-level-2::before {
    content: ''; position: absolute; left: 0; width: 3px;
    background: var(--color-primary); border-radius: 3px;
    opacity: 0; transition: opacity var(--duration-150) var(--ease-smooth);
}
.toc-level-2:hover::before, .toc-level-2.active::before { opacity: 1; }

.toc-level-3::before {
    content: ''; position: absolute; width: 4px; height: 4px;
    background: var(--color-neutral-400); border-radius: 50%;
}

.toc-toggle { transition: transform var(--duration-150) var(--ease-smooth); }
.toc-toggle:hover { color: var(--color-primary); }
.toc-toggle.collapsed { transform: translateY(-50%) rotate(-90deg); }

.toc-children { max-height: 500px; overflow: hidden; transition: max-height var(--duration-300) var(--ease-smooth); }
.toc-children.collapsed { max-height: 0; }
```
