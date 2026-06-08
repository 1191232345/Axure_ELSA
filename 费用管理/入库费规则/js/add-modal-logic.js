/**
 * 新增弹窗 - 逻辑部分
 * 方法：addPricingRow, removePricingRow, addTierRow, removeTierRow, saveNewRule
 */

Object.assign(InboundFeeRuleEngine.prototype, {

  addPricingRow() {
    const category = document.getElementById('addCategory').value;
    const tbody = document.getElementById('pricingTableBody');
    const row = document.createElement('tr');

    let specOptions = '';
    if (category === '整柜入库') {
      specOptions = `
        <option value="20GP">20GP</option>
        <option value="40GP">40GP</option>
        <option value="40HC">40HC</option>
        <option value="45HC">45HC</option>
        <option value="20RF">20RF</option>
        <option value="40RF">40RF</option>
      `;
    } else if (category === '托盘入库') {
      specOptions = `
        <option value="标准托盘">标准托盘</option>
        <option value="欧标托盘">欧标托盘</option>
        <option value="美标托盘">美标托盘</option>
        <option value="定制托盘">定制托盘</option>
      `;
    }

    row.innerHTML = `
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <select class="form-input pricing-spec" style="width:100%;">
          ${specOptions}
        </select>
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <input type="number" class="form-input pricing-price" placeholder="如：350" step="0.01" style="width:100%;">
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <input type="text" class="form-input pricing-remark" placeholder="备注说明" style="width:100%;">
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light); text-align:center;">
        <button class="erp-btn erp-btn-danger" onclick="engine.removePricingRow(this)" style="padding:4px 8px; font-size:12px;">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  },

  removePricingRow(btn) {
    const row = btn.closest('tr');
    const tbody = document.getElementById('pricingTableBody');
    if (tbody.children.length > 1) {
      row.remove();
    } else {
      showToast('至少保留一条费率记录', 'warning');
    }
  },

  addTierRow() {
    const tbody = document.getElementById('tierPricingTableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <input type="number" class="form-input tier-start" placeholder="如：0" step="0.01" style="width:100%;">
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <input type="number" class="form-input tier-end" placeholder="如：100" step="0.01" style="width:100%;">
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <input type="number" class="form-input tier-price" placeholder="如：50" step="0.01" style="width:100%;">
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light); text-align:center;">
        <button class="erp-btn erp-btn-danger" onclick="engine.removeTierRow(this)" style="padding:4px 8px; font-size:12px;">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  },

  removeTierRow(btn) {
    const row = btn.closest('tr');
    const tbody = document.getElementById('tierPricingTableBody');
    if (tbody.children.length > 1) {
      row.remove();
    } else {
      showToast('至少保留一条阶梯记录', 'warning');
    }
  },

  saveNewRule() {
    const category = document.getElementById('addCategory').value;
    const selectedFeeItemValue = document.getElementById('addFeeItemTree').value;
    const unit = document.getElementById('addUnit').value;
    const remark = document.getElementById('addRemark').value;

    if (!category || !selectedFeeItemValue || !unit) {
      showToast('请填写必填项', 'error');
      return;
    }

    // 解析费用类型名称
    let feeItem = '';
    let subCategory = null;
    const parts = selectedFeeItemValue.split('_');

    if (selectedFeeItemValue.startsWith('level1_')) {
      feeItem = parts[2];
    } else if (selectedFeeItemValue.startsWith('level2_')) {
      feeItem = parts[2];
      subCategory = parts[3];
    }

    let pricingRules = [];
    let weightTiers = [];
    let condition = null;
    let calculationExample = null;
    let tierPricing = [];

    const pricingTableSection = document.getElementById('pricingTableSection');
    const tierPricingSection = document.getElementById('tierPricingSection');

    if (pricingTableSection && pricingTableSection.style.display !== 'none') {
      const pricingRows = document.querySelectorAll('#pricingTableBody tr');
      pricingRows.forEach(row => {
        const spec = row.querySelector('.pricing-spec')?.value;
        const price = row.querySelector('.pricing-price')?.value;
        const pricingRemark = row.querySelector('.pricing-remark')?.value;

        if (spec && price) {
          pricingRules.push({
            spec: spec.trim(),
            price: parseFloat(price.trim()),
            remark: pricingRemark ? pricingRemark.trim() : null
          });
        }
      });

      if (pricingRules.length === 0) {
        showToast('请至少添加一条费率记录', 'error');
        return;
      }
    } else if (tierPricingSection && tierPricingSection.style.display !== 'none') {
      const tierRows = document.querySelectorAll('#tierPricingTableBody tr');
      tierRows.forEach(row => {
        const start = row.querySelector('.tier-start')?.value;
        const end = row.querySelector('.tier-end')?.value;
        const price = row.querySelector('.tier-price')?.value;

        if (start && end && price) {
          tierPricing.push({
            start: parseFloat(start.trim()),
            end: parseFloat(end.trim()),
            price: parseFloat(price.trim())
          });
        }
      });

      if (tierPricing.length === 0) {
        showToast('请至少添加一条阶梯价格记录', 'error');
        return;
      }
    } else {
      const pricingRulesText = document.getElementById('addPricingRules')?.value;
      if (pricingRulesText && pricingRulesText.trim()) {
        const lines = pricingRulesText.trim().split('\n');
        lines.forEach(line => {
          const parts = line.split('|');
          if (parts.length >= 2) {
            pricingRules.push({
              spec: parts[0].trim(),
              price: parseFloat(parts[1].trim()),
              remark: parts[2] ? parts[2].trim() : null
            });
          }
        });
      }

      const weightTiersText = document.getElementById('addWeightTiers')?.value;
      if (weightTiersText && weightTiersText.trim()) {
        const lines = weightTiersText.trim().split('\n');
        lines.forEach(line => {
          const parts = line.split('|');
          if (parts.length >= 3) {
            weightTiers.push({
              range: parts[0].trim(),
              price: parseFloat(parts[1].trim()),
              unit: parts[2].trim()
            });
          }
        });
      }

      condition = document.getElementById('addCondition')?.value || null;
      calculationExample = document.getElementById('addCalculationExample')?.value || null;
    }

    const newRule = {
      id: `rule-${Date.now()}`,
      feeItem: feeItem,
      unit: unit,
      pricingRules: pricingRules.length > 0 ? pricingRules : null,
      weightTiers: weightTiers.length > 0 ? weightTiers : null,
      condition: condition,
      remark: remark || null,
      calculationExample: calculationExample,
      publishStatus: 'draft',
      categoryName: category,
      operationName: feeItem,
      subCategory: subCategory,
      tierPricing: tierPricing.length > 0 ? tierPricing : null
    };

    this.flatItems.push(newRule);

    if (category === this.currentCategory) {
      this.filteredItems.push(newRule);
      this.renderItemList();
      this.updateStatistics();
    }

    document.querySelector('.modal-overlay').remove();
    showToast('规则添加成功', 'success');
  }

});
