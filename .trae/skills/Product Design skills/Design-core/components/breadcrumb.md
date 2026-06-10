# 面包屑导航组件

完整的面包屑导航组件规范，包含样式、HTML模板和使用示例。

## 基础样式

```css
.breadcrumb {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.breadcrumb-item {
    display: inline-flex;
    align-items: center;
}

.breadcrumb-item a {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: var(--color-neutral-500);
    font-size: 0.875rem;
    transition: color 0.2s;
}

.breadcrumb-item a:hover {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.breadcrumb-item.active {
    color: var(--color-primary);
    font-weight: 500;
    pointer-events: none;
}

.breadcrumb-separator {
    color: var(--color-neutral-400);
    font-size: 0.75rem;
    display: flex;
    align-items: center;
}
```

## HTML模板

### 基础面包屑

```html
<nav aria-label="面包屑导航" class="mb-4">
    <ol class="breadcrumb flex items-center flex-wrap gap-2 text-sm">
        <li class="breadcrumb-item">
            <a href="/" class="text-neutral-500 hover:text-primary">
                <i class="fas fa-house-chimney mr-1"></i>首页
            </a>
        </li>
        <li class="breadcrumb-separator text-neutral-400">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>
        <li class="breadcrumb-item">
            <a href="/modules" class="text-neutral-500 hover:text-primary">模块管理</a>
        </li>
        <li class="breadcrumb-separator text-neutral-400">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>
        <li class="breadcrumb-item active text-primary font-medium" aria-current="page">
            库存详情
        </li>
    </ol>
</nav>
```

### 带图标的面包屑

```html
<nav aria-label="面包屑导航" class="mb-4">
    <ol class="breadcrumb flex items-center flex-wrap gap-2 text-sm bg-white px-4 py-2.5 rounded-lg shadow-sm border border-neutral-200">
        <li class="breadcrumb-item">
            <a href="/" class="inline-flex items-center gap-1.5 text-neutral-600 hover:text-primary">
                <i class="fas fa-grid-2 text-base"></i>
                <span>工作台</span>
            </a>
        </li>
        <li class="breadcrumb-separator text-neutral-300">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>
        <li class="breadcrumb-item active text-primary font-medium flex items-center gap-1.5">
            <i class="fas fa-boxes-stacked text-base"></i>
            <span>库存列表</span>
        </li>
    </ol>
</nav>
```

## 使用规范

1. **层级深度**：建议不超过4级，避免路径过长
2. **分隔符**：统一使用 `fa-chevron-right` 图标
3. **当前页面**：最后一项添加 `active` 类，使用 `aria-current="page"`
4. **图标使用**：首页建议使用 `fa-house-chimney` 图标
5. **响应式**：支持自动换行，适配移动端
6. **无障碍**：使用 `nav` 和 `aria-label` 提升可访问性
