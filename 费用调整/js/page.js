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
    this.loadInitialData();
  },
  
  bindEvents() {
    const mainPrototype = document.getElementById('main-prototype');
    if (!mainPrototype) return;
    
    mainPrototype.addEventListener('click', CommonUtils.throttle((e) => {
      this.handleClickEvent(e);
    }, 100));
    
    document.addEventListener('click', () => {
      const adjustDropdown = document.getElementById('adjustDropdown');
      if (adjustDropdown) adjustDropdown.classList.add('hidden');
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
  
  bindTabButtons() {
    const outboundTabBtn = document.getElementById('outboundTabBtn');
    const storageTabBtn = document.getElementById('storageTabBtn');
    const inboundTabBtn = document.getElementById('inboundTabBtn');
    const valueAddedTabBtn = document.getElementById('valueAddedTabBtn');
    
    if (outboundTabBtn && storageTabBtn && inboundTabBtn && valueAddedTabBtn) {
      outboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(outboundTabBtn, [storageTabBtn, inboundTabBtn, valueAddedTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.OUTBOUND;
        this.loadInitialData();
      });
      
      storageTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(storageTabBtn, [outboundTabBtn, inboundTabBtn, valueAddedTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.STORAGE;
        this.loadInitialData();
      });
      
      inboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(inboundTabBtn, [outboundTabBtn, storageTabBtn, valueAddedTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.INBOUND;
        this.loadInitialData();
      });
      
      valueAddedTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(valueAddedTabBtn, [outboundTabBtn, storageTabBtn, inboundTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.VALUE_ADDED;
        this.loadInitialData();
      });
    }
  },
  
  async loadInitialData() {
    LoadingManager.show('加载数据中...');
    
    try {
      const result = await MainAPI.loadOrderData(this.currentTabType);
      if (result.success && result.data.length > 0) {
        MainRenderer.renderOrderTable(result.data, this.currentTabType);
        this.totalCount = result.data.length;
        document.getElementById('totalCount').textContent = this.totalCount;
      } else {
        MainRenderer.renderOrderTable([], this.currentTabType);
        document.getElementById('totalCount').textContent = '0';
      }
      LoadingManager.hide();
    } catch (error) {
      console.error('数据加载失败:', error);
      ToastManager.show('数据加载失败，请刷新页面重试', 'error');
      LoadingManager.hide();
    }
  },
  
  async handleSearch() {
    const searchParams = this.collectSearchParams();
    
    LoadingManager.show('搜索中...');
    this.currentPage = 1;
    
    try {
      const result = await MainAPI.searchOrders(searchParams, this.currentTabType);
      MainRenderer.renderOrderTable(result.data, this.currentTabType);
      this.totalCount = result.data.length;
      document.getElementById('totalCount').textContent = this.totalCount;
      
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
  if (MainPage.currentTabType === CommonConstants.TAB_TYPES.INBOUND) {
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