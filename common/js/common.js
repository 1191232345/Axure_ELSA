/* ========================================
   TOB 产品公共 JavaScript
   ======================================== */

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
                let data = result.data;
                if (data && !Array.isArray(data)) {
                    if (data.listData && Array.isArray(data.listData)) {
                        data = data.listData;
                    } else {
                        data = Object.keys(data)
                            .filter(key => !isNaN(key))
                            .map(key => data[key]);
                    }
                }
                this.cache = data || [];
                return { success: true, data: this.cache, source: 'api' };
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
            page: page,
            pageSize: pageSize,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }
};

const StateManager = {
    pageId: null,
    
    init: function(pageId) {
        this.pageId = pageId;
    },
    
    save: function(key, value) {
        try {
            const fullKey = 'erp_state_' + this.pageId + '_' + key;
            localStorage.setItem(fullKey, JSON.stringify(value));
        } catch (e) {
            console.error('状态保存失败:', e);
        }
    },
    
    load: function(key, defaultValue) {
        try {
            const fullKey = 'erp_state_' + this.pageId + '_' + key;
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    
    remove: function(key) {
        const fullKey = 'erp_state_' + this.pageId + '_' + key;
        localStorage.removeItem(fullKey);
    },
    
    clear: function() {
        const prefix = 'erp_state_' + this.pageId + '_';
        Object.keys(localStorage)
            .filter(key => key.startsWith(prefix))
            .forEach(key => localStorage.removeItem(key));
    }
};

const ToastManager = {
    container: null,
    
    init: function() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show: function(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;
        this.init();
        
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML = '<i class="fa fa-' + this.getIcon(type) + '"></i><span style="margin-left: 8px;">' + message + '</span>';
        
        this.container.appendChild(toast);
        
        setTimeout(function() {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, duration);
    },
    
    getIcon: function(type) {
        var icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },
    
    success: function(message, duration) {
        this.show(message, 'success', duration);
    },
    
    warning: function(message, duration) {
        this.show(message, 'warning', duration);
    },
    
    error: function(message, duration) {
        this.show(message, 'error', duration);
    },
    
    info: function(message, duration) {
        this.show(message, 'info', duration);
    }
};

const ModalManager = {
    show: function(options) {
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = '\
            <div class="modal-content">\
                <div class="modal-header">\
                    <h3>' + (options.title || '提示') + '</h3>\
                    <button class="modal-close" onclick="ModalManager.hide(this)">&times;</button>\
                </div>\
                <div class="modal-body">' + (options.content || '') + '</div>\
                <div class="modal-footer">\
                    <button class="erp-btn erp-btn-secondary" onclick="ModalManager.hide(this)">取消</button>\
                    <button class="erp-btn erp-btn-primary" onclick="ModalManager.confirm(this)">' + (options.confirmText || '确定') + '</button>\
                </div>\
            </div>\
        ';
        
        modal._onConfirm = options.onConfirm;
        document.body.appendChild(modal);
        
        setTimeout(function() {
            modal.classList.add('show');
        }, 10);
        
        return modal;
    },
    
    hide: function(element) {
        var modal = element.closest('.modal');
        modal.classList.remove('show');
        setTimeout(function() {
            modal.remove();
        }, 300);
    },
    
    confirm: function(element) {
        var modal = element.closest('.modal');
        if (modal._onConfirm) {
            modal._onConfirm();
        }
        this.hide(element);
    },
    
    alert: function(message, title) {
        return this.show({
            title: title || '提示',
            content: '<p>' + message + '</p>',
            confirmText: '知道了'
        });
    },
    
    confirm: function(message, onConfirm, title) {
        return this.show({
            title: title || '确认',
            content: '<p>' + message + '</p>',
            confirmText: '确定',
            onConfirm: onConfirm
        });
    }
};

function formatDate(date, format) {
    if (!date) return '';
    if (typeof date === 'string') {
        date = new Date(date);
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }
    
    format = format || 'YYYY-MM-DD HH:mm:ss';
    
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    
    var replacements = {
        'YYYY': date.getFullYear(),
        'MM': pad(date.getMonth() + 1),
        'DD': pad(date.getDate()),
        'HH': pad(date.getHours()),
        'mm': pad(date.getMinutes()),
        'ss': pad(date.getSeconds())
    };
    
    var result = format;
    for (var key in replacements) {
        result = result.replace(key, replacements[key]);
    }
    return result;
}

function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this;
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

function throttle(func, limit) {
    var inThrottle;
    return function() {
        var context = this;
        var args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() {
                inThrottle = false;
            }, limit);
        }
    };
}

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(function(item) { return deepClone(item); });
    }
    var cloned = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
