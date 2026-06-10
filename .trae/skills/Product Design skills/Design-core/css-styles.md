# CSS 样式规范（完整版）

完整的 CSS 样式规范，包含页面基础、卡片、表单、模态框、表格、分页、目录导航、反馈组件、Mermaid 图表、交互状态等所有样式。

> **单一数据源**：所有 CSS 样式统一定义在此文件，其他文件仅引用。

## 设计令牌速查（Top 10）

| 优先级 | 变量名 | 值 | 使用场景 |
|:------:|--------|-----|----------|
| ⭐⭐⭐ | `--color-primary` | `#2a3b7d` | 主按钮、导航、标题 |
| ⭐⭐⭐ | `--color-success` | `#00B42A` | 成功提示、启用状态 |
| ⭐⭐⭐ | `--color-danger` | `#F53F3F` | 错误提示、删除操作 |
| ⭐⭐ | `--color-warning` | `#FF7D00` | 警告提示 |
| ⭐⭐ | `--color-neutral-500` | `#6b7280` | 次要文字 |
| ⭐⭐ | `--text-primary` | `#1D2129` | 正文颜色 |
| ⭐⭐ | `--border-color` | `#e5e6eb` | 边框、分割线 |
| ⭐ | `--bg-color-page` | `#f2f3f5` | 页面背景 |
| ⭐ | `--radius-md` | `6px` | 按钮圆角 |
| ⭐ | `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | 卡片阴影 |

完整设计令牌见 [design-tokens.md](design-tokens.md)。

---

## 1. 页面基础

```css
.main-content { display: none; }
.main-content.active { display: block; }

body {
    font-family: system-ui, -apple-system, sans-serif;
    background-color: var(--bg-color-page);
    color: var(--color-neutral-700);
    min-height: 100vh;
}

.page { display: none; }
.page.active { display: block; }
```

---

## 2. 卡片布局

### 搜索卡片

```css
.search-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    padding: 16px;
    margin-bottom: 16px;
}

.search-card .search-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.search-card .search-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-card .search-label {
    font-size: 12px;
    color: var(--color-neutral-500);
    white-space: nowrap;
}

.search-card .search-buttons {
    display: flex;
    gap: 8px;
    margin-left: auto;
}
```

### 操作卡片

```css
.action-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    padding: 16px;
    margin-bottom: 16px;
}

.action-card .action-buttons {
    display: flex;
    justify-content: flex-start;
    gap: 12px;
}
```

### 按钮位置规则

| 按钮类型 | 位置 | 说明 |
|----------|------|------|
| 搜索 | 搜索卡片右侧 | 筛选数据 |
| 重置 | 搜索卡片右侧 | 清空筛选条件 |
| 新增 | 操作卡片左侧 | 主操作按钮 |
| 导出 | 操作卡片左侧 | 次要操作 |
| 批量操作 | 操作卡片左侧 | 需选中数据后启用 |

### 响应式

```css
@media (max-width: 768px) {
    .search-card .search-fields {
        flex-direction: column;
        align-items: stretch;
    }
    .search-card .search-field { width: 100%; }
    .search-card .search-buttons {
        margin-left: 0; width: 100%;
        justify-content: stretch;
    }
    .search-card .search-buttons .erp-btn { flex: 1; }
    .action-card .action-buttons { flex-wrap: wrap; }
}
```

---

## 3. 表单

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

---

## 4. 模态框

```css
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.modal-overlay.show { opacity: 1; visibility: visible; }

.modal-content {
    background-color: white;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%; max-width: 600px; max-height: 80vh;
    overflow-y: auto;
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-overlay.show .modal-content { transform: translateY(0) scale(1); opacity: 1; }

.modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.modal-body { padding: 20px; }

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: #f9fafb;
}

.close-btn {
    background-color: white;
    color: var(--color-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 8px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.close-btn:hover { background-color: var(--bg-color-page); }
```

---

## 5. 表格与分页

```css
.data-table { width: 100%; border-collapse: collapse; }

.data-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.data-table td {
    padding: 12px 16px;
    font-size: 14px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
}

.data-table tbody tr { transition: background-color 0.15s; }
.data-table tbody tr:hover { background-color: #f9fafb; }

.table-hover-row:hover { background-color: var(--bg-color-page); }
.table-hover-row.selected { background-color: rgba(42, 59, 125, 0.05); }

tr:nth-child(even) td { background: var(--color-neutral-50); }
.prose tr:hover td { background: rgba(42, 59, 125, 0.05); }

.table-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: var(--radius-sm);
    transition: all 0.15s;
    border: none; cursor: pointer; background: transparent;
}
.table-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
.table-btn-primary:hover { background-color: rgba(42, 59, 125, 0.1); color: var(--color-primary); }
.table-btn-danger:hover { background-color: rgba(245, 63, 63, 0.1); color: var(--color-danger); }

/* 分页 */
.pagination { display: flex; align-items: center; gap: 4px; }

.page-btn {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 32px; height: 32px; padding: 0 8px;
    font-size: 14px; border: 1px solid #e5e7eb; border-radius: var(--radius-md);
    background: white; color: #374151; cursor: pointer; transition: all 0.15s;
}
.page-btn:hover:not(:disabled):not(.active) { background: #f9fafb; border-color: #d1d5db; }
.page-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

---

## 6. 目录导航

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

.toc a:hover { background: rgba(42, 59, 125, 0.05); color: var(--color-primary); }
.toc a.active { background: rgba(42, 59, 125, 0.05); color: var(--color-primary); font-weight: 500; }

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

.toc-level-2:hover::before, .toc-level-2.active::before { opacity: 1; }

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

---

## 7. 反馈组件

### 状态徽章

```css
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 9999px;
    white-space: nowrap;
}

.status-badge-success { background-color: var(--color-success-bg, #E8FFEC); color: var(--color-success-text, #006B19); }
.status-badge-danger { background-color: var(--color-danger-bg, #FFECE8); color: var(--color-danger-text, #B3261E); }
.status-badge-warning { background-color: var(--color-warning-bg, #FFF7E8); color: var(--color-warning-text, #994D00); }
.status-badge-info { background-color: var(--color-info-bg, #E8F3FF); color: var(--color-info-text, #094D8C); }
```

### Alert 提示框

```css
.alert {
    display: flex;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    border-left: 4px solid;
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

.alert-success { background: #E8FFEC; border-left-color: var(--color-success); color: #006B19; }
.alert-warning { background: #FFF7E8; border-left-color: var(--color-warning); color: #994D00; }
.alert-danger { background: #FFECE8; border-left-color: var(--color-danger); color: #B3261E; }
.alert-info { background: #E8F3FF; border-left-color: var(--color-info); color: #094D8C; }

.alert-close {
    background: none; border: none; cursor: pointer;
    padding: 0.25rem;
    display: inline-flex; align-items: center; justify-content: center;
    opacity: 0.6; transition: opacity 0.2s;
}
.alert-close:hover { opacity: 1; }
```

### Toast 通知

```css
#toastContainer {
    position: fixed; top: 1rem; right: 1rem; z-index: 60;
    display: flex; flex-direction: column; gap: 0.75rem;
    pointer-events: none;
}

.toast-container {
    position: fixed; top: var(--spacing-4); right: var(--spacing-4); z-index: 60;
    display: flex; flex-direction: column; gap: var(--spacing-2); pointer-events: none;
}

.toast { pointer-events: auto; animation: toastSlideIn 0.3s ease-out; }

@keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes toastSlideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
}

.toast .toast-content {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    border-left: 4px solid;
    min-width: 320px;
}

.toast.hiding { animation: toastSlideOut 0.15s ease-in forwards; }
.toast-close-btn { transition: all 0.075s; }
.toast-close-btn:hover { color: var(--color-neutral-700); transform: rotate(90deg); }

.toast-progress {
    position: absolute; bottom: 0; left: 0; height: 3px;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    animation: toastProgress linear forwards;
}
@keyframes toastProgress { from { width: 100%; } to { width: 0%; } }

.toast-success .toast-content { border-left-color: var(--color-success); }
.toast-success { background-color: var(--color-success-bg, #E8FFEC); border-left: 4px solid var(--color-success); color: var(--color-success-text, #006B19); }
.toast-error .toast-content { border-left-color: var(--color-danger); }
.toast-error { background-color: var(--color-danger-bg, #FFECE8); border-left: 4px solid var(--color-danger); color: var(--color-danger-text, #B3261E); }
.toast-warning .toast-content { border-left-color: var(--color-warning); }
.toast-warning { background-color: var(--color-warning-bg, #FFF7E8); border-left: 4px solid var(--color-warning); color: var(--color-warning-text, #994D00); }
.toast-info .toast-content { border-left-color: var(--color-info); }
.toast-info { background-color: var(--color-info-bg, #E8F3FF); border-left: 4px solid var(--color-info); color: var(--color-info-text, #094D8C); }
```

### 空状态

```css
.empty-state { text-align: center; padding: var(--spacing-16) var(--spacing-4); animation: fadeInUp 0.5s ease-out; }

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.empty-state-icon { margin-bottom: var(--spacing-6); }
.empty-state-icon i { transition: transform 0.3s ease, color 0.3s ease; }
.empty-state:hover .empty-state-icon i { transform: scale(1.05); color: var(--color-neutral-400); }
```

### 骨架屏

```css
@keyframes skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.skeleton-shimmer {
    background: linear-gradient(90deg, var(--color-neutral-100) 25%, var(--border-color) 50%, var(--color-neutral-100) 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

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

---

## 8. Mermaid 图表放大预览

```css
.mermaid { cursor: zoom-in; transition: transform 0.3s ease; }
.mermaid:hover { transform: scale(1.02); }

.mermaid-modal {
    display: none;
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.85);
    z-index: 9999;
    justify-content: center;
    align-items: center;
    padding: 20px;
    backdrop-filter: blur(5px);
}

.mermaid-modal.active { display: flex; }

.mermaid-modal-content {
    background: white;
    border-radius: 16px;
    padding: 30px;
    max-width: 95%; max-height: 95%;
    overflow: auto;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    animation: modalZoomIn 0.3s ease-out;
}

@keyframes modalZoomIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}

.mermaid-modal-close {
    position: absolute;
    top: 15px; right: 15px;
    width: 40px; height: 40px;
    background: var(--color-neutral-100);
    border: none; border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    color: var(--color-neutral-700);
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
}

.mermaid-modal-close:hover { background: var(--border-color); transform: rotate(90deg); }

.mermaid-hint {
    position: absolute;
    bottom: 10px; right: 15px;
    background: rgba(42, 59, 125, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
}

.mermaid-container { position: relative; display: inline-block; }
.mermaid-container:hover .mermaid-hint { opacity: 1; }
```

---

## 9. 交互状态

### 输入框交互状态

```css
.form-input { border: 1px solid var(--border-color); background-color: var(--color-card-bg); transition: all 0.15s; }
.form-input:hover { border-color: var(--color-neutral-300); }
.form-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1); }
.form-input:disabled { background-color: var(--color-neutral-100); color: var(--color-neutral-400); cursor: not-allowed; border-color: var(--color-neutral-200); }
.form-input.error, .form-input.is-invalid { border-color: var(--color-danger); box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.1); }
.form-input.success, .form-input.is-valid { border-color: var(--color-success); box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.1); }

.form-select { border: 1px solid var(--border-color); background-color: var(--color-card-bg); transition: all 0.15s; cursor: pointer; }
.form-select:hover { border-color: var(--color-neutral-300); }
.form-select:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1); }
.form-select:disabled { background-color: var(--color-neutral-100); color: var(--color-neutral-400); cursor: not-allowed; border-color: var(--color-neutral-200); }
```

### 下拉菜单

```css
.dropdown-menu { opacity: 0; visibility: hidden; transition: all 0.3s; transform: translateY(-8px); }
.dropdown-menu.show, .group:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
.dropdown-item { transition: background-color 0.15s; }
.dropdown-item:hover { background-color: var(--color-neutral-100); }
.dropdown-item.active { background-color: rgba(42, 59, 125, 0.05); color: var(--color-primary); }
```

### 导航链接

```css
.nav-link { transition: background-color 0.15s; }
.nav-link:hover { background-color: rgba(42, 59, 125, 0.8); }
.nav-link.active { background-color: rgba(42, 59, 125, 0.9); }
```

### 旋转与脉冲动画

```css
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

### 面包屑

```css
.breadcrumb-item a { color: var(--color-neutral-500); transition: color 0.15s; }
.breadcrumb-item a:hover { color: var(--color-primary); }
.breadcrumb-item.active { color: var(--color-primary); font-weight: 500; }
```

---

## 使用规范

1. **优先使用CSS变量**：禁止硬编码颜色值
2. **响应式优先**：移动端优先设计
3. **动画时长**：默认使用 300ms（标准过渡），150ms（快速交互）
4. **层级管理**：严格按照 z-index 层级规范
5. **命名规范**：使用语义化的类名，避免过度嵌套
6. **性能优化**：优先使用 transform 和 opacity 实现动画
