let currentEditId = null;
let currentItemDiscounts = [];
let feeRows = [];
let currentFeeCategory = 'inbound';

async function init() {
  await initApi();
  renderFilterOptions();
  renderRuleConfigTable();
  
  document.getElementById('filterCustomer').addEventListener('change', applyFilters);
  document.getElementById('filterWarehouse').addEventListener('change', applyFilters);
  document.getElementById('filterBusinessType').addEventListener('change', applyFilters);
  document.getElementById('filterCreatedBy').addEventListener('input', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
}

function openCreateModal() {
  window.location.href = 'rule-config-form.html';
}

function closeModal() {
  // 已改为页面模式，不再需要
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function updateConfigName() {
  var customerSelect = document.getElementById('selectCustomer');
  var warehouseSelect = document.getElementById('selectWarehouse');
  var configNameInput = document.getElementById('configName');
  
  var customer = customerSelect.options[customerSelect.selectedIndex];
  var warehouse = warehouseSelect.options[warehouseSelect.selectedIndex];
  
  if (customer.value && warehouse.value) {
    var suggestedName = customer.text + '-' + warehouse.text + '规则配置';
    if (!configNameInput.value || configNameInput.value.includes('规则配置')) {
      configNameInput.value = suggestedName;
    }
  }
}

function checkDuplicateConfig() {
  var customerId = document.getElementById('selectCustomer').value;
  var warehouseId = document.getElementById('selectWarehouse').value;
  var duplicateHint = document.getElementById('duplicateHint');
  
  if (customerId && warehouseId) {
    var existing = getExistingConfig(customerId, warehouseId);
    if (existing && existing.id !== currentEditId) {
      duplicateHint.classList.remove('hidden');
      duplicateHint.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i>该客户和仓库已存在配置：' + existing.name + '，请编辑现有配置';
    } else {
      duplicateHint.classList.add('hidden');
    }
  } else {
    duplicateHint.classList.add('hidden');
  }
}

function loadPriceCardDiscount() {
  var priceCardId = document.getElementById('selectPriceCard').value;
  
  if (!priceCardId) {
    document.getElementById('discountPreviewSection').classList.add('hidden');
    currentItemDiscounts = [];
    feeRows = [];
    return;
  }
  
  var priceCard = getPriceCardById(priceCardId);
  
  if (priceCard) {
    currentItemDiscounts = deepCopy(priceCard.fee_discounts || {});
    feeRows = [];
    
    var feeDiscounts = priceCard.fee_discounts || {};
    Object.keys(feeDiscounts).forEach(function(categoryKey) {
      var items = feeDiscounts[categoryKey] || [];
      items.forEach(function(item) {
        feeRows.push({
          id: generateId('row'),
          fee_category: categoryKey,
          fee_item_id: item.fee_item_id || '',
          fee_item_name: item.fee_item_name || '',
          unit: item.unit || '',
          discount_type: item.discount_type || 'none',
          discount_value: item.discount_value || 0,
          discount_description: item.discount_description || ''
        });
      });
    });
    
    currentFeeCategory = 'inbound';
    renderDiscountPreview(priceCard);
  }
}

function switchFeeCategory(category) {
  currentFeeCategory = category;

  document.querySelectorAll('.tab-btn').forEach(function(tab) {
    tab.classList.toggle('active', tab.dataset.group === category);
  });
  
  renderFeeTable();
}

function addFeeRow() {
  var newRow = {
    id: generateId('row'),
    fee_category: currentFeeCategory,
    fee_item_id: '',
    fee_item_name: '',
    unit: '',
    discount_type: 'none',
    discount_value: 0,
    discount_description: ''
  };
  
  feeRows.push(newRow);
  renderFeeTable();
}

function removeFeeRow(rowId) {
  feeRows = feeRows.filter(function(row) { return row.id !== rowId; });
  renderFeeTable();
}

// 打开折扣配置（跳转到新页面，与价卡管理 FeeTable.showDiscountConfig 逻辑一致）
function openDiscountConfigForRow(rowId) {
  var row = feeRows.find(function(r) { return r.id === rowId; });
  if (!row) return;
  localStorage.setItem('_rc_pending_row_' + rowId, JSON.stringify(row));

  // 判断是否有阶梯定价数据，决定跳转到哪个折扣页
  var hasTier = row.original_tier_pricing && row.original_tier_pricing.length > 0;
  var fromPage = 'rule-config/rule-config-form.html' + (currentEditId ? '&editId=' + currentEditId : '');

  if (hasTier) {
    window.location.href = '../价卡管理/discount-tier.html?rowId=' + rowId + '&from=' + fromPage;
  } else {
    window.location.href = '../价卡管理/discount-standard.html?rowId=' + rowId + '&from=' + fromPage;
  }
}

// 折扣配置已改为独立页面，通过 localStorage 传递数据

function updateFeeRow(rowId, field, value) {
  var row = feeRows.find(function(r) { return r.id === rowId; });
  if (row) {
    row[field] = value;
    
    if (field === 'fee_item_id') {
      var feeItems = getFeeItemsByCategory(row.fee_category);
      var selectedItem = feeItems.find(function(item) { return item.id === value; });
      if (selectedItem) {
        row.fee_item_name = selectedItem.name;
        row.unit = selectedItem.unit;
      }
    }
    
    if (field === 'discount_type') {
      row.discount_value = 0;
    }
    
    renderFeeTable();
  }
}

function collectFormData() {
  var customerId = document.getElementById('selectCustomer').value;
  var warehouseId = document.getElementById('selectWarehouse').value;
  var priceCardId = document.getElementById('selectPriceCard').value;
  
  var customer = getCustomerById(customerId);
  var warehouse = getWarehouseById(warehouseId);
  var priceCard = getPriceCardById(priceCardId);
  
  var feeDiscounts = {
    inbound: [],
    outbound: [],
    storage: [],
    express: [],
    other: []
  };
  
  feeRows.forEach(function(row) {
    if (row.fee_item_id && row.fee_item_name) {
      var item = {
        fee_item_id: row.fee_item_id,
        fee_item_name: row.fee_item_name,
        unit: row.unit || '',
        discount_type: row.discount_type || 'none',
        discount_value: row.discount_value || 0,
        discount_description: row.discount_description || ''
      };
      
      if (feeDiscounts[row.fee_category]) {
        feeDiscounts[row.fee_category].push(item);
      }
    }
  });
  
  var isAdjusted = checkIfAdjusted(priceCard, feeDiscounts);
  
  return {
    name: document.getElementById('configName').value,
    customer_id: customerId,
    customer_name: customer ? customer.name : '',
    warehouse_id: warehouseId,
    warehouse_name: warehouse ? warehouse.name : '',
    price_card_id: priceCardId,
    price_card_name: priceCard ? priceCard.name : '',
    business_type: document.getElementById('businessType').value,
    fee_discounts: feeDiscounts,
    adjustments: priceCard ? deepCopy(priceCard.adjustments || []) : [],
    is_adjusted: isAdjusted,
    effective_start_time: document.getElementById('effectiveStartTime').value,
    effective_end_time: document.getElementById('effectiveEndTime').value,
    created_by: document.getElementById('createdBy').value
  };
}

function checkIfAdjusted(priceCard, currentFeeDiscounts) {
  if (!priceCard) return false;
  
  var originalFeeDiscounts = priceCard.fee_discounts || {};
  var categories = Object.keys(FEE_CATEGORIES);
  
  for (var i = 0; i < categories.length; i++) {
    var key = categories[i];
    var origItems = originalFeeDiscounts[key] || [];
    var currItems = currentFeeDiscounts[key] || [];
    
    if (origItems.length !== currItems.length) {
      return true;
    }
    
    for (var j = 0; j < origItems.length; j++) {
      var orig = origItems[j];
      var curr = currItems[j];
      
      if (!curr || 
          orig.fee_item_id !== curr.fee_item_id ||
          orig.discount_type !== curr.discount_type ||
          orig.discount_value !== curr.discount_value ||
          orig.discount_description !== curr.discount_description) {
        return true;
      }
    }
  }
  
  return false;
}

function saveRuleConfig() {
  var configName = document.getElementById('configName').value;
  var customerId = document.getElementById('selectCustomer').value;
  var warehouseId = document.getElementById('selectWarehouse').value;
  var priceCardId = document.getElementById('selectPriceCard').value;
  var effectiveStartTime = document.getElementById('effectiveStartTime').value;
  var effectiveEndTime = document.getElementById('effectiveEndTime').value;
  var createdBy = document.getElementById('createdBy').value;
  
  if (!configName || !customerId || !warehouseId || !priceCardId || !effectiveStartTime || !effectiveEndTime || !createdBy) {
    showToast('请填写所有必填项（配置名称、客户、仓库、价卡、生效周期、创建人）', 'error');
    return;
  }
  
  if (!checkUniqueConfig(customerId, warehouseId, currentEditId)) {
    var existingConfig = getExistingConfig(customerId, warehouseId);
    showToast('该客户和仓库已存在配置：' + existingConfig.name + '，请编辑现有配置或选择其他客户/仓库', 'error');
    return;
  }
  
  var formData = collectFormData();
  
  if (currentEditId) {
    updateRuleConfig(currentEditId, formData);
    showToast('规则配置更新成功', 'success');
  } else {
    createRuleConfig(formData);
    showToast('规则配置创建成功', 'success');
  }
  
  closeModal();
  renderRuleConfigTable();
}

function viewRuleConfig(ruleConfigId) {
  var ruleConfig = getRuleConfigById(ruleConfigId);
  
  if (ruleConfig) {
    renderRuleConfigDetail(ruleConfig);
    document.getElementById('detailModal').style.display = 'flex';
  }
}

function editRuleConfig(ruleConfigId) {
  window.location.href = 'rule-config-form.html?editId=' + ruleConfigId;
}

function deleteRuleConfigConfirm(ruleConfigId) {
  if (confirm('确定要删除这条规则配置吗？删除后该客户+仓库组合可重新创建配置。')) {
    deleteRuleConfig(ruleConfigId);
    showToast('规则配置删除成功', 'success');
    renderRuleConfigTable();
  }
}

function applyFilters() {
  var filters = {
    customer_id: document.getElementById('filterCustomer').value,
    warehouse_id: document.getElementById('filterWarehouse').value,
    business_type: document.getElementById('filterBusinessType').value,
    created_by: document.getElementById('filterCreatedBy').value
  };
  
  renderRuleConfigTable(filters);
}

function resetFilters() {
  document.getElementById('filterCustomer').value = '';
  document.getElementById('filterWarehouse').value = '';
  document.getElementById('filterBusinessType').value = '';
  document.getElementById('filterCreatedBy').value = '';
  
  renderRuleConfigTable();
}

function resetData() {
  if (confirm('确定要重置测试数据吗？这将清除所有本地数据并重新加载测试数据。')) {
    localStorage.clear();
    showToast('数据已重置，正在重新加载...', 'success');
    setTimeout(function() {
      location.reload();
    }, 1000);
  }
}

function showToast(message, type) {
  if (!type) type = 'success';
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(function() {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', init);

window.openCreateModal = openCreateModal;
window.closeModal = closeModal;
window.closeDetailModal = closeDetailModal;
window.updateConfigName = updateConfigName;
window.checkDuplicateConfig = checkDuplicateConfig;
window.loadPriceCardDiscount = loadPriceCardDiscount;
window.switchFeeCategory = switchFeeCategory;
window.addFeeRow = addFeeRow;
window.removeFeeRow = removeFeeRow;
window.updateFeeRow = updateFeeRow;
window.openDiscountConfigForRow = openDiscountConfigForRow;
window.saveRuleConfig = saveRuleConfig;
window.viewRuleConfig = viewRuleConfig;
window.editRuleConfig = editRuleConfig;
window.deleteRuleConfigConfirm = deleteRuleConfigConfirm;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.resetData = resetData;
