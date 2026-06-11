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

    // 增值服务类型查询
    if (feeGroup === '增值服务' && typeof valueAddedServiceData !== 'undefined' && valueAddedServiceData.categories) {
      return valueAddedServiceData.categories.map(cat => {
        let unit = '-', price = 0;
        let hasTierPricing = false;
        if (cat.children && cat.children.length > 0) {
          const firstOp = cat.children[0];
          if (firstOp.children && firstOp.children.length > 0) {
            const firstRule = firstOp.children[0];
            unit = firstRule.unit || '-';
            // 检查是否有阶梯定价
            if (firstRule.tierPricing && firstRule.tierPricing.length > 0) {
              price = firstRule.tierPricing[0].price || 0;
              hasTierPricing = true;
            }
          }
        }
        return { id: cat.id, name: cat.name, unit, price, hasTierPricing };
      });
    }

    return [];
  },

  // 检测费用项是否为阶梯收费
  checkTierPricing(feeTypeId, feeGroup) {
    // 入库费规则阶梯检测
    if (feeGroup === '入库' && typeof inboundFeeRuleData !== 'undefined') {
      const category = inboundFeeRuleData.categories.find(cat => cat.id === feeTypeId);
      if (!category) return null;
      for (const op of category.children || []) {
        for (const rule of op.children || []) {
          if (rule.tierPricing && rule.tierPricing.length > 0) return rule.tierPricing;
        }
      }
      return null;
    }

    // 增值服务阶梯检测
    if (feeGroup === '增值服务' && typeof valueAddedServiceData !== 'undefined') {
      const category = valueAddedServiceData.categories.find(cat => cat.id === feeTypeId);
      if (!category) return null;
      for (const op of category.children || []) {
        for (const rule of op.children || []) {
          if (rule.tierPricing && rule.tierPricing.length > 0) return rule.tierPricing;
        }
      }
      return null;
    }

    return null;
  },

  // 获取费用类型名称和单位
  getFeeTypeInfo(feeType, feeGroup) {
    // 入库费信息
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

    // 增值服务信息
    if (feeGroup === '增值服务' && typeof valueAddedServiceData !== 'undefined' && valueAddedServiceData.categories) {
      const cat = valueAddedServiceData.categories.find(c => c.id === feeType);
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
