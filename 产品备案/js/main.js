/* ========================================
   产品备案模块 JavaScript
   ======================================== */

/* 数据配置 */
const DATA_CONFIG = {
    pageId: 'product_filing',
    dataFile: '产品备案/data/product_filing-data.json',
    apiBase: 'http://localhost:3100/api/data',
    version: '1.0.0'
};

/* 页面状态 */
let products = [];
let pageConfig = null;
let prdLoaded = false;
let testCasesLoaded = false;
let currentMainTab = 'prototype';

/* 切换主Tab */
function switchMainTab(tabName) {
    currentMainTab = tabName;
    
    document.querySelectorAll('.tabs .tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    document.getElementById('tab-' + tabName).classList.add('active');
    
    document.getElementById('main-prototype').style.display = tabName === 'prototype' ? 'block' : 'none';
    document.getElementById('main-prd').style.display = tabName === 'prd' ? 'block' : 'none';
    document.getElementById('main-testcases').style.display = tabName === 'testcases' ? 'block' : 'none';
    
    if (tabName === 'prd' && !prdLoaded) {
        loadPRD();
    }
    if (tabName === 'testcases' && !testCasesLoaded) {
        loadTestCases();
    }
}

/* 默认产品数据 */
function getDefaultProducts() {
    return [
        {
            sku: 'AAAAAA',
            client: 'DEMO',
            code: 'PROD-001',
            type: 'Electronics',
            nameZh: '测试产品1',
            nameEn: 'Test Product 1',
            value: 100,
            currency: 'EUR',
            size: '10 x 10 x 10',
            weight: 500,
            forbidden: '标准',
            status: 'Active'
        },
        {
            sku: 'BDBDBD',
            client: 'VIP',
            code: 'PROD-002',
            type: 'Clothing',
            nameZh: '测试产品2',
            nameEn: 'Test Product 2',
            value: 50,
            currency: 'EUR',
            size: '20 x 15 x 5',
            weight: 200,
            forbidden: '标准',
            status: 'Active'
        },
        {
            sku: 'CDCDCD',
            client: 'DEMO',
            code: 'PROD-003',
            type: 'Home',
            nameZh: '测试产品3',
            nameEn: 'Test Product 3',
            value: 200,
            currency: 'EUR',
            size: '30 x 30 x 20',
            weight: 1000,
            forbidden: '异型',
            status: 'Inactive'
        }
    ];
}

/* 初始化页面 */
document.addEventListener('DOMContentLoaded', async function() {
    APIDataManager.init(DATA_CONFIG);
    StateManager.init(DATA_CONFIG.pageId);
    loadConfigFromStorage();
    await loadProducts();
    renderProductTable();
});

/* 加载产品数据 */
async function loadProducts() {
    const result = await APIDataManager.loadData();
    if (result.success && result.data && result.data.length > 0) {
        products = result.data;
    } else {
        products = getDefaultProducts();
        await APIDataManager.saveData(products);
    }
}

/* 保存产品数据 */
async function saveProducts() {
    await APIDataManager.saveData(products);
}

/* 获取列配置 */
function getColumnConfig() {
    if (pageConfig && pageConfig.columns) {
        return pageConfig.columns;
    }
    return getDefaultConfig().columns;
}

/* 渲染产品表格 */
function renderProductTable() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    
    const columns = getColumnConfig().filter(function(col) { return col.visible !== false; });
    
    tbody.innerHTML = '';
    
    products.forEach(function(product) {
        const tr = document.createElement('tr');
        tr.className = 'table-hover-row';
        
        let cells = '<td class="py-3 px-4"><input type="checkbox" class="row-checkbox" data-sku="' + product.sku + '"></td>';
        
        columns.forEach(function(col) {
            if (col.field === 'actions') {
                cells += '<td class="py-3 px-4"><div class="flex gap-2">' +
                    '<a href="edit.html?sku=' + product.sku + '" class="table-btn table-btn-primary"><i class="fa fa-edit"></i> 编辑</a>' +
                    '<button class="table-btn table-btn-danger" onclick="deleteProduct(\'' + product.sku + '\')"><i class="fa fa-trash"></i> 删除</button>' +
                '</div></td>';
            } else if (col.field === 'status') {
                cells += '<td class="py-3 px-4"><span class="status-badge ' + (product.status === 'Active' ? 'status-active' : 'status-inactive') + '">' +
                    (product.status === 'Active' ? '已发布' : '未发布') + '</span></td>';
            } else if (col.field === 'value') {
                cells += '<td class="py-3 px-4 text-gray-600">' + (product.value || '-') + ' ' + (product.currency || '') + '</td>';
            } else {
                const value = product[col.field];
                cells += '<td class="py-3 px-4 text-gray-600">' + (value || '-') + '</td>';
            }
        });
        
        tr.innerHTML = cells;
        tbody.appendChild(tr);
    });
    
    updateTotalCount();
}

/* 更新总数 */
function updateTotalCount() {
    const countEl = document.getElementById('totalCount');
    if (countEl) {
        countEl.textContent = products.length;
    }
}

/* 筛选数据 */
function filterData() {
    const columns = getColumnConfig();
    const filterConfigs = pageConfig && pageConfig.filters ? pageConfig.filters : getDefaultConfig().filters;
    
    const filtered = products.filter(function(p) {
        let match = true;
        filterConfigs.forEach(function(filter) {
            const el = document.getElementById('filter' + filter.field.charAt(0).toUpperCase() + filter.field.slice(1));
            if (!el) return;
            
            const value = el.value.toLowerCase();
            if (!value || value === '全部') return;
            
            if (filter.type === 'select') {
                if (p[filter.field] !== value) match = false;
            } else {
                const fieldValue = (p[filter.field] || '').toLowerCase();
                if (!fieldValue.includes(value)) match = false;
            }
        });
        return match;
    });
    
    renderFilteredTable(filtered);
}

/* 渲染筛选后的表格 */
function renderFilteredTable(filteredProducts) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    
    const columns = getColumnConfig().filter(function(col) { return col.visible !== false; });
    
    tbody.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + (columns.length + 1) + '" class="py-8 text-center text-gray-500"><i class="fa fa-inbox text-4xl mb-2"></i><p>暂无匹配的数据</p></td></tr>';
        document.getElementById('totalCount').textContent = '0';
        return;
    }
    
    filteredProducts.forEach(function(product) {
        const tr = document.createElement('tr');
        tr.className = 'table-hover-row';
        
        let cells = '<td class="py-3 px-4"><input type="checkbox" class="row-checkbox" data-sku="' + product.sku + '"></td>';
        
        columns.forEach(function(col) {
            if (col.field === 'actions') {
                cells += '<td class="py-3 px-4"><div class="flex gap-2">' +
                    '<a href="edit.html?sku=' + product.sku + '" class="table-btn table-btn-primary"><i class="fa fa-edit"></i> 编辑</a>' +
                    '<button class="table-btn table-btn-danger" onclick="deleteProduct(\'' + product.sku + '\')"><i class="fa fa-trash"></i> 删除</button>' +
                '</div></td>';
            } else if (col.field === 'status') {
                cells += '<td class="py-3 px-4"><span class="status-badge ' + (product.status === 'Active' ? 'status-active' : 'status-inactive') + '">' +
                    (product.status === 'Active' ? '已发布' : '未发布') + '</span></td>';
            } else if (col.field === 'value') {
                cells += '<td class="py-3 px-4 text-gray-600">' + (product.value || '-') + ' ' + (product.currency || '') + '</td>';
            } else {
                const value = product[col.field];
                cells += '<td class="py-3 px-4 text-gray-600">' + (value || '-') + '</td>';
            }
        });
        
        tr.innerHTML = cells;
        tbody.appendChild(tr);
    });
    
    document.getElementById('totalCount').textContent = filteredProducts.length;
}

/* 重置筛选 */
function resetFilters() {
    document.getElementById('filterSku').value = '';
    document.getElementById('filterClient').value = '';
    document.getElementById('filterName').value = '';
    document.getElementById('filterCode').value = '';
    renderProductTable();
}

/* 全选/取消全选 */
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(function(cb) {
        cb.checked = selectAll.checked;
    });
}

/* 删除产品 */
async function deleteProduct(sku) {
    if (!confirm('确定要删除该产品吗？')) return;
    
    const product = products.find(function(p) { return p.sku === sku; });
    if (!product) {
        showToast('产品不存在', 'error');
        return;
    }
    
    const result = await APIDataManager.deleteRow(product.id);
    if (result) {
        products = products.filter(function(p) { return p.sku !== sku; });
        renderProductTable();
        showToast('删除成功', 'success');
    } else {
        showToast('删除失败', 'error');
    }
}

/* 批量导入 */
function batchImport() {
    showToast('批量导入功能开发中...', 'info');
}

/* 批量编辑尺寸 */
function batchEditSize() {
    showToast('批量编辑尺寸功能开发中...', 'info');
}

/* 配置加载 */
function loadConfigFromStorage() {
    const saved = localStorage.getItem('config_' + DATA_CONFIG.pageId);
    if (saved) {
        try {
            pageConfig = JSON.parse(saved);
            if (pageConfig.pageTitle) {
                document.title = pageConfig.pageTitle + ' - ELSA';
            }
            applyFiltersConfig(pageConfig.filters || []);
            applyColumnsConfig(pageConfig.columns || []);
            applyButtonsConfig(pageConfig.buttons || []);
        } catch (e) {
            console.error('加载配置失败:', e);
            pageConfig = null;
        }
    }
}

/* 获取默认配置 */
function getDefaultConfig() {
    return {
        filters: [
            { id: 1, label: 'SKU', field: 'sku', type: 'text', placeholder: '请输入SKU' },
            { id: 2, label: '客户代码', field: 'client', type: 'select', options: '全部,DEMO,VIP' },
            { id: 3, label: '产品名称', field: 'name', type: 'text', placeholder: '中文名/英文名' },
            { id: 4, label: '自定义编码', field: 'code', type: 'text', placeholder: '请输入编码' }
        ],
        columns: [
            { id: 1, label: 'SKU', field: 'sku', width: '120', align: 'left', visible: true },
            { id: 2, label: '客户代码', field: 'client', width: '100', align: 'left', visible: true },
            { id: 3, label: '自定义编码', field: 'code', width: '120', align: 'left', visible: true },
            { id: 4, label: '产品类型', field: 'type', width: '100', align: 'left', visible: true },
            { id: 5, label: '中文名', field: 'nameZh', width: '150', align: 'left', visible: true },
            { id: 6, label: '英文名', field: 'nameEn', width: '150', align: 'left', visible: true },
            { id: 7, label: '申报价值', field: 'value', width: '100', align: 'left', visible: true },
            { id: 8, label: '尺寸(cm)', field: 'size', width: '120', align: 'left', visible: true },
            { id: 9, label: '重量(g)', field: 'weight', width: '100', align: 'left', visible: true },
            { id: 10, label: '不规则标记', field: 'forbidden', width: '100', align: 'left', visible: true },
            { id: 11, label: '状态', field: 'status', width: '80', align: 'center', visible: true },
            { id: 12, label: '操作', field: 'actions', width: '150', align: 'center', visible: true }
        ],
        buttons: [
            { id: 1, label: '新增', icon: 'fa-plus', type: 'primary', action: 'add' },
            { id: 2, label: '批量导入', icon: 'fa-upload', type: 'secondary', action: 'batchImport' },
            { id: 3, label: '批量编辑尺寸', icon: 'fa-edit', type: 'secondary', action: 'batchEditSize' }
        ]
    };
}

/* 应用筛选器配置 */
function applyFiltersConfig(filters) {
    const container = document.getElementById('filterContainer');
    if (!container || filters.length === 0) return;
    
    const filterHtml = filters.map(function(filter) {
        if (filter.type === 'select') {
            const options = (filter.options || '').split(',').map(function(opt) {
                return '<option value="' + opt + '">' + opt + '</option>';
            }).join('');
            return '<div class="flex items-center w-full sm:w-auto">' +
                '<label class="text-xs text-neutral-600 mr-2">' + filter.label + '</label>' +
                '<select id="filter' + filter.field.charAt(0).toUpperCase() + filter.field.slice(1) + '" class="w-full sm:w-48 pl-3 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">' + options + '</select>' +
            '</div>';
        } else {
            return '<div class="flex items-center w-full sm:w-auto">' +
                '<label class="text-xs text-neutral-600 mr-2">' + filter.label + '</label>' +
                '<input type="text" id="filter' + filter.field.charAt(0).toUpperCase() + filter.field.slice(1) + '" placeholder="' + (filter.placeholder || '') + '" class="w-full sm:w-48 pl-3 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">' +
            '</div>';
        }
    }).join('');
    
    container.innerHTML = filterHtml + 
        '<div class="flex gap-2 w-full sm:w-auto sm:ml-auto">' +
            '<button class="erp-btn erp-btn-secondary" onclick="resetFilters()"><i class="fa fa-refresh mr-1.5"></i> 重置</button>' +
            '<button class="erp-btn erp-btn-primary" onclick="filterData()"><i class="fa fa-search mr-1.5"></i> 搜索</button>' +
        '</div>';
}

/* 应用列配置 */
function applyColumnsConfig(columns) {
    const headerRow = document.getElementById('tableHeaderRow');
    if (!headerRow || columns.length === 0) return;
    
    const headerHtml = columns.filter(function(col) { return col.visible !== false; }).map(function(col) {
        return '<th class="py-3 px-4 text-left font-medium text-gray-700" style="width:' + col.width + 'px;text-align:' + col.align + '">' + col.label + '</th>';
    }).join('');
    
    headerRow.innerHTML = '<th class="py-3 px-4 text-left font-medium text-gray-700"><input type="checkbox" id="selectAll" onchange="toggleSelectAll()"></th>' + headerHtml;
}

/* 应用按钮配置 */
function applyButtonsConfig(buttons) {
    const container = document.getElementById('buttonContainer');
    if (!container || buttons.length === 0) return;
    
    const buttonHtml = buttons.map(function(btn) {
        const btnClass = btn.type === 'primary' ? 'erp-btn-primary' : 'erp-btn-secondary';
        if (btn.action === 'add') {
            return '<a href="add.html" class="erp-btn ' + btnClass + '"><i class="fa ' + btn.icon + ' mr-1.5"></i> ' + btn.label + '</a>';
        } else {
            return '<button class="erp-btn ' + btnClass + '" onclick="' + btn.action + '()"><i class="fa ' + btn.icon + ' mr-1.5"></i> ' + btn.label + '</button>';
        }
    }).join('');
    
    container.innerHTML = buttonHtml;
}

/* 逻辑说明折叠 */
function togglePrdLogic(pageId) {
    const content = document.getElementById(pageId + '-logic-content');
    const icon = document.getElementById(pageId + '-logic-icon');
    if (content && icon) {
        content.classList.toggle('expanded');
        icon.classList.toggle('rotated');
    }
}

/* Mermaid 模态框 */
function openMermaidModal(container) {
    const mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    
    const modal = document.getElementById('mermaidModal');
    const content = document.getElementById('mermaidModalContent');
    
    if (modal && content) {
        content.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
        modal.classList.add('active');
        if (typeof mermaid !== 'undefined') {
            mermaid.init(undefined, content.querySelector('.mermaid'));
        }
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('mermaidModal');
    if (modal) modal.classList.remove('active');
}

/* PRD 加载 */
function loadPRD() {
    const prdContent = document.getElementById('prd-content');
    if (!prdContent) return;
    
    prdContent.innerHTML = '<div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';
    
    fetch('prd.md')
        .then(function(response) { return response.text(); })
        .then(function(text) {
            if (typeof marked !== 'undefined') {
                prdContent.innerHTML = marked.parse(text);
                generateTOC();
            } else {
                prdContent.innerHTML = '<pre>' + text + '</pre>';
            }
            prdLoaded = true;
        })
        .catch(function(err) {
            prdContent.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无 PRD 文档</p></div>';
        });
}

/* 测试用例加载 */
function loadTestCases() {
    const container = document.getElementById('testcases-content');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载中...</p></div>';
    
    fetch('test-cases.md')
        .then(function(response) { return response.text(); })
        .then(function(text) {
            if (typeof marked !== 'undefined') {
                container.innerHTML = marked.parse(text);
            } else {
                container.innerHTML = '<pre>' + text + '</pre>';
            }
            testCasesLoaded = true;
        })
        .catch(function(err) {
            container.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无测试用例</p></div>';
        });
}

/* 目录生成 */
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
