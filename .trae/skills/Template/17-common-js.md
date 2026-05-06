# 公共 JS 模板 (common.js)

本文件包含所有模块共用的公共 JavaScript，放置在 `/common/js/common.js`。

## 完整代码

```javascript
/* ========================================
   TOB 产品公共 JavaScript
   ======================================== */

/* 1. API 数据管理器 */
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
            const response = await fetch(this.apiBase + '/' + this.dataPath);
            const result = await response.json();
            
            if (result.success) {
                this.cache = result.data;
                return { success: true, data: result.data, source: 'api' };
            }
            return { success: false, data: [], message: result.message };
        } catch (e) {
            console.warn('API 加载失败，使用 localStorage:', e);
            return this.loadFromLocalStorage();
        }
    },
    
    saveData: async function(data) {
        try {
            const response = await fetch(this.apiBase + '/' + this.dataPath, {
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
            const key = 'erp_prototype_' + this.pageId;
            const data = localStorage.getItem(key);
            return { success: true, data: data ? JSON.parse(data) : [], source: 'localStorage' };
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
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
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

/* 2. 状态管理器 */
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
    
    clearState: function() {
        const key = 'erp_state_' + this.pageId;
        localStorage.removeItem(key);
    }
};

/* 3. Tab 切换 */
function switchMainTab(tab) {
    document.querySelectorAll('.main-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById('main-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    
    if (tab === 'prd') {
        loadPRD();
    } else if (tab === 'testcases') {
        loadTestCases();
    }
}

/* 4. Toast 提示 */
function showToast(message, type) {
    type = type || 'info';
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = '<i class="fa ' + (icons[type] || icons.info) + ' mr-2"></i>' + message;
    container.appendChild(toast);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

/* 5. 模态框 */
function openModal(modalId) {
    modalId = modalId || 'formModal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    modalId = modalId || 'formModal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/* 6. Mermaid 模态框 */
function openMermaidModal(container) {
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    
    const modal = document.getElementById('mermaidModal');
    const content = document.getElementById('mermaidModalContent');
    
    if (modal && content) {
        content.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
        modal.classList.add('show');
        mermaid.init(undefined, content.querySelector('.mermaid'));
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('mermaidModal');
    if (modal) modal.classList.remove('show');
}

/* 7. PRD 加载 */
function loadPRD() {
    const prdContent = document.getElementById('prd-content');
    if (!prdContent) return;
    
    prdContent.innerHTML = '<div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';
    
    fetch('prd.md')
        .then(response => response.text())
        .then(text => {
            prdContent.innerHTML = marked.parse(text);
            generateTOC();
        })
        .catch(err => {
            prdContent.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无 PRD 文档</p></div>';
        });
}

/* 8. 测试用例加载 */
function loadTestCases() {
    const container = document.getElementById('main-testcases');
    if (!container) return;
    
    container.innerHTML = '<div class="container mx-auto px-4 py-8"><div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div></div>';
    
    fetch('test-cases.md')
        .then(response => response.text())
        .then(text => {
            container.innerHTML = '<div class="container mx-auto px-4 py-8"><div class="bg-white rounded-2xl shadow-xl p-8"><div class="prose max-w-none">' + marked.parse(text) + '</div></div></div>';
        })
        .catch(err => {
            container.innerHTML = '<div class="container mx-auto px-4 py-8"><div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无测试用例</p></div></div>';
        });
}

/* 9. 目录生成 */
function generateTOC() {
    const tocNav = document.getElementById('toc-nav');
    const prdContent = document.getElementById('prd-content');
    if (!tocNav || !prdContent) return;
    
    const headings = prdContent.querySelectorAll('h2, h3');
    let html = '';
    
    headings.forEach(function(heading, index) {
        const id = 'heading-' + index;
        heading.id = id;
        const level = heading.tagName === 'H2' ? '' : 'ml-4';
        html += '<a href="#' + id + '" class="toc-item ' + level + '">' + heading.textContent + '</a>';
    });
    
    tocNav.innerHTML = html;
}

/* 10. 逻辑说明折叠 */
function toggleLogic() {
    const content = document.getElementById('logicContent');
    const icon = document.getElementById('logicIcon');
    if (content && icon) {
        content.classList.toggle('hidden');
        icon.style.transform = content.classList.contains('hidden') ? '' : 'rotate(180deg)';
    }
}

/* 11. 导出数据 */
function exportData(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.json';
    link.click();
    URL.revokeObjectURL(url);
}

/* 12. 格式化日期 */
function formatDate(date, format) {
    if (!date) return '';
    const d = new Date(date);
    format = format || 'YYYY-MM-DD';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/* 13. 初始化 */
document.addEventListener('DOMContentLoaded', function() {
    if (typeof DATA_CONFIG !== 'undefined') {
        APIDataManager.init(DATA_CONFIG);
        StateManager.init(DATA_CONFIG.pageId);
    }
});
```

## 使用方式

在 HTML 中引用：

```html
<script src="/common/js/common.js"></script>
```

## 依赖关系

```
common.js
├── APIDataManager    → 数据持久化（依赖 DATA_CONFIG）
├── StateManager      → 状态管理（依赖 pageId）
├── switchMainTab     → Tab 切换
├── showToast         → 提示消息
├── openModal         → 打开模态框
├── closeModal        → 关闭模态框
├── loadPRD           → 加载 PRD（依赖 marked.js）
├── loadTestCases     → 加载测试用例（依赖 marked.js）
└── formatDate        → 日期格式化
```
