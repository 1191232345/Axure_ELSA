/**
 * 快递费规则 - 主表初始化
 */

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  loadCarrierData();
  initEventListeners();
});

// 初始化事件监听
function initEventListeners() {
  const btnAddCarrier = document.getElementById('btnAddCarrier');
  if (btnAddCarrier) {
    btnAddCarrier.addEventListener('click', openCarrierModal);
  }
  
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', exportData);
  }
  
  const btnReset = document.getElementById('btnReset');
  if (btnReset) {
    btnReset.addEventListener('click', resetFilters);
  }
  
  const btnSearch = document.getElementById('btnSearch');
  if (btnSearch) {
    btnSearch.addEventListener('click', searchCarriers);
  }
}

// 更新统计信息
function updateStatistics(count) {
  const statisticsText = document.getElementById('statisticsText');
  if (statisticsText) {
    statisticsText.innerHTML = `共 <strong>${count}</strong> 个快递公司`;
  }
}

// 获取计费类型颜色
function getChargeTypeColor(chargeType) {
  if (chargeType === '基础价') return 'bg-blue-100 text-blue-800';
  if (chargeType === '附加费') return 'bg-green-100 text-green-800';
  if (chargeType === '其他') return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
}

// 保存快递公司
function saveCarrier() {
  const name = document.getElementById('carrierName').value.trim();
  const channel = document.getElementById('carrierChannel').value.trim();
  const chargeType = document.getElementById('carrierChargeType').value.trim();
  const remark = document.getElementById('carrierRemark').value.trim();
  
  if (!name || !channel || !chargeType) {
    showMessage('请填写快递公司、渠道和计费类型', 'error');
    return;
  }
  
  addCarrier({ name, channel, chargeType, remark });
  closeCarrierModal();
  loadCarrierData();
  showMessage('快递公司添加成功');
}