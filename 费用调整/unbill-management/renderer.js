/**
 * 未出账管理模块 - 渲染逻辑
 */

const UnbillRenderer = {
  renderOrderTable(data, tabType) {
    const tbody = document.getElementById('orderTableBody');
    if (!tbody) return;
    
    const showLogisticsProduct = tabType === CommonConstants.TAB_TYPES.OUTBOUND;
    const colCount = showLogisticsProduct ? 10 : 9;
    
    if (data.length === 0) {
      tbody.innerHTML = `<tr class="border-t border-gray-100">
        <td colspan="${colCount}" class="px-4 py-12 text-center text-gray-400">
          <i class="fa fa-inbox text-4xl mb-2 block"></i>
          <p>暂无数据</p>
        </td>
      </tr>`;
      return;
    }
    
    const html = data.map(row => this.createOrderRowHTML(row, showLogisticsProduct)).join('');
    tbody.innerHTML = html;
  },
  
  createOrderRowHTML(row, showLogisticsProduct) {
    const logisticsProductCell = showLogisticsProduct 
      ? `<td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(row.logisticsProduct)}</td>` 
      : '';
    
    return `
      <tr class="border-t border-gray-100 table-hover-row">
        <td class="px-4 py-3">
          <input type="checkbox" class="row-checkbox rounded text-primary focus:ring-primary" data-id="${row.id}">
        </td>
        <td class="px-4 py-3 text-sm">${CommonUtils.formatDate(row.orderTime)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(row.billType)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(row.warehouse)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(row.customerCode)}</td>
        <td class="px-4 py-3 text-sm font-medium text-primary">${CommonUtils.escapeHtml(row.orderNo)}</td>
        ${logisticsProductCell}
        <td class="px-4 py-3 text-sm font-semibold">${CommonUtils.formatNumber(row.amount)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(row.currency)}</td>
        <td class="px-4 py-3 text-sm">
          <button class="table-action-btn" onclick="viewOrderDetail('${row.orderNo}')">查看</button>
        </td>
      </tr>
    `;
  },
  
  renderRecalculateTable(data, tabType) {
    const tbody = document.getElementById('recalculateTableBody');
    if (!tbody) return;
    
    const headers = UnbillUtils.getTableHeaders(tabType);
    const colCount = headers.length;
    
    if (data.length === 0) {
      tbody.innerHTML = `<tr class="border-t border-gray-100">
        <td colspan="${colCount}" class="px-4 py-12 text-center text-gray-400">
          <i class="fa fa-inbox text-4xl mb-2 block"></i>
          <p>暂无数据</p>
        </td>
      </tr>`;
      return;
    }
    
    const html = data.map(row => this.createRecalculateRowHTML(row, headers)).join('');
    tbody.innerHTML = html;
  },
  
  createRecalculateRowHTML(row, headers) {
    const cellsHTML = headers.map(header => {
      const value = row[header.key];
      let cellContent = '';
      
      switch (header.key) {
        case 'status':
          cellContent = this.createStatusBadge(value);
          break;
        case 'amount':
        case 'originalAmount':
          cellContent = value === '-' ? '-' : CommonUtils.formatNumber(value);
          break;
        default:
          cellContent = CommonUtils.escapeHtml(value);
      }
      
      return `<td class="px-4 py-3 text-sm">${cellContent}</td>`;
    }).join('');
    
    return `<tr class="border-t border-gray-100 table-hover-row">${cellsHTML}</tr>`;
  },
  
  createStatusBadge(status) {
    const statusConfig = {
      success: { class: 'status-badge-success', text: '成功' },
      processing: { class: 'status-badge-warning', text: '重计中' },
      failed: { class: 'status-badge-error', text: '失败' }
    };
    
    const config = statusConfig[status] || { class: 'status-badge-default', text: status };
    return `<span class="status-badge ${config.class}">${config.text}</span>`;
  },
  
  renderTableHeaders(tabType) {
    const thead = document.getElementById('recalculateTableHead');
    if (!thead) return;
    
    const headers = UnbillUtils.getTableHeaders(tabType);
    const html = `<tr class="bg-gray-50 text-left">
      ${headers.map(header => `<th class="px-4 py-3 font-medium text-gray-500">${header.label}</th>`).join('')}
    </tr>`;
    
    thead.innerHTML = html;
  },
  
  updatePagination(totalCount, currentPage, pageSize) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginationHTML = CommonRenderer.createPaginationHTML(currentPage, totalPages, totalCount);
    
    const paginationContainer = document.getElementById('paginationContainer');
    if (paginationContainer) {
      paginationContainer.innerHTML = paginationHTML;
    }
  },
  
  openRecalculateModal(tabType) {
    const modal = document.getElementById('recalculateModal');
    const modalChargeType = document.getElementById('modalChargeType');
    
    if (modal && modalChargeType) {
      const config = UnbillConstants.TAB_CONFIGS[tabType];
      modalChargeType.textContent = config.label;
      modal.classList.remove('hidden');
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      const showLogisticsProduct = tabType === CommonConstants.TAB_TYPES.OUTBOUND;
      const logisticsProductFilters = document.querySelectorAll('.logistics-product-filter');
      logisticsProductFilters.forEach(filter => {
        filter.style.display = showLogisticsProduct ? '' : 'none';
      });
      
      this.renderTableHeaders(tabType);
    }
  },
  
  closeRecalculateModal() {
    const modal = document.getElementById('recalculateModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },
  
  showSuccessModal(selectedCount) {
    const modal = document.getElementById('successModal');
    const successCount = document.getElementById('successCount');
    
    if (modal && successCount) {
      successCount.textContent = selectedCount;
      modal.classList.remove('hidden');
      modal.classList.add('show');
    }
  },
  
  showLimitExceededModal(count) {
    const modal = document.getElementById('limitExceededModal');
    const exceededCount = document.getElementById('exceededCount');
    
    if (modal && exceededCount) {
      exceededCount.textContent = count;
      modal.classList.remove('hidden');
      modal.classList.add('show');
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnbillRenderer;
}