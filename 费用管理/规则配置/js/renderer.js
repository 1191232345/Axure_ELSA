// renderer.js - 列表页渲染（表格 + 筛选 + 折扣徽章）
// 详情渲染已拆分到 detail-renderer.js
// 表单页渲染已拆分到 form-handlers.js

function renderRuleConfigTable(filters) {
  if (!filters) filters = {};
  var tbody = document.getElementById('ruleConfigTableBody');
  var emptyState = document.getElementById('emptyState');

  var filteredConfigs = getActiveRuleConfigs();

  if (filters.customer_id) filteredConfigs = filteredConfigs.filter(function(c) { return c.customer_id === filters.customer_id; });
  if (filters.warehouse_id) filteredConfigs = filteredConfigs.filter(function(c) { return c.warehouse_id === filters.warehouse_id; });
  if (filters.business_type) filteredConfigs = filteredConfigs.filter(function(c) { return c.business_type === filters.business_type; });
  if (filters.created_by) {
    var kw = filters.created_by.toLowerCase();
    filteredConfigs = filteredConfigs.filter(function(c) { return c.created_by && c.created_by.toLowerCase().indexOf(kw) !== -1; });
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
      '<td class="px-6 py-4"><div class="text-sm font-medium text-primary">' + config.name + '</div><div class="text-xs text-text-muted mt-1">ID: ' + config.id + '</div></td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + config.customer_name + '</div><div class="text-xs text-text-muted mt-1">' + (getCustomerById(config.customer_id) ? getCustomerById(config.customer_id).code : '-') + '</div></td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + config.warehouse_name + '</div><div class="text-xs text-text-muted mt-1">' + (getWarehouseById(config.warehouse_id) ? getWarehouseById(config.warehouse_id).location : '-') + '</div></td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + config.price_card_name + '</div><div class="text-xs text-text-muted mt-1">引用模板</div></td>' +
      '<td class="px-6 py-4"><span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">' + businessTypeText + '</span></td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + discountInfo + '</div></td>' +
      '<td class="px-6 py-4">' + adjustedBadge + '</td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + formatDateTime(config.effective_start_time) + '</div><div class="text-xs text-text-muted mt-1">至 ' + formatDateTime(config.effective_end_time) + '</div></td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + (config.created_by || '-') + '</div><div class="text-xs text-text-muted mt-1">' + formatDateTime(config.created_at) + '</div></td>' +
      '<td class="px-6 py-4"><div class="action-buttons">' +
        '<button onclick="viewRuleConfig(\'' + config.id + '\')" class="action-btn action-btn-view"><i class="fas fa-eye"></i></button>' +
        '<button onclick="editRuleConfig(\'' + config.id + '\')" class="action-btn action-btn-edit"><i class="fas fa-edit"></i></button>' +
        '<button onclick="deleteRuleConfigConfirm(\'' + config.id + '\')" class="action-btn action-btn-delete"><i class="fas fa-trash"></i></button>' +
      '</div></td></tr>';
  }).join('');
}

function getDiscountInfo(config) {
  var info = '', totalItems = 0;
  if (config.fee_discounts) {
    Object.keys(config.fee_discounts).forEach(function(key) {
      if (config.fee_discounts[key] && config.fee_discounts[key].length) totalItems += config.fee_discounts[key].length;
    });
  }
  if (totalItems > 0) info += totalItems + '项费用折扣';
  if (config.adjustments && config.adjustments.length > 0) {
    var addCount = config.adjustments.filter(function(a) { return a.type === 'add'; }).length;
    var subCount = config.adjustments.filter(function(a) { return a.type === 'subtract'; }).length;
    if (addCount > 0) info += ' + ' + addCount + '项增项';
    if (subCount > 0) info += ' - ' + subCount + '项减项';
  }
  return info || '无折扣配置';
}

function renderFilterOptions() {
  var cs = document.getElementById('filterCustomer');
  var ws = document.getElementById('filterWarehouse');
  cs.innerHTML = '<option value="">全部客户</option>' + getActiveCustomers().map(function(c) { return '<option value="'+c.id+'">'+c.name+'</option>'; }).join('');
  ws.innerHTML = '<option value="">全部仓库</option>' + getActiveWarehouses().map(function(w) { return '<option value="'+w.id+'">'+w.name+'</option>'; }).join('');
}

// 折扣徽章渲染（与价卡管理 fee-table.js._renderDiscountBadge 完全一致）
function _renderDiscountBadge(row) {
  if (row.tierDiscountConfig && row.tierDiscountConfig.discountType) {
    var cfg = row.tierDiscountConfig;
    var text = DiscountCalculator.DISCOUNT_TYPE_TEXT[cfg.discountType];
    var val = cfg.discountValue || 0;
    var unit = cfg.discountType === 'percentage' ? '%' : '$';
    if (cfg.discountType === 'none') return '<span class="badge badge-secondary"><i class="fas fa-check mr-1"></i>' + text + '</span>';
    return '<span class="badge badge-accent"><i class="fas fa-layer-group mr-1"></i>' + text + ': ' + val + unit + '</span>';
  }
  if (row.discount_type && row.discount_type !== 'none') {
    var dt = DiscountCalculator.DISCOUNT_TYPE_TEXT[row.discount_type] || row.discount_type;
    var v = row.discount_value || 0, u = row.discount_type === 'percentage' ? '%' : '$';
    return '<span class="badge badge-accent"><i class="fas fa-layer-group mr-1"></i>' + dt + ': ' + v + u + '</span>';
  }
  return '<span class="badge badge-warning"><i class="fas fa-exclamation-triangle mr-1"></i>未配置</span>';
}

window._renderDiscountBadge = _renderDiscountBadge;
window.renderRuleConfigTable = renderRuleConfigTable;
window.getDiscountInfo = getDiscountInfo;
window.renderFilterOptions = renderFilterOptions;
