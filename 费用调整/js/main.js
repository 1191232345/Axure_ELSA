/**
 * 费用调整 - 未出账订单页面交互逻辑
 * 基于TOB设计模板规范
 */

document.addEventListener('DOMContentLoaded', function() {
    initPage();
});

function initPage() {
    initAPIDataManager();
    bindSearchButton();
    bindResetButton();
    bindBatchRecalculateButton();
    bindRecalculateDetailButton();
    bindImportRecalculateButton();
    bindTabButtons();
    bindSelectAllCheckbox();
    bindModalEvents();
    initToastContainer();
    loadInitialData();
}

var prdLoaded = false;
var testCasesLoaded = false;
var currentPage = 1;
var pageSize = 10;
var totalCount = 0;
var selectedRows = [];
var currentTabType = 'outbound';
var recalculateTableData = [];

var OUTBOUND_TABLE_HEADERS = [
    { key: 'operateTime', label: '操作时间' },
    { key: 'operator', label: '操作人' },
    { key: 'warehouse', label: '仓库代码' },
    { key: 'customerCode', label: '客户代码' },
    { key: 'orderNo', label: '订单号' },
    { key: 'logisticsProduct', label: '物流产品' },
    { key: 'chargeType', label: '计费类型' },
    { key: 'originalAmount', label: '原金额' },
    { key: 'amount', label: '重计金额' },
    { key: 'status', label: '状态' },
    { key: 'failReason', label: '失败原因' }
];

var STORAGE_TABLE_HEADERS = [
    { key: 'operateTime', label: '操作时间' },
    { key: 'operator', label: '操作人' },
    { key: 'warehouse', label: '仓库代码' },
    { key: 'customerCode', label: '客户代码' },
    { key: 'orderNo', label: '订单号' },
    { key: 'chargeType', label: '计费类型' },
    { key: 'originalAmount', label: '原金额' },
    { key: 'amount', label: '重计金额' },
    { key: 'status', label: '状态' },
    { key: 'failReason', label: '失败原因' }
];

var INBOUND_TABLE_HEADERS = [
    { key: 'operateTime', label: '操作时间' },
    { key: 'operator', label: '操作人' },
    { key: 'warehouse', label: '仓库代码' },
    { key: 'customerCode', label: '客户代码' },
    { key: 'orderNo', label: '订单号' },
    { key: 'chargeType', label: '计费类型' },
    { key: 'originalAmount', label: '原金额' },
    { key: 'amount', label: '重计金额' },
    { key: 'status', label: '状态' },
    { key: 'failReason', label: '失败原因' }
];

function initAPIDataManager() {
    if (typeof APIDataManager !== 'undefined') {
        APIDataManager.init({
            pageId: DATA_CONFIG.pageId,
            dataFile: DATA_CONFIG.dataFile
        });
    }
}

function loadInitialData() {
    showLoading('加载数据中...');
    
    setTimeout(function() {
        loadOrderData()
            .then(function(result) {
                if (result.success && result.data.length > 0) {
                    renderOrderTable(result.data);
                    updatePagination(result.data.length);
                } else {
                    showEmptyState();
                }
                hideLoading();
            })
            .catch(function(error) {
                console.error('数据加载失败:', error);
                showToast('数据加载失败，请刷新页面重试', 'error');
                hideLoading();
            });
    }, 500);
}

function loadOrderData() {
    if (typeof APIDataManager !== 'undefined') {
        return APIDataManager.loadData();
    }
    
    return new Promise(function(resolve) {
        var mockData = generateMockData(15);
        resolve({ success: true, data: mockData });
    });
}

function generateMockData(count) {
    var data = [];
    var warehouses = ['DE001', 'DE002', 'DE003'];
    var customers = ['DEMO - demo', 'TEST - test', 'PROD - prod'];
    var channels = ['FEDEX_MPS', 'FEDEX_HOME_GROUND', 'ZYBQ'];
    
    var billTypeLabel;
    if (currentTabType === 'storage') {
        billTypeLabel = '仓储费';
    } else if (currentTabType === 'inbound') {
        billTypeLabel = '入库费';
    } else {
        billTypeLabel = '出库费';
    }
    
    for (var i = 1; i <= count; i++) {
        var logisticsProduct = '';
        if (currentTabType === 'outbound') {
            logisticsProduct = channels[Math.floor(Math.random() * channels.length)];
        }
        
        data.push({
            id: i,
            orderTime: '2024-01-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') + ' 10:30:00',
            billType: billTypeLabel,
            warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
            customerCode: customers[Math.floor(Math.random() * customers.length)],
            orderNo: 'ORD' + String(Date.now()).slice(-8) + String(i).padStart(4, '0'),
            logisticsProduct: logisticsProduct,
            amount: (Math.random() * 10000 + 500).toFixed(2),
            currency: 'USD'
        });
    }
    
    return data;
}

function handleSearch() {
    var searchParams = collectSearchParams();
    
    if (!validateSearchParams(searchParams)) {
        showToast('请输入有效的搜索条件', 'warning');
        return;
    }
    
    showLoading('搜索中...');
    currentPage = 1;
    
    setTimeout(function() {
        loadOrderData()
            .then(function(result) {
                var filteredData = filterData(result.data, searchParams);
                renderOrderTable(filteredData);
                updatePagination(filteredData.length);
                
                if (filteredData.length === 0) {
                    showToast('未找到符合条件的数据', 'info');
                } else {
                    showToast('搜索完成，共 ' + filteredData.length + ' 条结果', 'success');
                }
                
                hideLoading();
            })
            .catch(function(error) {
                console.error('搜索失败:', error);
                showToast('搜索失败：' + error.message, 'error');
                hideLoading();
            });
    }, 500);
}

function collectSearchParams() {
    return {
        orderNo: document.querySelector('.filter-combo-input') ? document.querySelector('.filter-combo-input').value.trim() : '',
        customerCode: document.querySelector('select.form-input:nth-of-type(1)') ? document.querySelector('select.form-input:nth-of-type(1)').value : '',
        warehouse: document.querySelector('select.form-input:nth-of-type(2)') ? document.querySelector('select.form-input:nth-of-type(2)').value : '',
        channel: document.querySelector('select.form-input:nth-of-type(3)') ? document.querySelector('select.form-input:nth-of-type(3)').value : ''
    };
}

function validateSearchParams(params) {
    if (params.orderNo && params.orderNo.length < 2) {
        showToast('订单号至少2个字符', 'warning');
        return false;
    }
    return true;
}

function filterData(data, params) {
    return data.filter(function(row) {
        if (params.orderNo && !row.orderNo.toLowerCase().includes(params.orderNo.toLowerCase())) {
            return false;
        }
        if (params.customerCode && params.customerCode !== 'DEMO - demo' && row.customerCode !== params.customerCode) {
            return false;
        }
        if (params.warehouse && params.warehouse !== '请选择仓库' && row.warehouse !== params.warehouse) {
            return false;
        }
        if (params.channel && params.channel !== '请选择配送渠道' && row.logisticsProduct !== params.channel) {
            return false;
        }
        return true;
    });
}

function handleReset() {
    document.querySelectorAll('.filter-combo-input, .form-input[type="text"], .form-input[type="date"]').forEach(function(input) {
        input.value = '';
    });
    
    document.querySelectorAll('.form-input select, .filter-combo-select').forEach(function(select) {
        select.selectedIndex = 0;
    });
    
    currentPage = 1;
    loadInitialData();
    showToast('搜索条件已重置', 'info');
}

function handleBatchRecalculate() {
    var checkedBoxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]:checked');
    
    if (checkedBoxes.length === 0) {
        showToast('请先选择要重计的订单', 'warning');
        return;
    }
    
    var count = checkedBoxes.length + 45000;
    
    if (count > 50000) {
        showLimitExceededModal(count);
    } else {
        confirmBatchRecalculate(checkedBoxes.length);
    }
}

function confirmBatchRecalculate(selectedCount) {
    showLoading('正在提交批量重计任务...');
    
    setTimeout(function() {
        hideLoading();
        showSuccessModal(selectedCount);
        
        if (typeof APIDataManager !== 'undefined') {
            console.log('批量重计任务已提交，处理数量：' + selectedCount);
        }
    }, 1500);
}

function openRecalculateModal(chargeType) {
    var modal = document.getElementById('recalculateModal');
    var modalChargeType = document.getElementById('modalChargeType');
    
    if (modal && modalChargeType) {
        var tabTitle;
        if (currentTabType === 'outbound') {
            tabTitle = '出库单';
        } else if (currentTabType === 'storage') {
            tabTitle = '仓储费';
        } else {
            tabTitle = '入库费';
        }
        modalChargeType.textContent = tabTitle;
        modal.classList.remove('hidden');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        var showLogisticsProduct = currentTabType === 'outbound';
        var logisticsProductFilters = document.querySelectorAll('.logistics-product-filter');
        logisticsProductFilters.forEach(function(filter) {
            filter.style.display = showLogisticsProduct ? '' : 'none';
        });
        
        renderTableHeaders(currentTabType);
        loadRecalculateDetailData();
    }
}

function closeRecalculateModal() {
    var modal = document.getElementById('recalculateModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function renderTableHeaders(tabType) {
    var thead = document.getElementById('recalculateTableHead');
    if (!thead) return;
    
    var headers;
    if (tabType === 'storage') {
        headers = STORAGE_TABLE_HEADERS;
    } else if (tabType === 'inbound') {
        headers = INBOUND_TABLE_HEADERS;
    } else {
        headers = OUTBOUND_TABLE_HEADERS;
    }
    
    var html = '<tr class="bg-gray-50 text-left">';
    headers.forEach(function(header) {
        html += '<th class="px-4 py-3 font-medium text-gray-500">' + header.label + '</th>';
    });
    html += '</tr>';
    
    thead.innerHTML = html;
}

function loadRecalculateDetailData() {
    showLoading('加载重计明细...');
    
    setTimeout(function() {
        var mockDetailData;
        
        if (currentTabType === 'storage') {
            mockDetailData = generateMockStorageRecalculateData(20);
        } else if (currentTabType === 'inbound') {
            mockDetailData = generateMockInboundRecalculateData(20);
        } else {
            mockDetailData = generateMockOutboundRecalculateData(20);
        }
        
        recalculateTableData = mockDetailData;
        currentPage = 1;
        renderRecalculateTable(mockDetailData, currentTabType);
        updateRecalculatePagination(mockDetailData.length);
        hideLoading();
    }, 800);
}

function generateMockOutboundRecalculateData(count) {
    var data = [];
    var statuses = ['success', 'processing', 'failed'];
    var warehouses = ['DE001', 'DE002', 'DE003'];
    var customers = ['DEMO', 'TEST', 'PROD'];
    var products = ['FEDEX_MPS', 'FEDEX_HOME_GROUND', 'ZYBQ', 'UPS_EXPRESS'];
    var types = ['出库费'];
    
    for (var i = 1; i <= count; i++) {
        var status = statuses[Math.floor(Math.random() * statuses.length)];
        var originalAmount = (Math.random() * 2000 + 200).toFixed(2);
        var recalculatedAmount = status === 'failed' ? '-' : (parseFloat(originalAmount) * (0.85 + Math.random() * 0.3)).toFixed(2);
        
        data.push({
            id: i,
            operateTime: '2024-01-15 14:' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
            operator: '管理员',
            warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
            customerCode: customers[Math.floor(Math.random() * customers.length)],
            orderNo: 'OUT-' + String(Date.now()).slice(-6) + String(i).padStart(3, '0'),
            logisticsProduct: products[Math.floor(Math.random() * products.length)],
            chargeType: types[Math.floor(Math.random() * types.length)],
            originalAmount: originalAmount,
            amount: recalculatedAmount,
            status: status,
            failReason: status === 'failed' ? '出库单状态异常或物流产品配置缺失' : '-'
        });
    }
    
    return data;
}

function generateMockStorageRecalculateData(count) {
    var data = [];
    var statuses = ['success', 'processing', 'failed'];
    var warehouses = ['WH001', 'WH002', 'WH003'];
    var customers = ['STORAGE_A', 'STORAGE_B', 'STORAGE_C'];
    var storageTypes = ['仓储费'];
    
    for (var i = 1; i <= count; i++) {
        var status = statuses[Math.floor(Math.random() * statuses.length)];
        var originalAmount = (Math.random() * 5000 + 500).toFixed(2);
        var recalculatedAmount = status === 'failed' ? '-' : (parseFloat(originalAmount) * (0.9 + Math.random() * 0.2)).toFixed(2);
        
        data.push({
            id: i,
            operateTime: '2024-01-16 09:' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
            operator: '仓管员',
            warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
            customerCode: customers[Math.floor(Math.random() * customers.length)],
            orderNo: 'STR-' + String(Date.now()).slice(-6) + String(i).padStart(3, '0'),
            chargeType: storageTypes[Math.floor(Math.random() * storageTypes.length)],
            originalAmount: originalAmount,
            amount: recalculatedAmount,
            status: status,
            failReason: status === 'failed' ? '库存数据不一致或计费规则未配置' : '-'
        });
    }
    
    return data;
}

function generateMockInboundRecalculateData(count) {
    var data = [];
    var statuses = ['success', 'processing', 'failed'];
    var warehouses = ['WH001', 'WH002', 'WH003'];
    var customers = ['INBOUND_A', 'INBOUND_B', 'INBOUND_C'];
    var inboundTypes = ['入库费'];
    
    for (var i = 1; i <= count; i++) {
        var status = statuses[Math.floor(Math.random() * statuses.length)];
        var originalAmount = (Math.random() * 3000 + 300).toFixed(2);
        var recalculatedAmount = status === 'failed' ? '-' : (parseFloat(originalAmount) * (0.9 + Math.random() * 0.2)).toFixed(2);
        
        data.push({
            id: i,
            operateTime: '2024-01-16 09:' + String(Math.floor(Math.random() * 60)).padStart(2, '0') + ':' + String(Math.floor(Math.random() * 60)).padStart(2, '0'),
            operator: '入库员',
            warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
            customerCode: customers[Math.floor(Math.random() * customers.length)],
            orderNo: 'INB-' + String(Date.now()).slice(-6) + String(i).padStart(3, '0'),
            chargeType: inboundTypes[Math.floor(Math.random() * inboundTypes.length)],
            originalAmount: originalAmount,
            amount: recalculatedAmount,
            status: status,
            failReason: status === 'failed' ? '入库数据异常或计费规则未配置' : '-'
        });
    }
    
    return data;
}

function renderOrderTable(data) {
    var tbody = document.getElementById('orderTableBody');
    if (!tbody) return;
    
    var showLogisticsProduct = currentTabType === 'outbound';
    var logisticsProductCols = document.querySelectorAll('.logistics-product-col');
    logisticsProductCols.forEach(function(col) {
        col.style.display = showLogisticsProduct ? '' : 'none';
    });
    
    var colCount = showLogisticsProduct ? 10 : 9;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr class="border-t border-gray-100"><td colspan="' + colCount + '" class="px-4 py-12 text-center text-gray-400"><i class="fa fa-inbox text-4xl mb-2 block"></i><p>暂无数据</p></td></tr>';
        return;
    }
    
    var html = '';
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, data.length);
    
    for (var i = startIndex; i < endIndex; i++) {
        var row = data[i];
        html += '<tr class="border-t border-gray-100 table-hover-row">';
        html += '<td class="px-4 py-3"><input type="checkbox" class="row-checkbox rounded text-primary focus:ring-primary" data-id="' + row.id + '"></td>';
        html += '<td class="px-4 py-3 text-sm">' + row.orderTime + '</td>';
        html += '<td class="px-4 py-3 text-sm">' + row.billType + '</td>';
        html += '<td class="px-4 py-3 text-sm">' + row.warehouse + '</td>';
        html += '<td class="px-4 py-3 text-sm">' + row.customerCode + '</td>';
        html += '<td class="px-4 py-3 text-sm font-medium text-primary">' + row.orderNo + '</td>';
        if (showLogisticsProduct) {
            html += '<td class="px-4 py-3 text-sm">' + row.logisticsProduct + '</td>';
        }
        html += '<td class="px-4 py-3 text-sm font-semibold">' + parseFloat(row.amount).toLocaleString('en-US', {minimumFractionDigits: 2}) + '</td>';
        html += '<td class="px-4 py-3 text-sm">' + row.currency + '</td>';
        html += '<td class="px-4 py-3 text-sm"><button class="table-action-btn" onclick="viewOrderDetail(\'' + row.orderNo + '\')">查看</button></td>';
        html += '</tr>';
    }
    
    tbody.innerHTML = html;
    bindRowCheckboxEvents();
}

function renderRecalculateTable(data, tabType) {
    var tbody = document.getElementById('recalculateTableBody');
    if (!tbody) return;
    
    var headers;
    if (tabType === 'storage') {
        headers = STORAGE_TABLE_HEADERS;
    } else if (tabType === 'inbound') {
        headers = INBOUND_TABLE_HEADERS;
    } else {
        headers = OUTBOUND_TABLE_HEADERS;
    }
    var colCount = headers.length;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr class="border-t border-gray-100"><td colspan="' + colCount + '" class="px-4 py-12 text-center text-gray-400"><i class="fa fa-inbox text-4xl mb-2 block"></i><p>暂无数据</p></td></tr>';
        return;
    }
    
    var html = '';
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize, data.length);
    
    for (var i = startIndex; i < endIndex; i++) {
        var row = data[i];
        var statusClass = '';
        var statusText = '';
        
        switch(row.status) {
            case 'success':
                statusClass = 'status-badge-success';
                statusText = '成功';
                break;
            case 'processing':
                statusClass = 'status-badge-warning';
                statusText = '重计中';
                break;
            case 'failed':
                statusClass = 'status-badge-error';
                statusText = '失败';
                break;
            default:
                statusClass = 'status-badge-default';
                statusText = row.status;
        }
        
        html += '<tr class="border-t border-gray-100 table-hover-row">';
        
        headers.forEach(function(header) {
            var key = header.key;
            var value = row[key];
            var cellClass = 'px-4 py-3 text-sm';
            
            switch(key) {
                case 'operateTime':
                    html += '<td class="' + cellClass + '">' + value + '</td>';
                    break;
                case 'operator':
                    html += '<td class="' + cellClass + '">' + value + '</td>';
                    break;
                case 'warehouse':
                    html += '<td class="' + cellClass + '">' + value + '</td>';
                    break;
                case 'customerCode':
                    html += '<td class="' + cellClass + '">' + value + '</td>';
                    break;
                case 'orderNo':
                    html += '<td class="' + cellClass + ' font-medium text-primary">' + value + '</td>';
                    break;
                case 'logisticsProduct':
                    html += '<td class="' + cellClass + '">' + value + '</td>';
                    break;
                case 'chargeType':
                    html += '<td class="' + cellClass + '">' + value + '</td>';
                    break;
                case 'originalAmount':
                    html += '<td class="' + cellClass + ' font-medium">$' + parseFloat(value).toLocaleString('en-US', {minimumFractionDigits: 2}) + '</td>';
                    break;
                case 'amount':
                    var amountClass = '';
                    if (value !== '-' && parseFloat(row.originalAmount) !== parseFloat(value)) {
                        amountClass = parseFloat(row.originalAmount) > parseFloat(value) ? 'text-green-600' : 'text-red-600';
                    }
                    html += '<td class="' + cellClass + ' font-semibold ' + amountClass + '">' + (value === '-' ? '-' : '$' + parseFloat(value).toLocaleString('en-US', {minimumFractionDigits: 2})) + '</td>';
                    break;
                case 'status':
                    html += '<td class="' + cellClass + '"><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>';
                    break;
                case 'failReason':
                    html += '<td class="' + cellClass + ' text-red-600">' + value + '</td>';
                    break;
                default:
                    html += '<td class="' + cellClass + '">' + (value || '-') + '</td>';
            }
        });
        
        html += '</tr>';
    }
    
    tbody.innerHTML = html;
}

function updatePagination(total) {
    totalCount = total;
    var totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) {
        totalCountEl.textContent = total;
    }
}

function updateRecalculatePagination(total) {
    var totalCountEl = document.getElementById('recalculateTotalCount');
    if (totalCountEl) {
        totalCountEl.textContent = total;
    }
}

function showEmptyState() {
    var tbody = document.getElementById('orderTableBody');
    if (tbody) {
        tbody.innerHTML = '<tr class="border-t border-gray-100"><td colspan="10" class="px-4 py-12 text-center text-gray-400"><i class="fa fa-inbox text-4xl mb-2 block"></i><p>暂无数据</p></td></tr>';
    }
    updatePagination(0);
}

function viewOrderDetail(orderNo) {
    showToast('查看订单详情：' + orderNo, 'info');
    console.log('查看订单详情：', orderNo);
}

function showLimitExceededModal(count) {
    var modal = document.getElementById('limitExceededModal');
    var exceededCountEl = document.getElementById('exceededCount');
    
    if (modal && exceededCountEl) {
        exceededCountEl.textContent = count.toLocaleString();
        modal.classList.remove('hidden');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeLimitExceededModal() {
    var modal = document.getElementById('limitExceededModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function showSuccessModal(processedCount) {
    var modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeSuccessModal() {
    var modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function bindSearchButton() {
    var searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSearch();
        });
    }
}

function bindResetButton() {
    var resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleReset();
        });
    }
}

function bindBatchRecalculateButton() {
    var batchRecalculateBtn = document.getElementById('batchRecalculateBtn');
    if (batchRecalculateBtn) {
        batchRecalculateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleBatchRecalculate();
        });
    }
}

function bindRecalculateDetailButton() {
    var recalculateBtn = document.getElementById('recalculateBtn');
    if (recalculateBtn) {
        recalculateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var chargeType;
            if (currentTabType === 'outbound') {
                chargeType = '出库单';
            } else if (currentTabType === 'storage') {
                chargeType = '仓储费';
            } else {
                chargeType = '入库费';
            }
            openRecalculateModal(chargeType);
        });
    }
}

function bindImportRecalculateButton() {
    var importRecalculateBtn = document.getElementById('importRecalculateBtn');
    var closeImportModal = document.getElementById('closeImportModal');
    var cancelImportBtn = document.getElementById('cancelImportBtn');
    var confirmImportBtn = document.getElementById('confirmImportBtn');
    var fileInput = document.getElementById('fileInput');
    var uploadArea = document.getElementById('uploadArea');
    
    if (importRecalculateBtn) {
        importRecalculateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openImportRecalculateModal();
        });
    }
    
    if (closeImportModal) {
        closeImportModal.addEventListener('click', function() {
            closeImportRecalculateModal();
        });
    }
    
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', function() {
            closeImportRecalculateModal();
        });
    }
    
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', function() {
            handleFileUpload();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFileSelect(e);
        });
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('upload-area-dragover');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('upload-area-dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('upload-area-dragover');
            
            var files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0]);
            }
        });
    }
    
    var importModal = document.getElementById('importRecalculateModal');
    if (importModal) {
        importModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeImportRecalculateModal();
            }
        });
    }
}

function openImportRecalculateModal() {
    var modal = document.getElementById('importRecalculateModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        clearFile();
    }
}

function closeImportRecalculateModal() {
    var modal = document.getElementById('importRecalculateModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        clearFile();
    }
}

function handleFileSelect(event) {
    var file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    var allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ];
    var allowedExtensions = ['.xlsx', '.xls', '.csv'];
    var maxSize = 10 * 1024 * 1024;
    var fileName = file.name.toLowerCase();
    var isValidType = false;
    
    for (var i = 0; i < allowedExtensions.length; i++) {
        if (fileName.endsWith(allowedExtensions[i])) {
            isValidType = true;
            break;
        }
    }
    
    if (!isValidType && !allowedTypes.includes(file.type)) {
        showToast('文件格式不支持，请选择 .xlsx、.xls 或 .csv 文件', 'error');
        return;
    }
    
    if (file.size > maxSize) {
        showToast('文件大小超过限制，最大支持 10MB', 'error');
        return;
    }
    
    displayFileInfo(file);
    enableConfirmButton();
}

function displayFileInfo(file) {
    var fileInfoDiv = document.getElementById('fileInfo');
    var fileNameEl = document.getElementById('fileName');
    var fileSizeEl = document.getElementById('fileSize');
    
    if (fileInfoDiv && fileNameEl && fileSizeEl) {
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatFileSize(file.size);
        fileInfoDiv.classList.remove('hidden');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clearFile() {
    var fileInput = document.getElementById('fileInput');
    var fileInfoDiv = document.getElementById('fileInfo');
    var confirmImportBtn = document.getElementById('confirmImportBtn');
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (fileInfoDiv) {
        fileInfoDiv.classList.add('hidden');
    }
    
    if (confirmImportBtn) {
        confirmImportBtn.disabled = true;
    }
}

function enableConfirmButton() {
    var confirmImportBtn = document.getElementById('confirmImportBtn');
    if (confirmImportBtn) {
        confirmImportBtn.disabled = false;
    }
}

function handleFileUpload() {
    var fileInput = document.getElementById('fileInput');
    
    if (!fileInput || !fileInput.files[0]) {
        showToast('请先选择要上传的文件', 'warning');
        return;
    }
    
    showLoading('正在导入文件...');
    
    setTimeout(function() {
        hideLoading();
        closeImportRecalculateModal();
        showToast('文件导入成功！正在后台处理重计任务...', 'success');
        console.log('文件已上传：', fileInput.files[0].name);
        
        setTimeout(function() {
            loadInitialData();
        }, 1000);
    }, 2000);
}

function bindTabButtons() {
    var outboundTabBtn = document.getElementById('outboundTabBtn');
    var storageTabBtn = document.getElementById('storageTabBtn');
    var inboundTabBtn = document.getElementById('inboundTabBtn');
    
    if (outboundTabBtn && storageTabBtn && inboundTabBtn) {
        outboundTabBtn.addEventListener('click', function() {
            setActiveTabMulti(outboundTabBtn, [storageTabBtn, inboundTabBtn]);
            currentTabType = 'outbound';
            console.log('切换到：出库单');
            loadInitialData();
        });
        
        storageTabBtn.addEventListener('click', function() {
            setActiveTabMulti(storageTabBtn, [outboundTabBtn, inboundTabBtn]);
            currentTabType = 'storage';
            console.log('切换到：仓储费');
            loadInitialData();
        });
        
        inboundTabBtn.addEventListener('click', function() {
            setActiveTabMulti(inboundTabBtn, [outboundTabBtn, storageTabBtn]);
            currentTabType = 'inbound';
            console.log('切换到：入库费');
            loadInitialData();
        });
    }
}

function setActiveTabMulti(activeBtn, inactiveBtns) {
    activeBtn.className = 'tab-btn tab-btn-active';
    inactiveBtns.forEach(function(btn) {
        btn.className = 'tab-btn tab-btn-inactive';
    });
}

function bindSelectAllCheckbox() {
    var selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            var isChecked = this.checked;
            var checkboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"].row-checkbox');
            
            checkboxes.forEach(function(checkbox) {
                checkbox.checked = isChecked;
                
                var row = checkbox.closest('tr');
                if (row) {
                    if (isChecked) {
                        row.style.backgroundColor = '#f0f4ff';
                    } else {
                        row.style.backgroundColor = '';
                    }
                }
            });
            
            updateSelectedRowsCount();
        });
    }
}

function bindRowCheckboxEvents() {
    var rowCheckboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"].row-checkbox');
    
    rowCheckboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            var row = this.closest('tr');
            if (row) {
                if (this.checked) {
                    row.style.backgroundColor = '#f0f4ff';
                } else {
                    row.style.backgroundColor = '';
                }
            }
            
            updateSelectAllState();
            updateSelectedRowsCount();
        });
    });
}

function updateSelectAllState() {
    var selectAllCheckbox = document.getElementById('selectAllCheckbox');
    var rowCheckboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"].row-checkbox');
    
    if (selectAllCheckbox && rowCheckboxes.length > 0) {
        var allChecked = Array.from(rowCheckboxes).every(function(cb) { return cb.checked; });
        var someChecked = Array.from(rowCheckboxes).some(function(cb) { return cb.checked; });
        
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
}

function updateSelectedRowsCount() {
    var checkedBoxes = document.querySelectorAll('#orderTableBody input[type="checkbox"].row-checkbox:checked');
    selectedRows = Array.from(checkedBoxes).map(function(cb) { return cb.dataset.id; });
    console.log('已选择 ' + selectedRows.length + ' 条记录');
}

function bindModalEvents() {
    var closeModalBtn = document.getElementById('closeModal');
    var closeModalBottomBtn = document.getElementById('closeModalBtn');
    var recalculateModal = document.getElementById('recalculateModal');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeRecalculateModal);
    }
    
    if (closeModalBottomBtn) {
        closeModalBottomBtn.addEventListener('click', closeRecalculateModal);
    }
    
    if (recalculateModal) {
        recalculateModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeRecalculateModal();
            }
        });
    }
    
    var cancelLimitBtn = document.getElementById('cancelLimitBtn');
    var confirmLimitBtn = document.getElementById('confirmLimitBtn');
    var limitExceededModal = document.getElementById('limitExceededModal');
    
    if (cancelLimitBtn) {
        cancelLimitBtn.addEventListener('click', function() {
            closeLimitExceededModal();
            console.log('取消操作');
        });
    }
    
    if (confirmLimitBtn) {
        confirmLimitBtn.addEventListener('click', function() {
            closeLimitExceededModal();
            confirmBatchRecalculate(50000);
            console.log('确认处理前50000条');
        });
    }
    
    if (limitExceededModal) {
        limitExceededModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLimitExceededModal();
            }
        });
    }
    
    var closeSuccessBtn = document.getElementById('closeSuccessBtn');
    var goToRecalculateDetailBtn = document.getElementById('goToRecalculateDetailBtn');
    var successModal = document.getElementById('successModal');
    
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', function() {
            closeSuccessModal();
        });
    }
    
    if (goToRecalculateDetailBtn) {
        goToRecalculateDetailBtn.addEventListener('click', function() {
            closeSuccessModal();
            openRecalculateModal('出库单');
            console.log('查看重计明细');
        });
    }
    
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeSuccessModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeRecalculateModal();
            closeLimitExceededModal();
            closeSuccessModal();
        }
    });
}

function initToastContainer() {
    if (!document.querySelector('.toast-container')) {
        var container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type) {
    type = type || 'info';
    
    var toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    var icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="fa ' + icons[type] + ' toast-icon"></i><span>' + message + '</span>';
    
    toastContainer.appendChild(toast);
    
    setTimeout(function() {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showLoading(text) {
    text = text || '加载中...';
    
    hideLoading();
    
    var overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">' + text + '</div>';
    
    document.body.appendChild(overlay);
}

function hideLoading() {
    var overlay = document.getElementById('loadingOverlay');
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

function switchMainTab(tabName) {
    document.querySelectorAll('.main-content').forEach(function(content) {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    document.querySelectorAll('.tab').forEach(function(t) {
        t.classList.remove('active');
    });
    
    var targetContent = document.getElementById('main-' + tabName);
    if (targetContent) {
        targetContent.classList.add('active');
        if (tabName === 'prototype') {
            targetContent.style.display = 'flex';
        } else {
            targetContent.style.display = 'block';
        }
    }
    
    var targetTab = document.getElementById('tab-' + tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (tabName === 'prd' && !prdLoaded) {
        loadPRD();
    } else if (tabName === 'testcases' && !testCasesLoaded) {
        loadTestCases();
    }
}

function openMermaidModal(container) {
    var mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    
    var modal = document.getElementById('mermaidModal');
    var modalContent = document.getElementById('mermaidModalContent');
    
    if (modal && modalContent) {
        modalContent.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (window.mermaid) {
            try {
                mermaid.init(undefined, modalContent.querySelector('.mermaid'));
            } catch (e) {
                console.warn('Mermaid初始化失败:', e);
            }
        }
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget && !event.target.closest('.mermaid-modal-close')) {
        return;
    }
    
    var modal = document.getElementById('mermaidModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function loadPRD() {
    if (prdLoaded) return;
    
    var prdContentDiv = document.getElementById('prd-content');
    if (!prdContentDiv) return;
    
    if (typeof marked === 'undefined') {
        prdContentDiv.innerHTML = '<div class="text-center py-16"><p class="text-red-500">Marked库未加载</p></div>';
        prdLoaded = true;
        return;
    }
    
    prdContentDiv.innerHTML = '<div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载PRD文档中...</p></div>';
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'prd.md', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var markdown = xhr.responseText;
                var html = marked.parse(markdown);
                prdContentDiv.innerHTML = html;
                generateTOC();
                
                if (window.mermaid) {
                    setTimeout(function() {
                        mermaid.init(undefined, prdContentDiv.querySelectorAll('.mermaid'));
                    }, 100);
                }
            } else {
                prdContentDiv.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无 PRD 文档</p></div>';
            }
            
            prdLoaded = true;
        }
    };
    xhr.send();
}

function loadTestCases() {
    if (testCasesLoaded) return;
    
    var testCasesContentDiv = document.getElementById('testcases-content');
    if (!testCasesContentDiv) return;
    
    if (typeof marked === 'undefined') {
        testCasesContentDiv.innerHTML = '<div class="text-center py-16"><p class="text-red-500">Marked库未加载</p></div>';
        testCasesLoaded = true;
        return;
    }
    
    testCasesContentDiv.innerHTML = '<div class="text-center py-16"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载测试用例文档中...</p></div>';
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'test-cases.md', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var markdown = xhr.responseText;
                var html = marked.parse(markdown);
                testCasesContentDiv.innerHTML = html;
                generateTestCasesTOC();
                
                if (window.mermaid) {
                    setTimeout(function() {
                        mermaid.init(undefined, testCasesContentDiv.querySelectorAll('.mermaid'));
                    }, 100);
                }
            } else {
                testCasesContentDiv.innerHTML = '<div class="text-center py-16 text-gray-500"><i class="fa fa-file-text-o text-4xl mb-4"></i><p>暂无测试用例文档</p></div>';
            }
            
            testCasesLoaded = true;
        }
    };
    xhr.send();
}

function generateTOC() {
    var tocNav = document.getElementById('toc-nav');
    var headings = document.querySelectorAll('#prd-content h1, #prd-content h2, #prd-content h3');
    
    if (!tocNav || headings.length === 0) return;
    
    var tocHTML = '';
    headings.forEach(function(heading, index) {
        var id = 'heading-' + index;
        heading.id = id;
        
        var level = parseInt(heading.tagName.substring(1));
        var className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
    });
    
    tocNav.innerHTML = tocHTML;
}

function generateTestCasesTOC() {
    var tocNav = document.getElementById('testcases-toc-nav');
    var headings = document.querySelectorAll('#testcases-content h1, #testcases-content h2, #testcases-content h3');
    
    if (!tocNav || headings.length === 0) return;
    
    var tocHTML = '';
    headings.forEach(function(heading, index) {
        var id = 'testcases-heading-' + index;
        heading.id = id;
        
        var level = parseInt(heading.tagName.substring(1));
        var className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
    });
    
    tocNav.innerHTML = tocHTML;
}

function togglePrdLogic(module) {
    var content = document.getElementById(module + '-logic-content');
    var icon = document.getElementById(module + '-logic-icon');
    
    if (content && icon) {
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
        } else {
            content.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
        }
    }
}

function switchPrdTab(tabName, sectionId) {
    var prdContent = document.getElementById(sectionId + '-prd-content');
    var testcasesContent = document.getElementById(sectionId + '-testcases-content');
    var buttons = event.target.parentElement.querySelectorAll('.prd-tab-btn');
    
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    if (tabName === 'prd') {
        if (prdContent) prdContent.classList.remove('hidden');
        if (testcasesContent) testcasesContent.classList.add('hidden');
    } else {
        if (prdContent) prdContent.classList.add('hidden');
        if (testcasesContent) testcasesContent.classList.remove('hidden');
    }
}