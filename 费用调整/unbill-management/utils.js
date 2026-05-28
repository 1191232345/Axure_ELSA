/**
 * 未出账管理模块 - 工具函数和常量
 */

const UnbillConstants = {
  MODULE_NAME: 'unbill-management',
  
  STORAGE_KEY: 'unbillData',
  
  TABLE_HEADERS: {
    OUTBOUND: [
      { key: 'operateTime', label: '操作时间' },
      { key: 'operator', label: '操作人' },
      { key: 'warehouse', label: '仓库代码' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'orderNo', label: '订单号' },
      { key: 'logisticsProduct', label: '物流产品' },
      { key: 'chargeType', label: '计费类型' },
      { key: 'originalAmount', label: '原金额' },
      { key: 'amount', label: '重计金额' },
      { key: 'status', label: '状态' },
      { key: 'failReason', label: '失败原因' }
    ],
    
    STORAGE: [
      { key: 'operateTime', label: '操作时间' },
      { key: 'operator', label: '操作人' },
      { key: 'warehouse', label: '仓库代码' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'orderNo', label: '订单号' },
      { key: 'chargeType', label: '计费类型' },
      { key: 'originalAmount', label: '原金额' },
      { key: 'amount', label: '重计金额' },
      { key: 'status', label: '状态' },
      { key: 'failReason', label: '失败原因' }
    ],
    
    INBOUND: [
      { key: 'operateTime', label: '操作时间' },
      { key: 'operator', label: '操作人' },
      { key: 'warehouse', label: '仓库代码' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'orderNo', label: '订单号' },
      { key: 'chargeType', label: '计费类型' },
      { key: 'originalAmount', label: '原金额' },
      { key: 'amount', label: '重计金额' },
      { key: 'status', label: '状态' },
      { key: 'failReason', label: '失败原因' }
    ]
  },
  
  TAB_CONFIGS: {
    outbound: {
      label: '出库单',
      description: '出库单未出账订单管理'
    },
    storage: {
      label: '仓储费',
      description: '仓储费未出账订单管理'
    },
    inbound: {
      label: '入库费',
      description: '入库费未出账订单管理'
    }
  },
  
  MAX_BATCH_COUNT: 50000,
  
  STATUS_TEXT: {
    success: '成功',
    processing: '重计中',
    failed: '失败'
  }
};

const UnbillUtils = {
  getTableHeaders(tabType) {
    switch (tabType) {
      case CommonConstants.TAB_TYPES.STORAGE:
        return UnbillConstants.TABLE_HEADERS.STORAGE;
      case CommonConstants.TAB_TYPES.INBOUND:
        return UnbillConstants.TABLE_HEADERS.INBOUND;
      default:
        return UnbillConstants.TABLE_HEADERS.OUTBOUND;
    }
  },
  
  generateMockData(count, tabType) {
    const data = [];
    const warehouses = ['DE001', 'DE002', 'DE003'];
    const customers = ['DEMO - demo', 'TEST - test', 'PROD - prod'];
    const channels = ['FEDEX_MPS', 'FEDEX_HOME_GROUND', 'ZYBQ'];
    
    const billTypeLabel = this.getBillTypeLabel(tabType);
    
    for (let i = 1; i <= count; i++) {
      const logisticsProduct = tabType === CommonConstants.TAB_TYPES.OUTBOUND 
        ? channels[Math.floor(Math.random() * channels.length)] 
        : '';
      
      data.push({
        id: CommonUtils.generateId(),
        orderTime: this.generateRandomDate(),
        billType: billTypeLabel,
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        customerCode: customers[Math.floor(Math.random() * customers.length)],
        orderNo: 'ORD' + String(Date.now()).slice(-8) + String(i).padStart(4, '0'),
        logisticsProduct: logisticsProduct,
        amount: (Math.random() * 10000 + 500).toFixed(2),
        currency: 'USD'
      });
    }
    
    return data;
  },
  
  generateMockRecalculateData(count, tabType) {
    const data = [];
    const statuses = ['success', 'processing', 'failed'];
    const warehouses = ['DE001', 'DE002', 'DE003'];
    const customers = ['DEMO', 'TEST', 'PROD'];
    const products = ['FEDEX_MPS', 'FEDEX_HOME_GROUND', 'ZYBQ', 'UPS_EXPRESS'];
    const types = [this.getBillTypeLabel(tabType)];
    
    for (let i = 1; i <= count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const originalAmount = (Math.random() * 2000 + 200).toFixed(2);
      const recalculatedAmount = status === 'failed' 
        ? '-' 
        : (parseFloat(originalAmount) * (0.85 + Math.random() * 0.3)).toFixed(2);
      
      data.push({
        id: CommonUtils.generateId(),
        operateTime: this.generateRandomDate(),
        operator: '管理员',
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        customerCode: customers[Math.floor(Math.random() * customers.length)],
        orderNo: this.generateOrderNo(tabType, i),
        logisticsProduct: tabType === CommonConstants.TAB_TYPES.OUTBOUND 
          ? products[Math.floor(Math.random() * products.length)] 
          : '',
        chargeType: types[Math.floor(Math.random() * types.length)],
        originalAmount: originalAmount,
        amount: recalculatedAmount,
        status: status,
        failReason: status === 'failed' ? this.getFailReason(tabType) : '-'
      });
    }
    
    return data;
  },
  
  getBillTypeLabel(tabType) {
    switch (tabType) {
      case CommonConstants.TAB_TYPES.STORAGE:
        return '仓储费';
      case CommonConstants.TAB_TYPES.INBOUND:
        return '入库费';
      default:
        return '出库费';
    }
  },
  
  generateOrderNo(tabType, index) {
    const prefix = tabType === CommonConstants.TAB_TYPES.OUTBOUND ? 'OUT' 
      : tabType === CommonConstants.TAB_TYPES.STORAGE ? 'STR' 
      : 'INB';
    return prefix + '-' + String(Date.now()).slice(-6) + String(index).padStart(3, '0');
  },
  
  getFailReason(tabType) {
    switch (tabType) {
      case CommonConstants.TAB_TYPES.STORAGE:
        return '库存数据不一致或计费规则未配置';
      case CommonConstants.TAB_TYPES.INBOUND:
        return '入库数据异常或计费规则未配置';
      default:
        return '出库单状态异常或物流产品配置缺失';
    }
  },
  
  generateRandomDate() {
    const year = 2024;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
  },
  
  validateSearchParams(params) {
    if (params.orderNo && params.orderNo.length < 2) {
      ToastManager.show('订单号至少2个字符', 'warning');
      return false;
    }
    return true;
  },
  
  filterData(data, params) {
    return data.filter(row => {
      if (params.orderNo && !row.orderNo.toLowerCase().includes(params.orderNo.toLowerCase())) {
        return false;
      }
      if (params.customerCode && params.customerCode !== 'DEMO - demo' && row.customerCode !== params.customerCode) {
        return false;
      }
      if (params.warehouse && params.warehouse !== '请选择仓库' && row.warehouse !== params.warehouse) {
        return false;
      }
      if (params.channel && params.channel !== '请选择配送渠道' && row.logisticsProduct !== params.channel) {
        return false;
      }
      return true;
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UnbillConstants, UnbillUtils };
}