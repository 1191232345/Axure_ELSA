# 状态徽章组件

状态徽章样式模板，用于显示状态信息。

## 基础状态徽章

```html
<!-- 启用状态 -->
<span class="status-badge bg-green-100 text-green-700">启用</span>

<!-- 禁用状态 -->
<span class="status-badge bg-red-100 text-red-700">禁用</span>

<!-- 待审核状态 -->
<span class="status-badge bg-yellow-100 text-yellow-700">待审核</span>

<!-- 已完成状态 -->
<span class="status-badge bg-blue-100 text-blue-700">已完成</span>
```

## 带图标的状态徽章

```html
<span class="status-badge bg-green-100 text-green-700">
    <i class="fa fa-check-circle mr-1"></i> 启用
</span>

<span class="status-badge bg-red-100 text-red-700">
    <i class="fa fa-times-circle mr-1"></i> 禁用
</span>
```

## CSS样式

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
```