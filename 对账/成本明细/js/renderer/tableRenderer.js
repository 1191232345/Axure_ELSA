import { store } from '../state/store.js';
import { formatMoney, formatDate, getStatusClass } from '../utils/helpers.js';
import { BILL_TYPE_HEADERS, ITEMS_PER_PAGE } from '../constants/config.js';

export function renderTable(data = null) {
  const state = store.getState();
  const tableData = data || state.reconciliationData;
  const tbody = document.getElementById('reconciliationTableBody');
  
  if (!tbody) return;
  
  if (!tableData || tableData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="14" class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2 text-gray-300"></i>
          <p>暂无数据</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageData = tableData.slice(startIndex, endIndex);
  
  tbody.innerHTML = pageData.map(item => `
    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td class="py-3 px-4">
        <input type="checkbox" 
               class="rounded border-gray-300" 
               data-id="${item.id}"
               ${state.selectedItems.has(item.id) ? 'checked' : ''}
               onchange="window.handleRowSelect('${item.id}')">
      </td>
      <td class="py-3 px-4 font-mono text-sm">${item.billNo || '-'}</td>
      <td class="py-3 px-4">${item.billMonth || '-'}</td>
      <td class="py-3 px-4">${item.voyagePeriod || '-'}</td>
      <td class="py-3 px-4">${item.customerCode || '-'}</td>
      <td class="py-3 px-4">${item.sales || '-'}</td>
      <td class="py-3 px-4">${item.customerService || '-'}</td>
      <td class="py-3 px-4">${item.billType || '-'}</td>
      <td class="py-3 px-4 text-right font-mono">${formatMoney(item.amount)}</td>
      <td class="py-3 px-4">
        <span class="status-badge ${getStatusClass(item.status)}">${item.status || '-'}</span>
      </td>
      <td class="py-3 px-4">${item.operator || '-'}</td>
      <td class="py-3 px-4 text-sm">${formatDate(item.operateTime)}</td>
      <td class="py-3 px-4">${item.remark || '-'}</td>
      <td class="py-3 px-4 text-center">
        <button class="table-btn text-primary hover:text-primary-light" onclick="window.handleViewDetail('${item.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="table-btn text-primary hover:text-primary-light ml-2" onclick="window.handleEdit('${item.id}')">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  updatePagination(tableData.length);
  updateSummary();
}

export function updatePagination(totalItems) {
  const state = store.getState();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const pageButtons = document.getElementById('pageButtons');
  const paginationInfo = document.getElementById('paginationInfo');
  
  if (!pageButtons || !paginationInfo) return;
  
  const startItem = (state.currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(state.currentPage * ITEMS_PER_PAGE, totalItems);
  
  paginationInfo.textContent = `显示 ${startItem}-${endItem} 条，共 ${totalItems} 条`;
  
  let buttonsHTML = '';
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    buttonsHTML += `
      <button class="w-8 h-8 flex items-center justify-center rounded border ${state.currentPage === i ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:border-primary hover:text-primary'} transition-all" onclick="window.handlePageChange(${i})">
        ${i}
      </button>
    `;
  }
  pageButtons.innerHTML = buttonsHTML;
  
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  
  if (prevBtn) {
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.classList.toggle('opacity-50', state.currentPage === 1);
  }
  
  if (nextBtn) {
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.classList.toggle('opacity-50', state.currentPage === totalPages);
  }
}

export function updateSummary() {
  const state = store.getState();
  const selectedRecords = document.getElementById('selectedRecords');
  const totalAmount = document.getElementById('totalAmount');
  
  if (selectedRecords) {
    selectedRecords.textContent = state.selectedItems.size;
  }
  
  if (totalAmount) {
    const selectedData = state.reconciliationData.filter(item => 
      state.selectedItems.has(item.id)
    );
    const total = selectedData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    totalAmount.textContent = formatMoney(total);
  }
}

export function renderFilters() {
  const coreContainer = document.getElementById('coreFilters');
  const auxContainer = document.getElementById('auxFilters');
  if (!coreContainer && !auxContainer) return;
  
  const { FILTER_CONFIG_DEFINITIONS } = require('../constants/config.js');
  const visibleFilters = FILTER_CONFIG_DEFINITIONS.basic.filter(f => f.defaultVisible);
  
  if (coreContainer) coreContainer.innerHTML = '';
  if (auxContainer) auxContainer.innerHTML = '';
  
  const primaryFilters = visibleFilters.filter(f => f.group === 'primary').sort((a, b) => a.order - b.order);
  const secondaryFilters = visibleFilters.filter(f => f.group === 'secondary').sort((a, b) => a.order - b.order);
  
  if (primaryFilters.length > 0 && coreContainer) {
    primaryFilters.forEach(filter => {
      const div = document.createElement('div');
      div.className = 'filter-item';
      
      if (filter.type === 'select') {
        div.innerHTML = `
          <div class="filter-row">
            <label>${filter.label}</label>
            <select id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}" class="form-select">
              ${filter.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (filter.type === 'month') {
        div.innerHTML = `
          <div class="filter-row">
            <label>${filter.label}</label>
            <input type="month" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}" class="form-input">
          </div>
        `;
      }
      
      coreContainer.appendChild(div);
      
      if (filter.defaultValue) {
        const input = document.getElementById(`filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}`);
        if (input) {
          input.value = filter.defaultValue;
        }
      }
    });
  }
  
  if (secondaryFilters.length > 0 && auxContainer) {
    secondaryFilters.forEach(filter => {
      const div = document.createElement('div');
      div.className = 'filter-item';
      
      if (filter.type === 'select') {
        div.innerHTML = `
          <div class="filter-row">
            <label>${filter.label}</label>
            <select id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}" class="form-select">
              ${filter.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (filter.type === 'daterange') {
        div.innerHTML = `
          <div class="filter-row">
            <label>${filter.label}</label>
            <div class="filter-date-range">
              <input type="date" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}Start" class="form-input" placeholder="开始日期">
              <span class="date-separator">-</span>
              <input type="date" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}End" class="form-input" placeholder="结束日期">
            </div>
          </div>
        `;
      }
      
      auxContainer.appendChild(div);
    });
  }
}