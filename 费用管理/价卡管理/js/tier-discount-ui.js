// 阶梯折扣UI模块（精简版）
class TierDiscountUI {
  constructor() { this.currentMode = 'percentage'; }

  createTierDiscountContainer(feeItem) {
    const container = document.createElement('div');
    container.className = 'tier-discount-container';
    container.id = `tier-discount-${feeItem.feeId}`;
    container.innerHTML = `
      <div class="tier-discount-header"><div class="tier-discount-badge">引用 ${feeItem.originalTierPricing.length} 个阶梯</div></div>
      <div class="tier-discount-body">
        ${this.renderDiscountModeSelector()}
        ${this.renderDiscountConfigArea(feeItem)}
        ${this.renderPricePreview(feeItem)}
      </div>`;
    return container;
  }

  renderDiscountModeSelector() {
    return `<div class="discount-mode-selector">
      <label class="discount-mode-label"><i class="fas fa-cog"></i> 折扣模式</label>
      <div class="discount-mode-options">
        <label class="discount-mode-option"><input type="radio" name="discountMode" value="percentage" checked><span class="mode-label">折扣率</span><span class="mode-desc">按百分比折扣</span></label>
        <label class="discount-mode-option"><input type="radio" name="discountMode" value="fixed"><span class="mode-label">增减</span><span class="mode-desc">按金额增减</span></label>
        <label class="discount-mode-option"><input type="radio" name="discountMode" value="fixed_price"><span class="mode-label">一口价</span><span class="mode-desc">固定价格</span></label>
      </div></div>`;
  }

  renderDiscountConfigArea(feeItem) {
    return `<div class="discount-config-area" id="discountConfigArea">${this.renderOverallDiscountConfig(feeItem)}</div>`;
  }

  renderOverallDiscountConfig(feeItem) {
    return `<div class="overall-discount-config">
      <label class="config-label"><i class="fas fa-percent"></i> 整体折扣方式</label>
      <div class="discount-input-group">
        <input type="number" class="discount-input" id="overallDiscountValue" min="0" step="0.01" value="10"
               onchange="tierDiscountUI.updatePricePreview('${feeItem.feeId}')">
        <span class="discount-unit" id="discountUnit">%</span>
      </div>
      <div class="discount-tip">所有阶梯将统一应用此折扣方式</div></div>`;
  }

  renderPricePreview(feeItem) {
    const tiers = feeItem.originalTierPricing || [];
    if (!tiers.length) return `<div class="price-preview-area"><label class="preview-label"><i class="fas fa-chart-line"></i> 阶梯段价格预算</label><div class="preview-placeholder">暂无阶梯数据</div></div>`;

    const previewRows = tiers.map((tier, i) => {
      const range = tierDiscountLogic.formatTierDisplay(tier);
      const originalPrice = tierDiscountLogic.formatPriceDisplay(tier.price);
      const rangeLabel = this.formatRangeLabel(tier);
      return `<tr class="price-preview-row" data-tier-index="${i}">
        <td class="preview-tier-segment"><span class="tier-segment-badge">${rangeLabel}</span><span class="tier-segment-range">${range}</span></td>
        <td class="preview-original-price-cell">${originalPrice}</td>
        <td class="preview-discount-amount-cell" id="previewDiscount-${i}">-</td>
        <td class="preview-final-price-cell" id="previewPrice-${i}">-</td>
        <td class="preview-savings-cell" id="previewSavings-${i}">-</td></tr>`;
    }).join('');

    return `<div class="price-preview-area">
      <label class="preview-label"><i class="fas fa-chart-line"></i> 阶梯段价格预算</label>
      <div class="preview-summary-bar" id="previewSummaryBar">
        <div class="summary-item"><span class="summary-label">阶梯段数</span><span class="summary-value" id="summaryTierCount">${tiers.length}</span></div>
        <div class="summary-divider"></div>
        <div class="summary-item"><span class="summary-label">原价区间</span><span class="summary-value" id="summaryOriginalRange">${this.getOriginalPriceRange(tiers)}</span></div>
        <div class="summary-divider"></div>
        <div class="summary-item"><span class="summary-label">平均折扣</span><span class="summary-value summary-highlight" id="summaryAvgDiscount">-</span></div>
      </div>
      <table class="price-preview-table"><thead><tr><th>阶梯段</th><th>原价格</th><th>折扣金额</th><th>预计价格</th><th>节省金额</th></tr></thead>
      <tbody>${previewRows}</tbody></table>
      <div class="preview-budget-footer" id="previewBudgetFooter">
        <div class="budget-footer-item"><i class="fas fa-info-circle"></i><span>输入折扣值后实时计算各阶梯段的价格预算</span></div></div></div>`;
  }

  formatRangeLabel(tier) {
    const start = tier.start || 0, end = tier.end;
    if (end === null || end === Infinity || end >= 999999) return `${start}+`;
    return `第${start}-${end}段`;
  }

  getOriginalPriceRange(tiers) {
    if (!tiers || !tiers.length) return '-';
    const prices = tiers.map(t => t.price).filter(p => p !== undefined);
    if (!prices.length) return '-';
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }

  updatePricePreview(feeId) {
    const feeItem = window.currentFeeItem;
    if (!feeItem) return;
    const discountMode = document.querySelector('input[name="discountMode"]:checked').value;
    const discountValue = parseFloat(document.getElementById('overallDiscountValue').value) || 0;

    const unit = document.getElementById('discountUnit');
    if (unit) unit.textContent = discountMode === 'percentage' ? '%' : '$';

    let totalOrig = 0, totalFinal = 0;
    feeItem.originalTierPricing.forEach((tier, i) => {
      let finalPrice = 0, discountAmount = 0;
      if (discountMode === 'percentage') { finalPrice = tier.price * (1 - discountValue / 100); discountAmount = tier.price * discountValue / 100; }
      else if (discountMode === 'fixed') { finalPrice = tier.price + discountValue; discountAmount = Math.abs(discountValue); }
      else if (discountMode === 'fixed_price') { finalPrice = discountValue; discountAmount = Math.abs(tier.price - discountValue); }
      if (finalPrice < 0) finalPrice = 0;
      const savings = tier.price - finalPrice;
      totalOrig += tier.price; totalFinal += finalPrice;

      const pc = document.getElementById(`previewPrice-${i}`);
      if (pc) { pc.textContent = tierDiscountLogic.formatPriceDisplay(finalPrice); pc.className = 'preview-final-price-cell ' + (savings > 0 ? 'price-saved' : savings < 0 ? 'price-increased' : ''); }
      const dc = document.getElementById(`previewDiscount-${i}`);
      if (dc) { dc.textContent = discountMode === 'fixed_price' ? tierDiscountLogic.formatPriceDisplay(discountAmount) : discountMode === 'percentage' ? `${discountValue}%` : tierDiscountLogic.formatPriceDisplay(discountValue); }
      const sc = document.getElementById(`previewSavings-${i}`);
      if (sc) sc.innerHTML = savings > 0 ? `<span class="savings-positive">-$${savings.toFixed(2)}</span>` : savings < 0 ? `<span class="savings-negative">+$${Math.abs(savings).toFixed(2)}</span>` : '$0.00';
    });

    const avgEl = document.getElementById('summaryAvgDiscount');
    if (avgEl && totalOrig > 0) {
      const avg = ((totalOrig - totalFinal) / totalOrig * 100).toFixed(1);
      avgEl.textContent = `${avg}%`;
      avgEl.className = 'summary-value summary-highlight ' + (avg > 0 ? 'summary-saved' : avg < 0 ? 'summary-increased' : '');
    }

    const footerEl = document.getElementById('previewBudgetFooter');
    if (footerEl) {
      const ts = totalOrig - totalFinal;
      footerEl.innerHTML = `<div class="budget-footer-item"><i class="fas fa-calculator"></i>
        <span>预算汇总：原价合计 <strong>$${totalOrig.toFixed(2)}</strong>，折后合计 <strong>$${totalFinal.toFixed(2)}</strong>，
        ${ts > 0 ? `节省 <strong class="footer-saved">$${ts.toFixed(2)}</strong>` : ts < 0 ? `增加 <strong class="footer-increased">$${Math.abs(ts).toFixed(2)}</strong>` : '无变化'}</span></div>`;
    }
  }

  getDiscountConfig(feeId) {
    const discountMode = document.querySelector('input[name="discountMode"]:checked').value;
    const discountValue = parseFloat(document.getElementById('overallDiscountValue').value) || 0;
    return { mode: 'overall', discountType: discountMode, discountValue };
  }

  calculateFinalTierPricing(feeItem, discountConfig) {
    if (!feeItem.originalTierPricing || !discountConfig) return [];
    return feeItem.originalTierPricing.map(tier => {
      let finalPrice = 0;
      if (discountConfig.discountType === 'percentage') finalPrice = tier.price * (1 - discountConfig.discountValue / 100);
      else if (discountConfig.discountType === 'fixed') finalPrice = tier.price + discountConfig.discountValue;
      else if (discountConfig.discountType === 'fixed_price') finalPrice = discountConfig.discountValue;
      return { ...tier, finalPrice };
    });
  }

  updateFinalPreview(feeId) { this.updatePricePreview(feeId); }
  renderTierDiscountConfig(feeItem) { return this.renderOverallDiscountConfig(feeItem); }
  renderCustomTierConfig(feeItem) { return this.renderOverallDiscountConfig(feeItem); }
}

const tierDiscountUI = new TierDiscountUI();
