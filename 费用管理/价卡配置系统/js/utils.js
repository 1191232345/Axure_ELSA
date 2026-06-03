const BUSINESS_TYPES = {
  'inbound': '入库',
  'outbound': '出库',
  'transfer': '转仓',
  'return': '退货'
};

const DISCOUNT_TYPES = {
  'none': '无折扣',
  'percentage': '百分比折扣',
  'fixed': '固定减免',
  'fixed_price': '一口价'
};

const STATUS_LABELS = {
  'draft': '草稿',
  'active': '生效',
  'cancelled': '已作废'
};

const STATUS_CLASSES = {
  'draft': 'status-draft',
  'active': 'status-active',
  'cancelled': 'status-cancelled'
};

const CUSTOMERS_DATA = [
  { id: 'cust_1', code: 'DEMO_C001', name: 'DEMO客户001' },
  { id: 'cust_2', code: 'DEMO_C002', name: 'DEMO客户002' },
  { id: 'cust_3', code: 'DEMO_C003', name: 'DEMO客户003' },
  { id: 'cust_4', code: 'DEMO_C004', name: 'DEMO客户004' },
  { id: 'cust_5', code: 'DEMO_C005', name: 'DEMO客户005' },
  { id: 'cust_6', code: 'DEMO_C006', name: 'DEMO客户006' },
  { id: 'cust_7', code: 'DEMO_C007', name: 'DEMO客户007' },
  { id: 'cust_8', code: 'DEMO_C008', name: 'DEMO客户008' }
];

const WAREHOUSES_DATA = [
  { id: 'wh_1', code: 'DEMO_W001', name: 'DEMO仓库001' },
  { id: 'wh_2', code: 'DEMO_W002', name: 'DEMO仓库002' },
  { id: 'wh_3', code: 'DEMO_W003', name: 'DEMO仓库003' },
  { id: 'wh_4', code: 'DEMO_W004', name: 'DEMO仓库004' },
  { id: 'wh_5', code: 'DEMO_W005', name: 'DEMO仓库005' },
  { id: 'wh_6', code: 'DEMO_W006', name: 'DEMO仓库006' },
  { id: 'wh_7', code: 'DEMO_W007', name: 'DEMO仓库007' },
  { id: 'wh_8', code: 'DEMO_W008', name: 'DEMO仓库008' }
];

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '-';
  
  try {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return dateTimeStr;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateStr;
  }
}

function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '¥0.00';
  return `¥${parseFloat(amount).toFixed(2)}`;
}

function formatDiscount(discount) {
  if (!discount || discount.type === 'none' || !discount.value) {
    return '无折扣';
  }
  
  if (discount.type === 'percentage') {
    return `${discount.value}%折扣`;
  } else if (discount.type === 'fixed') {
    return `减免${formatCurrency(discount.value)}`;
  } else if (discount.type === 'fixed_price') {
    return `一口价${formatCurrency(discount.value)}`;
  }
  
  return '无折扣';
}

function getBusinessTypeText(businessType) {
  return BUSINESS_TYPES[businessType] || businessType;
}

function getStatusBadge(status) {
  const label = STATUS_LABELS[status] || status;
  const className = STATUS_CLASSES[status] || '';
  
  return `<span class="status-badge ${className}">${label}</span>`;
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepCopy(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepCopy(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

function processDateTimeDefault(dateTimeStr, isEffective = true) {
  if (!dateTimeStr) return '';
  
  if (dateTimeStr.length === 10) {
    if (isEffective) {
      return `${dateTimeStr}T00:00`;
    } else {
      return `${dateTimeStr}T23:00`;
    }
  }
  
  return dateTimeStr;
}

function validateDiscountConfig(discountConfig) {
  if (!discountConfig) return false;
  
  if (discountConfig.global_discount) {
    const { type, value } = discountConfig.global_discount;
    if (!type || !value) return false;
    if (type === 'percentage' && (value < 0 || value > 100)) return false;
  }
  
  if (discountConfig.item_discounts && Array.isArray(discountConfig.item_discounts)) {
    for (const item of discountConfig.item_discounts) {
      if (!item.price_code || !item.type || !item.value) return false;
    }
  }
  
  return true;
}

function calculatePriority(customerId, warehouseId) {
  if (customerId && warehouseId) {
    return 3;
  } else if (customerId) {
    return 2;
  } else if (warehouseId) {
    return 1;
  } else {
    return 0;
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

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

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

function getBusinessTypeLabel(businessType) {
  return BUSINESS_TYPES[businessType] || businessType;
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

function getStatusClass(status) {
  return STATUS_CLASSES[status] || '';
}

function getDiscountTypeLabel(discountType) {
  return DISCOUNT_TYPES[discountType] || discountType;
}

function isValidEffectiveTime(effectiveStartTime, effectiveEndTime) {
  if (!effectiveStartTime) return false;
  
  const start = new Date(effectiveStartTime);
  const now = new Date();
  
  if (effectiveEndTime) {
    const end = new Date(effectiveEndTime);
    return start <= now && now <= end;
  }
  
  return start <= now;
}