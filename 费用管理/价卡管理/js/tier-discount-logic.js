// 阶梯折扣逻辑模块（精简版）
class TierDiscountLogic {
  constructor() {
    this.discountModes = { overall: '整体折扣', tier: '阶梯折扣', custom: '自定义阶梯区间' };
  }

  calculateOverallDiscount(originalTierPricing, discountRate) {
    if (!originalTierPricing || !originalTierPricing.length) return [];
    return originalTierPricing.map(tier => ({
      start: tier.start, end: tier.end, originalPrice: tier.price,
      discountRate, finalPrice: this.applyPercentageDiscount(tier.price, discountRate)
    }));
  }

  calculateTierDiscount(originalTierPricing, tierDiscounts) {
    if (!originalTierPricing || !originalTierPricing.length) return [];
    return originalTierPricing.map((tier, i) => ({
      start: tier.start, end: tier.end, originalPrice: tier.price,
      discountRate: tierDiscounts[i] || 0,
      finalPrice: this.applyPercentageDiscount(tier.price, tierDiscounts[i] || 0)
    }));
  }

  calculateCustomTierDiscount(originalTierPricing, customTiers) {
    if (!customTiers || !customTiers.length) return [];
    return customTiers.map(ct => ({
      start: ct.start, end: ct.end,
      originalPrice: this.matchOriginalPrice(originalTierPricing, ct.start, ct.end),
      discountRate: ct.discount,
      finalPrice: this.applyPercentageDiscount(this.matchOriginalPrice(originalTierPricing, ct.start, ct.end), ct.discount)
    }));
  }

  applyPercentageDiscount(originalPrice, discountRate) {
    if (!originalPrice || originalPrice === 0) return 0;
    return originalPrice * (1 - discountRate / 100);
  }

  matchOriginalPrice(originalTierPricing, start, end) {
    if (!originalTierPricing || !originalTierPricing.length) return 0;
    for (const tier of originalTierPricing) {
      const ts = tier.start || 0, te = tier.end || Infinity;
      if (start >= ts && (end <= te || te === null)) return tier.price;
    }
    return originalTierPricing[originalTierPricing.length - 1].price;
  }

  validateDiscountConfig(discountConfig) {
    if (!discountConfig) return { valid: false, message: '折扣配置不能为空' };
    const { mode, discountType, discountValue } = discountConfig;

    if (mode === 'overall') {
      if (!discountType) return { valid: false, message: '折扣类型不能为空' };
      if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100))
        return { valid: false, message: '折扣率必须在0-100之间' };
      if (discountType === 'fixed_price' && discountValue < 0)
        return { valid: false, message: '一口价不能为负数' };
      return { valid: true };
    }

    // 兼容旧版验证
    const { overallDiscount, tierDiscounts, customTiers } = discountConfig;
    if (!mode || !this.discountModes[mode]) return { valid: false, message: '折扣模式无效' };
    if (mode === 'overall' && (!overallDiscount || overallDiscount < 0 || overallDiscount > 100))
      return { valid: false, message: '整体折扣率必须在0-100之间' };
    if (mode === 'tier' && (!tierDiscounts || !tierDiscounts.length))
      return { valid: false, message: '阶梯折扣配置不能为空' };
    if (mode === 'custom' && (!customTiers || !customTiers.length))
      return { valid: false, message: '自定义阶梯区间配置不能为空' };
    return { valid: true, message: '验证通过' };
  }

  formatTierDisplay(tier) {
    const endDisplay = tier.end === null || tier.end === Infinity ? '∞' : tier.end;
    return `${tier.start}-${endDisplay}`;
  }

  formatPriceDisplay(price) {
    if (!price || price === 0) return '-';
    return `$${price.toFixed(2)}`;
  }

  calculateTotalAmount(finalTierPricing, quantity) {
    if (!finalTierPricing || !finalTierPricing.length || !quantity) return 0;
    let total = 0, remaining = quantity;
    for (const tier of finalTierPricing) {
      if (remaining <= 0) break;
      const ts = tier.start || 0, te = tier.end === null ? Infinity : tier.end;
      const qty = Math.min(remaining, te - ts);
      if (qty > 0) { total += qty * tier.finalPrice; remaining -= qty; }
    }
    return total;
  }
}

window.tierDiscountLogic = new TierDiscountLogic();
