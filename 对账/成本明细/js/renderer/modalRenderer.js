import { store } from '../state/store.js';
import { formatMoney } from '../utils/helpers.js';
import { MODAL_TABLE_CONFIG } from '../constants/config.js';

export function renderModalTable(data = null) {
  const state = store.getState();
  const tableData = data || state.modalData;
  const tbody = document.getElementById('modalDataTableBody');
  
  if (!tbody) return;
  
  const billType = document.getElementById('modalBillType')?.value;
  if (!billType || !MODAL_TABLE_CONFIG[billType]) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-gray-500">
          请先选择账单类型
        </td>
      </tr>
    `;
    return;
  }
  
  if (!tableData || tableData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2 text-gray-300"></i>
          <p>暂无数据</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = tableData.map(item => `
    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td class="py-3 px-4">
        <input type="checkbox" 
               class="rounded border-gray-300" 
               data-id="${item.id}"
               ${state.modalSelectedItems.has(item.id) ? 'checked' : ''}
               onchange="window.handleModalRowSelect('${item.id}')">
      </td>
      <td class="py-3 px-4 font-mono text-sm">${item.outboundNo || '-'}</td>
      <td class="py-3 px-4 font-mono text-sm">${item.trackingNo || '-'}</td>
      <td class="py-3 px-4">${item.warehouse || '-'}</td>
      <td class="py-3 px-4">${item.customerCode || '-'}</td>
      <td class="py-3 px-4">${item.voyagePeriod || '-'}</td>
      <td class="py-3 px-4 text-right font-mono">${item.weight || '-'}</td>
      <td class="py-3 px-4 text-right font-mono">${item.volume || '-'}</td>
      <td class="py-3 px-4 text-right font-mono">${formatMoney(item.fee)}</td>
    </tr>
  `).join('');
  
  updateModalSelectedCount();
}

export function updateModalSelectedCount() {
  const state = store.getState();
  const selectedCount = document.getElementById('modalSelectedCount');
  
  if (selectedCount) {
    selectedCount.textContent = state.modalSelectedItems.size;
  }
}

export function updateModalTableHeader() {
  const billType = document.getElementById('modalBillType')?.value;
  const headerRow = document.getElementById('modalDataTableHeader');
  
  if (!headerRow || !billType || !MODAL_TABLE_CONFIG[billType]) return;
  
  const config = MODAL_TABLE_CONFIG[billType];
  headerRow.innerHTML = `
    <th class="text-left py-3 px-4 font-semibold text-gray-700 w-12">
      <input type="checkbox" id="modalCheckAll" class="rounded border-gray-300">
    </th>
    ${config.headers.map(h => `
      <th class="text-${h.align || 'left'} py-3 px-4 font-semibold text-gray-700" style="width: ${h.width}">
        ${h.label}
      </th>
    `).join('')}
  `;
}

export function renderBatchModalTable(data = null) {
  const state = store.getState();
  const tableData = data || state.batchModalData;
  const tbody = document.getElementById('batchModalDataTableBody');
  
  if (!tbody) return;
  
  if (!tableData || tableData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-4xl mb-2 text-gray-300"></i>
          <p>暂无数据</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = tableData.map(item => `
    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td class="py-3 px-4">
        <input type="checkbox" 
               class="rounded border-gray-300" 
               data-id="${item.id}"
               ${state.batchModalSelectedItems.has(item.id) ? 'checked' : ''}
               onchange="window.handleBatchModalRowSelect('${item.id}')">
      </td>
      <td class="py-3 px-4">${item.customerCode || '-'}</td>
      <td class="py-3 px-4">${item.warehouse || '-'}</td>
      <td class="py-3 px-4">${item.billMonth || '-'}</td>
      <td class="py-3 px-4">${item.voyagePeriod || '-'}</td>
      <td class="py-3 px-4 text-right font-mono">${formatMoney(item.totalAmount)}</td>
      <td class="py-3 px-4">${item.status || '-'}</td>
      <td class="py-3 px-4">${item.operator || '-'}</td>
      <td class="py-3 px-4 text-sm">${item.operateTime || '-'}</td>
    </tr>
  `).join('');
  
  updateBatchModalSelectedCount();
}

export function updateBatchModalSelectedCount() {
  const state = store.getState();
  const selectedCount = document.getElementById('batchModalSelectedCount');
  
  if (selectedCount) {
    selectedCount.textContent = state.batchModalSelectedItems.size;
  }
}

export function showFeeModal() {
  const modal = document.getElementById('feeModal');
  if (modal) {
    modal.classList.add('show');
  }
}

export function hideFeeModal() {
  const modal = document.getElementById('feeModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

export function showBatchFeeModal() {
  const modal = document.getElementById('batchFeeModal');
  if (modal) {
    modal.classList.add('show');
  }
}

export function hideBatchFeeModal() {
  const modal = document.getElementById('batchFeeModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

export function showDetailModal(data) {
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailModalContent');
  
  if (modal && content) {
    content.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">账单号</label>
            <p class="text-base font-mono">${data.billNo || '-'}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">账单月</label>
            <p class="text-base">${data.billMonth || '-'}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">航期</label>
            <p class="text-base">${data.voyagePeriod || '-'}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">客户代码</label>
            <p class="text-base">${data.customerCode || '-'}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">账单金额</label>
            <p class="text-base font-mono">${formatMoney(data.amount)}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">账单状态</label>
            <p class="text-base">${data.status || '-'}</p>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-600">账单备注</label>
          <p class="text-base">${data.remark || '-'}</p>
        </div>
      </div>
    `;
    modal.classList.add('show');
  }
}

export function hideDetailModal() {
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.classList.remove('show');
  }
}