// 页面缓存
const pageCache = {};

// 页面配置
const pageConfig = {
    'warehouse': 'pages/warehouse.html',
    'customer': 'pages/customer.html',
    'fee': 'pages/fee.html',
    'fee-add': 'pages/fee-add.html',
    'storage-fee': 'pages/storage-fee.html',
    'storage-fee-add': 'pages/storage-fee-add.html',
    'operation-fee': 'pages/operation-fee.html',
    'operation-fee-add': 'pages/operation-fee-add.html',
    'express-fee': 'pages/express-fee.html',
    'express-fee-add': 'pages/express-fee-add.html',
    'package': 'pages/package.html'
};

// 当前页面
let currentPage = null;

// 已选择的客户
const selectedCustomers = {
    storage: [],
    operation: [],
    express: []
};

// 页面切换功能
function switchPage(pageId) {
    const container = document.getElementById('page-container');
    if (!container) {
        console.error('页面容器未找到');
        return;
    }
    
    document.querySelectorAll('.page').forEach(function(page) {
        page.classList.remove('active');
    });
    
    const existingPage = document.getElementById('page-' + pageId);
    if (existingPage) {
        existingPage.classList.add('active');
        currentPage = pageId;
        return;
    }
    
    loadPage(pageId, container);
}

// 加载页面
async function loadPage(pageId, container) {
    const pagePath = pageConfig[pageId];
    if (!pagePath) {
        console.error('页面配置未找到:', pageId);
        return;
    }
    
    try {
        if (pageCache[pageId]) {
            container.innerHTML = pageCache[pageId];
            const pageElement = document.getElementById('page-' + pageId);
            if (pageElement) {
                pageElement.classList.add('active');
            }
            currentPage = pageId;
            return;
        }
        
        const response = await fetch(pagePath);
        if (!response.ok) {
            throw new Error('页面加载失败: ' + response.status);
        }
        
        const html = await response.text();
        pageCache[pageId] = html;
        
        container.innerHTML = html;
        const pageElement = document.getElementById('page-' + pageId);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        currentPage = pageId;
        console.log('页面加载成功:', pageId);
    } catch (error) {
        console.error('加载页面失败:', error);
        container.innerHTML = '<div class="bg-white rounded shadow-card p-8 text-center"><p class="text-red-500">页面加载失败，请刷新重试</p></div>';
    }
}

// 切换到指定页面
function switchToPage(pageId) {
    switchPage(pageId);
}

// 仓库搜索功能
function searchWarehouse() {
    console.log('搜索仓库');
}

// 重置仓库搜索
function resetWarehouseSearch() {
    const select = document.getElementById('warehouseSelect');
    if (select) {
        select.value = 'all';
    }
    console.log('重置仓库搜索');
}

// 打开仓库设置
function openWarehouseSettings(warehouseCode) {
    console.log('打开仓库设置:', warehouseCode);
    alert('打开仓库 ' + warehouseCode + ' 的设置');
}

// 客户搜索功能
function searchCustomer() {
    console.log('搜索客户');
}

// 重置客户搜索
function resetCustomerSearch() {
    const select = document.getElementById('customerSelect');
    if (select) {
        select.value = 'all';
    }
    console.log('重置客户搜索');
}

// 打开客户设置
function openCustomerSettings(customerCode) {
    console.log('打开客户设置:', customerCode);
    alert('打开客户 ' + customerCode + ' 的设置');
}

// 费用搜索功能
function searchFee() {
    console.log('搜索费用');
}

// 重置费用搜索
function resetFeeSearch() {
    console.log('重置费用搜索');
}

// ========== 客户多选下拉框功能 ==========

function toggleCustomerDropdown(type) {
    const dropdown = document.getElementById(type + 'FeeCustomerDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
    
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('#' + type + 'FeeCustomerSelect') && !e.target.closest('#' + type + 'FeeCustomerDropdown')) {
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function selectCustomer(type, value, name) {
    const index = selectedCustomers[type].findIndex(c => c.value === value);
    
    if (index > -1) {
        selectedCustomers[type].splice(index, 1);
    } else {
        selectedCustomers[type].push({ value, name });
    }
    
    updateCustomerDisplay(type);
    updateCustomerCheckbox(type, value);
}

function updateCustomerDisplay(type) {
    const tagsContainer = document.getElementById(type + 'FeeCustomerTags');
    const placeholder = document.getElementById(type + 'FeeCustomerPlaceholder');
    
    if (!tagsContainer || !placeholder) return;
    
    if (selectedCustomers[type].length > 0) {
        placeholder.classList.add('hidden');
        tagsContainer.innerHTML = selectedCustomers[type].map(customer => 
            '<span class="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded">' +
            customer.name +
            '<button type="button" class="ml-1 hover:text-primary/70" onclick="event.stopPropagation(); removeCustomer(\'' + type + '\', \'' + customer.value + '\')">' +
            '<i class="fa fa-times"></i></button></span>'
        ).join('');
    } else {
        placeholder.classList.remove('hidden');
        tagsContainer.innerHTML = '';
    }
}

function removeCustomer(type, value) {
    const index = selectedCustomers[type].findIndex(c => c.value === value);
    if (index > -1) {
        selectedCustomers[type].splice(index, 1);
    }
    updateCustomerDisplay(type);
    updateCustomerCheckbox(type, value);
}

function updateCustomerCheckbox(type, value) {
    const options = document.querySelectorAll('#' + type + 'FeeCustomerList .customer-option');
    options.forEach(option => {
        const checkbox = option.querySelector('.customer-checkbox');
        if (checkbox && option.dataset.value === value) {
            checkbox.checked = selectedCustomers[type].some(c => c.value === value);
        }
    });
}

function filterCustomerList(type) {
    const searchInput = document.getElementById(type + 'FeeCustomerSearch');
    const list = document.getElementById(type + 'FeeCustomerList');
    
    if (!searchInput || !list) return;
    
    const keyword = searchInput.value.toLowerCase();
    const options = list.querySelectorAll('.customer-option');
    
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(keyword)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    });
}

function selectAllCustomers(type) {
    const options = document.querySelectorAll('#' + type + 'FeeCustomerList .customer-option');
    options.forEach(option => {
        const value = option.dataset.value;
        const name = option.dataset.name;
        if (!selectedCustomers[type].some(c => c.value === value)) {
            selectedCustomers[type].push({ value, name });
        }
        const checkbox = option.querySelector('.customer-checkbox');
        if (checkbox) checkbox.checked = true;
    });
    updateCustomerDisplay(type);
}

function clearAllCustomers(type) {
    selectedCustomers[type] = [];
    const options = document.querySelectorAll('#' + type + 'FeeCustomerList .customer-option');
    options.forEach(option => {
        const checkbox = option.querySelector('.customer-checkbox');
        if (checkbox) checkbox.checked = false;
    });
    updateCustomerDisplay(type);
}

// ========== 快递费Tab切换功能 ==========

function switchExpressTab(tabName) {
    const tabs = ['zone', 'billing', 'surcharge', 'limits'];
    
    tabs.forEach(tab => {
        const tabBtn = document.getElementById('tab-' + tab);
        const panel = document.getElementById('panel-' + tab);
        
        if (tabBtn && panel) {
            if (tab === tabName) {
                tabBtn.classList.add('text-primary', 'border-primary', 'bg-white');
                tabBtn.classList.remove('text-gray-500', 'border-transparent');
                panel.classList.remove('hidden');
            } else {
                tabBtn.classList.remove('text-primary', 'border-primary', 'bg-white');
                tabBtn.classList.add('text-gray-500', 'border-transparent');
                panel.classList.add('hidden');
            }
        }
    });
}

// ========== 快递费计费模式切换 ==========

function updateBillingModeUI() {
    const mode = document.getElementById('expressFeeBillingMode')?.value;
    const weightTierDiv = document.getElementById('billingModeWeightTier');
    const firstAddDiv = document.getElementById('billingModeFirstAdd');
    
    if (mode === 'first-add') {
        if (weightTierDiv) weightTierDiv.classList.add('hidden');
        if (firstAddDiv) firstAddDiv.classList.remove('hidden');
    } else {
        if (weightTierDiv) weightTierDiv.classList.remove('hidden');
        if (firstAddDiv) firstAddDiv.classList.add('hidden');
    }
}

// ========== 快递公司默认设置 ==========

function updateCarrierDefaults() {
    const carrier = document.getElementById('expressFeeCarrier')?.value;
    const dimDivisor = document.getElementById('dimDivisor');
    
    if (carrier && dimDivisor) {
        if (carrier === 'DHL') {
            dimDivisor.value = '6000';
        } else if (carrier === 'FedEx' || carrier === 'UPS') {
            dimDivisor.value = '5000';
        }
        updateDimDivisorDisplay();
    }
}

// ========== 目的地配置更新 ==========

function updateDestinationConfig() {
    const destination = document.getElementById('expressFeeDestination')?.value;
    console.log('目的地变更:', destination);
}

// ========== 业务线配置更新 ==========

function updateBusinessLineConfig() {
    const businessLine = document.getElementById('expressFeeBusinessLine')?.value;
    console.log('业务线变更:', businessLine);
    
    if (businessLine === 'warehouse_to_customer') {
        // 仓储发货到客户 - 显示所有仓库选项
        const warehouseSelect = document.getElementById('expressFeeOriginWarehouse');
        if (warehouseSelect) {
            warehouseSelect.innerHTML = 
                '<option value="">请选择始发仓库</option>' +
                '<option value="US-LA">美国洛杉矶仓</option>' +
                '<option value="US-NJ">美国新泽西仓</option>' +
                '<option value="US-TX">美国德州仓</option>' +
                '<option value="DE-FRA">德国法兰克福仓</option>' +
                '<option value="UK-LHR">英国伦敦仓</option>' +
                '<option value="AU-SYD">澳大利亚悉尼仓</option>' +
                '<option value="JP-TKY">日本东京仓</option>';
        }
    } else if (businessLine === 'supplier_to_warehouse') {
        // 供应商到仓储 - 需要选择目的仓库
        const warehouseSelect = document.getElementById('expressFeeOriginWarehouse');
        if (warehouseSelect) {
            const label = warehouseSelect.previousElementSibling;
            if (label) {
                label.textContent = '目的仓库 *';
            }
        }
    }
}

// ========== 始发仓库配置更新 ==========

function updateOriginWarehouseConfig() {
    const warehouse = document.getElementById('expressFeeOriginWarehouse')?.value;
    console.log('始发仓库变更:', warehouse);
    
    // 根据仓库自动推荐目的地国家
    if (warehouse && warehouse.startsWith('US-')) {
        const destination = document.getElementById('expressFeeDestination');
        if (destination && !destination.value) {
            destination.value = 'US';
        }
    } else if (warehouse && (warehouse.startsWith('DE-') || warehouse.startsWith('UK-'))) {
        const destination = document.getElementById('expressFeeDestination');
        if (destination && !destination.value) {
            destination.value = 'EU';
        }
    }
}

// ========== 体积重除数显示更新 ==========

function updateDimDivisorDisplay() {
    const divisor = document.getElementById('dimDivisor')?.value;
    const display = document.getElementById('dimDivisorValue');
    if (divisor && display) {
        display.textContent = divisor;
    }
}

// ========== 分区管理功能 ==========

function addZone() {
    const container = document.getElementById('zoneContainer');
    if (!container) return;
    
    const rowCount = container.children.length;
    const newRow = document.createElement('tr');
    newRow.className = 'hover:bg-gray-50';
    newRow.innerHTML = 
        '<td class="px-4 py-3">' +
            '<input type="text" class="form-input w-full zone-name" placeholder="如：Zone ' + (rowCount + 1) + '" value="Zone ' + (rowCount + 1) + '" onchange="updateZoneHeaders()">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="text" class="form-input w-full zone-zip" placeholder="如：邮编范围">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="text" class="form-input w-full zone-region" placeholder="如：覆盖区域">' +
        '</td>' +
        '<td class="px-4 py-3 text-center">' +
            '<label class="inline-flex items-center">' +
                '<input type="checkbox" class="zone-remote form-checkbox h-4 w-4 text-primary rounded" onchange="toggleRemoteSurcharge(this)">' +
                '<span class="ml-1 text-xs text-gray-500">偏远</span>' +
            '</label>' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<div class="flex items-center gap-1">' +
                '<span class="text-gray-400 text-sm">$</span>' +
                '<input type="number" class="form-input w-full zone-remote-fee" placeholder="0.00" min="0" step="0.01" disabled>' +
            '</div>' +
        '</td>' +
        '<td class="px-4 py-3 text-center">' +
            '<button type="button" class="text-gray-400 hover:text-red-500" onclick="removeZoneRow(this)">' +
                '<i class="fa fa-trash-o"></i>' +
            '</button>' +
        '</td>';
    
    container.appendChild(newRow);
    updateZoneHeaders();
}

function removeZoneRow(btn) {
    const row = btn.closest('tr');
    if (row) {
        row.remove();
        updateZoneHeaders();
    }
}

function updateZoneHeaders() {
    const container = document.getElementById('zoneContainer');
    if (!container) return;
    
    const zones = [];
    container.querySelectorAll('tr').forEach(row => {
        const nameInput = row.querySelector('.zone-name');
        if (nameInput && nameInput.value) {
            zones.push(nameInput.value);
        }
    });
    
    updateWeightTierHeaders(zones);
    updateFirstAddHeaders(zones);
}

function updateWeightTierHeaders(zones) {
    const header = document.getElementById('weightTierHeader');
    if (!header) return;
    
    let html = '<th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">重量范围</th>';
    zones.forEach(zone => {
        html += '<th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">' + zone + '</th>';
    });
    html += '<th class="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">操作</th>';
    
    header.innerHTML = html;
}

function updateFirstAddHeaders(zones) {
    const header = document.getElementById('firstAddHeader');
    if (!header) return;
    
    let html = '<th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b w-40">计费项</th>';
    zones.forEach(zone => {
        html += '<th class="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">' + zone + '</th>';
    });
    
    header.innerHTML = html;
}

function importZoneTemplate() {
    alert('导入分区模板功能开发中...');
}

// ========== 偏远地区自动识别 ==========

function autoDetectRemoteAreas() {
    const destination = document.getElementById('expressFeeDestination')?.value;
    
    if (!destination) {
        alert('请先选择目的地国家/地区');
        return;
    }
    
    const remoteZipCodes = {
        'US': ['99500-99999', '96700-96899'],
        'CA': ['A0A-A0Z', 'Y0A-Y1A'],
        'AU': ['0800-0999', '4000-4999']
    };
    
    const remoteRegions = {
        'US': ['阿拉斯加', '夏威夷', '波多黎各'],
        'CA': ['纽芬兰', '育空', '西北地区'],
        'AU': ['北领地', '塔斯马尼亚']
    };
    
    const container = document.getElementById('zoneContainer');
    if (!container) return;
    
    const remoteZips = remoteZipCodes[destination] || [];
    const remoteRegionNames = remoteRegions[destination] || [];
    
    if (remoteZips.length === 0) {
        alert('该目的地暂无偏远地区数据，请手动配置');
        return;
    }
    
    remoteZips.forEach((zipRange, index) => {
        const rows = container.querySelectorAll('tr');
        let found = false;
        
        rows.forEach(row => {
            const zipInput = row.querySelector('.zone-zip');
            if (zipInput && zipInput.value === zipRange) {
                found = true;
                const remoteCheckbox = row.querySelector('.zone-remote');
                if (remoteCheckbox && !remoteCheckbox.checked) {
                    remoteCheckbox.checked = true;
                    row.classList.add('bg-red-50');
                    const remoteFeeInput = row.querySelector('.zone-remote-fee');
                    if (remoteFeeInput) {
                        remoteFeeInput.disabled = false;
                        remoteFeeInput.value = '15.00';
                    }
                }
            }
        });
        
        if (!found) {
            const rowCount = container.children.length;
            const newRow = document.createElement('tr');
            newRow.className = 'hover:bg-gray-50 bg-red-50';
            newRow.innerHTML = 
                '<td class="px-4 py-3">' +
                    '<input type="text" class="form-input w-full zone-name" placeholder="如：Zone ' + (rowCount + 1) + '" value="Zone ' + (rowCount + 1) + ' (偏远)" onchange="updateZoneHeaders()">' +
                '</td>' +
                '<td class="px-4 py-3">' +
                    '<input type="text" class="form-input w-full zone-zip" placeholder="如：邮编范围" value="' + zipRange + '">' +
                '</td>' +
                '<td class="px-4 py-3">' +
                    '<input type="text" class="form-input w-full zone-region" placeholder="如：覆盖区域" value="' + (remoteRegionNames[index] || '偏远地区') + '">' +
                '</td>' +
                '<td class="px-4 py-3 text-center">' +
                    '<label class="inline-flex items-center">' +
                        '<input type="checkbox" class="zone-remote form-checkbox h-4 w-4 text-primary rounded" checked onchange="toggleRemoteSurcharge(this)">' +
                        '<span class="ml-1 text-xs text-red-600 font-medium">偏远</span>' +
                    '</label>' +
                '</td>' +
                '<td class="px-4 py-3">' +
                    '<div class="flex items-center gap-1">' +
                        '<span class="text-gray-400 text-sm">$</span>' +
                        '<input type="number" class="form-input w-full zone-remote-fee" placeholder="0.00" min="0" step="0.01" value="15.00">' +
                    '</div>' +
                '</td>' +
                '<td class="px-4 py-3 text-center">' +
                    '<button type="button" class="text-gray-400 hover:text-red-500" onclick="removeZoneRow(this)">' +
                        '<i class="fa fa-trash-o"></i>' +
                    '</button>' +
                '</td>';
            
            container.appendChild(newRow);
        }
    });
    
    updateZoneHeaders();
    alert('已自动识别并标记 ' + remoteZips.length + ' 个偏远地区分区');
}

// ========== 偏远附加费切换 ==========

function toggleRemoteSurcharge(checkbox) {
    const row = checkbox.closest('tr');
    if (!row) return;
    
    const remoteFeeInput = row.querySelector('.zone-remote-fee');
    const remoteLabel = row.querySelector('.zone-remote + span');
    
    if (checkbox.checked) {
        row.classList.add('bg-red-50');
        if (remoteFeeInput) {
            remoteFeeInput.disabled = false;
            if (!remoteFeeInput.value) {
                remoteFeeInput.value = '15.00';
            }
        }
        if (remoteLabel) {
            remoteLabel.classList.remove('text-gray-500');
            remoteLabel.classList.add('text-red-600', 'font-medium');
        }
    } else {
        row.classList.remove('bg-red-50');
        if (remoteFeeInput) {
            remoteFeeInput.disabled = true;
        }
        if (remoteLabel) {
            remoteLabel.classList.remove('text-red-600', 'font-medium');
            remoteLabel.classList.add('text-gray-500');
        }
    }
}

// ========== 重量段管理功能 ==========

function addWeightTier() {
    const container = document.getElementById('weightTierContainer');
    if (!container) return;
    
    const zones = getZoneCount();
    const weightUnit = document.getElementById('expressFeeWeightUnit')?.value || 'lbs';
    
    let zonePriceCells = '';
    for (let i = 0; i < zones; i++) {
        zonePriceCells += 
            '<td class="px-4 py-3">' +
                '<div class="relative">' +
                    '<span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>' +
                    '<input type="number" class="form-input w-full pl-6 zone-price" placeholder="0.00" min="0" step="0.01">' +
                '</div>' +
            '</td>';
    }
    
    const newRow = document.createElement('tr');
    newRow.className = 'hover:bg-gray-50';
    newRow.innerHTML = 
        '<td class="px-4 py-3">' +
            '<div class="flex items-center gap-2">' +
                '<input type="number" class="form-input w-20 weight-start" placeholder="0" min="0">' +
                '<span class="text-gray-500">-</span>' +
                '<input type="number" class="form-input w-20 weight-end" placeholder="0" min="0">' +
                '<span class="text-xs text-gray-400 weight-unit-label">' + weightUnit + '</span>' +
            '</div>' +
        '</td>' +
        zonePriceCells +
        '<td class="px-4 py-3 text-center">' +
            '<button type="button" class="text-gray-400 hover:text-red-500" onclick="removeWeightRow(this)">' +
                '<i class="fa fa-trash-o"></i>' +
            '</button>' +
        '</td>';
    
    container.appendChild(newRow);
}

function removeWeightRow(btn) {
    const row = btn.closest('tr');
    if (row) {
        row.remove();
    }
}

function getZoneCount() {
    const container = document.getElementById('zoneContainer');
    if (!container) return 4;
    return container.querySelectorAll('tr').length;
}

// ========== 附加费管理功能 ==========

function addSurcharge() {
    const container = document.getElementById('surchargeContainer');
    if (!container) return;
    
    const newRow = document.createElement('tr');
    newRow.className = 'hover:bg-gray-50';
    newRow.innerHTML = 
        '<td class="px-4 py-3">' +
            '<input type="text" class="form-input w-full surcharge-name" placeholder="附加费名称">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<select class="form-select w-full surcharge-type">' +
                '<option value="remote">偏远附加费</option>' +
                '<option value="oversize">超大件附加费</option>' +
                '<option value="overweight">超重附加费</option>' +
                '<option value="signature">签收确认费</option>' +
                '<option value="insurance">保险费</option>' +
                '<option value="residential">住宅派送费</option>' +
                '<option value="saturday">周六派送费</option>' +
                '<option value="other">其他</option>' +
            '</select>' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<select class="form-select w-full surcharge-method">' +
                '<option value="fixed">固定金额</option>' +
                '<option value="percent">按运费百分比</option>' +
                '<option value="per_pound">每磅加收</option>' +
                '<option value="per_kg">每千克加收</option>' +
            '</select>' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<div class="flex items-center gap-1">' +
                '<input type="number" class="form-input w-full surcharge-amount" placeholder="0.00" min="0" step="0.01">' +
                '<span class="text-gray-500 text-sm">$</span>' +
            '</div>' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="text" class="form-input w-full surcharge-condition" placeholder="生效条件">' +
        '</td>' +
        '<td class="px-4 py-3 text-center">' +
            '<button type="button" class="text-gray-400 hover:text-red-500" onclick="removeSurchargeRow(this)">' +
                '<i class="fa fa-trash-o"></i>' +
            '</button>' +
        '</td>';
    
    container.appendChild(newRow);
}

function removeSurchargeRow(btn) {
    const row = btn.closest('tr');
    if (row) {
        row.remove();
    }
}

// ========== 阶梯价格管理功能 ==========

function addStorageFeeTier() {
    const container = document.getElementById('storageFeeTiersContainer');
    if (!container) return;
    
    const rows = container.querySelectorAll('tr');
    const lastRow = rows[rows.length - 1];
    const lastEnd = lastRow ? lastRow.querySelector('.tier-end')?.value || '0' : '0';
    const newStart = parseInt(lastEnd) + 1;
    
    const newRow = document.createElement('tr');
    newRow.className = 'tier-row hover:bg-gray-50';
    newRow.innerHTML = 
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-start" placeholder="' + newStart + '" min="0" value="' + newStart + '">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-end" placeholder="结束天数" min="0">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-price" placeholder="0.00" min="0" step="0.01">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-min" placeholder="0.00" min="0" step="0.01">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-max" placeholder="不限" min="0" step="0.01">' +
        '</td>' +
        '<td class="px-4 py-3 text-center">' +
            '<button type="button" class="text-gray-400 hover:text-red-500" onclick="removeTierRow(this)">' +
                '<i class="fa fa-trash-o"></i>' +
            '</button>' +
        '</td>';
    
    container.appendChild(newRow);
    updateTierDeleteButtons('storageFeeTiersContainer');
}

function addOperationFeeTier() {
    const container = document.getElementById('operationFeeTiersContainer');
    if (!container) return;
    
    const rows = container.querySelectorAll('tr');
    const lastRow = rows[rows.length - 1];
    const lastEnd = lastRow ? lastRow.querySelector('.tier-end')?.value || '0' : '0';
    const newStart = parseInt(lastEnd) + 1;
    
    const newRow = document.createElement('tr');
    newRow.className = 'tier-row hover:bg-gray-50';
    newRow.innerHTML = 
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-start" placeholder="' + newStart + '" min="0" value="' + newStart + '">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-end" placeholder="结束值" min="0">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-price" placeholder="0.00" min="0" step="0.01">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-min" placeholder="0.00" min="0" step="0.01">' +
        '</td>' +
        '<td class="px-4 py-3">' +
            '<input type="number" class="form-input w-full tier-max" placeholder="不限" min="0" step="0.01">' +
        '</td>' +
        '<td class="px-4 py-3 text-center">' +
            '<button type="button" class="text-gray-400 hover:text-red-500" onclick="removeTierRow(this)">' +
                '<i class="fa fa-trash-o"></i>' +
            '</button>' +
        '</td>';
    
    container.appendChild(newRow);
    updateTierDeleteButtons('operationFeeTiersContainer');
}

function removeTierRow(btn) {
    const row = btn.closest('tr');
    const container = row.parentElement;
    
    if (container && container.children.length > 1) {
        row.remove();
        updateTierDeleteButtons(container.id);
    }
}

function updateTierDeleteButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const rows = container.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const btn = row.querySelector('button[onclick*="removeTierRow"]');
        if (btn) {
            btn.disabled = rows.length === 1;
            btn.classList.toggle('text-gray-400', rows.length === 1);
            btn.classList.toggle('hover:text-red-500', rows.length > 1);
        }
    });
}

// ========== 保存功能 ==========

function saveStorageFee() {
    const name = document.getElementById('storageFeeName')?.value;
    const businessType = document.getElementById('storageFeeBusinessType')?.value;
    const unit = document.getElementById('storageFeeUnit')?.value;
    const warehouse = document.getElementById('storageFeeWarehouse')?.value;
    const validFrom = document.getElementById('storageFeeValidFrom')?.value;
    const validTo = document.getElementById('storageFeeValidTo')?.value;
    const remark = document.getElementById('storageFeeRemark')?.value;
    
    if (!name || !businessType || !unit || !warehouse || !validFrom || !validTo) {
        alert('请填写所有必填项');
        return;
    }
    
    if (selectedCustomers.storage.length === 0) {
        alert('请选择适用客户');
        return;
    }
    
    const tiers = [];
    const rows = document.querySelectorAll('#storageFeeTiersContainer tr');
    rows.forEach(row => {
        const start = row.querySelector('.tier-start')?.value;
        const end = row.querySelector('.tier-end')?.value;
        const price = row.querySelector('.tier-price')?.value;
        const min = row.querySelector('.tier-min')?.value;
        const max = row.querySelector('.tier-max')?.value;
        
        if (start && price) {
            tiers.push({ start, end, price, min, max });
        }
    });
    
    const feeData = {
        type: 'storage',
        name,
        businessType,
        unit,
        warehouse,
        validFrom,
        validTo,
        customers: selectedCustomers.storage,
        tiers,
        remark
    };
    
    console.log('保存仓储费:', feeData);
    alert('仓储费保存成功！');
    switchToPage('storage-fee');
}

function saveOperationFee() {
    const name = document.getElementById('operationFeeName')?.value;
    const businessType = document.getElementById('operationFeeBusinessType')?.value;
    const operationType = document.getElementById('operationFeeOperationType')?.value;
    const unit = document.getElementById('operationFeeUnit')?.value;
    const warehouse = document.getElementById('operationFeeWarehouse')?.value;
    const validFrom = document.getElementById('operationFeeValidFrom')?.value;
    const validTo = document.getElementById('operationFeeValidTo')?.value;
    const remark = document.getElementById('operationFeeRemark')?.value;
    
    if (!name || !businessType || !operationType || !unit || !warehouse || !validFrom || !validTo) {
        alert('请填写所有必填项');
        return;
    }
    
    if (selectedCustomers.operation.length === 0) {
        alert('请选择适用客户');
        return;
    }
    
    const tiers = [];
    const rows = document.querySelectorAll('#operationFeeTiersContainer tr');
    rows.forEach(row => {
        const start = row.querySelector('.tier-start')?.value;
        const end = row.querySelector('.tier-end')?.value;
        const price = row.querySelector('.tier-price')?.value;
        const min = row.querySelector('.tier-min')?.value;
        const max = row.querySelector('.tier-max')?.value;
        
        if (start && price) {
            tiers.push({ start, end, price, min, max });
        }
    });
    
    const feeData = {
        type: 'operation',
        name,
        businessType,
        operationType,
        unit,
        warehouse,
        validFrom,
        validTo,
        customers: selectedCustomers.operation,
        tiers,
        remark
    };
    
    console.log('保存操作费:', feeData);
    alert('操作费保存成功！');
    switchToPage('operation-fee');
}

function saveExpressFee() {
    const name = document.getElementById('expressFeeName')?.value;
    const businessType = document.getElementById('expressFeeBusinessType')?.value;
    const businessLine = document.getElementById('expressFeeBusinessLine')?.value;
    const originWarehouse = document.getElementById('expressFeeOriginWarehouse')?.value;
    const carrier = document.getElementById('expressFeeCarrier')?.value;
    const serviceType = document.getElementById('expressFeeServiceType')?.value;
    const destination = document.getElementById('expressFeeDestination')?.value;
    const deliveryTime = document.getElementById('expressFeeDeliveryTime')?.value;
    const weightUnit = document.getElementById('expressFeeWeightUnit')?.value;
    const currency = document.getElementById('expressFeeCurrency')?.value;
    const billingMode = document.getElementById('expressFeeBillingMode')?.value;
    const volumeWeight = document.getElementById('expressFeeVolumeWeight')?.value;
    const validFrom = document.getElementById('expressFeeValidFrom')?.value;
    const validTo = document.getElementById('expressFeeValidTo')?.value;
    const remark = document.getElementById('expressFeeRemark')?.value;
    
    if (!name || !businessLine || !originWarehouse || !carrier || !serviceType || !destination || !validFrom || !validTo) {
        alert('请填写所有必填项');
        return;
    }
    
    if (selectedCustomers.express.length === 0) {
        alert('请选择适用客户');
        return;
    }
    
    const zones = [];
    const zoneRows = document.querySelectorAll('#zoneContainer tr');
    zoneRows.forEach(row => {
        const nameInput = row.querySelector('.zone-name');
        const zipInput = row.querySelector('.zone-zip');
        const regionInput = row.querySelector('.zone-region');
        const remoteInput = row.querySelector('.zone-remote');
        const remoteFeeInput = row.querySelector('.zone-remote-fee');
        
        if (nameInput && nameInput.value) {
            zones.push({
                name: nameInput.value,
                zipRange: zipInput?.value || '',
                region: regionInput?.value || '',
                isRemote: remoteInput?.checked || false,
                remoteFee: remoteFeeInput?.value || '0'
            });
        }
    });
    
    let billingData = {};
    if (billingMode === 'first-add') {
        const firstWeight = document.getElementById('firstWeight')?.value;
        const addWeight = document.getElementById('addWeight')?.value;
        const firstPrices = [];
        const addPrices = [];
        
        document.querySelectorAll('.first-price').forEach(input => {
            firstPrices.push(input.value);
        });
        document.querySelectorAll('.add-price').forEach(input => {
            addPrices.push(input.value);
        });
        
        billingData = {
            mode: 'first-add',
            firstWeight: firstWeight,
            addWeight: addWeight,
            firstPrices: firstPrices,
            addPrices: addPrices
        };
    } else {
        const weightTiers = [];
        const weightRows = document.querySelectorAll('#weightTierContainer tr');
        weightRows.forEach(row => {
            const startInput = row.querySelector('.weight-start');
            const endInput = row.querySelector('.weight-end');
            const prices = [];
            row.querySelectorAll('.zone-price').forEach(input => {
                prices.push(input.value);
            });
            
            if (startInput && startInput.value) {
                weightTiers.push({
                    weightStart: startInput.value,
                    weightEnd: endInput?.value || '',
                    prices: prices
                });
            }
        });
        
        billingData = {
            mode: 'weight-tier',
            weightTiers: weightTiers
        };
    }
    
    const fuelSurchargeRate = document.getElementById('fuelSurchargeRate')?.value;
    const fuelSurchargeDate = document.getElementById('fuelSurchargeDate')?.value;
    const fuelSurchargeBase = document.getElementById('fuelSurchargeBase')?.value;
    
    const surcharges = [];
    const surchargeRows = document.querySelectorAll('#surchargeContainer tr');
    surchargeRows.forEach(row => {
        const nameInput = row.querySelector('.surcharge-name');
        const typeSelect = row.querySelector('.surcharge-type');
        const methodSelect = row.querySelector('.surcharge-method');
        const amountInput = row.querySelector('.surcharge-amount');
        const conditionInput = row.querySelector('.surcharge-condition');
        
        if (nameInput && nameInput.value) {
            surcharges.push({
                name: nameInput.value,
                type: typeSelect?.value || '',
                calculationMethod: methodSelect?.value || '',
                amount: amountInput?.value || '',
                condition: conditionInput?.value || ''
            });
        }
    });
    
    const limits = {
        maxWeight: document.getElementById('maxWeight')?.value || '70',
        maxWeightUnit: document.getElementById('maxWeightUnit')?.value || 'lbs',
        overweightAction: document.getElementById('overweightAction')?.value || 'reject',
        overweightFee: document.getElementById('overweightFee')?.value || '',
        maxLength: document.getElementById('maxLength')?.value || '108',
        maxGirth: document.getElementById('maxGirth')?.value || '165',
        oversizeAction: document.getElementById('oversizeAction')?.value || 'reject',
        oversizeFee: document.getElementById('oversizeFee')?.value || '',
        minCharge: document.getElementById('minCharge')?.value || '10',
        minWeightCharge: document.getElementById('minWeightCharge')?.value || '1',
        dimDivisor: document.getElementById('dimDivisor')?.value || '5000',
        enableDimWeight: document.getElementById('enableDimWeight')?.checked ?? true
    };
    
    const feeData = {
        type: 'express',
        name,
        businessType,
        businessLine,
        originWarehouse,
        carrier,
        serviceType,
        destination,
        deliveryTime,
        weightUnit,
        currency,
        billingMode,
        volumeWeight,
        validFrom,
        validTo,
        customers: selectedCustomers.express,
        zones,
        billing: billingData,
        fuelSurcharge: {
            rate: fuelSurchargeRate,
            date: fuelSurchargeDate,
            base: fuelSurchargeBase
        },
        surcharges,
        limits,
        remark
    };
    
    console.log('保存快递费:', feeData);
    alert('快递费方案保存成功！');
    switchToPage('express-fee');
}

// 切换逻辑说明展开/收起
function togglePrdLogic(type) {
    const content = document.getElementById(type + '-logic-content');
    const icon = document.getElementById(type + '-logic-icon');
    
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

// 切换主标签页
function switchMainTab(tabName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.getElementById('tab-' + tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    document.querySelectorAll('.main-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById('main-' + tabName);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    if (tabName === 'prototype' && !currentPage) {
        switchPage('warehouse');
    }
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
    switchPage('warehouse');
    
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            switchMainTab('prototype');
            switchPage(pageId);
        });
    });
    
    if (document.getElementById('dimDivisor')) {
        document.getElementById('dimDivisor').addEventListener('change', updateDimDivisorDisplay);
    }
});
