/* ========================================
   价卡查询 - 客户端交互逻辑
   ======================================== */

let allData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let currentCustomer = 'DEMO - demo';

document.addEventListener('DOMContentLoaded', async function() {
  await loadData();
  bindEvents();
});

async function loadData() {
  try {
    const resp = await fetch('../../仓储规则/data/storage-rule-data.json');
    if (resp.ok) {
      allData = await resp.json();
    } else {
      throw new Error('加载失败');
    }
  } catch (e) {
    console.warn('数据加载失败，使用默认数据', e);
    allData = getDefaultData();
  }
  
  allData = allData.filter(item => item.publishStatus === 'published');
  
  filterByCustomer();
  renderTable();
  renderPagination();
  updateStats();
}

function getDefaultData() {
  return [
    {
      id: 2, ruleName: '标准仓储', storageLevel: '标准', warehouseCode: 'WH002', warehouseName: 'WH002',
      settlementCycle: '月结', currency: 'CNY', chargeType: '按件计费', customerCode: 'DEMO - demo',
      customerName: '某电子商务有限公司', validityPeriod: '2025-03-01 00:00:00-2026-03-01 00:00:00',
      publishStatus: 'published', updater: 'admin', creator: 'admin', remark: '标准费率',
      updateTime: '2025-07-21 09:30:00', createTime: '2025-07-20 14:00:00'
    },
    {
      id: 3, ruleName: 'VIP仓储', storageLevel: 'VIP', warehouseCode: 'WH003', warehouseName: 'WH003',
      settlementCycle: '周结', currency: 'USD', chargeType: '按重量', customerCode: 'VIP001',
      customerName: 'VIP客户公司', validityPeriod: '2025-06-01 00:00:00-2025-12-31 00:00:00',
      publishStatus: 'published', updater: 'zsw', creator: 'zsw', remark: '-',
      updateTime: '2025-07-22 08:00:00', createTime: '2025-07-22 08:00:00'
    },
    {
      id: 4, ruleName: '冷链仓储', storageLevel: '自定义', warehouseCode: 'CL001', warehouseName: 'CL001',
      settlementCycle: '日结', currency: 'CNY', chargeType: '按体积', customerCode: 'COLD001',
      customerName: '冷链物流公司', validityPeriod: '2025-01-01 00:00:00-2025-12-31 00:00:00',
      publishStatus: 'published', updater: 'admin', creator: 'zsw', remark: '冷链特殊费率',
      updateTime: '2025-07-19 16:20:00', createTime: '2025-07-15 10:00:00'
    },
    {
      id: 5, ruleName: '跨境仓储', storageLevel: '标准', warehouseCode: 'CB001', warehouseName: 'CB001',
      settlementCycle: '月结', currency: 'USD', chargeType: '批次库龄', customerCode: 'DEMO - demo',
      customerName: '某电子商务有限公司', validityPeriod: '2025-04-01 00:00:00-2026-04-01 00:00:00',
      publishStatus: 'published', updater: 'zsw', creator: 'admin', remark: '-',
      updateTime: '2025-07-22 10:44:19', createTime: '2025-07-10 09:00:00'
    }
  ];
}

function bindEvents() {
  document.getElementById('customerSelector').addEventListener('change', function() {
    currentCustomer = this.value;
    filterByCustomer();
    currentPage = 1;
    renderTable();
    renderPagination();
    updateStats();
  });
  
  document.getElementById('btnSearch').addEventListener('click', filterData);
  document.getElementById('btnReset').addEventListener('click', resetFilters);
  document.getElementById('btnExport').addEventListener('click', exportData);
  document.getElementById('pageSize').addEventListener('change', function() {
    pageSize = parseInt(this.value);
    currentPage = 1;
    renderTable();
    renderPagination();
  });
}

function filterByCustomer() {
  filteredData = allData.filter(item => item.customerCode === currentCustomer);
}

function filterData() {
  const warehouseCode = document.getElementById('filterWarehouseCode').value.trim().toLowerCase();
  const storageLevel = document.getElementById('filterStorageLevel').value;
  const ruleName = document.getElementById('filterRuleName').value.trim().toLowerCase();
  const settlementCycle = document.getElementById('filterSettlementCycle').value;

  filteredData = allData.filter(item => {
    if (item.customerCode !== currentCustomer) return false;
    if (warehouseCode && !item.warehouseCode.toLowerCase().includes(warehouseCode)) return false;
    if (storageLevel && item.storageLevel !== storageLevel) return false;
    if (ruleName && !item.ruleName.toLowerCase().includes(ruleName)) return false;
    if (settlementCycle && item.settlementCycle !== settlementCycle) return false;
    return true;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
  updateStats();
}

function resetFilters() {
  document.getElementById('filterWarehouseCode').value = '';
  document.getElementById('filterStorageLevel').value = '';
  document.getElementById('filterRuleName').value = '';
  document.getElementById('filterSettlementCycle').value = '';
  filterByCustomer();
  currentPage = 1;
  renderTable();
  renderPagination();
  updateStats();
}

function getValidityStatus(validityPeriod) {
  const parts = validityPeriod.split('-');
  if (parts.length < 2) return { status: 'unknown', label: '未知', class: '' };
  
  const endDateStr = parts[1];
  const endDate = new Date(endDateStr.replace(/ /g, 'T'));
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) {
    return { status: 'expired', label: '已过期', class: 'status-expired' };
  } else if (daysUntilExpiry <= 30) {
    return { status: 'expiring', label: '即将到期', class: 'status-expiring' };
  } else {
    return { status: 'active', label: '生效中', class: 'status-active' };
  }
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#999;">暂无价卡数据</td></tr>';
    return;
  }

  tbody.innerHTML = pageData.map(item => {
    const validityStatus = getValidityStatus(item.validityPeriod);
    return `
      <tr>
        <td><strong>${item.ruleName}</strong></td>
        <td>${item.storageLevel}</td>
        <td>${item.warehouseCode}</td>
        <td>${item.settlementCycle}</td>
        <td>${item.currency}</td>
        <td>${item.chargeType}</td>
        <td>${item.validityPeriod}</td>
        <td><span class="status-badge ${validityStatus.class}">${validityStatus.label}</span></td>
        <td>
          <div class="action-btns">
            <i class="fa fa-eye action-btn" title="查看详情" onclick="viewDetail(${item.id})"></i>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPagination() {
  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  document.getElementById('totalCount').textContent = total;

  const pagesContainer = document.getElementById('pageButtons');
  let html = '';

  html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fa fa-chevron-left"></i></button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span style="padding:4px 8px;color:#999;">...</span>`;
    }
  }

  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fa fa-chevron-right"></i></button>`;

  pagesContainer.innerHTML = html;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
  renderPagination();
}

function updateStats() {
  const customerData = allData.filter(item => item.customerCode === currentCustomer);
  
  let activeCount = 0;
  let expiringCount = 0;
  
  customerData.forEach(item => {
    const status = getValidityStatus(item.validityPeriod);
    if (status.status === 'active') {
      activeCount++;
    } else if (status.status === 'expiring') {
      expiringCount++;
    }
  });
  
  document.getElementById('totalCountStat').textContent = customerData.length;
  document.getElementById('activeCountStat').textContent = activeCount;
  document.getElementById('expiringCountStat').textContent = expiringCount;
}

function showModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer">
        <button class="erp-btn erp-btn-primary" onclick="closeModal(this)">确定</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(element) {
  const modal = element.closest('.modal');
  modal.classList.remove('show');
  setTimeout(() => modal.remove(), 300);
}

function viewDetail(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  
  const validityStatus = getValidityStatus(item.validityPeriod);
  
  showModal('价卡详情 - ' + item.ruleName, `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">规则名称</span><span class="detail-value">${item.ruleName}</span></div>
      <div class="detail-item"><span class="detail-label">仓储等级</span><span class="detail-value">${item.storageLevel}</span></div>
      <div class="detail-item"><span class="detail-label">仓库代码</span><span class="detail-value">${item.warehouseCode}</span></div>
      <div class="detail-item"><span class="detail-label">结算周期</span><span class="detail-value">${item.settlementCycle}</span></div>
      <div class="detail-item"><span class="detail-label">币种</span><span class="detail-value">${item.currency}</span></div>
      <div class="detail-item"><span class="detail-label">计费类型</span><span class="detail-value">${item.chargeType}</span></div>
      <div class="detail-item"><span class="detail-label">客户代码</span><span class="detail-value">${item.customerCode}</span></div>
      <div class="detail-item"><span class="detail-label">客户名称</span><span class="detail-value">${item.customerName || '-'}</span></div>
      <div class="detail-item" style="grid-column:1/-1;"><span class="detail-label">有效期</span><span class="detail-value">${item.validityPeriod}</span></div>
      <div class="detail-item"><span class="detail-label">状态</span><span class="detail-value"><span class="status-badge ${validityStatus.class}">${validityStatus.label}</span></span></div>
      <div class="detail-item"><span class="detail-label">备注</span><span class="detail-value">${item.remark || '-'}</span></div>
    </div>
  `);
}

function exportData() {
  const headers = ['规则名称', '仓储等级', '仓库', '结算周期', '币种', '计费类型', '客户代码', '有效期', '状态', '备注'];
  const rows = filteredData.map(item => {
    const status = getValidityStatus(item.validityPeriod);
    return [
      item.ruleName, item.storageLevel, item.warehouseCode, item.settlementCycle,
      item.currency, item.chargeType, item.customerCode, item.validityPeriod,
      status.label, item.remark
    ];
  });
  
  let csv = '\uFEFF' + headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `我的价卡_${currentCustomer}_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}
