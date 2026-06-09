// 费用数据查询服务
const FeeDataService = {
  // 根据费用组获取费用类型列表
  getFeeTypesByGroup(feeGroup) {
    if (feeGroup === '入库' && typeof inboundFeeRuleData !== 'undefined' && inboundFeeRuleData.categories) {
      return inboundFeeRuleData.categories.map(cat => {
        let unit = '-', price = 0;
        if (cat.children && cat.children.length > 0) {
          const firstOp = cat.children[0];
          if (firstOp.children && firstOp.children.length > 0) {
            const firstRule = firstOp.children[0];
            unit = firstRule.unit || '-';
            if (firstRule.pricingRules && firstRule.pricingRules.length > 0) {
              price = firstRule.pricingRules[0].price || 0;
            }
          }
        }
        return { id: cat.id, name: cat.name, unit, price };
      });
    }
    return [];
  },

  // 检测费用项是否为阶梯收费
  checkTierPricing(feeTypeId, feeGroup) {
    if (feeGroup !== '入库' || typeof inboundFeeRuleData === 'undefined') return null;
    const category = inboundFeeRuleData.categories.find(cat => cat.id === feeTypeId);
    if (!category) return null;
    for (const op of category.children || []) {
      for (const rule of op.children || []) {
        if (rule.tierPricing && rule.tierPricing.length > 0) return rule.tierPricing;
      }
    }
    return null;
  },

  // 获取费用类型名称和单位
  getFeeTypeInfo(feeType, feeGroup) {
    if (feeGroup === '入库' && typeof inboundFeeRuleData !== 'undefined' && inboundFeeRuleData.categories) {
      const cat = inboundFeeRuleData.categories.find(c => c.id === feeType);
      if (cat) {
        let unit = '-';
        if (cat.children && cat.children.length > 0 && cat.children[0].children) {
          unit = cat.children[0].children[0].unit || '-';
        }
        return { name: cat.name, unit };
      }
    }
    return { name: '', unit: '-' };
  }
};
