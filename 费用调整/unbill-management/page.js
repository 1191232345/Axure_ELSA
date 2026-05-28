/**
 * 未出账管理模块 - 页面协调器
 */

const UnbillPage = {
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
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.addEventListener('click', CommonUtils.throttle((e) => {
      this.handleClickEvent(e);
    }, 100));
    
    document.addEventListener('click', () => {
      const adjustDropdown = document.getElementById('adjustDropdown');
      if (adjustDropdown) adjustDropdown.classList.add('hidden');
    });
  },
  
  handleClickEvent(e) {
    if (e.target.closest('#searchBtn')) {
      this.handleSearch();
    } else if (e.target.closest('#resetBtn')) {
      this.handleReset();
    } else if (e.target.closest('#batchRecalculateBtn')) {
      this.handleBatchRecalculate();
    } else if (e.target.closest('#recalculateDetailBtn')) {
      this.openRecalculateModal();
    } else if (e.target.closest('#importRecalculateBtn')) {
      this.handleImportRecalculate();
    } else if (e.target.closest('#selectAllCheckbox')) {
      this.handleSelectAll(e);
    } else if (e.target.closest('.modal-close')) {
      this.closeModal();
    }
  },
  
  bindTabButtons() {
    const outboundTabBtn = document.getElementById('outboundTabBtn');
    const storageTabBtn = document.getElementById('storageTabBtn');
    const inboundTabBtn = document.getElementById('inboundTabBtn');
    
    if (outboundTabBtn && storageTabBtn && inboundTabBtn) {
      outboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(outboundTabBtn, [storageTabBtn, inboundTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.OUTBOUND;
        this.loadInitialData();
      });
      
      storageTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(storageTabBtn, [outboundTabBtn, inboundTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.STORAGE;
        this.loadInitialData();
      });
      
      inboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(inboundTabBtn, [outboundTabBtn, storageTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.INBOUND;
        this.loadInitialData();
      });
    }
  },
  
  async loadInitialData() {
    LoadingManager.show('加载数据中...');
    
    try {
      const result = await UnbillAPI.loadOrderData();
      if (result.success && result.data.length > 0) {
        UnbillRenderer.renderOrderTable(result.data, this.currentTabType);
        this.totalCount = result.data.length;
        UnbillRenderer.updatePagination(this.totalCount, this.currentPage, this.pageSize);
      } else {
        UnbillRenderer.renderOrderTable([], this.currentTabType);
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
    
    if (!UnbillUtils.validateSearchParams(searchParams)) {
      return;
    }
    
    LoadingManager.show('搜索中...');
    this.currentPage = 1;
    
    try {
      const result = await UnbillAPI.searchOrders(searchParams);
      UnbillRenderer.renderOrderTable(result.data, this.currentTabType);
      this.totalCount = result.data.length;
      UnbillRenderer.updatePagination(this.totalCount, this.currentPage, this.pageSize);
      
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
    document.querySelectorAll('.filter-combo-input, .form-input[type="text"], .form-input[type="date"]').forEach(input => {
      input.value = '';
    });
    
    document.querySelectorAll('.form-input select, .filter-combo-select').forEach(select => {
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
    
    const count = checkedBoxes.length + 45000;
    
    if (count > UnbillConstants.MAX_BATCH_COUNT) {
      UnbillRenderer.showLimitExceededModal(count);
    } else {
      this.confirmBatchRecalculate(checkedBoxes.length);
    }
  },
  
  async confirmBatchRecalculate(selectedCount) {
    LoadingManager.show('正在提交批量重计任务...');
    
    try {
      const result = await UnbillAPI.submitBatchRecalculate(selectedCount);
      LoadingManager.hide();
      UnbillRenderer.showSuccessModal(selectedCount);
      ToastManager.show(result.message, 'success');
    } catch (error) {
      LoadingManager.hide();
      ToastManager.show('提交失败：' + error.message, 'error');
    }
  },
  
  async openRecalculateModal() {
    UnbillRenderer.openRecalculateModal(this.currentTabType);
    
    try {
      const result = await UnbillAPI.loadRecalculateDetailData(this.currentTabType);
      if (result.success) {
        this.recalculateTableData = result.data;
        UnbillRenderer.renderRecalculateTable(result.data, this.currentTabType);
        UnbillRenderer.updatePagination(result.data.length, this.currentPage, this.pageSize);
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
    UnbillRenderer.closeRecalculateModal();
    const successModal = document.getElementById('successModal');
    const limitExceededModal = document.getElementById('limitExceededModal');
    
    if (successModal) successModal.classList.add('hidden');
    if (limitExceededModal) limitExceededModal.classList.add('hidden');
  },
  
  collectSearchParams() {
    return {
      orderNo: document.querySelector('.filter-combo-input')?.value.trim() || '',
      customerCode: document.querySelector('select.form-input:nth-of-type(1)')?.value || '',
      warehouse: document.querySelector('select.form-input:nth-of-type(2)')?.value || '',
      channel: document.querySelector('select.form-input:nth-of-type(3)')?.value || ''
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UnbillPage.init();
});

function viewOrderDetail(orderNo) {
  ToastManager.show(`查看订单详情：${orderNo}`, 'info');
}

function changePage(page) {
  UnbillPage.currentPage = page;
  UnbillPage.loadInitialData();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnbillPage;
}