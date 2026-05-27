# 面包屑导航样式

```css
.breadcrumb {
    list-style: none;
    margin: 0; padding: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.breadcrumb-item { display: inline-flex; align-items: center; }

.breadcrumb-item a {
    display: inline-flex; align-items: center;
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
    display: flex; align-items: center;
}
```
