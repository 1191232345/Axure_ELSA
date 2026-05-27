# 数据持久化模板（纯静态方案）

> **⚠️ 本文件为架构指南，不含重复代码。**
> - **代码实现**：[common-js](../interaction/common-js.md)（APIDataManager / StateManager 唯一权威代码源）
> - **本文件内容**：架构设计、页面配置、集成示例、导出功能说明

本文件定义TOB产品原型的数据持久化方案，采用**纯静态方案**，无需 Node.js 服务器。

## 方案概述

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      前端页面                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  APIDataManager                                      │   │
│  │  - loadData()   → fetch JSON 文件                    │   │
│  │  - saveData()   → localStorage + 导出按钮            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓ fetch
┌─────────────────────────────────────────────────────────────┐
│                   静态文件服务                               │
│  [模块目录]/                                                │
│  ├── index.html                                            │
│  └── data/                                                 │
│      └── [页面ID]-data.json  ← 可提交 Git                   │
└─────────────────────────────────────────────────────────────┘
                              ↓ localStorage（临时存储）
┌─────────────────────────────────────────────────────────────┐
│                   浏览器本地                                 │
│  localStorage: erp_prototype_[pageId]                      │
│  导出按钮 → 用户手动保存 JSON 文件                           │
└─────────────────────────────────────────────────────────────┘
```

### 方案优势

| 特性 | 说明 |
|------|------|
| ✅ 无需服务器 | 直接打开 HTML 文件即可使用 |
| ✅ Git 同步 | JSON 数据文件可提交到 Git |
| ✅ 纯静态 | 可部署到任意静态服务器（GitHub Pages、Vercel 等） |
| ✅ 离线可用 | localStorage 作为临时存储，断网也能使用 |
| ✅ 导出备份 | 提供"导出 JSON"按钮，用户可手动保存 |

### 数据流转

```
┌──────────────────────────────────────────────────────────────┐
│  读取数据                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. fetch JSON 文件（data/[pageId]-data.json）         │ │
│  │  2. 成功 → 返回数据，同时缓存到 localStorage           │ │
│  │  3. 失败 → 从 localStorage 读取缓存数据                 │ │
│  │  4. 都失败 → 返回空数组或默认数据                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  写入数据                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. 保存到 localStorage（临时存储）                    │ │
│  │  2. 显示"导出 JSON"按钮提示                            │ │
│  │  3. 用户点击导出 → 下载 JSON 文件                      │ │
│  │  4. 用户手动替换 data/[pageId]-data.json               │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 前端 API 管理器

> **⚠️ 代码已统一至 [common-js](../interaction/common-js.md)**，本节仅保留架构说明。

### APIDataManager 方法速查

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(config)` | `{pageId, dataFile}` | - | 初始化配置 |
| `loadData()` | - | `{success, data, source}` | 加载数据（JSON优先，localStorage降级） |
| `saveData(data)` | `Array` | `{success, message}` | 保存数据到 localStorage |
| `addRow(row)` | `Object` | `row` | 新增一行 |
| `updateRow(id, updates)` | `id, Object` | `row \| null` | 更新指定行 |
| `deleteRow(id)` | `id` | `boolean` | 删除指定行 |
| `batchDelete(ids)` | `Array<id>` | `number` | 批量删除，返回剩余行数 |
| `search(data, keyword, fields)` | `Array, string, Array` | `Array` | 关键词搜索 |
| `filter(data, conditions)` | `Array, Object` | `Array` | 条件筛选 |
| `sort(data, field, order)` | `Array, string, string` | `Array` | 排序 |
| `paginate(data, page, pageSize)` | `Array, number, number` | `{data, pagination}` | 分页 |

### StateManager 方法速查

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(pageId)` | `string` | - | 初始化页面ID |
| `getState()` | - | `Object` | 获取完整状态 |
| `saveState(state)` | `Object` | - | 保存完整状态 |
| `saveFilters(filters)` | `Object` | - | 保存筛选条件 |
| `savePagination(pagination)` | `Object` | - | 保存分页状态 |
| `saveSort(field, order)` | `string, string` | - | 保存排序状态 |
| `clearState()` | - | - | 清除所有状态 |

## 页面配置

### 配置常量

```html
<script>
const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: 'data/[page_id]-data.json',
    version: '1.0.0'
};

APIDataManager.init(DATA_CONFIG);
StateManager.init(DATA_CONFIG.pageId);
</script>
```

### 数据文件路径规则

| 页面路径 | 数据文件路径 |
|----------|--------------|
| `/产品备案/index.html` | `产品备案/data/product_filing-data.json` |
| `/入库/客户端/index.html` | `入库/客户端/data/inbound_client-data.json` |
| `/demo-test/index.html` | `demo-test/data/demo_test-data.json` |

## 完整集成示例

### 页面初始化

```javascript
let listData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;

async function initPage() {
    await loadListData();
    loadUserState();
    renderPage();
    addExportButton();
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
        badge.textContent = source === 'json' ? 'JSON' : '本地';
        badge.className = 'data-source-badge ' + (source === 'json' ? 'badge-json' : 'badge-local');
    }
}
```

### 添加导出按钮

```javascript
function addExportButton() {
    const toolbar = document.querySelector('.action-buttons');
    if (!toolbar) return;
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'erp-btn erp-btn-warning';
    exportBtn.innerHTML = '<i class="fas fa-download mr-1.5"></i>导出数据';
    exportBtn.onclick = exportCurrentData;
    toolbar.appendChild(exportBtn);
}

function exportCurrentData() {
    const result = APIDataManager.loadFromLocalStorage();
    if (result.success && result.data.length > 0) {
        exportData(result.data, DATA_CONFIG.pageId + '-data.json');
        showToast('数据已导出，请手动替换 data/' + DATA_CONFIG.pageId + '-data.json', 'success');
    } else {
        showToast('暂无数据可导出', 'warning');
    }
}
```

### 数据操作

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
    showToast('添加成功，请点击"导出数据"保存', 'success');
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
    showToast('修改成功，请点击"导出数据"保存', 'success');
}

async function handleDelete(id) {
    if (!confirm('确定要删除吗？')) return;
    
    await APIDataManager.deleteRow(id);
    await loadListData();
    handleSearch();
    showToast('删除成功，请点击"导出数据"保存', 'success');
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
    showToast('批量删除成功，请点击"导出数据"保存', 'success');
}
```

### 分页和排序

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

## 数据文件结构

### JSON 文件格式

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

### 目录结构

```
[模块目录]/
├── index.html              # 原型页面
└── data/
    └── [页面ID]-data.json  # 数据文件（可提交 Git）
```

## 导出功能说明

### 导出按钮样式

```html
<button class="erp-btn erp-btn-warning" onclick="exportCurrentData()">
    <i class="fas fa-download mr-1.5"></i>导出数据
</button>
```

### 导出提示

每次数据修改后，Toast 提示用户点击导出按钮：

```
"添加成功，请点击"导出数据"保存"
"修改成功，请点击"导出数据"保存"
"删除成功，请点击"导出数据"保存"
```

### 用户操作流程

```
1. 用户在页面中修改数据（添加/编辑/删除）
2. 数据自动保存到 localStorage
3. Toast 提示用户点击"导出数据"
4. 用户点击导出按钮 → 下载 JSON 文件
5. 用户手动替换 data/[pageId]-data.json
6. 下次打开页面时，fetch 新 JSON 文件
```

## 降级方案

当 JSON 文件不存在或 fetch 失败时，自动降级到 localStorage：

```javascript
loadData: async function() {
    try {
        const response = await fetch(this.dataPath);
        if (response.ok) {
            const data = await response.json();
            this.saveToLocalStorage(data);
            return { success: true, data: data, source: 'json' };
        }
    } catch (e) {
        console.warn('JSON 加载失败，使用 localStorage:', e);
    }
    
    return this.loadFromLocalStorage();
}
```

## 注意事项

1. **无需服务器**: 直接打开 HTML 文件即可使用
2. **数据同步**: JSON 文件可提交到 Git，实现团队同步
3. **导出提醒**: 每次修改数据后提醒用户导出
4. **降级处理**: JSON 文件不存在时自动使用 localStorage
5. **性能优化**: 大数据量考虑分页加载
6. **离线可用**: localStorage 作为临时存储，断网也能使用