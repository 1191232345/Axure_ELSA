# 状态管理器

页面状态持久化模块，负责筛选条件、分页、排序等状态的保存和恢复。

## 方法速查

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `init(pageId)` | `string` | - | 初始化页面ID |
| `getState()` | - | `Object` | 获取完整状态 |
| `saveState(state)` | `Object` | - | 保存完整状态 |
| `saveFilters(filters)` | `Object` | - | 保存筛选条件 |
| `savePagination(pagination)` | `Object` | - | 保存分页状态 |
| `saveSort(field, order)` | `string, string` | - | 保存排序状态 |
| `saveSelectedRows(ids)` | `Array` | - | 保存选中行 |
| `clearState()` | - | - | 清除所有状态 |

## 完整代码

```javascript
const StateManager = {
    pageId: null,
    
    init: function(pageId) {
        this.pageId = pageId;
    },
    
    getState: function() {
        const key = 'erp_state_' + this.pageId;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : this.getDefaultState();
        } catch (e) {
            return this.getDefaultState();
        }
    },
    
    saveState: function(state) {
        const key = 'erp_state_' + this.pageId;
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
        const key = 'erp_state_' + this.pageId;
        localStorage.removeItem(key);
    }
};
```

## 使用示例

```javascript
StateManager.init('cost-detail');

// 保存筛选条件
StateManager.saveFilters({ status: 'active', warehouse: 'DE001' });

// 恢复状态
const state = StateManager.getState();
currentPage = state.pagination.current;
```