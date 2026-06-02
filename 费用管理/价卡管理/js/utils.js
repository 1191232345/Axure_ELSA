const CUSTOMERS_DATA = [
  { id: 'cust_1', name: '华为技术有限公司' },
  { id: 'cust_2', name: '小米科技有限公司' },
  { id: 'cust_3', name: '阿里巴巴集团' },
  { id: 'cust_4', name: '腾讯科技' },
  { id: 'cust_5', name: '京东集团' },
  { id: 'cust_6', name: '字节跳动' },
  { id: 'cust_7', name: '美团点评' },
  { id: 'cust_8', name: '拼多多' }
];

const WAREHOUSES_DATA = [
  { id: 'wh_1', name: '深圳仓库' },
  { id: 'wh_2', name: '广州仓库' },
  { id: 'wh_3', name: '上海仓库' },
  { id: 'wh_4', name: '北京仓库' },
  { id: 'wh_5', name: '杭州仓库' },
  { id: 'wh_6', name: '成都仓库' },
  { id: 'wh_7', name: '武汉仓库' },
  { id: 'wh_8', name: '南京仓库' }
];

const DATA_VERSION = '7.0';

const FEE_TYPE_ENUMS = {
  'cat_1': '整柜入库',
  'cat_2': '快递散货入库',
  'cat_3': '托盘入库'
};

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

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <i class="fas fa-check-circle mr-2"></i>
    ${message}
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}