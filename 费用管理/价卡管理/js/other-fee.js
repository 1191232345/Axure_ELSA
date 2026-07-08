// 其他费用维护页面逻辑
let otherFeeItems = [];
let currentPackageId = null;

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

  // 加载其他费用项（过滤出非库内、非快递的费用）
  otherFeeItems = pkg.feeItems.filter(item =>
    item.feeGroup !== '入库' &&
    item.feeGroupName !== '入库' &&
    item.feeGroup !== '仓储' &&
    item.feeGroupName !== '仓储' &&
    item.feeGroup !== '快递' &&
    item.feeGroupName !== '快递' &&
    item.feeGroup !== '配送' &&
    item.feeGroupName !== '配送'
  );

  renderOtherFeeTable();
}

// 渲染费用项表格
function renderOtherFeeTable() {
  const tbody = document.getElementById('otherFeeTableBody');
  const emptyState = document.getElementById('emptyState');

  if (otherFeeItems.length === 0) {
    FeeMaintenanceCommon.renderEmptyState(tbody, emptyState, addOtherFeeRow);
    return;
  }

  emptyState.classList.add('hidden');

  tbody.innerHTML = otherFeeItems.map((item, index) => {
    const discountText = FeeMaintenanceCommon.formatDiscountText(item);

    return `<tr class="hover:bg-hover transition-colors">
      <td class="px-4 py-3 text-sm">${item.feeTypeName || '-'}</td>
      <td class="px-4 py-3 text-sm">${item.feeGroupName || '-'}</td>
      <td class="px-4 py-3 text-sm">${item.unit || '-'}</td>
      <td class="px-4 py-3 text-sm">${item.unitPrice ? item.unitPrice.toFixed(2) : '-'}</td>
      <td class="px-4 py-3 text-sm">${discountText}</td>
      <td class="px-4 py-3 text-sm font-semibold text-accent">${item.expectedAmount ? item.expectedAmount.toFixed(2) : '-'}</td>
      <td class="px-4 py-3 text-sm text-text-muted">${item.remark || '-'}</td>
      <td class="px-4 py-3">
        <button onclick="editOtherFeeRow(${index})" class="text-primary hover:text-primary-light mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteOtherFeeRow(${index})" class="text-danger hover:text-danger-light">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
}

// 新增费用项
function addOtherFeeRow() {
  addFeeRowCommon(otherFeeItems, '其他', '其他', renderOtherFeeTable);
}

// 编辑费用项
function editOtherFeeRow(index) {
  alert('编辑功能待实现');
}

// 删除费用项
function deleteOtherFeeRow(index) {
  deleteFeeRowCommon(otherFeeItems, index, renderOtherFeeTable);
}

// 保存其他费用
function saveOtherFees() {
  // 其他费用需要保留库内和快递费用
  DataService.loadPackages();
  const pkg = AppState.packages.find(p => p.id === currentPackageId);

  if (!pkg) {
    alert('价卡不存在');
    return;
  }

  // 保留库内和快递费用项
  const warehouseAndExpressFeeItems = pkg.feeItems.filter(item =>
    item.feeGroup === '入库' ||
    item.feeGroupName === '入库' ||
    item.feeGroup === '仓储' ||
    item.feeGroupName === '仓储' ||
    item.feeGroup === '快递' ||
    item.feeGroupName === '快递' ||
    item.feeGroup === '配送' ||
    item.feeGroupName === '配送'
  );

  pkg.feeItems = [...warehouseAndExpressFeeItems, ...otherFeeItems];
  pkg.updatedBy = '管理员';
  pkg.updatedAt = DataService.getCurrentTime();

  DataService.savePackages();

  alert('其他费用保存成功！');
  window.location.href = 'index.html';
}