# 数据持久化模板（架构指南）

> **⚠️ 本文件为架构指南，不含重复代码。**
> - **代码实现**：[17-common-js.md](17-common-js.md)（APIDataManager / StateManager 唯一权威代码源）
> - **本文件内容**：架构设计、服务器配置、页面配置、集成示例、API 接口说明

本文件定义TOB产品原型的数据持久化方案，使用 Node.js 服务器读写数据文件，支持 Git 同步。

## 1. 方案概述

### 1.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      前端页面                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  APIDataManager                                      │   │
│  │  - loadData()   → GET  /api/data/[路径]             │   │
│  │  - saveData()   → POST /api/data/[路径]             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                   Node.js 服务器 (pm2)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  server.js                                           │   │
│  │  - 静态文件服务                                       │   │
│  │  - 数据 API 接口                                      │   │
│  │  - 自动创建数据文件                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   本地文件系统                               │
│  [模块目录]/                                                │
│  ├── index.html                                            │
│  └── data/                                                 │
│      └── [页面ID]-data.json  ← 可提交 Git                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 方案优势

| 特性 | 说明 |
|------|------|
| ✅ 无需授权 | 服务器运行后自动可用 |
| ✅ Git 同步 | 数据文件可提交到 Git |
| ✅ 后台运行 | pm2 管理服务，开机自启 |
| ✅ 统一入口 | http://localhost:3100/ 访问所有原型 |
| ✅ 自动创建 | 首次访问自动创建数据文件 |

## 2. 服务器配置

### 2.1 启动服务

```bash
cd /Users/zsw/Desktop/Axure_ELSA/server

# 安装依赖（首次）
npm install

# 启动服务（后台运行）
npm run pm2:start

# 查看状态
npm run pm2:status

# 查看日志
npm run pm2:logs

# 重启服务
npm run pm2:restart

# 停止服务
npm run pm2:stop
```

### 2.2 开机自启动

```bash
# 生成开机启动脚本
npx pm2 startup

# 保存当前进程列表
npx pm2 save
```

## 3. 前端 API 管理器

> **⚠️ 代码已统一至 [17-common-js.md](17-common-js.md)**，本节仅保留架构说明和补充内容。
>
> `APIDataManager` 和 `StateManager` 的完整实现请查看：
> - **[17-common-js.md §1. API 数据管理器](17-common-js.md)** — 唯一权威代码源
> - **[17-common-js.md §2. 状态管理器](17-common-js.md)** — 唯一权威代码源

### 3.1 APIDataManager 方法速查

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(config)` | `{pageId, dataFile, apiBase}` | - | 初始化配置 |
| `loadData()` | - | `{success, data, source}` | 加载数据（API优先，localStorage降级） |
| `saveData(data)` | `Array` | `{success, message}` | 保存数据（双写） |
| `addRow(row)` | `Object` | `row` | 新增一行 |
| `updateRow(id, updates)` | `id, Object` | `row \| null` | 更新指定行 |
| `deleteRow(id)` | `id` | `boolean` | 删除指定行 |
| `batchDelete(ids)` | `Array<id>` | `number` | 批量删除，返回剩余行数 |
| `search(data, keyword, fields)` | `Array, string, Array` | `Array` | 关键词搜索 |
| `filter(data, conditions)` | `Array, Object` | `Array` | 条件筛选 |
| `sort(data, field, order)` | `Array, string, string` | `Array` | 排序 |
| `paginate(data, page, pageSize)` | `Array, number, number` | `{data, pagination}` | 分页 |

### 3.2 StateManager 方法速查

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(pageId)` | `string` | - | 初始化页面ID |
| `getState()` | - | `Object` | 获取完整状态 |
| `saveState(state)` | `Object` | - | 保存完整状态 |
| `saveFilters(filters)` | `Object` | - | 保存筛选条件 |
| `savePagination(pagination)` | `Object` | - | 保存分页状态 |
| `saveSort(field, order)` | `string, string` | - | 保存排序状态 |
| `clearState()` | - | - | 清除所有状态 |

### 3.3 15-data-persistence.md 独有补充：saveSelectedRows

> 以下方法在 [17-common-js.md](17-common-js.md) 的 `StateManager` 中尚未包含，属于本文件的补充定义。

```javascript
// 补充方法：保存选中行（如需此功能，添加到 StateManager 对象中）
saveSelectedRows: function(ids) {
    const state = this.getState();
    state.selectedRows = ids;
    this.saveState(state);
}
```

## 4. 页面配置

### 4.1 配置常量

```html
<script>
const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: '[模块目录]/data/[page_id]-data.json',
    apiBase: 'http://localhost:3100/api/data',
    version: '1.0.0'
};

APIDataManager.init(DATA_CONFIG);
StateManager.init(DATA_CONFIG.pageId);
</script>
```

### 4.2 数据文件路径规则

| 页面路径 | 数据文件路径 |
|----------|--------------|
| `/产品备案/index.html` | `产品备案/data/product_filing-data.json` |
| `/入库/客户端/index.html` | `入库/客户端/data/inbound_client-data.json` |
| `/demo-test/index.html` | `demo-test/data/demo_test-data.json` |

## 5. 完整集成示例

### 5.1 页面初始化

```javascript
let listData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;

async function initPage() {
    await loadListData();
    loadUserState();
    renderPage();
}

async function loadListData() {
    const result = await APIDataManager.loadData();
    
    if (result.success) {
        listData = result.data;
        
        if (listData.length === 0) {
            listData = getDefaultListData();
            await APIDataManager.saveData(listData);
        }
        
        updateDataSourceStatus(result.source);
    } else {
        showToast('数据加载失败: ' + result.message, 'error');
        listData = getDefaultListData();
    }
}

function loadUserState() {
    const state = StateManager.getState();
    currentPage = state.pagination.current;
    pageSize = state.pagination.pageSize;
    
    if (state.filters) {
        Object.keys(state.filters).forEach(field => {
            const input = document.getElementById('filter_' + field);
            if (input) input.value = state.filters[field];
        });
    }
}

function getDefaultListData() {
    return [
        { id: 1, sku: 'SKU001', name: '示例产品1', status: 'active' },
        { id: 2, sku: 'SKU002', name: '示例产品2', status: 'inactive' }
    ];
}

function updateDataSourceStatus(source) {
    const badge = document.getElementById('dataSourceBadge');
    if (badge) {
        badge.textContent = source === 'api' ? 'API' : '本地';
        badge.className = 'data-source-badge ' + (source === 'api' ? 'badge-api' : 'badge-local');
    }
}
```

### 5.2 数据操作

```javascript
async function handleSearch() {
    const filters = collectFilters();
    StateManager.saveFilters(filters);
    
    filteredData = APIDataManager.filter(listData, filters);
    
    const keyword = document.getElementById('searchInput')?.value;
    if (keyword) {
        filteredData = APIDataManager.search(filteredData, keyword, ['sku', 'name']);
    }
    
    const state = StateManager.getState();
    if (state.sort.field) {
        filteredData = APIDataManager.sort(filteredData, state.sort.field, state.sort.order);
    }
    
    currentPage = 1;
    StateManager.savePagination({ current: currentPage, pageSize: pageSize });
    
    renderTable();
    renderPagination();
}

async function handleAdd() {
    const formData = collectFormData('addForm');
    
    if (!validateForm(formData)) {
        showToast('请检查表单填写', 'error');
        return;
    }
    
    await APIDataManager.addRow(formData);
    closeModal('addModal');
    
    await loadListData();
    handleSearch();
    showToast('添加成功', 'success');
}

async function handleEdit(id) {
    const formData = collectFormData('editForm');
    
    if (!validateForm(formData)) {
        showToast('请检查表单填写', 'error');
        return;
    }
    
    await APIDataManager.updateRow(id, formData);
    closeModal('editModal');
    
    await loadListData();
    handleSearch();
    showToast('修改成功', 'success');
}

async function handleDelete(id) {
    if (!confirm('确定要删除吗？')) return;
    
    await APIDataManager.deleteRow(id);
    await loadListData();
    handleSearch();
    showToast('删除成功', 'success');
}

async function handleBatchDelete() {
    const selectedIds = getSelectedIds();
    
    if (selectedIds.length === 0) {
        showToast('请选择要删除的数据', 'warning');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条数据吗？`)) return;
    
    await APIDataManager.batchDelete(selectedIds);
    await loadListData();
    handleSearch();
    showToast('批量删除成功', 'success');
}
```

### 5.3 分页和排序

```javascript
function handlePageChange(page) {
    currentPage = page;
    StateManager.savePagination({ current: currentPage, pageSize: pageSize });
    renderTable();
    renderPagination();
}

function handlePageSizeChange(newSize) {
    pageSize = newSize;
    currentPage = 1;
    StateManager.savePagination({ current: currentPage, pageSize: pageSize });
    renderTable();
    renderPagination();
}

function handleSort(field) {
    const state = StateManager.getState();
    let order = 'asc';
    
    if (state.sort.field === field && state.sort.order === 'asc') {
        order = 'desc';
    }
    
    StateManager.saveSort(field, order);
    handleSearch();
}
```

## 6. 数据文件结构

### 6.1 JSON 文件格式

```json
{
    "listData": [
        {
            "id": 1,
            "sku": "SKU001",
            "name": "产品名称",
            "status": "active",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    ],
    "lastUpdate": "2024-01-01T00:00:00.000Z"
}
```

### 6.2 目录结构

```
[模块目录]/
├── index.html              # 原型页面
└── data/
    └── [页面ID]-data.json  # 数据文件（可提交 Git）
```

## 7. API 接口说明

### 7.1 获取数据

```
GET /api/data/[模块目录]/data/[页面ID]-data.json

Response:
{
    "success": true,
    "data": [...],
    "source": "file",
    "lastUpdate": "2024-01-01T00:00:00.000Z"
}
```

### 7.2 保存数据

```
POST /api/data/[模块目录]/data/[页面ID]-data.json

Request Body:
{
    "data": [...]
}

Response:
{
    "success": true,
    "message": "保存成功",
    "lastUpdate": "2024-01-01T00:00:00.000Z"
}
```

## 8. 降级方案

当 API 服务不可用时，自动降级到 localStorage：

```javascript
async function loadData() {
    try {
        const response = await fetch(`${apiBase}/${dataPath}`, {
            signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('API 不可用，使用 localStorage');
    }
    
    return loadFromLocalStorage();
}
```

## 9. 注意事项

1. **服务启动**: 使用前确保 Node.js 服务已启动
2. **数据同步**: 数据文件可提交到 Git，实现团队同步
3. **降级处理**: API 不可用时自动使用 localStorage
4. **错误处理**: 所有操作都应有 try-catch 包裹
5. **性能优化**: 大数据量考虑分页加载
