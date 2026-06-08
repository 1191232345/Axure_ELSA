/**
 * 费用类型树形数据 - 融合费用组枚举进行拼接（分类+一级+二级合并）
 * 被新增弹窗和编辑弹窗共用
 */
const feeItemTreeData = {
  '入库': [
    {
      level: 1,
      name: '卸货费（整柜）',
      value: 'level1_入库_卸货费（整柜）',
      config: { dimension: '柜型', unit: '/柜', formula: '费用 = 柜型单价 × 1', remark: '' },
      children: []
    },
    {
      level: 1,
      name: '附加费（整柜）',
      value: 'level1_入库_附加费（整柜）',
      children: [
        { level: 2, name: 'SKU超量费', value: 'level2_入库_附加费（整柜）_SKU超量费', config: { dimension: 'SKU', unit: '/个', formula: '费用 = 阶梯单价 × 超出SKU种类数', remark: '' } },
        { level: 2, name: '超重费', value: 'level2_入库_附加费（整柜）_超重费', config: { dimension: '重量（总重量）', unit: '/KG', formula: '费用 = 阶梯单价 × 超出重量', remark: '需下发指令，暂不涉及' } },
        { level: 2, name: '清点费', value: 'level2_入库_附加费（整柜）_清点费', config: { dimension: 'SKU', unit: '/件', formula: '费用 = 阶梯单价 × 件数', remark: '' } }
      ]
    },
    {
      level: 1,
      name: '卸货费（散货）',
      value: 'level1_入库_卸货费（散货）',
      config: { dimension: '托盘（总托数）', unit: '/托', formula: '费用 = 阶梯单价 × 托数', remark: '' },
      children: []
    },
    {
      level: 1,
      name: '附加费（散货）',
      value: 'level1_入库_附加费（散货）',
      children: [
        { level: 2, name: 'SKU超量费', value: 'level2_入库_附加费（散货）_SKU超量费', config: { dimension: 'SKU', unit: '/个', formula: '费用 = 阶梯单价 × 超出SKU种类数', remark: '' } },
        { level: 2, name: '超重费', value: 'level2_入库_附加费（散货）_超重费', config: { dimension: '重量（总重量）', unit: '/KG', formula: '费用 = 阶梯单价 × 超出重量', remark: '' } },
        { level: 2, name: '清点费', value: 'level2_入库_附加费（散货）_清点费', config: { dimension: '件（一箱多件）', unit: '/件', formula: '费用 = 阶梯单价 × 件数', remark: '针对1箱多件场景，暂不涉及' } },
        { level: 2, name: '分货费', value: 'level2_入库_附加费（散货）_分货费', config: { dimension: '箱数（混托箱数）', unit: '/箱', formula: '费用 = 阶梯单价 × 混托箱数', remark: '' } }
      ]
    }
  ],
  '出库': [
    {
      level: 1,
      name: '整柜出库卸货费',
      value: 'level1_出库_整柜出库卸货费',
      children: []
    },
    {
      level: 1,
      name: '整柜出库附加费',
      value: 'level1_出库_整柜出库附加费',
      children: [
        { level: 2, name: 'SKU超量费', value: 'level2_出库_整柜出库附加费_SKU超量费' },
        { level: 2, name: '超重费', value: 'level2_出库_整柜出库附加费_超重费' },
        { level: 2, name: '清点费', value: 'level2_出库_整柜出库附加费_清点费' },
        { level: 2, name: '分货费', value: 'level2_出库_整柜出库附加费_分货费' },
        { level: 2, name: '拍照费', value: 'level2_出库_整柜出库附加费_拍照费' },
        { level: 2, name: '换标费', value: 'level2_出库_整柜出库附加费_换标费' }
      ]
    },
    {
      level: 1,
      name: '快递散货出库卸货费',
      value: 'level1_出库_快递散货出库卸货费',
      children: []
    },
    {
      level: 1,
      name: '快递散货出库附加费',
      value: 'level1_出库_快递散货出库附加费',
      children: [
        { level: 2, name: 'SKU超量费', value: 'level2_出库_快递散货出库附加费_SKU超量费' },
        { level: 2, name: '超重费', value: 'level2_出库_快递散货出库附加费_超重费' },
        { level: 2, name: '清点费', value: 'level2_出库_快递散货出库附加费_清点费' },
        { level: 2, name: '分货费', value: 'level2_出库_快递散货出库附加费_分货费' },
        { level: 2, name: '拍照费', value: 'level2_出库_快递散货出库附加费_拍照费' },
        { level: 2, name: '换标费', value: 'level2_出库_快递散货出库附加费_换标费' }
      ]
    },
    {
      level: 1,
      name: '托盘出库卸货费',
      value: 'level1_出库_托盘出库卸货费',
      children: []
    },
    {
      level: 1,
      name: '托盘出库附加费',
      value: 'level1_出库_托盘出库附加费',
      children: [
        { level: 2, name: 'SKU超量费', value: 'level2_出库_托盘出库附加费_SKU超量费' },
        { level: 2, name: '超重费', value: 'level2_出库_托盘出库附加费_超重费' },
        { level: 2, name: '清点费', value: 'level2_出库_托盘出库附加费_清点费' },
        { level: 2, name: '分货费', value: 'level2_出库_托盘出库附加费_分货费' },
        { level: 2, name: '拆托费', value: 'level2_出库_托盘出库附加费_拆托费' },
        { level: 2, name: '拍照费', value: 'level2_出库_托盘出库附加费_拍照费' },
        { level: 2, name: '换标费', value: 'level2_出库_托盘出库附加费_换标费' }
      ]
    }
  ],
  '仓储': [
    {
      level: 1,
      name: '整柜仓储费',
      value: 'level1_仓储_整柜仓储费',
      children: []
    },
    {
      level: 1,
      name: '整柜仓储附加费',
      value: 'level1_仓储_整柜仓储附加费',
      children: [
        { level: 2, name: '超期费', value: 'level2_仓储_整柜仓储附加费_超期费' },
        { level: 2, name: '超面积费', value: 'level2_仓储_整柜仓储附加费_超面积费' },
        { level: 2, name: '温控费', value: 'level2_仓储_整柜仓储附加费_温控费' }
      ]
    },
    {
      level: 1,
      name: '快递散货仓储费',
      value: 'level1_仓储_快递散货仓储费',
      children: []
    },
    {
      level: 1,
      name: '快递散货仓储附加费',
      value: 'level1_仓储_快递散货仓储附加费',
      children: [
        { level: 2, name: '超期费', value: 'level2_仓储_快递散货仓储附加费_超期费' },
        { level: 2, name: '超面积费', value: 'level2_仓储_快递散货仓储附加费_超面积费' },
        { level: 2, name: '温控费', value: 'level2_仓储_快递散货仓储附加费_温控费' }
      ]
    },
    {
      level: 1,
      name: '托盘仓储费',
      value: 'level1_仓储_托盘仓储费',
      children: []
    },
    {
      level: 1,
      name: '托盘仓储附加费',
      value: 'level1_仓储_托盘仓储附加费',
      children: [
        { level: 2, name: '超期费', value: 'level2_仓储_托盘仓储附加费_超期费' },
        { level: 2, name: '超面积费', value: 'level2_仓储_托盘仓储附加费_超面积费' },
        { level: 2, name: '温控费', value: 'level2_仓储_托盘仓储附加费_温控费' }
      ]
    }
  ],
  '其他': [
    {
      level: 1,
      name: '服务费',
      value: 'level1_其他_服务费',
      children: []
    },
    {
      level: 1,
      name: '其他费用',
      value: 'level1_其他_其他费用',
      children: [
        { level: 2, name: '特殊操作费', value: 'level2_其他_其他费用_特殊操作费' },
        { level: 2, name: '代办费', value: 'level2_其他_其他费用_代办费' },
        { level: 2, name: '手续费', value: 'level2_其他_其他费用_手续费' }
      ]
    }
  ]
};

/**
 * 填充费用类型树形选择器
 * @param {HTMLSelectElement} selectEl - 目标select元素
 * @param {string} category - 费用组名称
 */
function populateFeeItemTree(selectEl, category) {
  selectEl.innerHTML = '<option value="">请选择费用类型</option>';

  if (!category) {
    selectEl.innerHTML = '<option value="">请先选择费用组</option>';
    return;
  }

  const treeItems = feeItemTreeData[category] || [];

  treeItems.forEach(item => {
    if (item.children && item.children.length > 0) {
      // 有二级项目：附加费 - SKU超量费 格式
      item.children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.value;
        option.textContent = `${item.name} - ${child.name}`;
        option.dataset.level = child.level;
        option.dataset.feeItemName = item.name;
        option.dataset.subItemName = child.name;
        if (child.config) {
          option.dataset.dimension = child.config.dimension;
          option.dataset.unit = child.config.unit;
          option.dataset.formula = child.config.formula;
          option.dataset.remark = child.config.remark || '';
        }
        selectEl.appendChild(option);
      });
    } else {
      // 无二级项目：直接展示
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.name;
      option.dataset.level = item.level;
      option.dataset.feeItemName = item.name;
      if (item.config) {
        option.dataset.dimension = item.config.dimension;
        option.dataset.unit = item.config.unit;
        option.dataset.formula = item.config.formula;
        option.dataset.remark = item.config.remark || '';
      }
      selectEl.appendChild(option);
    }
  });
}

/**
 * 根据value获取费用类型配置
 * @param {string} value - 费用类型的value值
 * @returns {Object|null} 配置对象或null
 */
function getFeeItemConfig(value) {
  if (!value) return null;

  for (const category in feeItemTreeData) {
    for (const item of feeItemTreeData[category]) {
      if (item.value === value && item.config) {
        return item.config;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.value === value && child.config) {
            return child.config;
          }
        }
      }
    }
  }
  return null;
}

/**
 * 根据value获取费用类型的显示名称（一级-二级格式）
 * @param {string} value - 费用类型的value值
 * @returns {string} 显示名称
 */
function getFeeItemDisplayName(value) {
  if (!value) return '';

  for (const category in feeItemTreeData) {
    for (const item of feeItemTreeData[category]) {
      if (item.value === value) {
        return item.name;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.value === value) {
            return `${item.name} - ${child.name}`;
          }
        }
      }
    }
  }
  return '';
}
