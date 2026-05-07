/* ========================================
   价卡查询 - 客户端交互逻辑（优化版）
   ======================================== */

let allData = [];
let filteredData = [];
let currentPage = 1;
let pageSize = 10;
let currentCustomer = 'DEMO - demo';

const PRICE_CARD_TYPE_MAP = {
  'storage': '仓储费',
  'shipping': '运费',
  'operation': '操作费',
  'other': '其他费用'
};

const VERSION_STATUS_MAP = {
  'active': { label: '生效中', class: 'status-active' },
  'expired': { label: '已过期', class: 'status-expired' },
  'future': { label: '待生效', class: 'status-future' }
};

document.addEventListener('DOMContentLoaded', async function() {
  await loadData();
  bindEvents();
});

async function loadData() {
  try {
    const resp = await fetch('data/price-card-data.json');
    if (resp.ok) {
      allData = await resp.json();
    } else {
      throw new Error('加载失败');
    }
  } catch (e) {
    console.warn('数据加载失败，使用默认数据', e);
    allData = getDefaultData();
  }
  
  filterByCustomer();
  renderView();
  renderPagination();
  updateStats();
}

function getDefaultData() {
  return [
    {
      priceCardId: "PC001",
      versionId: "PC001-V1",
      versionNumber: 1,
      ruleName: "标准仓储",
      priceCardType: "storage",
      warehouseCode: "WH002",
      warehouseName: "WH002",
      settlementCycle: "月结",
      currency: "CNY",
      chargeType: "按件计费",
      customerCode: "DEMO - demo",
      customerName: "某电子商务有限公司",
      validFrom: "2025-01-01 00:00:00",
      validTo: "2025-03-31 23:59:59",
      versionStatus: "expired",
      publishType: "manual",
      priceDetails: [
        { itemName: "基础仓储费", unit: "件/天", price: 0.5 },
        { itemName: "超期仓储费", unit: "件/天", price: 0.8 }
      ],
      remark: "Q1标准费率",
      creator: "admin",
      createTime: "2025-01-01 09:00:00",
      updater: "admin",
      updateTime: "2025-01-01 09:00:00"
    }
  ];
}

function bindEvents() {
  document.getElementById('customerSelector').addEventListener('change', function() {
    currentCustomer = this.value;
    filterByCustomer();
    currentPage = 1;
    renderView();
    renderPagination();
    updateStats();
  });
  
  document.getElementById('btnSearch').addEventListener('click', filterData);
  document.getElementById('btnReset').addEventListener('click', resetFilters);
  document.getElementById('btnExport').addEventListener('click', showExportModal);
  document.getElementById('pageSize').addEventListener('change', function() {
    pageSize = parseInt(this.value);
    currentPage = 1;
    renderView();
    renderPagination();
  });
  
  document.getElementById('viewMode').addEventListener('change', function() {
    currentViewMode = this.value;
    renderView();
  });
  
  document.querySelectorAll('.quick-time-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.quick-time-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applyQuickTimeFilter(this.dataset.value);
    });
  });
}

function applyQuickTimeFilter(value) {
  if (value === 'all') {
    document.getElementById('filterValidFrom').value = '';
    document.getElementById('filterValidTo').value = '';
    filterData();
    return;
  }
  
  const now = new Date();
  let startDate, endDate;
  
  if (value === 'current_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (value === 'current_quarter') {
    const quarter = Math.floor(now.getMonth() / 3);
    startDate = new Date(now.getFullYear(), quarter * 3, 1);
    endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
  } else if (value === 'last_3_months') {
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  } else if (value === 'last_6_months') {
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  } else if (value === 'current_year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  }
  
  document.getElementById('filterValidFrom').value = formatDate(startDate);
  document.getElementById('filterValidTo').value = formatDate(endDate);
  filterData();
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function filterByCustomer() {
  filteredData = allData.filter(item => item.customerCode === currentCustomer);
}

function filterData() {
  const priceCardType = document.getElementById('filterPriceCardType').value;
  const ruleName = document.getElementById('filterRuleName').value.trim().toLowerCase();
  const warehouseCode = document.getElementById('filterWarehouseCode').value.trim().toLowerCase();
  const versionStatus = document.getElementById('filterVersionStatus').value;
  const validFrom = document.getElementById('filterValidFrom').value;
  const validTo = document.getElementById('filterValidTo').value;

  filteredData = allData.filter(item => {
    if (item.customerCode !== currentCustomer) return false;
    
    if (priceCardType && item.priceCardType !== priceCardType) return false;
    if (ruleName && !item.ruleName.toLowerCase().includes(ruleName)) return false;
    if (warehouseCode && !item.warehouseCode.toLowerCase().includes(warehouseCode)) return false;
    if (versionStatus && item.versionStatus !== versionStatus) return false;
    
    if (validFrom) {
      const itemValidFrom = new Date(item.validFrom);
      const filterValidFromDate = new Date(validFrom);
      if (itemValidTo < filterValidFromDate) return false;
    }
    
    if (validTo) {
      const itemValidTo = new Date(item.validTo);
      const filterValidToDate = new Date(validTo);
      if (itemValidFrom > filterValidToDate) return false;
    }
    
    return true;
  });

  currentPage = 1;
  renderView();
  renderPagination();
  updateStats();
}

function resetFilters() {
  document.getElementById('filterPriceCardType').value = '';
  document.getElementById('filterRuleName').value = '';
  document.getElementById('filterWarehouseCode').value = '';
  document.getElementById('filterVersionStatus').value = '';
  document.getElementById('filterValidFrom').value = '';
  document.getElementById('filterValidTo').value = '';
  
  document.querySelectorAll('.quick-time-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.value === 'all') {
      btn.classList.add('active');
    }
  });
  
  filterByCustomer();
  currentPage = 1;
  renderView();
  renderPagination();
  updateStats();
}

function renderView() {
  const container = document.getElementById('priceCardContainer');
  
  const displayData = getLatestVersionPerCard(filteredData);
  const start = (currentPage - 1) * pageSize;
  const pageData = displayData.slice(start, start + pageSize);

  if (pageData.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fa fa-inbox"></i><p>暂无价卡数据</p></div>';
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>价卡类型</th>
          <th>仓库</th>
          <th>币种</th>
          <th>价卡名称/价格预览</th>
          <th style="width:180px;">操作</th>
        </tr>
      </thead>
      <tbody>
        ${pageData.map(item => {
          const typeLabel = PRICE_CARD_TYPE_MAP[item.priceCardType] || item.priceCardType;
          const versionCount = getVersionCount(item.priceCardId);
          
          return `
            <tr>
              <td>${typeLabel}</td>
              <td>${item.warehouseCode}</td>
              <td>${item.currency}</td>
              <td>
                <div class="price-card-name-preview" onclick="viewDetail('${item.versionId}')" style="cursor:pointer;">
                  <div class="price-card-name-row">
                    <strong>${item.ruleName}</strong>
                    ${versionCount > 1 ? `<span class="version-count-badge">${versionCount}个版本</span>` : ''}
                  </div>
                  <div class="price-card-price-row" style="font-size:12px;color:#666;margin-top:4px;">
                    ${item.priceDetails && item.priceDetails.length > 0 
                      ? `${item.priceDetails.slice(0, 2).map(d => `${d.itemName}: ${d.price}`).join('；')}` 
                      : '暂无价格信息'}
                    ${item.priceDetails && item.priceDetails.length > 2 ? '...' : ''}
                  </div>
                </div>
              </td>
              <td>
                <div class="action-btns">
                  <button class="action-btn-text" onclick="showVersionHistory('${item.priceCardId}')" title="查看版本">
                    <i class="fa fa-history"></i> 版本
                  </button>
                  <button class="action-btn-text" onclick="recalculateFee('${item.priceCardId}')" title="费用重计">
                    <i class="fa fa-calculator"></i> 重计
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function getLatestVersionPerCard(data) {
  const grouped = groupByPriceCard(data);
  const result = [];
  
  Object.keys(grouped).forEach(priceCardId => {
    const versions = grouped[priceCardId];
    const activeVersions = versions.filter(v => v.versionStatus === 'active');
    
    if (activeVersions.length > 0) {
      result.push(activeVersions.sort((a, b) => b.versionNumber - a.versionNumber)[0]);
    } else {
      result.push(versions.sort((a, b) => b.versionNumber - a.versionNumber)[0]);
    }
  });
  
  return result;
}

function getVersionCount(priceCardId) {
  const grouped = groupByPriceCard(filteredData);
  return grouped[priceCardId] ? grouped[priceCardId].length : 1;
}

function showVersionHistory(priceCardId) {
  const grouped = groupByPriceCard(allData);
  const versions = grouped[priceCardId];
  
  if (!versions || versions.length === 0) {
    showToast('未找到价卡版本信息', 'error');
    return;
  }
  
  const sortedVersions = versions.sort((a, b) => b.versionNumber - a.versionNumber);
  const priceCardName = sortedVersions[0].ruleName;
  
  const versionListHtml = sortedVersions.map(version => {
    const statusInfo = VERSION_STATUS_MAP[version.versionStatus] || { label: '未知', class: '' };
    
    return `
      <tr>
        <td><span class="version-badge-small">V${version.versionNumber}</span></td>
        <td>${formatDateSimple(version.validFrom)} ~ ${formatDateSimple(version.validTo)}</td>
        <td><span class="status-badge ${statusInfo.class}">${statusInfo.label}</span></td>
        <td>${version.publishType === 'manual' ? '手动发布' : '自动衔接'}</td>
        <td>
          ${version.priceDetails && version.priceDetails.length > 0 
            ? version.priceDetails.slice(0, 2).map(d => `${d.itemName}: ${d.price}`).join('; ') 
            : '-'}
        </td>
        <td>
          <div class="action-btns">
            <i class="fa fa-eye action-btn" title="查看详情" onclick="closeModal(document.querySelector('.modal')); setTimeout(() => viewDetail('${version.versionId}'), 100);"></i>
            ${version.versionStatus === 'expired' ? `
              <i class="fa fa-calculator action-btn" title="提取价格" onclick="closeModal(document.querySelector('.modal')); setTimeout(() => extractPrice('${version.versionId}'), 100);"></i>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  showModal('版本历史 - ' + priceCardName, `
    <div class="version-history-content">
      <div class="version-history-summary">
        <span>共 ${versions.length} 个版本</span>
        <button class="erp-btn erp-btn-secondary" style="font-size:12px;padding:4px 12px;" onclick="compareVersions('${priceCardId}')">
          <i class="fa fa-balance-scale"></i> 版本对比
        </button>
      </div>
      <table class="data-table" style="margin-top:12px;">
        <thead>
          <tr>
            <th>版本号</th>
            <th>有效期</th>
            <th>状态</th>
            <th>发布类型</th>
            <th>价格预览</th>
            <th style="width:80px;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${versionListHtml}
        </tbody>
      </table>
    </div>
  `, '800px');
}

function groupByPriceCard(data) {
  return data.reduce((groups, item) => {
    const key = item.priceCardId;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

function formatDateSimple(dateStr) {
  return dateStr.split(' ')[0];
}

function showPricePreview(event, versionId) {
  const item = allData.find(d => d.versionId === versionId);
  if (!item || !item.priceDetails || item.priceDetails.length === 0) return;
  
  hidePricePreview();
  
  const popup = document.createElement('div');
  popup.className = 'price-preview-popup';
  popup.id = 'pricePreviewPopup';
  popup.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px;font-size:13px;">价格明细</div>
    ${item.priceDetails.map(detail => `
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;">
        <span style="color:#666;">${detail.itemName}</span>
        <span style="font-weight:600;color:#E8A838;">${detail.price} ${item.currency}/${detail.unit}</span>
      </div>
    `).join('')}
  `;
  
  document.body.appendChild(popup);
  
  const rect = event.target.getBoundingClientRect();
  popup.style.left = rect.left + 'px';
  popup.style.top = (rect.bottom + 8) + 'px';
}

function hidePricePreview() {
  const popup = document.getElementById('pricePreviewPopup');
  if (popup) popup.remove();
}

function renderPagination() {
  const displayData = getLatestVersionPerCard(filteredData);
  const total = displayData.length;
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
  const displayData = getLatestVersionPerCard(filteredData);
  const total = displayData.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderView();
  renderPagination();
}

function updateStats() {
  const customerData = allData.filter(item => item.customerCode === currentCustomer);
  
  const groupedData = groupByPriceCard(customerData);
  const cardCount = Object.keys(groupedData).length;
  const versionCount = customerData.length;
  
  const activeVersions = customerData.filter(item => item.versionStatus === 'active');
  const activeCardNames = [...new Set(activeVersions.map(item => item.ruleName))];
  
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringVersions = customerData.filter(item => {
    if (item.versionStatus !== 'active') return false;
    const validTo = new Date(item.validTo);
    return validTo <= thirtyDaysLater && validTo > now;
  });
  
  document.getElementById('cardCountStat').textContent = cardCount;
  document.getElementById('versionCountStat').textContent = versionCount;
  document.getElementById('activeCountStat').textContent = activeCardNames.length;
  document.getElementById('activeNamesStat').textContent = activeCardNames.length > 0 ? activeCardNames.join('、') : '-';
  document.getElementById('expiringCountStat').textContent = expiringVersions.length;
}

function showModal(title, content, width = '600px') {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="width: ${width};">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer">
        <button class="erp-btn erp-btn-secondary" onclick="closeModal(this)">关闭</button>
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

function viewDetail(versionId) {
  const item = allData.find(d => d.versionId === versionId);
  if (!item) return;
  
  const statusInfo = VERSION_STATUS_MAP[item.versionStatus] || { label: '未知', class: '' };
  const typeLabel = PRICE_CARD_TYPE_MAP[item.priceCardType] || item.priceCardType;
  
  const priceDetailsHtml = item.priceDetails && item.priceDetails.length > 0 
    ? item.priceDetails.map(detail => `
        <tr>
          <td>${detail.itemName}</td>
          <td>${detail.unit}</td>
          <td style="text-align:right;font-weight:600;color:#E8A838;">${detail.price}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="text-align:center;color:#999;">暂无价格明细</td></tr>';
  
  showModal('价卡详情 - ' + item.ruleName + ' V' + item.versionNumber, `
    <div class="detail-section">
      <div class="detail-section-title">基本信息</div>
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">价卡ID</span><span class="detail-value">${item.priceCardId}</span></div>
        <div class="detail-item"><span class="detail-label">版本号</span><span class="detail-value">V${item.versionNumber}</span></div>
        <div class="detail-item"><span class="detail-label">价卡名称</span><span class="detail-value">${item.ruleName}</span></div>
        <div class="detail-item"><span class="detail-label">价卡类型</span><span class="detail-value">${typeLabel}</span></div>
        <div class="detail-item"><span class="detail-label">仓库代码</span><span class="detail-value">${item.warehouseCode}</span></div>
        <div class="detail-item"><span class="detail-label">结算周期</span><span class="detail-value">${item.settlementCycle}</span></div>
        <div class="detail-item"><span class="detail-label">币种</span><span class="detail-value">${item.currency}</span></div>
        <div class="detail-item"><span class="detail-label">计费类型</span><span class="detail-value">${item.chargeType}</span></div>
        <div class="detail-item"><span class="detail-label">版本状态</span><span class="detail-value"><span class="status-badge ${statusInfo.class}">${statusInfo.label}</span></span></div>
        <div class="detail-item"><span class="detail-label">发布类型</span><span class="detail-value">${item.publishType === 'manual' ? '手动发布' : '自动衔接'}</span></div>
        <div class="detail-item" style="grid-column:1/-1;"><span class="detail-label">有效期</span><span class="detail-value">${item.validFrom} ~ ${item.validTo}</span></div>
        <div class="detail-item" style="grid-column:1/-1;"><span class="detail-label">备注</span><span class="detail-value">${item.remark || '-'}</span></div>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">价格明细</div>
      <table class="detail-table">
        <thead>
          <tr>
            <th>费用项</th>
            <th>单位</th>
            <th style="text-align:right;">价格</th>
          </tr>
        </thead>
        <tbody>
          ${priceDetailsHtml}
        </tbody>
      </table>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">操作记录</div>
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">创建人</span><span class="detail-value">${item.creator}</span></div>
        <div class="detail-item"><span class="detail-label">创建时间</span><span class="detail-value">${item.createTime}</span></div>
        <div class="detail-item"><span class="detail-label">更新人</span><span class="detail-value">${item.updater}</span></div>
        <div class="detail-item"><span class="detail-label">更新时间</span><span class="detail-value">${item.updateTime}</span></div>
      </div>
    </div>
  `, '700px');
}

function compareVersions(priceCardId) {
  const groupedData = groupByPriceCard(allData);
  const versions = groupedData[priceCardId];
  
  if (!versions || versions.length < 2) {
    showToast('该价卡只有一个版本，无法对比', 'warning');
    return;
  }
  
  const sortedVersions = versions.sort((a, b) => b.versionNumber - a.versionNumber);
  
  const comparisonHtml = sortedVersions.map((version, index) => {
    const statusInfo = VERSION_STATUS_MAP[version.versionStatus] || { label: '未知', class: '' };
    
    return `
      <div class="comparison-column">
        <div class="comparison-header">
          <div class="version-badge-small">V${version.versionNumber}</div>
          <span class="status-badge ${statusInfo.class}" style="font-size:11px;">${statusInfo.label}</span>
        </div>
        <div class="comparison-period">${formatDateSimple(version.validFrom)} ~ ${formatDateSimple(version.validTo)}</div>
        <div class="comparison-prices">
          ${version.priceDetails && version.priceDetails.length > 0 
            ? version.priceDetails.map(detail => `
                <div class="comparison-price-item">
                  <div class="comparison-price-name">${detail.itemName}</div>
                  <div class="comparison-price-value">${detail.price} ${version.currency}/${detail.unit}</div>
                </div>
              `).join('')
            : '<div style="text-align:center;color:#999;padding:20px;">暂无价格</div>'
          }
        </div>
      </div>
    `;
  }).join('');
  
  showModal('版本对比 - ' + sortedVersions[0].ruleName, `
    <div class="comparison-container">
      ${comparisonHtml}
    </div>
  `, '900px');
}

function extractPrice(versionId) {
  const item = allData.find(d => d.versionId === versionId);
  if (!item) return;
  
  showModal('提取价格 - ' + item.ruleName + ' V' + item.versionNumber, `
    <div class="operation-form">
      <div class="form-group">
        <label class="form-label">价卡版本</label>
        <input type="text" class="form-input" value="${item.ruleName} V${item.versionNumber}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">有效期</label>
        <input type="text" class="form-input" value="${item.validFrom} ~ ${item.validTo}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">应用时间范围 <span class="required">*</span></label>
        <div class="form-row">
          <input type="date" class="form-input" id="extractStartDate">
          <span style="padding: 0 8px;">至</span>
          <input type="date" class="form-input" id="extractEndDate">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">备注说明</label>
        <textarea class="form-textarea" id="extractRemark" placeholder="请输入提取价格的备注说明"></textarea>
      </div>
      <div class="form-actions">
        <button class="erp-btn erp-btn-secondary" onclick="closeModal(this)">取消</button>
        <button class="erp-btn erp-btn-primary" onclick="confirmExtractPrice('${versionId}')">确认提取</button>
      </div>
    </div>
  `, '500px');
}

function confirmExtractPrice(versionId) {
  const startDate = document.getElementById('extractStartDate').value;
  const endDate = document.getElementById('extractEndDate').value;
  
  if (!startDate || !endDate) {
    showToast('请选择应用时间范围', 'error');
    return;
  }
  
  showToast('价格提取成功', 'success');
  closeModal(document.querySelector('.modal .erp-btn-secondary'));
}

function recalculateFee(priceCardId) {
  const grouped = groupByPriceCard(allData);
  const versions = grouped[priceCardId];
  
  if (!versions || versions.length === 0) {
    showToast('未找到价卡信息', 'error');
    return;
  }
  
  const sortedVersions = versions.sort((a, b) => a.versionNumber - b.versionNumber);
  const priceCardName = sortedVersions[0].ruleName;
  const currency = sortedVersions[0].currency;
  
  const versionRanges = sortedVersions.map(v => {
    const statusInfo = VERSION_STATUS_MAP[v.versionStatus] || { label: '未知' };
    return `<tr>
      <td><span class="version-badge-small">V${v.versionNumber}</span></td>
      <td>${formatDateSimple(v.validFrom)} ~ ${formatDateSimple(v.validTo)}</td>
      <td><span class="status-badge ${statusInfo.class}">${statusInfo.label}</span></td>
    </tr>`;
  }).join('');
  
  showModal('费用重计 - ' + priceCardName, `
    <div class="operation-form">
      <div class="form-group">
        <label class="form-label">价卡名称</label>
        <input type="text" class="form-input" value="${priceCardName}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">币种</label>
        <input type="text" class="form-input" value="${currency}" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">版本有效期参考</label>
        <table class="data-table" style="font-size:12px;">
          <thead>
            <tr>
              <th>版本</th>
              <th>有效期</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            ${versionRanges}
          </tbody>
        </table>
      </div>
      <div class="form-group">
        <label class="form-label">重算时间范围 <span class="required">*</span></label>
        <div class="form-row">
          <input type="date" class="form-input" id="recalcStartDate">
          <span style="padding: 0 8px;">至</span>
          <input type="date" class="form-input" id="recalcEndDate">
        </div>
        <div style="font-size:12px;color:#999;margin-top:4px;">将根据所选时间段匹配对应版本的价卡费率进行重算</div>
      </div>
      <div class="form-group">
        <label class="form-label">重算类型 <span class="required">*</span></label>
        <select class="form-input" id="recalcType">
          <option value="">请选择</option>
          <option value="storage">仓储费</option>
          <option value="shipping">运费</option>
          <option value="operation">操作费</option>
          <option value="all">全部费用</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">备注说明</label>
        <textarea class="form-textarea" id="recalcRemark" placeholder="请输入重算费用的备注说明"></textarea>
      </div>
      <div class="form-actions">
        <button class="erp-btn erp-btn-secondary" onclick="closeModal(this)">取消</button>
        <button class="erp-btn erp-btn-primary" onclick="confirmRecalculateFee('${priceCardId}')">确认重算</button>
      </div>
    </div>
  `, '550px');
}

function confirmRecalculateFee(priceCardId) {
  const startDate = document.getElementById('recalcStartDate').value;
  const endDate = document.getElementById('recalcEndDate').value;
  const recalcType = document.getElementById('recalcType').value;
  
  if (!startDate || !endDate) {
    showToast('请选择重算时间范围', 'error');
    return;
  }
  
  if (!recalcType) {
    showToast('请选择重算类型', 'error');
    return;
  }
  
  showToast('费用重算任务已提交，请稍后查看结果', 'success');
  closeModal(document.querySelector('.modal .erp-btn-secondary'));
}

function showExportModal() {
  showModal('导出价卡', `
    <div class="export-options">
      <div class="export-option-group">
        <label class="form-label">导出格式</label>
        <div class="export-format-options">
          <label class="export-radio">
            <input type="radio" name="exportFormat" value="csv" checked>
            <span>CSV格式</span>
            <small>适合数据分析和二次处理</small>
          </label>
          <label class="export-radio">
            <input type="radio" name="exportFormat" value="excel">
            <span>Excel格式</span>
            <small>适合查看和打印</small>
          </label>
          <label class="export-radio">
            <input type="radio" name="exportFormat" value="pdf">
            <span>PDF格式</span>
            <small>适合存档和分享</small>
          </label>
        </div>
      </div>
      
      <div class="export-option-group">
        <label class="form-label">导出内容</label>
        <div class="export-content-options">
          <label class="export-checkbox">
            <input type="checkbox" name="exportContent" value="basic" checked>
            <span>基本信息</span>
          </label>
          <label class="export-checkbox">
            <input type="checkbox" name="exportContent" value="prices" checked>
            <span>价格明细</span>
          </label>
          <label class="export-checkbox">
            <input type="checkbox" name="exportContent" value="history">
            <span>历史版本</span>
          </label>
        </div>
      </div>
      
      <div class="export-option-group">
        <label class="form-label">导出范围</label>
        <div class="export-scope-options">
          <label class="export-radio">
            <input type="radio" name="exportScope" value="current" checked>
            <span>当前筛选结果</span>
            <small>导出当前筛选条件下的${currentViewMode === 'group' ? Object.keys(groupByPriceCard(filteredData)).length : filteredData.length}条数据</small>
          </label>
          <label class="export-radio">
            <input type="radio" name="exportScope" value="all">
            <span>全部价卡</span>
            <small>导出当前客户的所有价卡</small>
          </label>
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <button class="erp-btn erp-btn-secondary" onclick="closeModal(this)">取消</button>
      <button class="erp-btn erp-btn-primary" onclick="confirmExport()">确认导出</button>
    </div>
  `, '500px');
}

function confirmExport() {
  const format = document.querySelector('input[name="exportFormat"]:checked').value;
  const content = Array.from(document.querySelectorAll('input[name="exportContent"]:checked')).map(cb => cb.value);
  const scope = document.querySelector('input[name="exportScope"]:checked').value;
  
  const dataToExport = scope === 'all' 
    ? allData.filter(item => item.customerCode === currentCustomer)
    : filteredData;
  
  if (format === 'csv') {
    exportAsCSV(dataToExport, content);
  } else if (format === 'excel') {
    exportAsExcel(dataToExport, content);
  } else if (format === 'pdf') {
    exportAsPDF(dataToExport, content);
  }
  
  closeModal(document.querySelector('.modal .erp-btn-secondary'));
}

function exportAsCSV(data, content) {
  let headers = ['价卡名称', '版本号', '价卡类型', '仓库', '币种', '有效期开始', '有效期结束', '版本状态'];
  
  if (content.includes('prices')) {
    headers.push('价格明细');
  }
  
  if (content.includes('history')) {
    headers.push('备注', '创建时间', '更新时间');
  }
  
  const rows = data.map(item => {
    const statusInfo = VERSION_STATUS_MAP[item.versionStatus] || { label: '未知' };
    const typeLabel = PRICE_CARD_TYPE_MAP[item.priceCardType] || item.priceCardType;
    
    const row = [
      item.ruleName, 
      'V' + item.versionNumber, 
      typeLabel, 
      item.warehouseCode, 
      item.currency, 
      item.validFrom, 
      item.validTo,
      statusInfo.label
    ];
    
    if (content.includes('prices')) {
      const priceStr = item.priceDetails && item.priceDetails.length > 0
        ? item.priceDetails.map(d => `${d.itemName}:${d.price}`).join('; ')
        : '-';
      row.push(priceStr);
    }
    
    if (content.includes('history')) {
      row.push(item.remark || '', item.createTime, item.updateTime);
    }
    
    return row;
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
  
  showToast('CSV文件导出成功', 'success');
}

function exportAsExcel(data, content) {
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
  html += '<x:Name>价卡列表</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>';
  html += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
  html += '<body><table border="1">';
  
  let headers = ['价卡名称', '版本号', '价卡类型', '仓库', '币种', '有效期开始', '有效期结束', '版本状态'];
  if (content.includes('prices')) headers.push('价格明细');
  if (content.includes('history')) headers.push('备注', '创建时间', '更新时间');
  
  html += '<tr>' + headers.map(h => `<th style="background:#4472C4;color:white;font-weight:bold;padding:8px;">${h}</th>`).join('') + '</tr>';
  
  data.forEach(item => {
    const statusInfo = VERSION_STATUS_MAP[item.versionStatus] || { label: '未知' };
    const typeLabel = PRICE_CARD_TYPE_MAP[item.priceCardType] || item.priceCardType;
    
    const row = [
      item.ruleName, 
      'V' + item.versionNumber, 
      typeLabel, 
      item.warehouseCode, 
      item.currency, 
      item.validFrom, 
      item.validTo,
      statusInfo.label
    ];
    
    if (content.includes('prices')) {
      const priceStr = item.priceDetails && item.priceDetails.length > 0
        ? item.priceDetails.map(d => `${d.itemName}: ${d.price} ${item.currency}/${d.unit}`).join('\n')
        : '-';
      row.push(priceStr);
    }
    
    if (content.includes('history')) {
      row.push(item.remark || '', item.createTime, item.updateTime);
    }
    
    html += '<tr>' + row.map(cell => `<td style="padding:6px;white-space:pre-wrap;">${cell}</td>`).join('') + '</tr>';
  });
  
  html += '</table></body></html>';
  
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `我的价卡_${currentCustomer}_${new Date().toISOString().slice(0,10)}.xls`;
  link.click();
  
  showToast('Excel文件导出成功', 'success');
}

function exportAsPDF(data, content) {
  showToast('PDF导出功能开发中，暂时请使用CSV或Excel格式', 'info');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
