/**
 * 新增弹窗 - UI部分
 * 方法：showAddModal, updateFeeItemTree, onFeeItemTreeChange,
 *       showPricingTableForm, showTierPricingForm, showPricingTextForm, hideAllForms
 */

Object.assign(ValueAddedServiceEngine.prototype, {

  showAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:800px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-plus-circle" style="color:#2D936C;"></i>
            新增增值服务规则
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">费用组 <span style="color:#C44536;">*</span></label>
              <select id="addCategory" class="form-input" onchange="engine.updateFeeItemTree()">
                <option value="">请选择分类</option>
                <option value="增值服务">增值服务</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">费用类型 <span style="color:#C44536;">*</span></label>
              <div style="position:relative;" id="feeItemTreeContainer">
                <select id="addFeeItemTree" class="form-input" onchange="engine.onFeeItemTreeChange()" style="appearance:none;">
                  <option value="">请先选择费用组</option>
                </select>
                <i class="fa fa-angle-down" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none; color:#8B93A5;"></i>
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">计费单位 <span style="color:#C44536;">*</span></label>
              <select id="addUnit" class="form-input">
                <option value="票">票</option>
                <option value="件">件</option>
                <option value="箱">箱</option>
                <option value="托">托</option>
                <option value="KG">KG</option>
                <option value="个">个</option>
                <option value="次">次</option>
                <option value="张">张</option>
                <option value="天">天</option>
                <option value="小时">小时</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">计费维度</label>
              <input type="text" id="addPricingType" class="form-input" value="" disabled style="background:#F9FAFB; color:#5A6275;">
            </div>
          </div>

          <div id="pricingTableSection" style="display:none; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <label class="form-label" style="margin:0;">费率标准</label>
              <button class="erp-btn erp-btn-success" onclick="engine.addPricingRow()" style="padding:4px 12px; font-size:12px;">
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
                <tbody id="pricingTableBody">
                </tbody>
              </table>
            </div>
          </div>

          <div id="pricingTextSection" style="margin-bottom:16px;">
            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">费率规则（可选，每行一条：规格|价格|备注）</label>
              <textarea id="addPricingRules" class="form-input" rows="4" placeholder="示例：&#10;标准件|2|单件或整箱货物做上架操作&#10;大件|5|超大尺寸货物&#10;易碎品|3|需额外小心操作的货物"></textarea>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">条件说明</label>
              <textarea id="addCondition" class="form-input" rows="2" placeholder="适用条件，如：仅限未完成上架操作的货物"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">备注</label>
              <textarea id="addCalculationExample" class="form-input" rows="4" placeholder="示例：&#10;计费公式：费用 = 单价 × 数量&#10;举例：上架100件标准货物&#10;计算：2元 × 100 = 200元"></textarea>
            </div>
          </div>

          <div id="tierPricingSection" style="display:none; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <label class="form-label" style="margin:0;">阶梯价格</label>
              <button class="erp-btn erp-btn-success" onclick="engine.addTierRow()" style="padding:4px 12px; font-size:12px;">
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
                <tbody id="tierPricingTableBody">
                </tbody>
              </table>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">备注</label>
            <textarea id="addRemark" class="form-input" rows="2" placeholder="规则说明或特殊条件"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="erp-btn erp-btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
          <button class="erp-btn erp-btn-primary" onclick="engine.saveNewRule()">
            <i class="fa fa-save"></i> 保存
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 设置默认值
    document.getElementById('addCategory').value = '增值服务';
    this.updateFeeItemTree();
  },

  updateFeeItemTree() {
    const category = document.getElementById('addCategory').value;
    const feeItemSelect = document.getElementById('addFeeItemTree');
    populateFeeItemTree(feeItemSelect, category);

    if (feeItemSelect.options.length > 1) {
      feeItemSelect.selectedIndex = 1;
      this.onFeeItemTreeChange();
    }
  },

  onFeeItemTreeChange() {
    const select = document.getElementById('addFeeItemTree');
    const selectedOption = select.options[select.selectedIndex];
    const pricingTypeInput = document.getElementById('addPricingType');
    const unitSelect = document.getElementById('addUnit');

    if (!selectedOption || !selectedOption.value) {
      pricingTypeInput.value = '';
      return;
    }

    // 从option dataset中获取配置信息
    const dimension = selectedOption.dataset.dimension || '';
    const unit = selectedOption.dataset.unit || '';

    // 自动带出计费维度
    pricingTypeInput.value = dimension;

    // 自动带出计费单位（匹配下拉选项）
    if (unit) {
      const unitValue = unit.replace('/', '');
      for (let i = 0; i < unitSelect.options.length; i++) {
        if (unitSelect.options[i].value === unitValue) {
          unitSelect.value = unitValue;
          break;
        }
      }
    }

    // 根据费用类型显示对应表单
    const feeItemName = selectedOption.dataset.feeItemName || '';

    // 增值服务规则统一使用阶梯收费模式
    this.showTierPricingForm();
  },

  showPricingTableForm() {
    document.getElementById('pricingTableSection').style.display = 'block';
    document.getElementById('pricingTextSection').style.display = 'none';
    document.getElementById('tierPricingSection').style.display = 'none';

    const tbody = document.getElementById('pricingTableBody');
    tbody.innerHTML = '';
    this.addPricingRow();
  },

  showTierPricingForm() {
    document.getElementById('pricingTableSection').style.display = 'none';
    document.getElementById('pricingTextSection').style.display = 'none';
    document.getElementById('tierPricingSection').style.display = 'block';

    const tbody = document.getElementById('tierPricingTableBody');
    tbody.innerHTML = '';
    this.addTierRow();
  },

  showPricingTextForm() {
    document.getElementById('pricingTableSection').style.display = 'none';
    document.getElementById('pricingTextSection').style.display = 'block';
    document.getElementById('tierPricingSection').style.display = 'none';
  },

  hideAllForms() {
    document.getElementById('pricingTableSection').style.display = 'none';
    document.getElementById('pricingTextSection').style.display = 'block';
    document.getElementById('tierPricingSection').style.display = 'none';
  }

});
