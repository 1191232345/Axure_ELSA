// 快递费用维护页面逻辑
let expressFeeItems = [];
let currentPackageId = null;
const EXPRESS_FEE_KEY = 'express';

document.addEventListener('DOMContentLoaded', function() {
  currentPackageId = FeeMaintenanceCommon.getPackageId();
  if (!currentPackageId) {
    alert('缺少价卡ID参数');
    window.location.href = 'index.html';
    return;
  }
  loadPackageData();
});

function getExpressFeeDataRef() {
  return { [EXPRESS_FEE_KEY]: expressFeeItems };
}

function getCarrierRecords() {
  if (typeof getAllCarriers === 'function') return getAllCarriers();
  return window.carrierData || [];
}

function isExpressRowConfigured(item) {
  return !!(item.channel && item.carrier && item.feeTypeName);
}

function loadPackageData() {
  const pkg = FeeMaintenanceCommon.loadPackage(currentPackageId);
  if (!pkg) return;

  FeeMaintenanceCommon.displayPackageName(pkg);

  expressFeeItems = pkg.feeItems.filter(item =>
    item.feeGroup === '快递' ||
    item.feeGroupName === '快递' ||
    item.feeGroup === '配送' ||
    item.feeGroupName === '配送'
  );

  renderExpressFeeTable();
}

function renderExpressFeeTable() {
  const tbody = document.getElementById('expressFeeTableBody');
  const emptyState = document.getElementById('emptyState');

  if (expressFeeItems.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tbody.innerHTML = expressFeeItems.map((item, index) => renderExpressFeeRow(item, index)).join('');
}

function getChannelOptions() {
  return [...new Set(getCarrierRecords().map(c => c.channel).filter(Boolean))];
}

function getCarrierOptions(channel) {
  if (!channel) return [];
  return [...new Set(
    getCarrierRecords().filter(c => c.channel === channel).map(c => c.name)
  )];
}

function getFeeTypeOptions(channel, carrier) {
  if (!channel || !carrier) return [];
  return getCarrierRecords()
    .filter(c => c.channel === channel && c.name === carrier)
    .map(c => c.chargeType);
}

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

function resolveUnitPrice(record) {
  if (record.chargeType === '基础价' && typeof getWeightTiersByCarrierId === 'function') {
    const tiers = getWeightTiersByCarrierId(record.id);
    if (tiers.length > 0) {
      const sorted = [...tiers].sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight));
      return parseFloat(sorted[0].zone2 || sorted[0].zone3 || 0) || 0;
    }
  }
  if (typeof getFeeItemsByCarrierId === 'function') {
    const fees = getFeeItemsByCarrierId(record.id, record.chargeType);
    if (fees.length > 0) return parseFloat(fees[0].price) || 0;
  }
  return 0;
}

function applyExpressFeeRule(item, channel, carrier, chargeType) {
  const record = getCarrierRecords().find(
    c => c.channel === channel && c.name === carrier && c.chargeType === chargeType
  );
  if (!record) return;

  item.channel = channel;
  item.carrier = carrier;
  item.feeType = record.id;
  item.feeTypeName = chargeType;
  item.carrierId = record.id;
  item.feeGroup = '快递';
  item.feeGroupName = '快递';
  item.unitPrice = resolveUnitPrice(record);
  item.discountType = 'none';
  item.discountValue = 0;
  item.expectedAmount = calculateExpectedAmount(item);
}

function renderExpressFeeRow(item, index) {
  const configured = isExpressRowConfigured(item);
  const discountText = FeeMaintenanceCommon.formatDiscountText(item);

  const channelCell = configured
    ? `<span class="text-sm font-medium">${item.channel}</span>`
    : `<select onchange="onChannelSelect(${index}, this.value)" class="form-input text-sm" style="min-width: 120px;">
         <option value="">请选择渠道</option>
         ${getChannelOptions().map(ch => `<option value="${ch}" ${item.channel === ch ? 'selected' : ''}>${ch}</option>`).join('')}
       </select>`;

  const carrierCell = configured
    ? `<span class="text-sm font-medium">${item.carrier}</span>`
    : item.channel
      ? `<select onchange="onCarrierSelect(${index}, this.value)" class="form-input text-sm" style="min-width: 120px;">
           <option value="">请选择承运商</option>
           ${getCarrierOptions(item.channel).map(name => `<option value="${name}" ${item.carrier === name ? 'selected' : ''}>${name}</option>`).join('')}
         </select>`
      : '<span class="text-sm text-text-muted">请先选择渠道</span>';

  const feeTypeCell = configured
    ? `<span class="text-sm font-medium">${item.feeTypeName}</span>`
    : item.channel && item.carrier
      ? `<select onchange="onFeeTypeSelect(${index}, this.value)" class="form-input text-sm" style="min-width: 120px;">
           <option value="">请选择费用类型</option>
           ${getFeeTypeOptions(item.channel, item.carrier).map(type => `<option value="${type}" ${item.feeTypeName === type ? 'selected' : ''}>${type}</option>`).join('')}
         </select>`
      : '<span class="text-sm text-text-muted">请先选择承运商</span>';

  const discountCell = configured
    ? `<span class="text-sm">${discountText}</span>`
    : '<span class="text-sm text-text-muted">-</span>';

  const operationCell = `
    <div class="flex items-center gap-2">
      ${configured ? `<button onclick="openExpressDiscountModal(${index})" class="btn btn-secondary btn-sm">
        <i class="fas fa-cog mr-1"></i>设置折扣
      </button>` : ''}
      <button onclick="deleteExpressFeeRow(${index})" class="text-danger hover:text-danger-light" title="删除">
        <i class="fas fa-trash"></i>
      </button>
    </div>`;

  return `<tr class="hover:bg-hover transition-colors${configured ? '' : ' bg-accent/5'}">
    <td class="px-4 py-3">${channelCell}</td>
    <td class="px-4 py-3">${carrierCell}</td>
    <td class="px-4 py-3">${feeTypeCell}</td>
    <td class="px-4 py-3">${discountCell}</td>
    <td class="px-4 py-3">
      <input type="text" value="${item.remark || ''}"
             onchange="updateExpressRemark(${index}, this.value)"
             class="form-input text-sm" placeholder="请填写备注">
    </td>
    <td class="px-4 py-3">${operationCell}</td>
  </tr>`;
}

function onChannelSelect(index, value) {
  const item = expressFeeItems[index];
  if (isExpressRowConfigured(item)) {
    renderExpressFeeTable();
    return;
  }
  item.channel = value;
  item.carrier = '';
  item.feeType = '';
  item.feeTypeName = '';
  renderExpressFeeTable();
}

function onCarrierSelect(index, value) {
  const item = expressFeeItems[index];
  if (isExpressRowConfigured(item)) {
    renderExpressFeeTable();
    return;
  }
  item.carrier = value;
  item.feeType = '';
  item.feeTypeName = '';
  renderExpressFeeTable();
}

function onFeeTypeSelect(index, value) {
  const item = expressFeeItems[index];
  if (isExpressRowConfigured(item)) {
    renderExpressFeeTable();
    return;
  }
  if (!value) return;
  applyExpressFeeRule(item, item.channel, item.carrier, value);
  renderExpressFeeTable();
}

function updateExpressRemark(index, value) {
  expressFeeItems[index].remark = value;
}

function addExpressFeeRow() {
  expressFeeItems.push({
    feeGroup: '快递',
    feeGroupName: '快递',
    channel: '',
    carrier: '',
    feeType: '',
    feeTypeName: '',
    unitPrice: 0,
    discountType: 'none',
    discountValue: 0,
    expectedAmount: 0,
    remark: ''
  });
  renderExpressFeeTable();
}

function deleteExpressFeeRow(index) {
  deleteFeeRowCommon(expressFeeItems, index, renderExpressFeeTable);
}

function openExpressDiscountModal(index) {
  DiscountModal.open(EXPRESS_FEE_KEY, index, getExpressFeeDataRef());
}

function saveExpressDiscount() {
  DiscountModal.save(getExpressFeeDataRef(), () => {
    const index = parseInt(document.getElementById('discountEditIndex').value, 10);
    const item = expressFeeItems[index];
    item.expectedAmount = calculateExpectedAmount(item);
    renderExpressFeeTable();
  });
}

function validateExpressFeeItems() {
  const incomplete = expressFeeItems.filter(item => !isExpressRowConfigured(item));
  if (incomplete.length > 0) {
    alert('存在未完成配置的费用项，请先选择渠道、承运商和费用类型');
    return false;
  }
  return true;
}

function saveExpressFees() {
  if (!validateExpressFeeItems()) return;
  const feeGroupNames = ['快递', '配送'];
  saveFeesCommon(currentPackageId, expressFeeItems, feeGroupNames, '快递费用保存成功！');
}
