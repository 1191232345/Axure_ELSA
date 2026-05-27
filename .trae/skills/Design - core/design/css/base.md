# 页面基础样式

设计令牌速查 + 页面基础 + 页面切换动画。

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

完整变量定义：[design-tokens](../design-tokens.md)

## 页面基础

```css
.main-content { display: none; }
.main-content.active { display: block; }

body {
    font-family: system-ui, -apple-system, sans-serif;
    background-color: var(--bg-color-page);
    color: var(--color-neutral-700);
    min-height: 100vh;
}
```

## 页面切换

```css
.page { display: none; }
.page.active { display: block; }
```
