# 按钮组件

完整的按钮组件规范，包含样式、交互状态、HTML模板和使用示例。

## 基础样式

```css
.erp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-200) var(--ease-default);
    border: 1px solid transparent;
    white-space: nowrap;
    text-decoration: none;
}

.erp-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 表格内按钮 */
.table-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    background: transparent;
}
```

## 按钮类型

### 主按钮（Primary）

```css
.erp-btn-primary {
    background-color: var(--color-primary);
    color: var(--color-neutral-50);
    border-color: var(--color-primary);
    transition: all var(--duration-150) var(--ease-smooth);
}

.erp-btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

.erp-btn-primary:active {
    transform: translateY(0);
    opacity: 0.8;
}

.erp-btn-primary:disabled {
    background-color: var(--color-neutral-400);
    border-color: var(--color-neutral-400);
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
}

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

### 次要按钮（Secondary）

```css
.erp-btn-secondary {
    background: white;
    color: var(--color-text-primary);
    border-color: var(--color-border);
    transition: all var(--duration-150) var(--ease-smooth);
}

.erp-btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

.erp-btn-secondary:active {
    transform: translateY(0);
}

.erp-btn-secondary:disabled {
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-400);
    border-color: var(--color-neutral-200);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### 成功按钮（Success）

```css
.erp-btn-success {
    background-color: var(--color-success);
    color: var(--color-neutral-50);
    border-color: var(--color-success);
    transition: all var(--duration-150) var(--ease-smooth);
}

.erp-btn-success:hover:not(:disabled) {
    background: #00a023;
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}
```

### 警告按钮（Warning）

```css
.erp-btn-warning {
    background-color: var(--color-warning);
    color: var(--color-neutral-50);
    border-color: var(--color-warning);
    transition: all var(--duration-150) var(--ease-smooth);
}

.erp-btn-warning:hover:not(:disabled) {
    background: #e67000;
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

.erp-btn-warning:disabled {
    background-color: var(--color-warning-bg, #FFF7E8);
    border-color: var(--color-warning-bg, #FFF7E8);
    color: var(--color-warning-text, #994D00);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

### 危险按钮（Danger）

```css
.erp-btn-danger {
    background-color: var(--color-danger);
    color: var(--color-neutral-50);
    border-color: var(--color-danger);
    transition: all var(--duration-150) var(--ease-smooth);
}

.erp-btn-danger:hover:not(:disabled) {
    background: #d93636;
    transform: translateY(-1px);
    box-shadow: var(--shadow-button);
}

.erp-btn-danger:disabled {
    background-color: var(--color-danger-bg, #FFECE8);
    border-color: var(--color-danger-bg, #FFECE8);
    color: var(--color-danger-text, #B3261E);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

## 动画

```css
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

## HTML模板

### 主按钮

```html
<button class="erp-btn erp-btn-primary">
    <i class="fa fa-plus mr-1.5"></i> 新增
</button>
```

### 次要按钮

```html
<button class="erp-btn erp-btn-secondary">
    <i class="fa fa-download mr-1.5"></i> 导出
</button>
```

### 成功按钮

```html
<button class="erp-btn erp-btn-success">
    <i class="fa fa-check mr-1.5"></i> 确认
</button>
```

### 警告按钮

```html
<button class="erp-btn erp-btn-warning">
    <i class="fa fa-edit mr-1.5"></i> 编辑
</button>
```

### 危险按钮

```html
<button class="erp-btn erp-btn-danger">
    <i class="fa fa-trash mr-1.5"></i> 删除
</button>
```

### 按钮组

```html
<div class="flex gap-2">
    <button class="erp-btn erp-btn-primary">
        <i class="fa fa-plus mr-1.5"></i> 新增
    </button>
    <button class="erp-btn erp-btn-secondary">
        <i class="fa fa-download mr-1.5"></i> 导出
    </button>
</div>
```

### 加载状态

```html
<button class="erp-btn erp-btn-primary loading" disabled>
    <i class="fa fa-spinner fa-spin mr-1.5"></i> 处理中...
</button>
```

### 表格内按钮

```html
<button class="table-btn erp-btn-primary">
    <i class="fa fa-edit"></i>
</button>
```

## 使用规范

1. **按钮文案**：简洁明了，建议2-4个字
2. **图标使用**：统一使用 Font Awesome 6，`mr-1.5` 表示图标与文字间距
3. **禁用状态**：使用 `disabled` 属性，自动应用禁用样式
4. **加载状态**：添加 `loading` 类，配合 `disabled` 属性
5. **按钮组合**：使用 `flex gap-2` 布局，保持按钮间距一致
