# 导航交互状态

下拉菜单 + 导航链接。

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

.nav-link { transition: background-color var(--duration-150) var(--ease-smooth); }
.nav-link:hover { background-color: rgba(42, 59, 125, 0.8); }
.nav-link.active { background-color: rgba(42, 59, 125, 0.9); }
```
