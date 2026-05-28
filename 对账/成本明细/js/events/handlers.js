import { store } from '../state/store.js';
import { renderTable, updatePagination } from '../renderer/tableRenderer.js';
import { 
  renderModalTable, 
  renderBatchModalTable,
  showFeeModal, 
  hideFeeModal,
  showBatchFeeModal,
  hideBatchFeeModal,
  showDetailModal,
  hideDetailModal
} from '../renderer/modalRenderer.js';
import { ITEMS_PER_PAGE } from '../constants/config.js';

export function handleRowSelect(id) {
  store.toggleSelectedItem(id);
  renderTable();
}

export function handleModalRowSelect(id) {
  store.toggleModalSelectedItem(id);
  renderModalTable();
}

export function handleBatchModalRowSelect(id) {
  store.toggleBatchModalSelectedItem(id);
  renderBatchModalTable();
}

export function handlePageChange(page) {
  store.setCurrentPage(page);
  renderTable();
}

export function handleViewDetail(id) {
  const state = store.getState();
  const item = state.reconciliationData.find(d => d.id === id);
  if (item) {
    showDetailModal(item);
  }
}

export function handleEdit(id) {
  console.log('Edit item:', id);
}

export function handleFilter() {
  const filters = collectFilters();
  store.setFilters(filters);
  const filteredData = applyFilters(store.getState().reconciliationData, filters);
  renderTable(filteredData);
}

export function handleResetFilter() {
  clearFilters();
  store.setFilters({});
  renderTable();
}

export function handleTableCheckAll(checked) {
  const state = store.getState();
  const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageData = state.reconciliationData.slice(startIndex, endIndex);
  
  if (checked) {
    pageData.forEach(item => {
      state.selectedItems.add(item.id);
    });
  } else {
    pageData.forEach(item => {
      state.selectedItems.delete(item.id);
    });
  }
  
  store.setSelectedItems(state.selectedItems);
  renderTable();
}

export function handleModalCheckAll(checked) {
  const state = store.getState();
  
  if (checked) {
    state.modalData.forEach(item => {
      state.modalSelectedItems.add(item.id);
    });
  } else {
    state.modalData.forEach(item => {
      state.modalSelectedItems.delete(item.id);
    });
  }
  
  store.setModalSelectedItems(state.modalSelectedItems);
  renderModalTable();
}

export function handleBatchModalCheckAll(checked) {
  const state = store.getState();
  
  if (checked) {
    state.batchModalData.forEach(item => {
      state.batchModalSelectedItems.add(item.id);
    });
  } else {
    state.batchModalData.forEach(item => {
      state.batchModalSelectedItems.delete(item.id);
    });
  }
  
  store.setBatchModalSelectedItems(state.batchModalSelectedItems);
  renderBatchModalTable();
}

export function handleOpenFeeModal() {
  showFeeModal();
}

export function handleCloseFeeModal() {
  hideFeeModal();
  store.clearModalSelectedItems();
}

export function handleOpenBatchFeeModal() {
  const state = store.getState();
  if (state.isBatchTaskRunning) {
    alert('任务正在执行中，请勿重复操作');
    return;
  }
  showBatchFeeModal();
}

export function handleCloseBatchFeeModal() {
  hideBatchFeeModal();
  store.clearBatchModalSelectedItems();
}

export function handleExport() {
  const state = store.getState();
  const selectedData = state.reconciliationData.filter(item => 
    state.selectedItems.has(item.id)
  );
  
  if (selectedData.length === 0) {
    alert('请先选择要导出的数据');
    return;
  }
  
  console.log('Export data:', selectedData);
  alert('导出功能开发中...');
}

export function collectFilters() {
  const filters = {};
  
  const billType = document.getElementById('filterBillType')?.value;
  if (billType) filters.billType = billType;
  
  const billMonth = document.getElementById('filterBillMonth')?.value;
  if (billMonth) filters.billMonth = billMonth;
  
  const voyagePeriod = document.getElementById('filterVoyagePeriod')?.value;
  if (voyagePeriod) filters.voyagePeriod = voyagePeriod;
  
  const customerCode = document.getElementById('filterCustomerCode')?.value;
  if (customerCode) filters.customerCode = customerCode;
  
  const customerService = document.getElementById('filterCustomerService')?.value;
  if (customerService) filters.customerService = customerService;
  
  const operateTimeStart = document.getElementById('filterOperateTimeRangeStart')?.value;
  const operateTimeEnd = document.getElementById('filterOperateTimeRangeEnd')?.value;
  if (operateTimeStart) filters.operateTimeStart = operateTimeStart;
  if (operateTimeEnd) filters.operateTimeEnd = operateTimeEnd;
  
  return filters;
}

export function clearFilters() {
  const inputs = [
    'filterBillType',
    'filterBillMonth',
    'filterVoyagePeriod',
    'filterCustomerCode',
    'filterCustomerService',
    'filterOperateTimeRangeStart',
    'filterOperateTimeRangeEnd'
  ];
  
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'filterBillType') {
        element.value = '出库+快递(YC)';
      } else {
        element.value = '';
      }
    }
  });
}

export function applyFilters(data, filters) {
  return data.filter(item => {
    if (filters.billType && item.billType !== filters.billType) return false;
    if (filters.billMonth && item.billMonth !== filters.billMonth) return false;
    if (filters.voyagePeriod && item.voyagePeriod !== filters.voyagePeriod) return false;
    if (filters.customerCode && item.customerCode !== filters.customerCode) return false;
    if (filters.customerService && item.customerService !== filters.customerService) return false;
    
    if (filters.operateTimeStart) {
      const itemTime = new Date(item.operateTime);
      const startTime = new Date(filters.operateTimeStart);
      if (itemTime < startTime) return false;
    }
    
    if (filters.operateTimeEnd) {
      const itemTime = new Date(item.operateTime);
      const endTime = new Date(filters.operateTimeEnd);
      if (itemTime > endTime) return false;
    }
    
    return true;
  });
}

export function bindEvents() {
  document.getElementById('btnGetFee')?.addEventListener('click', handleOpenFeeModal);
  document.getElementById('btnBatchGetFee')?.addEventListener('click', handleOpenBatchFeeModal);
  document.getElementById('btnExport')?.addEventListener('click', handleExport);
  document.getElementById('btnFilter')?.addEventListener('click', handleFilter);
  document.getElementById('btnResetFilter')?.addEventListener('click', handleResetFilter);
  
  document.getElementById('closeFeeModal')?.addEventListener('click', handleCloseFeeModal);
  document.getElementById('modalCancel')?.addEventListener('click', handleCloseFeeModal);
  document.getElementById('closeBatchFeeModal')?.addEventListener('click', handleCloseBatchFeeModal);
  document.getElementById('batchModalCancel')?.addEventListener('click', handleCloseBatchFeeModal);
  document.getElementById('closeDetailModal')?.addEventListener('click', hideDetailModal);
  document.getElementById('detailClose')?.addEventListener('click', hideDetailModal);
  
  document.getElementById('prevPageBtn')?.addEventListener('click', () => {
    const currentPage = store.getState().currentPage;
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  });
  
  document.getElementById('nextPageBtn')?.addEventListener('click', () => {
    const currentPage = store.getState().currentPage;
    const totalPages = Math.ceil(store.getState().reconciliationData.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  });
  
  document.getElementById('tableCheckAll')?.addEventListener('change', (e) => {
    handleTableCheckAll(e.target.checked);
  });
  
  document.getElementById('modalCheckAll')?.addEventListener('change', (e) => {
    handleModalCheckAll(e.target.checked);
  });
  
  document.getElementById('batchModalCheckAll')?.addEventListener('change', (e) => {
    handleBatchModalCheckAll(e.target.checked);
  });
  
  window.handleRowSelect = handleRowSelect;
  window.handleModalRowSelect = handleModalRowSelect;
  window.handleBatchModalRowSelect = handleBatchModalRowSelect;
  window.handlePageChange = handlePageChange;
  window.handleViewDetail = handleViewDetail;
  window.handleEdit = handleEdit;
}