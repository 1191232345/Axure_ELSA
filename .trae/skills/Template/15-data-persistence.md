# 数据持久化模板

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

### 3.1 核心管理器

```javascript
const APIDataManager = {
    apiBase: 'http://localhost:3100/api/data',
    pageId: null,
    dataPath: null,
    cache: null,
    
    init: function(config) {
        this.pageId = config.pageId;
        this.dataPath = config.dataFile;
        this.apiBase = config.apiBase || 'http://localhost:3100/api/data';
    },
    
    loadData: async function() {
        try {
            const response = await fetch(`${this.apiBase}/${this.dataPath}`);
            const result = await response.json();
            
            if (result.success) {
                this.cache = result.data;
                return {
                    success: true,
                    data: result.data,
                    source: 'api'
                };
            }
            
            return {
                success: false,
                data: [],
                message: result.message
            };
        } catch (e) {
            console.warn('API 加载失败，使用 localStorage:', e);
            return this.loadFromLocalStorage();
        }
    },
    
    saveData: async function(data) {
        try {
            const response = await fetch(`${this.apiBase}/${this.dataPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: data })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.cache = data;
                this.saveToLocalStorage(data);
                return { success: true, message: '保存成功' };
            }
            
            return { success: false, message: result.message };
        } catch (e) {
            console.warn('API 保存失败，使用 localStorage:', e);
            this.saveToLocalStorage(data);
            return { success: true, message: '已保存到本地缓存' };
        }
    },
    
    loadFromLocalStorage: function() {
        try {
            const key = `erp_prototype_${this.pageId}`;
            const data = localStorage.getItem(key);
            return {
                success: true,
                data: data ? JSON.parse(data) : [],
                source: 'localStorage'
            };
        } catch (e) {
            return { success: false, data: [], message: e.message };
        }
    },
    
    saveToLocalStorage: function(data) {
        try {
            const key = `erp_prototype_${this.pageId}`;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('localStorage 保存失败:', e);
        }
    },
    
    addRow: async function(row) {
        const result = await this.loadData();
        const data = result.data || [];
        
        row.id = row.id || Date.now();
        row.createdAt = new Date().toISOString();
        row.updatedAt = new Date().toISOString();
        
        data.push(row);
        await this.saveData(data);
        
        return row;
    },
    
    updateRow: async function(id, updates) {
        const result = await this.loadData();
        const data = result.data || [];
        
        const index = data.findIndex(row => row.id === id);
        if (index !== -1) {
            data[index] = { 
                ...data[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            await this.saveData(data);
            return data[index];
        }
        return null;
    },
    
    deleteRow: async function(id) {
        const result = await this.loadData();
        const data = result.data || [];
        
        const filtered = data.filter(row => row.id !== id);
        await this.saveData(filtered);
        
        return filtered.length < data.length;
    },
    
    batchDelete: async function(ids) {
        const result = await this.loadData();
        const data = result.data || [];
        
        const filtered = data.filter(row => !ids.includes(row.id));
        await this.saveData(filtered);
        
        return filtered.length;
    },
    
    search: function(data, keyword, fields) {
        if (!keyword) return data;
        
        const lowerKeyword = keyword.toLowerCase();
        return data.filter(row => {
            return fields.some(field => {
                const value = row[field];
                return value && String(value).toLowerCase().includes(lowerKeyword);
            });
        });
    },
    
    filter: function(data, conditions) {
        return data.filter(row => {
            return Object.keys(conditions).every(field => {
                const value = conditions[field];
                if (value === '' || value === null || value === undefined) {
                    return true;
                }
                return row[field] === value;
            });
        });
    },
    
    sort: function(data, field, order) {
        return [...data].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            
            if (order === 'desc') {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    },
    
    paginate: function(data, page, pageSize) {
        const total = data.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
            data: data.slice(start, end),
            pagination: {
                current: page,
                pageSize: pageSize,
                total: total,
                totalPages: totalPages
            }
        };
    }
};
```

### 3.2 状态管理器

```javascript
const StateManager = {
    pageId: null,
    
    init: function(pageId) {
        this.pageId = pageId;
    },
    
    getState: function() {
        const key = `erp_state_${this.pageId}`;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : this.getDefaultState();
        } catch (e) {
            return this.getDefaultState();
        }
    },
    
    saveState: function(state) {
        const key = `erp_state_${this.pageId}`;
        localStorage.setItem(key, JSON.stringify(state));
    },
    
    getDefaultState: function() {
        return {
            filters: {},
            pagination: { current: 1, pageSize: 10 },
            sort: { field: '', order: 'asc' },
            selectedRows: []
        };
    },
    
    saveFilters: function(filters) {
        const state = this.getState();
        state.filters = filters;
        this.saveState(state);
    },
    
    savePagination: function(pagination) {
        const state = this.getState();
        state.pagination = pagination;
        this.saveState(state);
    },
    
    saveSort: function(field, order) {
        const state = this.getState();
        state.sort = { field, order };
        this.saveState(state);
    },
    
    saveSelectedRows: function(ids) {
        const state = this.getState();
        state.selectedRows = ids;
        this.saveState(state);
    },
    
    clearState: function() {
        const key = `erp_state_${this.pageId}`;
        localStorage.removeItem(key);
    }
};
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
