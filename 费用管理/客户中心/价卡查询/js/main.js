/* ========================================
   价卡查询 - 客户端交互逻辑
   统一展示所有价卡类型：仓储费、运费、操作费、其他费用
   ======================================== */

let allData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let currentCustomer = 'DEMO - demo';

const PRICE_CARD_TYPES = {
  storage: {
    name: '仓储费',
    icon: 'fa-cube',
    dataPath: '../../仓储规则/data/storage-rule-data.json',
    getDetailInfo: (item) => item.storageLevel || '-',
    detailFields: [
      { key: 'ruleName', label: '规则名称' },
      { key: 'storageLevel', label: '仓储等级' },
      { key: 'warehouseCode', label: '仓库代码' },
      { key: 'settlementCycle', label: '结算周期' },
      { key: 'currency', label: '币种' },
      { key: 'chargeType', label: '计费类型' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'validityPeriod', label: '有效期', fullWidth: true },
      { key: 'status', label: '状态', type: 'status' },
      { key: 'remark', label: '备注' }
    ]
  },
  shipping: {
    name: '运费',
    icon: 'fa-truck',
    dataPath: '../../运费规则/data/shipping-rule-data.json',
    getDetailInfo: (item) => `${item.carrier || '-'} / ${item.serviceType || '-'}`,
    detailFields: [
      { key: 'ruleName', label: '规则名称' },
      { key: 'carrier', label: '承运商' },
      { key: 'serviceType', label: '服务类型' },
      { key: 'destination', label: '目的地' },
      { key: 'weightRange', label: '重量区间' },
      { key: 'pricePerKg', label: '单价(元/kg)' },
      { key: 'currency', label: '币种' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'validityPeriod', label: '有效期', fullWidth: true },
      { key: 'status', label: '状态', type: 'status' },
      { key: 'remark', label: '备注' }
    ]
  },
  operation: {
    name: '操作费',
    icon: 'fa-cogs',
    dataPath: '../../操作费规则/data/operation-rule-data.json',
    getDetailInfo: (item) => `${item.operationType || '-'} / ${item.unitPrice || '-'}元/${item.unit || '件'}`,
    detailFields: [
      { key: 'ruleName', label: '规则名称' },
      { key: 'operationType', label: '操作类型' },
      { key: 'warehouseCode', label: '仓库代码' },
      { key: 'unit', label: '计费单位' },
      { key: 'unitPrice', label: '单价' },
      { key: 'currency', label: '币种' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'validityPeriod', label: '有效期', fullWidth: true },
      { key: 'status', label: '状态', type: 'status' },
      { key: 'remark', label: '备注' }
    ]
  },
  other: {
    name: '其他费用',
    icon: 'fa-list-alt',
    dataPath: '../../其他费用规则/data/other-rule-data.json',
    getDetailInfo: (item) => `${item.feeType || '-'} / ${item.amount || '-'}元`,
    detailFields: [
      { key: 'ruleName', label: '规则名称' },
      { key: 'feeType', label: '费用类型' },
      { key: 'warehouseCode', label: '仓库代码' },
      { key: 'chargeMode', label: '收费方式' },
      { key: 'amount', label: '金额' },
      { key: 'currency', label: '币种' },
      { key: 'customerCode', label: '客户代码' },
      { key: 'validityPeriod', label: '有效期', fullWidth: true },
      { key: 'status', label: '状态', type: 'status' },
      { key: 'remark', label: '备注' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', async function() {
  await loadAllData();
  bindEvents();
  renderTable();
  renderPagination();
  updateStats();
});

async function loadAllData() {
  const loadPromises = Object.entries(PRICE_CARD_TYPES).map(async ([type, config]) => {
    try {
      const resp = await fetch(config.dataPath);
      if (resp.ok) {
        const data = await resp.json();
        return data.filter(item => item.publishStatus === 'published').map(item => ({
          ...item,
          priceCardType: type
        }));
      }
    } catch (e) {
      console.warn(`${config.name}数据加载失败，使用默认数据`, e);
    }
    return getDefaultData(type);
  });
  
  const results = await Promise.all(loadPromises);
  allData = results.flat();
  
  filterByCustomer();
}

function getDefaultData(type) {
  const defaults = {
    storage: [
      {
        id: 1, ruleName: '标准仓储', storageLevel: '标准', warehouseCode: 'WH002',
        settlementCycle: '月结', currency: 'CNY', chargeType: '按件计费', customerCode: 'DEMO - demo',
        validityPeriod: '2025-03-01 00:00:00-2026-03-01 00:00:00', publishStatus: 'published', remark: '标准费率'
      },
      {
        id: 2, ruleName: 'VIP仓储', storageLevel: 'VIP', warehouseCode: 'WH003',
        settlementCycle: '周结', currency: 'USD', chargeType: '按重量', customerCode: 'VIP001',
        validityPeriod: '2025-06-01 00:00:00-2025-12-31 00:00:00', publishStatus: 'published', remark: '-'
      }
    ],
    shipping: [
      {
        id: 101, ruleName: '美国标准快递', carrier: 'FedEx', serviceType: '标准快递', destination: '美国',
        weightRange: '0-1kg', pricePerKg: '45', currency: 'CNY', customerCode: 'DEMO - demo',
        validityPeriod: '2025-01-01 00:00:00-2025-12-31 00:00:00', publishStatus: 'published', remark: '-'
      },
      {
        id: 102, ruleName: '欧洲空运专线', carrier: 'DHL', serviceType: '空运', destination: '德国',
        weightRange: '0-5kg', pricePerKg: '68', currency: 'CNY', customerCode: 'VIP001',
        validityPeriod: '2025-03-01 00:00:00-2026-03-01 00:00:00', publishStatus: 'published', remark: '优惠费率'
      }
    ],
    operation: [
      {
        id: 201, ruleName: '标准入库费', operationType: '入库操作', warehouseCode: 'WH002',
        unit: '件', unitPrice: '2.5', currency: 'CNY', customerCode: 'DEMO - demo',
        validityPeriod: '2025-01-01 00:00:00-2025-12-31 00:00:00', publishStatus: 'published', remark: '-'
      },
      {
        id: 202, ruleName: '退货处理费', operationType: '退货处理', warehouseCode: 'WH003',
        unit: '件', unitPrice: '5.0', currency: 'CNY', customerCode: 'VIP001',
        validityPeriod: '2025-06-01 00:00:00-2026-06-01 00:00:00', publishStatus: 'published', remark: 'VIP优惠'
      }
    ],
    other: [
      {
        id: 301, ruleName: '包装材料费', feeType: '服务费', warehouseCode: 'WH002',
        chargeMode: '按件', amount: '1.5', currency: 'CNY', customerCode: 'DEMO - demo',
        validityPeriod: '2025-01-01 00:00:00-2025-12-31 00:00:00', publishStatus: 'published', remark: '-'
      },
      {
        id: 302, ruleName: '特殊处理附加费', feeType: '附加费', warehouseCode: 'WH003',
        chargeMode: '按次', amount: '50', currency: 'CNY', customerCode: 'VIP001',
        validityPeriod: '2025-03-01 00:00:00-2026-03-01 00:00:00', publishStatus: 'published', remark: '特殊货物'
      }
    ]
  };
  
  return (defaults[type] || []).map(item => ({
    ...item,
    priceCardType: type
  }));
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
  const priceCardType = document.getElementById('filterPriceCardType').value;
  const warehouseCode = document.getElementById('filterWarehouseCode').value.trim().toLowerCase();
  const ruleName = document.getElementById('filterRuleName').value.trim().toLowerCase();
  const statusFilter = document.getElementById('filterStatus').value;

  filteredData = allData.filter(item => {
    if (item.customerCode !== currentCustomer) return false;
    if (priceCardType && item.priceCardType !== priceCardType) return false;
    if (warehouseCode && !item.warehouseCode?.toLowerCase().includes(warehouseCode)) return false;
    if (ruleName && !item.ruleName?.toLowerCase().includes(ruleName)) return false;
    if (statusFilter) {
      const status = getValidityStatus(item.validityPeriod || '');
      if (status.status !== statusFilter) return false;
    }
    return true;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
  updateStats();
}

function resetFilters() {
  document.getElementById('filterPriceCardType').value = '';
  document.getElementById('filterWarehouseCode').value = '';
  document.getElementById('filterRuleName').value = '';
  document.getElementById('filterStatus').value = '';
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

function getTypeBadge(type) {
  const config = PRICE_CARD_TYPES[type];
  const colors = {
    storage: 'background:#e6f7ff;color:#096dd9;border:1px solid #91d5ff;',
    shipping: 'background:#f6ffed;color:#52c41a;border:1px solid #b7eb8f;',
    operation: 'background:#fff7e6;color:#d46b08;border:1px solid #ffd591;',
    other: 'background:#f9f0ff;color:#722ed1;border:1px solid #d3adf7;'
  };
  return `<span class="type-badge" style="${colors[type] || ''}padding:2px 8px;border-radius:4px;font-size:12px;">${config?.name || type}</span>`;
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#999;">暂无价卡数据</td></tr>';
    return;
  }

  tbody.innerHTML = pageData.map(item => {
    const config = PRICE_CARD_TYPES[item.priceCardType];
    const validityStatus = getValidityStatus(item.validityPeriod || '');
    const detailInfo = config?.getDetailInfo ? config.getDetailInfo(item) : '-';
    
    return `
      <tr>
        <td>${getTypeBadge(item.priceCardType)}</td>
        <td><strong>${item.ruleName || '-'}</strong></td>
        <td>${item.warehouseCode || '-'}</td>
        <td>${detailInfo}</td>
        <td>${item.currency || '-'}</td>
        <td>${item.validityPeriod || '-'}</td>
        <td><span class="status-badge ${validityStatus.class}">${validityStatus.label}</span></td>
        <td>
          <div class="action-btns">
            <i class="fa fa-eye action-btn" title="查看详情" onclick="viewDetail('${item.priceCardType}', ${item.id})"></i>
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
    const status = getValidityStatus(item.validityPeriod || '');
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

function viewDetail(priceCardType, id) {
  const item = allData.find(d => d.priceCardType === priceCardType && d.id === id);
  if (!item) return;
  
  const config = PRICE_CARD_TYPES[priceCardType];
  const validityStatus = getValidityStatus(item.validityPeriod || '');
  
  const detailItems = (config?.detailFields || []).map(field => {
    let value = item[field.key];
    if (field.type === 'status') {
      value = `<span class="status-badge ${validityStatus.class}">${validityStatus.label}</span>`;
    }
    const fullWidthStyle = field.fullWidth ? 'style="grid-column:1/-1;"' : '';
    return `<div class="detail-item" ${fullWidthStyle}><span class="detail-label">${field.label}</span><span class="detail-value">${value || '-'}</span></div>`;
  }).join('');
  
  const typeBadge = getTypeBadge(priceCardType);
  const header = `<div class="detail-item" style="grid-column:1/-1;"><span class="detail-label">价卡类型</span><span class="detail-value">${typeBadge}</span></div>`;
  
  showModal('价卡详情 - ' + item.ruleName, `<div class="detail-grid">${header}${detailItems}</div>`);
}

function exportData() {
  const headers = ['价卡类型', '规则名称', '仓库', '费用明细', '币种', '有效期', '状态', '备注'];
  const rows = filteredData.map(item => {
    const config = PRICE_CARD_TYPES[item.priceCardType];
    const status = getValidityStatus(item.validityPeriod || '');
    const detailInfo = config?.getDetailInfo ? config.getDetailInfo(item) : '-';
    return [
      config?.name || item.priceCardType,
      item.ruleName || '',
      item.warehouseCode || '',
      detailInfo,
      item.currency || '',
      item.validityPeriod || '',
      status.label,
      item.remark || ''
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
