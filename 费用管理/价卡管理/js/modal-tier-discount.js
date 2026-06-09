// 阶梯折扣配置弹窗
const TierDiscountModal = {
  show(rowId) {
    const row = AppState.feeRows.find(r => r.id === rowId);
    if (!row) return;

    window.currentFeeItem = {
      feeId: rowId.toString(),
      feeName: row.feeType || '',
      originalTierPricing: row.originalTierPricing,
      tierDiscountConfig: row.tierDiscountConfig
    };

    if (typeof tierDiscountUI === 'undefined') return;

    const overlay = document.createElement('div');
    overlay.className = 'tier-discount-modal-overlay';
    overlay.id = 'tierDiscountModal';
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };

    const container = tierDiscountUI.createTierDiscountContainer(window.currentFeeItem);

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:1200px;width:90%;">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fas fa-layer-group"></i> 阶梯折扣配置</h3>
          <button class="modal-close" onclick="TierDiscountModal.close()">×</button>
        </div>
        <div class="modal-body">${container.innerHTML}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="TierDiscountModal.close()">取消</button>
          <button class="btn btn-primary" onclick="TierDiscountModal.save(${rowId})"><i class="fas fa-save"></i> 保存</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.classList.add('active');
      this._restoreConfig(row);
    }, 10);

    // 绑定折扣模式切换
    overlay.querySelectorAll('input[name="discountMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => this._onModeChange(rowId, e.target.value));
    });
  },

  close() {
    const modal = document.getElementById('tierDiscountModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 300);
    }
  },

  save(rowId) {
    const row = AppState.feeRows.find(r => r.id === rowId);
    if (!row || typeof tierDiscountUI === 'undefined') return;

    const discountConfig = tierDiscountUI.getDiscountConfig(rowId.toString());
    if (typeof tierDiscountLogic !== 'undefined') {
      const validation = tierDiscountLogic.validateDiscountConfig(discountConfig);
      if (!validation.valid) { alert(validation.message); return; }
    }

    row.tierDiscountConfig = discountConfig;
    row.finalTierPricing = tierDiscountUI.calculateFinalTierPricing(
      { originalTierPricing: row.originalTierPricing }, discountConfig
    );
    this.close();
    FeeTable.render();
    alert('阶梯折扣配置已保存');
  },

  _restoreConfig(row) {
    if (!row.tierDiscountConfig) return;
    const overlay = document.getElementById('tierDiscountModal');
    if (!overlay) return;

    const radio = overlay.querySelector(`input[name="discountMode"][value="${row.tierDiscountConfig.discountType}"]`);
    if (radio) radio.checked = true;

    const input = overlay.querySelector('#overallDiscountValue');
    if (input && row.tierDiscountConfig.discountValue !== undefined) input.value = row.tierDiscountConfig.discountValue;

    const unit = overlay.querySelector('#discountUnit');
    if (unit) unit.textContent = row.tierDiscountConfig.discountType === 'percentage' ? '%' : '$';

    tierDiscountUI.updatePricePreview(row.id.toString());
  },

  _onModeChange(rowId, mode) {
    const unit = document.getElementById('discountUnit');
    if (unit) unit.textContent = (mode === 'percentage') ? '%' : '$';
    if (typeof tierDiscountUI !== 'undefined') tierDiscountUI.updatePricePreview(rowId.toString());
  }
};
