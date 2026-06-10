# 表格组件

列表页核心组件。完整样式见 [css-styles.md](../css-styles.md) §表格，HTML 模板见 [html-templates.md](../html-templates.md) §数据表格。

## 基础结构

```html
<div class="bg-white rounded shadow-card overflow-hidden">
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-neutral-200 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-700">名称</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700">状态</th>
          <th class="px-4 py-3 text-left font-medium text-gray-700">操作</th>
        </tr>
      </thead>
      <tbody id="tableBody" class="divide-y divide-neutral-100"></tbody>
    </table>
  </div>
  <div id="emptyState" class="hidden text-center py-12">
    <i class="fas fa-inbox text-6xl text-neutral-300 mb-4"></i>
    <p class="text-neutral-500">暂无数据</p>
  </div>
</div>
```

## 状态要求

| 状态 | 处理 |
|------|------|
| 加载中 | 显示 skeleton 或 loading 遮罩 |
| 有数据 | 渲染 tbody，隐藏 emptyState |
| 无数据 | 显示 emptyState，tbody 清空 |
| 错误 | Toast 提示 + 保留上次数据或空状态 |

## 操作列规范

- 编辑 / 删除 / 查看 使用文字链接或 `erp-btn` 小按钮
- 危险操作（删除）需二次确认模态框
- 操作列固定右侧，不换行

## 渲染示例

```javascript
function renderTable(rows) {
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');
  if (!rows.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  tbody.innerHTML = rows.map(row => `
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-3">${row.name}</td>
      <td class="px-4 py-3">${row.status}</td>
      <td class="px-4 py-3">
        <button class="text-primary hover:underline" onclick="handleEdit(${row.id})">编辑</button>
      </td>
    </tr>
  `).join('');
}
```
