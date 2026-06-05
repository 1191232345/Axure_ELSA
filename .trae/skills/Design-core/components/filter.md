# 筛选器组件

列表页顶部搜索区域。HTML 模板见 [html-templates.md](../html-templates.md) §搜索卡片。

## 基础结构

```html
<div class="bg-white rounded shadow-card p-4 mb-4">
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <div class="flex items-center w-full sm:w-auto">
      <label class="text-xs text-neutral-600 mr-2 whitespace-nowrap">状态</label>
      <select id="filterStatus" class="erp-input w-full sm:w-48">
        <option value="">全部</option>
        <option value="active">启用</option>
      </select>
    </div>
    <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
      <button class="erp-btn erp-btn-secondary" onclick="handleReset()">
        <i class="fas fa-rotate-right mr-1.5"></i> 重置
      </button>
      <button class="erp-btn erp-btn-primary" onclick="handleSearch()">
        <i class="fas fa-search mr-1.5"></i> 搜索
      </button>
    </div>
  </div>
</div>
```

## 筛选逻辑表（logic-docs 必填）

| 检索项 | 输入方式 | 匹配规则 | 默认值 |
|--------|----------|----------|--------|
| 状态 | 下拉 | 精确匹配 | 全部 |
| 关键字 | 文本框 | 模糊匹配名称 | 空 |

## 行为规范

- **搜索**：按条件过滤列表，无结果时显示空状态
- **重置**：清空所有筛选条件并恢复默认，重新加载全量数据
- **联动**：下拉选项从数据源动态加载，不硬编码业务值
- **状态保持**：筛选条件通过 `StateManager` 持久化（见 javascript-guide.md）
