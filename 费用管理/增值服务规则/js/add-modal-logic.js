/**
 * 新增弹窗 - 逻辑部分
 * 方法：addPricingRow, removePricingRow, addTierRow, removeTierRow, saveNewRule
 */

Object.assign(ValueAddedServiceEngine.prototype, {

  addPricingRow() {
    const category = document.getElementById('addCategory').value;
    const tbody = document.getElementById('pricingTableBody');
    const row = document.createElement('tr');

    let specOptions = '';
    if (category === '增值服务') {
      // 根据选择的费用类型动态生成规格选项
      const feeItemSelect = document.getElementById('addFeeItemTree');
      const selectedOption = feeItemSelect.options[feeItemSelect.selectedIndex];
      const feeItemName = selectedOption?.dataset.feeItemName || '';

      if (feeItemName.includes('退货入库')) {
        specOptions = `<option value="">请输入或选择</option>`;
      } else if (feeItemName.includes('商品上架')) {
        specOptions = `
          <option value="标准件">标准件</option>
          <option value="大件">大件</option>
          <option value="易碎品">易碎品</option>
        `;
      } else if (feeItemName.includes('仓储费')) {
        specOptions = `
          <option value="基础仓储">基础仓储</option>
        `;
      } else if (feeItemName.includes('销毁')) {
        specOptions = `<option value="">按重量阶梯</option>`;
      } else if (feeItemName.includes('拆托')) {
        specOptions = `
          <option value="标准托盘">标准托盘</option>
          <option value="重型托盘">重型托盘</option>
        `;
      } else if (feeItemName.includes('开箱')) {
        specOptions = `
          <option value="标准开箱">标准开箱</option>
          <option value="特殊包装">特殊包装</option>
        `;
      } else if (feeItemName.includes('封箱')) {
        specOptions = `
          <option value="标准封箱">标准封箱</option>
        `;
      } else if (feeItemName.includes('拍照')) {
        specOptions = `
          <option value="外箱拍照">外箱拍照</option>
          <option value="细节拍照">细节拍照</option>
          <option value="视频录制">视频录制</option>
        `;
      } else if (feeItemName.includes('丈量')) {
        specOptions = `
          <option value="标准测量">标准测量</option>
          <option value="精密测量">精密测量</option>
        `;
      } else if (feeItemName.includes('打腰')) {
        specOptions = `
          <option value="人工费">人工费</option>
          <option value="材料费">材料费</option>
        `;
      } else if (feeItemName.includes('纸箱')) {
        specOptions = `
          <option value="小号纸箱">小号纸箱</option>
          <option value="中号纸箱">中号纸箱</option>
          <option value="大号纸箱">大号纸箱</option>
          <option value="特大纸箱">特大纸箱</option>
        `;
      } else if (feeItemName.includes('标签')) {
        specOptions = `
          <option value="标准标签">标准标签</option>
          <option value="定制标签">定制标签</option>
        `;
      } else if (feeItemName.includes('异常')) {
        specOptions = `
          <option value="标准处理">标准处理</option>
          <option value="复杂处理">复杂处理</option>
        `;
      } else {
        specOptions = `<option value="">请输入规格</option>`;
      }
    }

    row.innerHTML = `
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        ${specOptions.startsWith('<option') ?
          `<select class="form-input pricing-spec" style="width:100%;">${specOptions}</select>` :
          `<input type="text" class="form-input pricing-spec" placeholder="如：标准件" style="width:100%;">`
        }
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <input type="number" class="form-input pricing-price" placeholder="如：2.0" step="0.01" style="width:100%;">
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
        <input type="number" class="form-input tier-end" placeholder="如：10" step="0.01" style="width:100%;">
      </td>
      <td style="padding:8px; border-bottom:1px solid var(--color-border-light);">
        <input type="number" class="form-input tier-price" placeholder="如：5.0" step="0.01" style="width:100%;">
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

    let tierPricing = [];

    // 增值服务规则统一使用阶梯收费模式
    const tierPricingSection = document.getElementById('tierPricingSection');
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

    const condition = document.getElementById('addCondition')?.value || null;
    const calculationExample = document.getElementById('addCalculationExample')?.value || null;

    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-');

    const newRule = {
      id: `rule-${Date.now()}`,
      feeItem: feeItem,
      unit: unit,
      tierPricing: tierPricing,
      condition: condition,
      remark: remark || null,
      calculationExample: calculationExample,
      publishStatus: 'draft',
      categoryName: category,
      operationName: feeItem,
      subCategory: subCategory,
      creator: 'admin',
      createTime: now,
      updater: 'admin',
      updateTime: now
    };

    this.flatItems.push(newRule);

    this.filteredItems.push(newRule);
    this.renderItemList();
    this.updateStatistics();

    document.querySelector('.modal-overlay').remove();
    showToast('规则添加成功', 'success');
  }

});
