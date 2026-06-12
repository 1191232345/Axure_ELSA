/**
 * 费用调整主页面 - 渲染逻辑
 */

const MainRenderer = {
  renderOrderTable(data, tabType) {
    const tbody = document.getElementById('orderTableBody');
    if (!tbody) return;
    
    const showLogisticsProduct = tabType === CommonConstants.TAB_TYPES.OUTBOUND;
    const showServiceType = tabType === CommonConstants.TAB_TYPES.VALUE_ADDED;
    const colCount = (showLogisticsProduct || showServiceType) ? 10 : 9;
    
    this.renderMainTableHead(showLogisticsProduct, showServiceType);
    
    if (data.length === 0) {
      tbody.innerHTML = `<tr class="border-t border-gray-100">
        <td colspan="${colCount}" class="px-4 py-12 text-center text-gray-400">
          <i class="fa fa-inbox text-4xl mb-2 block"></i>
          <p>暂无数据</p>
        </td>
      </tr>`;
      return;
    }
    
    const html = data.map(row => this.createOrderRowHTML(row, showLogisticsProduct, showServiceType)).join('');
    tbody.innerHTML = html;
  },
  
  renderMainTableHead(showLogisticsProduct, showServiceType) {
    const thead = document.getElementById('mainTableHead');
    if (!thead) return;
    
    let extraTh = '';
    if (showLogisticsProduct) {
      extraTh = '<th class="px-4 py-3 font-medium text-gray-500">物流产品</th>';
    } else if (showServiceType) {
      extraTh = '<th class="px-4 py-3 font-medium text-gray-500">服务类型</th>';
    }
    
    thead.innerHTML = `<tr class="bg-gray-50 text-left">
      <th class="px-4 py-3 w-10"><input type="checkbox" id="selectAllCheckbox" class="rounded text-primary focus:ring-primary"></th>
      <th class="px-4 py-3 font-medium text-gray-500">下单时间</th>
      <th class="px-4 py-3 font-medium text-gray-500">账单类型</th>
      <th class="px-4 py-3 font-medium text-gray-500">仓库</th>
      <th class="px-4 py-3 font-medium text-gray-500">客户代码</th>
      <th class="px-4 py-3 font-medium text-gray-500">订单号</th>
      ${extraTh}
      <th class="px-4 py-3 font-medium text-gray-500">计费总金额</th>
      <th class="px-4 py-3 font-medium text-gray-500">币种</th>
      <th class="px-4 py-3 font-medium text-gray-500">操作</th>
    </tr>`;
  },
  
  createOrderRowHTML(row, showLogisticsProduct, showServiceType) {
    let extraCell = '';
    if (showLogisticsProduct) {
      extraCell = `<td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(row.logisticsProduct || '-')}</td>`;
    } else if (showServiceType) {
      extraCell = `<td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(row.serviceType || '-')}</td>`;
    }
    
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
        ${extraCell}
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
    
    const headers = MainUtils.getTableHeaders(tabType);
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
          cellContent = CommonUtils.escapeHtml(value || '-');
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
    
    const headers = MainUtils.getTableHeaders(tabType);
    const html = `<tr class="bg-gray-50 text-left">
      ${headers.map(header => `<th class="px-4 py-3 font-medium text-gray-500">${header.label}</th>`).join('')}
    </tr>`;
    
    thead.innerHTML = html;
  },
  
  openRecalculateModal(tabType) {
    const modal = document.getElementById('recalculateModal');
    const modalChargeType = document.getElementById('modalChargeType');
    
    if (modal && modalChargeType) {
      const config = MainConstants.TAB_CONFIGS[tabType];
      modalChargeType.textContent = config.label;
      modal.classList.remove('hidden');
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
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
  
  openFeeDetailModal(orderNo) {
    const modal = document.getElementById('feeDetailModal');
    const orderNoSpan = document.getElementById('feeDetailOrderNo');
    
    if (modal && orderNoSpan) {
      orderNoSpan.textContent = orderNo;
      modal.classList.remove('hidden');
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      const feeDetailData = MainUtils.generateFeeDetailData(orderNo);
      this.renderFeeDetailTable(feeDetailData);
    }
  },
  
  renderFeeDetailTable(data) {
    const tbody = document.getElementById('feeDetailTableBody');
    const totalAmountSpan = document.getElementById('feeDetailTotalAmount');
    const currencySpan = document.getElementById('feeDetailCurrency');
    
    if (!tbody) return;
    
    if (!data.items || data.items.length === 0) {
      tbody.innerHTML = `<tr class="border-t border-gray-100">
        <td colspan="4" class="px-4 py-12 text-center text-gray-400">
          <i class="fa fa-inbox text-4xl mb-2 block"></i>
          <p>暂无数据</p>
        </td>
      </tr>`;
      if (totalAmountSpan) totalAmountSpan.textContent = '0.00';
      if (currencySpan) currencySpan.textContent = 'USD';
      return;
    }
    
    const html = data.items.map(item => `
      <tr class="border-t border-gray-100 table-hover-row">
        <td class="px-4 py-3 text-sm">${CommonUtils.formatDate(item.feeTime)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(item.feeItem)}</td>
        <td class="px-4 py-3 text-sm font-semibold">${CommonUtils.formatNumber(item.amount)}</td>
        <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(item.currency)}</td>
      </tr>
    `).join('');
    
    tbody.innerHTML = html;
    
    if (totalAmountSpan) totalAmountSpan.textContent = CommonUtils.formatNumber(data.totalAmount);
    if (currencySpan) currencySpan.textContent = data.currency;
  },
  
  closeFeeDetailModal() {
    const modal = document.getElementById('feeDetailModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainRenderer;
}