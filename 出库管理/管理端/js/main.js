/**
 * 出库列表模块交互逻辑
 */

// 模拟数据
let tableData = [
  {
    id: '1',
    orderNo: 'DEMO-20861712-CLUVKFYDRRPE',
    referenceNo: '10697569084571564',
    trackingNo: '774961396080',
    warehouse: 'DE001',
    skuInfo: '4242NAD x1',
    status: '待拣货',
    actualStatus: '待拣货',
    pickingType: '一单一件',
    deliveryChannel: '发现快递',
    logisticsProduct: 'FEDEX_HOME_GROUND',
    createTime: '2024-01-15 10:30:00',
    creator: 'zsw',
    checked: false
  },
  {
    id: '2',
    orderNo: 'DEMO-20861713-ABCDEFGHIJKL',
    referenceNo: '10697569084571565',
    trackingNo: '774961396081',
    warehouse: 'CA008',
    skuInfo: '4242NAD x2, 4243NAD x1',
    status: '待揽收',
    actualStatus: '待揽收',
    pickingType: '一单多件',
    deliveryChannel: 'FedEx',
    logisticsProduct: 'FEDEX_EXPRESS',
    createTime: '2024-01-15 11:20:00',
    creator: 'admin',
    checked: false
  },
  {
    id: '3',
    orderNo: 'DEMO-20861714-MNOPQRSTUVWX',
    referenceNo: '10697569084571566',
    trackingNo: '774961396082',
    warehouse: 'NJ006',
    skuInfo: '4244NAD x3',
    status: '已出库',
    actualStatus: '已出库',
    pickingType: '一单一件',
    deliveryChannel: 'UPS',
    logisticsProduct: 'UPS_GROUND',
    createTime: '2024-01-14 14:00:00',
    creator: 'user1',
    checked: false
  }
];

let filteredData = tableData.filter(item => item.actualStatus !== '已出库');
let currentPage = 1;
const itemsPerPage = 10;
let selectedItems = new Set();

document.addEventListener('DOMContentLoaded', function() {
  initEventListeners();
  renderTable();
  updateButtonStates();
});

function handleOutboundOrderNoTypeChange() {
  const outboundOrderNoType = document.getElementById('outboundOrderNoType').value;
  const isBatchQuery = outboundOrderNoType === 'batch';
  
  const fieldsToToggle = [
    'warehouseCode',
    'pickingType', 
    'customerCode',
    'sku',
    'deliveryChannel',
    'referenceNo',
    'trackingNo',
    'createTimeStart',
    'createTimeEnd',
    'hideOutbound'
  ];
  
  fieldsToToggle.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = isBatchQuery;
      if (isBatchQuery) {
        field.value = '';
      }
    }
  });
  
  const skuSelect = document.querySelector('#sku').parentElement.querySelector('select');
  if (skuSelect) {
    skuSelect.disabled = isBatchQuery;
  }
  
  const referenceNoSelect = document.querySelector('#referenceNo').parentElement.querySelector('select');
  if (referenceNoSelect) {
    referenceNoSelect.disabled = isBatchQuery;
  }
}

function initEventListeners() {
  document.getElementById('outboundOrderNoType').addEventListener('change', handleOutboundOrderNoTypeChange);
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('resetBtn').addEventListener('click', handleReset);
  document.getElementById('expandBtn').addEventListener('click', toggleExpand);
  
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.addEventListener('change', function() {
      const checked = this.checked;
      document.querySelectorAll('tbody input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
        const rowId = cb.dataset.id;
        if (checked) {
          selectedItems.add(rowId);
        } else {
          selectedItems.delete(rowId);
        }
      });
      updateButtonStates();
    });
  }

  const batchCheckoutBtn = document.getElementById('batchCheckoutBtn');
  if (batchCheckoutBtn) {
    batchCheckoutBtn.addEventListener('click', handleBatchCheckout);
  }
  
  const oneClickCheckoutBtn = document.getElementById('oneClickCheckoutBtn');
  if (oneClickCheckoutBtn) {
    oneClickCheckoutBtn.addEventListener('click', handleOneClickCheckout);
  }
  
  const exportCostBtn = document.getElementById('exportCostBtn');
  if (exportCostBtn) {
    exportCostBtn.addEventListener('click', handleExportCost);
  }
  
  const downloadProofBtn = document.getElementById('downloadProofBtn');
  if (downloadProofBtn) {
    downloadProofBtn.addEventListener('click', handleDownloadProof);
  }

  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const currentPageInput = document.getElementById('currentPage');
  
  if (prevPage) {
    prevPage.addEventListener('click', () => changePage(currentPage - 1));
  }
  if (nextPage) {
    nextPage.addEventListener('click', () => changePage(currentPage + 1));
  }
  if (currentPageInput) {
    currentPageInput.addEventListener('change', function() {
      const page = parseInt(this.value);
      if (page >= 1 && page <= getTotalPages()) {
        changePage(page);
      }
    });
  }

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('confirmCheckoutBtn').addEventListener('click', confirmCheckout);
}

function handleSearch() {
  const filters = {
    warehouseCode: document.getElementById('warehouseCode').value,
    pickingType: document.getElementById('pickingType').value,
    customerCode: document.getElementById('customerCode').value,
    sku: document.getElementById('sku').value,
    deliveryChannel: document.getElementById('deliveryChannel').value,
    outboundOrderNo: document.getElementById('outboundOrderNo').value,
    referenceNo: document.getElementById('referenceNo').value,
    createTimeStart: document.getElementById('createTimeStart').value,
    createTimeEnd: document.getElementById('createTimeEnd').value,
    trackingNo: document.getElementById('trackingNo').value,
    hideOutbound: document.getElementById('hideOutbound').value
  };

  filteredData = tableData.filter(item => {
    if (item.actualStatus === '已出库') return false;
    
    if (filters.warehouseCode && item.warehouse !== filters.warehouseCode) return false;
    if (filters.pickingType && item.pickingType !== filters.pickingType) return false;
    if (filters.deliveryChannel && item.deliveryChannel !== filters.deliveryChannel) return false;
    if (filters.outboundOrderNo && !item.orderNo.includes(filters.outboundOrderNo)) return false;
    if (filters.referenceNo && !item.referenceNo.includes(filters.referenceNo)) return false;
    if (filters.trackingNo && !item.trackingNo.includes(filters.trackingNo)) return false;
    return true;
  });

  currentPage = 1;
  renderTable();
}

function handleReset() {
  document.getElementById('warehouseCode').value = '';
  document.getElementById('pickingType').value = '';
  document.getElementById('customerCode').value = '';
  document.getElementById('sku').value = '';
  document.getElementById('deliveryChannel').value = '';
  document.getElementById('outboundOrderNo').value = '';
  document.getElementById('referenceNo').value = '';
  document.getElementById('trackingNo').value = '';
  document.getElementById('createTimeStart').value = '';
  document.getElementById('createTimeEnd').value = '';
  document.getElementById('hideOutbound').value = '';
  
  document.getElementById('outboundOrderNoType').value = 'exact';
  handleOutboundOrderNoTypeChange();
  
  filteredData = tableData.filter(item => item.actualStatus !== '已出库');
  currentPage = 1;
  renderTable();
}

function toggleExpand() {
  const expandArea = document.getElementById('expandArea');
  const expandBtn = document.getElementById('expandBtn');
  const isHidden = expandArea.classList.contains('hidden');
  
  if (isHidden) {
    expandArea.classList.remove('hidden');
    expandBtn.innerHTML = '<i class="fa fa-chevron-down mr-1"></i> 收起';
  } else {
    expandArea.classList.add('hidden');
    expandBtn.innerHTML = '<i class="fa fa-chevron-up mr-1"></i> 展开';
  }
}

function renderTable() {
  const tbody = document.getElementById('dataTableBody');
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  if (pageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="px-4 py-8 text-center text-gray-500">
          <i class="fa fa-inbox text-4xl mb-2 block"></i>
          暂无数据
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = pageData.map(item => `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">
          <input type="checkbox" class="checkbox-primary row-checkbox" data-id="${item.id}" ${item.checked ? 'checked' : ''}>
        </td>
        <td class="px-4 py-3 text-sm">
          <div class="text-gray-800 font-medium copy-text" onclick="copyToClipboard('${item.orderNo}')" title="点击复制">${item.orderNo}</div>
          <div class="text-gray-500 text-xs mt-1">参考号: <span class="copy-text" onclick="copyToClipboard('${item.referenceNo}')" title="点击复制">${item.referenceNo}</span></div>
          <div class="text-gray-500 text-xs">跟踪号: <span class="copy-text" onclick="copyToClipboard('${item.trackingNo}')" title="点击复制">${item.trackingNo}</span></div>
        </td>
        <td class="px-4 py-3 text-sm">${item.warehouse}</td>
        <td class="px-4 py-3 text-sm">${item.skuInfo}</td>
        <td class="px-4 py-3 text-sm">${item.pickingType}</td>
        <td class="px-4 py-3 text-sm">${item.deliveryChannel}</td>
        <td class="px-4 py-3 text-sm">${item.logisticsProduct}</td>
        <td class="px-4 py-3 text-sm">${item.createTime}</td>
        <td class="px-4 py-3 text-sm">${item.creator}</td>
        <td class="px-4 py-3 text-sm">
          <div class="flex items-center gap-2">
            ${item.actualStatus !== '已出库' && item.actualStatus !== '已取消' && item.actualStatus !== '已送达' ? `
              <button class="text-success hover:text-success/80 checkout-row-btn font-medium" data-id="${item.id}" title="签出">
                <i class="fa fa-check mr-1"></i>签出
              </button>
            ` : `
              <span class="text-gray-400 text-xs">已签出</span>
            `}
            <a href="outbound.html?orderNo=${item.orderNo}" class="text-primary hover:text-primary-light" title="查看详情">
              <i class="fa fa-eye"></i>
            </a>
          </div>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.row-checkbox').forEach(cb => {
      cb.addEventListener('change', function() {
        const rowId = this.dataset.id;
        if (this.checked) {
          selectedItems.add(rowId);
        } else {
          selectedItems.delete(rowId);
        }
        updateSelectAllState();
        updateButtonStates();
      });
    });

    document.querySelectorAll('.checkout-row-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const rowId = this.dataset.id;
        showCheckoutModal('single', [rowId]);
      });
    });
  }

  updatePagination();
  updateSelectAllState();
}

function updateSelectAllState() {
  const checkboxes = document.querySelectorAll('.row-checkbox');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
  }
}

function updateButtonStates() {
  const hasSelection = selectedItems.size > 0;
  const batchCheckoutBtn = document.getElementById('batchCheckoutBtn');
  const downloadProofBtn = document.getElementById('downloadProofBtn');
  
  if (batchCheckoutBtn) {
    batchCheckoutBtn.disabled = !hasSelection;
  }
  if (downloadProofBtn) {
    downloadProofBtn.disabled = !hasSelection;
  }
}

function updatePagination() {
  const total = filteredData.length;
  const totalPages = getTotalPages();
  
  const totalCount = document.getElementById('totalCount');
  const totalPagesEl = document.getElementById('totalPages');
  const currentPageInput = document.getElementById('currentPage');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  
  if (totalCount) totalCount.textContent = total;
  if (totalPagesEl) totalPagesEl.textContent = totalPages;
  if (currentPageInput) currentPageInput.value = currentPage;
  if (prevPage) prevPage.disabled = currentPage <= 1;
  if (nextPage) nextPage.disabled = currentPage >= totalPages;
}

function getTotalPages() {
  return Math.ceil(filteredData.length / itemsPerPage) || 1;
}

function changePage(page) {
  const totalPages = getTotalPages();
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderTable();
  }
}

function handleBatchCheckout() {
  if (selectedItems.size === 0) {
    alert('请至少选择一条记录进行签出');
    return;
  }
  showCheckoutModal('batch', Array.from(selectedItems));
}

function handleOneClickCheckout() {
  const checkoutableItems = filteredData
    .filter(item => item.actualStatus !== '已出库' && item.actualStatus !== '已取消' && item.actualStatus !== '已送达')
    .map(item => item.id);
  
  if (checkoutableItems.length === 0) {
    alert('当前没有可签出的记录');
    return;
  }
  
  showCheckoutModal('oneClick', checkoutableItems);
}

function showCheckoutModal(type, itemIds) {
  const modal = document.getElementById('checkoutModal');
  const modalMessage = document.getElementById('modalMessage');
  
  let message = '';
  if (type === 'single') {
    message = `确定要签出选中的 1 条记录吗？`;
  } else if (type === 'batch') {
    message = `确定要签出选中的 ${itemIds.length} 条记录吗？`;
  } else if (type === 'oneClick') {
    message = `确定要一键签出当前筛选条件下的 ${itemIds.length} 条记录吗？`;
  }
  
  modalMessage.textContent = message;
  modal.dataset.type = type;
  modal.dataset.itemIds = JSON.stringify(itemIds);
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('checkoutModal').classList.add('hidden');
}

function confirmCheckout() {
  const modal = document.getElementById('checkoutModal');
  const type = modal.dataset.type;
  const itemIds = JSON.parse(modal.dataset.itemIds);
  
  itemIds.forEach(id => {
    const item = tableData.find(d => d.id === id);
    if (item && item.actualStatus !== '已出库' && item.actualStatus !== '已取消' && item.actualStatus !== '已送达') {
      item.actualStatus = '已出库';
      item.status = '已出库';
    }
  });

  selectedItems.clear();
  handleSearch();
  closeModal();
  alert(`成功签出 ${itemIds.length} 条记录`);
}

function handleExportCost() {
  alert('费用明细导出功能开发中...');
}

function handleDownloadProof() {
  if (selectedItems.size === 0) {
    alert('请至少选择一条记录');
    return;
  }
  alert(`正在下载 ${selectedItems.size} 条记录的发货证明...`);
}

function showToast(message, type) {
  type = type || 'info';
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };
  toast.innerHTML = '<i class="fa ' + iconMap[type] + ' mr-2"></i>' + message;
  container.appendChild(toast);
  
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(function() {
      container.removeChild(toast);
    }, 300);
  }, 2000);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('已复制到剪贴板: ' + text, 'success');
    }).catch(function() {
      fallbackCopyToClipboard(text);
    });
  } else {
    fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('已复制到剪贴板: ' + text, 'success');
  } catch (err) {
    showToast('复制失败，请手动复制', 'error');
  }
  
  document.body.removeChild(textArea);
}
