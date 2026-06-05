# 交互状态规范

完整的交互状态规范，包含输入框、模态框、导航、表格、目录导航、徽章与加载状态等所有交互状态。

## 输入框交互状态

### 文本输入框

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
```

### 下拉选择框

```css
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

## 模态框交互状态

### 遮罩层动画

```css
.modal-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0; visibility: hidden;
    transition: opacity var(--duration-300) var(--ease-smooth), visibility var(--duration-300) var(--ease-smooth);
}
.modal-overlay.show { opacity: 1; visibility: visible; }
```

### 内容区动画

```css
.modal-content {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
    transition: transform var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1), opacity var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-overlay.show .modal-content { transform: translateY(0) scale(1); opacity: 1; }
```

### Mermaid放大

```css
.mermaid { cursor: zoom-in; transition: transform var(--duration-300) var(--ease-smooth); }
.mermaid:hover { transform: scale(1.02); }

.mermaid-modal { background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(5px); }
.mermaid-modal-content { animation: modalZoomIn var(--duration-300) var(--ease-out); }
@keyframes modalZoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

.mermaid-modal-close:hover { background: var(--color-neutral-200); transform: rotate(90deg); transition: all var(--duration-150) var(--ease-bounce); }
```

## 导航交互状态

### 下拉菜单

```css
.dropdown-menu {
    opacity: 0; visibility: hidden;
    transition: all var(--duration-300) var(--ease-smooth);
    transform: translateY(-8px);
}
.dropdown-menu.show, .group:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }

.dropdown-item { transition: background-color var(--duration-150) var(--ease-smooth); }
.dropdown-item:hover { background-color: var(--color-neutral-100); }
.dropdown-item.active { background-color: rgba(42, 59, 125, 0.05); color: var(--color-primary); }
```

### 导航链接

```css
.nav-link { transition: background-color var(--duration-150) var(--ease-smooth); }
.nav-link:hover { background-color: rgba(42, 59, 125, 0.8); }
.nav-link.active { background-color: rgba(42, 59, 125, 0.9); }
```

## 表格行交互状态

### 行悬停与选中

```css
.table-hover-row { transition: background-color var(--duration-150) var(--ease-smooth); }
.table-hover-row:hover { background-color: var(--color-neutral-50); }
.table-hover-row.selected { background-color: rgba(42, 59, 125, 0.05); }

tr:nth-child(even) td { background: var(--color-neutral-50); }
.prose tr:hover td { background: rgba(42, 59, 125, 0.05); }
```

### 表格内按钮

```css
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

## 目录导航交互状态

### 目录链接

```css
.toc a { color: var(--color-neutral-500); transition: all var(--duration-150) var(--ease-smooth); }
.toc a:hover { background: rgba(42, 59, 125, 0.05); color: var(--color-primary); }
.toc a.active { background: rgba(42, 59, 125, 0.05); color: var(--color-primary); font-weight: var(--font-weight-medium); }
```

### 层级指示器

```css
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
```

### 折叠功能

```css
.toc-toggle { transition: transform var(--duration-150) var(--ease-smooth); }
.toc-toggle:hover { color: var(--color-primary); }
.toc-toggle.collapsed { transform: translateY(-50%) rotate(-90deg); }

.toc-children { max-height: 500px; overflow: hidden; transition: max-height var(--duration-300) var(--ease-smooth); }
.toc-children.collapsed { max-height: 0; }
```

## 徽章与加载状态

### 状态徽章

```css
.status-badge-success { background-color: var(--color-success-bg, #E8FFEC); color: var(--color-success-text, #006B19); }
.status-badge-danger { background-color: var(--color-danger-bg, #FFECE8); color: var(--color-danger-text, #B3261E); }
.status-badge-warning { background-color: var(--color-warning-bg, #FFF7E8); color: var(--color-warning-text, #994D00); }
.status-badge-info { background-color: var(--color-info-bg, #E8F3FF); color: var(--color-info-text, #094D8C); }
```

### 旋转动画

```css
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
```

### 脉冲动画

```css
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

### 骨架屏

```css
.skeleton {
    background: linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-200) 50%, var(--color-neutral-100) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    border-radius: var(--radius-default);
}
@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.skeleton-text { height: var(--font-size-base); margin-bottom: var(--spacing-2); }
.skeleton-title { height: var(--font-size-xl); width: 60%; margin-bottom: var(--spacing-3); }
.skeleton-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); }
```

## 使用规范

1. **动画时长**：默认使用150ms（快速交互）和300ms（标准过渡）
2. **缓动函数**：默认使用smooth缓动，特殊效果使用bounce
3. **状态反馈**：所有交互元素必须有明确的状态反馈
4. **性能优化**：避免过度使用动画，优先使用transform和opacity
5. **无障碍**：确保动画不会影响可访问性
