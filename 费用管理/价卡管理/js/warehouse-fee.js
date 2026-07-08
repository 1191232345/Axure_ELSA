// 库内费用维护页面逻辑 - 核心部分
let currentPackageId = null;
let currentTab = 'unload';

// 费用项数据存储
const warehouseFeeData = {
  unload: [],      // 卸货费
  storage: [],     // 仓储费
  onepiece: [],    // 一件代发
  transfer: [],    // 中转
  valueadded: []   // 增值服务
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  currentPackageId = FeeMaintenanceCommon.getPackageId();
  if (!currentPackageId) {
    alert('缺少价卡ID参数');
    window.location.href = 'index.html';
    return;
  }
  loadPackageData();
});

// 加载价卡数据
function loadPackageData() {
  const pkg = FeeMaintenanceCommon.loadPackage(currentPackageId);
  if (!pkg) return;

  FeeMaintenanceCommon.displayPackageName(pkg);

  // 根据费用分类加载费用项
  pkg.feeItems.forEach(item => {
    const feeGroup = item.feeGroup || item.feeGroupName || '';
    if (feeGroup.includes('卸货') || feeGroup === 'unload') {
      warehouseFeeData.unload.push(item);
    } else if (feeGroup.includes('仓储') || feeGroup === 'storage') {
      warehouseFeeData.storage.push(item);
    } else if (feeGroup.includes('一件代发') || feeGroup.includes('出库（一件代发）') || feeGroup === 'onepiece') {
      warehouseFeeData.onepiece.push(item);
    } else if (feeGroup.includes('中转') || feeGroup.includes('出库（中转）') || feeGroup === 'transfer') {
      warehouseFeeData.transfer.push(item);
    } else if (feeGroup.includes('增值') || feeGroup === 'valueadded') {
      warehouseFeeData.valueadded.push(item);
    }
  });

  renderCurrentTab();
}

// 切换Tab
function switchWarehouseFeeTab(tabName) {
  currentTab = tabName;
  updateTabButtons(tabName);
  showTabContent(tabName);
  renderCurrentTab();
}

// 更新Tab按钮样式
function updateTabButtons(activeTab) {
  const tabs = document.querySelectorAll('.warehouse-fee-tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === activeTab);
  });
}

// 显示Tab内容
function showTabContent(tabName) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.add('hidden'));
  
  const activeContent = document.getElementById(`${tabName}TabContent`);
  if (activeContent) activeContent.classList.remove('hidden');
}

// 渲染当前Tab的表格
function renderCurrentTab() {
  const feeItems = warehouseFeeData[currentTab];
  const tbodyId = `${currentTab}FeeTableBody`;
  const emptyStateId = `${currentTab}EmptyState`;

  const tbody = document.getElementById(tbodyId);
  const emptyState = document.getElementById(emptyStateId);

  if (!tbody || !emptyState) return;

  if (feeItems.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tbody.innerHTML = feeItems.map((item, index) => renderFeeRow(item, index, currentTab)).join('');
}

// 计算预计金额
function calculateExpectedAmount(item) {
  const unitPrice = item.unitPrice || 0;
  if (!item.discountType || item.discountType === 'none') {
    return unitPrice;
  }
  if (typeof DiscountCalculator !== 'undefined') {
    return DiscountCalculator.calculateFinalPrice(unitPrice, item.discountType, item.discountValue || 0);
  }
  if (item.discountType === 'percentage') {
    return unitPrice * (1 - (item.discountValue || 0) / 100);
  }
  if (item.discountType === 'fixed') {
    return Math.max(0, unitPrice - (item.discountValue || 0));
  }
  if (item.discountType === 'fixed_price') {
    return item.discountValue || 0;
  }
  return unitPrice;
}

// 渲染费用行
function renderFeeRow(item, index, tabName) {
  const discountText = FeeMaintenanceCommon.formatDiscountText(item);
  const isNewRow = !item.feeType || item.feeType === '';
  const expectedAmount = calculateExpectedAmount(item);

  const feeTypeCell = isNewRow
    ? `<select onchange="onFeeItemSelect('${tabName}', ${index}, this.value)"
               class="form-input text-sm" style="min-width: 150px;">
         <option value="">请选择收费项</option>
         ${getFeeItemOptions(tabName)}
       </select>`
    : `<span class="text-sm font-medium">${item.feeTypeName || item.feeType || '-'}</span>`;

  const unitCell = isNewRow && !item.unit
    ? '<span class="text-sm text-text-muted">自动带出</span>'
    : `<span class="text-sm">${item.unit || '-'}</span>`;

  const unitPriceCell = isNewRow && !item.unitPrice
    ? '<span class="text-sm text-text-muted">自动带出</span>'
    : `<span class="text-sm">${item.unitPrice ? item.unitPrice.toFixed(2) : '-'}</span>`;

  const discountCell = isNewRow
    ? '<span class="text-sm text-text-muted">-</span>'
    : `<span class="text-sm">${discountText}</span>`;

  const expectedCell = isNewRow
    ? '<span class="text-sm text-text-muted">-</span>'
    : `<span class="text-sm font-semibold text-accent">${expectedAmount.toFixed(2)}</span>`;

  const operationCell = `
    <div class="flex items-center gap-2">
      ${isNewRow ? '' : `<button onclick="openDiscountModal('${tabName}', ${index})"
              class="btn btn-secondary btn-sm">
        <i class="fas fa-cog mr-1"></i>设置折扣
      </button>`}
      <button onclick="deleteFeeRow('${tabName}', ${index})"
              class="text-danger hover:text-danger-light" title="删除">
        <i class="fas fa-trash"></i>
      </button>
    </div>`;

  return `<tr class="hover:bg-hover transition-colors${isNewRow ? ' bg-accent/5' : ''}">
    <td class="px-4 py-3">${feeTypeCell}</td>
    <td class="px-4 py-3">${unitCell}</td>
    <td class="px-4 py-3">${unitPriceCell}</td>
    <td class="px-4 py-3">${discountCell}</td>
    <td class="px-4 py-3">${expectedCell}</td>
    <td class="px-4 py-3">
      <input type="text" value="${item.remark || ''}"
             onchange="updateRemark('${tabName}', ${index}, this.value)"
             class="form-input text-sm" placeholder="请填写备注">
    </td>
    <td class="px-4 py-3">${operationCell}</td>
  </tr>`;
}

// 获取收费项下拉选项
function getFeeItemOptions(tabName) {
  const feeItems = {
    unload: ['整柜卸货费', '散货卸货费', 'pallet卸货费'],
    storage: ['按体积仓储费', '按重量仓储费', '按pallet仓储费'],
    onepiece: ['一件代发处理费', '一件代发打包费'],
    transfer: ['中转处理费', '中转运输费'],
    valueadded: ['贴标费', '打包费', '拍照费', '质检费']
  };
  
  const items = feeItems[tabName] || [];
  return items.map(item => `<option value="${item}">${item}</option>`).join('');
}

// 收费项选择事件
function onFeeItemSelect(tabName, index, selectedValue) {
  const item = warehouseFeeData[tabName][index];

  // 已选择费用项后不允许修改
  if (item.feeType && item.feeType !== '') {
    renderCurrentTab();
    return;
  }

  if (!selectedValue) {
    return;
  }

  setFeeItemData(item, selectedValue);
  renderCurrentTab();
}

// 重置费用项数据
function resetFeeItem(item) {
  item.feeType = '';
  item.feeTypeName = '';
  item.unit = '';
  item.pricingMethod = '';
  item.unitPrice = 0;
  item.discountType = 'none';
  item.discountValue = 0;
}

// 设置费用项数据
function setFeeItemData(item, selectedValue) {
  item.feeType = selectedValue;
  item.feeTypeName = selectedValue;
  
  // 根据选择的收费项设置相关数据
  const feeDataMap = {
    '卸货': { unit: '按柜', pricingMethod: '按件计费', unitPrice: 50 },
    '仓储': { unit: 'CBM/天', pricingMethod: '阶梯计费', unitPrice: 0.5 },
    '一件代发': { unit: '按件', pricingMethod: '按件计费', unitPrice: 2 },
    '中转': { unit: '按柜', pricingMethod: '按件计费', unitPrice: 30 },
    '增值': { unit: '按件', pricingMethod: '按件计费', unitPrice: 1 }
  };
  
  for (const key of Object.keys(feeDataMap)) {
    if (selectedValue.includes(key)) {
      item.unit = feeDataMap[key].unit;
      item.pricingMethod = feeDataMap[key].pricingMethod;
      item.unitPrice = feeDataMap[key].unitPrice;
      break;
    }
  }
  
  item.discountType = 'none';
  item.discountValue = 0;
  item.expectedAmount = calculateExpectedAmount(item);
}

// 更新备注
function updateRemark(tabName, index, value) {
  warehouseFeeData[tabName][index].remark = value;
}

// 新增当前Tab的费用行
function addCurrentTabFeeRow() {
  const feeGroupNameMap = {
    unload: '卸货费',
    storage: '仓储费',
    onepiece: '出库（一件代发）',
    transfer: '出库（中转）',
    valueadded: '增值服务'
  };
  
  const newItem = {
    feeGroup: currentTab,
    feeGroupName: feeGroupNameMap[currentTab],
    feeType: '',
    feeTypeName: '',
    unit: '',
    pricingMethod: '',
    unitPrice: 0,
    discountType: 'none',
    discountValue: 0,
    expectedAmount: 0,
    remark: ''
  };
  
  warehouseFeeData[currentTab].push(newItem);
  renderCurrentTab();
}

// 删除费用项
function deleteFeeRow(tabName, index) {
  FeeMaintenanceCommon.confirmDelete(index, () => {
    warehouseFeeData[tabName].splice(index, 1);
    renderCurrentTab();
  });
}

// 打开折扣编辑弹窗
function openDiscountModal(tabName, index) {
  DiscountModal.open(tabName, index, warehouseFeeData);
}

// 保存折扣设置
function saveDiscount() {
  DiscountModal.save(warehouseFeeData, () => {
    const tabName = document.getElementById('discountEditTab').value;
    const index = parseInt(document.getElementById('discountEditIndex').value, 10);
    const item = warehouseFeeData[tabName][index];
    item.expectedAmount = calculateExpectedAmount(item);
    renderCurrentTab();
  });
}

// 保存库内费用
function saveWarehouseFees() {
  // 验证所有费用项都已选择收费项
  if (!validateAllFeeItems()) return;
  
  // 合并所有费用项
  const allFeeItems = getAllFeeItems();

  // 保存到价卡
  saveFeeItemsToPackage(allFeeItems);
}

// 验证所有费用项
function validateAllFeeItems() {
  const tabNames = {
    unload: '卸货费',
    storage: '仓储费',
    onepiece: '出库（一件代发）',
    transfer: '出库（中转）',
    valueadded: '增值服务'
  };
  
  for (const tab of Object.keys(warehouseFeeData)) {
    const incompleteItems = warehouseFeeData[tab].filter(item => !item.feeType);
    if (incompleteItems.length > 0) {
      alert(`${tabNames[tab]}中有未选择收费项的费用项，请先完成配置`);
      return false;
    }
  }
  return true;
}

// 合并所有费用项
function getAllFeeItems() {
  return [
    ...warehouseFeeData.unload,
    ...warehouseFeeData.storage,
    ...warehouseFeeData.onepiece,
    ...warehouseFeeData.transfer,
    ...warehouseFeeData.valueadded
  ];
}

// 保存费用项到价卡
function saveFeeItemsToPackage(allFeeItems) {
  DataService.loadPackages();
  const pkg = AppState.packages.find(p => p.id === currentPackageId);

  if (!pkg) {
    alert('价卡不存在');
    return;
  }

  // 保留非库内费用项
  const otherFeeItems = pkg.feeItems.filter(item =>
    !item.feeGroup.includes('卸货') &&
    !item.feeGroup.includes('仓储') &&
    !item.feeGroup.includes('一件代发') &&
    !item.feeGroup.includes('出库（一件代发）') &&
    !item.feeGroup.includes('中转') &&
    !item.feeGroup.includes('出库（中转）') &&
    !item.feeGroup.includes('增值') &&
    !item.feeGroupName.includes('卸货') &&
    !item.feeGroupName.includes('仓储') &&
    !item.feeGroupName.includes('一件代发') &&
    !item.feeGroupName.includes('出库（一件代发）') &&
    !item.feeGroupName.includes('中转') &&
    !item.feeGroupName.includes('出库（中转）') &&
    !item.feeGroupName.includes('增值')
  );

  pkg.feeItems = [...otherFeeItems, ...allFeeItems];
  pkg.updatedBy = '管理员';
  pkg.updatedAt = DataService.getCurrentTime();

  DataService.savePackages();

  alert('库内费用保存成功！');
  window.location.href = 'index.html';
}