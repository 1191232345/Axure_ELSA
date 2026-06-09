// 折扣计算逻辑
const DiscountCalculator = {
  // 计算单一价格折扣
  calculateFinalPrice(originalPrice, discountType, discountValue) {
    if (discountType === 'none' || !discountValue) return originalPrice;
    let finalPrice = originalPrice;
    switch (discountType) {
      case 'percentage': finalPrice = originalPrice * (1 - discountValue / 100); break;
      case 'fixed': finalPrice = originalPrice - discountValue; break;
      case 'fixed_price': finalPrice = discountValue; break;
    }
    return Math.max(0, finalPrice);
  },

  // 计算阶梯价格折扣
  calculateTierFinalPrice(tierPrice, discountType, discountValue) {
    return this.calculateFinalPrice(tierPrice, discountType, discountValue);
  },

  // 折扣类型文本映射
  DISCOUNT_TYPE_TEXT: {
    'none': '无折扣', 'percentage': '折扣率', 'fixed': '增减', 'fixed_price': '一口价'
  },

  // 格式化折扣值显示
  formatDiscountValue(discountType, discountValue) {
    if (discountType === 'none') return '-';
    return discountType === 'percentage' ? `${discountValue}%` : `$${discountValue}`;
  },

  // 格式化价格显示
  formatPrice(price) {
    if (!price && price !== 0) return '-';
    return `$${price.toFixed(2)}`;
  },

  // 验证折扣配置
  validateConfig(discountType, discountValue) {
    if (discountType === 'none') return { valid: true };
    if (discountType !== 'none' && (!discountValue || discountValue <= 0)) {
      return { valid: false, message: '请输入有效的折扣值' };
    }
    if (discountType === 'percentage' && discountValue > 100) {
      return { valid: false, message: '折扣率不能超过100%' };
    }
    if (discountType === 'fixed_price' && discountValue < 0) {
      return { valid: false, message: '一口价不能为负数' };
    }
    return { valid: true };
  }
};
