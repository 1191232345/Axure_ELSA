# 交互状态规范 (v2.1)

本文件定义TOB产品的交互状态规范，确保所有模块保持一致的交互体验。

> **v2.1 更新说明**：
> - ✨ 全面升级为**设计令牌系统**（Design Tokens），消除80+处硬编码颜色值
> - 🆕 新增 **v2.0 组件交互状态**（Toast通知/标签页/骨架屏/空状态/面包屑）
> - 🎨 动画参数对齐 [00-design-tokens.md](00-design-tokens.md) 的统一标准
> - 🌙 基础暗色模式支持框架

---

## 1. 按钮交互状态

### 1.1 主按钮（Primary Button）

```css
/* 默认状态 */
.erp-btn-primary {
    background-color: var(--color-primary);
    color: var(--color-neutral-50);
    border-color: var(--color-primary);
    transition: all var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.erp-btn-primary:hover {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary-light);
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

/* 按下状态 */
.erp-btn-primary:active {
    transform: translateY(0);
    opacity: 0.8;
}

/* 禁用状态 */
.erp-btn-primary:disabled,
.erp-btn-primary[disabled] {
    background-color: var(--color-neutral-400);
    border-color: var(--color-neutral-400);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
}

/* 加载状态 */
.erp-btn-primary.loading {
    position: relative;
    color: transparent;
    pointer-events: none;
}
.erp-btn-primary.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-neutral-50);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
```

### 1.2 次要按钮（Secondary Button）

```css
/* 默认状态 */
.erp-btn-secondary {
    background-color: var(--color-card-bg);
    color: var(--color-neutral-600);
    border-color: var(--border-color);
    transition: all var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.erp-btn-secondary:hover {
    border-color: var(--color-neutral-300);
    color: var(--color-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

/* 按下状态 */
.erp-btn-secondary:active {
    transform: translateY(0);
}

/* 禁用状态 */
.erp-btn-secondary:disabled,
.erp-btn-secondary[disabled] {
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-400);
    border-color: var(--color-neutral-200);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### 1.3 危险按钮（Danger Button）

```css
/* 默认状态 */
.erp-btn-danger {
    background-color: var(--color-danger);
    color: var(--color-neutral-50);
    border-color: var(--color-danger);
    transition: all var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.erp-btn-danger:hover {
    background-color: var(--color-danger-light, #F97070);
    border-color: var(--color-danger-light, #F97070);
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

/* 按下状态 */
.erp-btn-danger:active {
    transform: translateY(0);
}

/* 禁用状态 */
.erp-btn-danger:disabled,
.erp-btn-danger[disabled] {
    background-color: var(--color-danger-bg, #FFECE8);
    border-color: var(--color-danger-bg, #FFECE8);
    color: var(--color-danger-text, #B3261E);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### 1.4 警告按钮（Warning Button）

```css
/* 默认状态 */
.erp-btn-warning {
    background-color: var(--color-warning);
    color: var(--color-neutral-50);
    border-color: var(--color-warning);
    transition: all var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.erp-btn-warning:hover {
    background-color: var(--color-warning-light, #FF9933);
    border-color: var(--color-warning-light, #FF9933);
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

/* 按下状态 */
.erp-btn-warning:active {
    transform: translateY(0);
}

/* 禁用状态 */
.erp-btn-warning:disabled,
.erp-btn-warning[disabled] {
    background-color: var(--color-warning-bg, #FFF7E8);
    border-color: var(--color-warning-bg, #FFF7E8);
    color: var(--color-warning-text, #994D00);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### 1.5 成功按钮（Success Button）- v2.1新增

```css
/* 默认状态 */
.erp-btn-success {
    background-color: var(--color-success);
    color: var(--color-neutral-50);
    border-color: var(--color-success);
    transition: all var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.erp-btn-success:hover {
    background-color: var(--color-success-light, #33D161);
    border-color: var(--color-success-light, #33D161);
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

/* 按下/禁用状态同上模式... */
```

---

## 2. 输入框交互状态

### 2.1 文本输入框

```css
/* 默认状态 */
.form-input {
    border: 1px solid var(--border-color);
    background-color: var(--color-card-bg);
    transition: all var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.form-input:hover {
    border-color: var(--color-neutral-300);
}

/* 聚焦状态 */
.form-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1); /* 保持主色调透明度 */
}

/* 禁用状态 */
.form-input:disabled,
.form-input[disabled] {
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-400);
    cursor: not-allowed;
    border-color: var(--color-neutral-200);
}

/* 错误状态 */
.form-input.error,
.form-input.is-invalid {
    border-color: var(--color-danger);
    box-shadow: 0 0 0 2px rgba(245, 63, 63, 0.1);
}

/* 成功状态 */
.form-input.success,
.form-input.is-valid {
    border-color: var(--color-success);
    box-shadow: 0 0 0 2px rgba(0, 180, 42, 0.1);
}
```

### 2.2 下拉选择框

```css
/* 默认状态 */
.form-select {
    border: 1px solid var(--border-color);
    background-color: var(--color-card-bg);
    transition: all var(--duration-150) var(--ease-smooth);
    cursor: pointer;
}

/* 悬停/聚焦/禁用状态同 input 模式 */

/* 选项禁用状态 */
.form-select option:disabled {
    color: var(--color-neutral-400);
    background-color: var(--color-neutral-100);
}

/* 选项悬停状态 */
.form-select option:not(:disabled):hover {
    background-color: var(--color-neutral-100);
}
```

---

## 3. 标签页交互状态（v2.1 增强）

### 3.1 线型标签页（Line Tabs）

```css
/* 标签容器 */
.tabs-container {
    width: 100%;
}

.tabs-header {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--color-neutral-200);
}

/* 标签项默认状态 */
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

/* 悬停状态 */
.tab-item:hover {
    color: var(--color-primary);
    background-color: var(--color-neutral-50);
}

/* 激活状态 */
.tab-item.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
}

/* 禁用状态 */
.tab-item.disabled,
.tab-item:disabled {
    color: var(--color-neutral-300);
    cursor: not-allowed;
    pointer-events: none;
}

/* 内容面板 */
.tabs-content {
    padding-top: var(--spacing-4);
}

.tab-pane {
    display: none;
    animation: tabFadeIn var(--duration-300) var(--ease-out);
}

.tab-pane.active {
    display: block;
}

@keyframes tabFadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### 3.2 卡片型标签页（Pill Tabs）

```css
.pills-container {
    display: inline-flex;
    gap: var(--spacing-1);
    padding: var(--spacing-1);
    background-color: var(--color-neutral-100);
    border-radius: var(--radius-2xl);
}

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

.pill-item:hover {
    color: var(--color-primary);
    background-color: var(--color-neutral-50);
}

.pill-item.active {
    color: var(--color-neutral-50);
    background-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
}
```

---

## 4. 模态框交互状态

### 4.1 模态框动画

```css
/* 遮罩层 */
.modal-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--duration-300) var(--ease-smooth),
                visibility var(--duration-300) var(--ease-smooth);
}

/* 显示状态 */
.modal-overlay.show {
    opacity: 1;
    visibility: visible;
}

/* 内容区域 */
.modal-content {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
    transition: transform var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1),
                opacity var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
}

/* 显示状态 */
.modal-overlay.show .modal-content {
    transform: translateY(0) scale(1);
    opacity: 1;
}
```

### 4.2 Mermaid 图表放大预览

```css
/* 图表默认状态 */
.mermaid {
    cursor: zoom-in;
    transition: transform var(--duration-300) var(--ease-smooth);
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
    animation: modalZoomIn var(--duration-300) var(--ease-out);
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
    background: var(--color-neutral-200);
    transform: rotate(90deg);
    transition: all var(--duration-150) var(--ease-bounce);
}
```

---

## 5. 表格行交互状态

### 5.1 表格行悬停

```css
/* 默认状态 */
.table-hover-row {
    transition: background-color var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.table-hover-row:hover {
    background-color: var(--color-neutral-50);
}

/* 选中状态 */
.table-hover-row.selected {
    background-color: rgba(42, 59, 125, 0.05); /* 主色调浅底 */
}

/* 斑马纹 */
tr:nth-child(even) td {
    background: var(--color-neutral-50);
}

/* PRD 表格悬停 */
.prose tr:hover td {
    background: rgba(42, 59, 125, 0.05);
}
```

### 5.2 表格内按钮

```css
/* 默认状态 */
.table-btn {
    padding: var(--spacing-1) var(--spacing-2);
    font-size: var(--font-size-xs);
    border-radius: var(--radius-sm);
    transition: all var(--duration-150) var(--ease-smooth);
    border: none;
    cursor: pointer;
    background: transparent;
}

/* 悬停状态 */
.table-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

/* 主要操作按钮 */
.table-btn-primary:hover {
    background-color: rgba(42, 59, 125, 0.1);
    color: var(--color-primary);
}

/* 危险操作按钮 */
.table-btn-danger:hover {
    background-color: rgba(245, 63, 63, 0.1);
    color: var(--color-danger);
}
```

---

## 6. 导航菜单交互状态

### 6.1 下拉菜单

```css
/* 菜单容器 */
.dropdown-menu {
    opacity: 0;
    visibility: hidden;
    transition: all var(--duration-300) var(--ease-smooth);
    transform: translateY(-8px);
}

/* 显示状态 */
.dropdown-menu.show,
.group:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

/* 菜单项默认状态 */
.dropdown-item {
    transition: background-color var(--duration-150) var(--ease-smooth);
}

/* 菜单项悬停状态 */
.dropdown-item:hover {
    background-color: var(--color-neutral-100);
}

/* 菜单项激活状态 */
.dropdown-item.active {
    background-color: rgba(42, 59, 125, 0.05);
    color: var(--color-primary);
}
```

### 6.2 导航链接

```css
/* 默认状态 */
.nav-link {
    transition: background-color var(--duration-150) var(--ease-smooth);
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

---

## 7. 目录导航交互状态

### 7.1 目录链接

```css
/* 默认状态 */
.toc a {
    color: var(--color-neutral-500);
    transition: all var(--duration-150) var(--ease-smooth);
}

/* 悬停状态 */
.toc a:hover {
    background: rgba(42, 59, 125, 0.05);
    color: var(--color-primary);
}

/* 激活状态 */
.toc a.active {
    background: rgba(42, 59, 125, 0.05);
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
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
    background: var(--color-primary);
    border-radius: 3px;
    opacity: 0;
    transition: opacity var(--duration-150) var(--ease-smooth);
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
    background: var(--color-neutral-400);
    border-radius: 50%;
}
```

### 7.3 目录折叠

```css
/* 折叠按钮 */
.toc-toggle {
    transition: transform var(--duration-150) var(--ease-smooth);
}

.toc-toggle:hover {
    color: var(--color-primary);
}

.toc-toggle.collapsed {
    transform: translateY(-50%) rotate(-90deg);
}

/* 子目录容器 */
.toc-children {
    max-height: 500px;
    overflow: hidden;
    transition: max-height var(--duration-300) var(--ease-smooth);
}

.toc-children.collapsed {
    max-height: 0;
}
```

---

## 8. 状态徽章交互

### 8.1 徽章状态

```css
/* 启用状态 */
.status-badge-success {
    background-color: var(--color-success-bg, #E8FFEC);
    color: var(--color-success-text, #006B19);
}

/* 禁用状态 */
.status-badge-danger {
    background-color: var(--color-danger-bg, #FFECE8);
    color: var(--color-danger-text, #B3261E);
}

/* 警告状态 */
.status-badge-warning {
    background-color: var(--color-warning-bg, #FFF7E8);
    color: var(--color-warning-text, #994D00);
}

/* 信息状态 */
.status-badge-info {
    background-color: var(--color-info-bg, #E8F3FF);
    color: var(--color-info-text, #094D8C);
}
```

---

## 9. 加载状态

### 9.1 加载动画

```css
/* 旋转加载 */
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* 脉冲加载 */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 9.2 骨架屏增强版（v2.1 更新）

```css
/* 基础骨架屏 */
.skeleton {
    background: linear-gradient(
        90deg,
        var(--color-neutral-100) 25%,
        var(--color-neutral-200) 50%,
        var(--color-neutral-100) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    border-radius: var(--radius-default);
}

@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* 骨架屏变体 */
.skeleton-text {
    height: var(--font-size-base);
    margin-bottom: var(--spacing-2);
}

.skeleton-title {
    height: var(--font-size-xl);
    width: 60%;
    margin-bottom: var(--spacing-3);
}

.skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
}

.skeleton-image {
    width: 100%;
    height: 200px;
    border-radius: var(--radius-lg);
}

/* 表格骨架屏 */
.skeleton-table-row {
    display: flex;
    gap: var(--spacing-4);
    padding: var(--spacing-3) 0;
    border-bottom: 1px solid var(--color-neutral-100);
}

.skeleton-cell {
    flex: 1;
    height: var(--font-size-base);
    border-radius: var(--radius-sm);
}
```

---

## 10. Toast 通知交互状态（v2.1 新增）

### 10.1 Toast 入场/退场动画

```css
/* Toast 容器 */
.toast-container {
    position: fixed;
    top: var(--spacing-4);
    right: var(--spacing-4);
    z-index: var(--z-index-toast, 60);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
    pointer-events: none;
}

/* Toast 主体 */
.toast {
    min-width: 320px;
    max-width: 480px;
    padding: var(--spacing-3) var(--spacing-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-3);

    /* 入场动画 */
    animation: toastSlideIn var(--duration-300) var(--ease-out);
}

@keyframes toastSlideIn {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 退出动画 */
.toast.hiding {
    animation: toastSlideOut var(--duration-150) var(--ease-in) forwards;
}

@keyframes toastSlideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

/* 关闭按钮悬停 */
.toast-close-btn {
    transition: all var(--duration-75) var(--ease-smooth);
}

.toast-close-btn:hover {
    color: var(--color-neutral-700);
    transform: rotate(90deg);
}

/* 进度条动画 */
.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    animation: toastProgress linear forwards;
}

@keyframes toastProgress {
    from { width: 100%; }
    to { width: 0%; }
}
```

### 10.2 Toast 类型样式

```css
/* 成功类型 */
.toast-success {
    background-color: var(--color-success-bg, #E8FFEC);
    border-left: 4px solid var(--color-success);
    color: var(--color-success-text, #006B19);
}

.toast-success .toast-icon {
    color: var(--color-success);
}

/* 错误类型 */
.toast-error {
    background-color: var(--color-danger-bg, #FFECE8);
    border-left: 4px solid var(--color-danger);
    color: var(--color-danger-text, #B3261E);
}

.toast-error .toast-icon {
    color: var(--color-danger);
}

/* 警告类型 */
.toast-warning {
    background-color: var(--color-warning-bg, #FFF7E8);
    border-left: 4px solid var(--color-warning);
    color: var(--color-warning-text, #994D00);
}

.toast-warning .toast-icon {
    color: var(--color-warning);
}

/* 信息类型 */
.toast-info {
    background-color: var(--color-info-bg, #E8F3FF);
    border-left: 4px solid var(--color-info, #1677FF);
    color: var(--color-info-text, #094D8C);
}

.toast-info .toast-icon {
    color: var(--color-info, #1677FF);
}
```

---

## 11. 空状态交互状态（v2.1 新增）

### 11.1 空状态入场动画

```css
.empty-state {
    text-align: center;
    padding: var(--spacing-16) var(--spacing-4);
}

.empty-state-icon {
    margin-bottom: var(--spacing-6);
    /* 入场动画 */
    animation: emptyStateFadeInUp var(--duration-500) var(--ease-out);
}

@keyframes emptyStateFadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 图标悬停微交互 */
.empty-state-icon i {
    transition: transform var(--duration-300) var(--ease-bounce);
}

.empty-state:hover .empty-state-icon i {
    transform: scale(1.05);
}
```

### 11.2 空状态操作按钮

```css
.empty-state .erp-btn {
    transition: all var(--duration-150) var(--ease-smooth);
}

.empty-state .erp-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}
```

---

## 12. 面包屑交互状态（v2.1 新增）

### 12.1 面包屑链接

```css
.breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-size: var(--font-size-sm);
}

.breadcrumb-item {
    color: var(--color-neutral-500);
    transition: color var(--duration-150) var(--ease-smooth);
}

.breadcrumb-item:not(.active):hover {
    color: var(--color-primary);
}

.breadcrumb-item.active {
    color: var(--color-neutral-700);
    font-weight: var(--font-weight-medium);
    cursor: default;
}

/* 分隔符 */
.breadcrumb-separator {
    color: var(--color-neutral-300);
    font-size: var(--font-size-xs);
}
```

### 12.2 可编辑面包屑

```css
.breadcrumb-editable {
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    transition: all var(--duration-150) var(--ease-smooth);
}

.breadcrumb-editable:hover {
    background-color: var(--color-neutral-50);
    border-color: var(--color-neutral-200);
}

.breadcrumb-editable:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1);
}
```

---

## 13. Alert 提示框交互状态（v2.1 新增）

### 13.1 Alert 内联提示

```css
.alert {
    padding: var(--spacing-3) var(--spacing-4);
    border-radius: var(--radius-default);
    border-left: 4px solid;
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-3);
    margin-bottom: var(--spacing-4);

    /* 入场动画 */
    animation: alertFadeIn var(--duration-300) var(--ease-out);
}

@keyframes alertFadeIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Alert 类型复用 Toast 颜色令牌 */
.alert-success {
    background-color: var(--color-success-bg, #E8FFEC);
    border-color: var(--color-success);
    color: var(--color-success-text, #006B19);
}

.alert-error {
    background-color: var(--color-danger-bg, #FFECE8);
    border-color: var(--color-danger);
    color: var(--color-danger-text, #B3261E);
}

.alert-warning {
    background-color: var(--color-warning-bg, #FFF7E8);
    border-color: var(--color-warning);
    color: var(--color-warning-text, #994D00);
}

.alert-info {
    background-color: var(--color-info-bg, #E8F3FF);
    border-color: var(--color-info, #1677FF);
    color: var(--color-info-text, #094D8C);
}

/* 可关闭 Alert */
.alert-dismissible .alert-close {
    transition: all var(--duration-75) var(--ease-smooth);
}

.alert-dismissible .alert-close:hover {
    color: var(--color-neutral-700);
}
```

---

## 14. 过渡动画规范

### 14.1 动画时长（对齐设计令牌）

| 类型 | 时长 | CSS变量 | 使用场景 |
|------|------|---------|----------|
| 极快 | 75ms | `var(--duration-75)` | 按钮 hover、焦点变化 |
| 快速 | 150ms | `var(--duration-150)` | 悬停、聚焦、颜色变化 |
| 标准 | 300ms | `var(--duration-300)` | 模态框、下拉菜单、展开收起 |
| 中等 | 500ms | `var(--duration-500)` | 页面切换、大型动画 |

### 14.2 缓动函数（对齐设计令牌）

```css
/* 平滑过渡（默认） */
transition-timing-function: var(--ease-smooth);  /* cubic-bezier(0.4, 0, 0.2, 1) */

/* 缓入 */
transition-timing-function: var(--ease-in);      /* cubic-bezier(0.4, 0, 1, 1) */

/* 缓出 */
transition-timing-function: var(--ease-out);     /* cubic-bezier(0, 0, 0.2, 1) */

/* 弹跳效果 */
transition-timing-function: var(--ease-bounce);  /* cubic-bezier(0.68, -0.55, 0.265, 1.55) */
```

### 14.3 缩放淡入动画

```css
.scale-fade-in {
    animation: scaleFadeIn var(--duration-300) var(--ease-out) forwards;
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
    animation: scaleFadeOut var(--duration-150) var(--ease-in) forwards;
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

---

## 15. 暗色模式基础支持（v2.1 新增框架）

> ⚠️ **注意**：以下为基础框架，完整暗色模式实现需配合具体业务场景定制

### 15.1 CSS 变量覆盖示例

```css
@media (prefers-color-scheme: dark) {
    :root {
        --color-primary: #5B8DEF;
        --color-primary-light: #7AA3F5;

        --color-neutral-50: #1D2129;
        --color-neutral-100: #272D38;
        --color-neutral-200: #363C49;
        --color-neutral-300: #4E5563;
        --color-neutral-400: #86909C;
        --color-neutral-500: #A6ADBA;
        --color-neutral-600: #C9CDD4;
        --color-neutral-700: #E5E6EB;
        --color-neutral-800: #F2F3F5;
        --color-neutral-900: #FFFFFF;

        --border-color: #363C49;
        --color-card-bg: #272D38;
        --color-dark: #F2F3F5;
    }
}
```

### 15.2 暗色模式下组件适配要点

```css
/* 暗色模式下的特殊处理 */
@media (prefers-color-scheme: dark) {
    /* 输入框聚焦光晕加深 */
    .form-input:focus {
        box-shadow: 0 0 0 2px rgba(91, 141, 239, 0.2);
    }

    /* 表格斑马纹调整 */
    tr:nth-child(even) td {
        background: rgba(255, 255, 255, 0.02);
    }

    /* 模态框遮罩加亮 */
    .modal-overlay {
        background-color: rgba(0, 0, 0, 0.7);
    }

    /* Toast 通知降低亮度 */
    .toast {
        background-color: var(--color-neutral-100);
    }
}
```

---

## 📋 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| **v2.1** | 2026-01-18 | **第3批优化**：全面引入设计令牌系统、新增5类v2.0组件交互状态、动画参数标准化、暗色模式基础框架 |
| v2.0 | 2026-01-15 | 初始版本，定义基础交互状态规范 |

---

## 🔗 相关文档

- **[00-design-tokens.md](00-design-tokens.md)** - 设计令牌系统（变量定义源）
- **[02-css-styles.md](02-css-styles.md)** - CSS 样式模板（含完整令牌实现）
- **[06-components.md](06-components.md)** - 业务组件库（HTML结构参考）
- **[04-javascript.md](04-javascript.md)** - JavaScript 交互逻辑
