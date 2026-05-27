# 面包屑导航组件

面包屑导航模板，用于显示页面层级路径。

## 基础面包屑

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

## 带图标的面包屑

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

## CSS样式

```css
.breadcrumb { list-style: none; margin: 0; padding: 0; }

.breadcrumb-item a {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
}

.breadcrumb-item a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
}

.breadcrumb-item.active {
    color: var(--color-primary);
    pointer-events: none;
}
```