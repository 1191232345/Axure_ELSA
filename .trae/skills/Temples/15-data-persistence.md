# 数据持久化模板

本文件定义TOB产品原型的数据持久化方案，确保列表数据和属性字段在页面刷新后仍然保留。

## 1. 数据持久化管理器

### 1.1 核心管理器

```javascript
const DataManager = {
    storagePrefix: 'erp_prototype_',
    
    save: function(key, data) {
        try {
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    },
    
    load: function(key, defaultValue) {
        try {
            const data = localStorage.getItem(this.storagePrefix + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('加载数据失败:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        localStorage.removeItem(this.storagePrefix + key);
    },
    
    clear: function() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.storagePrefix))
            .forEach(key => localStorage.removeItem(key));
    },
    
    exportAll: function() {
        const data = {};
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.storagePrefix))
            .forEach(key => {
                data[key.replace(this.storagePrefix, '')] = JSON.parse(localStorage.getItem(key));
            });
        return data;
    },
    
    importAll: function(data) {
        Object.keys(data).forEach(key => {
            this.save(key, data[key]);
        });
    }
};
```

### 1.2 列表数据管理

```javascript
const ListDataManager = {
    getListData: function(pageId) {
        return DataManager.load('listData_' + pageId, []);
    },
    
    saveListData: function(pageId, data) {
        DataManager.save('listData_' + pageId, data);
    },
    
    addRow: function(pageId, row) {
        const data = this.getListData(pageId);
        row.id = row.id || Date.now();
        data.push(row);
        this.saveListData(pageId, data);
        return row;
    },
    
    updateRow: function(pageId, id, updates) {
        const data = this.getListData(pageId);
        const index = data.findIndex(row => row.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.saveListData(pageId, data);
            return data[index];
        }
        return null;
    },
    
    deleteRow: function(pageId, id) {
        const data = this.getListData(pageId);
        const filtered = data.filter(row => row.id !== id);
        this.saveListData(pageId, filtered);
        return filtered.length < data.length;
    },
    
    batchDelete: function(pageId, ids) {
        const data = this.getListData(pageId);
        const filtered = data.filter(row => !ids.includes(row.id));
        this.saveListData(pageId, filtered);
        return filtered.length;
    },
    
    search: function(pageId, keyword, fields) {
        const data = this.getListData(pageId);
        if (!keyword) return data;
        
        const lowerKeyword = keyword.toLowerCase();
        return data.filter(row => {
            return fields.some(field => {
                const value = row[field];
                return value && String(value).toLowerCase().includes(lowerKeyword);
            });
        });
    },
    
    filter: function(pageId, conditions) {
        let data = this.getListData(pageId);
        
        Object.keys(conditions).forEach(field => {
            const value = conditions[field];
            if (value !== '' && value !== null && value !== undefined) {
                data = data.filter(row => row[field] === value);
            }
        });
        
        return data;
    },
    
    sort: function(pageId, field, order) {
        const data = this.getListData(pageId);
        return data.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            
            if (order === 'desc') {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    },
    
    paginate: function(pageId, page, pageSize, conditions) {
        let data = conditions ? this.filter(pageId, conditions) : this.getListData(pageId);
        
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

### 1.3 配置数据管理

```javascript
const ConfigManager = {
    getConfig: function(pageId) {
        return DataManager.load('config_' + pageId, this.getDefaultConfig());
    },
    
    saveConfig: function(pageId, config) {
        DataManager.save('config_' + pageId, config);
    },
    
    getDefaultConfig: function() {
        return {
            pageTitle: '',
            moduleName: '',
            filters: [],
            columns: [],
            buttons: [],
            statuses: []
        };
    },
    
    updateFilters: function(pageId, filters) {
        const config = this.getConfig(pageId);
        config.filters = filters;
        this.saveConfig(pageId, config);
    },
    
    updateColumns: function(pageId, columns) {
        const config = this.getConfig(pageId);
        config.columns = columns;
        this.saveConfig(pageId, config);
    },
    
    updateButtons: function(pageId, buttons) {
        const config = this.getConfig(pageId);
        config.buttons = buttons;
        this.saveConfig(pageId, config);
    },
    
    updateStatuses: function(pageId, statuses) {
        const config = this.getConfig(pageId);
        config.statuses = statuses;
        this.saveConfig(pageId, config);
    },
    
    resetConfig: function(pageId) {
        this.saveConfig(pageId, this.getDefaultConfig());
    }
};
```

### 1.4 用户状态管理

```javascript
const StateManager = {
    getState: function(pageId) {
        return DataManager.load('state_' + pageId, {
            filters: {},
            pagination: { current: 1, pageSize: 10 },
            sort: { field: '', order: 'asc' },
            selectedRows: [],
            expandedRows: []
        });
    },
    
    saveState: function(pageId, state) {
        DataManager.save('state_' + pageId, state);
    },
    
    saveFilters: function(pageId, filters) {
        const state = this.getState(pageId);
        state.filters = filters;
        this.saveState(pageId, state);
    },
    
    savePagination: function(pageId, pagination) {
        const state = this.getState(pageId);
        state.pagination = pagination;
        this.saveState(pageId, state);
    },
    
    saveSort: function(pageId, field, order) {
        const state = this.getState(pageId);
        state.sort = { field, order };
        this.saveState(pageId, state);
    },
    
    saveSelectedRows: function(pageId, ids) {
        const state = this.getState(pageId);
        state.selectedRows = ids;
        this.saveState(pageId, state);
    },
    
    clearState: function(pageId) {
        DataManager.remove('state_' + pageId);
    }
};
```

## 2. 完整集成示例

### 2.1 页面初始化

```javascript
const PAGE_ID = 'product_filing';

let currentPage = 1;
let pageSize = 10;
let listData = [];
let pageConfig = {};

function initPage() {
    loadConfig();
    loadListData();
    loadUserState();
    renderPage();
}

function loadConfig() {
    pageConfig = ConfigManager.getConfig(PAGE_ID);
    if (!pageConfig.filters || pageConfig.filters.length === 0) {
        pageConfig = getDefaultConfig();
        ConfigManager.saveConfig(PAGE_ID, pageConfig);
    }
}

function loadListData() {
    listData = ListDataManager.getListData(PAGE_ID);
    if (listData.length === 0) {
        listData = getDefaultListData();
        ListDataManager.saveListData(PAGE_ID, listData);
    }
}

function loadUserState() {
    const state = StateManager.getState(PAGE_ID);
    currentPage = state.pagination.current;
    pageSize = state.pagination.pageSize;
    
    if (state.filters) {
        Object.keys(state.filters).forEach(field => {
            const input = document.getElementById('filter_' + field);
            if (input) input.value = state.filters[field];
        });
    }
}

function getDefaultConfig() {
    return {
        pageTitle: '产品备案管理',
        moduleName: '产品备案',
        filters: [
            { id: 1, label: 'SKU', field: 'sku', type: 'text', placeholder: '请输入SKU' },
            { id: 2, label: '客户代码', field: 'client', type: 'select', options: '全部,DEMO,VIP' }
        ],
        columns: [
            { id: 1, label: 'SKU', field: 'sku', width: '120', visible: true },
            { id: 2, label: '客户代码', field: 'client', width: '100', visible: true }
        ],
        buttons: [
            { id: 1, label: '新增', type: 'primary', icon: 'fa-plus', visible: true }
        ],
        statuses: [
            { id: 1, label: '已发布', value: 'published', color: '#00B42A' },
            { id: 2, label: '未发布', value: 'unpublished', color: '#6b7280' }
        ]
    };
}

function getDefaultListData() {
    return [
        { id: 1, sku: 'SKU001', client: 'DEMO', status: 'published' },
        { id: 2, sku: 'SKU002', client: 'VIP', status: 'unpublished' }
    ];
}
```

### 2.2 数据操作

```javascript
function handleSearch() {
    const filters = collectFilters();
    StateManager.saveFilters(PAGE_ID, filters);
    
    const result = ListDataManager.paginate(PAGE_ID, 1, pageSize, filters);
    renderTable(result.data);
    renderPagination(result.pagination);
    
    currentPage = 1;
    StateManager.savePagination(PAGE_ID, { current: currentPage, pageSize: pageSize });
}

function handleAdd() {
    const modal = document.getElementById('addModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function handleSaveAdd() {
    const formData = collectFormData('addForm');
    
    if (!validateForm(formData)) {
        showToast('请检查表单填写', 'error');
        return;
    }
    
    const newRow = ListDataManager.addRow(PAGE_ID, formData);
    closeModal('addModal');
    
    handleSearch();
    showToast('添加成功', 'success');
}

function handleEdit(id) {
    const data = ListDataManager.getListData(PAGE_ID);
    const row = data.find(r => r.id === id);
    
    if (row) {
        fillForm('editForm', row);
        document.getElementById('editId').value = id;
        openModal('editModal');
    }
}

function handleSaveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const formData = collectFormData('editForm');
    
    if (!validateForm(formData)) {
        showToast('请检查表单填写', 'error');
        return;
    }
    
    ListDataManager.updateRow(PAGE_ID, id, formData);
    closeModal('editModal');
    
    handleSearch();
    showToast('修改成功', 'success');
}

function handleDelete(id) {
    if (!confirm('确定要删除吗？')) return;
    
    ListDataManager.deleteRow(PAGE_ID, id);
    handleSearch();
    showToast('删除成功', 'success');
}

function handleBatchDelete() {
    const selectedIds = getSelectedIds();
    
    if (selectedIds.length === 0) {
        showToast('请选择要删除的数据', 'warning');
        return;
    }
    
    if (!confirm('确定要删除选中的 ' + selectedIds.length + ' 条数据吗？')) return;
    
    ListDataManager.batchDelete(PAGE_ID, selectedIds);
    handleSearch();
    showToast('批量删除成功', 'success');
}

function handleExport() {
    const data = ListDataManager.getListData(PAGE_ID);
    const config = ConfigManager.getConfig(PAGE_ID);
    
    const exportData = {
        config: config,
        listData: data,
        exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = PAGE_ID + '_data_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('导出成功', 'success');
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (importData.config) {
                ConfigManager.saveConfig(PAGE_ID, importData.config);
            }
            
            if (importData.listData) {
                ListDataManager.saveListData(PAGE_ID, importData.listData);
            }
            
            initPage();
            showToast('导入成功', 'success');
        } catch (err) {
            showToast('导入失败：文件格式错误', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function handleReset() {
    if (!confirm('确定要重置所有数据吗？此操作不可恢复。')) return;
    
    DataManager.remove('listData_' + PAGE_ID);
    DataManager.remove('config_' + PAGE_ID);
    DataManager.remove('state_' + PAGE_ID);
    
    initPage();
    showToast('数据已重置', 'info');
}
```

### 2.3 分页和排序

```javascript
function handlePageChange(page) {
    currentPage = page;
    StateManager.savePagination(PAGE_ID, { current: currentPage, pageSize: pageSize });
    
    const filters = StateManager.getState(PAGE_ID).filters;
    const result = ListDataManager.paginate(PAGE_ID, page, pageSize, filters);
    
    renderTable(result.data);
    renderPagination(result.pagination);
}

function handlePageSizeChange(newSize) {
    pageSize = newSize;
    currentPage = 1;
    StateManager.savePagination(PAGE_ID, { current: currentPage, pageSize: pageSize });
    
    const filters = StateManager.getState(PAGE_ID).filters;
    const result = ListDataManager.paginate(PAGE_ID, 1, pageSize, filters);
    
    renderTable(result.data);
    renderPagination(result.pagination);
}

function handleSort(field) {
    const state = StateManager.getState(PAGE_ID);
    let order = 'asc';
    
    if (state.sort.field === field && state.sort.order === 'asc') {
        order = 'desc';
    }
    
    StateManager.saveSort(PAGE_ID, field, order);
    
    const sortedData = ListDataManager.sort(PAGE_ID, field, order);
    renderTable(sortedData);
    updateSortIndicators(field, order);
}
```

## 3. 数据导出导入模板

### 3.1 导出按钮

```html
<button class="erp-btn erp-btn-secondary" onclick="handleExport()">
    <i class="fa fa-download"></i> 导出数据
</button>
```

### 3.2 导入按钮

```html
<input type="file" id="importFile" accept=".json" style="display: none;" onchange="handleImport(event)">
<button class="erp-btn erp-btn-secondary" onclick="document.getElementById('importFile').click()">
    <i class="fa fa-upload"></i> 导入数据
</button>
```

### 3.3 重置按钮

```html
<button class="erp-btn erp-btn-danger" onclick="handleReset()">
    <i class="fa fa-undo"></i> 重置数据
</button>
```

## 4. 数据结构定义

### 4.1 配置数据结构

```javascript
{
    pageTitle: '页面标题',
    moduleName: '模块名称',
    filters: [
        {
            id: 1,
            label: '显示标签',
            field: '字段名',
            type: 'text|select|date',
            placeholder: '占位符',
            options: '选项1,选项2,选项3'
        }
    ],
    columns: [
        {
            id: 1,
            label: '列名',
            field: '字段名',
            width: '100',
            align: 'left|center|right',
            visible: true
        }
    ],
    buttons: [
        {
            id: 1,
            label: '按钮名',
            type: 'primary|secondary|warning|danger|success',
            icon: 'fa-icon',
            visible: true,
            action: '动作标识'
        }
    ],
    statuses: [
        {
            id: 1,
            label: '状态名',
            value: '状态值',
            color: '#颜色代码',
            bgColor: '#背景颜色'
        }
    ]
}
```

### 4.2 列表数据结构

```javascript
[
    {
        id: 1,
        field1: '值1',
        field2: '值2',
        status: '状态值',
        createdAt: '创建时间',
        updatedAt: '更新时间'
    }
]
```

### 4.3 用户状态数据结构

```javascript
{
    filters: {
        field1: '筛选值1',
        field2: '筛选值2'
    },
    pagination: {
        current: 1,
        pageSize: 10
    },
    sort: {
        field: '排序字段',
        order: 'asc|desc'
    },
    selectedRows: [1, 2, 3],
    expandedRows: [1, 2, 3]
}
```

## 5. 注意事项

1. **存储限制**: localStorage 通常限制为 5MB，大数据量需考虑分片存储或使用 IndexedDB
2. **数据安全**: 敏感数据不应存储在 localStorage 中
3. **兼容性**: 确保浏览器支持 localStorage
4. **错误处理**: 所有存储操作都应有 try-catch 包裹
5. **数据清理**: 提供数据清理功能，避免存储空间不足
