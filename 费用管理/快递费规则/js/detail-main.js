/**
 * 快递费规则 - 详情页主入口
 */

// 当前快递公司ID
let currentCarrierId = '';

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  // 从URL参数获取快递公司ID
  const urlParams = new URLSearchParams(window.location.search);
  currentCarrierId = urlParams.get('carrierId') || '1';
  
  loadCarrierInfo();
  loadWeightTierData();
  initEventListeners();
});

// 初始化事件监听
function initEventListeners() {
  // 添加行按钮
  const btnAddRow = document.getElementById('btnAddRow');
  if (btnAddRow) {
    btnAddRow.addEventListener('click', addNewRow);
  }
  
  // 保存全部按钮
  const btnSaveAll = document.getElementById('btnSaveAll');
  if (btnSaveAll) {
    btnSaveAll.addEventListener('click', saveAllData);
  }
  
  // 导出按钮
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', exportData);
  }
}

// 获取计费类型颜色
function getChargeTypeColor(chargeType) {
  if (chargeType === '基础价') return 'bg-blue-100 text-blue-800';
  if (chargeType === '附加费') return 'bg-green-100 text-green-800';
  if (chargeType === '其他') return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
}

// 加载快递公司信息
function loadCarrierInfo() {
  const carrier = getCarrierById(currentCarrierId);
  if (!carrier) {
    showMessage('未找到快递公司信息', 'error');
    return;
  }
  
  const carrierInfoDiv = document.getElementById('carrierInfo');
  if (!carrierInfoDiv) return;
  
  const chargeTypeColor = getChargeTypeColor(carrier.chargeType);
  
  carrierInfoDiv.innerHTML = `
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-truck text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">快递公司</span>
      </div>
      <div class="text-base font-semibold text-dark">${carrier.name}</div>
    </div>
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-road text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">渠道</span>
      </div>
      <div class="text-base font-semibold text-dark">${carrier.channel || '-'}</div>
    </div>
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-tag text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">计费类型</span>
      </div>
      <div class="text-base font-semibold">
        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${chargeTypeColor}">
          ${carrier.chargeType || '-'}
        </span>
      </div>
    </div>
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-user text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">创建人</span>
      </div>
      <div class="text-base font-semibold text-dark">${carrier.creator || '管理员'}</div>
    </div>
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-calendar text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">创建时间</span>
      </div>
      <div class="text-base font-semibold text-dark">${formatDateTime(carrier.createTime)}</div>
    </div>
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-user-edit text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">更新人</span>
      </div>
      <div class="text-base font-semibold text-dark">${carrier.updater || '管理员'}</div>
    </div>
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-calendar-check text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">更新时间</span>
      </div>
      <div class="text-base font-semibold text-dark">${formatDateTime(carrier.updateTime)}</div>
    </div>
    <div class="bg-gray-50 rounded p-3 border border-gray-200">
      <div class="flex items-center mb-1">
        <i class="fa fa-comment text-primary mr-2 text-sm"></i>
        <span class="text-xs text-gray-500">备注</span>
      </div>
      <div class="text-base font-semibold text-dark">${carrier.remark || '-'}</div>
    </div>
  `;
  
  adjustTableByChargeType(carrier.chargeType);
}