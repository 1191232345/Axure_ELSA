/**
 * 手工调价模块 - 工具函数和常量
 */

const ManualAdjustConstants = {
  MODULE_NAME: 'manual-adjustment',
  
  STORAGE_KEY: 'manualAdjustData',
  
  FEE_NAME_OPTIONS: [
    '超长费',
    '超重费',
    '燃油附加费',
    '偏远地区附加费',
    '仓储费',
    '其他费用'
  ],
  
  VALUE_ADDED_FEE_OPTIONS: [
    '退货入库',
    '商品上架',
    '仓储费',
    '产品销毁费',
    '拆托',
    '开箱费',
    '封箱费',
    '拍照服务',
    '丈量过磅',
    '打绷带',
    '纸箱费',
    '退货标签制作费',
    '检验/修理费',
    '其他增值服务',
    '异常订单处理'
  ],
  
  TAB_CONFIGS: {
    outbound: {
      label: '出库单号',
      placeholder: '输入出库单号查询（例如：HYNB-240126-0059）',
      exampleValue: 'HYNB-240126-0059',
      description: '出库单费用明细调整'
    },
    inbound: {
      label: '入库单号',
      placeholder: '输入入库单号查询（例如：INB-240126-0059）',
      exampleValue: 'INB-240126-0059',
      description: '入库费费用明细调整'
    },
    valueAdded: {
      label: '服务单号',
      placeholder: '输入服务单号查询（例如：VAS-240126-0059）',
      exampleValue: 'VAS-240126-0059',
      description: '增值服务费用明细调整'
    }
  }
};

const ManualAdjustUtils = {
  validateFeeData(fee) {
    const errors = [];
    
    if (!fee.name || fee.name.trim() === '') {
      errors.push('费用名称不能为空');
    }
    
    if (!fee.unit || fee.unit.trim() === '') {
      errors.push('计费单位不能为空');
    }
    
    if (fee.amount === null || fee.amount === undefined || fee.amount === '') {
      errors.push('原金额不能为空');
    } else if (isNaN(parseFloat(fee.amount)) || parseFloat(fee.amount) < 0) {
      errors.push('原金额必须为有效的正数');
    }
    
    if (fee.newAmount !== null && fee.newAmount !== undefined && fee.newAmount !== '') {
      if (isNaN(parseFloat(fee.newAmount)) || parseFloat(fee.newAmount) < 0) {
        errors.push('新金额必须为有效的正数');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  calculateTotalVolumeWeight(feeData) {
    let totalVolumeWeight = 0;
    let totalActualWeight = 0;
    let hasDimensions = false;
    const dimensionsList = [];
    
    feeData.forEach(fee => {
      if (fee.volumeWeight) {
        totalVolumeWeight += fee.volumeWeight;
      }
      if (fee.unit === 'KG') {
        totalActualWeight += fee.amount;
      }
      if (fee.dimensions) {
        hasDimensions = true;
        dimensionsList.push(fee.dimensions);
      }
    });
    
    return {
      dimensions: hasDimensions ? dimensionsList.join(', ') : '-',
      volumeWeight: totalVolumeWeight > 0 ? CommonUtils.formatNumber(totalVolumeWeight) : '-',
      chargeableWeight: Math.max(totalActualWeight, totalVolumeWeight) > 0 
        ? CommonUtils.formatNumber(Math.max(totalActualWeight, totalVolumeWeight)) 
        : '-'
    };
  },
  
  getDefaultFeeData() {
    return [
      {
        id: CommonUtils.generateId(),
        name: '超长费',
        unit: 'KG',
        amount: 255,
        newAmount: null,
        currency: 'USD',
        dimensions: '120x80x60',
        volumeWeight: 57.6,
        remark: '这是一段备注',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: CommonUtils.generateId(),
        name: '超重费',
        unit: '箱',
        amount: 250,
        newAmount: null,
        currency: 'USD',
        dimensions: '100x100x100',
        volumeWeight: 100.0,
        remark: '超出重量限制附加费',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  },
  
  getDefaultValueAddedFeeData() {
    return [
      {
        id: CommonUtils.generateId(),
        name: '退货入库',
        unit: '票',
        amount: 50,
        newAmount: null,
        currency: 'USD',
        customerName: 'ABC公司',
        instructionTime: '2024-01-26 10:30:00',
        completionTime: '2024-01-26 15:45:00',
        remark: '客户退货入库服务',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: CommonUtils.generateId(),
        name: '拍照服务',
        unit: '张',
        amount: 30,
        newAmount: null,
        currency: 'USD',
        customerName: 'ABC公司',
        instructionTime: '2024-01-26 11:00:00',
        completionTime: '2024-01-26 14:30:00',
        remark: '产品拍照服务',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ManualAdjustConstants, ManualAdjustUtils };
}