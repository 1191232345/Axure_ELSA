// detail-renderer.js - 规则配置详情弹窗渲染
// 从 renderer.js 拆分

function renderRuleConfigDetail(ruleConfig) {
  var detailContent = document.getElementById('detailContent');

  var feeDiscountsHtml = _renderFeeDiscounts(ruleConfig);
  var adjustmentsHtml = _renderAdjustments(ruleConfig);
  var businessTypeText = ruleConfig.business_type === 'all' ? '全部业务' : getBusinessTypeText(ruleConfig.business_type);

  detailContent.innerHTML =
    '<div class="space-y-6">' +
      _renderSection('基本信息', 'fa-info-circle', _renderBasicInfo(ruleConfig, businessTypeText)) +
      _renderSection('费用项折扣', 'fa-list', feeDiscountsHtml) +
      _renderSection('增减项配置', 'fa-plus-minus', '<div class="space-y-2">' + adjustmentsHtml + '</div>') +
      _renderSection('生效周期', 'fa-calendar', _renderEffectivePeriod(ruleConfig)) +
      _renderSection('创建信息', 'fa-user-clock', _renderCreateInfo(ruleConfig)) +
    '</div>';
}

function _renderSection(title, icon, content) {
  return '<div>' +
    '<h4 class="font-semibold text-primary mb-3"><i class="fas ' + icon + ' mr-2 text-accent"></i>' + title + '</h4>' +
    content +
  '</div>';
}

function _renderInfoGrid(items) {
  return '<div class="grid grid-cols-2 gap-4">' +
    items.map(function(item) {
      return '<div class="bg-light-bg rounded-lg p-3">' +
        '<div class="text-xs text-text-muted mb-1">' + item.label + '</div>' +
        '<div class="font-medium text-dark">' + item.value + '</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function _renderBasicInfo(rc, businessTypeText) {
  var adjustedBadge = rc.is_adjusted
    ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800"><i class="fas fa-edit mr-1"></i>已微调</span>'
    : '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"><i class="fas fa-check mr-1"></i>未微调</span>';
  return _renderInfoGrid([
    { label: '配置名称', value: rc.name },
    { label: '状态', value: getStatusBadge(rc.status) },
    { label: '业务类型', value: businessTypeText },
    { label: '客户', value: rc.customer_name },
    { label: '仓库', value: rc.warehouse_name },
    { label: '引用价卡', value: rc.price_card_name },
    { label: '微调状态', value: adjustedBadge }
  ]);
}

function _renderEffectivePeriod(rc) {
  return _renderInfoGrid([
    { label: '生效开始时间', value: formatDateTime(rc.effective_start_time) },
    { label: '生效结束时间', value: formatDateTime(rc.effective_end_time) }
  ]);
}

function _renderCreateInfo(rc) {
  return _renderInfoGrid([
    { label: '创建人', value: rc.created_by || '-' },
    { label: '创建时间', value: formatDateTime(rc.created_at) }
  ]);
}

function _renderFeeDiscounts(rc) {
  var html = '';
  var categories = FEE_CATEGORIES;
  Object.keys(categories).forEach(function(key) {
    var cat = categories[key];
    var items = (rc.fee_discounts && rc.fee_discounts[key]) || [];
    if (items.length === 0) return;

    var itemsHtml = items.map(function(d) {
      return '<div class="bg-white border border-border rounded-lg p-3">' +
        '<div class="flex items-center justify-between">' +
          '<div><span class="text-xs text-text-muted">' + (d.sub_category || '') + '</span>' +
            '<div class="font-medium text-dark">' + d.fee_item_name + '</div></div>' +
          '<div class="text-right">' +
            '<div class="text-sm font-semibold text-primary">' + formatDiscount({type: d.discount_type, value: d.discount_value, description: d.discount_description}) + '</div>' +
            '<div class="text-xs text-text-muted">' + (d.discount_description || '') + '</div></div>' +
        '</div></div>';
    }).join('');

    html += '<div class="mb-4">' +
      '<h5 class="text-sm font-semibold text-primary mb-2"><i class="fas ' + cat.icon + ' mr-1 text-accent"></i>' + cat.name + '（' + items.length + '项）</h5>' +
      '<div class="space-y-2">' + itemsHtml + '</div></div>';
  });

  return html || '<p class="text-sm text-text-muted">无费用项折扣</p>';
}

function _renderAdjustments(rc) {
  if (!rc.adjustments || rc.adjustments.length === 0) return '<p class="text-sm text-text-muted">无增减项</p>';
  return rc.adjustments.map(function(a) {
    var isAdd = a.type === 'add';
    return '<div class="bg-white border border-border rounded-lg p-3">' +
      '<div class="flex items-center justify-between">' +
        '<div>' +
          '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ' + (isAdd ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') + '">' + (isAdd ? '增项' : '减项') + '</span>' +
          '<span class="font-medium text-dark ml-2">' + a.name + '</span></div>' +
        '<div class="text-sm font-semibold ' + (isAdd ? 'text-green-600' : 'text-red-600') + '">' + (isAdd ? '+' : '-') + '¥' + a.amount + '</div>' +
      '</div>' +
      '<div class="text-sm text-text-secondary mt-1">' + (a.description || '-') + '</div></div>';
  }).join('');
}

window.renderRuleConfigDetail = renderRuleConfigDetail;
