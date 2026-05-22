/**
 * 入库费规则管理系统 - 分类Tab展示模式 v6.0
 * 功能：通过Tab栏切换不同分类，展示对应收费项目
 */

class InboundFeeRuleEngine {
  constructor() {
    this.treeData = null;
    this.flatItems = [];
    this.filteredItems = [];
    this.currentCategory = '整柜入库';
    this.init();
  }

  async init() {
    await this.loadData();
    this.flattenData();
    this.bindEvents();
    this.switchCategory('整柜入库');
  }

  async loadData() {
    try {
      const response = await fetch('data/inbound-fee-rule-data.json');
      this.treeData = await response.json();
      console.log('✅ 数据加载成功:', this.treeData.metadata);
    } catch (error) {
      console.error('❌ 数据加载失败:', error);
      showToast('数据加载失败', 'error');
    }
  }

  flattenData() {
    this.flatItems = [];

    if (!this.treeData || !this.treeData.categories) return;

    this.treeData.categories.forEach(category => {
      const categoryName = category.name;

      if (category.children) {
        category.children.forEach(operation => {
          const operationName = operation.name;

          if (operation.children) {
            operation.children.forEach(rule => {
              this.flatItems.push({
                ...rule,
                categoryName: categoryName,
                operationName: operationName,
                categoryId: category.id,
                operationId: operation.id
              });
            });
          }
        });
      }
    });

    console.log(`✅ 数据扁平化完成，共 ${this.flatItems.length} 个收费项目`);
  }

  bindEvents() {
    document.getElementById('btnAddRule').addEventListener('click', () => this.showAddModal());
    document.getElementById('btnBatchPublish').addEventListener('click', () => this.batchPublish());
    document.getElementById('btnBatchCancel').addEventListener('click', () => this.batchCancel());
    document.getElementById('btnExport').addEventListener('click', () => this.exportData());
  }

  switchCategory(categoryName) {
    this.currentCategory = categoryName;

    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.category === categoryName) {
        tab.classList.add('active');
      }
    });

    this.filteredItems = this.flatItems.filter(item => item.categoryName === categoryName);

    this.renderItemList();
    this.updateStatistics();
  }

  renderItemList() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (!this.filteredItems || this.filteredItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:60px; color:#8B93A5;">
            <i class="fa fa-inbox" style="font-size:48px; margin-bottom:16px; display:block; opacity:0.3;"></i>
            <div style="font-size:15px;">暂无收费项目数据</div>
            <div style="font-size:13px; margin-top:8px;">点击"新增规则"开始配置入库费规则</div>
          </td>
        </tr>`;
      return;
    }

    this.filteredItems.forEach((item, index) => {
      const row = this.createItemRow(item, index);
      tbody.appendChild(row);
    });
  }

  createItemRow(item, index) {
    const statusClass = item.publishStatus === 'published' ? 'status-published' : 'status-draft';
    const statusText = item.publishStatus === 'published' ? '已发布' : '草稿';

    const row = document.createElement('tr');
    row.className = 'cursor-pointer hover:bg-hover transition-colors';
    row.innerHTML = `
      <td style="text-align:center; font-weight:600; color:#1B3A4B;">${index + 1}</td>
      <td style="font-weight:500;">${item.feeItem}</td>
      <td>${item.unit || '-'}</td>
      <td>
        <span class="status-badge ${statusClass}">
          <span class="status-dot"></span>${statusText}
        </span>
      </td>
      <td>
        <div class="action-group">
          <button class="action-btn" title="查看详情" onclick="event.stopPropagation(); engine.viewDetail('${item.id}')">
            <i class="fa fa-eye"></i>
          </button>
          <button class="action-btn" title="编辑规则" onclick="event.stopPropagation(); engine.editRule('${item.id}')">
            <i class="fa fa-edit"></i>
          </button>
          <button class="action-btn danger" title="删除规则" onclick="event.stopPropagation(); engine.deleteRule('${item.id}')">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    row.addEventListener('click', () => {
      this.viewDetail(item.id);
    });

    return row;
  }

  updateStatistics() {
    const totalItems = this.filteredItems.length;
    document.getElementById('statisticsText').innerHTML = `${this.currentCategory} - 共 <strong>${totalItems}</strong> 个收费项目`;
  }

  viewDetail(itemId) {
    const item = this.flatItems.find(i => i.id === itemId);
    if (!item) return;

    this.showDetailModal(item);
  }

  showDetailModal(item) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:800px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-file-text-o" style="color:#E8A838;"></i>
            收费项目详情 - ${item.feeItem}
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
            <div class="form-group">
              <label class="form-label">项目分类</label>
              <input type="text" class="form-input" value="${item.categoryName}" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">收费项目</label>
              <input type="text" class="form-input" value="${item.feeItem}" disabled>
            </div>
          </div>

          ${item.subCategory ? `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
            <div class="form-group">
              <label class="form-label">二级分类</label>
              <input type="text" class="form-input" value="${item.subCategory}" disabled>
            </div>
          </div>
          ` : ''}

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
            <div class="form-group">
              <label class="form-label">计费单位</label>
              <input type="text" class="form-input" value="${item.unit || '-'}" disabled>
            </div>
          </div>

          ${item.pricingRules && item.pricingRules.length > 0 ? `
          <div class="form-group">
            <label class="form-label">费率规则</label>
            ${item.pricingRules.map(pr => `
              <div style="background:#F9FAFB; padding:12px; border-radius:8px; margin-bottom:8px; border-left:3px solid #E8A838;">
                <strong style="color:#1B3A4B;">规格：</strong>${pr.spec}<br>
                <strong style="color:#C44536; font-size:18px;">价格：¥${pr.price}</strong><br>
                ${pr.remark ? `<small style="color:#8B93A5;">备注：${pr.remark}</small>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${item.tierPricing && item.tierPricing.length > 0 ? `
          <div class="form-group">
            <label class="form-label">阶梯价格</label>
            ${item.tierPricing.map(tp => `
              <div style="background:#F9FAFB; padding:12px; border-radius:8px; margin-bottom:8px; border-left:3px solid #2D936C;">
                <strong style="color:#1B3A4B;">范围：</strong>${tp.start} - ${tp.end}<br>
                <strong style="color:#C44536; font-size:18px;">价格：¥${tp.price}</strong>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${item.weightTiers && item.weightTiers.length > 0 ? `
          <div class="form-group">
            <label class="form-label">重量阶梯</label>
            ${item.weightTiers.map(wt => `
              <div style="background:#F9FAFB; padding:12px; border-radius:8px; margin-bottom:8px; border-left:3px solid #2D936C;">
                <strong style="color:#1B3A4B;">范围：</strong>${wt.range}<br>
                <strong style="color:#C44536; font-size:18px;">价格：¥${wt.price}/${wt.unit}</strong>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${item.remark ? `
          <div class="form-group">
            <label class="form-label">备注</label>
            <div style="background:#F9FAFB; padding:12px; border-radius:8px;">${item.remark}</div>
          </div>
          ` : ''}

          ${item.condition ? `
          <div class="form-group">
            <label class="form-label">条件</label>
            <div style="background:#FFFBEB; padding:12px; border-radius:8px; border:1px solid #FDE68A;">${item.condition}</div>
          </div>
          ` : ''}

          ${item.calculationExample ? `
          <div class="form-group">
            <label class="form-label">计费举例</label>
            <div style="background:#FFFBEB; padding:14px; border-radius:8px; border:1px solid #FDE68A; font-size:13px; line-height:1.7;">
              ${this.formatCalculationExample(item.calculationExample)}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="modal-footer">
          <button class="erp-btn erp-btn-secondary" onclick="this.closest('.modal-overlay').remove()">关闭</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

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

  showAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:800px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-plus-circle" style="color:#2D936C;"></i>
            新增收费规则
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">项目分类 <span style="color:#C44536;">*</span></label>
              <select id="addCategory" class="form-input" onchange="engine.updateFeeItemOptions()">
                <option value="">请选择分类</option>
                <option value="整柜入库">整柜入库</option>
                <option value="快递散货入库">快递散货入库</option>
                <option value="托盘入库">托盘入库</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">收费项目 <span style="color:#C44536;">*</span></label>
              <select id="addFeeItem" class="form-input" onchange="engine.togglePricingTable()">
              </select>
            </div>
          </div>

          <div id="subCategorySection" style="display:none; margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">二级分类 <span style="color:#C44536;">*</span></label>
              <select id="addSubCategory" class="form-input" onchange="engine.toggleTierPricing()">
                <option value="">请选择二级分类</option>
                <option value="SKU超量费">SKU超量费</option>
                <option value="超重费">超重费</option>
                <option value="清单费">清单费</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">计费单位 <span style="color:#C44536;">*</span></label>
            <select id="addUnit" class="form-input">
              <option value="柜">柜</option>
              <option value="票">票</option>
              <option value="件">件</option>
              <option value="箱">箱</option>
              <option value="托">托</option>
              <option value="KG">KG</option>
            </select>
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
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:25%;">价格（元）</th>
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
              <textarea id="addPricingRules" class="form-input" rows="4" placeholder="示例：&#10;20GP|350|标准柜型&#10;40GP|450|大柜型&#10;40HC|500|高柜"></textarea>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">重量阶梯（可选，每行一条：范围|价格|单位）</label>
              <textarea id="addWeightTiers" class="form-input" rows="3" placeholder="示例：&#10;0-100KG|50|KG&#10;100-500KG|80|KG"></textarea>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label class="form-label">条件说明</label>
              <textarea id="addCondition" class="form-input" rows="2" placeholder="适用条件，如：仅限整柜入库操作"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">计费举例</label>
              <textarea id="addCalculationExample" class="form-input" rows="4" placeholder="示例：&#10;计费公式：费用 = 单价 × 数量&#10;举例：卸柜1个20GP柜&#10;计算：350元 × 1 = 350元"></textarea>
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
                    <th style="padding:10px; text-align:left; border-bottom:1px solid var(--color-border); width:30%;">价格（元）</th>
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
    document.getElementById('addCategory').value = this.currentCategory;
    this.updateFeeItemOptions();
  }

  updateFeeItemOptions() {
    const category = document.getElementById('addCategory').value;
    const feeItemSelect = document.getElementById('addFeeItem');
    
    feeItemSelect.innerHTML = '<option value="">请选择收费项目</option>';
    
    if (!category) {
      feeItemSelect.innerHTML = '<option value="">请先选择项目分类</option>';
      return;
    }

    const feeItemOptions = {
      '整柜入库': [
        { value: '卸货费', label: '卸货费' },
        { value: '入库附加费', label: '入库附加费' }
      ],
      '快递散货入库': [
        { value: '收发费', label: '收发费' },
        { value: '入库附加费', label: '入库附加费' }
      ],
      '托盘入库': [
        { value: '卸货费', label: '卸货费' },
        { value: '入库附加费', label: '入库附加费' }
      ]
    };

    const options = feeItemOptions[category] || [];
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      feeItemSelect.appendChild(option);
    });

    if (options.length > 0) {
      feeItemSelect.value = options[0].value;
      this.togglePricingTable();
    }
  }

  togglePricingTable() {
    const category = document.getElementById('addCategory').value;
    const feeItem = document.getElementById('addFeeItem').value;
    const pricingTableSection = document.getElementById('pricingTableSection');
    const pricingTextSection = document.getElementById('pricingTextSection');
    const subCategorySection = document.getElementById('subCategorySection');
    const tierPricingSection = document.getElementById('tierPricingSection');

    subCategorySection.style.display = 'none';
    tierPricingSection.style.display = 'none';
    document.getElementById('addSubCategory').value = '';

    if (feeItem === '卸货费') {
      pricingTableSection.style.display = 'block';
      pricingTextSection.style.display = 'none';
      const tbody = document.getElementById('pricingTableBody');
      tbody.innerHTML = '';
      this.addPricingRow();
    } else if (feeItem === '入库附加费' && category === '整柜入库') {
      pricingTableSection.style.display = 'none';
      pricingTextSection.style.display = 'none';
      subCategorySection.style.display = 'block';
    } else {
      pricingTableSection.style.display = 'none';
      pricingTextSection.style.display = 'block';
    }
  }

  toggleTierPricing() {
    const subCategory = document.getElementById('addSubCategory').value;
    const tierPricingSection = document.getElementById('tierPricingSection');

    if (subCategory) {
      tierPricingSection.style.display = 'block';
      const tbody = document.getElementById('tierPricingTableBody');
      tbody.innerHTML = '';
      this.addTierRow();
    } else {
      tierPricingSection.style.display = 'none';
    }
  }

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
    } else {
      specOptions = `

        <option value="小件">小件</option>
        <option value="中件">中件</option>
        <option value="大件">大件</option>
        <option value="超大件">超大件</option>
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
  }

  removePricingRow(btn) {
    const row = btn.closest('tr');
    const tbody = document.getElementById('pricingTableBody');
    if (tbody.children.length > 1) {
      row.remove();
    } else {
      showToast('至少保留一条费率记录', 'warning');
    }
  }

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
  }

  removeTierRow(btn) {
    const row = btn.closest('tr');
    const tbody = document.getElementById('tierPricingTableBody');
    if (tbody.children.length > 1) {
      row.remove();
    } else {
      showToast('至少保留一条阶梯记录', 'warning');
    }
  }

  saveNewRule() {
    const category = document.getElementById('addCategory').value;
    const feeItem = document.getElementById('addFeeItem').value;
    const unit = document.getElementById('addUnit').value;
    const remark = document.getElementById('addRemark').value;

    if (!category || !feeItem || !unit) {
      showToast('请填写必填项', 'error');
      return;
    }

    let pricingRules = [];
    let weightTiers = [];
    let condition = null;
    let calculationExample = null;
    let subCategory = null;
    let tierPricing = [];
    
    if (feeItem === '卸货费') {
      const pricingRows = document.querySelectorAll('#pricingTableBody tr');
      pricingRows.forEach(row => {
        const spec = row.querySelector('.pricing-spec').value;
        const price = row.querySelector('.pricing-price').value;
        const remark = row.querySelector('.pricing-remark').value;
        
        if (spec && price) {
          pricingRules.push({
            spec: spec.trim(),
            price: parseFloat(price.trim()),
            remark: remark ? remark.trim() : null
          });
        }
      });
      
      if (pricingRules.length === 0) {
        showToast('请至少添加一条费率记录', 'error');
        return;
      }
    } else if (feeItem === '入库附加费' && category === '整柜入库') {
      subCategory = document.getElementById('addSubCategory').value;
      
      if (!subCategory) {
        showToast('请选择二级分类', 'error');
        return;
      }

      const tierRows = document.querySelectorAll('#tierPricingTableBody tr');
      tierRows.forEach(row => {
        const start = row.querySelector('.tier-start').value;
        const end = row.querySelector('.tier-end').value;
        const price = row.querySelector('.tier-price').value;
        
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
      const pricingRulesText = document.getElementById('addPricingRules').value;
      if (pricingRulesText.trim()) {
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

      const weightTiersText = document.getElementById('addWeightTiers').value;
      if (weightTiersText.trim()) {
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

      condition = document.getElementById('addCondition').value || null;
      calculationExample = document.getElementById('addCalculationExample').value || null;
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

  editRule(ruleId) {
    const item = this.flatItems.find(i => i.id === ruleId);
    if (!item) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:600px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-edit" style="color:#E8A838;"></i>
            编辑收费规则
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">项目分类</label>
            <input type="text" class="form-input" value="${item.categoryName}" disabled>
          </div>

          <div class="form-group">
            <label class="form-label">操作项目 <span style="color:#C44536;">*</span></label>
            <input type="text" id="editOperation" class="form-input" value="${item.operationName}">
          </div>

          <div class="form-group">
            <label class="form-label">收费项目 <span style="color:#C44536;">*</span></label>
            <input type="text" id="editFeeItem" class="form-input" value="${item.feeItem}">
          </div>

          <div class="form-group">
            <label class="form-label">仓库操作项目</label>
            <input type="text" id="editWarehouseOperation" class="form-input" value="${item.warehouseOperation || ''}">
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label class="form-label">计费单位 <span style="color:#C44536;">*</span></label>
              <select id="editUnit" class="form-input">
                <option value="柜" ${item.unit === '柜' ? 'selected' : ''}>柜</option>
                <option value="票" ${item.unit === '票' ? 'selected' : ''}>票</option>
                <option value="件" ${item.unit === '件' ? 'selected' : ''}>件</option>
                <option value="箱" ${item.unit === '箱' ? 'selected' : ''}>箱</option>
                <option value="托" ${item.unit === '托' ? 'selected' : ''}>托</option>
                <option value="KG" ${item.unit === 'KG' ? 'selected' : ''}>KG</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">计费模式 <span style="color:#C44536;">*</span></label>
              <select id="editChargeMode" class="form-input">
                <option value="按票计费" ${item.chargeMode === '按票计费' ? 'selected' : ''}>按票计费</option>
                <option value="按柜计费" ${item.chargeMode === '按柜计费' ? 'selected' : ''}>按柜计费</option>
                <option value="按件计费" ${item.chargeMode === '按件计费' ? 'selected' : ''}>按件计费</option>
                <option value="按箱计费" ${item.chargeMode === '按箱计费' ? 'selected' : ''}>按箱计费</option>
                <option value="按托计费" ${item.chargeMode === '按托计费' ? 'selected' : ''}>按托计费</option>
                <option value="重量阶梯" ${item.chargeMode === '重量阶梯' ? 'selected' : ''}>重量阶梯</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">单价（元）</label>
            <input type="number" id="editUnitPrice" class="form-input" value="${item.unitPrice || ''}" step="0.01">
          </div>

          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea id="editRemark" class="form-input" rows="3">${item.remark || ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">发布状态</label>
            <select id="editStatus" class="form-input">
              <option value="draft" ${item.publishStatus === 'draft' ? 'selected' : ''}>草稿</option>
              <option value="published" ${item.publishStatus === 'published' ? 'selected' : ''}>已发布</option>
            </select>
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
  }

  saveEditRule(ruleId) {
    const item = this.flatItems.find(i => i.id === ruleId);
    if (!item) return;

    item.operationName = document.getElementById('editOperation').value;
    item.feeItem = document.getElementById('editFeeItem').value;
    item.warehouseOperation = document.getElementById('editWarehouseOperation').value || null;
    item.unit = document.getElementById('editUnit').value;
    item.chargeMode = document.getElementById('editChargeMode').value;
    const unitPrice = document.getElementById('editUnitPrice').value;
    item.unitPrice = unitPrice ? parseFloat(unitPrice) : null;
    item.remark = document.getElementById('editRemark').value || null;
    item.publishStatus = document.getElementById('editStatus').value;

    this.renderItemList();
    document.querySelector('.modal-overlay').remove();
    showToast('规则更新成功', 'success');
  }

  deleteRule(ruleId) {
    if (!confirm('确定要删除该规则吗？此操作不可恢复！')) return;

    const index = this.flatItems.findIndex(i => i.id === ruleId);
    if (index === -1) return;

    this.flatItems.splice(index, 1);

    const filteredIndex = this.filteredItems.findIndex(i => i.id === ruleId);
    if (filteredIndex !== -1) {
      this.filteredItems.splice(filteredIndex, 1);
    }

    this.renderItemList();
    this.updateStatistics();
    showToast('规则删除成功', 'success');
  }

  batchPublish() {
    if (this.filteredItems.length === 0) {
      showToast('当前分类下没有可发布的规则', 'warning');
      return;
    }

    const draftItems = this.filteredItems.filter(item => item.publishStatus === 'draft');
    if (draftItems.length === 0) {
      showToast('当前分类下没有草稿状态的规则', 'warning');
      return;
    }

    if (!confirm(`确定要发布当前分类下的 ${draftItems.length} 条草稿规则吗？`)) return;

    draftItems.forEach(item => {
      item.publishStatus = 'published';
    });

    this.renderItemList();
    showToast(`成功发布 ${draftItems.length} 条规则`, 'success');
  }

  batchCancel() {
    if (this.filteredItems.length === 0) {
      showToast('当前分类下没有可失效的规则', 'warning');
      return;
    }

    const publishedItems = this.filteredItems.filter(item => item.publishStatus === 'published');
    if (publishedItems.length === 0) {
      showToast('当前分类下没有已发布状态的规则', 'warning');
      return;
    }

    if (!confirm(`确定要将当前分类下的 ${publishedItems.length} 条已发布规则设为失效吗？`)) return;

    publishedItems.forEach(item => {
      item.publishStatus = 'cancelled';
    });

    this.renderItemList();
    showToast(`成功失效 ${publishedItems.length} 条规则`, 'success');
  }

  exportData() {
    if (this.filteredItems.length === 0) {
      showToast('当前分类下没有可导出的数据', 'warning');
      return;
    }

    const headers = ['序号', '项目分类', '操作项目', '收费项目', '仓库操作项目', '计费单位', '计费模式', '单价', '状态'];
    const rows = this.filteredItems.map((item, index) => [
      index + 1,
      item.categoryName,
      item.operationName,
      item.feeItem,
      item.warehouseOperation || '-',
      item.unit || '-',
      item.chargeMode || '-',
      item.unitPrice || '-',
      item.publishStatus === 'published' ? '已发布' : item.publishStatus === 'draft' ? '草稿' : '已作废'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `入库费规则_${this.currentCategory}_${new Date().toLocaleDateString()}.csv`;
    link.click();

    showToast(`成功导出 ${this.filteredItems.length} 条数据`, 'success');
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function switchMainTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.main-content').forEach(content => content.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.getElementById(`main-${tabName}`).classList.add('active');
}

const engine = new InboundFeeRuleEngine();
