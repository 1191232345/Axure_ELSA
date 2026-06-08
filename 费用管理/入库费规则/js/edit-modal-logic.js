/**
 * 编辑弹窗 - 逻辑部分
 * 方法：addEditPricingRow, addEditTierRow, saveEditRule
 */

Object.assign(InboundFeeRuleEngine.prototype, {

  addEditPricingRow(spec = '', price = '', remark = '') {
    const tbody = document.getElementById('editPricingTableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding:10px; border-bottom:1px solid var(--color-border);">
        <input type="text" class="form-input" value="${spec}" placeholder="如：20GP" style="width:100%;">
      </td>
      <td style="padding:10px; border-bottom:1px solid var(--color-border);">
        <input type="number" class="form-input" value="${price}" placeholder="如：350" step="0.01" style="width:100%;">
      </td>
      <td style="padding:10px; border-bottom:1px solid var(--color-border);">
        <input type="text" class="form-input" value="${remark}" placeholder="备注信息" style="width:100%;">
      </td>
      <td style="padding:10px; border-bottom:1px solid var(--color-border); text-align:center;">
        <button class="action-btn danger" onclick="this.closest('tr').remove()">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  },

  addEditTierRow(start = '', end = '', price = '') {
    const tbody = document.getElementById('editTierPricingTableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="padding:10px; border-bottom:1px solid var(--color-border);">
        <input type="number" class="form-input" value="${start}" placeholder="如：0" style="width:100%;">
      </td>
      <td style="padding:10px; border-bottom:1px solid var(--color-border);">
        <input type="number" class="form-input" value="${end}" placeholder="如：100" style="width:100%;">
      </td>
      <td style="padding:10px; border-bottom:1px solid var(--color-border);">
        <input type="number" class="form-input" value="${price}" placeholder="如：50" step="0.01" style="width:100%;">
      </td>
      <td style="padding:10px; border-bottom:1px solid var(--color-border); text-align:center;">
        <button class="action-btn danger" onclick="this.closest('tr').remove()">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  },

  saveEditRule(ruleId) {
    const item = this.flatItems.find(i => i.id === ruleId);
    if (!item) return;

    const selectedValue = document.getElementById('editFeeItemTree').value;
    if (!selectedValue) {
      showToast('请选择费用类型', 'error');
      return;
    }

    const parts = selectedValue.split('_');
    if (selectedValue.startsWith('level1_')) {
      item.feeItem = parts[2];
      item.subCategory = null;
    } else if (selectedValue.startsWith('level2_')) {
      item.feeItem = parts[2];
      item.subCategory = parts[3];
    }

    item.unit = document.getElementById('editUnit').value;
    item.condition = document.getElementById('editCondition').value || null;
    item.calculationExample = document.getElementById('editCalculationExample').value || null;
    item.remark = document.getElementById('editRemark').value || null;

    const pricingTableBody = document.getElementById('editPricingTableBody');
    if (pricingTableBody && pricingTableBody.children.length > 0) {
      item.pricingRules = [];
      Array.from(pricingTableBody.children).forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs[0].value && inputs[1].value) {
          item.pricingRules.push({
            spec: inputs[0].value,
            price: parseFloat(inputs[1].value),
            remark: inputs[2].value || ''
          });
        }
      });
    }

    const tierPricingTableBody = document.getElementById('editTierPricingTableBody');
    if (tierPricingTableBody && tierPricingTableBody.children.length > 0) {
      item.tierPricing = [];
      Array.from(tierPricingTableBody.children).forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs[0].value && inputs[1].value && inputs[2].value) {
          item.tierPricing.push({
            start: parseInt(inputs[0].value),
            end: parseInt(inputs[1].value),
            price: parseFloat(inputs[2].value)
          });
        }
      });
    }

    item.updater = 'admin';
    item.updateTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-');

    this.renderItemList();
    document.querySelector('.modal-overlay').remove();
    showToast('规则更新成功', 'success');
  }

});
