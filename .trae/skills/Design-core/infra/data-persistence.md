# 数据持久化方案（纯静态）

> **代码实现**：[javascript-guide.md](../javascript-guide.md) Part 3（APIDataManager / StateManager 唯一权威代码源）
> **本文件**：架构设计、配置说明、集成要点

---

## 架构设计

```
┌─────────────────────────────────────────────┐
│  前端页面                                    │
│  APIDataManager                              │
│  - loadData() → fetch JSON 文件              │
│  - saveData() → localStorage + 导出按钮      │
└─────────────────────────────────────────────┘
                    ↓ fetch
┌─────────────────────────────────────────────┐
│  静态文件服务                                │
│  [模块目录]/data/[页面ID]-data.json          │
│  ← 可提交 Git                               │
└─────────────────────────────────────────────┘
                    ↓ localStorage（临时存储）
┌─────────────────────────────────────────────┐
│  浏览器本地                                  │
│  localStorage: erp_prototype_[pageId]        │
│  导出按钮 → 用户手动保存 JSON 文件           │
└─────────────────────────────────────────────┘
```

## 数据流转

**读取**：fetch JSON → 成功则缓存到 localStorage → 失败则从 localStorage 读取 → 都失败则返回默认数据

**写入**：保存到 localStorage → Toast 提示用户点击"导出数据" → 用户下载 JSON → 手动替换 data/ 文件

## 方案优势

| 特性 | 说明 |
|------|------|
| 无需服务器 | 直接打开 HTML 文件即可使用 |
| Git 同步 | JSON 数据文件可提交到 Git |
| 纯静态 | 可部署到 GitHub Pages、Vercel 等 |
| 离线可用 | localStorage 作为临时存储 |

## API 速查

### APIDataManager

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(config)` | `{pageId, dataFile}` | - | 初始化配置 |
| `loadData()` | - | `{success, data, source}` | 加载数据（JSON优先，localStorage降级） |
| `saveData(data)` | `Array` | `{success, message}` | 保存到 localStorage |
| `addRow(row)` | `Object` | `row` | 新增一行 |
| `updateRow(id, updates)` | `id, Object` | `row \| null` | 更新指定行 |
| `deleteRow(id)` | `id` | `boolean` | 删除指定行 |
| `batchDelete(ids)` | `Array<id>` | `number` | 批量删除 |
| `search(data, keyword, fields)` | `Array, string, Array` | `Array` | 关键词搜索 |
| `filter(data, conditions)` | `Array, Object` | `Array` | 条件筛选 |
| `sort(data, field, order)` | `Array, string, string` | `Array` | 排序 |
| `paginate(data, page, pageSize)` | `Array, number, number` | `{data, pagination}` | 分页 |

### StateManager

| 方法 | 参数 | 说明 |
|------|------|------|
| `init(pageId)` | `string` | 初始化页面ID |
| `getState()` | - | 获取完整状态 |
| `saveState(state)` | `Object` | 保存完整状态 |
| `saveFilters(filters)` | `Object` | 保存筛选条件 |
| `savePagination(pagination)` | `Object` | 保存分页状态 |
| `saveSort(field, order)` | `string, string` | 保存排序状态 |
| `clearState()` | - | 清除所有状态 |

## 页面配置

```javascript
const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: 'data/[page_id]-data.json',
    version: '1.0.0'
};

APIDataManager.init(DATA_CONFIG);
StateManager.init(DATA_CONFIG.pageId);
```

### 数据文件路径规则

| 页面路径 | 数据文件路径 |
|----------|--------------|
| `/产品备案/index.html` | `产品备案/data/product_filing-data.json` |
| `/入库/客户端/index.html` | `入库/客户端/data/inbound_client-data.json` |

## 集成要点

1. **初始化**：页面加载时调用 `APIDataManager.loadData()` + `StateManager.getState()` 恢复状态
2. **数据操作**：增删改后调用对应 API，然后 `loadData()` 刷新 + Toast 提示导出
3. **导出按钮**：添加到工具栏，调用 `APIDataManager.loadFromLocalStorage()` + `exportData()`
4. **降级处理**：JSON 文件不存在时自动使用 localStorage

## JSON 文件格式

```json
{
    "listData": [
        { "id": 1, "sku": "SKU001", "name": "产品名称", "status": "active" }
    ],
    "lastUpdate": "2024-01-01T00:00:00.000Z"
}
```

## 注意事项

1. 无需服务器，直接打开 HTML 即可使用
2. JSON 文件可提交到 Git，实现团队同步
3. 每次修改数据后提醒用户导出
4. JSON 不存在时自动降级到 localStorage
5. 大数据量考虑分页加载
