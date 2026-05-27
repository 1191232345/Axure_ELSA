/* ========================================
   TOB 产品公共 JavaScript（纯静态方案）
   ======================================== */

/* 1. API 数据管理器 */
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

/* 3. Tab 切换 */
(function() {
    var prdLoaded = false;
    var testCasesLoaded = false;
    
    function switchMainTab(tabName) {
        document.querySelectorAll('.tabs .tab').forEach(function(t) {
            t.classList.remove('active');
        });
        var tabBtn = document.getElementById('tab-' + tabName);
        if (tabBtn) tabBtn.classList.add('active');
        
        var proto = document.getElementById('main-prototype');
        var prd = document.getElementById('main-prd');
        var tc = document.getElementById('main-testcases');
        
        if (proto) {
            var show = tabName === 'prototype';
            proto.style.display = show ? 'flex' : 'none';
            proto.style.flexDirection = show ? 'column' : '';
            proto.classList.toggle('active', show);
        }
        if (prd) {
            var showPrd = tabName === 'prd';
            prd.style.display = showPrd ? 'block' : 'none';
            prd.classList.toggle('active', showPrd);
        }
        if (tc) {
            var showTc = tabName === 'testcases';
            tc.style.display = showTc ? 'block' : 'none';
            tc.classList.toggle('active', showTc);
        }
        
        if (tabName === 'prd' && !prdLoaded) {
            loadPRD();
        }
        if (tabName === 'testcases' && !testCasesLoaded) {
            loadTestCases();
        }
    }
    
    window.switchMainTab = switchMainTab;
})();

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
    
    toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + ' mr-2"></i>' + message;
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
    var mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    
    var modal = document.getElementById('mermaidModal');
    var content = document.getElementById('mermaidModalContent');
    if (!modal || !content) return;
    
    content.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
    modal.classList.add('active');
    if (typeof mermaid !== 'undefined') {
        try {
            mermaid.init(undefined, content.querySelector('.mermaid'));
        } catch (e) {
            console.warn('mermaid init', e);
        }
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget) return;
    var modal = document.getElementById('mermaidModal');
    if (modal) modal.classList.remove('active');
}

/* 7. PRD 加载 */
function loadPRD() {
    var prdContent = document.getElementById('prd-content');
    if (!prdContent) return;
    
    prdContent.innerHTML = '<div class="text-center py-16"><i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';
    
    fetch('prd.md')
        .then(function(r) { return r.text(); })
        .then(function(text) {
            if (typeof marked !== 'undefined') {
                prdContent.innerHTML = marked.parse(text);
                generateTOC();
            } else {
                prdContent.innerHTML = '<pre style="white-space:pre-wrap;">' + escapeHtml(text) + '</pre>';
            }
        })
        .catch(function() {
            prdContent.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fas fa-file-alt text-4xl mb-4"></i><p>暂无 PRD 文档</p></div>';
        });
}

/* 8. 测试用例加载 */
function loadTestCases() {
    var container = document.getElementById('testcases-content') || document.getElementById('main-testcases');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-16"><i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';
    
    fetch('test-cases.md')
        .then(function(r) { return r.text(); })
        .then(function(text) {
            if (typeof marked !== 'undefined') {
                container.innerHTML = marked.parse(text);
            } else {
                container.innerHTML = '<pre style="white-space:pre-wrap;">' + escapeHtml(text) + '</pre>';
            }
        })
        .catch(function() {
            container.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fas fa-file-alt text-4xl mb-4"></i><p>暂无测试用例</p></div>';
        });
}

/* 9. 目录生成 */
function generateTOC() {
    var tocNav = document.getElementById('toc-nav');
    var prdContent = document.getElementById('prd-content');
    if (!tocNav || !prdContent) return;
    
    var headings = prdContent.querySelectorAll('h2, h3');
    if (!headings.length) {
        tocNav.innerHTML = '';
        return;
    }
    
    var html = '';
    headings.forEach(function(h, i) {
        if (!h.id) h.id = 'toc-heading-' + i;
        var level = h.tagName === 'H2' ? 2 : 3;
        var cls = level === 2 ? 'toc-level-2' : 'toc-level-3';
        html += '<a class="' + cls + '" href="#' + h.id + '">' + escapeHtml(h.textContent || '') + '</a>';
    });
    tocNav.innerHTML = html;
}

/* 10. 逻辑说明折叠 */
function togglePrdLogic(moduleId) {
    var content = document.getElementById(moduleId + '-logic-content');
    var icon = document.getElementById(moduleId + '-logic-icon');
    
    if (!content || !icon) return;
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

function toggleLogic() {
    var content = document.getElementById('logicContent');
    var icon = document.getElementById('logicIcon');
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

/* 13. HTML 转义 */
function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

/* 14. 初始化 */
document.addEventListener('DOMContentLoaded', function() {
    if (typeof DATA_CONFIG !== 'undefined') {
        APIDataManager.init(DATA_CONFIG);
        StateManager.init(DATA_CONFIG.pageId);
    }
});