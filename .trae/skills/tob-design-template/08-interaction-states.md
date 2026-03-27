# 交互状态规范

本文件定义TOB产品的交互状态规范，确保所有模块保持一致的交互体验。

## 1. 按钮交互状态

### 1.1 主按钮（Primary Button）

```css
/* 默认状态 */
.erp-btn-primary {
    background-color: #2a3b7d;
    color: white;
    border-color: #2a3b7d;
    transition: all 0.2s ease;
}

/* 悬停状态 */
.erp-btn-primary:hover {
    background-color: #3a4ca7;
    border-color: #3a4ca7;
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按下状态 */
.erp-btn-primary:active {
    transform: translateY(0);
    opacity: 0.8;
}

/* 禁用状态 */
.erp-btn-primary:disabled {
    background-color: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
}

/* 加载状态 */
.erp-btn-primary.loading {
    position: relative;
    color: transparent;
}
.erp-btn-primary.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
```

### 1.2 次要按钮（Secondary Button）

```css
/* 默认状态 */
.erp-btn-secondary {
    background-color: white;
    color: #525252;
    border-color: #d4d4d4;
    transition: all 0.2s ease;
}

/* 悬停状态 */
.erp-btn-secondary:hover {
    border-color: #a3a3a3;
    color: #262626;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按下状态 */
.erp-btn-secondary:active {
    transform: translateY(0);
}

/* 禁用状态 */
.erp-btn-secondary:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### 1.3 危险按钮（Danger Button）

```css
/* 默认状态 */
.erp-btn-danger {
    background-color: #F53F3F;
    color: white;
    border-color: #F53F3F;
    transition: all 0.2s ease;
}

/* 悬停状态 */
.erp-btn-danger:hover {
    background-color: #ff5c5c;
    border-color: #ff5c5c;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按下状态 */
.erp-btn-danger:active {
    transform: translateY(0);
}

/* 禁用状态 */
.erp-btn-danger:disabled {
    background-color: #fca5a5;
    border-color: #fca5a5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### 1.4 警告按钮（Warning Button）

```css
/* 默认状态 */
.erp-btn-warning {
    background-color: #FF7D00;
    color: white;
    border-color: #FF7D00;
    transition: all 0.2s ease;
}

/* 悬停状态 */
.erp-btn-warning:hover {
    background-color: #ff952e;
    border-color: #ff952e;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按下状态 */
.erp-btn-warning:active {
    transform: translateY(0);
}

/* 禁用状态 */
.erp-btn-warning:disabled {
    background-color: #fcd34d;
    border-color: #fcd34d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

## 2. 输入框交互状态

### 2.1 文本输入框

```css
/* 默认状态 */
.form-input {
    border: 1px solid #E5E7EB;
    background-color: white;
    transition: all 0.2s ease;
}

/* 悬停状态 */
.form-input:hover {
    border-color: #d1d5db;
}

/* 聚焦状态 */
.form-input:focus {
    outline: none;
    border-color: #2a3b7d;
    box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1);
}

/* 禁用状态 */
.form-input:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    border-color: #e5e7eb;
}

/* 错误状态 */
.form-input.error {
    border-color: #F53F3F;
    box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.1);
}

/* 成功状态 */
.form-input.success {
    border-color: #00B42A;
    box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.1);
}
```

### 2.2 下拉选择框

```css
/* 默认状态 */
.form-select {
    border: 1px solid #E5E7EB;
    background-color: white;
    transition: all 0.2s ease;
    cursor: pointer;
}

/* 悬停状态 */
.form-select:hover {
    border-color: #d1d5db;
}

/* 聚焦状态 */
.form-select:focus {
    outline: none;
    border-color: #2a3b7d;
    box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1);
}

/* 禁用状态 */
.form-select:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
}

/* 选项禁用状态 */
.form-select option:disabled {
    color: #9ca3af;
    background-color: #f3f4f6;
}

/* 选项悬停状态 */
.form-select option:not(:disabled):hover {
    background-color: #e5e7eb;
}
```

## 3. 标签页交互状态

### 3.1 主标签切换

```css
/* 标签容器 */
.tabs {
    display: flex;
    gap: 2px;
    background: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%);
    padding: 4px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(42, 59, 125, 0.3);
}

/* 默认状态 */
.tab {
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 悬停状态 */
.tab:hover {
    color: white;
    transform: translateY(-1px);
}

/* 激活状态 */
.tab.active {
    background: white;
    color: #2a3b7d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-weight: 600;
}

/* 禁用状态 */
.tab:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}
```

## 4. 模态框交互状态

### 4.1 模态框动画

```css
/* 遮罩层 */
.modal-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

/* 显示状态 */
.modal-overlay.show {
    opacity: 1;
    visibility: visible;
}

/* 内容区域 */
.modal-content {
    transform: translateY(-20px);
    transition: transform 0.3s ease;
}

/* 显示状态 */
.modal-overlay.show .modal-content {
    transform: translateY(0);
}
```

### 4.2 Mermaid 图表放大预览

```css
/* 图表默认状态 */
.mermaid {
    cursor: zoom-in;
    transition: transform 0.3s ease;
}

/* 图表悬停状态 */
.mermaid:hover {
    transform: scale(1.02);
}

/* 放大模态框 */
.mermaid-modal {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
}

/* 放大动画 */
.mermaid-modal-content {
    animation: modalZoomIn 0.3s ease-out;
}

@keyframes modalZoomIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 关闭按钮 */
.mermaid-modal-close:hover {
    background: #e5e7eb;
    transform: rotate(90deg);
}
```

## 5. 表格行交互状态

### 5.1 表格行悬停

```css
/* 默认状态 */
.table-hover-row {
    transition: background-color 0.2s ease;
}

/* 悬停状态 */
.table-hover-row:hover {
    background-color: #f9fafb;
}

/* 选中状态 */
.table-hover-row.selected {
    background-color: #f0f4ff;
}

/* 斑马纹 */
tr:nth-child(even) td {
    background: #f9fafb;
}

/* PRD 表格悬停 */
.prose tr:hover td {
    background: #f0f4ff;
}
```

### 5.2 表格内按钮

```css
/* 默认状态 */
.table-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    background: transparent;
}

/* 悬停状态 */
.table-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 主要操作按钮 */
.table-btn-primary:hover {
    background-color: rgba(42, 59, 125, 0.1);
}

/* 危险操作按钮 */
.table-btn-danger:hover {
    background-color: rgba(245, 63, 63, 0.1);
}
```

## 6. 导航菜单交互状态

### 6.1 下拉菜单

```css
/* 菜单容器 */
.dropdown-menu {
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

/* 显示状态 */
.dropdown-menu.show,
.group:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
}

/* 菜单项默认状态 */
.dropdown-item {
    transition: background-color 0.2s ease;
}

/* 菜单项悬停状态 */
.dropdown-item:hover {
    background-color: #f3f4f6;
}

/* 菜单项激活状态 */
.dropdown-item.active {
    background-color: #f0f4ff;
    color: #2a3b7d;
}
```

### 6.2 导航链接

```css
/* 默认状态 */
.nav-link {
    transition: background-color 0.2s ease;
}

/* 悬停状态 */
.nav-link:hover {
    background-color: rgba(42, 59, 125, 0.8);
}

/* 激活状态 */
.nav-link.active {
    background-color: rgba(42, 59, 125, 0.9);
}
```

## 7. 目录导航交互状态

### 7.1 目录链接

```css
/* 默认状态 */
.toc a {
    color: #6b7280;
    transition: all 0.2s;
}

/* 悬停状态 */
.toc a:hover {
    background: #f0f4ff;
    color: #2a3b7d;
}

/* 激活状态 */
.toc a.active {
    background: #f0f4ff;
    color: #2a3b7d;
    font-weight: 500;
}
```

### 7.2 目录层级指示器

```css
/* 二级目录指示器 */
.toc-level-2::before {
    content: '';
    position: absolute;
    left: 0;
    width: 3px;
    background: #2a3b7d;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.toc-level-2:hover::before,
.toc-level-2.active::before {
    opacity: 1;
}

/* 三级目录指示器 */
.toc-level-3::before {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: #94a3b8;
    border-radius: 50%;
}
```

### 7.3 目录折叠

```css
/* 折叠按钮 */
.toc-toggle {
    transition: transform 0.2s ease;
}

.toc-toggle:hover {
    color: #2a3b7d;
}

.toc-toggle.collapsed {
    transform: translateY(-50%) rotate(-90deg);
}

/* 子目录容器 */
.toc-children {
    max-height: 500px;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.toc-children.collapsed {
    max-height: 0;
}
```

## 8. 状态徽章交互

### 8.1 徽章状态

```css
/* 启用状态 */
.status-badge-success {
    background-color: #dcfce7;
    color: #166534;
}

/* 禁用状态 */
.status-badge-danger {
    background-color: #fee2e2;
    color: #991b1b;
}

/* 警告状态 */
.status-badge-warning {
    background-color: #fef3c7;
    color: #92400e;
}

/* 信息状态 */
.status-badge-info {
    background-color: #dbeafe;
    color: #1e40af;
}
```

## 9. 加载状态

### 9.1 加载动画

```css
/* 旋转加载 */
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* 脉冲加载 */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 9.2 骨架屏

```css
.skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
```

## 10. 过渡动画规范

### 10.1 动画时长

| 类型 | 时长 | 使用场景 |
|------|------|----------|
| 快速 | 0.15s | 按钮点击、开关切换 |
| 标准 | 0.2s | 悬停、聚焦、颜色变化 |
| 中等 | 0.3s | 模态框、下拉菜单、展开收起 |
| 慢速 | 0.5s | 页面切换、大型动画 |

### 10.2 缓动函数

```css
/* 标准缓动 */
transition-timing-function: ease;

/* 平滑缓动 */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* 弹性缓动 */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* 线性 */
transition-timing-function: linear;
```

### 10.3 缩放淡入动画

```css
.scale-fade-in {
    animation: scaleFadeIn 0.3s ease-out forwards;
}

@keyframes scaleFadeIn {
    0% {
        opacity: 0;
        transform: scale(0.95);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.scale-fade-out {
    animation: scaleFadeOut 0.2s ease-in forwards;
}

@keyframes scaleFadeOut {
    0% {
        opacity: 1;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(0.95);
    }
}
```
