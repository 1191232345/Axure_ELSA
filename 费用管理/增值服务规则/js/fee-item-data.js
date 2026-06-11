/**
 * 费用类型树形数据 - 增值服务规则
 * 融合费用组枚举进行拼接（分类+一级+二级合并）
 * 被新增弹窗和编辑弹窗共用
 */
const feeItemTreeData = {
  '增值服务': [
    {
      level: 1,
      name: '退货入库',
      value: 'level1_增值服务_退货入库',
      config: { dimension: '毛重（KG）', unit: '/票', formula: '费用 = 阶梯单价 × 毛重', remark: '按毛重分档计费' },
      children: []
    },
    {
      level: 1,
      name: '商品上架',
      value: 'level1_增值服务_商品上架',
      config: { dimension: '件数', unit: '/件', formula: '费用 = 单价 × 件数', remark: '单件/箱货物做上架' },
      children: []
    },
    {
      level: 1,
      name: '仓储费',
      value: 'level1_增值服务_仓储费',
      children: [
        { level: 2, name: '未上架仓储', value: 'level2_增值服务_仓储费_未上架仓储', config: { dimension: '天数', unit: '/天', formula: '费用 = 日单价 × 存放天数', remark: '仅针对未完成上架操作的货物' } }
      ]
    },
    {
      level: 1,
      name: '产品销毁费',
      value: 'level1_增值服务_产品销毁费',
      config: { dimension: '重量（LB）', unit: '/次', formula: '费用 = 阶梯单价（按重量档位）', remark: '按重量分档收费' },
      children: []
    },
    {
      level: 1,
      name: '拆托',
      value: 'level1_增值服务_拆托',
      config: { dimension: '托数', unit: '/托', formula: '费用 = 单价 × 托数', remark: '货物以托盘入库，需要进行拆托' },
      children: []
    },
    {
      level: 1,
      name: '开箱费',
      value: 'level1_增值服务_开箱费',
      config: { dimension: '箱数', unit: '/箱', formula: '费用 = 单价 × 箱数', remark: '取出封箱条（胶带）打开箱子' },
      children: []
    },
    {
      level: 1,
      name: '封箱费',
      value: 'level1_增值服务_封箱费',
      children: [
        { level: 2, name: '重新封箱（不取出）', value: 'level2_增值服务_封箱费_重新封箱（不取出）', config: { dimension: '箱数', unit: '/箱', formula: '费用 = 单价 × 箱数', remark: '将包装重新封箱（期间货物不取出）' } },
        { level: 2, name: '取出+装箱+重新封箱', value: 'level2_增值服务_封箱费_取出+装箱+重新封箱', config: { dimension: '箱数', unit: '/箱', formula: '费用 = 单价 × 箱数', remark: '仅限一箱一件，一箱多件费用另确认' } }
      ]
    },
    {
      level: 1,
      name: '拍照服务',
      value: 'level1_增值服务_拍照服务',
      children: [
        { level: 2, name: '产品拍照（外箱）', value: 'level2_增值服务_拍照服务_产品拍照（外箱）', config: { dimension: '张数', unit: '/张', formula: '费用 = 单价 × 张数', remark: '产品外箱照片拍摄' } }
      ]
    },
    {
      level: 1,
      name: '丈量过磅',
      value: 'level1_增值服务_丈量过磅',
      config: { dimension: '次数', unit: '/次', formula: '费用 = 单价 × 次数', remark: '通过工具测量尺寸和称重' },
      children: []
    },
    {
      level: 1,
      name: '打绷带',
      value: 'level1_增值服务_打绷带',
      config: { dimension: '次数', unit: '/次', formula: '费用 = 人工费 + 材料费', remark: '人工费+材料费分开计算' },
      children: []
    },
    {
      level: 1,
      name: '纸箱费',
      value: 'level1_增值服务_纸箱费',
      config: { dimension: '个数', unit: '/个', formula: '费用 = 单价 × 个数', remark: '采购纸箱费' },
      children: []
    },
    {
      level: 1,
      name: '退货标签制作费',
      value: 'level1_增值服务_退货标签制作费',
      config: { dimension: '张数', unit: '/张', formula: '费用 = 单价 × 张数', remark: '我司客服人员制作退货标签' },
      children: []
    },
    {
      level: 1,
      name: '检验/修理费',
      value: 'level1_增值服务_检验/修理费',
      config: { dimension: '次数', unit: '/次', formula: 'TBD', remark: '待确定' },
      children: []
    },
    {
      level: 1,
      name: '其他增值服务',
      value: 'level1_增值服务_其他增值服务',
      children: [
        { level: 2, name: '人工费', value: 'level2_增值服务_其他增值服务_人工费', config: { dimension: '小时', unit: '/小时', formula: '费用 = 小时单价 × 工时', remark: '' } }
      ]
    },
    {
      level: 1,
      name: '异常订单处理',
      value: 'level1_增值服务_异常订单处理',
      children: [
        { level: 2, name: '快递售后服务', value: 'level2_增值服务_异常订单处理_快递售后服务', config: { dimension: '次数', unit: '/次', formula: '费用 = 单价 × 次数', remark: '快递售后服务处理' } }
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
      // 有二级项目
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
