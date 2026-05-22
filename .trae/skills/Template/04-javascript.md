# JavaScript 交互模板 (v2.3)

本文件包含TOB产品的**模块级** JavaScript 交互函数库。

> **v2.3 更新说明**：
> - 📦 **去重优化**：Part1 核心框架函数已统一至 [17-common-js.md](17-common-js.md)，本文件仅保留模块特有逻辑
> - 📦 **合并优化**：已整合原 `13-button-interaction.md` 的全部业务逻辑函数
> - ✨ 新增 **Toast 通知系统**（完整实现，支持4种类型+自动消失）
> - 🆕 新增 **标签页切换组件**（线型/卡片型，含动画过渡）
> - 💫 新增 **骨架屏加载控制**（显示/隐藏/变体切换）
> - ⚠️ 新增 **Alert 提示框组件**（可关闭/自动消失）
> - 🔗 新增 **面包屑导航交互**（基础版/可编辑版）
> - 🔍 **新增业务逻辑**：搜索/筛选、CRUD操作、导出/审批、分页/选择等

---

## 📚 目录结构

### **Part1：核心框架函数**（→ 已统一至 [17-common-js.md](17-common-js.md)）

以下函数已迁移至公共 JS，引入 `common.js` 即可使用：

| 函数 | 说明 | 详见 |
|------|------|------|
| `switchMainTab(tab)` | 主标签切换 | [17-common-js.md §3](17-common-js.md) |
| `openMermaidModal(container)` | Mermaid 图表放大 | [17-common-js.md §6](17-common-js.md) |
| `closeMermaidModal(event)` | 关闭 Mermaid 模态框 | [17-common-js.md §6](17-common-js.md) |
| `loadPRD()` | 加载 PRD 文档 | [17-common-js.md §7](17-common-js.md) |
| `loadTestCases()` | 加载测试用例 | [17-common-js.md §8](17-common-js.md) |
| `generateTOC()` | 生成目录导航 | [17-common-js.md §9](17-common-js.md) |
| `toggleLogic()` | 切换逻辑说明 | [17-common-js.md §10](17-common-js.md) |
| `showToast(message, type)` | Toast 提示 | [17-common-js.md §4](17-common-js.md) |
| `openModal(modalId)` | 打开模态框 | [17-common-js.md §5](17-common-js.md) |
| `closeModal(modalId)` | 关闭模态框 | [17-common-js.md §5](17-common-js.md) |
| `APIDataManager` | 数据持久化管理器 | [17-common-js.md §1](17-common-js.md) |
| `StateManager` | 状态管理器 | [17-common-js.md §2](17-common-js.md) |
| `formatDate(date, format)` | 日期格式化 | [17-common-js.md §12](17-common-js.md) |
| `exportData(data, filename)` | 导出数据 | [17-common-js.md §11](17-common-js.md) |

### **Part2：UI 组件库**（可复用组件 - 本文件独有）
- [9. Toast 通知系统（增强版）](#9-toast-通知系统完整实现)
- [10. 标签页切换组件](#10-标签页切换组件)
- [11. 骨架屏加载控制](#11-骨架屏加载控制)
- [12. Alert 提示框组件](#12-alert-提示框组件)
- [13. 面包屑导航](#13-面包屑导航交互)
- [14. 确认对话框组件](#14-确认对话框组件)
- [15. 加载状态组件](#15-加载状态组件)

### **Part3：表单操作**（搜索/验证）
- [16. 搜索/筛选逻辑](#16-搜索筛选按钮逻辑)
- [17. 表单验证工具](#17-表单验证与错误提示)

### **Part4：CRUD 操作**（增删改查）
- [18. 新增按钮逻辑](#18-新增按钮逻辑)
- [19. 编辑按钮逻辑](#19-编辑按钮逻辑)
- [20. 删除按钮逻辑](#20-删除按钮逻辑)
- [21. 状态切换逻辑](#21-状态切换按钮逻辑)

### **Part5：数据处理**（导出/审批）
- [22. 导出数据逻辑](#22-导出按钮逻辑)
- [23. 审批流程逻辑](#23-审批按钮逻辑)

### **Part6：列表交互**（分页/选择）
- [24. 分页组件逻辑](#24-分页逻辑)
- [25. 表格选择逻辑](#25-表格选择逻辑)

---

# Part1：核心框架函数（已迁移至公共 JS）

> **⚠️ 以下函数已统一至 [17-common-js.md](17-common-js.md)（common.js）**
>
> 引入 `<script src="/common/js/common.js"></script>` 即可使用，无需在模块 JS 中重复定义。
>
> 以下仅保留本文件独有的增强版实现（如 Toast 增强版），公共版实现请查看 17-common-js.md。

## 1. 主标签切换

> 已迁移至 [17-common-js.md §3](17-common-js.md)

## 2. Mermaid 图表放大预览

> 已迁移至 [17-common-js.md §6](17-common-js.md)

## 3. 加载 PRD 文档

> 已迁移至 [17-common-js.md §7](17-common-js.md)

## 4. 加载测试用例文档

> 已迁移至 [17-common-js.md §8](17-common-js.md)

## 5. 生成目录导航

> 已迁移至 [17-common-js.md §9](17-common-js.md)

## 6. 切换逻辑说明展开/收起

> 已迁移至 [17-common-js.md §10](17-common-js.md)

## 7. 页面切换（原型内多页面）

> 本函数为 `04-javascript.md` 独有，用于原型内多页面切换（非 Tab 切换）。

```javascript
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(function(page) {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}
```

## 8. 页面加载完成后初始化

> 本函数为 `04-javascript.md` 独有，用于初始化模块级组件。

```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面初始化完成');

    // 初始化 Toast 容器
    initToastContainer();

    // 初始化标签页
    initTabs();
});
```

---

# Part2：UI 组件库

## 9. Toast 通知系统（完整实现）

### 9.1 Toast 核心函数

```javascript
/**
 * 显示 Toast 通知
 * @param {string} message - 通知消息文本
 * @param {string} type - 通知类型：'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - 显示时长（毫秒），默认 3000ms
 * @returns {string} toastId - 返回唯一ID，可用于手动关闭
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = getOrCreateToastContainer();

    const toastId = 'toast-' + Date.now();
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const toastHTML = `
        <div id="${toastId}" class="toast toast-${type}" role="alert">
            <i class="${iconMap[type]} toast-icon"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close-btn" onclick="closeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
            ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms"></div>` : ''}
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);

    // 自动消失
    if (duration > 0) {
        setTimeout(() => closeToast(toastId), duration);
    }

    return toastId;
}

/**
 * 关闭指定 Toast
 * @param {string} toastId - Toast 元素 ID
 */
function closeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (!toast || toast.classList.contains('hiding')) return;

    toast.classList.add('hiding');

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 150);
}

/**
 * 获取或创建 Toast 容器
 */
function getOrCreateToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * 初始化 Toast 容器
 */
function initToastContainer() {
    getOrCreateToastContainer();
}
```

### 9.2 快捷方法封装

```javascript
const Toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
    close: closeToast
};
```

---

## 10. 标签页切换组件

### 10.1 线型标签页（Line Tabs）

```javascript
function switchTab(tabElement, targetPanelId) {
    const tabsContainer = tabElement.closest('.tabs-header');
    const tabsContent = tabElement.closest('.tabs-container')?.querySelector('.tabs-content');

    if (tabsContainer) {
        tabsContainer.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
    }

    if (tabsContent) {
        tabsContent.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    }

    tabElement.classList.add('active');

    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    const event = new CustomEvent('tabChange', {
        detail: { tab: tabElement, panelId: targetPanelId }
    });
    tabElement.dispatchEvent(event);
}

function initTabs() {
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.getAttribute('data-tab');
            switchTab(this, targetId);
        });
    });
}

document.addEventListener('DOMContentLoaded', initTabs);
```

### 10.2 卡片型标签页（Pill Tabs）

```javascript
function switchPill(pillElement, targetPanelId) {
    const pillsContainer = pillElement.closest('.pills-container');
    const parentContainer = pillElement.closest('.tabs-container');

    if (pillsContainer) {
        pillsContainer.querySelectorAll('.pill-item').forEach(pill => pill.classList.remove('active'));
    }

    if (parentContainer) {
        parentContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    }

    pillElement.classList.add('active');

    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}
```

---

## 11. 骨架屏加载控制

```javascript
/**
 * 显示骨架屏
 * @param {string|HTMLElement} target - 目标元素或选择器
 * @param {string} variant - 变体类型：'table' | 'card' | 'detail' | 'list'
 */
function showSkeleton(target, variant = 'table') {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const skeletonVariants = {
        table: `
            <div class="skeleton-wrapper">
                ${Array(5).fill(`
                    <div class="skeleton-table-row">
                        <div class="skeleton-cell" style="flex: 2"></div>
                        <div class="skeleton-cell" style="flex: 3"></div>
                        <div class="skeleton-cell" style="flex: 2"></div>
                        <div class="skeleton-cell" style="flex: 1.5"></div>
                        <div class="skeleton-cell" style="flex: 1.5"></div>
                    </div>
                `).join('')}
            </div>
        `,
        card: `
            <div class="skeleton-wrapper">
                <div class="skeleton skeleton-image mb-4"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 80%"></div>
            </div>
        `,
        detail: `
            <div class="skeleton-wrapper space-y-4">
                <div class="skeleton skeleton-title"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><div class="skeleton skeleton-text"></div></div>
                    <div><div class="skeleton skeleton-text"></div></div>
                </div>
                <div class="skeleton skeleton-text" style="width: 90%"></div>
                <div class="skeleton skeleton-text" style="width: 70%"></div>
            </div>
        `,
        list: `
            <div class="skeleton-wrapper space-y-3">
                ${Array(4).fill(`
                    <div class="flex items-center gap-3 p-3">
                        <div class="skeleton skeleton-avatar"></div>
                        <div class="flex-1">
                            <div class="skeleton skeleton-text" style="width: 60%"></div>
                            <div class="skeleton skeleton-text mt-2" style="width: 40%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `
    };

    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = skeletonVariants[variant] || skeletonVariants.table;
    element.classList.add('skeleton-loading');
}

/**
 * 隐藏骨架屏并恢复原始内容
 */
function hideSkeleton(target, callback) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
        if (element.dataset.originalContent !== undefined) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
        }

        element.classList.remove('skeleton-loading');
        element.style.opacity = '1';

        if (typeof callback === 'function') {
            callback(element);
        }
    }, 300);
}
```

---

## 12. Alert 提示框组件

```javascript
/**
 * 显示 Alert 提示框
 * @param {string} message - 提示消息
 * @param {string} type - 类型：'success' | 'error' | 'warning' | 'info'
 * @param {Object} options - 配置选项
 */
function showAlert(message, type = 'info', options = {}) {
    const {
        dismissible = true,
        duration = 0,
        container = null
    } = options;

    const alertId = 'alert-' + Date.now();

    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} ${dismissible ? 'alert-dismissible' : ''}" role="alert">
            <i class="${iconMap[type]} mr-2"></i>
            <span>${message}</span>
            ${dismissible ? `
                <button class="alert-close ml-auto" onclick="closeAlert('${alertId}')">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </div>
    `;

    let containerEl = container ? document.querySelector(container) : document.querySelector('.alert-container');
    if (!containerEl) {
        containerEl = document.body;
    }

    containerEl.insertAdjacentHTML('beforeend', alertHTML);

    if (duration > 0) {
        setTimeout(() => closeAlert(alertId), duration);
    }

    return alertId;
}

function closeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert && alert.parentNode) {
        alert.parentNode.removeChild(alert);
    }
}
```

---

## 13. 面包屑导航交互

```javascript
/**
 * 更新面包屑导航
 * @param {Array} items - 面包屑项数组 [{label: '', url: ''}, ...]
 */
function updateBreadcrumb(items) {
    const breadcrumbEl = document.querySelector('.breadcrumb');
    if (!breadcrumbEl) return;

    let html = '';
    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
            html += `<span class="breadcrumb-item active">${item.label}</span>`;
        } else {
            html += `<a href="${item.url || '#'}" class="breadcrumb-item">${item.label}</a>`;
            html += `<i class="fas fa-chevron-right breadcrumb-separator"></i>`;
        }
    });

    breadcrumbEl.innerHTML = html;
}

/**
 * 初始化可编辑面包屑
 */
function initEditableBreadcrumb() {
    const breadcrumb = document.querySelector('.editable-breadcrumb');
    if (!breadcrumb) return;

    breadcrumb.addEventListener('click', function(e) {
        const item = e.target.closest('.breadcrumb-item:not(.active)');
        if (item) {
            // 可扩展：打开路径选择器
            console.log('点击面包屑项:', item.textContent);
        }
    });
}
```

---

## 14. 确认对话框组件

### 14.1 确认对话框 HTML 模板

```html
<div id="confirmDialog" class="dialog-overlay">
    <div class="dialog-content">
        <div class="dialog-header">
            <h3 class="dialog-title">确认操作</h3>
            <button class="dialog-close" onclick="closeDialog('confirmDialog')">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="dialog-body">
            <p class="dialog-message">确定要执行此操作吗？</p>
        </div>
        <div class="dialog-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeDialog('confirmDialog')">取消</button>
            <button class="erp-btn erp-btn-primary confirm-btn">确定</button>
        </div>
    </div>
</div>
```

### 14.2 确认对话框 JavaScript 逻辑

```javascript
/**
 * 显示确认对话框
 * @param {Object} options - 配置选项
 * @param {string} options.title - 对话框标题
 * @param {string} options.message - 提示消息
 * @param {string} options.type - 类型：'danger' | 'warning' | 'success' | 'info'
 * @param {string} options.confirmText - 确认按钮文字
 * @param {string} options.cancelText - 取消按钮文字
 * @param {Function} options.onConfirm - 确认回调
 */
function showConfirmDialog(options) {
    const dialog = document.getElementById('confirmDialog');
    const titleEl = dialog.querySelector('.dialog-title');
    const messageEl = dialog.querySelector('.dialog-message');
    const confirmBtn = dialog.querySelector('.confirm-btn');

    titleEl.textContent = options.title || '确认操作';
    messageEl.textContent = options.message || '确定要执行此操作吗？';

    confirmBtn.textContent = options.confirmText || '确定';
    confirmBtn.className = 'erp-btn';

    if (options.type === 'danger') {
        confirmBtn.classList.add('erp-btn-danger');
    } else if (options.type === 'warning') {
        confirmBtn.classList.add('erp-btn-warning');
    } else if (options.type === 'success') {
        confirmBtn.classList.add('erp-btn-success');
    } else {
        confirmBtn.classList.add('erp-btn-primary');
    }

    confirmBtn.onclick = function() {
        closeDialog('confirmDialog');
        if (options.onConfirm) options.onConfirm();
    };

    dialog.querySelector('.erp-btn-secondary').textContent = options.cancelText || '取消';

    openDialog('confirmDialog');
}

function openDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.classList.remove('show');
        document.body.style.overflow = '';
    }
}
```

---

## 15. 加载状态组件

### 15.1 全局加载遮罩

```javascript
function showLoading(message) {
    const loadingEl = document.getElementById('globalLoading');
    if (loadingEl) {
        if (message) {
            loadingEl.querySelector('.loading-text').textContent = message;
        }
        loadingEl.classList.add('show');
    }
}

function hideLoading() {
    const loadingEl = document.getElementById('globalLoading');
    if (loadingEl) {
        loadingEl.classList.remove('show');
    }
}
```

### 15.2 按钮加载状态

```javascript
function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>处理中...';
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || '确定';
        button.classList.remove('loading');
    }
}
```

---

# Part3：表单操作

## 16. 搜索/筛选按钮逻辑

### 16.1 搜索按钮

```javascript
function handleSearch() {
    const searchParams = collectSearchParams();

    if (!validateSearchParams(searchParams)) {
        showToast('请输入有效的搜索条件', 'error');
        return;
    }

    showLoading();

    fetchSearchResults(searchParams)
        .then(function(results) {
            renderSearchResults(results);
            updatePagination(results.total);
            showToast('搜索完成，共 ' + results.total + ' 条结果', 'success');
        })
        .catch(function(error) {
            showToast('搜索失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}

function collectSearchParams() {
    return {
        keyword: document.getElementById('searchKeyword').value.trim(),
        status: document.getElementById('searchStatus').value,
        dateRange: document.getElementById('searchDateRange').value,
        page: currentPage,
        pageSize: pageSize
    };
}

function validateSearchParams(params) {
    if (params.keyword && params.keyword.length < 2) {
        showToast('搜索关键词至少2个字符', 'warning');
        return false;
    }
    return true;
}
```

### 16.2 重置按钮

```javascript
function handleReset() {
    if (confirm('确定要重置所有搜索条件吗？')) {
        resetSearchForm();
        loadDefaultData();
        showToast('搜索条件已重置', 'info');
    }
}

function resetSearchForm() {
    document.querySelectorAll('.search-form input, .search-form select').forEach(function(input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    currentPage = 1;
}
```

---

## 17. 表单验证与错误提示

### 17.1 通用表单验证

```javascript
/**
 * 显示表单错误信息
 * @param {Array} errors - 错误数组 [{field: 'name', message: '错误信息'}]
 */
function showFormErrors(errors) {
    clearFormErrors();
    errors.forEach(function(error) {
        const field = document.getElementById(error.field);
        if (field) {
            field.classList.add('error');
            const errorEl = document.createElement('span');
            errorEl.className = 'form-error-message';
            errorEl.textContent = error.message;
            field.parentNode.appendChild(errorEl);
        }
    });
}

/**
 * 清除所有表单错误
 * @param {HTMLElement} form - 表单元素
 */
function clearFormErrors(form) {
    form.querySelectorAll('.error').forEach(function(el) {
        el.classList.remove('error');
    });
    form.querySelectorAll('.form-error-message').forEach(function(el) {
        el.remove();
    });
}

/**
 * 验证新增表单示例
 * @param {Object} data - 表单数据
 * @returns {Object} {valid: boolean, errors: Array}
 */
function validateAddForm(data) {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
        errors.push({ field: 'name', message: '名称不能为空' });
    }

    if (!data.code || !/^[A-Z]{2,4}\d{3,6}$/.test(data.code)) {
        errors.push({ field: 'code', message: '编码格式不正确' });
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ field: 'email', message: '邮箱格式不正确' });
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}
```

---

# Part4：CRUD 操作

## 18. 新增按钮逻辑

### 18.1 打开新增弹窗

```javascript
function handleAdd() {
    resetAddForm();
    openModal('addModal');

    setTimeout(function() {
        document.getElementById('addForm').querySelector('input, select').focus();
    }, 100);
}

function resetAddForm() {
    const form = document.getElementById('addForm');
    if (form) {
        form.reset();
        clearFormErrors(form);
    }
}
```

### 18.2 保存新增数据

```javascript
function handleSaveAdd() {
    const formData = collectAddFormData();
    const validationResult = validateAddForm(formData);

    if (!validationResult.valid) {
        showFormErrors(validationResult.errors);
        showToast('请检查表单填写是否正确', 'error');
        return;
    }

    showLoading('正在保存...');

    saveAddData(formData)
        .then(function(response) {
            closeModal('addModal');
            refreshDataList();
            showToast('添加成功！', 'success');

            if (response.needApproval) {
                showApprovalNotice(response.approvalId);
            }
        })
        .catch(function(error) {
            showToast('保存失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}
```

---

## 19. 编辑按钮逻辑

### 19.1 打开编辑弹窗并加载数据

```javascript
function handleEdit(id) {
    showLoading('加载数据中...');

    fetchDetailData(id)
        .then(function(data) {
            fillEditForm(data);
            openModal('editModal');
            currentEditId = id;
        })
        .catch(function(error) {
            showToast('加载数据失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}

/**
 * 填充编辑表单
 * @param {Object} data - 数据对象
 */
function fillEditForm(data) {
    Object.keys(data).forEach(function(key) {
        const field = document.getElementById('edit_' + key);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else if (field.tagName === 'SELECT') {
                field.value = data[key];
            } else {
                field.value = data[key];
            }
        }
    });
}
```

### 19.2 保存编辑数据

```javascript
function handleSaveEdit() {
    const formData = collectEditFormData();
    const validationResult = validateEditForm(formData);

    if (!validationResult.valid) {
        showFormErrors(validationResult.errors);
        return;
    }

    if (!confirm('确定要保存修改吗？')) {
        return;
    }

    showLoading('正在保存...');

    saveEditData(currentEditId, formData)
        .then(function() {
            closeModal('editModal');
            refreshDataList();
            showToast('修改成功！', 'success');
        })
        .catch(function(error) {
            showToast('保存失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}
```

---

## 20. 删除按钮逻辑

### 20.1 单条删除

```javascript
function handleDelete(id, name) {
    showConfirmDialog({
        title: '确认删除',
        message: '确定要删除 "' + name + '" 吗？此操作不可恢复。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消',
        onConfirm: function() {
            performDelete(id);
        }
    });
}

function performDelete(id) {
    showLoading('正在删除...');

    deleteData(id)
        .then(function() {
            refreshDataList();
            showToast('删除成功！', 'success');
        })
        .catch(function(error) {
            showToast('删除失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}
```

### 20.2 批量删除

```javascript
function handleBatchDelete() {
    const selectedIds = getSelectedIds();

    if (selectedIds.length === 0) {
        showToast('请先选择要删除的数据', 'warning');
        return;
    }

    showConfirmDialog({
        title: '批量删除确认',
        message: '确定要删除选中的 ' + selectedIds.length + ' 条数据吗？此操作不可恢复。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消',
        onConfirm: function() {
            performBatchDelete(selectedIds);
        }
    });
}

function getSelectedIds() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkboxes).map(function(cb) {
        return cb.dataset.id;
    });
}

function performBatchDelete(ids) {
    showLoading('正在批量删除...');

    batchDeleteData(ids)
        .then(function() {
            refreshDataList();
            showToast('批量删除成功！共删除 ' + ids.length + ' 条数据', 'success');
        })
        .catch(function(error) {
            showToast('批量删除失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}
```

---

## 21. 状态切换按钮逻辑

### 21.1 启用/禁用切换

```javascript
function handleToggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? '启用' : '禁用';

    showConfirmDialog({
        title: '确认' + actionText,
        message: '确定要' + actionText + '该记录吗？',
        type: newStatus === 'active' ? 'success' : 'warning',
        confirmText: actionText,
        cancelText: '取消',
        onConfirm: function() {
            performToggleStatus(id, newStatus);
        }
    });
}

function performToggleStatus(id, newStatus) {
    showLoading('正在处理...');

    updateStatus(id, newStatus)
        .then(function() {
            updateRowStatus(id, newStatus);
            showToast('状态更新成功！', 'success');
        })
        .catch(function(error) {
            showToast('状态更新失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}

/**
 * 更新行内状态显示
 */
function updateRowStatus(id, status) {
    const row = document.querySelector('tr[data-id="' + id + '"]');
    if (row) {
        const statusBadge = row.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.className = 'status-badge status-badge-' + (status === 'active' ? 'success' : 'danger');
            statusBadge.textContent = status === 'active' ? '启用' : '禁用';
        }
        const toggleBtn = row.querySelector('.toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = function() {
                handleToggleStatus(id, status);
            };
        }
    }
}
```

---

# Part5：数据处理

## 22. 导出按钮逻辑

### 22.1 导出数据

```javascript
function handleExport() {
    const searchParams = collectSearchParams();

    showConfirmDialog({
        title: '导出数据',
        message: '确定要导出当前筛选条件下的数据吗？',
        type: 'info',
        confirmText: '导出',
        cancelText: '取消',
        onConfirm: function() {
            performExport(searchParams);
        }
    });
}

function performExport(params) {
    showLoading('正在导出...');

    exportData(params)
        .then(function(response) {
            downloadFile(response.fileUrl, response.fileName);
            showToast('导出成功！', 'success');
        })
        .catch(function(error) {
            showToast('导出失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} fileName - 文件名
 */
function downloadFile(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
```

---

## 23. 审批流程逻辑

### 23.1 提交审批

```javascript
function handleSubmitApproval(id) {
    showConfirmDialog({
        title: '提交审批',
        message: '确定要提交审批吗？提交后将进入审批流程。',
        type: 'info',
        confirmText: '提交',
        cancelText: '取消',
        onConfirm: function() {
            performSubmitApproval(id);
        }
    });
}

function performSubmitApproval(id) {
    showLoading('正在提交...');

    submitApproval(id)
        .then(function(response) {
            refreshDataList();
            showToast('已提交审批，审批单号：' + response.approvalNo, 'success');
        })
        .catch(function(error) {
            showToast('提交失败：' + error.message, 'error');
        })
        .finally(function() {
            hideLoading();
        });
}
```

### 23.2 审批通过/驳回

```javascript
function handleApprove(approvalId) {
    showApprovalDialog({
        title: '审批通过',
        approvalId: approvalId,
        type: 'approve',
        requireComment: false,
        onConfirm: function(comment) {
            performApprove(approvalId, comment);
        }
    });
}

function handleReject(approvalId) {
    showApprovalDialog({
        title: '审批驳回',
        approvalId: approvalId,
        type: 'reject',
        requireComment: true,
        onConfirm: function(comment) {
            performReject(approvalId, comment);
        }
    });
}

/**
 * 显示审批对话框
 * @param {Object} options - 配置选项
 */
function showApprovalDialog(options) {
    const dialog = document.getElementById('approvalDialog');
    dialog.querySelector('.dialog-title').textContent = options.title;
    dialog.querySelector('.approval-comment').required = options.requireComment;

    const confirmBtn = dialog.querySelector('.confirm-btn');
    confirmBtn.onclick = function() {
        const comment = dialog.querySelector('.approval-comment').value;
        if (options.requireComment && !comment.trim()) {
            showToast('请填写审批意见', 'warning');
            return;
        }
        options.onConfirm(comment);
        closeDialog('approvalDialog');
    };

    openDialog('approvalDialog');
}

function performApprove(approvalId, comment) {
    showLoading('正在处理...');
    approveRequest(approvalId, comment)
        .then(function() {
            refreshDataList();
            showToast('审批通过！', 'success');
        })
        .catch(function(error) {
            showToast('审批失败：' + error.message, 'error');
        })
        .finally(hideLoading);
}

function performReject(approvalId, comment) {
    showLoading('正在处理...');
    rejectRequest(approvalId, comment)
        .then(function() {
            refreshDataList();
            showToast('已驳回！', 'warning');
        })
        .catch(function(error) {
            showToast('驳回失败：' + error.message, 'error');
        })
        .finally(hideLoading);
}
```

---

# Part6：列表交互

## 24. 分页组件逻辑

### 24.1 渲染分页

```javascript
/**
 * 渲染分页组件
 * @param {number} total - 总记录数
 * @param {number} current - 当前页码
 * @param {number} size - 每页条数
 */
function renderPagination(total, current, size) {
    const totalPages = Math.ceil(total / size);
    const pagination = document.getElementById('pagination');

    let html = '<div class="pagination-info">共 ' + total + ' 条记录</div>';
    html += '<div class="pagination-buttons">';

    html += '<button class="page-btn" ' + (current === 1 ? 'disabled' : '') + ' onclick="goToPage(' + (current - 1) + ')">';
    html += '<i class="fas fa-chevron-left"></i></button>';

    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(totalPages, current + 2);

    if (startPage > 1) {
        html += '<button class="page-btn" onclick="goToPage(1)">1</button>';
        if (startPage > 2) {
            html += '<span class="page-ellipsis">...</span>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += '<button class="page-btn ' + (i === current ? 'active' : '') + '" onclick="goToPage(' + i + ')">' + i + '</button>';
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += '<span class="page-ellipsis">...</span>';
        }
        html += '<button class="page-btn" onclick="goToPage(' + totalPages + ')">' + totalPages + '</button>';
    }

    html += '<button class="page-btn" ' + (current === totalPages ? 'disabled' : '') + ' onclick="goToPage(' + (current + 1) + ')">';
    html += '<i class="fas fa-chevron-right"></i></button>';

    html += '</div>';

    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    handleSearch();
}
```

---

## 25. 表格选择逻辑

### 25.1 全选/取消全选

```javascript
function handleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(function(cb) {
        cb.checked = checkbox.checked;
        toggleRowSelection(cb);
    });
    updateBatchActions();
}

function toggleRowSelection(checkbox) {
    const row = checkbox.closest('tr');
    if (row) {
        if (checkbox.checked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    }
    updateSelectAllState();
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.row-checkbox');

    if (selectAllCheckbox) {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const someChecked = Array.from(checkboxes).some(cb => cb.checked);

        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
}

function updateBatchActions() {
    const selectedCount = getSelectedIds().length;
    const batchActions = document.querySelector('.batch-actions');

    if (batchActions) {
        batchActions.style.display = selectedCount > 0 ? 'block' : 'none';
        const countEl = batchActions.querySelector('.selected-count');
        if (countEl) {
            countEl.textContent = selectedCount;
        }
    }
}
```

---

## 📊 API 速查表

| 函数分类 | 函数名 | 用途 |
|----------|--------|------|
| **Toast** | `showToast()` | 显示通知消息 |
| **Toast** | `closeToast()` | 关闭指定通知 |
| **骨架屏** | `showSkeleton()` | 显示加载占位 |
| **骨架屏** | `hideSkeleton()` | 隐藏占位恢复内容 |
| **Alert** | `showAlert()` | 显示提示框 |
| **标签页** | `switchTab()` | 切换线型标签 |
| **标签页** | `switchPill()` | 切换卡片型标签 |
| **面包屑** | `updateBreadcrumb()` | 更新导航路径 |
| **对话框** | `showConfirmDialog()` | 显示确认弹窗 |
| **加载状态** | `showLoading()` / `hideLoading()` | 全局加载遮罩 |
| **搜索** | `handleSearch()` / `handleReset()` | 搜索和重置 |
| **新增** | `handleAdd()` / `handleSaveAdd()` | 新增数据流程 |
| **编辑** | `handleEdit()` / `handleSaveEdit()` | 编辑数据流程 |
| **删除** | `handleDelete()` / `handleBatchDelete()` | 单条/批量删除 |
| **状态** | `handleToggleStatus()` | 启用/禁用切换 |
| **导出** | `handleExport()` | 数据导出 |
| **审批** | `handleSubmitApproval()` / `handleApprove()` / `handleReject()` | 完整审批流 |
| **分页** | `renderPagination()` / `goToPage()` | 分页渲染和跳转 |
| **选择** | `handleSelectAll()` / `getSelectedIds()` | 全选和获取选中项 |

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v2.2** | 2026-01-18 | 合并13-button-interaction.md全部业务逻辑，按6大分区重组（框架/UI/表单/CRUD/数据/列表） |
| **v2.1** | 2026-01-18 | 新增Toast/标签页/骨架屏/Alert/面包屑等v2.0组件完整JS实现 |
| **v2.0** | 2026-01-15 | 基础版本，包含主标签切换、Mermaid预览、PRD/测试用例加载等核心功能 |
