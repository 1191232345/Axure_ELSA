/**
 * 费用调整主页面 - 页面协调器
 */

const MainPage = {
  currentPage: 1,
  pageSize: CommonConstants.PAGE_SIZE,
  totalCount: 0,
  selectedRows: [],
  currentTabType: CommonConstants.TAB_TYPES.OUTBOUND,
  recalculateTableData: [],
  
  init() {
    this.bindEvents();
    this.bindTabButtons();
    this.toggleInfoSection(this.currentTabType);
    // 初始化页面时不加载数据，只显示空表格
    this.renderEmptyTable();
  },
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      // 点击批量操作按钮时，切换下拉菜单
      if (e.target.closest('#adjustFeeBtn')) {
        this.toggleAdjustDropdown(e);
        return;
      }
      
      // 点击下拉菜单选项时，处理相应操作并隐藏
      const dropdownItem = e.target.closest('#adjustDropdown a[data-action]');
      if (dropdownItem) {
        const action = dropdownItem.dataset.action;
        this.handleDropdownAction(action);
        const adjustDropdown = document.getElementById('adjustDropdown');
        if (adjustDropdown) adjustDropdown.classList.add('hidden');
        return;
      }
      
      // 其他点击时隐藏下拉菜单
      const adjustDropdown = document.getElementById('adjustDropdown');
      if (adjustDropdown && !e.target.closest('#adjustDropdown')) {
        adjustDropdown.classList.add('hidden');
      }
      
      this.handleClickEvent(e);
    });
    
    // 直接绑定弹窗关闭按钮事件
    const closeModalBtn = document.getElementById('closeModal');
    const closeModalBtnBottom = document.getElementById('closeModalBtn');
    const recalculateModal = document.getElementById('recalculateModal');
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeModal());
    }
    if (closeModalBtnBottom) {
      closeModalBtnBottom.addEventListener('click', () => this.closeModal());
    }
    if (recalculateModal) {
      recalculateModal.addEventListener('click', (e) => {
        if (e.target.id === 'recalculateModal') {
          this.closeModal();
        }
      });
    }
    
    // 绑定费用明细弹窗关闭按钮
    const closeFeeDetailModalBtn = document.getElementById('closeFeeDetailModal');
    const closeFeeDetailBtn = document.getElementById('closeFeeDetailBtn');
    const feeDetailModal = document.getElementById('feeDetailModal');
    
    if (closeFeeDetailModalBtn) {
      closeFeeDetailModalBtn.addEventListener('click', () => this.closeFeeDetailModal());
    }
    if (closeFeeDetailBtn) {
      closeFeeDetailBtn.addEventListener('click', () => this.closeFeeDetailModal());
    }
    if (feeDetailModal) {
      feeDetailModal.addEventListener('click', (e) => {
        if (e.target.id === 'feeDetailModal') {
          this.closeFeeDetailModal();
        }
      });
    }
  },
  
  handleClickEvent(e) {
    if (e.target.closest('#searchBtn')) {
      this.handleSearch();
    } else if (e.target.closest('#resetBtn')) {
      this.handleReset();
    } else if (e.target.closest('#addFeeBtn')) {
      this.handleAddFee();
    } else if (e.target.closest('#saveFeeBtn')) {
      this.handleSaveFee();
    } else if (e.target.closest('#batchRecalculateBtn')) {
      this.handleBatchRecalculate();
    } else if (e.target.closest('#recalculateBtn')) {
      this.openRecalculateModal();
    } else if (e.target.closest('#importRecalculateBtn')) {
      this.handleImportRecalculate();
    } else if (e.target.closest('#selectAllCheckbox')) {
      this.handleSelectAll(e);
    } else if (e.target.closest('#closeModal') || e.target.closest('#closeModalBtn') || e.target.closest('.modal-close')) {
      this.closeModal();
    } else if (e.target.id === 'recalculateModal') {
      this.closeModal();
    } else if (e.target.closest('#closeFeeDetailModal') || e.target.closest('#closeFeeDetailBtn')) {
      this.closeFeeDetailModal();
    } else if (e.target.id === 'feeDetailModal') {
      this.closeFeeDetailModal();
    }
  },

  handleDropdownAction(action) {
    ToastManager.show(`批量操作：${action}`, 'info');
    // TODO: 根据不同操作类型打开相应的弹窗或执行相应逻辑
  },

  handleAddFee() {
    const feeTableBody = document.getElementById('feeTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (emptyState) emptyState.classList.add('hidden');
    
    const newRow = document.createElement('tr');
    newRow.className = 'border-t border-gray-100 table-hover-row';
    newRow.innerHTML = `
      <td class="px-4 py-3 text-sm">
        <input type="text" class="form-input w-full" placeholder="费用名称" data-field="name">
      </td>
      <td class="px-4 py-3 text-sm">
        <select class="form-input" data-field="unit">
          <option value="票">票</option>
          <option value="KG">KG</option>
          <option value="件">件</option>
          <option value="次">次</option>
        </select>
      </td>
      <td class="px-4 py-3 text-sm">
        <input type="number" class="form-input w-20 text-right" value="0.00" data-field="originalAmount" step="0.01" readonly>
      </td>
      <td class="px-4 py-3 text-sm">
        <input type="number" class="form-input w-24 text-right" value="0.00" data-field="newAmount" step="0.01">
      </td>
      <td class="px-4 py-3 text-sm">
        <select class="form-input" data-field="currency">
          <option value="USD">USD</option>
          <option value="CNY">CNY</option>
          <option value="EUR">EUR</option>
        </select>
      </td>
      <td class="px-4 py-3 text-sm">
        <input type="text" class="form-input w-full" placeholder="备注" data-field="remark">
      </td>
      <td class="px-4 py-3 text-sm">
        <button class="table-action-btn text-danger" onclick="removeFeeRow(this)">删除</button>
      </td>
    `;
    
    feeTableBody.appendChild(newRow);
    ToastManager.show('已添加新费用项', 'success');
  },

  handleSaveFee() {
    ToastManager.show('费用数据已保存', 'success');
  },

  toggleAdjustDropdown(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('adjustDropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  },
  
  bindTabButtons() {
    const outboundTabBtn = document.getElementById('outboundTabBtn');
    const inboundTabBtn = document.getElementById('inboundTabBtn');
    const valueAddedTabBtn = document.getElementById('valueAddedTabBtn');

    if (outboundTabBtn && inboundTabBtn && valueAddedTabBtn) {
      outboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(outboundTabBtn, [inboundTabBtn, valueAddedTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.OUTBOUND;
        this.toggleInfoSection(CommonConstants.TAB_TYPES.OUTBOUND);
        this.renderEmptyTable();
      });

      inboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(inboundTabBtn, [outboundTabBtn, valueAddedTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.INBOUND;
        this.toggleInfoSection(CommonConstants.TAB_TYPES.INBOUND);
        this.renderEmptyTable();
      });

      valueAddedTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(valueAddedTabBtn, [outboundTabBtn, inboundTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.VALUE_ADDED;
        this.toggleInfoSection(CommonConstants.TAB_TYPES.VALUE_ADDED);
        this.renderEmptyTable();
      });
    }
  },
  
  toggleInfoSection(tabType) {
    const outboundInfoSection = document.getElementById('outboundInfoSection');
    const storageInfoSection = document.getElementById('storageInfoSection');
    const inboundInfoSection = document.getElementById('inboundInfoSection');
    const valueAddedInfoSection = document.getElementById('valueAddedInfoSection');

    if (outboundInfoSection) {
      outboundInfoSection.classList.toggle('hidden', tabType !== CommonConstants.TAB_TYPES.OUTBOUND);
    }
    if (storageInfoSection) {
      storageInfoSection.classList.toggle('hidden', tabType !== CommonConstants.TAB_TYPES.STORAGE);
    }
    if (inboundInfoSection) {
      inboundInfoSection.classList.toggle('hidden', tabType !== CommonConstants.TAB_TYPES.INBOUND);
    }
    if (valueAddedInfoSection) {
      valueAddedInfoSection.classList.toggle('hidden', tabType !== CommonConstants.TAB_TYPES.VALUE_ADDED);
    }

    // 更新搜索框标签和占位符
    const orderNumberLabel = document.getElementById('orderNumberLabel');
    const feeNumberInput = document.getElementById('feeNumber');

    if (orderNumberLabel && feeNumberInput) {
      switch (tabType) {
        case CommonConstants.TAB_TYPES.OUTBOUND:
          orderNumberLabel.textContent = '出库单号';
          feeNumberInput.placeholder = '输入出库单号查询（例如：OUT-240126-0059）';
          break;
        case CommonConstants.TAB_TYPES.STORAGE:
          orderNumberLabel.textContent = '仓储单号';
          feeNumberInput.placeholder = '输入仓储单号查询（例如：STR-240126-0059）';
          break;
        case CommonConstants.TAB_TYPES.INBOUND:
          orderNumberLabel.textContent = '入库单号';
          feeNumberInput.placeholder = '输入入库单号查询（例如：INB-240126-0059）';
          break;
        case CommonConstants.TAB_TYPES.VALUE_ADDED:
          orderNumberLabel.textContent = '服务单号';
          feeNumberInput.placeholder = '输入服务单号查询（例如：VAS-240126-0059）';
          break;
      }
    }
  },

  renderEmptyTable() {
    const tbody = document.getElementById('orderTableBody');
    const totalCountEl = document.getElementById('totalCount');

    if (tbody) {
      const showLogisticsProduct = this.currentTabType === CommonConstants.TAB_TYPES.OUTBOUND;
      const showServiceType = this.currentTabType === CommonConstants.TAB_TYPES.VALUE_ADDED;
      const colCount = (showLogisticsProduct || showServiceType) ? 10 : 9;

      MainRenderer.renderMainTableHead(showLogisticsProduct, showServiceType);

      tbody.innerHTML = `<tr class="border-t border-gray-100">
        <td colspan="${colCount}" class="px-4 py-12 text-center text-gray-400">
          <i class="fa fa-inbox text-4xl mb-2 block"></i>
          <p>暂无数据</p>
        </td>
      </tr>`;
    }

    if (totalCountEl) {
      totalCountEl.textContent = '0';
    }
  },

  async loadInitialData() {
    const feeTableBody = document.getElementById('feeTableBody');
    if (!feeTableBody) return;

    // 模拟加载费用明细数据
    const mockFeeData = this.generateMockFeeData(this.currentTabType);
    this.renderFeeTable(mockFeeData);
  },
  
  generateMockFeeData(tabType) {
    const feeItems = {
      inbound: [
        { name: '入库费', unit: '票', originalAmount: 150.00, newAmount: 150.00, currency: 'USD', remark: '' },
        { name: '卸货费', unit: 'KG', originalAmount: 85.50, newAmount: 85.50, currency: 'USD', remark: '' },
        { name: '清点费', unit: '件', originalAmount: 30.00, newAmount: 30.00, currency: 'USD', remark: '' },
        { name: '上架费', unit: '件', originalAmount: 45.00, newAmount: 45.00, currency: 'USD', remark: '' }
      ],
      outbound: [
        { name: '出库费', unit: '票', originalAmount: 120.00, newAmount: 120.00, currency: 'USD', remark: '' },
        { name: '打包费', unit: '件', originalAmount: 25.00, newAmount: 25.00, currency: 'USD', remark: '' },
        { name: '标签费', unit: '件', originalAmount: 15.00, newAmount: 15.00, currency: 'USD', remark: '' }
      ],
      valueAdded: [
        { name: '拍照服务', unit: '次', originalAmount: 50.00, newAmount: 50.00, currency: 'USD', remark: '商品拍照' },
        { name: '丈量过磅', unit: '次', originalAmount: 35.00, newAmount: 35.00, currency: 'USD', remark: '尺寸测量' },
        { name: '检验服务', unit: '次', originalAmount: 80.00, newAmount: 80.00, currency: 'USD', remark: '质量检验' },
        { name: '退货入库', unit: '票', originalAmount: 100.00, newAmount: 100.00, currency: 'USD', remark: '' }
      ]
    };
    
    return feeItems[tabType] || feeItems.inbound;
  },
  
  renderFeeTable(data) {
    const feeTableBody = document.getElementById('feeTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!feeTableBody) return;
    
    if (!data || data.length === 0) {
      feeTableBody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    const html = data.map((item, index) => `
      <tr class="border-t border-gray-100 table-hover-row">
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(item.name)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(item.unit)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.formatNumber(item.originalAmount)}</td>
        <td class="px-4 py-3 text-sm">
          <input type="number" class="form-input w-24 text-right" value="${item.newAmount}" 
                 data-index="${index}" data-field="newAmount" step="0.01">
        </td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(item.currency)}</td>
        <td class="px-4 py-3 text-sm">
          <input type="text" class="form-input w-full" value="${CommonUtils.escapeHtml(item.remark)}" 
                 data-index="${index}" data-field="remark" placeholder="添加备注">
        </td>
        <td class="px-4 py-3 text-sm">
          <button class="table-action-btn text-danger" onclick="removeFeeRow(${index})">删除</button>
        </td>
      </tr>
    `).join('');
    
    feeTableBody.innerHTML = html;
  },
  
  async handleSearch() {
    const searchParams = this.collectSearchParams();
    
    LoadingManager.show('搜索中...');
    this.currentPage = 1;
    
    try {
      const result = await MainAPI.searchOrders(searchParams, this.currentTabType);
      MainRenderer.renderOrderTable(result.data, this.currentTabType);
      this.totalCount = result.data.length;
      const totalCountEl = document.getElementById('totalCount');
      if (totalCountEl) totalCountEl.textContent = this.totalCount;
      
      if (result.data.length === 0) {
        ToastManager.show('未找到符合条件的数据', 'info');
      } else {
        ToastManager.show(`搜索完成，共 ${result.data.length} 条结果`, 'success');
      }
      
      LoadingManager.hide();
    } catch (error) {
      console.error('搜索失败:', error);
      ToastManager.show('搜索失败：' + error.message, 'error');
      LoadingManager.hide();
    }
  },
  
  handleReset() {
    document.querySelectorAll('.filter-combo-input, .form-input[type="text"]').forEach(input => {
      input.value = '';
    });
    
    document.querySelectorAll('select.form-input, .filter-combo-select').forEach(select => {
      select.selectedIndex = 0;
    });
    
    this.currentPage = 1;
    this.loadInitialData();
    ToastManager.show('搜索条件已重置', 'info');
  },
  
  handleBatchRecalculate() {
    const checkedBoxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]:checked');
    
    if (checkedBoxes.length === 0) {
      ToastManager.show('请先选择要重计的订单', 'warning');
      return;
    }
    
    this.confirmBatchRecalculate(checkedBoxes.length);
  },
  
  async confirmBatchRecalculate(selectedCount) {
    LoadingManager.show('正在提交批量重计任务...');
    
    try {
      const result = await MainAPI.submitBatchRecalculate(selectedCount);
      LoadingManager.hide();
      ToastManager.show(result.message, 'success');
    } catch (error) {
      LoadingManager.hide();
      ToastManager.show('提交失败：' + error.message, 'error');
    }
  },
  
  async openRecalculateModal() {
    MainRenderer.openRecalculateModal(this.currentTabType);
    
    try {
      const result = await MainAPI.loadRecalculateDetailData(this.currentTabType);
      if (result.success) {
        this.recalculateTableData = result.data;
        MainRenderer.renderRecalculateTable(result.data, this.currentTabType);
      }
    } catch (error) {
      ToastManager.show('加载重计明细失败', 'error');
    }
  },
  
  handleImportRecalculate() {
    ToastManager.show('导入功能暂未实现', 'info');
  },
  
  handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('#orderTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = e.target.checked;
    });
    
    this.selectedRows = e.target.checked 
      ? Array.from(checkboxes).map(cb => cb.dataset.id)
      : [];
  },
  
  closeModal() {
    MainRenderer.closeRecalculateModal();
  },
  
  closeFeeDetailModal() {
    MainRenderer.closeFeeDetailModal();
  },
  
  collectSearchParams() {
    return {
      orderNo: document.querySelector('.filter-combo-input')?.value.trim() || '',
      customerCode: document.querySelectorAll('select.form-input')[0]?.value || '',
      warehouse: document.querySelectorAll('select.form-input')[1]?.value || '',
      channel: document.querySelectorAll('select.form-input')[2]?.value || ''
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MainPage.init();
});

function viewOrderDetail(orderNo) {
  if (MainPage.currentTabType === CommonConstants.TAB_TYPES.INBOUND ||
      MainPage.currentTabType === CommonConstants.TAB_TYPES.VALUE_ADDED) {
    MainRenderer.openFeeDetailModal(orderNo);
  } else {
    ToastManager.show(`查看订单详情：${orderNo}`, 'info');
  }
}

function changePage(page) {
  MainPage.currentPage = page;
  MainPage.loadInitialData();
}

function switchMainTab(tabName) {
  const tabs = ['prototype', 'prd', 'testcases'];
  const tabBtns = {
    prototype: document.getElementById('tab-prototype'),
    prd: document.getElementById('tab-prd'),
    testcases: document.getElementById('tab-testcases')
  };
  const mainContents = {
    prototype: document.getElementById('main-prototype'),
    prd: document.getElementById('main-prd'),
    testcases: document.getElementById('main-testcases')
  };
  
  tabs.forEach(tab => {
    if (tabBtns[tab]) {
      tabBtns[tab].className = tab === tabName ? 'tab active' : 'tab';
    }
    if (mainContents[tab]) {
      mainContents[tab].style.display = tab === tabName ? 'block' : 'none';
    }
  });
  
  if (tabName === 'prd') {
    loadPrdContent();
  } else if (tabName === 'testcases') {
    loadTestcasesContent();
  }
}

function loadPrdContent() {
  const prdContent = document.getElementById('prd-content');
  if (prdContent && prdContent.textContent.trim() === '') {
    fetch('prd.md')
      .then(response => response.text())
      .then(text => {
        prdContent.innerHTML = marked.parse(text);
        mermaid.init(undefined, '.mermaid');
        generateToc();
      })
      .catch(error => console.error('加载PRD失败:', error));
  }
}

function loadTestcasesContent() {
  const testcasesContent = document.getElementById('testcases-content');
  if (testcasesContent && testcasesContent.textContent.trim() === '') {
    fetch('test-cases.md')
      .then(response => response.text())
      .then(text => {
        testcasesContent.innerHTML = marked.parse(text);
        mermaid.init(undefined, '.mermaid');
      })
      .catch(error => console.error('加载测试用例失败:', error));
  }
}

function generateToc() {
  const tocNav = document.getElementById('toc-nav');
  const headings = document.querySelectorAll('#prd-content h1, #prd-content h2, #prd-content h3');
  
  if (!tocNav) return;
  
  const tocHTML = headings.map(h => {
    const level = parseInt(h.tagName.charAt(1));
    const indent = (level - 1) * 16;
    const id = 'toc-' + Math.random().toString(36).substr(2, 9);
    h.id = id;
    return `<a href="#${id}" class="toc-link" style="padding-left: ${indent}px">${h.textContent}</a>`;
  }).join('');
  
  tocNav.innerHTML = tocHTML;
}

function switchPrdTab(tabName, section) {
  const prdBtn = document.querySelector(`#${section}-logic-content .prd-tab-btn:first-child`);
  const testcasesBtn = document.querySelector(`#${section}-logic-content .prd-tab-btn:last-child`);
  const prdContent = document.getElementById(`${section}-prd-content`);
  const testcasesContent = document.getElementById(`${section}-testcases-content`);
  
  if (prdBtn && testcasesBtn) {
    if (tabName === 'prd') {
      prdBtn.classList.add('active');
      prdBtn.style.borderBottomColor = 'var(--primary)';
      prdBtn.style.color = 'var(--primary)';
      testcasesBtn.classList.remove('active');
      testcasesBtn.style.borderBottomColor = '';
      testcasesBtn.style.color = '';
      if (prdContent) prdContent.classList.remove('hidden');
      if (testcasesContent) testcasesContent.classList.add('hidden');
    } else {
      testcasesBtn.classList.add('active');
      testcasesBtn.style.borderBottomColor = 'var(--primary)';
      testcasesBtn.style.color = 'var(--primary)';
      prdBtn.classList.remove('active');
      prdBtn.style.borderBottomColor = '';
      prdBtn.style.color = '';
      if (testcasesContent) testcasesContent.classList.remove('hidden');
      if (prdContent) prdContent.classList.add('hidden');
    }
  }
}

function togglePrdLogic(section) {
  const content = document.getElementById(`${section}-logic-content`);
  const icon = document.getElementById(`${section}-logic-icon`);
  
  if (content && icon) {
    content.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
  }
}

function openMermaidModal(element) {
  const modal = document.getElementById('mermaidModal');
  const modalContent = document.getElementById('mermaidModalContent');
  
  if (modal && modalContent) {
    const mermaidDiv = element.querySelector('.mermaid');
    if (mermaidDiv) {
      modalContent.innerHTML = mermaidDiv.innerHTML;
      modal.classList.add('show');
      mermaid.init(undefined, '#mermaidModalContent .mermaid');
    }
  }
}

function closeMermaidModal(event) {
  const modal = document.getElementById('mermaidModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainPage;
}