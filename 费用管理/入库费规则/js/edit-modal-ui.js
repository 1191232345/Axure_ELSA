/**
 * 编辑弹窗 - UI部分
 * 方法：editRule, updateEditFeeItemTree, onEditFeeItemTreeChange
 */

Object.assign(InboundFeeRuleEngine.prototype, {

  editRule(ruleId) {
    const item = this.flatItems.find(i => i.id === ruleId);
    if (!item) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:800px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-edit" style="color:#E8A838;"></i>
            编辑收费规则
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">费用组</label>
              <input type="text" class="form-input" value="${item.categoryName}" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">费用类型 <span style="color:#C44536;">*</span></label>
              <div style="position:relative;" id="editFeeItemTreeContainer">
                <select id="editFeeItemTree" class="form-input" onchange="engine.onEditFeeItemTreeChange()" style="appearance:none;">
                  <option value="">请选择费用类型</option>
                </select>
                <i class="fa fa-angle-down" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none; color:#8B93A5;"></i>
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">计费单位 <span style="color:#C44536;">*</span></label>
              <select id="editUnit" class="form-input">
                <option value="柜" ${item.unit === '柜' ? 'selected' : ''}>柜</option>
                <option value="票" ${item.unit === '票' ? 'selected' : ''}>票</option>
                <option value="件" ${item.unit === '件' ? 'selected' : ''}>件</option>
                <option value="箱" ${item.unit === '箱' ? 'selected' : ''}>箱</option>
                <option value="托" ${item.unit === '托' ? 'selected' : ''}>托</option>
                <option value="KG" ${item.unit === 'KG' ? 'selected' : ''}>KG</option>
                <option value="个" ${item.unit === '个' ? 'selected' : ''}>个</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">计费维度</label>
              <input type="text" id="editPricingType" class="form-input" value="" disabled style="background:#F9FAFB; color:#5A6275;">
            </div>
          </div>

          <div id="editPricingTableSection" style="display:none; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <label class="form-label" style="margin:0;">费率标准</label>
              <button class="erp-btn erp-btn-success" onclick="engine.addEditPricingRow()" style="padding:4px 12px; font-size:12px;">
                <i class="fa fa-plus"></i> 添加费率
              </button>
            </div>
            <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden;">
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--color-surface);">
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">规格</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:25%;">价格（$）</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:35%;">备注</th>
                    <th style="padding:10px; text-align:center; border-bottom:1px solid var(--color-border); width:10%;">操作</th>
                  </tr>
                </thead>
                <tbody id="editPricingTableBody">
                </tbody>
              </table>
            </div>
          </div>

          <div id="editPricingTextSection" style="display:block; margin-bottom:16px;">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">费率规则（可选，每行一条：规格|价格|备注）</label>
              <textarea id="editPricingRules" class="form-input" rows="4" placeholder="示例：&#10;20GP|350|标准柜型&#10;40GP|450|大柜型&#10;40HC|500|高柜">${item.pricingRules ? item.pricingRules.map(pr => `${pr.spec}|${pr.price}|${pr.remark || ''}`).join('\n') : ''}</textarea>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">重量阶梯（可选，每行一条：范围|价格|单位）</label>
              <textarea id="editWeightTiers" class="form-input" rows="3" placeholder="示例：&#10;0-100KG|50|KG&#10;100-500KG|80|KG">${item.weightTiers ? item.weightTiers.map(wt => `${wt.range}|${wt.price}|${wt.unit}`).join('\n') : ''}</textarea>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">条件说明</label>
              <textarea id="editCondition" class="form-input" rows="2" placeholder="适用条件，如：仅限整柜入库操作">${item.condition || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea id="editCalculationExample" class="form-input" rows="4" placeholder="示例：&#10;计费公式：费用 = 单价 × 数量&#10;举例：卸柜1个20GP柜&#10;计算：350$ × 1 = 350$">${item.calculationExample || ''}</textarea>
            </div>
          </div>

          <div id="editTierPricingSection" style="display:none; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <label class="form-label" style="margin:0;">阶梯价格</label>
              <button class="erp-btn erp-btn-success" onclick="engine.addEditTierRow()" style="padding:4px 12px; font-size:12px;">
                <i class="fa fa-plus"></i> 添加阶梯
              </button>
            </div>
            <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden;">
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--color-surface);">
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">开始量</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">结束量</th>
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">价格（$）</th>
                    <th style="padding:10px; text-align:center; border-bottom:1px solid var(--color-border); width:10%;">操作</th>
                  </tr>
                </thead>
                <tbody id="editTierPricingTableBody">
                </tbody>
              </table>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">备注</label>
            <textarea id="editRemark" class="form-input" rows="2" placeholder="规则说明或特殊条件">${item.remark || ''}</textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="erp-btn erp-btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
          <button class="erp-btn erp-btn-primary" onclick="engine.saveEditRule('${ruleId}')">
            <i class="fa fa-save"></i> 保存
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 初始化编辑弹窗的费用类型树形选择
    this.updateEditFeeItemTree(item.categoryName);

    // 设置当前选中的费用类型值
    const editFeeItemTree = document.getElementById('editFeeItemTree');
    if (item.subCategory) {
      const level2Value = `level2_${item.categoryName}_${item.subCategory}`;
      editFeeItemTree.value = level2Value;
    } else {
      const level1Value = `level1_${item.categoryName}_${item.feeItem}`;
      editFeeItemTree.value = level1Value;
    }
    this.onEditFeeItemTreeChange();

    if (item.pricingRules && item.pricingRules.length > 0) {
      item.pricingRules.forEach(pr => {
        this.addEditPricingRow(pr.spec, pr.price, pr.remark);
      });
    }

    if (item.tierPricing && item.tierPricing.length > 0) {
      document.getElementById('editTierPricingSection').style.display = 'block';
      item.tierPricing.forEach(tp => {
        this.addEditTierRow(tp.start, tp.end, tp.price);
      });
    }
  },

  updateEditFeeItemTree(category) {
    const feeItemSelect = document.getElementById('editFeeItemTree');
    populateFeeItemTree(feeItemSelect, category);
  },

  onEditFeeItemTreeChange() {
    const select = document.getElementById('editFeeItemTree');
    const selectedOption = select.options[select.selectedIndex];
    const selectedValue = select.value;
    const pricingTableSection = document.getElementById('editPricingTableSection');
    const pricingTextSection = document.getElementById('editPricingTextSection');
    const tierPricingSection = document.getElementById('editTierPricingSection');
    const pricingTypeInput = document.getElementById('editPricingType');

    // 重置所有区域
    pricingTableSection.style.display = 'none';
    tierPricingSection.style.display = 'none';
    pricingTextSection.style.display = 'block';

    if (!selectedValue || !selectedOption) {
      pricingTypeInput.value = '';
      return;
    }

    // 从option dataset中获取配置信息
    const dimension = selectedOption.dataset.dimension || '';
    const feeItemName = selectedOption.dataset.feeItemName;

    // 自动带出计费维度
    pricingTypeInput.value = dimension;

    // 根据费用类型显示对应表单
    if (feeItemName.includes('卸货费') && feeItemName.includes('整柜')) {
      // 整柜卸货费：显示费率标准表格（柜型规格）
      pricingTableSection.style.display = 'block';
      pricingTextSection.style.display = 'none';
    } else {
      // 其他费用：显示阶梯价格表格
      tierPricingSection.style.display = 'block';
      pricingTextSection.style.display = 'none';
    }
  }

});
