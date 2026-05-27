# 目录导航样式

PRD/测试用例页面的侧边目录导航。

```css
.toc {
    position: sticky;
    top: 100px;
    max-height: calc(100vh - 150px);
    overflow-y: auto;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    margin-bottom: 2rem;
}

.toc-title {
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--color-primary);
}

.toc a {
    display: block;
    padding: 0.375rem 0.5rem;
    color: var(--color-neutral-500);
    text-decoration: none;
    font-size: 0.875rem;
    border-radius: 6px;
    transition: all 0.2s;
}

.toc a:hover {
    background: #f0f4ff;
    color: var(--color-primary);
}

.toc-level-2 {
    padding-left: 0;
    font-weight: 500;
    position: relative;
}

.toc-level-2::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--color-primary);
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.toc-level-2:hover::before,
.toc-level-2.active::before { opacity: 1; }

.toc-level-3 {
    padding-left: 1.5rem;
    font-size: 0.8rem;
    color: var(--color-neutral-500);
    position: relative;
}

.toc-level-3::before {
    content: '';
    position: absolute;
    left: 0.75rem; top: 12px;
    width: 4px; height: 4px;
    background: #94a3b8;
    border-radius: 50%;
}

.toc-toggle {
    position: absolute;
    left: -1rem; top: 50%;
    transform: translateY(-50%);
    width: 16px; height: 16px;
    border: none; background: transparent;
    cursor: pointer;
    color: var(--color-neutral-500);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    transition: transform 0.2s ease;
}

.toc-toggle:hover { color: var(--color-primary); }
.toc-toggle.collapsed { transform: translateY(-50%) rotate(-90deg); }

.toc-children {
    max-height: 500px;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.toc-children.collapsed { max-height: 0; }
```
