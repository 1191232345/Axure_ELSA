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
  loadLogicDescription();
});

async function loadData() {
  try {
    const resp = await fetch('data/price-card-query-data.json');
    if (resp.ok) {
      const jsonData = await resp.json();
      allData = jsonData.priceCards || [];
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
      id: 1,
      code: "PC001",
      name: "默认价卡",
      type: "仓储费",
      storageFee: "VIP1",
      operationFee: "VIP2",
      expressFee: "VIP1",
      otherFee: "VIP3",
      startDate: "2026/01/01 00:00:00",
      endDate: "2026/12/31 23:59:59",
      status: "生效",
      customer: "DEMO - demo"
    }
  ];
}

function bindEvents() {
  // 筛选器事件
  const filterType = document.getElementById('filterType');
  const filterStatus = document.getElementById('filterStatus');
  
  if (filterType) {
    filterType.addEventListener('change', filterData);
  }
  if (filterStatus) {
    filterStatus.addEventListener('change', filterData);
  }
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
  filteredData = allData;
}

function filterData() {
  const filterType = document.getElementById('filterType') ? document.getElementById('filterType').value : '';
  const filterStatus = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : '';

  filteredData = allData.filter(item => {
    if (filterType && item.type !== filterType) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    
    return true;
  });

  currentPage = 1;
  renderView();
  renderPagination();
  updateStats();
}

function resetFilters() {
  if (document.getElementById('filterType')) {
    document.getElementById('filterType').value = '';
  }
  if (document.getElementById('filterStatus')) {
    document.getElementById('filterStatus').value = '';
  }
  
  filterByCustomer();
  currentPage = 1;
  renderView();
  renderPagination();
  updateStats();
}

function renderView() {
  const tbody = document.getElementById('priceCardTableBody');
  const emptyState = document.getElementById('emptyState');
  const table = document.getElementById('priceCardTable');
  
  if (!tbody) {
    console.error('找不到表格容器元素');
    return;
  }
  
  const start = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  if (pageData.length === 0) {
    table.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  table.classList.remove('hidden');
  emptyState.classList.add('hidden');

  tbody.innerHTML = pageData.map(item => `
    <tr>
      <td>
        <span class="font-medium text-gray-900">${item.code || '-'}</span>
      </td>
      <td>
        <span class="level-badge level-${item.storageFee}" onclick="showStorageFeeDetail(${item.id})" title="点击查看详情">
          ${item.storageFee || '-'}
        </span>
      </td>
      <td>
        <span class="level-badge level-${item.operationFee}" onclick="showOperationFeeDetail(${item.id})" title="点击查看详情">
          ${item.operationFee || '-'}
        </span>
      </td>
      <td>
        <span class="level-badge level-${item.expressFee}" onclick="showExpressFeeDetail(${item.id})" title="点击查看详情">
          ${item.expressFee || '-'}
        </span>
      </td>
      <td>
        <span class="level-badge level-${item.otherFee}" onclick="showOtherFeeDetail(${item.id})" title="点击查看详情">
          ${item.otherFee || '-'}
        </span>
      </td>
      <td>
        <div class="text-sm">
          <div class="text-gray-900">${item.startDate || '-'}</div>
          <div class="text-gray-500">至 ${item.endDate || '-'}</div>
        </div>
      </td>
    </tr>
  `).join('');
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
  // 暂无分页元素，保留空函数
}

function goToPage(page) {
  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderView();
  renderPagination();
}

function updateStats() {
  // 暂无统计元素，保留函数以避免错误
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
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(element) {
  const modal = element.closest('.modal');
  modal.classList.remove('active');
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
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function toggleLogic() {
  const content = document.getElementById('logicContent');
  const icon = document.getElementById('logicIcon');
  
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  } else {
    content.classList.add('hidden');
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  }
}

function loadLogicDescription() {
  const logicDiv = document.getElementById('logicDescription');
  
  logicDiv.innerHTML = `
    <div class="p-4 border-b border-gray-100">
      <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-database text-primary mr-2"></i>初始化页面（数据展示逻辑）
      </h4>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">逻辑项</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">说明</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">数据来源</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">展示规则</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">备注</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">价卡列表加载</td>
              <td class="px-3 py-2 text-gray-600">页面加载时从数据文件读取所有价卡信息</td>
              <td class="px-3 py-2 text-gray-600">price-card-data.json</td>
              <td class="px-3 py-2 text-gray-600">以表格形式展示，每行显示一个价卡</td>
              <td class="px-3 py-2 text-gray-600">默认按ID升序排列</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">客户筛选</td>
              <td class="px-3 py-2 text-gray-600">根据选择的客户代码过滤价卡数据</td>
              <td class="px-3 py-2 text-gray-600">客户选择器</td>
              <td class="px-3 py-2 text-gray-600">仅显示当前客户的价卡</td>
              <td class="px-3 py-2 text-gray-600">支持客户切换</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">版本状态判断</td>
              <td class="px-3 py-2 text-gray-600">根据当前日期与生效日期判断价卡状态</td>
              <td class="px-3 py-2 text-gray-600">validFrom/validTo字段</td>
              <td class="px-3 py-2 text-gray-600">生效中/已过期/待生效</td>
              <td class="px-3 py-2 text-gray-600">状态用不同颜色标识</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-4 border-b border-gray-100">
      <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-search text-primary mr-2"></i>检索条件
      </h4>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">检索项</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">输入方式</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">逻辑说明</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">默认值</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">价卡类型</td>
              <td class="px-3 py-2 text-gray-600">下拉单选框</td>
              <td class="px-3 py-2 text-gray-600">支持按类型筛选（全部类型、仓储费、运费、操作费、其他费用）</td>
              <td class="px-3 py-2 text-gray-600">全部类型</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">版本状态</td>
              <td class="px-3 py-2 text-gray-600">下拉单选框</td>
              <td class="px-3 py-2 text-gray-600">支持按状态筛选（全部状态、生效中、已过期、待生效）</td>
              <td class="px-3 py-2 text-gray-600">全部状态</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">生效日期范围</td>
              <td class="px-3 py-2 text-gray-600">日期范围选择器</td>
              <td class="px-3 py-2 text-gray-600">筛选生效日期在指定范围内的价卡</td>
              <td class="px-3 py-2 text-gray-600">无限制</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-4 border-b border-gray-100">
      <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-mouse-pointer text-primary mr-2"></i>按钮逻辑
      </h4>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">按钮名称</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">位置</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">触发动作</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">前置条件</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">后续操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">搜索</td>
              <td class="px-3 py-2 text-gray-600">工具栏左侧</td>
              <td class="px-3 py-2 text-gray-600">根据筛选条件过滤价卡列表</td>
              <td class="px-3 py-2 text-gray-600">无</td>
              <td class="px-3 py-2 text-gray-600">刷新显示结果</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">重置</td>
              <td class="px-3 py-2 text-gray-600">工具栏左侧</td>
              <td class="px-3 py-2 text-gray-600">清空所有筛选条件</td>
              <td class="px-3 py-2 text-gray-600">无</td>
              <td class="px-3 py-2 text-gray-600">显示全部数据</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">导出</td>
              <td class="px-3 py-2 text-gray-600">工具栏右侧</td>
              <td class="px-3 py-2 text-gray-600">打开导出格式选择弹窗</td>
              <td class="px-3 py-2 text-gray-600">无</td>
              <td class="px-3 py-2 text-gray-600">选择格式后下载文件</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">新增价卡</td>
              <td class="px-3 py-2 text-gray-600">页面顶部</td>
              <td class="px-3 py-2 text-gray-600">打开新增价卡弹窗</td>
              <td class="px-3 py-2 text-gray-600">无</td>
              <td class="px-3 py-2 text-gray-600">弹出模态框</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-4 border-b border-gray-100">
      <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-table text-primary mr-2"></i>属性取值逻辑（主表）
      </h4>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">字段</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">说明</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">数据来源</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">取值规则</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">格式</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">必填</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">价卡编号</td>
              <td class="px-3 py-2 text-gray-600">价卡唯一标识码</td>
              <td class="px-3 py-2 text-gray-600">系统自动生成</td>
              <td class="px-3 py-2 text-gray-600">PC + 3位数字</td>
              <td class="px-3 py-2 text-gray-600">PC001</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">规则名称</td>
              <td class="px-3 py-2 text-gray-600">价卡规则名称</td>
              <td class="px-3 py-2 text-gray-600">手工录入</td>
              <td class="px-3 py-2 text-gray-600">最多50字符</td>
              <td class="px-3 py-2 text-gray-600">文本</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">价卡类型</td>
              <td class="px-3 py-2 text-gray-600">费用类型分类</td>
              <td class="px-3 py-2 text-gray-600">下拉选择</td>
              <td class="px-3 py-2 text-gray-600">仓储费/运费/操作费/其他费用</td>
              <td class="px-3 py-2 text-gray-600">枚举值</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">仓库代码</td>
              <td class="px-3 py-2 text-gray-600">适用仓库</td>
              <td class="px-3 py-2 text-gray-600">下拉选择</td>
              <td class="px-3 py-2 text-gray-600">从仓库主数据选择</td>
              <td class="px-3 py-2 text-gray-600">WH001</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">生效日期</td>
              <td class="px-3 py-2 text-gray-600">价卡有效期</td>
              <td class="px-3 py-2 text-gray-600">日期选择器</td>
              <td class="px-3 py-2 text-gray-600">开始日期 ≤ 结束日期</td>
              <td class="px-3 py-2 text-gray-600">YYYY-MM-DD</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">版本状态</td>
              <td class="px-3 py-2 text-gray-600">当前价卡状态</td>
              <td class="px-3 py-2 text-gray-600">系统计算</td>
              <td class="px-3 py-2 text-gray-600">根据当前日期自动判断</td>
              <td class="px-3 py-2 text-gray-600">生效中/已过期/待生效</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-4 border-b border-gray-100">
      <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-list-alt text-primary mr-2"></i>属性取值逻辑（价卡明细）
      </h4>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200 rounded">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">字段</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">说明</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">数据来源</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">取值规则</th>
              <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">必填</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">费用项名称</td>
              <td class="px-3 py-2 text-gray-600">具体的收费项目</td>
              <td class="px-3 py-2 text-gray-600">手工录入</td>
              <td class="px-3 py-2 text-gray-600">最多100字符</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">计费单位</td>
              <td class="px-3 py-2 text-gray-600">费用的计量单位</td>
              <td class="px-3 py-2 text-gray-600">手工录入</td>
              <td class="px-3 py-2 text-gray-600">如：件/天、kg、立方米等</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-3 py-2 text-gray-800">单价</td>
              <td class="px-3 py-2 text-gray-600">单位价格</td>
              <td class="px-3 py-2 text-gray-600">手工录入</td>
              <td class="px-3 py-2 text-gray-600">数字，最多2位小数</td>
              <td class="px-3 py-2 text-gray-600">是</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-4">
      <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
        <i class="fa fa-exclamation-triangle text-warning mr-2"></i>特殊业务规则
      </h4>
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
        <p class="text-sm text-blue-800">
          <strong>版本管理规则：</strong>同一价卡可以有多个版本，每个版本有不同的生效时间段。系统会根据当前日期自动判断哪个版本生效。
        </p>
      </div>
      <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <p class="text-sm text-yellow-800">
          <strong>时间冲突处理：</strong>新增价卡时，如果生效时间段与同一客户、同一仓库、同一类型的已有价卡存在重叠，系统会给出警告提示。
        </p>
      </div>
    </div>
  `;
}

function handleSearch() {
  filterData();
}

function handleReset() {
  resetFilters();
}

function openAddCardModal() {
  document.getElementById('addCardModal').classList.add('active');
}

function closeAddCardModal() {
  document.getElementById('addCardModal').classList.remove('active');
}

function handleCopyTable() {
  const table = document.getElementById('priceCardTable');
  const rows = table.querySelectorAll('tr');
  let text = '';
  rows.forEach(row => {
    const cells = row.querySelectorAll('th, td');
    text += Array.from(cells).map(cell => cell.textContent.trim()).join('\t') + '\n';
  });
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('表格已复制到剪贴板', 'success');
  }).catch(() => {
    showToast('复制失败', 'error');
  });
}

function handleDownloadTable() {
  const table = document.getElementById('priceCardTable');
  let csv = [];
  const rows = table.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('th, td');
    const rowData = Array.from(cells).map(cell => {
      let text = cell.textContent.trim().replace(/"/g, '""');
      return `"${text}"`;
    });
    csv.push(rowData.join(','));
  });
  
  const csvContent = csv.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `价卡列表_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  
  showToast('CSV文件下载成功', 'success');
}

function handleFullscreenTable() {
  const tableContainer = document.querySelector('.overflow-x-auto');
  if (!document.fullscreenElement) {
    tableContainer.requestFullscreen().catch(err => {
      showToast('无法进入全屏模式', 'error');
    });
  } else {
    document.exitFullscreen();
  }
}

function showStorageFeeDetail(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  
  const warehouseOps = item.warehouseOperations || [];
  const regions = item.regions || [];
  
  let tableHtml = '';
  if (warehouseOps.length > 0) {
    const headerCells = regions.map(r => `<th class="text-right px-4 py-3">${r}</th>`).join('');
    
    const rows = warehouseOps.map(op => {
      const priceCells = regions.map(r => {
        const price = op.prices && op.prices[r] ? op.prices[r] : '-';
        return `<td class="text-right px-4 py-3 font-semibold text-amber-600">${price}</td>`;
      }).join('');
      
      return `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3 font-medium text-gray-900">${op.name}</td>
          <td class="px-4 py-3 text-gray-600">${op.unit}</td>
          ${priceCells}
        </tr>
      `;
    }).join('');
    
    tableHtml = `
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">库龄区间</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">单位</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  } else {
    tableHtml = `
      <div class="flex flex-col items-center justify-center py-12 text-gray-400">
        <i class="fa fa-inbox text-4xl mb-3"></i>
        <p>暂无仓储费明细</p>
      </div>
    `;
  }
  
  showModal('仓储费详情 - ' + item.code, `
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center">
            <i class="fa fa-barcode text-primary mr-3"></i>
            <div>
              <div class="text-xs text-gray-500">价卡编号</div>
              <div class="font-semibold text-gray-900">${item.code}</div>
            </div>
          </div>
          <div class="flex items-center">
            <i class="fa fa-file-text text-primary mr-3"></i>
            <div>
              <div class="text-xs text-gray-500">价卡名称</div>
              <div class="font-semibold text-gray-900">${item.name}</div>
            </div>
          </div>
          <div class="flex items-center">
            <i class="fa fa-calculator text-primary mr-3"></i>
            <div>
              <div class="text-xs text-gray-500">计费类型</div>
              <div class="font-semibold text-gray-900">${item.billingType || '-'}</div>
            </div>
          </div>
          <div class="flex items-center">
            <i class="fa fa-calendar text-primary mr-3"></i>
            <div>
              <div class="text-xs text-gray-500">结算周期</div>
              <div class="font-semibold text-gray-900">${item.settlementCycle || '-'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div class="flex items-center mb-3">
          <i class="fa fa-warehouse text-primary mr-2"></i>
          <h4 class="font-semibold text-gray-800">仓储费明细（按库龄分段）</h4>
        </div>
        ${tableHtml}
      </div>
    </div>
  `, '900px');
}

function showOperationFeeDetail(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  
  const outboundFees = item.outboundFees || [];
  const bundleFee = item.bundleFee;
  
  let tableHtml = '';
  if (outboundFees.length > 0) {
    const rows = outboundFees.map(fee => `
      <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 font-medium text-gray-900">${fee.weightRange}</td>
        <td class="px-4 py-3 text-gray-600">${fee.unit}</td>
        <td class="text-right px-4 py-3 font-semibold text-amber-600">${fee.rate}</td>
        <td class="text-right px-4 py-3 font-semibold text-amber-600">${fee.surcharge}</td>
      </tr>
    `).join('');
    
    tableHtml = `
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">重量范围</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">单位</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-700">费率</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-700">附加费</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  } else {
    tableHtml = `
      <div class="flex flex-col items-center justify-center py-12 text-gray-400">
        <i class="fa fa-inbox text-4xl mb-3"></i>
        <p>暂无出库费明细</p>
      </div>
    `;
  }
  
  let bundleHtml = '';
  if (bundleFee) {
    bundleHtml = `
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="fa fa-cubes text-amber-600 mr-3"></i>
            <div>
              <div class="text-xs text-gray-500">捆绑费</div>
              <div class="font-medium text-gray-900">${bundleFee.label}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-amber-600">${bundleFee.price}</div>
            <div class="text-xs text-gray-500">${item.currency}/${bundleFee.unit}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  showModal('出库费详情 - ' + item.code, `
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center">
            <i class="fa fa-barcode text-primary mr-3"></i>
            <div>
              <div class="text-xs text-gray-500">价卡编号</div>
              <div class="font-semibold text-gray-900">${item.code}</div>
            </div>
          </div>
          <div class="flex items-center">
            <i class="fa fa-file-text text-primary mr-3"></i>
            <div>
              <div class="text-xs text-gray-500">价卡名称</div>
              <div class="font-semibold text-gray-900">${item.name}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div class="flex items-center mb-3">
          <i class="fa fa-shipping-fast text-primary mr-2"></i>
          <h4 class="font-semibold text-gray-800">出库费明细（按重量分段）</h4>
        </div>
        ${tableHtml}
      </div>
      
      ${bundleHtml}
    </div>
  `, '800px');
}

function showExpressFeeDetail(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  
  showModal('快递费详情 - ' + item.code, `
    <div class="detail-section">
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">价卡编号</span><span class="detail-value">${item.code}</span></div>
        <div class="detail-item"><span class="detail-label">价卡名称</span><span class="detail-value">${item.name}</span></div>
        <div class="detail-item"><span class="detail-label">快递费等级</span><span class="detail-value"><span class="level-badge level-${item.expressFee}">${item.expressFee || '-'}</span></span></div>
      </div>
      <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:6px;text-align:center;color:#666;">
        快递费按实际承运商报价计算
      </div>
    </div>
  `, '500px');
}

function showOtherFeeDetail(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;
  
  showModal('其他费用详情 - ' + item.code, `
    <div class="detail-section">
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">价卡编号</span><span class="detail-value">${item.code}</span></div>
        <div class="detail-item"><span class="detail-label">价卡名称</span><span class="detail-value">${item.name}</span></div>
        <div class="detail-item"><span class="detail-label">其他费用等级</span><span class="detail-value"><span class="level-badge level-${item.otherFee}">${item.otherFee || '-'}</span></span></div>
      </div>
      <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:6px;text-align:center;color:#666;">
        其他费用包括特殊操作费、增值服务费等
      </div>
    </div>
  `, '500px');
}

function addFeeRow() {
  const tbody = document.getElementById('feeTypeTableBody');
  
  if (!tbody) {
    console.error('找不到费用类型表格容器');
    return;
  }
  
  const rowCount = tbody.querySelectorAll('tr').length;
  
  if (rowCount >= 4) {
    showToast('最多只能添加4个费用项', 'warning');
    return;
  }
  
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td class="px-4 py-3">
      <select class="fee-type-select" onchange="updateFeeLevelOptions(this)">
        <option value="">请选择费用类型</option>
        <option value="storageFee">仓储费</option>
        <option value="operationFee">出库费</option>
        <option value="expressFee">快递费</option>
        <option value="otherFee">其他费用</option>
      </select>
    </td>
    <td class="px-4 py-3">
      <select class="fee-level-select">
        <option value="">请先选择费用类型</option>
      </select>
    </td>
    <td class="px-4 py-3 fee-action-cell">
      <button class="btn-delete-row" onclick="deleteFeeRow(this)">
        <i class="fa fa-trash"></i>
      </button>
    </td>
  `;
  
  tbody.appendChild(newRow);
}

function deleteFeeRow(btn) {
  const row = btn.closest('tr');
  row.remove();
}

function updateFeeLevelOptions(selectElement) {
  const row = selectElement.closest('tr');
  const levelSelect = row.querySelector('.fee-level-select');
  const feeType = selectElement.value;
  
  levelSelect.innerHTML = '';
  
  if (!feeType) {
    levelSelect.innerHTML = '<option value="">请先选择费用类型</option>';
    return;
  }
  
  const levels = ['VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'];
  levelSelect.innerHTML = '<option value="">请选择等级</option>' +
    levels.map(level => `<option value="${level}">${level}</option>`).join('');
}

function handleAddCard(event) {
  event.preventDefault();
  
  const startDate = document.getElementById('effectiveStartDate').value;
  const endDate = document.getElementById('effectiveEndDate').value;
  
  if (!startDate || !endDate) {
    showToast('请选择生效日期', 'warning');
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    showToast('开始日期不能晚于结束日期', 'warning');
    return;
  }
  
  const tbody = document.querySelector('#addCardTable tbody');
  const rows = tbody.querySelectorAll('tr');
  const feeItems = [];
  
  rows.forEach(row => {
    const feeType = row.querySelector('.fee-type-select').value;
    const feeLevel = row.querySelector('.fee-level-select').value;
    
    if (feeType && feeLevel) {
      feeItems.push({ feeType, feeLevel });
    }
  });
  
  if (feeItems.length === 0) {
    showToast('请至少添加一个费用项', 'warning');
    return;
  }
  
  showToast('价卡创建成功', 'success');
  closeAddCardModal();
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}
