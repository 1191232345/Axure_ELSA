/**
 * 入库费规则管理系统 - 树形渲染引擎 v2.0
 * 功能：树形数据展示、展开/折叠、智能筛选、CRUD操作
 */

class InboundFeeRuleEngine {
  constructor() {
    this.treeData = null;
    this.filteredData = null;
    this.selectedNodes = new Set();
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindEvents();
    this.renderTree();
    this.updateStatistics();
  }

  // 加载数据
  async loadData() {
    try {
      const response = await fetch('data/inbound-fee-rule-data.json');
      this.treeData = await response.json();
      this.filteredData = JSON.parse(JSON.stringify(this.treeData));
      console.log('✅ 数据加载成功:', this.treeData.metadata);
    } catch (error) {
      console.error('❌ 数据加载失败:', error);
      showToast('数据加载失败', 'error');
    }
  }

  // 绑定事件
  bindEvents() {
    document.getElementById('btnSearch').addEventListener('click', () => this.applyFilters());
    document.getElementById('btnReset').addEventListener('click', () => this.resetFilters());
    document.getElementById('btnExpandAll').addEventListener('click', () => this.expandAll());
    document.getElementById('btnCollapseAll').addEventListener('click', () => this.collapseAll());

    document.getElementById('btnAddCategory').addEventListener('click', () => this.showAddModal('category'));
    document.getElementById('btnAddRule').addEventListener('click', () => this.showAddModal('rule'));
    document.getElementById('btnBatchPublish').addEventListener('click', () => this.batchPublish());
    document.getElementById('btnExport').addEventListener('click', () => this.exportData());

    ['filterCategory', 'filterOperation', 'filterChargeMode', 'filterPublishStatus'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => this.applyFilters());
    });

    document.getElementById('filterKeyword').addEventListener('input', debounce(() => this.applyFilters(), 300));
  }

  // 应用筛选条件
  applyFilters() {
    const filters = {
      category: document.getElementById('filterCategory').value,
      operation: document.getElementById('filterOperation').value,
      chargeMode: document.getElementById('filterChargeMode').value,
      publishStatus: document.getElementById('filterPublishStatus').value,
      keyword: document.getElementById('filterKeyword').value.trim().toLowerCase()
    };

    if (!filters.category && !filters.operation && !filters.chargeMode &&
        !filters.publishStatus && !filters.keyword) {
      this.filteredData = JSON.parse(JSON.stringify(this.treeData));
    } else {
      this.filteredData = this.filterTreeData(this.treeData, filters);
    }

    this.renderTree();
    this.updateStatistics();

    if (this.filteredData.categories.length === 0) {
      showToast('未找到匹配的规则', 'warning');
    }
  }

  // 递归筛选树数据
  filterTreeData(data, filters) {
    const result = {
      categories: data.categories.map(cat => {
        let categoryMatch = true;

        if (filters.category && cat.name !== filters.category) {
          categoryMatch = false;
        }

        const filteredOperations = cat.children.map(op => {
          let operationMatch = true;

          if (filters.operation && op.name !== filters.operation) {
            operationMatch = false;
          }

          const filteredRules = op.children.filter(rule => {
            if (!operationMatch && !categoryMatch) return false;

            if (filters.publishStatus && rule.publishStatus !== filters.publishStatus) return false;

            if (filters.keyword) {
              const searchStr = `${rule.feeItem} ${rule.warehouseOperation} ${rule.unit} ${rule.remark || ''}`.toLowerCase();
              if (!searchStr.includes(filters.keyword)) return false;

              const pricingMatch = rule.pricingRules.some(pr =>
                `${pr.spec} ${pr.remark || ''}`.toLowerCase().includes(filters.keyword)
              );
              if (!pricingMatch) return false;
            }

            return true;
          });

          return { ...op, children: filteredRules };
        }).filter(op => op.children.length > 0);

        return { ...cat, children: filteredOperations };
      }).filter(cat => cat.children.length > 0),
      metadata: data.metadata
    };

    return result;
  }

  // 重置筛选
  resetFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterOperation').value = '';
    document.getElementById('filterChargeMode').value = '';
    document.getElementById('filterPublishStatus').value = '';
    document.getElementById('filterKeyword').value = '';

    this.filteredData = JSON.parse(JSON.stringify(this.treeData));
    this.renderTree();
    this.updateStatistics();
    showToast('已重置所有筛选条件', 'success');
  }

  // 渲染树形表格（核心方法）
  renderTree() {
    const tbody = document.getElementById('treeTableBody');
    tbody.innerHTML = '';

    if (!this.filteredData || !this.filteredData.categories) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; padding:60px; color:#8B93A5;">
            <i class="fa fa-inbox" style="font-size:48px; margin-bottom:16px; display:block; opacity:0.3;"></i>
            <div style="font-size:15px;">暂无数据</div>
          </td>
        </tr>`;
      return;
    }

    this.filteredData.categories.forEach((cat, catIndex) => {
      this.renderCategoryRow(tbody, cat, catIndex);
    });
  }

  // 渲染一级分类行
  renderCategoryRow(tbody, category, index) {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = category.expanded !== false;

    const row = document.createElement('tr');
    row.className = `tree-row-level-${category.level}`;
    row.id = `row_${category.id}`;
    row.innerHTML = `
      <td>
        ${hasChildren ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}"
                                onclick="engine.toggleNode('${category.id}')">
                            <i class="fa fa-angle-right"></i>
                          </button>` : '<span style="width:26px"></span>'}
      </td>
      <td class="tree-cell-category tree-indent-${category.level}">
        <span class="category-icon level-${category.level}">${index + 1}</span>
        <span>${category.name}</span>
      </td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td><span class="status-badge status-published"><span class="status-dot"></span>生效中</span></td>
      <td>
        <div class="action-group">
          <button class="action-btn" title="编辑分类" onclick="engine.editNode('${category.id}', 'category')">
            <i class="fa fa-edit"></i>
          </button>
          <button class="action-btn" title="添加操作项" onclick="engine.addChild('${category.id}', 'operation')">
            <i class="fa fa-plus"></i>
          </button>
          <button class="action-btn danger" title="删除分类" onclick="engine.deleteNode('${category.id}')">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    if (hasChildren && isExpanded) {
      const childContainer = document.createElement('tr');
      childContainer.innerHTML = `<td colspan="9"><div class="tree-children" id="children_${category.id}"></div></td>`;
      tbody.appendChild(childContainer);

      const childDiv = childContainer.querySelector(`#children_${category.id}`);
      category.children.forEach((op, opIndex) => {
        this.renderOperationRow(childDiv, op, opIndex);
      });
    }
  }

  // 渲染二级行（操作项目）
  renderOperationRow(container, operation, index) {
    const hasChildren = operation.children && operation.children.length > 0;
    const isExpanded = operation.expanded !== false;

    const tableHTML = `
      <table style="width:100%; border-collapse:collapse;">
        <tbody>
          <tr class="tree-row-level-${operation.level}" id="row_${operation.id}">
            <td style="width:50px;">
              ${hasChildren ? `<button class="tree-toggle-btn ${isExpanded ? 'expanded' : ''}"
                                      onclick="engine.toggleNode('${operation.id}')">
                                  <i class="fa fa-angle-right"></i>
                                </button>` : '<span style="width:26px"></span>'}
            </td>
            <td style="width:180px;" class="tree-cell-category tree-indent-${operation.level}">
              <span class="category-icon level-${operation.level}">${index + 1}</span>
              <span>${operation.name}</span>
            </td>
            <td style="width:200px;"></td>
            <td style="width:120px;"></td>
            <td style="width:150px;"></td>
            <td style="flex:1;"></td>
            <td style="width:350px;"></td>
            <td style="width:80px;"><span class="status-badge status-published"><span class="status-dot"></span>生效中</span></td>
            <td style="width:100px;">
              <div class="action-group">
                <button class="action-btn" title="编辑操作项" onclick="engine.editNode('${operation.id}', 'operation')">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="action-btn" title="添加规则" onclick="engine.addChild('${operation.id}', 'rule')">
                  <i class="fa fa-plus"></i>
                </button>
                <button class="action-btn danger" title="删除操作项" onclick="engine.deleteNode('${operation.id}')">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>`;

    container.insertAdjacentHTML('beforeend', tableHTML);

    if (hasChildren && isExpanded) {
      const lastTable = container.lastElementChild.querySelector('tbody');
      const childContainer = document.createElement('tr');
      childContainer.innerHTML = `<td colspan="9"><div class="tree-children" id="children_${operation.id}"></div></td>`;
      lastTable.appendChild(childContainer);

      const childDiv = childContainer.querySelector(`#children_${operation.id}`);
      operation.children.forEach(rule => {
        this.renderRuleRow(childDiv, rule);
      });
    }
  }

  // 渲染三级行（具体规则）
  renderRuleRow(container, rule) {
    const statusClass = rule.publishStatus === 'published' ? 'status-published' : 'status-draft';
    const statusText = rule.publishStatus === 'published' ? '已发布' : '草稿';

    const hasPricingRules = rule.pricingRules && rule.pricingRules.length > 0;
    const priceHTML = this.generatePriceHTML(rule);

    const remarkHTML = (rule.remark || rule.condition) ?
      `<div class="remark-text">
         ${rule.remark || ''}
         ${rule.condition ? `<div class="remark-condition">${rule.condition}</div>` : ''}
         ${hasPricingRules && rule.pricingRules.length > 1 ? '<div class="remark-condition">多档计费规则</div>' : ''}
       </div>` :
      '<span style="color:#8B93A5;">-</span>';

    const calcExampleHTML = rule.calculationExample ?
      `<div class="calc-example-cell">
         ${this.formatCalculationExample(rule.calculationExample)}
       </div>` :
      '<span style="color:#8B93A5;">-</span>';

    const tableHTML = `
      <table style="width:100%; border-collapse:collapse;">
        <tbody>
          <tr class="tree-row-level-${rule.level}" id="row_${rule.id}">
            <td style="width:50px;"><span style="width:26px;display:inline-block"></span></td>
            <td style="width:180px;" class="tree-cell-category tree-indent-${rule.level}">
              <span class="category-icon level-${rule.level}">R</span>
              <span>${rule.feeItem}</span>
            </td>
            <td style="width:200px;">${rule.warehouseOperation || '-'}</td>
            <td style="width:120px;">${rule.unit || '-'}</td>
            <td style="width:150px;">${priceHTML}</td>
            <td style="flex:1;min-width:300px;">${remarkHTML}</td>
            <td style="width:350px;">${calcExampleHTML}</td>
            <td style="width:80px;">
              <span class="status-badge ${statusClass}">
                <span class="status-dot"></span>${statusText}
              </span>
            </td>
            <td style="width:100px;">
              <div class="action-group">
                <button class="action-btn" title="查看详情" onclick="engine.viewDetail('${rule.id}')">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="action-btn" title="编辑规则" onclick="engine.editNode('${rule.id}', 'rule')">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="action-btn danger" title="删除规则" onclick="engine.deleteNode('${rule.id}')">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>`;

    container.insertAdjacentHTML('beforeend', tableHTML);
  }

  // 生成价格显示HTML
  generatePriceHTML(rule) {
    if (!rule.pricingRules || rule.pricingRules.length === 0) {
      if (rule.unitPrice !== undefined && rule.unitPrice !== null) {
        return `<span class="price-display">¥${rule.unitPrice}/${rule.chargeMode || rule.unit || ''}</span>`;
      }
      if (rule.weightTiers && rule.weightTiers.length > 0) {
        return `<div class="price-tier-list">
                 ${rule.weightTiers.map(wt => `
                   <div class="price-tier-item">
                     <span class="tier-spec">${wt.range}</span>
                     <span class="tier-price">¥${wt.price}/${wt.unit}</span>
                   </div>
                 `).join('')}
               </div>`;
      }
      return '<span style="color:#8B93A5;">-</span>';
    }

    return rule.pricingRules.length === 1 ?
      `<span class="price-display">¥${rule.pricingRules[0].price}</span>` :
      `<div class="price-tier-list">
         ${rule.pricingRules.map(pr => `
           <div class="price-tier-item">
             <span class="tier-spec">${pr.spec}</span>
             <span class="tier-price">¥${pr.price}</span>
           </div>
         `).join('')}
       </div>`;
  }

  // 格式化计费举例文本
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

  // 展开/折叠节点
  toggleNode(nodeId) {
    const node = this.findNodeById(nodeId);
    if (!node) return;

    node.expanded = !node.expanded;
    this.renderTree();
  }

  expandAll() {
    this.expandAllNodes(this.filteredData.categories);
    this.renderTree();
    showToast('已展开所有节点', 'success');
  }

  collapseAll() {
    this.collapseAllNodes(this.filteredData.categories);
    this.renderTree();
    showToast('已折叠所有节点', 'success');
  }

  expandAllNodes(nodes) {
    nodes.forEach(node => {
      node.expanded = true;
      if (node.children) {
        this.expandAllNodes(node.children);
      }
    });
  }

  collapseAllNodes(nodes) {
    nodes.forEach(node => {
      node.expanded = false;
      if (node.children) {
        this.collapseAllNodes(node.children);
      }
    });
  }

  // 查找节点
  findNodeById(nodeId, categories = null) {
    const cats = categories || this.filteredData.categories;

    for (const cat of cats) {
      if (cat.id === nodeId) return cat;

      if (cat.children) {
        for (const op of cat.children) {
          if (op.id === nodeId) return op;

          if (op.children) {
            for (const rule of op.children) {
              if (rule.id === nodeId) return rule;
            }
          }
        }
      }
    }
    return null;
  }

  // 更新统计信息
  updateStatistics() {
    let totalCategories = 0;
    let totalOperations = 0;
    let totalRules = 0;

    if (this.filteredData && this.filteredData.categories) {
      totalCategories = this.filteredData.categories.length;

      this.filteredData.categories.forEach(cat => {
        if (cat.children) {
          totalOperations += cat.children.length;

          cat.children.forEach(op => {
            if (op.children) {
              totalRules += op.children.length;
            }
          });
        }
      });
    }

    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalOperations').textContent = totalOperations;
    document.getElementById('totalRules').textContent = totalRules;
  }

  // CRUD 操作
  showAddModal(type) {
    console.log(`显示添加${type}弹窗`);
    showToast(`添加功能开发中...`, 'warning');
  }

  addChild(parentId, childType) {
    console.log(`在 ${parentId} 下添加 ${childType}`);
    showToast(`添加子节点功能开发中...`, 'warning');
  }

  editNode(nodeId, nodeType) {
    console.log(`编辑 ${nodeType}: ${nodeId}`);
    showToast(`编辑功能开发中...`, 'warning');
  }

  deleteNode(nodeId) {
    if (confirm('确定要删除该节点吗？此操作不可恢复！')) {
      console.log(`删除节点: ${nodeId}`);
      showToast('删除功能开发中...', 'warning');
    }
  }

  viewDetail(ruleId) {
    const rule = this.findNodeById(ruleId);
    if (!rule) return;

    this.showDetailModal(rule);
  }

  showDetailModal(rule) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fa fa-file-text-o" style="color:#E8A838;"></i>
            规则详情 - ${rule.feeItem}
          </h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">收费项目</label>
            <input type="text" class="form-input" value="${rule.feeItem}" disabled>
          </div>

          <div class="form-group">
            <label class="form-label">仓库操作</label>
            <input type="text" class="form-input" value="${rule.warehouseOperation}" disabled>
          </div>

          <div class="form-group">
            <label class="form-label">计费单位</label>
            <input type="text" class="form-input" value="${rule.unit}" disabled>
          </div>

          <div class="form-group">
            <label class="form-label">费率规则</label>
            ${rule.pricingRules.map(pr => `
              <div style="background:#F9FAFB; padding:12px; border-radius:8px; margin-bottom:8px; border-left:3px solid #E8A838;">
                <strong style="color:#1B3A4B;">规格：</strong>${pr.spec}<br>
                <strong style="color:#C44536; font-size:18px;">价格：¥${pr.price}</strong><br>
                ${pr.remark ? `<small style="color:#8B93A5;">备注：${pr.remark}</small>` : ''}
              </div>
            `).join('')}
          </div>

          ${rule.calculationExample ? `
          <div class="form-group">
            <label class="form-label">计费举例</label>
            <div style="background:#FFFBEB; padding:14px; border-radius:8px; border:1px solid #FDE68A; font-size:13px; line-height:1.7;">
              ${this.formatCalculationExample(rule.calculationExample)}
            </div>
          </div>
          ` : ''}

          <div class="form-group">
            <label class="form-label">状态</label>
            <span class="status-badge ${rule.publishStatus === 'published' ? 'status-published' : 'status-draft'}">
              <span class="status-dot"></span>
              ${rule.publishStatus === 'published' ? '已发布' : '草稿'}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">有效期</label>
            <input type="text" class="form-input" value="${rule.validityPeriod || '-'}" disabled>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">关闭</button>
          <button class="btn btn-primary" onclick="engine.editNode('${rule.id}', 'rule'); this.closest('.modal-overlay').remove();">
            <i class="fa fa-edit mr-1"></i> 编辑规则
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  batchPublish() {
    if (this.selectedNodes.size === 0) {
      showToast('请先选择要发布的规则', 'warning');
      return;
    }

    if (confirm(`确定要批量发布选中的 ${this.selectedNodes.size} 条规则吗？`)) {
      console.log('批量发布:', Array.from(this.selectedNodes));
      showToast(`成功发布 ${this.selectedNodes.size} 条规则`, 'success');
      this.selectedNodes.clear();
      this.renderTree();
    }
  }

  exportData() {
    const dataStr = JSON.stringify(this.filteredData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `入库费规则_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('数据导出成功！', 'success');
  }
}

// 工具函数：防抖
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Toast 提示组件
function showToast(message, type = 'success') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Tab 切换功能（与仓储规则完全一致）
function switchMainTab(tabName) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.id === `tab-${tabName}`) {
      tab.classList.add('active');
    }
  });

  document.querySelectorAll('.main-content').forEach(content => {
    content.classList.remove('active');
  });

  const targetContent = document.getElementById(`main-${tabName}`);
  if (targetContent) {
    targetContent.classList.add('active');
  }
}

// 初始化引擎
let engine;
document.addEventListener('DOMContentLoaded', () => {
  engine = new InboundFeeRuleEngine();
});