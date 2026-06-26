// utils.js - 工具函数模块

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentDateTime() {
  var now = new Date();
  return now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0') + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0');
}

function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '$0.00';
  return '$' + parseFloat(amount).toFixed(2);
}

function showToast(message, type) {
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  var iconClass = '';
  if (type === 'success') {
    iconClass = 'fa fa-check-circle';
  } else if (type === 'error') {
    iconClass = 'fa fa-times-circle';
  } else if (type === 'warning') {
    iconClass = 'fa fa-exclamation-circle';
  } else {
    iconClass = 'fa fa-info-circle';
  }

  toast.innerHTML = '<i class="' + iconClass + '"></i><span>' + message + '</span>';
  document.body.appendChild(toast);

  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

function deepCopy(obj) {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

function getStatusText(status) {
  var statusMap = {
    'pending': '未处理',
    'processing': '处理中'
  };
  return statusMap[status] || status;
}

function getStatusBadgeClass(status) {
  var classMap = {
    'pending': 'bg-warning-light text-warning',
    'processing': 'bg-blue-50 text-blue-600'
  };
  return classMap[status] || 'bg-gray-100 text-gray-800';
}

function getServiceTypeText(serviceType) {
  var typeMap = {
    'photo': '拍照服务',
    'measure': '测量服务',
    'quality_check': '质检服务',
    'custom_pack': '定制包装',
    'label_service': '贴标服务',
    'return_handle': '退货处理'
  };
  return typeMap[serviceType] || serviceType;
}

function switchMainTab(tabName) {
  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.main-content').forEach(function(content) {
    content.classList.remove('active');
  });

  document.getElementById('tab-' + tabName).classList.add('active');
  document.getElementById('main-' + tabName).classList.add('active');
}

window.generateId = generateId;
window.getCurrentDateTime = getCurrentDateTime;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.showToast = showToast;
window.deepCopy = deepCopy;
window.getStatusText = getStatusText;
window.getStatusBadgeClass = getStatusBadgeClass;
window.getServiceTypeText = getServiceTypeText;
window.switchMainTab = switchMainTab;