/**
 * 费用调整公共模块 - 工具函数和常量
 */

const CommonConstants = {
  CURRENCY_OPTIONS: ['USD', 'CNY', 'EUR', 'GBP'],
  
  UNIT_OPTIONS: ['KG', '箱', '件', '票'],
  
  TAB_TYPES: {
    OUTBOUND: 'outbound',
    STORAGE: 'storage',
    INBOUND: 'inbound'
  },
  
  STATUS_TYPES: {
    SUCCESS: 'success',
    PROCESSING: 'processing',
    FAILED: 'failed'
  },
  
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  ALLOWED_FILE_TYPES: ['.xlsx', '.xls', '.csv'],
  
  PAGE_SIZE: 10
};

const CommonUtils = {
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  formatCurrency(amount, currency = 'USD') {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  },
  
  formatNumber(num, decimals = 2) {
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },
  
  formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },
  
  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  
  validateFileType(fileName) {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return CommonConstants.ALLOWED_FILE_TYPES.includes(ext);
  },
  
  validateFileSize(fileSize) {
    return fileSize <= CommonConstants.MAX_FILE_SIZE;
  },
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },
  
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  },
  
  parseDimensions(dimensionsStr) {
    if (!dimensionsStr) return null;
    const parts = dimensionsStr.split(/[x×]/).map(p => parseFloat(p.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) {
      return null;
    }
    return {
      length: parts[0],
      width: parts[1],
      height: parts[2]
    };
  },
  
  calculateVolumeWeight(dimensions) {
    if (!dimensions) return 0;
    return (dimensions.length * dimensions.width * dimensions.height) / 5000;
  }
};

const ToastManager = {
  show(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    if (!toast || !toastMessage || !toastIcon) return;
    
    const iconMap = {
      success: 'fa-check-circle text-success',
      error: 'fa-times-circle text-danger',
      warning: 'fa-exclamation-circle text-warning',
      info: 'fa-info-circle text-primary'
    };
    
    const bgColorMap = {
      success: 'bg-green-50 border border-green-200',
      error: 'bg-red-50 border border-red-200',
      warning: 'bg-orange-50 border border-orange-200',
      info: 'bg-blue-50 border border-blue-200'
    };
    
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 flex items-center ${bgColorMap[type]}`;
    toastIcon.className = `mr-2 text-xl ${iconMap[type]}`;
    toastMessage.textContent = message;
    
    toast.classList.remove('translate-x-full');
    
    setTimeout(() => {
      toast.classList.add('translate-x-full');
    }, 3000);
  }
};

const LoadingManager = {
  show(message = '加载中...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
      if (loadingText) loadingText.textContent = message;
    }
  },
  
  hide() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CommonConstants,
    CommonUtils,
    ToastManager,
    LoadingManager
  };
}