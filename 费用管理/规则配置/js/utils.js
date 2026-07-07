// utils.js - 通用工具函数
// 删除了与 api.js/test-data.js 重复的 CUSTOMERS_DATA/WAREHOUSES_DATA
// 合并了 deepCopy/deepClone 为单一 deepCopy
// 合并了重复的 label/getter 函数

const BUSINESS_TYPES = { inbound: '入库', outbound: '出库', transfer: '转仓', return: '退货' };
const DISCOUNT_TYPES = { none: '无折扣', percentage: '百分比折扣', fixed: '固定减免', fixed_price: '一口价' };
const STATUS_LABELS = { draft: '草稿', active: '生效', cancelled: '已作废' };
const STATUS_CLASSES = { draft: 'status-draft', active: 'status-active', cancelled: 'status-cancelled' };

// ---- 格式化 ----

function formatDateTime(str) {
  if (!str) return '-';
  try {
    var d = new Date(str);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
      + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0');
  } catch(e) { return str; }
}

function formatDate(str) {
  if (!str) return '-';
  try {
    var d = new Date(str);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  } catch(e) { return str; }
}

function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '¥0.00';
  return '¥' + parseFloat(amount).toFixed(2);
}

function formatDiscount(discount) {
  if (!discount || discount.type === 'none' || !discount.value) return '无折扣';
  if (discount.type === 'percentage') return discount.value + '%折扣';
  if (discount.type === 'fixed') return '减免' + formatCurrency(discount.value);
  if (discount.type === 'fixed_price') return '一口价' + formatCurrency(discount.value);
  return '无折扣';
}

// ---- 标签/徽章 ----

function getBusinessTypeText(t) { return BUSINESS_TYPES[t] || t; }
function getDiscountTypeLabel(t) { return DISCOUNT_TYPES[t] || t; }
function getStatusLabel(s) { return STATUS_LABELS[s] || s; }
function getStatusClass(s) { return STATUS_CLASSES[s] || ''; }

function getStatusBadge(status) {
  return '<span class="status-badge ' + (STATUS_CLASSES[status]||'') + '">' + (STATUS_LABELS[status]||status) + '</span>';
}

// ---- ID/时间 ----

function generateId(prefix) {
  prefix = prefix || 'id';
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCurrentDateTime() {
  var n = new Date();
  return n.getFullYear() + '-' + String(n.getMonth()+1).padStart(2,'0') + '-' + String(n.getDate()).padStart(2,'0')
    + ' ' + String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0') + ':' + String(n.getSeconds()).padStart(2,'0');
}

// ---- 深拷贝（合并 deepCopy + deepClone） ----

function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(function(item) { return deepCopy(item); });
  if (typeof obj === 'object') {
    var cloned = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) cloned[key] = deepCopy(obj[key]);
    }
    return cloned;
  }
  return obj;
}

// ---- 日期处理 ----

function processDateTimeDefault(str, isEffective) {
  if (!str) return '';
  if (str.length === 10) return str + 'T' + (isEffective !== false ? '00:00' : '23:59');
  return str;
}

function isValidEffectiveTime(start, end) {
  if (!start) return false;
  var s = parseDateTime(normalizeEffectiveStart(start));
  var now = new Date();
  if (end) {
    var e = parseDateTime(normalizeEffectiveEnd(end));
    return s <= now && now <= e;
  }
  return s <= now;
}

// ---- 验证 ----

function validateDiscountConfig(cfg) {
  if (!cfg) return false;
  if (cfg.global_discount) {
    var t = cfg.global_discount.type, v = cfg.global_discount.value;
    if (!t || !v) return false;
    if (t === 'percentage' && (v < 0 || v > 100)) return false;
  }
  if (cfg.item_discounts && Array.isArray(cfg.item_discounts)) {
    for (var i = 0; i < cfg.item_discounts.length; i++) {
      var item = cfg.item_discounts[i];
      if (!item.price_code || !item.type || !item.value) return false;
    }
  }
  return true;
}

// ---- 优先级 ----

function calculatePriority(cid, wid) {
  if (cid && wid) return 3;
  if (cid) return 2;
  if (wid) return 1;
  return 0;
}

// ---- Toast ----

function showToast(message, type) {
  type = type || 'success';
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(function() { t.classList.add('show'); }, 10);
  setTimeout(function() { t.classList.remove('show'); setTimeout(function() { document.body.removeChild(t); }, 300); }, 3000);
}

// ---- 防抖 ----

function debounce(func, wait) {
  var timeout;
  return function() {
    var args = arguments, later = function() { clearTimeout(timeout); func.apply(null, args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ---- 导出 ----

window.BUSINESS_TYPES = BUSINESS_TYPES;
window.DISCOUNT_TYPES = DISCOUNT_TYPES;
window.STATUS_LABELS = STATUS_LABELS;
window.STATUS_CLASSES = STATUS_CLASSES;
window.formatDateTime = formatDateTime;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.formatDiscount = formatDiscount;
window.getBusinessTypeText = getBusinessTypeText;
window.getDiscountTypeLabel = getDiscountTypeLabel;
window.getStatusLabel = getStatusLabel;
window.getStatusClass = getStatusClass;
window.getStatusBadge = getStatusBadge;
window.generateId = generateId;
window.getCurrentDateTime = getCurrentDateTime;
window.deepCopy = deepCopy;
window.processDateTimeDefault = processDateTimeDefault;
window.isValidEffectiveTime = isValidEffectiveTime;
window.validateDiscountConfig = validateDiscountConfig;
window.calculatePriority = calculatePriority;
window.showToast = showToast;
window.debounce = debounce;
