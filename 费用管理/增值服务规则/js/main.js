/**
 * 增值服务规则管理系统 - 核心引擎
 * 功能：数据加载、渲染、事件绑定
 * 其他方法通过原型扩展在各模块文件中定义
 */

class ValueAddedServiceEngine {
  constructor() {
    this.treeData = null;
    this.flatItems = [];
    this.filteredItems = [];
    this.currentCategory = '增值服务';
    this.init();
  }

  init() {
    this.loadData();
    this.flattenData();
    this.bindEvents();
    this.renderItemList();
    this.updateStatistics();
  }

  loadData() {
    this.treeData = valueAddedServiceData;
    console.log('✅ 数据加载成功:', this.treeData.metadata);
  }

  flattenData() {
    this.flatItems = [];

    if (!this.treeData || !this.treeData.categories) return;

    this.treeData.categories.forEach(category => {
      const categoryName = category.name;
      const feeGroup = category.feeGroup || categoryName;

      if (category.children) {
        category.children.forEach(operation => {
          const operationName = operation.name;

          if (operation.children) {
            operation.children.forEach(rule => {
              this.flatItems.push({
                ...rule,
                categoryName: categoryName,
                feeGroup: feeGroup,
                operationName: operationName,
                categoryId: category.id,
                operationId: operation.id
              });
            });
          }
        });
      }
    });

    this.filteredItems = this.flatItems.filter(
      item => item.categoryName.includes(this.currentCategory) || item.feeGroup?.includes(this.currentCategory)
    );

    console.log(`✅ 数据扁平化完成，共 ${this.flatItems.length} 个费用类型`);
  }

  bindEvents() {
    document.getElementById('btnAddRule').addEventListener('click', () => this.showAddModal());
    document.getElementById('btnExport').addEventListener('click', () => this.exportData());

    // 搜索按钮
    document.getElementById('btnSearch')?.addEventListener('click', () => this.handleSearch());
    // 重置按钮
    document.getElementById('btnReset')?.addEventListener('click', () => this.handleReset());
  }

  handleSearch() {
    const filterFeeType = document.getElementById('filterFeeType')?.value || '';
    const filterCreator = document.getElementById('filterCreator')?.value || '';
    const filterUpdater = document.getElementById('filterUpdater')?.value || '';

    this.filteredItems = this.flatItems.filter(item => {
      let match = true;

      if (filterFeeType && !item.feeItem?.includes(filterFeeType) && !item.subCategory?.includes(filterFeeType)) {
        match = false;
      }
      if (filterCreator && !item.creator?.includes(filterCreator)) {
        match = false;
      }
      if (filterUpdater && !item.updater?.includes(filterUpdater)) {
        match = false;
      }

      return match;
    });

    this.renderItemList();
    this.updateStatistics();
  }

  handleReset() {
    document.getElementById('filterFeeType') && (document.getElementById('filterFeeType').value = '');
    document.getElementById('filterCreator') && (document.getElementById('filterCreator').value = '');
    document.getElementById('filterUpdater') && (document.getElementById('filterUpdater').value = '');

    this.filteredItems = [...this.flatItems];
    this.renderItemList();
    this.updateStatistics();
  }

  renderItemList() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (!this.filteredItems || this.filteredItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center; padding:60px; color:#8B93A5;">
            <i class="fa fa-inbox" style="font-size:48px; margin-bottom:16px; display:block; opacity:0.3;"></i>
            <div style="font-size:15px;">暂无增值服务规则数据</div>
            <div style="font-size:13px; margin-top:8px;">点击"新增规则"开始配置增值服务规则</div>
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
    const row = document.createElement('tr');
    row.className = 'cursor-pointer hover:bg-hover transition-colors';

    let feeItemDisplay = '';
    if (item.subCategory) {
      feeItemDisplay = `<span style="font-weight:600; color:#1B3A4B;">${item.feeItem} - ${item.subCategory}</span>`;
    } else {
      feeItemDisplay = `<span style="font-weight:600; color:#1B3A4B;">${item.feeItem}</span>`;
    }

    row.innerHTML = `
      <td style="text-align:center; font-weight:600; color:#1B3A4B;">${index + 1}</td>
      <td style="color:#5A6275;">${item.feeGroup || item.categoryName}</td>
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
    const totalItems = this.filteredItems.length;
    document.getElementById('statisticsText').innerHTML = `共 <strong>${totalItems}</strong> 个费用类型`;
  }
}

// 初始化引擎实例
const engine = new ValueAddedServiceEngine();
