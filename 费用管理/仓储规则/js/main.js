/* ========================================
   仓储规则 - 交互逻辑
   ======================================== */

// 状态映射
const STATUS_MAP = {
  published: { label: '已发布', class: 'status-published' },
  draft: { label: '草稿', class: 'status-draft' },
  cancelled: { label: '已作废', class: 'status-cancelled' }
};

let allData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let selectedIds = new Set();

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', async function() {
  await loadData();
  bindEvents();
  loadConfigFromStorage();
});

// ============ 数据加载 ============
async function loadData() {
  try {
    const resp = await fetch('data/storage-rule-data.json');
    if (resp.ok) {
      allData = await resp.json();
    } else {
      throw new Error('加载失败');
    }
  } catch (e) {
    console.warn('JSON 加载失败，使用默认数据', e);
    allData = getDefaultData();
  }
  filteredData = [...allData];
  currentPage = 1;
  selectedIds.clear();
  renderTable();
  renderPagination();
}

function getDefaultData() {
  return [
    {
      id: 1, ruleName: '某类', storageLevel: '自定义', warehouseCode: 'TA001', warehouseName: 'TA001',
      settlementCycle: '日结', currency: 'USD', chargeType: '批次库龄', customerCode: 'DEMO - demo',
      customerName: '某电子商务有限公司', validityPeriod: '2025-01-01 00:00:00-2026-01-01 00:00:00',
      publishStatus: 'cancelled', updater: 'zsw', creator: 'zsw', remark: '-',
      updateTime: '2025-07-22 10:44:19', createTime: '2025-07-22 10:44:19'
    },
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
      publishStatus: 'draft', updater: 'zsw', creator: 'zsw', remark: '-',
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
      publishStatus: 'cancelled', updater: 'zsw', creator: 'admin', remark: '-',
      updateTime: '2025-07-22 10:44:19', createTime: '2025-07-10 09:00:00'
    }
  ];
}

// ============ 事件绑定 ============
function bindEvents() {
  document.getElementById('btnSearch').addEventListener('click', filterData);
  document.getElementById('btnReset').addEventListener('click', resetFilters);
  document.getElementById('btnBatchSetExpiry').addEventListener('click', batchSetExpiry);
  document.getElementById('btnBatchPublish').addEventListener('click', batchPublish);
  document.getElementById('btnBatchCancel').addEventListener('click', batchCancel);
  document.getElementById('btnCreate').addEventListener('click', createRule);
  document.getElementById('btnExport').addEventListener('click', exportData);
  document.getElementById('selectAll').addEventListener('change', toggleSelectAll);
  document.getElementById('pageSize').addEventListener('change', function() {
    pageSize = parseInt(this.value);
    currentPage = 1;
    renderTable();
    renderPagination();
  });
}

// ============ 筛选 ============
function filterData() {
  const warehouseCode = document.getElementById('filterWarehouseCode').value.trim().toLowerCase();
  const customerCode = document.getElementById('filterCustomerCode').value;
  const storageLevel = document.getElementById('filterStorageLevel').value;
  const ruleName = document.getElementById('filterRuleName').value.trim().toLowerCase();
  const publishStatus = document.getElementById('filterPublishStatus').value;
  const settlementCycle = document.getElementById('filterSettlementCycle').value;

  filteredData = allData.filter(item => {
    if (warehouseCode && !item.warehouseCode.toLowerCase().includes(warehouseCode)) return false;
    if (customerCode && item.customerCode !== customerCode) return false;
    if (storageLevel && item.storageLevel !== storageLevel) return false;
    if (ruleName && !item.ruleName.toLowerCase().includes(ruleName)) return false;
    if (publishStatus && item.publishStatus !== publishStatus) return false;
    if (settlementCycle && item.settlementCycle !== settlementCycle) return false;
    return true;
  });

  currentPage = 1;
  selectedIds.clear();
  renderTable();
  renderPagination();
}

function resetFilters() {
  document.getElementById('filterWarehouseCode').value = '';
  document.getElementById('filterCustomerCode').value = '';
  document.getElementById('filterStorageLevel').value = '';
  document.getElementById('filterRuleName').value = '';
  document.getElementById('filterPublishStatus').value = '';
  document.getElementById('filterSettlementCycle').value = '';
  filteredData = [...allData];
  currentPage = 1;
  selectedIds.clear();
  renderTable();
  renderPagination();
}

// ============ 渲染表格 ============
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;padding:40px;color:#999;">暂无数据</td></tr>';
    return;
  }

  tbody.innerHTML = pageData.map(item => {
    const status = STATUS_MAP[item.publishStatus] || { label: item.publishStatus, class: '' };
    const checked = selectedIds.has(item.id) ? 'checked' : '';
    return `
      <tr>
        <td><input type="checkbox" class="row-checkbox" value="${item.id}" ${checked} onchange="toggleRowSelect(${item.id})"></td>
        <td>${item.ruleName}</td>
        <td>${item.storageLevel}</td>
        <td><a class="table-link" href="javascript:void(0)">${item.warehouseCode}</a></td>
        <td>${item.settlementCycle}</td>
        <td>${item.currency}</td>
        <td>${item.chargeType}</td>
        <td><a class="table-link" href="javascript:void(0)">${item.customerName || item.customerCode}</a></td>
        <td>${item.validityPeriod}</td>
        <td><span class="status-badge ${status.class}">${status.label}</span></td>
        <td>
          <div class="person-info">
            <span><span class="label">更新人:</span> ${item.updater}</span>
            <span><span class="label">创建人:</span> ${item.creator}</span>
          </div>
        </td>
        <td>${item.remark}</td>
        <td>
          <div class="time-info">
            <span><span class="label">修改时间:</span> ${item.updateTime}</span>
            <span><span class="label">创建时间:</span> ${item.createTime}</span>
          </div>
        </td>
        <td>
          <div class="action-btns">
            <i class="fa fa-search action-btn" title="查看" onclick="viewRow(${item.id})"></i>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updateSelectAllState();
}

// ============ 渲染分页 ============
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

function goToPageInput() {
  const input = document.getElementById('pageInput');
  const page = parseInt(input.value);
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  if (page && page >= 1 && page <= totalPages) {
    goToPage(page);
  }
  input.value = '';
}

// ============ 行选择 ============
function toggleRowSelect(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
  updateSelectAllState();
}

function toggleSelectAll() {
  const checkbox = document.getElementById('selectAll');
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);
  if (checkbox.checked) {
    pageData.forEach(item => selectedIds.add(item.id));
  } else {
    pageData.forEach(item => selectedIds.delete(item.id));
  }
  renderTable();
}

function updateSelectAllState() {
  const checkbox = document.getElementById('selectAll');
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);
  if (pageData.length === 0) {
    checkbox.checked = false;
    checkbox.indeterminate = false;
    return;
  }
  const allSelected = pageData.every(item => selectedIds.has(item.id));
  const someSelected = pageData.some(item => selectedIds.has(item.id));
  checkbox.checked = allSelected;
  checkbox.indeterminate = someSelected && !allSelected;
}

// ============ 操作交互 ============

// 查看规则详情
function viewRow(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  const status = STATUS_MAP[item.publishStatus] || { label: item.publishStatus };
  showModal('查看规则 - ' + item.ruleName, `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">规则名称</span><span class="detail-value">${item.ruleName}</span></div>
      <div class="detail-item"><span class="detail-label">仓储等级</span><span class="detail-value">${item.storageLevel}</span></div>
      <div class="detail-item"><span class="detail-label">仓库代码</span><span class="detail-value">${item.warehouseCode}</span></div>
      <div class="detail-item"><span class="detail-label">结算周期</span><span class="detail-value">${item.settlementCycle}</span></div>
      <div class="detail-item"><span class="detail-label">币种</span><span class="detail-value">${item.currency}</span></div>
      <div class="detail-item"><span class="detail-label">计费类型</span><span class="detail-value">${item.chargeType}</span></div>
      <div class="detail-item"><span class="detail-label">客户代码</span><span class="detail-value">${item.customerCode}</span></div>
      <div class="detail-item"><span class="detail-label">客户名称</span><span class="detail-value">${item.customerName || '-'}</span></div>
      <div class="detail-item"><span class="detail-label">有效期</span><span class="detail-value">${item.validityPeriod}</span></div>
      <div class="detail-item"><span class="detail-label">发布状态</span><span class="detail-value">${status.label}</span></div>
      <div class="detail-item"><span class="detail-label">创建人</span><span class="detail-value">${item.creator}</span></div>
      <div class="detail-item"><span class="detail-label">更新人</span><span class="detail-value">${item.updater}</span></div>
      <div class="detail-item"><span class="detail-label">创建时间</span><span class="detail-value">${item.createTime}</span></div>
      <div class="detail-item"><span class="detail-label">修改时间</span><span class="detail-value">${item.updateTime}</span></div>
      <div class="detail-item" style="grid-column:1/-1;"><span class="detail-label">备注</span><span class="detail-value">${item.remark || '-'}</span></div>
    </div>
  `);
}

// 批量设置有效期
function batchSetExpiry() {
  if (selectedIds.size === 0) {
    showToast('请先选择需要设置有效期的规则', 'warning');
    return;
  }
  showModal('批量设置有效期', `
    <p style="margin-bottom:12px;color:#5A6275;">已选择 <b>${selectedIds.size}</b> 条规则</p>
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">开始时间</span><span class="detail-value"><input type="datetime-local" id="batchExpiryStart" class="modal-input"></span></div>
      <div class="detail-item"><span class="detail-label">结束时间</span><span class="detail-value"><input type="datetime-local" id="batchExpiryEnd" class="modal-input"></span></div>
    </div>
  `, function() {
    const start = document.getElementById('batchExpiryStart').value;
    const end = document.getElementById('batchExpiryEnd').value;
    if (!start || !end) {
      showToast('请填写完整的有效期时间', 'warning');
      return false;
    }
    allData.forEach(item => {
      if (selectedIds.has(item.id)) {
        item.validityPeriod = start.replace('T', ' ') + ':00-' + end.replace('T', ' ') + ':00';
        item.updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
      }
    });
    filteredData = filteredData.map(item => allData.find(d => d.id === item.id) || item);
    selectedIds.clear();
    renderTable();
    showToast('有效期设置成功');
    return true;
  });
}

// 批量发布
function batchPublish() {
  if (selectedIds.size === 0) {
    showToast('请先选择需要发布的规则', 'warning');
    return;
  }
  showConfirm('确认发布', `确定要将选中的 <b>${selectedIds.size}</b> 条规则发布吗？`, function() {
    allData.forEach(item => {
      if (selectedIds.has(item.id)) {
        item.publishStatus = 'published';
        item.updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
      }
    });
    filteredData = filteredData.map(item => allData.find(d => d.id === item.id) || item);
    selectedIds.clear();
    renderTable();
    showToast('发布成功');
  });
}

// 批量失效
function batchCancel() {
  if (selectedIds.size === 0) {
    showToast('请先选择需要失效的规则', 'warning');
    return;
  }
  showConfirm('确认失效', `确定要将选中的 <b>${selectedIds.size}</b> 条规则设为失效吗？此操作不可恢复。`, function() {
    allData.forEach(item => {
      if (selectedIds.has(item.id)) {
        item.publishStatus = 'cancelled';
        item.updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
      }
    });
    filteredData = filteredData.map(item => allData.find(d => d.id === item.id) || item);
    selectedIds.clear();
    renderTable();
    showToast('已设为失效');
  });
}

// 创建规则
function createRule() {
  showModal('创建仓储规则', `
    <div class="detail-grid">
      <div class="detail-item"><span class="detail-label">规则名称 <em>*</em></span><span class="detail-value"><input type="text" id="createRuleName" class="modal-input" placeholder="请输入规则名称"></span></div>
      <div class="detail-item"><span class="detail-label">仓储等级 <em>*</em></span><span class="detail-value">
        <select id="createStorageLevel" class="modal-input"><option value="">请选择</option><option value="自定义">自定义</option><option value="标准">标准</option><option value="VIP">VIP</option></select>
      </span></div>
      <div class="detail-item"><span class="detail-label">仓库代码 <em>*</em></span><span class="detail-value"><input type="text" id="createWarehouseCode" class="modal-input" placeholder="请输入仓库代码"></span></div>
      <div class="detail-item"><span class="detail-label">结算周期 <em>*</em></span><span class="detail-value">
        <select id="createSettlementCycle" class="modal-input"><option value="">请选择</option><option value="日结">日结</option><option value="周结">周结</option><option value="月结">月结</option></select>
      </span></div>
      <div class="detail-item"><span class="detail-label">币种</span><span class="detail-value">
        <select id="createCurrency" class="modal-input"><option value="CNY">CNY</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
      </span></div>
      <div class="detail-item"><span class="detail-label">计费类型</span><span class="detail-value">
        <select id="createChargeType" class="modal-input"><option value="">请选择</option><option value="批次库龄">批次库龄</option><option value="按件计费">按件计费</option><option value="按重量">按重量</option><option value="按体积">按体积</option></select>
      </span></div>
      <div class="detail-item"><span class="detail-label">客户代码</span><span class="detail-value"><input type="text" id="createCustomerCode" class="modal-input" placeholder="请输入客户代码"></span></div>
      <div class="detail-item"><span class="detail-label">有效期起</span><span class="detail-value"><input type="datetime-local" id="createValidityStart" class="modal-input"></span></div>
      <div class="detail-item"><span class="detail-label">有效期止</span><span class="detail-value"><input type="datetime-local" id="createValidityEnd" class="modal-input"></span></div>
      <div class="detail-item" style="grid-column:1/-1;"><span class="detail-label">备注</span><span class="detail-value"><input type="text" id="createRemark" class="modal-input" placeholder="请输入备注"></span></div>
    </div>
  `, function() {
    const ruleName = document.getElementById('createRuleName').value.trim();
    const storageLevel = document.getElementById('createStorageLevel').value;
    const warehouseCode = document.getElementById('createWarehouseCode').value.trim();
    const settlementCycle = document.getElementById('createSettlementCycle').value;
    if (!ruleName || !storageLevel || !warehouseCode || !settlementCycle) {
      showToast('请填写必填项（规则名称、仓储等级、仓库代码、结算周期）', 'warning');
      return false;
    }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newItem = {
      id: allData.length > 0 ? Math.max(...allData.map(d => d.id)) + 1 : 1,
      ruleName,
      storageLevel,
      warehouseCode,
      warehouseName: warehouseCode,
      settlementCycle,
      currency: document.getElementById('createCurrency').value,
      chargeType: document.getElementById('createChargeType').value || '-',
      customerCode: document.getElementById('createCustomerCode').value.trim() || '-',
      customerName: document.getElementById('createCustomerCode').value.trim() || '-',
      validityPeriod: (document.getElementById('createValidityStart').value || '---') + ' - ' + (document.getElementById('createValidityEnd').value || '---'),
      publishStatus: 'draft',
      updater: '管理员',
      creator: '管理员',
      remark: document.getElementById('createRemark').value.trim() || '-',
      updateTime: now,
      createTime: now
    };
    allData.unshift(newItem);
    filteredData = [...allData];
    currentPage = 1;
    selectedIds.clear();
    renderTable();
    renderPagination();
    showToast('创建成功');
    return true;
  });
}

// 导出数据
function exportData() {
  const headers = ['规则名称', '仓储等级', '仓库', '结算周期', '币种', '计费类型', '客户代码', '有效期', '发布状态', '更新人', '创建人', '备注', '修改时间', '创建时间'];
  const rows = filteredData.map(item => [
    item.ruleName, item.storageLevel, item.warehouseCode, item.settlementCycle,
    item.currency, item.chargeType, item.customerCode, item.validityPeriod,
    STATUS_MAP[item.publishStatus]?.label || item.publishStatus,
    item.updater, item.creator, item.remark, item.updateTime, item.createTime
  ]);
  let csv = '\uFEFF' + headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => '"' + (cell || '').toString().replace(/"/g, '""') + '"').join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '仓储规则_' + new Date().toISOString().slice(0,10) + '.csv';
  link.click();
  showToast('导出成功');
}

// ============ Tab 切换 ============
function switchMainTab(tab) {
  document.querySelectorAll('.main-content').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  document.getElementById('main-' + tab).classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

// ============ 弹窗系统 ============
function showModal(title, bodyHtml, onConfirm) {
  removeModal();
  const overlay = document.createElement('div');
  overlay.id = 'modalOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;';

  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:white;border-radius:12px;width:620px;max-width:90vw;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,0.15);';

  const header = document.createElement('div');
  header.style.cssText = 'padding:20px 24px;border-bottom:1px solid #E8E5DF;display:flex;justify-content:space-between;align-items:center;';
  header.innerHTML = `<h3 style="margin:0;font-size:16px;font-weight:600;">${title}</h3><span style="cursor:pointer;font-size:20px;color:#999;" onclick="removeModal()">&times;</span>`;

  const body = document.createElement('div');
  body.style.cssText = 'padding:24px;overflow-y:auto;flex:1;';
  body.innerHTML = bodyHtml;

  const footer = document.createElement('div');
  footer.style.cssText = 'padding:16px 24px;border-top:1px solid #E8E5DF;display:flex;justify-content:flex-end;gap:10px;';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'erp-btn erp-btn-secondary';
  cancelBtn.textContent = '取消';
  cancelBtn.onclick = removeModal;

  footer.appendChild(cancelBtn);

  if (onConfirm) {
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'erp-btn erp-btn-primary';
    confirmBtn.textContent = '确定';
    confirmBtn.onclick = function() {
      const result = onConfirm();
      if (result !== false) removeModal();
    };
    footer.appendChild(confirmBtn);
  }

  dialog.appendChild(header);
  dialog.appendChild(body);
  dialog.appendChild(footer);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) removeModal();
  });
}

function showConfirm(title, message, onOk) {
  removeModal();
  const overlay = document.createElement('div');
  overlay.id = 'modalOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;';

  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:white;border-radius:12px;width:420px;max-width:90vw;box-shadow:0 12px 40px rgba(0,0,0,0.15);';

  dialog.innerHTML = `
    <div style="padding:24px;border-bottom:1px solid #E8E5DF;">
      <h3 style="margin:0;font-size:16px;font-weight:600;">${title}</h3>
    </div>
    <div style="padding:24px;font-size:14px;color:#5A6275;line-height:1.6;">${message}</div>
    <div style="padding:16px 24px;border-top:1px solid #E8E5DF;display:flex;justify-content:flex-end;gap:10px;">
      <button class="erp-btn erp-btn-secondary" onclick="removeModal()">取消</button>
      <button class="erp-btn erp-btn-danger" id="confirmOkBtn">确定</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  document.getElementById('confirmOkBtn').onclick = function() {
    removeModal();
    if (onOk) onOk();
  };

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) removeModal();
  });
}

function removeModal() {
  const el = document.getElementById('modalOverlay');
  if (el) el.remove();
}

// Toast 提示
function showToast(msg, type) {
  const existing = document.getElementById('toastMsg');
  if (existing) existing.remove();

  const colors = {
    success: { bg: '#f6ffed', border: '#b7eb8f', color: '#389e0d' },
    warning: { bg: '#fffbe6', border: '#ffe58f', color: '#d48806' },
    error: { bg: '#fff2f0', border: '#ffccc7', color: '#cf1322' }
  };
  const c = colors[type] || colors.success;

  const toast = document.createElement('div');
  toast.id = 'toastMsg';
  toast.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);padding:10px 24px;border-radius:8px;font-size:14px;z-index:2000;border:1px solid ${c.border};background:${c.bg};color:${c.color};box-shadow:0 4px 12px rgba(0,0,0,0.1);transition:opacity 0.3s;`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  setTimeout(() => { toast.remove(); }, 2500);
}

// ============ 配置加载 ============
var STORAGE_KEY = 'pageConfig_仓储规则';
var pageConfig = null;

function loadConfigFromStorage() {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      pageConfig = JSON.parse(saved);
      if (pageConfig.pageTitle) {
        document.title = pageConfig.pageTitle + ' - ELSA';
      }
    } catch (e) {
      console.error('加载配置失败', e);
      pageConfig = null;
    }
  }
}
