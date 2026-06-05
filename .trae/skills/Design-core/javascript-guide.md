# JavaScript 交互指南（完整版）

完整的 JavaScript 交互逻辑指南，包含公共模块、CRUD操作、搜索筛选、分页选择、表单验证、状态切换、导出审批、UI组件等所有常见交互模式。

> **单一数据源**：所有 JS 逻辑统一定义在此文件。

---

## Part 1：公共模块

### 1.1 初始化

```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (typeof DATA_CONFIG !== 'undefined') {
        APIDataManager.init(DATA_CONFIG);
        StateManager.init(DATA_CONFIG.pageId);
    }
});
```

`DATA_CONFIG` 必须在 common.js 加载前定义：
```javascript
const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: 'data/[page_id]-data.json',
    version: '1.0.0'
};
```

### 1.2 状态管理器 StateManager

页面状态持久化模块，负责筛选条件、分页、排序等状态的保存和恢复。

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

```javascript
const StateManager = {
    pageId: null,
    
    init: function(pageId) { this.pageId = pageId; },
    
    getState: function() {
        const key = 'erp_state_' + this.pageId;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : this.getDefaultState();
        } catch (e) { return this.getDefaultState(); }
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
    
    saveFilters: function(filters) { const s = this.getState(); s.filters = filters; this.saveState(s); },
    savePagination: function(p) { const s = this.getState(); s.pagination = p; this.saveState(s); },
    saveSort: function(field, order) { const s = this.getState(); s.sort = { field, order }; this.saveState(s); },
    saveSelectedRows: function(ids) { const s = this.getState(); s.selectedRows = ids; this.saveState(s); },
    clearState: function() { localStorage.removeItem('erp_state_' + this.pageId); }
};
```

### 1.3 API 数据管理器 APIDataManager

数据持久化核心模块，负责 JSON 文件读取和 localStorage 缓存。

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

```javascript
const APIDataManager = {
    pageId: null, dataPath: null, cache: null,
    
    init: function(config) { this.pageId = config.pageId; this.dataPath = config.dataFile; },
    
    loadData: async function() {
        try {
            const response = await fetch(this.dataPath);
            if (response.ok) {
                const data = await response.json();
                this.cache = data;
                this.saveToLocalStorage(data);
                return { success: true, data: data, source: 'json' };
            }
        } catch (e) { console.warn('JSON 加载失败，使用 localStorage:', e); }
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
        } catch (e) { return { success: false, data: [], message: e.message }; }
    },
    
    saveToLocalStorage: function(data) {
        try {
            const key = 'erp_prototype_' + this.pageId;
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) { console.error('localStorage 保存失败:', e); }
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
        return data.filter(row => fields.some(field => {
            const value = row[field];
            return value && String(value).toLowerCase().includes(lowerKeyword);
        }));
    },
    
    filter: function(data, conditions) {
        return data.filter(row => Object.keys(conditions).every(field => {
            const value = conditions[field];
            if (value === '' || value === null || value === undefined) return true;
            return row[field] === value;
        }));
    },
    
    sort: function(data, field, order) {
        return [...data].sort((a, b) => {
            const aVal = a[field], bVal = b[field];
            if (order === 'desc') return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    },
    
    paginate: function(data, page, pageSize) {
        const total = data.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        return {
            data: data.slice(start, start + pageSize),
            pagination: { current: page, pageSize, total, totalPages }
        };
    }
};
```

### 1.4 Tab 切换

```javascript
function switchMainTab(tab) {
    document.querySelectorAll('.main-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.getElementById('main-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    if (tab === 'prd') loadPRD();
    else if (tab === 'testcases') loadTestCases();
}
```

### 1.5 内容加载器

PRD 文档和测试用例的 Markdown 加载与目录生成。

```javascript
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

function generateTOC() {
    var tocNav = document.getElementById('toc-nav');
    var prdContent = document.getElementById('prd-content');
    if (!tocNav || !prdContent) return;
    var headings = prdContent.querySelectorAll('h2, h3');
    if (!headings.length) { tocNav.innerHTML = ''; return; }
    var html = '';
    headings.forEach(function(h, i) {
        if (!h.id) h.id = 'toc-heading-' + i;
        var level = h.tagName === 'H2' ? 2 : 3;
        html += '<a class="' + (level === 2 ? 'toc-level-2' : 'toc-level-3') + '" href="#' + h.id + '">' + escapeHtml(h.textContent || '') + '</a>';
    });
    tocNav.innerHTML = html;
}
```

### 1.6 格式化工具

```javascript
function formatDate(date, format) {
    if (!date) return '';
    const d = new Date(date);
    format = format || 'YYYY-MM-DD';
    return format
        .replace('YYYY', d.getFullYear())
        .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(d.getDate()).padStart(2, '0'))
        .replace('HH', String(d.getHours()).padStart(2, '0'))
        .replace('mm', String(d.getMinutes()).padStart(2, '0'))
        .replace('ss', String(d.getSeconds()).padStart(2, '0'));
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### 1.7 数据导出

```javascript
function exportData(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.json';
    link.click();
    URL.revokeObjectURL(url);
}
```

### 1.8 Mermaid 模态框

```javascript
function openMermaidModal(container) {
    var mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    var modal = document.getElementById('mermaidModal');
    var content = document.getElementById('mermaidModalContent');
    if (!modal || !content) return;
    content.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
    modal.classList.add('show');
    if (typeof mermaid !== 'undefined') {
        try { mermaid.init(undefined, content.querySelector('.mermaid')); } catch (e) { console.warn('mermaid init', e); }
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget) return;
    var modal = document.getElementById('mermaidModal');
    if (modal) modal.classList.remove('show');
}
```

---

## Part 2：CRUD 操作

### 新增数据

```javascript
function openAddModal() {
    document.getElementById('dataForm').reset();
    clearFormValidation();
    document.getElementById('formMode').value = 'add';
    openModal('formModal');
}

function saveAddData() {
    const formData = getFormData();
    if (!validateForm(formData)) return;
    fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) { showToast('新增成功', 'success'); closeModal('formModal'); refreshTable(); }
        else showToast(data.message || '新增失败', 'error');
    })
    .catch(error => { console.error('新增失败:', error); showToast('新增失败，请重试', 'error'); });
}
```

### 编辑数据

```javascript
function openEditModal(id) {
    fetch('/api/data/' + id)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fillForm(data.data);
                document.getElementById('formMode').value = 'edit';
                document.getElementById('editId').value = id;
                openModal('formModal');
            } else showToast('获取数据失败', 'error');
        })
        .catch(error => { console.error('获取数据失败:', error); showToast('获取数据失败，请重试', 'error'); });
}

function saveEditData() {
    const formData = getFormData();
    const editId = document.getElementById('editId').value;
    if (!validateForm(formData)) return;
    fetch('/api/data/' + editId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) { showToast('编辑成功', 'success'); closeModal('formModal'); refreshTable(); }
        else showToast(data.message || '编辑失败', 'error');
    })
    .catch(error => { console.error('编辑失败:', error); showToast('编辑失败，请重试', 'error'); });
}
```

### 删除数据

```javascript
function deleteData(id) {
    if (!confirm('确定要删除这条数据吗？此操作不可撤销。')) return;
    fetch('/api/data/' + id, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        if (data.success) { showToast('删除成功', 'success'); refreshTable(); }
        else showToast(data.message || '删除失败', 'error');
    })
    .catch(error => { console.error('删除失败:', error); showToast('删除失败，请重试', 'error'); });
}

function batchDelete() {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) { showToast('请选择要删除的数据', 'warning'); return; }
    if (!confirm('确定要删除选中的 ' + selectedIds.length + ' 条数据吗？')) return;
    fetch('/api/data/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) { showToast('批量删除成功', 'success'); refreshTable(); clearSelection(); }
        else showToast(data.message || '批量删除失败', 'error');
    })
    .catch(error => { console.error('批量删除失败:', error); showToast('批量删除失败，请重试', 'error'); });
}
```

---

## Part 3：搜索筛选

```javascript
function searchData() {
    const searchParams = getSearchParams();
    currentPage = 1;
    fetch('/api/data/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) { renderTable(data.data); renderPagination(data.total, data.pageSize); }
        else showToast(data.message || '搜索失败', 'error');
    })
    .catch(error => { console.error('搜索失败:', error); showToast('搜索失败，请重试', 'error'); });
}

function resetSearch() {
    document.getElementById('searchForm').reset();
    currentPage = 1;
    loadTableData();
}

function getSearchParams() {
    const form = document.getElementById('searchForm');
    const formData = new FormData(form);
    const params = {};
    formData.forEach((value, key) => { if (value) params[key] = value; });
    return params;
}
```

---

## Part 4：分页选择

```javascript
function changePage(page) { currentPage = page; loadTableData(); }
function changePageSize(pageSize) { currentPage = 1; currentPageSize = pageSize; loadTableData(); }

function getSelectedIds() {
    return Array.from(document.querySelectorAll('input[name="id"]:checked')).map(cb => parseInt(cb.value));
}

function toggleSelectAll(checked) {
    document.querySelectorAll('input[name="id"]').forEach(cb => { cb.checked = checked; });
    updateBatchButtonState();
}

function updateBatchButtonState() {
    const selectedIds = getSelectedIds();
    document.querySelectorAll('.batch-btn').forEach(btn => { btn.disabled = selectedIds.length === 0; });
}
```

---

## Part 5：表单验证

```javascript
function validateForm(formData) {
    let isValid = true;
    clearFormValidation();
    const requiredFields = ['name', 'code'];
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            showFieldError(field, '此字段为必填项');
            isValid = false;
        }
    });
    if (formData.email && !isValidEmail(formData.email)) { showFieldError('email', '邮箱格式不正确'); isValid = false; }
    if (formData.phone && !isValidPhone(formData.phone)) { showFieldError('phone', '手机号格式不正确'); isValid = false; }
    return isValid;
}

function showFieldError(fieldName, message) {
    const field = document.querySelector('[name="' + fieldName + '"]');
    if (field) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message text-danger text-xs mt-1';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
}

function clearFormValidation() {
    document.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(m => m.remove());
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPhone(phone) { return /^1[3-9]\d{9}$/.test(phone); }
```

---

## Part 6：状态切换与导出审批

```javascript
function toggleStatus(id, status) {
    fetch('/api/data/' + id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) { showToast('状态更新成功', 'success'); refreshTable(); }
        else showToast(data.message || '状态更新失败', 'error');
    })
    .catch(error => { console.error('状态更新失败:', error); showToast('状态更新失败，请重试', 'error'); });
}

function exportData() {
    const searchParams = getSearchParams();
    fetch('/api/data/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data_export_' + new Date().getTime() + '.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('导出成功', 'success');
    })
    .catch(error => { console.error('导出失败:', error); showToast('导出失败，请重试', 'error'); });
}

function approveData(id, action) {
    const actionText = action === 'approve' ? '通过' : '拒绝';
    if (!confirm('确定要' + actionText + '这条申请吗？')) return;
    fetch('/api/data/' + id + '/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) { showToast('审批' + actionText + '成功', 'success'); refreshTable(); }
        else showToast(data.message || '审批失败', 'error');
    })
    .catch(error => { console.error('审批失败:', error); showToast('审批失败，请重试', 'error'); });
}
```

---

## Part 7：UI 组件

### 模态框管理

```javascript
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.remove('show'); document.body.style.overflow = ''; }
}
```

### Toast 提示

```javascript
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<div class="toast-content"><i class="fas ' + (icons[type] || icons.info) + ' toast-icon"></i><span class="toast-message">' + message + '</span><button class="toast-close" onclick="this.closest(\'.toast\').remove()"><i class="fas fa-xmark"></i></button></div>';
    container.appendChild(toast);
    if (duration > 0) {
        setTimeout(function() {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(function() { toast.remove(); }, 300);
        }, duration);
    }
}
```

---

## 使用规范

1. **错误处理**：所有请求必须有错误处理和用户提示
2. **加载状态**：长时间操作显示加载状态
3. **数据验证**：前端验证 + 后端验证双重保障
4. **用户体验**：操作成功/失败都有明确反馈
5. **代码复用**：公共函数提取到 Part 1 模块
