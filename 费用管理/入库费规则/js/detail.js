/**
 * 详情查看模块 - 原型扩展
 * 方法：viewDetail, showDetailModal, formatCalculationExample
 */

Object.assign(InboundFeeRuleEngine.prototype, {

  viewDetail(itemId) {
    const item = this.flatItems.find(i => i.id === itemId);
    if (!item) return;
    this.showDetailModal(item);
  },

  showDetailModal(item) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    let feeItemDisplay = '';
    if (item.subCategory) {
      feeItemDisplay = `${item.feeItem} - ${item.subCategory}`;
    } else {
      feeItemDisplay = item.feeItem;
    }

    // 获取费用类型配置（计费维度、公式等）
    let feeItemValue = '';
    if (item.subCategory) {
      feeItemValue = `level2_${item.categoryName}_${item.subCategory}`;
    } else {
      feeItemValue = `level1_${item.categoryName}_${item.feeItem}`;
    }
    const config = getFeeItemConfig(feeItemValue);

    // 计费维度：优先使用配置值
    const pricingDimension = config ? config.dimension : '';
    // 计费公式
    const formula = config ? config.formula : '';
    // 备注
    const remark = config && config.remark ? config.remark : '';

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:800px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-file-text-o" style="color:#E8A838;"></i>
            费用类型详情
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">费用组</label>
              <input type="text" class="form-input" value="${item.categoryName || ''}" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">费用类型</label>
              <input type="text" class="form-input" value="${feeItemDisplay}" disabled>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">计费单位</label>
              <input type="text" class="form-input" value="${config ? config.unit : (item.unit || '-') }" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">计费维度</label>
              <input type="text" class="form-input" value="${pricingDimension}" disabled style="background:#F9FAFB; color:#5A6275;">
            </div>
          </div>

          ${formula ? `
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">计费逻辑</label>
            <div style="background:#FFFBEB; padding:12px; border-radius:8px; border:1px solid #FDE68A; font-size:13px; color:#92400E;">
              ${formula}
            </div>
          </div>
          ` : ''}

          ${remark ? `
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">备注</label>
            <div style="background:#FEF2F2; padding:12px; border-radius:8px; border:1px solid #FECACA; font-size:13px; color:#C44536;">
              ${remark}
            </div>
          </div>
          ` : ''}

          ${item.pricingRules && item.pricingRules.length > 0 ? `
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">费率标准</label>
            <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden;">
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--color-surface);">
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">规格</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:25%;">价格（$）</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:35%;">备注</th>
                  </tr>
                </thead>
                <tbody>
                  ${item.pricingRules.map(pr => `
                  <tr>
                    <td style="padding:10px; border-bottom:1px solid var(--color-border-light);">${pr.spec}</td>
                    <td style="padding:10px; border-bottom:1px solid var(--color-border-light); color:#C44536; font-weight:600;">${pr.price}</td>
                    <td style="padding:10px; border-bottom:1px solid var(--color-border-light); color:#5A6275;">${pr.remark || '-'}</td>
                  </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}

          ${item.tierPricing && item.tierPricing.length > 0 ? `
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">阶梯价格</label>
            <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden;">
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--color-surface);">
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">开始量</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">结束量</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">价格（$）</th>
                  </tr>
                </thead>
                <tbody>
                  ${item.tierPricing.map(tp => `
                  <tr>
                    <td style="padding:10px; border-bottom:1px solid var(--color-border-light);">${tp.start}</td>
                    <td style="padding:10px; border-bottom:1px solid var(--color-border-light);">${tp.end >= 999999 ? '∞' : tp.end}</td>
                    <td style="padding:10px; border-bottom:1px solid var(--color-border-light); color:#C44536; font-weight:600;">${tp.price}</td>
                  </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}

          ${item.condition ? `
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">条件说明</label>
            <div style="background:#F9FAFB; padding:12px; border-radius:8px; border:1px solid var(--color-border);">${item.condition}</div>
          </div>
          ` : ''}

          ${item.calculationExample ? `
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">备注</label>
            <div style="background:#FFFBEB; padding:14px; border-radius:8px; border:1px solid #FDE68A; font-size:13px; line-height:1.7;">
              ${this.formatCalculationExample(item.calculationExample)}
            </div>
          </div>
          ` : ''}

          ${item.remark ? `
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">备注</label>
            <div style="background:#F9FAFB; padding:12px; border-radius:8px; border:1px solid var(--color-border);">${item.remark}</div>
          </div>
          ` : ''}
        </div>

        <div class="modal-footer">
          <button class="erp-btn erp-btn-secondary" onclick="this.closest('.modal-overlay').remove()">关闭</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  },

  formatCalculationExample(text) {
    if (!text) return '';

    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      line = line.trim();
      if (line.includes('：') || line.includes(':')) {
        const parts = line.split(/：|:/);
        if (parts.length >= 2) {
          return `<div style="margin-bottom:4px;">
                   <strong style="color:#1B3A4B;">${parts[0]}：</strong>
                   <span class="calc-example-formula">${parts.slice(1).join('：')}</span>
                 </div>`;
        }
      }
      return `<div style="margin-bottom:2px;">${line}</div>`;
    }).join('');
  }

});
