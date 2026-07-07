// renderer.js - 列表页渲染（表格 + 筛选 + 折扣徽章）
// 详情渲染已拆分到 detail-renderer.js
// 表单页渲染已拆分到 form-handlers.js

function renderRuleConfigTable(filters) {
  if (!filters) filters = {};
  var tbody = document.getElementById('ruleConfigTableBody');
  var emptyState = document.getElementById('emptyState');

  var filteredConfigs = getAllRuleConfigs();

  if (filters.customer_id) filteredConfigs = filteredConfigs.filter(function(c) { return c.customer_id === filters.customer_id; });
  if (filters.warehouse_ids && filters.warehouse_ids.length) {
    filteredConfigs = filteredConfigs.filter(function(c) {
      return filters.warehouse_ids.indexOf(c.warehouse_id) !== -1;
    });
  } else if (filters.warehouse_id) {
    filteredConfigs = filteredConfigs.filter(function(c) { return c.warehouse_id === filters.warehouse_id; });
  }
  if (filters.business_type) filteredConfigs = filteredConfigs.filter(function(c) { return c.business_type === filters.business_type; });
  if (filters.created_by) {
    var kw = filters.created_by.toLowerCase();
    filteredConfigs = filteredConfigs.filter(function(c) { return c.created_by && c.created_by.toLowerCase().indexOf(kw) !== -1; });
  }
  if (filters.effective_status) {
    filteredConfigs = filteredConfigs.filter(function(c) {
      return computeEffectiveStatus(c) === filters.effective_status;
    });
  }

  if (filteredConfigs.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tbody.innerHTML = filteredConfigs.map(function(config) {
    var effStatus = computeEffectiveStatus(config);
    var periodClass = effStatus === 'expired' ? ' opacity-60' : '';
    return '<tr class="hover:bg-hover transition-colors' + (effStatus === 'expired' ? ' opacity-75' : '') + '">' +
      '<td class="px-6 py-4"><div class="text-sm font-medium text-primary">' + config.name + '</div><div class="text-xs text-text-muted mt-1">ID: ' + config.id + '</div></td>' +
      '<td class="px-6 py-4">' + getEffectiveStatusBadge(effStatus) + '</td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + config.customer_name + '</div><div class="text-xs text-text-muted mt-1">' + (getCustomerById(config.customer_id) ? getCustomerById(config.customer_id).code : '-') + '</div></td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + config.warehouse_name + '</div><div class="text-xs text-text-muted mt-1">' + (getWarehouseById(config.warehouse_id) ? getWarehouseById(config.warehouse_id).location : '-') + '</div></td>' +
      '<td class="px-6 py-4' + periodClass + '"><div class="text-sm text-dark">' + formatDateTime(config.effective_start_time) + '</div><div class="text-xs text-text-muted mt-1">至 ' + formatDateTime(config.effective_end_time) + '</div></td>' +
      '<td class="px-6 py-4"><div class="text-sm text-dark">' + (config.created_by || '-') + '</div><div class="text-xs text-text-muted mt-1">' + formatDateTime(config.created_at) + '</div></td>' +
      '<td class="px-6 py-4"><div class="action-buttons">' + getActionButtons(config) + '</div></td></tr>';
  }).join('');
}

function getActionButtons(config) {
  var status = config.status || 'draft';
  var btns = '<button onclick="viewRuleConfig(\'' + config.id + '\')" class="action-btn action-btn-view" title="查看"><i class="fas fa-eye"></i></button>';
  if (status === 'draft') {
    btns += '<button onclick="editRuleConfig(\'' + config.id + '\')" class="action-btn action-btn-edit" title="编辑"><i class="fas fa-edit"></i></button>';
    btns += '<button onclick="publishRuleConfigConfirm(\'' + config.id + '\')" class="action-btn" title="发布" style="color:#2D936C;"><i class="fas fa-paper-plane"></i></button>';
    btns += '<button onclick="deleteRuleConfigConfirm(\'' + config.id + '\')" class="action-btn action-btn-delete" title="删除"><i class="fas fa-trash"></i></button>';
  } else if (status === 'published') {
    btns += '<button onclick="voidRuleConfigConfirm(\'' + config.id + '\')" class="action-btn" title="作废" style="color:#D4853A;"><i class="fas fa-ban"></i></button>';
  } else if (status === 'voided') {
    btns += '<button onclick="copyAndCreateRuleConfig(\'' + config.id + '\')" class="action-btn action-btn-edit" title="复制新增"><i class="fas fa-copy"></i></button>';
  }
  return btns;
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
  cs.innerHTML = '<option value="">全部客户</option>' + getActiveCustomers().map(function(c) { return '<option value="'+c.id+'">'+c.name+'</option>'; }).join('');
  var warehouseOptions = getActiveWarehouses().map(function(w) { return { value: w.id, label: w.name }; });
  MultiSelect.init('filterWarehouse', warehouseOptions, {
    placeholder: '全部仓库',
    onChange: applyFilters,
  });
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
window.getActionButtons = getActionButtons;
window.getDiscountInfo = getDiscountInfo;
window.renderFilterOptions = renderFilterOptions;
