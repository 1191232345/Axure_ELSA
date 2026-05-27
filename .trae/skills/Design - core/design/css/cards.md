# 卡片布局样式

搜索卡片 + 操作卡片 + 按钮位置规则 + 响应式。

## 搜索卡片

```css
.search-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    padding: 16px;
    margin-bottom: 16px;
}

.search-card .search-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.search-card .search-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-card .search-label {
    font-size: 12px;
    color: var(--color-neutral-500);
    white-space: nowrap;
}

.search-card .search-buttons {
    display: flex;
    gap: 8px;
    margin-left: auto;
}
```

## 操作卡片

```css
.action-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    padding: 16px;
    margin-bottom: 16px;
}

.action-card .action-buttons {
    display: flex;
    justify-content: flex-start;
    gap: 12px;
}
```

## 按钮位置规则

| 按钮类型 | 位置 | 说明 |
|----------|------|------|
| 搜索 | 搜索卡片右侧 | 筛选数据 |
| 重置 | 搜索卡片右侧 | 清空筛选条件 |
| 新增 | 操作卡片左侧 | 主操作按钮 |
| 导出 | 操作卡片左侧 | 次要操作 |
| 批量操作 | 操作卡片左侧 | 需选中数据后启用 |

## 响应式

```css
@media (max-width: 768px) {
    .search-card .search-fields {
        flex-direction: column;
        align-items: stretch;
    }
    .search-card .search-field { width: 100%; }
    .search-card .search-buttons {
        margin-left: 0; width: 100%;
        justify-content: stretch;
    }
    .search-card .search-buttons .erp-btn { flex: 1; }
    .action-card .action-buttons { flex-wrap: wrap; }
}
```
