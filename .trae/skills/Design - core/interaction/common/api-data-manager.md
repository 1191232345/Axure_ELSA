# API 数据管理器

数据持久化核心模块，负责 JSON 文件读取和 localStorage 缓存。

## 方法速查

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(config)` | `{pageId, dataFile}` | - | 初始化配置 |
| `loadData()` | - | `{success, data, source}` | 加载数据（JSON优先） |
| `saveData(data)` | `Array` | `{success, message}` | 保存到 localStorage |
| `addRow(row)` | `Object` | `row` | 新增一行 |
| `updateRow(id, updates)` | `id, Object` | `row \| null` | 更新指定行 |
| `deleteRow(id)` | `id` | `boolean` | 删除指定行 |
| `batchDelete(ids)` | `Array<id>` | `number` | 批量删除 |
| `search(data, keyword, fields)` | `Array, string, Array` | `Array` | 关键词搜索 |
| `filter(data, conditions)` | `Array, Object` | `Array` | 条件筛选 |
| `sort(data, field, order)` | `Array, string, string` | `Array` | 排序 |
| `paginate(data, page, pageSize)` | `Array, number, number` | `{data, pagination}` | 分页 |

## 完整代码

```javascript
const APIDataManager = {
    pageId: null,
    dataPath: null,
    cache: null,
    
    init: function(config) {
        this.pageId = config.pageId;
        this.dataPath = config.dataFile;
    },
    
    loadData: async function() {
        try {
            const response = await fetch(this.dataPath);
            if (response.ok) {
                const data = await response.json();
                this.cache = data;
                this.saveToLocalStorage(data);
                return { success: true, data: data, source: 'json' };
            }
        } catch (e) {
            console.warn('JSON 加载失败，使用 localStorage:', e);
        }
        return this.loadFromLocalStorage();
    },
    
    saveData: async function(data) {
        this.cache = data;
        this.saveToLocalStorage(data);
        return { success: true, message: '已保存到本地缓存，请点击"导出数据"保存到文件' };
    },
    
    loadFromLocalStorage: function() {
        try {
            const key = 'erp_prototype_' + this.pageId;
            const data = localStorage.getItem(key);
            this.cache = data ? JSON.parse(data) : [];
            return { success: true, data: this.cache, source: 'localStorage' };
        } catch (e) {
            return { success: false, data: [], message: e.message };
        }
    },
    
    saveToLocalStorage: function(data) {
        try {
            const key = 'erp_prototype_' + this.pageId;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('localStorage 保存失败:', e);
        }
    },
    
    addRow: async function(row) {
        const data = this.cache || [];
        row.id = row.id || Date.now();
        row.createdAt = new Date().toISOString();
        row.updatedAt = new Date().toISOString();
        data.push(row);
        await this.saveData(data);
        return row;
    },
    
    updateRow: async function(id, updates) {
        const data = this.cache || [];
        const index = data.findIndex(row => row.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
            await this.saveData(data);
            return data[index];
        }
        return null;
    },
    
    deleteRow: async function(id) {
        const data = this.cache || [];
        const filtered = data.filter(row => row.id !== id);
        await this.saveData(filtered);
        return filtered.length < data.length;
    },
    
    batchDelete: async function(ids) {
        const data = this.cache || [];
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
                if (value === '' || value === null || value === undefined) return true;
                return row[field] === value;
            });
        });
    },
    
    sort: function(data, field, order) {
        return [...data].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            if (order === 'desc') return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
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
            pagination: { current: page, pageSize: pageSize, total: total, totalPages: totalPages }
        };
    }
};
```

## 使用示例

```javascript
const DATA_CONFIG = {
    pageId: 'cost-detail',
    dataFile: 'data/cost-detail-data.json'
};

APIDataManager.init(DATA_CONFIG);
const result = await APIDataManager.loadData();
```