# 分页组件

表格底部分页。样式见 [css-styles.md](../css-styles.md) §分页。

## HTML 结构

```html
<div class="px-4 py-3 flex items-center justify-between border-t border-neutral-100">
  <div class="text-sm text-neutral-500">
    共 <span id="totalCount">0</span> 条
  </div>
  <div class="flex items-center gap-2">
    <select id="pageSizeSelect" class="erp-input text-sm">
      <option value="10">10 条/页</option>
      <option value="20">20 条/页</option>
      <option value="50">50 条/页</option>
    </select>
    <nav class="flex items-center gap-1" id="paginationNav"></nav>
  </div>
</div>
```

## 行为规范

| 操作 | 行为 |
|------|------|
| 切换页码 | 加载对应页数据，保持筛选条件 |
| 切换每页条数 | 重置到第 1 页 |
| 首页 / 末页 | 边界按钮在不可用时 disabled |
| 无数据 | 隐藏分页或显示 0 条 |

## 计算逻辑

```javascript
function paginate(allRows, page, pageSize) {
  const total = allRows.length;
  const start = (page - 1) * pageSize;
  return {
    rows: allRows.slice(start, start + pageSize),
    total,
    totalPages: Math.ceil(total / pageSize) || 1
  };
}
```

## logic-docs 记录项

- 默认每页条数
- 排序规则（如按创建时间倒序）
- 筛选与分页的联动方式
