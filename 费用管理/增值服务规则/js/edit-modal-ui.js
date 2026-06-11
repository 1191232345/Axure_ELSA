/**
 * 编辑弹窗 - UI部分
 * 方法：editRule, updateEditFeeItemTree, onEditFeeItemTreeChange
 */

Object.assign(ValueAddedServiceEngine.prototype, {

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
            编辑增值服务规则
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
                <option value="票" ${item.unit === '票' ? 'selected' : ''}>票</option>
                <option value="件" ${item.unit === '件' ? 'selected' : ''}>件</option>
                <option value="箱" ${item.unit === '箱' ? 'selected' : ''}>箱</option>
                <option value="托" ${item.unit === '托' ? 'selected' : ''}>托</option>
                <option value="KG" ${item.unit === 'KG' ? 'selected' : ''}>KG</option>
                <option value="个" ${item.unit === '个' ? 'selected' : ''}>个</option>
                <option value="次" ${item.unit === '次' ? 'selected' : ''}>次</option>
                <option value="张" ${item.unit === '张' ? 'selected' : ''}>张</option>
                <option value="天" ${item.unit === '天' ? 'selected' : ''}>天</option>
                <option value="小时" ${item.unit === '小时' ? 'selected' : ''}>小时</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">计费维度</label>
              <input type="text" id="editPricingType" class="form-input" value="" disabled style="background:#F9FAFB; color:#5A6275;">
            </div>
          </div>

          <div id="editPricingTableSection" style="display:block; margin-bottom:16px;">
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

          <div id="editPricingTextSection" style="display:none; margin-bottom:16px;">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">费率规则（可选，每行一条：规格|价格|备注）</label>
              <textarea id="editPricingRules" class="form-input" rows="4" placeholder="示例：&#10;标准件|2|单件或整箱货物做上架操作">${item.pricingRules ? item.pricingRules.map(pr => `${pr.spec}|${pr.price}|${pr.remark || ''}`).join('\n') : ''}</textarea>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">条件说明</label>
              <textarea id="editCondition" class="form-input" rows="2" placeholder="适用条件">${item.condition || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea id="editCalculationExample" class="form-input" rows="4" placeholder="计费公式和举例">${item.calculationExample || ''}</textarea>
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

    // 加载已有阶梯价格数据（增值服务规则统一使用阶梯收费）
    if (item.tierPricing && item.tierPricing.length > 0) {
      document.getElementById('editTierPricingSection').style.display = 'block';
      document.getElementById('editPricingTableSection').style.display = 'none';
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

    // 重置所有区域显示状态（默认使用费率表格）
    pricingTableSection.style.display = 'block';
    tierPricingSection.style.display = 'none';
    pricingTextSection.style.display = 'none';

    if (!selectedValue || !selectedOption) {
      pricingTypeInput.value = '';
      return;
    }

    // 从option dataset中获取配置信息
    const dimension = selectedOption.dataset.dimension || '';

    // 自动带出计费维度
    pricingTypeInput.value = dimension;
  }

});
