/**
 * 费用调整主页面 - 工具函数和常量
 */

const MainConstants = {
  MODULE_NAME: 'main-page',
  
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
    ],
    
    VALUE_ADDED: [
      { key: 'operateTime', label: '操作时间' },
      { key: 'operator', label: '操作人' },
      { key: 'warehouse', label: '仓库代码' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'orderNo', label: '订单号' },
      { key: 'serviceType', label: '服务类型' },
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
    },
    valueAdded: {
      label: '增值服务',
      description: '增值服务未出账订单管理'
    }
  },
  
  MAX_BATCH_COUNT: 50000,
  
  STATUS_TEXT: {
    success: '成功',
    processing: '重计中',
    failed: '失败'
  }
};

const MainUtils = {
  getTableHeaders(tabType) {
    switch (tabType) {
      case CommonConstants.TAB_TYPES.STORAGE:
        return MainConstants.TABLE_HEADERS.STORAGE;
      case CommonConstants.TAB_TYPES.INBOUND:
        return MainConstants.TABLE_HEADERS.INBOUND;
      case CommonConstants.TAB_TYPES.VALUE_ADDED:
        return MainConstants.TABLE_HEADERS.VALUE_ADDED;
      default:
        return MainConstants.TABLE_HEADERS.OUTBOUND;
    }
  },
  
  generateMockData(count, tabType) {
    const data = [];
    const warehouses = ['DE001', 'DE002', 'DE003'];
    const customers = ['DEMO - demo', 'TEST - test', 'PROD - prod'];
    const channels = ['FEDEX_MPS', 'FEDEX_HOME_GROUND', 'ZYBQ'];
    const serviceTypes = ['退货入库', '商品上架', '拍照服务', '丈量过磅', '检验/修理费', '其他增值服务'];
    
    const billTypeLabel = this.getBillTypeLabel(tabType);
    
    for (let i = 1; i <= count; i++) {
      const item = {
        id: CommonUtils.generateId(),
        orderTime: this.generateRandomDate(),
        billType: billTypeLabel,
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        customerCode: customers[Math.floor(Math.random() * customers.length)],
        orderNo: 'ORD' + String(Date.now()).slice(-8) + String(i).padStart(4, '0'),
        amount: (Math.random() * 10000 + 500).toFixed(2),
        currency: 'USD'
      };
      
      // 根据Tab类型添加特定字段
      if (tabType === CommonConstants.TAB_TYPES.OUTBOUND) {
        item.logisticsProduct = channels[Math.floor(Math.random() * channels.length)];
      } else if (tabType === CommonConstants.TAB_TYPES.VALUE_ADDED) {
        item.serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      }
      
      data.push(item);
    }
    
    return data;
  },
  
  generateMockRecalculateData(count, tabType) {
    const data = [];
    const statuses = ['success', 'processing', 'failed'];
    const warehouses = ['DE001', 'DE002', 'DE003'];
    const customers = ['DEMO', 'TEST', 'PROD'];
    const products = ['FEDEX_MPS', 'FEDEX_HOME_GROUND', 'ZYBQ', 'UPS_EXPRESS'];
    const serviceTypes = ['退货入库', '商品上架', '拍照服务', '丈量过磅', '检验/修理费', '其他增值服务'];
    const types = [this.getBillTypeLabel(tabType)];
    
    for (let i = 1; i <= count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const originalAmount = (Math.random() * 2000 + 200).toFixed(2);
      const recalculatedAmount = status === 'failed' 
        ? '-' 
        : (parseFloat(originalAmount) * (0.85 + Math.random() * 0.3)).toFixed(2);
      
      const item = {
        id: CommonUtils.generateId(),
        operateTime: this.generateRandomDate(),
        operator: '管理员',
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        customerCode: customers[Math.floor(Math.random() * customers.length)],
        orderNo: this.generateOrderNo(tabType, i),
        chargeType: types[Math.floor(Math.random() * types.length)],
        originalAmount: originalAmount,
        amount: recalculatedAmount,
        status: status,
        failReason: status === 'failed' ? this.getFailReason(tabType) : '-'
      };
      
      // 根据Tab类型添加特定字段
      if (tabType === CommonConstants.TAB_TYPES.OUTBOUND) {
        item.logisticsProduct = products[Math.floor(Math.random() * products.length)];
      } else if (tabType === CommonConstants.TAB_TYPES.VALUE_ADDED) {
        item.serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
      }
      
      data.push(item);
    }
    
    return data;
  },
  
  getBillTypeLabel(tabType) {
    switch (tabType) {
      case CommonConstants.TAB_TYPES.STORAGE:
        return '仓储费';
      case CommonConstants.TAB_TYPES.INBOUND:
        return '入库费';
      case CommonConstants.TAB_TYPES.VALUE_ADDED:
        return '增值服务';
      default:
        return '出库费';
    }
  },
  
  generateOrderNo(tabType, index) {
    const prefix = tabType === CommonConstants.TAB_TYPES.OUTBOUND ? 'OUT' 
      : tabType === CommonConstants.TAB_TYPES.STORAGE ? 'STR' 
      : tabType === CommonConstants.TAB_TYPES.VALUE_ADDED ? 'VAS' 
      : 'INB';
    return prefix + '-' + String(Date.now()).slice(-6) + String(index).padStart(3, '0');
  },
  
  getFailReason(tabType) {
    switch (tabType) {
      case CommonConstants.TAB_TYPES.STORAGE:
        return '库存数据不一致或计费规则未配置';
      case CommonConstants.TAB_TYPES.INBOUND:
        return '入库数据异常或计费规则未配置';
      case CommonConstants.TAB_TYPES.VALUE_ADDED:
        return '增值服务数据异常或计费规则未配置';
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
  },
  
  generateFeeDetailData(orderNo) {
    const feeItems = [
      '入库费',
      '卸货费',
      '清点费',
      '上架费',
      '标签费',
      '打包费',
      '其他费用'
    ];
    
    const data = [];
    const itemCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < itemCount; i++) {
      data.push({
        id: CommonUtils.generateId(),
        feeTime: this.generateRandomDate(),
        feeItem: feeItems[Math.floor(Math.random() * feeItems.length)],
        amount: (Math.random() * 500 + 50).toFixed(2),
        currency: 'USD'
      });
    }
    
    const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2);
    
    return {
      orderNo: orderNo,
      items: data,
      totalAmount: totalAmount,
      currency: 'USD'
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MainConstants, MainUtils };
}