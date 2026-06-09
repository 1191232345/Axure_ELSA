// 标准折扣配置弹窗（价格预览必须展示价格阶梯）
const StandardDiscountModal = {
  show(rowId) {
    const row = AppState.feeRows.find(r => r.id === rowId);
    if (!row) return;

    const savedConfig = row.tierDiscountConfig || { discountType: 'none', discountValue: 0 };
    const originalPrice = row.unitPrice || 0;

    const overlay = document.createElement('div');
    overlay.className = 'tier-discount-modal-overlay';
    overlay.id = 'standardDiscountModal';
    overlay.dataset.rowId = rowId;
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };

    // 始终使用阶梯价格预览
    const pricePreviewHtml = this._buildTierPreview(row, savedConfig, originalPrice);

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:800px;width:90%;">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fas fa-cog"></i> 折扣配置</h3>
          <button class="modal-close" onclick="StandardDiscountModal.close()">×</button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <label class="form-label">折扣方式 <span class="text-danger">*</span></label>
            <select id="discountTypeSelect" class="form-input" onchange="StandardDiscountModal.onTypeChange()">
              <option value="none" ${savedConfig.discountType === 'none' ? 'selected' : ''}>无折扣</option>
              <option value="percentage" ${savedConfig.discountType === 'percentage' ? 'selected' : ''}>折扣率</option>
              <option value="fixed" ${savedConfig.discountType === 'fixed' ? 'selected' : ''}>增减</option>
              <option value="fixed_price" ${savedConfig.discountType === 'fixed_price' ? 'selected' : ''}>一口价</option>
            </select>
          </div>
          <div class="mb-4" id="discountValueContainer" style="display:${savedConfig.discountType === 'none' ? 'none' : 'block'};">
            <label class="form-label">折扣值 <span class="text-danger">*</span></label>
            <div class="flex items-center gap-2">
              <input type="number" id="discountValueInput" class="form-input flex-1"
                     value="${savedConfig.discountValue || 0}" min="0" step="0.01"
                     oninput="StandardDiscountModal.updatePreview()">
              <span id="discountUnitLabel" class="text-gray-600 font-medium">
                ${savedConfig.discountType === 'percentage' ? '%' : '$'}
              </span>
            </div>
          </div>
          ${pricePreviewHtml}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="StandardDiscountModal.close()">取消</button>
          <button class="btn btn-primary" onclick="StandardDiscountModal.save(${rowId})"><i class="fas fa-save"></i> 保存</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
  },

  close() {
    const modal = document.getElementById('standardDiscountModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  },

  onTypeChange() {
    const discountType = document.getElementById('discountTypeSelect').value;
    const container = document.getElementById('discountValueContainer');
    const unitLabel = document.getElementById('discountUnitLabel');
    container.style.display = discountType === 'none' ? 'none' : 'block';
    unitLabel.textContent = discountType === 'percentage' ? '%' : '$';
    this.updatePreview();
  },

  save(rowId) {
    const row = AppState.feeRows.find(r => r.id === rowId);
    if (!row) return;
    const discountType = document.getElementById('discountTypeSelect').value;
    const discountValue = parseFloat(document.getElementById('discountValueInput').value) || 0;
    const validation = DiscountCalculator.validateConfig(discountType, discountValue);
    if (!validation.valid) { alert(validation.message); return; }

    row.tierDiscountConfig = { discountType, discountValue: discountType === 'none' ? 0 : discountValue };
    row.discountType = discountType;
    row.discountValue = discountType === 'none' ? 0 : discountValue;

    // 规则配置模式：同步数据到规则配置的feeRows
    if (window._isRuleConfigMode && window._ruleConfigRowId) {
      const ruleRow = window.feeRows ? window.feeRows.find(r => r.id === window._ruleConfigRowId) : null;
      if (ruleRow) {
        ruleRow.discount_type = discountType;
        ruleRow.discount_value = discountType === 'none' ? 0 : discountValue;
      }
      this.close();
      if (typeof renderFeeTable === 'function') renderFeeTable();
    } else {
      this.close();
      FeeTable.render();
    }
    alert('折扣配置已保存');
  },

  updatePreview() {
    const discountType = document.getElementById('discountTypeSelect').value;
    const discountValue = parseFloat(document.getElementById('discountValueInput').value) || 0;
    // 始终使用阶梯价格预览更新
    this._updateTierPreview(discountType, discountValue);
  },

  // ---- 阶梯式价格预览（始终使用阶梯格式）----
  _buildTierPreview(row, savedConfig, originalPrice) {
    const tiers = row.originalTierPricing && row.originalTierPricing.length > 0
      ? row.originalTierPricing
      : [{ start: 1, end: null, price: originalPrice }]; // 无阶梯数据时将单一价格作为默认阶梯

    const tierRows = tiers.map((tier, i) => {
      const rangeEnd = tier.end === null || tier.end === Infinity ? '∞' : tier.end;
      const tierPrice = tier.price || 0;
      const finalPrice = DiscountCalculator.calculateFinalPrice(tierPrice, savedConfig.discountType, savedConfig.discountValue);
      return `<tr class="std-tier-preview-row" data-tier-index="${i}">
        <td class="std-tier-range">${tier.start}-${rangeEnd}</td>
        <td class="std-tier-original">$${tierPrice.toFixed(2)}</td>
        <td class="std-tier-discount" id="stdTierDiscount-${i}">${DiscountCalculator.formatDiscountValue(savedConfig.discountType, savedConfig.discountValue)}</td>
        <td class="std-tier-final" id="stdTierFinal-${i}">$${finalPrice.toFixed(2)}</td>
      </tr>`;
    }).join('');

    return `<div class="std-tier-preview-area">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <i class="fas fa-layer-group mr-2 text-primary"></i>价格预览
        <span class="std-tier-count-badge">${tiers.length}个阶梯</span>
      </h4>
      <table class="std-tier-preview-table"><thead><tr><th>阶梯段</th><th>原价格</th><th>折扣</th><th>折后价格</th></tr></thead>
      <tbody>${tierRows}</tbody></table></div>`;
  },

  _updateTierPreview(discountType, discountValue) {
    const modalEl = document.getElementById('standardDiscountModal');
    const rowId = modalEl ? parseInt(modalEl.dataset.rowId) : null;
    const row = rowId ? AppState.feeRows.find(r => r.id === rowId) : null;
    // 使用阶梯数据或默认单一价格作为阶梯
    const tiers = (row && row.originalTierPricing && row.originalTierPricing.length > 0)
      ? row.originalTierPricing
      : [{ start: 1, end: null, price: (row ? row.unitPrice : 0) }];

    tiers.forEach((tier, i) => {
      const tp = tier.price || 0;
      const fp = DiscountCalculator.calculateFinalPrice(tp, discountType, discountValue);

      const dc = document.getElementById(`stdTierDiscount-${i}`);
      if (dc) dc.textContent = DiscountCalculator.formatDiscountValue(discountType, discountValue);
      const fc = document.getElementById(`stdTierFinal-${i}`);
      if (fc) fc.textContent = `$${fp.toFixed(2)}`;
    });
  }
};
