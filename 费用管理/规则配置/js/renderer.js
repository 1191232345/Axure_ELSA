function renderRuleConfigTable(filters) {
  if (!filters) filters = {};
  var tbody = document.getElementById('ruleConfigTableBody');
  var emptyState = document.getElementById('emptyState');
  
  var filteredConfigs = getActiveRuleConfigs();
  
  if (filters.customer_id) {
    filteredConfigs = filteredConfigs.filter(function(c) { return c.customer_id === filters.customer_id; });
  }
  if (filters.warehouse_id) {
    filteredConfigs = filteredConfigs.filter(function(c) { return c.warehouse_id === filters.warehouse_id; });
  }
  if (filters.business_type) {
    filteredConfigs = filteredConfigs.filter(function(c) { return c.business_type === filters.business_type; });
  }
  if (filters.created_by) {
    var keyword = filters.created_by.toLowerCase();
    filteredConfigs = filteredConfigs.filter(function(c) {
      return c.created_by && c.created_by.toLowerCase().indexOf(keyword) !== -1;
    });
  }
  
  if (filteredConfigs.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  tbody.innerHTML = filteredConfigs.map(function(config) {
    var discountInfo = getDiscountInfo(config);
    var adjustedBadge = config.is_adjusted 
      ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800"><i class="fas fa-edit mr-1"></i>已微调</span>'
      : '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><i class="fas fa-check mr-1"></i>未微调</span>';
    
    var businessTypeText = config.business_type === 'all' ? '全部业务' : getBusinessTypeText(config.business_type);
    
    return '<tr class="hover:bg-hover transition-colors">' +
      '<td class="px-6 py-4">' +
        '<div class="text-sm font-medium text-primary">' + config.name + '</div>' +
        '<div class="text-xs text-text-muted mt-1">ID: ' + config.id + '</div>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<div class="text-sm text-dark">' + config.customer_name + '</div>' +
        '<div class="text-xs text-text-muted mt-1">' + (getCustomerById(config.customer_id) ? getCustomerById(config.customer_id).code : '-') + '</div>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<div class="text-sm text-dark">' + config.warehouse_name + '</div>' +
        '<div class="text-xs text-text-muted mt-1">' + (getWarehouseById(config.warehouse_id) ? getWarehouseById(config.warehouse_id).location : '-') + '</div>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<div class="text-sm text-dark">' + config.price_card_name + '</div>' +
        '<div class="text-xs text-text-muted mt-1">引用模板</div>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">' +
          businessTypeText +
        '</span>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<div class="text-sm text-dark">' + discountInfo + '</div>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        adjustedBadge +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<div class="text-sm text-dark">' + formatDateTime(config.effective_start_time) + '</div>' +
        '<div class="text-xs text-text-muted mt-1">至 ' + formatDateTime(config.effective_end_time) + '</div>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<div class="text-sm text-dark">' + (config.created_by || '-') + '</div>' +
        '<div class="text-xs text-text-muted mt-1">' + formatDateTime(config.created_at) + '</div>' +
      '</td>' +
      '<td class="px-6 py-4">' +
        '<div class="action-buttons">' +
          '<button onclick="viewRuleConfig(\'' + config.id + '\')" class="action-btn action-btn-view">' +
            '<i class="fas fa-eye"></i>' +
          '</button>' +
          '<button onclick="editRuleConfig(\'' + config.id + '\')" class="action-btn action-btn-edit">' +
            '<i class="fas fa-edit"></i>' +
          '</button>' +
          '<button onclick="deleteRuleConfigConfirm(\'' + config.id + '\')" class="action-btn action-btn-delete">' +
            '<i class="fas fa-trash"></i>' +
          '</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function getDiscountInfo(config) {
  var info = '';
  var totalItems = 0;
  
  if (config.fee_discounts) {
    Object.keys(config.fee_discounts).forEach(function(key) {
      if (config.fee_discounts[key] && config.fee_discounts[key].length) {
        totalItems += config.fee_discounts[key].length;
      }
    });
  }
  
  if (totalItems > 0) {
    info += totalItems + '项费用折扣';
  }
  
  if (config.adjustments && config.adjustments.length > 0) {
    var addCount = config.adjustments.filter(function(a) { return a.type === 'add'; }).length;
    var subtractCount = config.adjustments.filter(function(a) { return a.type === 'subtract'; }).length;
    if (addCount > 0) info += ' + ' + addCount + '项增项';
    if (subtractCount > 0) info += ' - ' + subtractCount + '项减项';
  }
  
  return info || '无折扣配置';
}

function renderFilterOptions() {
  var customerSelect = document.getElementById('filterCustomer');
  var warehouseSelect = document.getElementById('filterWarehouse');
  
  var activeCustomers = getActiveCustomers();
  var activeWarehouses = getActiveWarehouses();
  
  customerSelect.innerHTML = '<option value="">全部客户</option>' + 
    activeCustomers.map(function(c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
  
  warehouseSelect.innerHTML = '<option value="">全部仓库</option>' + 
    activeWarehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
}

function renderCreateModalOptions() {
  var customerSelect = document.getElementById('selectCustomer');
  var warehouseSelect = document.getElementById('selectWarehouse');
  var priceCardSelect = document.getElementById('selectPriceCard');
  
  var activeCustomers = getActiveCustomers();
  var activeWarehouses = getActiveWarehouses();
  var activePriceCards = getActivePriceCards();
  
  customerSelect.innerHTML = '<option value="">请选择客户</option>' + 
    activeCustomers.map(function(c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join('');
  
  warehouseSelect.innerHTML = '<option value="">请选择仓库</option>' + 
    activeWarehouses.map(function(w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('');
  
  priceCardSelect.innerHTML = '<option value="">请选择价卡模板</option>' + 
    activePriceCards.map(function(p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
}

function renderDiscountPreview(priceCard) {
  var previewSection = document.getElementById('discountPreviewSection');
  
  if (!priceCard) {
    previewSection.classList.add('hidden');
    return;
  }
  
  previewSection.classList.remove('hidden');
  renderFeeCategoryTabs();
}

function renderFeeCategoryTabs() {
  var tabsContainer = document.getElementById('feeCategoryTabs');
  var categories = FEE_CATEGORIES;
  
  var tabsHtml = '';
  Object.keys(categories).forEach(function(key) {
    var cat = categories[key];
    var isActive = key === currentFeeCategory ? ' active' : '';
    tabsHtml += '<button type="button" class="fee-category-tab' + isActive + '" data-category="' + key + '" onclick="switchFeeCategory(\'' + key + '\')">' +
      '<i class="fas ' + cat.icon + ' mr-1"></i>' + cat.name +
    '</button>';
  });
  
  tabsContainer.innerHTML = tabsHtml;
  renderFeeTable();
}

function renderFeeTable() {
  var tbody = document.getElementById('feeItemsTableBody');
  var categoryItems = feeRows.filter(function(row) { return row.fee_category === currentFeeCategory; });
  
  if (categoryItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="px-4 py-8 text-center text-text-muted">' +
      '<i class="fas fa-inbox text-2xl mb-2 block"></i>' +
      '<p>当前分类暂无折扣配置，请点击"新增行"添加</p>' +
    '</td></tr>';
    return;
  }
  
  var feeItems = getFeeItemsByCategory(currentFeeCategory);
  var feeCategoryNames = {
    'inbound': '入库费',
    'outbound': '出库费',
    'storage': '仓储费',
    'express': '快递费',
    'other': '其他收费'
  };
  
  tbody.innerHTML = categoryItems.map(function(row) {
    // 费用类型下拉框：按子类分组显示
    var feeOptionsHtml = '';
    var subCategories = {};
    
    feeItems.forEach(function(item) {
      if (!subCategories[item.sub_category]) {
        subCategories[item.sub_category] = [];
      }
      subCategories[item.sub_category].push(item);
    });
    
    Object.keys(subCategories).forEach(function(subCat) {
      feeOptionsHtml += '<optgroup label="' + subCat + '">';
      subCategories[subCat].forEach(function(item) {
        feeOptionsHtml += '<option value="' + item.id + '"' + (row.fee_item_id === item.id ? ' selected' : '') + '>' + item.name + '</option>';
      });
      feeOptionsHtml += '</optgroup>';
    });
    
    // 如果当前选中的费用项不在列表中，添加为选中项
    if (row.fee_item_id && !feeItems.find(function(item) { return item.id === row.fee_item_id; })) {
      feeOptionsHtml += '<option value="' + row.fee_item_id + '" selected>' + (row.fee_item_name || row.fee_item_id) + '</option>';
    }
    
    var selectedItem = feeItems.find(function(item) { return item.id === row.fee_item_id; });
    var unitDisplay = selectedItem ? selectedItem.unit : (row.unit || '-');
    
    // 计算预计金额
    var unitPrice = row.unitPrice || 0;
    var expectedAmount = 0;
    if (unitPrice > 0) {
      if (row.discount_type === 'none') {
        expectedAmount = unitPrice;
      } else if (row.discount_type === 'percentage') {
        expectedAmount = unitPrice * (1 - (row.discount_value || 0) / 100);
      } else if (row.discount_type === 'fixed') {
        expectedAmount = Math.max(0, unitPrice - (row.discount_value || 0));
      } else if (row.discount_type === 'fixed_price') {
        expectedAmount = row.discount_value || 0;
      }
    }
    
    var discountTypeOptions = 
      '<option value="none"' + (row.discount_type === 'none' ? ' selected' : '') + '>无折扣</option>' +
      '<option value="percentage"' + (row.discount_type === 'percentage' ? ' selected' : '') + '>百分比</option>' +
      '<option value="fixed"' + (row.discount_type === 'fixed' ? ' selected' : '') + '>指定扣减</option>' +
      '<option value="fixed_price"' + (row.discount_type === 'fixed_price' ? ' selected' : '') + '>一口价</option>';
    
    var discountValueInput = '';
    if (row.discount_type === 'none') {
      discountValueInput = '<span class="text-sm text-text-muted">-</span>';
    } else if (row.discount_type === 'percentage') {
      discountValueInput = '<div class="flex items-center gap-2">' +
        '<input type="number" value="' + (row.discount_value || '') + '" min="0" max="100" step="1" ' +
          'onchange="updateFeeRow(\'' + row.id + '\', \'discount_value\', parseFloat(this.value) || 0)" ' +
          'class="form-input text-sm w-20" placeholder="数值">' +
        '<span class="text-sm text-text-secondary">%</span>' +
      '</div>';
    } else if (row.discount_type === 'fixed') {
      discountValueInput = '<div class="flex items-center gap-2">' +
        '<input type="number" value="' + (row.discount_value || '') + '" min="0" step="0.01" ' +
          'onchange="updateFeeRow(\'' + row.id + '\', \'discount_value\', parseFloat(this.value) || 0)" ' +
          'class="form-input text-sm w-24" placeholder="金额">' +
        '<span class="text-sm text-text-secondary">元</span>' +
      '</div>';
    } else if (row.discount_type === 'fixed_price') {
      discountValueInput = '<div class="flex items-center gap-2">' +
        '<input type="number" value="' + (row.discount_value || '') + '" min="0" step="0.01" ' +
          'onchange="updateFeeRow(\'' + row.id + '\', \'discount_value\', parseFloat(this.value) || 0)" ' +
          'class="form-input text-sm w-24" placeholder="一口价">' +
        '<span class="text-sm text-text-secondary">元</span>' +
      '</div>';
    }
    
    var remarkInput = '<input type="text" value="' + (row.discount_description || '') + '" ' +
      'onchange="updateFeeRow(\'' + row.id + '\', \'discount_description\', this.value)" ' +
      'class="form-input text-sm" placeholder="备注">';
    
    return '<tr class="hover:bg-hover transition-colors">' +
      '<td class="px-4 py-3">' +
        '<div class="text-sm font-medium text-primary">' + (feeCategoryNames[row.fee_category] || '入库费') + '</div>' +
      '</td>' +
      '<td class="px-4 py-3">' +
        '<select onchange="updateFeeRow(\'' + row.id + '\', \'fee_item_id\', this.value)" class="form-input text-sm">' +
          '<option value="">请选择费用类型</option>' +
          feeOptionsHtml +
        '</select>' +
      '</td>' +
      '<td class="px-4 py-3">' +
        '<div class="text-sm text-text-secondary">' + unitDisplay + '</div>' +
      '</td>' +
      '<td class="px-4 py-3">' +
        '<input type="number" value="' + (row.unitPrice || '') + '" min="0" step="0.01" ' +
          'onchange="updateFeeRow(\'' + row.id + '\', \'unitPrice\', parseFloat(this.value) || 0)" ' +
          'class="form-input text-sm w-24" placeholder="单价">' +
      '</td>' +
      '<td class="px-4 py-3">' +
        '<select onchange="updateFeeRow(\'' + row.id + '\', \'discount_type\', this.value)" class="form-input text-sm">' +
          discountTypeOptions +
        '</select>' +
      '</td>' +
      '<td class="px-4 py-3">' +
        discountValueInput +
      '</td>' +
      '<td class="px-4 py-3">' +
        '<div class="text-sm font-semibold text-accent">' + (expectedAmount > 0 ? expectedAmount.toFixed(2) : '-') + '</div>' +
      '</td>' +
      '<td class="px-4 py-3">' +
        remarkInput +
      '</td>' +
      '<td class="px-4 py-3">' +
        '<button type="button" onclick="removeFeeRow(\'' + row.id + '\')" class="btn btn-danger btn-sm">' +
          '<i class="fas fa-trash"></i>' +
        '</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function renderRuleConfigDetail(ruleConfig) {
  var detailContent = document.getElementById('detailContent');
  
  var feeDiscountsHtml = '';
  var categories = FEE_CATEGORIES;
  Object.keys(categories).forEach(function(key) {
    var cat = categories[key];
    var items = (ruleConfig.fee_discounts && ruleConfig.fee_discounts[key]) || [];
    
    if (items.length === 0) return;
    
    var itemsHtml = items.map(function(d) {
      return '<div class="bg-white border border-border rounded-lg p-3">' +
        '<div class="flex items-center justify-between">' +
          '<div>' +
            '<span class="text-xs text-text-muted">' + (d.sub_category || '') + '</span>' +
            '<div class="font-medium text-dark">' + d.fee_item_name + '</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="text-sm font-semibold text-primary">' + formatDiscount({type: d.discount_type, value: d.discount_value, description: d.discount_description}) + '</div>' +
            '<div class="text-xs text-text-muted">' + (d.discount_description || '') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    
    feeDiscountsHtml += '<div class="mb-4">' +
      '<h5 class="text-sm font-semibold text-primary mb-2">' +
        '<i class="fas ' + cat.icon + ' mr-1 text-accent"></i>' + cat.name + '（' + items.length + '项）' +
      '</h5>' +
      '<div class="space-y-2">' + itemsHtml + '</div>' +
    '</div>';
  });
  
  if (!feeDiscountsHtml) {
    feeDiscountsHtml = '<p class="text-sm text-text-muted">无费用项折扣</p>';
  }
  
  var adjustmentsHtml = ruleConfig.adjustments && ruleConfig.adjustments.length > 0
    ? ruleConfig.adjustments.map(function(a) {
      return '<div class="bg-white border border-border rounded-lg p-3">' +
        '<div class="flex items-center justify-between">' +
          '<div>' +
            '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ' + (a.type === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') + '">' +
              (a.type === 'add' ? '增项' : '减项') +
            '</span>' +
            '<span class="font-medium text-dark ml-2">' + a.name + '</span>' +
          '</div>' +
          '<div class="text-sm font-semibold ' + (a.type === 'add' ? 'text-green-600' : 'text-red-600') + '">' +
            (a.type === 'add' ? '+' : '-') + '¥' + a.amount +
          '</div>' +
        '</div>' +
        '<div class="text-sm text-text-secondary mt-1">' + (a.description || '-') + '</div>' +
      '</div>';
    }).join('')
    : '<p class="text-sm text-text-muted">无增减项</p>';
  
  var businessTypeText = ruleConfig.business_type === 'all' ? '全部业务' : getBusinessTypeText(ruleConfig.business_type);
  
  detailContent.innerHTML = 
    '<div class="space-y-6">' +
      '<div>' +
        '<h4 class="font-semibold text-primary mb-3">' +
          '<i class="fas fa-info-circle mr-2 text-accent"></i>基本信息' +
        '</h4>' +
        '<div class="grid grid-cols-2 gap-4">' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">配置名称</div>' +
            '<div class="font-medium text-dark">' + ruleConfig.name + '</div>' +
          '</div>' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">业务类型</div>' +
            '<div class="font-medium text-dark">' + businessTypeText + '</div>' +
          '</div>' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">客户</div>' +
            '<div class="font-medium text-dark">' + ruleConfig.customer_name + '</div>' +
          '</div>' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">仓库</div>' +
            '<div class="font-medium text-dark">' + ruleConfig.warehouse_name + '</div>' +
          '</div>' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">引用价卡</div>' +
            '<div class="font-medium text-dark">' + ruleConfig.price_card_name + '</div>' +
          '</div>' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">微调状态</div>' +
            '<div class="font-medium">' +
              (ruleConfig.is_adjusted 
                ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800"><i class="fas fa-edit mr-1"></i>已微调</span>'
                : '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><i class="fas fa-check mr-1"></i>未微调</span>') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      '<div>' +
        '<h4 class="font-semibold text-primary mb-3">' +
          '<i class="fas fa-list mr-2 text-accent"></i>费用项折扣' +
        '</h4>' +
        feeDiscountsHtml +
      '</div>' +
      
      '<div>' +
        '<h4 class="font-semibold text-primary mb-3">' +
          '<i class="fas fa-plus-minus mr-2 text-accent"></i>增减项配置' +
        '</h4>' +
        '<div class="space-y-2">' + adjustmentsHtml + '</div>' +
      '</div>' +
      
      '<div>' +
        '<h4 class="font-semibold text-primary mb-3">' +
          '<i class="fas fa-calendar mr-2 text-accent"></i>生效周期' +
        '</h4>' +
        '<div class="grid grid-cols-2 gap-4">' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">生效开始时间</div>' +
            '<div class="font-medium text-dark">' + formatDateTime(ruleConfig.effective_start_time) + '</div>' +
          '</div>' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">生效结束时间</div>' +
            '<div class="font-medium text-dark">' + formatDateTime(ruleConfig.effective_end_time) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      
      '<div>' +
        '<h4 class="font-semibold text-primary mb-3">' +
          '<i class="fas fa-user-clock mr-2 text-accent"></i>创建信息' +
        '</h4>' +
        '<div class="grid grid-cols-2 gap-4">' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">创建人</div>' +
            '<div class="font-medium text-dark">' + (ruleConfig.created_by || '-') + '</div>' +
          '</div>' +
          '<div class="bg-light-bg rounded-lg p-3">' +
            '<div class="text-xs text-text-muted mb-1">创建时间</div>' +
            '<div class="font-medium text-dark">' + formatDateTime(ruleConfig.created_at) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

window.renderRuleConfigTable = renderRuleConfigTable;
window.getDiscountInfo = getDiscountInfo;
window.renderFilterOptions = renderFilterOptions;
window.renderCreateModalOptions = renderCreateModalOptions;
window.renderDiscountPreview = renderDiscountPreview;
window.renderFeeCategoryTabs = renderFeeCategoryTabs;
window.renderFeeTable = renderFeeTable;
window.renderRuleConfigDetail = renderRuleConfigDetail;
