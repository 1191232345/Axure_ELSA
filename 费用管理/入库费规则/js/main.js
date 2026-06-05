/**
 * 入库费规则管理系统 - 分类Tab展示模式 v6.0
 * 功能：通过Tab栏切换不同分类，展示对应费用类型
 */

class InboundFeeRuleEngine {
  constructor() {
    this.treeData = null;
    this.flatItems = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.flattenData();
    this.bindEvents();
    this.renderItemList();
    this.updateStatistics();
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

    console.log(`✅ 数据扁平化完成，共 ${this.flatItems.length} 个费用类型`);
  }

  bindEvents() {
    document.getElementById('btnAddRule').addEventListener('click', () => this.showAddModal());
    document.getElementById('btnExport').addEventListener('click', () => this.exportData());
  }

  renderItemList() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (!this.flatItems || this.flatItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center; padding:60px; color:#8B93A5;">
            <i class="fa fa-inbox" style="font-size:48px; margin-bottom:16px; display:block; opacity:0.3;"></i>
            <div style="font-size:15px;">暂无费用类型数据</div>
            <div style="font-size:13px; margin-top:8px;">点击"新增规则"开始配置入库费规则</div>
          </td>
        </tr>`;
      return;
    }

    this.flatItems.forEach((item, index) => {
      const row = this.createItemRow(item, index);
      tbody.appendChild(row);
    });
  }

  createItemRow(item, index) {
    const row = document.createElement('tr');
    row.className = 'cursor-pointer hover:bg-hover transition-colors';
    
    let feeItemDisplay = '';
    if (item.subCategory) {
      feeItemDisplay = `
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div style="font-weight:600; color:#1B3A4B;">${item.feeItem}</div>
          <div style="color:#5A6275; font-size:13px; padding-left:12px;">${item.subCategory}</div>
        </div>
      `;
    } else {
      feeItemDisplay = `<span style="font-weight:600; color:#1B3A4B;">${item.feeItem}</span>`;
    }
    
    row.innerHTML = `
      <td style="text-align:center; font-weight:600; color:#1B3A4B;">${index + 1}</td>
      <td style="color:#5A6275;">${item.categoryName}</td>
      <td>${feeItemDisplay}</td>
      <td>${item.unit || '-'}</td>
      <td>${item.creator || '-'}</td>
      <td>${item.createTime || '-'}</td>
      <td>${item.updater || '-'}</td>
      <td>${item.updateTime || '-'}</td>
      <td style="color:${item.expireTime && new Date(item.expireTime) < new Date() ? '#C44536' : '#5A6275'};">${item.expireTime || '-'}</td>
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
    const totalItems = this.flatItems.length;
    document.getElementById('statisticsText').innerHTML = `共 <strong>${totalItems}</strong> 个费用类型`;
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

    let feeItemDisplay = '';
    if (item.subCategory) {
      feeItemDisplay = `
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="font-weight:600; color:#1B3A4B; font-size:15px;">${item.feeItem}</div>
          <div style="color:#5A6275; font-size:14px; padding-left:16px;">${item.subCategory}</div>
        </div>
      `;
    } else {
      feeItemDisplay = `
        <span style="font-weight:600; color:#1B3A4B; font-size:15px;">${item.feeItem}</span>
      `;
    }

    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width:800px;">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-file-text-o" style="color:#E8A838;"></i>
            费用类型详情
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
            <div class="form-group">
              <label class="form-label">收费分类</label>
              <input type="text" class="form-input" value="${item.categoryName}" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">费用类型</label>
              <div style="padding:8px 12px; background:#F9FAFB; border-radius:6px; border:1px solid #D8D5CE;">
                ${feeItemDisplay}
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">计费单位</label>
            <input type="text" class="form-input" value="${item.unit || '-'}" disabled>
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
    document.getElementById('addCategory').value = '入库';
    this.updateFeeItemTree();
    document.getElementById('addFeeItemTree').value = 'level1_入库_整柜入库卸货费';
    this.onFeeItemTreeChange();
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
              <label class="form-label">费用组 <span style="color:#C44536;">*</span></label>
              <select id="addCategory" class="form-input" onchange="engine.updateFeeItemTree()">
                <option value="">请选择分类</option>
                <option value="入库">入库</option>
                <option value="出库">出库</option>
                <option value="仓储">仓储</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">费用类型 <span style="color:#C44536;">*</span></label>
              <div style="position:relative;" id="feeItemTreeContainer">
                <select id="addFeeItemTree" class="form-input" onchange="engine.onFeeItemTreeChange()" style="appearance:none;">
                  <option value="">请先选择收费分类</option>
                </select>
                <i class="fa fa-angle-down" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none; color:#8B93A5;"></i>
              </div>
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
              <option value="个">个</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">失效时间</label>
            <input type="date" id="addExpireTime" class="form-input" placeholder="选择失效时间">
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
              <textarea id="addCalculationExample" class="form-input" rows="4" placeholder="示例：&#10;计费公式：费用 = 单价 × 数量&#10;举例：卸柜1个20GP柜&#10;计算：350$ × 1 = 350$"></textarea>
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
    this.updateFeeItemTree();
  }

  updateFeeItemTree() {
    const category = document.getElementById('addCategory').value;
    const feeItemSelect = document.getElementById('addFeeItemTree');
    
    feeItemSelect.innerHTML = '<option value="">请选择费用类型</option>';
    
    if (!category) {
      feeItemSelect.innerHTML = '<option value="">请先选择收费分类</option>';
      return;
    }

    // 费用类型树形数据 - 融合收费分类枚举进行拼接（分类+一级+二级合并）
    const feeItemTreeData = {
      '入库': [
        {
          level: 1,
          name: '整柜入库卸货费',
          value: 'level1_入库_整柜入库卸货费',
          children: []
        },
        {
          level: 1,
          name: '整柜入库附加费',
          value: 'level1_入库_整柜入库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_入库_整柜入库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_入库_整柜入库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_入库_整柜入库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_入库_整柜入库附加费_分货费' },
            { level: 2, name: '拆托费', value: 'level2_入库_整柜入库附加费_拆托费' },
            { level: 2, name: '拍照费', value: 'level2_入库_整柜入库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_入库_整柜入库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '快递散货入库卸货费',
          value: 'level1_入库_快递散货入库卸货费',
          children: []
        },
        {
          level: 1,
          name: '快递散货入库附加费',
          value: 'level1_入库_快递散货入库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_入库_快递散货入库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_入库_快递散货入库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_入库_快递散货入库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_入库_快递散货入库附加费_分货费' },
            { level: 2, name: '拍照费', value: 'level2_入库_快递散货入库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_入库_快递散货入库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '托盘入库卸货费',
          value: 'level1_入库_托盘入库卸货费',
          children: []
        },
        {
          level: 1,
          name: '托盘入库附加费',
          value: 'level1_入库_托盘入库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_入库_托盘入库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_入库_托盘入库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_入库_托盘入库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_入库_托盘入库附加费_分货费' },
            { level: 2, name: '拆托费', value: 'level2_入库_托盘入库附加费_拆托费' },
            { level: 2, name: '拍照费', value: 'level2_入库_托盘入库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_入库_托盘入库附加费_换标费' }
          ]
        }
      ],
      '出库': [
        {
          level: 1,
          name: '整柜出库卸货费',
          value: 'level1_出库_整柜出库卸货费',
          children: []
        },
        {
          level: 1,
          name: '整柜出库附加费',
          value: 'level1_出库_整柜出库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_出库_整柜出库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_出库_整柜出库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_出库_整柜出库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_出库_整柜出库附加费_分货费' },
            { level: 2, name: '拍照费', value: 'level2_出库_整柜出库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_出库_整柜出库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '快递散货出库卸货费',
          value: 'level1_出库_快递散货出库卸货费',
          children: []
        },
        {
          level: 1,
          name: '快递散货出库附加费',
          value: 'level1_出库_快递散货出库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_出库_快递散货出库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_出库_快递散货出库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_出库_快递散货出库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_出库_快递散货出库附加费_分货费' },
            { level: 2, name: '拍照费', value: 'level2_出库_快递散货出库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_出库_快递散货出库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '托盘出库卸货费',
          value: 'level1_出库_托盘出库卸货费',
          children: []
        },
        {
          level: 1,
          name: '托盘出库附加费',
          value: 'level1_出库_托盘出库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_出库_托盘出库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_出库_托盘出库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_出库_托盘出库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_出库_托盘出库附加费_分货费' },
            { level: 2, name: '拆托费', value: 'level2_出库_托盘出库附加费_拆托费' },
            { level: 2, name: '拍照费', value: 'level2_出库_托盘出库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_出库_托盘出库附加费_换标费' }
          ]
        }
      ],
      '仓储': [
        {
          level: 1,
          name: '整柜仓储费',
          value: 'level1_仓储_整柜仓储费',
          children: []
        },
        {
          level: 1,
          name: '整柜仓储附加费',
          value: 'level1_仓储_整柜仓储附加费',
          children: [
            { level: 2, name: '超期费', value: 'level2_仓储_整柜仓储附加费_超期费' },
            { level: 2, name: '超面积费', value: 'level2_仓储_整柜仓储附加费_超面积费' },
            { level: 2, name: '温控费', value: 'level2_仓储_整柜仓储附加费_温控费' }
          ]
        },
        {
          level: 1,
          name: '快递散货仓储费',
          value: 'level1_仓储_快递散货仓储费',
          children: []
        },
        {
          level: 1,
          name: '快递散货仓储附加费',
          value: 'level1_仓储_快递散货仓储附加费',
          children: [
            { level: 2, name: '超期费', value: 'level2_仓储_快递散货仓储附加费_超期费' },
            { level: 2, name: '超面积费', value: 'level2_仓储_快递散货仓储附加费_超面积费' },
            { level: 2, name: '温控费', value: 'level2_仓储_快递散货仓储附加费_温控费' }
          ]
        },
        {
          level: 1,
          name: '托盘仓储费',
          value: 'level1_仓储_托盘仓储费',
          children: []
        },
        {
          level: 1,
          name: '托盘仓储附加费',
          value: 'level1_仓储_托盘仓储附加费',
          children: [
            { level: 2, name: '超期费', value: 'level2_仓储_托盘仓储附加费_超期费' },
            { level: 2, name: '超面积费', value: 'level2_仓储_托盘仓储附加费_超面积费' },
            { level: 2, name: '温控费', value: 'level2_仓储_托盘仓储附加费_温控费' }
          ]
        }
      ],
      '其他': [
        {
          level: 1,
          name: '服务费',
          value: 'level1_其他_服务费',
          children: []
        },
        {
          level: 1,
          name: '其他费用',
          value: 'level1_其他_其他费用',
          children: [
            { level: 2, name: '特殊操作费', value: 'level2_其他_其他费用_特殊操作费' },
            { level: 2, name: '代办费', value: 'level2_其他_其他费用_代办费' },
            { level: 2, name: '手续费', value: 'level2_其他_其他费用_手续费' }
          ]
        }
      ]
    };

    const treeItems = feeItemTreeData[category] || [];
    
    treeItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `├ ${item.name}`;
        
        item.children.forEach(child => {
          const option = document.createElement('option');
          option.value = child.value;
          option.textContent = `│  └─ ${child.name}`;
          option.dataset.level = child.level;
          option.dataset.parentName = item.name;
          option.dataset.feeItemName = child.name;
          optgroup.appendChild(option);
        });
        
        feeItemSelect.appendChild(optgroup);
      } else {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.name;
        option.dataset.level = item.level;
        option.dataset.feeItemName = item.name;
        feeItemSelect.appendChild(option);
      }
    });

    if (feeItemSelect.options.length > 1) {
      feeItemSelect.selectedIndex = 1;
      this.onFeeItemTreeChange();
    }
  }

  onFeeItemTreeChange() {
    const select = document.getElementById('addFeeItemTree');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
      return;
    }

    const level = parseInt(selectedOption.dataset.level);
    const feeItemName = selectedOption.dataset.feeItemName;
    
    if (level === 2) {
      // 二级费用类型 - 显示阶梯价格表格
      this.showTierPricingForm();
    } else {
      // 一级费用类型 - 判断是否包含"卸货费"字样
      if (feeItemName.includes('卸货费')) {
        // 包含"卸货费"字样的一级费用类型 - 显示费率标准表格
        this.showPricingTableForm();
      } else if (feeItemName.includes('附加费')) {
        // 包含"附加费"字样的一级费用类型 - 显示费率规则文本区
        this.showPricingTextForm();
      } else {
        // 其他一级费用类型（如仓储费、服务费等）- 显示费率规则文本区
        this.showPricingTextForm();
      }
    }
  }

  showPricingTableForm() {
    document.getElementById('pricingTableSection').style.display = 'block';
    document.getElementById('pricingTextSection').style.display = 'none';
    document.getElementById('tierPricingSection').style.display = 'none';
    
    const tbody = document.getElementById('pricingTableBody');
    tbody.innerHTML = '';
    this.addPricingRow();
  }

  showTierPricingForm() {
    document.getElementById('pricingTableSection').style.display = 'none';
    document.getElementById('pricingTextSection').style.display = 'none';
    document.getElementById('tierPricingSection').style.display = 'block';
  }

  showPricingTextForm() {
    document.getElementById('pricingTableSection').style.display = 'none';
    document.getElementById('pricingTextSection').style.display = 'block';
    document.getElementById('tierPricingSection').style.display = 'none';
  }

  hideAllForms() {
    document.getElementById('pricingTableSection').style.display = 'none';
    document.getElementById('pricingTextSection').style.display = 'block';
    document.getElementById('tierPricingSection').style.display = 'none';
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
    } else if (category === '快递散货入库') {
      specOptions = `
        <option value="小件">小件</option>
        <option value="中件">中件</option>
        <option value="大件">大件</option>
        <option value="超大件">超大件</option>
        <option value="轻货">轻货</option>
        <option value="重货">重货</option>
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
      // 一级费用类型: level1_分类_费用类型名（如：level1_入库_整柜入库卸货费）
      feeItem = parts[2]; // 如：整柜入库卸货费
    } else if (selectedFeeItemValue.startsWith('level2_')) {
      // 二级费用类型: level2_分类_一级费用类型名_二级费用类型名（如：level2_入库_整柜入库附加费_SKU超量费）
      feeItem = parts[2]; // 如：整柜入库附加费
      subCategory = parts[3]; // 如：SKU超量费
    }

    let pricingRules = [];
    let weightTiers = [];
    let condition = null;
    let calculationExample = null;
    let tierPricing = [];
    
    // 判断费用类型类型，决定显示哪些表单区域
    const pricingTableSection = document.getElementById('pricingTableSection');
    const tierPricingSection = document.getElementById('tierPricingSection');
    
    if (pricingTableSection && pricingTableSection.style.display !== 'none') {
      // 费率标准表格
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
      // 阶梯价格表格
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
      // 文本输入区域
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
      expireTime: document.getElementById('addExpireTime')?.value || null,
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
              <label class="form-label">收费分类</label>
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

          <div class="form-group" style="margin-bottom:16px;">
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

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">失效时间</label>
            <input type="date" id="editExpireTime" class="form-input" value="${item.expireTime || ''}" placeholder="选择失效时间">
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
              <label class="form-label">计费举例</label>
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
      // 有二级费用类型
      const level2Value = `level2_${item.categoryName}_${item.subCategory}`;
      editFeeItemTree.value = level2Value;
    } else {
      // 只有一级费用类型
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
  }

  updateEditFeeItemTree(category) {
    const feeItemSelect = document.getElementById('editFeeItemTree');
    
    feeItemSelect.innerHTML = '<option value="">请选择费用类型</option>';
    
    if (!category) {
      feeItemSelect.innerHTML = '<option value="">请先选择收费分类</option>';
      return;
    }

    // 费用类型树形数据 - 融合收费分类枚举进行拼接（分类+一级+二级合并）
    const feeItemTreeData = {
      '入库': [
        {
          level: 1,
          name: '整柜入库卸货费',
          value: 'level1_入库_整柜入库卸货费',
          children: []
        },
        {
          level: 1,
          name: '整柜入库附加费',
          value: 'level1_入库_整柜入库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_入库_整柜入库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_入库_整柜入库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_入库_整柜入库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_入库_整柜入库附加费_分货费' },
            { level: 2, name: '拆托费', value: 'level2_入库_整柜入库附加费_拆托费' },
            { level: 2, name: '拍照费', value: 'level2_入库_整柜入库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_入库_整柜入库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '快递散货入库卸货费',
          value: 'level1_入库_快递散货入库卸货费',
          children: []
        },
        {
          level: 1,
          name: '快递散货入库附加费',
          value: 'level1_入库_快递散货入库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_入库_快递散货入库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_入库_快递散货入库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_入库_快递散货入库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_入库_快递散货入库附加费_分货费' },
            { level: 2, name: '拍照费', value: 'level2_入库_快递散货入库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_入库_快递散货入库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '托盘入库卸货费',
          value: 'level1_入库_托盘入库卸货费',
          children: []
        },
        {
          level: 1,
          name: '托盘入库附加费',
          value: 'level1_入库_托盘入库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_入库_托盘入库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_入库_托盘入库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_入库_托盘入库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_入库_托盘入库附加费_分货费' },
            { level: 2, name: '拆托费', value: 'level2_入库_托盘入库附加费_拆托费' },
            { level: 2, name: '拍照费', value: 'level2_入库_托盘入库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_入库_托盘入库附加费_换标费' }
          ]
        }
      ],
      '出库': [
        {
          level: 1,
          name: '整柜出库卸货费',
          value: 'level1_出库_整柜出库卸货费',
          children: []
        },
        {
          level: 1,
          name: '整柜出库附加费',
          value: 'level1_出库_整柜出库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_出库_整柜出库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_出库_整柜出库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_出库_整柜出库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_出库_整柜出库附加费_分货费' },
            { level: 2, name: '拍照费', value: 'level2_出库_整柜出库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_出库_整柜出库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '快递散货出库卸货费',
          value: 'level1_出库_快递散货出库卸货费',
          children: []
        },
        {
          level: 1,
          name: '快递散货出库附加费',
          value: 'level1_出库_快递散货出库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_出库_快递散货出库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_出库_快递散货出库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_出库_快递散货出库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_出库_快递散货出库附加费_分货费' },
            { level: 2, name: '拍照费', value: 'level2_出库_快递散货出库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_出库_快递散货出库附加费_换标费' }
          ]
        },
        {
          level: 1,
          name: '托盘出库卸货费',
          value: 'level1_出库_托盘出库卸货费',
          children: []
        },
        {
          level: 1,
          name: '托盘出库附加费',
          value: 'level1_出库_托盘出库附加费',
          children: [
            { level: 2, name: 'SKU超量费', value: 'level2_出库_托盘出库附加费_SKU超量费' },
            { level: 2, name: '超重费', value: 'level2_出库_托盘出库附加费_超重费' },
            { level: 2, name: '清点费', value: 'level2_出库_托盘出库附加费_清点费' },
            { level: 2, name: '分货费', value: 'level2_出库_托盘出库附加费_分货费' },
            { level: 2, name: '拆托费', value: 'level2_出库_托盘出库附加费_拆托费' },
            { level: 2, name: '拍照费', value: 'level2_出库_托盘出库附加费_拍照费' },
            { level: 2, name: '换标费', value: 'level2_出库_托盘出库附加费_换标费' }
          ]
        }
      ],
      '仓储': [
        {
          level: 1,
          name: '整柜仓储费',
          value: 'level1_仓储_整柜仓储费',
          children: []
        },
        {
          level: 1,
          name: '整柜仓储附加费',
          value: 'level1_仓储_整柜仓储附加费',
          children: [
            { level: 2, name: '超期费', value: 'level2_仓储_整柜仓储附加费_超期费' },
            { level: 2, name: '超面积费', value: 'level2_仓储_整柜仓储附加费_超面积费' },
            { level: 2, name: '温控费', value: 'level2_仓储_整柜仓储附加费_温控费' }
          ]
        },
        {
          level: 1,
          name: '快递散货仓储费',
          value: 'level1_仓储_快递散货仓储费',
          children: []
        },
        {
          level: 1,
          name: '快递散货仓储附加费',
          value: 'level1_仓储_快递散货仓储附加费',
          children: [
            { level: 2, name: '超期费', value: 'level2_仓储_快递散货仓储附加费_超期费' },
            { level: 2, name: '超面积费', value: 'level2_仓储_快递散货仓储附加费_超面积费' },
            { level: 2, name: '温控费', value: 'level2_仓储_快递散货仓储附加费_温控费' }
          ]
        },
        {
          level: 1,
          name: '托盘仓储费',
          value: 'level1_仓储_托盘仓储费',
          children: []
        },
        {
          level: 1,
          name: '托盘仓储附加费',
          value: 'level1_仓储_托盘仓储附加费',
          children: [
            { level: 2, name: '超期费', value: 'level2_仓储_托盘仓储附加费_超期费' },
            { level: 2, name: '超面积费', value: 'level2_仓储_托盘仓储附加费_超面积费' },
            { level: 2, name: '温控费', value: 'level2_仓储_托盘仓储附加费_温控费' }
          ]
        }
      ],
      '其他': [
        {
          level: 1,
          name: '服务费',
          value: 'level1_其他_服务费',
          children: []
        },
        {
          level: 1,
          name: '其他费用',
          value: 'level1_其他_其他费用',
          children: [
            { level: 2, name: '特殊操作费', value: 'level2_其他_其他费用_特殊操作费' },
            { level: 2, name: '代办费', value: 'level2_其他_其他费用_代办费' },
            { level: 2, name: '手续费', value: 'level2_其他_其他费用_手续费' }
          ]
        }
      ]
    };

    const treeItems = feeItemTreeData[category] || [];
    
    treeItems.forEach(item => {
      // 添加一级项
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.name;
      option.style.fontWeight = '600';
      feeItemSelect.appendChild(option);

      // 添加二级项
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          const childOption = document.createElement('option');
          childOption.value = child.value;
          childOption.textContent = `  └ ${child.name}`;
          childOption.style.paddingLeft = '20px';
          childOption.style.color = '#5A6275';
          feeItemSelect.appendChild(childOption);
        });
      }
    });
  }

  onEditFeeItemTreeChange() {
    const selectedValue = document.getElementById('editFeeItemTree').value;
    const pricingTableSection = document.getElementById('editPricingTableSection');
    const pricingTextSection = document.getElementById('editPricingTextSection');
    const tierPricingSection = document.getElementById('editTierPricingSection');

    // 重置所有区域
    pricingTableSection.style.display = 'none';
    tierPricingSection.style.display = 'none';
    pricingTextSection.style.display = 'block';

    if (!selectedValue) return;

    // 判断是一级还是二级费用类型
    if (selectedValue.startsWith('level1_')) {
      // 一级费用类型 - 判断是否包含"卸货费"字样
      const parts = selectedValue.split('_');
      const feeItemName = parts[2]; // 如：整柜入库卸货费
      
      if (feeItemName.includes('卸货费')) {
        // 包含"卸货费"字样的一级费用类型 - 显示费率标准表格
        pricingTableSection.style.display = 'block';
        pricingTextSection.style.display = 'none';
      } else if (feeItemName.includes('附加费')) {
        // 包含"附加费"字样的一级费用类型 - 显示费率规则文本区
        pricingTextSection.style.display = 'block';
      } else {
        // 其他一级费用类型（如仓储费、服务费等）- 显示费率规则文本区
        pricingTextSection.style.display = 'block';
      }
    } else if (selectedValue.startsWith('level2_')) {
      // 二级费用类型 - 显示阶梯价格表格
      tierPricingSection.style.display = 'block';
      pricingTextSection.style.display = 'none';
    }
  }

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
  }

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
  }

  saveEditRule(ruleId) {
    const item = this.flatItems.find(i => i.id === ruleId);
    if (!item) return;

    // 解析费用类型树形选择值
    const selectedValue = document.getElementById('editFeeItemTree').value;
    if (!selectedValue) {
      showToast('请选择费用类型', 'error');
      return;
    }

    // 解析费用类型名称
    const parts = selectedValue.split('_');
    if (selectedValue.startsWith('level1_')) {
      // 一级费用类型: level1_分类_费用类型名（如：level1_入库_整柜入库卸货费）
      item.feeItem = parts[2]; // 如：整柜入库卸货费
      item.subCategory = null;
    } else if (selectedValue.startsWith('level2_')) {
      // 二级费用类型: level2_分类_一级费用类型名_二级费用类型名（如：level2_入库_整柜入库附加费_SKU超量费）
      item.feeItem = parts[2]; // 如：整柜入库附加费
      item.subCategory = parts[3]; // 如：SKU超量费
    }

    item.unit = document.getElementById('editUnit').value;
    item.condition = document.getElementById('editCondition').value || null;
    item.calculationExample = document.getElementById('editCalculationExample').value || null;
    item.remark = document.getElementById('editRemark').value || null;
    item.expireTime = document.getElementById('editExpireTime').value || null;

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

  exportData() {
    if (this.filteredItems.length === 0) {
      showToast('当前分类下没有可导出的数据', 'warning');
      return;
    }

    const headers = ['序号', '收费分类', '操作项目', '费用类型', '仓库操作项目', '计费单位', '计费模式', '单价', '状态'];
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

function togglePrdLogic(moduleId) {
  const content = document.getElementById(`${moduleId}-logic-content`);
  const icon = document.getElementById(`${moduleId}-logic-icon`);
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
}

const engine = new InboundFeeRuleEngine();
