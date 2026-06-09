// 费用表格渲染与操作
const FeeTable = {
  // 切换费用组 tab
  switchGroup(group, event) {
    if (event) event.preventDefault();
    AppState.currentFeeGroup = group;
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.group === group);
    });
    this.render();
  },

  // 新增费用行
  addRow() {
    const rowId = Date.now();
    const newRow = {
      id: rowId, feeGroup: AppState.currentFeeGroup, feeType: '',
      unitPrice: 0, discountType: 'unconfigured', discountValue: 0,
      remark: '', pricingType: 'standard', originalTierPricing: null, tierDiscountConfig: null
    };
    AppState.feeRows.push(newRow);
    const feeTypes = FeeDataService.getFeeTypesByGroup(AppState.currentFeeGroup);
    if (feeTypes.length > 0) {
      newRow.feeType = feeTypes[0].id;
      this._updateRow(rowId, 'feeType', feeTypes[0].id);
    } else {
      this.render();
    }
  },

  // 删除费用行
  removeRow(rowId) {
    AppState.feeRows = AppState.feeRows.filter(row => row.id !== rowId);
    this.render();
  },

  // 更新费用行字段
  updateRow(rowId, field, value) {
    this._updateRow(rowId, field, value);
  },

  _updateRow(rowId, field, value) {
    const row = AppState.feeRows.find(r => r.id === rowId);
    if (!row) return;
    row[field] = value;

    if (field === 'feeType') {
      const feeTypes = FeeDataService.getFeeTypesByGroup(row.feeGroup);
      const selectedType = feeTypes.find(t => t.id === value);
      if (selectedType) {
        row.unitPrice = selectedType.price || 0;
        const tierData = FeeDataService.checkTierPricing(value, row.feeGroup);
        if (tierData) {
          row.pricingType = 'tier'; row.originalTierPricing = tierData; row.discountType = 'tier_discount';
        } else {
          row.pricingType = 'standard'; row.originalTierPricing = null; row.discountType = 'none';
        }
      } else {
        row.unitPrice = 0; row.pricingType = 'standard'; row.originalTierPricing = null; row.discountType = 'none';
      }
    }

    if (field === 'discountType') {
      row.discountValue = 0; row.tierDiscountConfig = null;
    }

    this.render();
  },

  // 显示折扣配置弹窗（统一入口）
  showDiscountConfig(rowId) {
    const row = AppState.feeRows.find(r => r.id === rowId);
    if (!row) return;
    if (row.pricingType === 'tier' && row.originalTierPricing) {
      TierDiscountModal.show(rowId);
    } else {
      StandardDiscountModal.show(rowId);
    }
  },

  // 渲染费用表格
  render() {
    const tbody = document.getElementById('feeItemsTableBody');
    if (!tbody) return;

    const filteredRows = AppState.feeRows.filter(row => row.feeGroup === AppState.currentFeeGroup);

    if (filteredRows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-text-muted">
        <i class="fas fa-info-circle mr-2"></i>当前费用组暂无费用项，请点击"新增行"添加</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredRows.map(row => {
      const feeTypes = FeeDataService.getFeeTypesByGroup(row.feeGroup);
      const feeTypeOptions = feeTypes.map(t =>
        `<option value="${t.id}" ${row.feeType === t.id ? 'selected' : ''}>${t.name}</option>`
      ).join('');

      const discountHtml = this._renderDiscountBadge(row);

      return `<tr class="hover:bg-hover transition-colors">
        <td class="px-4 py-3"><select onchange="FeeTable.updateRow(${row.id}, 'feeType', this.value)" class="form-input text-sm">
          <option value="">请选择费用类型</option>${feeTypeOptions}</select></td>
        <td class="px-4 py-3">${discountHtml}</td>
        <td class="px-4 py-3"><input type="text" value="${row.remark || ''}" onchange="FeeTable.updateRow(${row.id}, 'remark', this.value)" class="form-input text-sm" placeholder="输入备注"></td>
        <td class="px-4 py-3"><div class="flex items-center gap-2">
          <button class="btn btn-secondary btn-sm mr-2" onclick="FeeTable.showDiscountConfig(${row.id})"><i class="fas fa-cog"></i> 配置</button>
          <button type="button" onclick="FeeTable.removeRow(${row.id})" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
        </div></td></tr>`;
    }).join('');
  },

  _renderDiscountBadge(row) {
    if (row.tierDiscountConfig && row.tierDiscountConfig.discountType) {
      const cfg = row.tierDiscountConfig;
      const text = DiscountCalculator.DISCOUNT_TYPE_TEXT[cfg.discountType];
      const val = cfg.discountValue || 0;
      const unit = cfg.discountType === 'percentage' ? '%' : '$';
      if (cfg.discountType === 'none') {
        return `<span class="badge badge-secondary"><i class="fas fa-check mr-1"></i>${text}</span>`;
      }
      return `<span class="badge badge-accent"><i class="fas fa-layer-group mr-1"></i>${text}: ${val}${unit}</span>`;
    }
    return `<span class="badge badge-warning"><i class="fas fa-exclamation-triangle mr-1"></i>未配置</span>`;
  }
};

// 全局函数兼容（HTML onclick 调用）
function switchFeeGroupTab(group, event) { FeeTable.switchGroup(group, event); }
function addFeeRow() { FeeTable.addRow(); }
function removeFeeRow(rowId) { FeeTable.removeRow(rowId); }
function updateFeeRow(rowId, field, value) { FeeTable.updateRow(rowId, field, value); }
function showDiscountConfig(rowId) { FeeTable.showDiscountConfig(rowId); }
