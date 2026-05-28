export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return '$' + parseFloat(amount).toFixed(2);
}

export function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function debounce(func, wait) {
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

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

export function getStatusClass(status) {
  const statusMap = {
    '待获取': 'bg-gray-100 text-gray-800',
    '处理中': 'bg-blue-100 text-blue-800',
    '已完成': 'bg-green-100 text-green-800',
    '失败': 'bg-red-100 text-red-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

export function validateForm(data, rules) {
  const errors = {};
  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && !value) {
      errors[field] = rule.message || `${field}是必填项`;
    }
    
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field}格式不正确`;
    }
    
    if (rule.validator && value) {
      const result = rule.validator(value);
      if (result !== true) {
        errors[field] = result;
      }
    }
  }
  return Object.keys(errors).length === 0 ? null : errors;
}

export function parseQueryParams(queryString) {
  const params = {};
  const searchParams = new URLSearchParams(queryString);
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
}

export function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  }
  return searchParams.toString();
}

export function safeGetElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id "${id}" not found`);
    return null;
  }
  return element;
}

export function safeSetValue(id, value) {
  const element = safeGetElement(id);
  if (element) {
    element.value = value;
  }
}

export function safeSetTextContent(id, text) {
  const element = safeGetElement(id);
  if (element) {
    element.textContent = text;
  }
}

export function safeSetInnerHTML(id, html) {
  const element = safeGetElement(id);
  if (element) {
    element.innerHTML = html;
  }
}

export function safeAddEventListener(id, event, handler) {
  const element = safeGetElement(id);
  if (element) {
    element.addEventListener(event, handler);
  }
}