/**
 * 快递费规则 - 工具函数库
 */

// 格式化日期时间
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化金额
function formatMoney(amount) {
  if (!amount || isNaN(amount)) return '0.00';
  return Number(amount).toFixed(2);
}

// 格式化重量
function formatWeight(weight) {
  if (!weight || isNaN(weight)) return '-';
  return Number(weight).toFixed(2);
}

// Tab切换
function switchMainTab(tabName) {
  const tabs = ['prototype', 'prd', 'testcases'];
  tabs.forEach(tab => {
    const tabBtn = document.getElementById(`tab-${tab}`);
    const mainContent = document.getElementById(`main-${tab}`);
    if (tab === tabName) {
      tabBtn.classList.add('active');
      mainContent.classList.add('active');
    } else {
      tabBtn.classList.remove('active');
      mainContent.classList.remove('active');
    }
  });
}

// 打开逻辑说明弹窗
function openLogicModal() {
  document.getElementById('logic-modal').classList.remove('hidden');
}

// 关闭逻辑说明弹窗
function closeLogicModal() {
  document.getElementById('logic-modal').classList.add('hidden');
}

// 打开新增弹窗
function openCarrierModal() {
  document.getElementById('carrier-modal').classList.remove('hidden');
  document.getElementById('carrierForm').reset();
}

// 关闭新增弹窗
function closeCarrierModal() {
  document.getElementById('carrier-modal').classList.add('hidden');
}

// 打开新增重量段弹窗
function openWeightTierModal() {
  document.getElementById('weight-tier-modal').classList.remove('hidden');
  document.getElementById('weightTierForm').reset();
  // 更新承运商下拉列表
  updateCarrierSelect('tierCarrier');
}

// 关闭新增重量段弹窗
function closeWeightTierModal() {
  document.getElementById('weight-tier-modal').classList.add('hidden');
}

// 更新承运商下拉列表
function updateCarrierSelect(selectId) {
  const select = document.getElementById(selectId);
  if (!select || !window.carrierData) return;
  
  select.innerHTML = '<option value="">请选择承运商</option>';
  window.carrierData.forEach(carrier => {
    const option = document.createElement('option');
    option.value = carrier.id;
    option.textContent = `${carrier.name} (${carrier.code})`;
    select.appendChild(option);
  });
}

// 显示提示消息
function showMessage(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
    'bg-blue-100 text-blue-800 border border-blue-300'
  }`;
  alertDiv.innerHTML = `
    <div class="flex items-center">
      <i class="fa ${
        type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
        'fa-info-circle'
      } mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 获取当前用户名
function getCurrentUser() {
  return '管理员';
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}