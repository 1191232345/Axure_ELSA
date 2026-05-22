let inboundFeeRuleData = null;
let packages = [];
let feeRows = [];
let editingPackageId = null;
let currentFeeCategory = 'inbound';

const DATA_VERSION = '6.0';

const FEE_TYPE_ENUMS = {
  'cat_1': '整柜入库',
  'cat_2': '快递散货入库',
  'cat_3': '托盘入库'
};

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '-';
  
  try {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return dateTimeStr;
  }
}

function processDateTimeDefault(dateTimeStr, isEffective = true) {
  if (!dateTimeStr) return '';
  
  if (dateTimeStr.length === 10) {
    if (isEffective) {
      return `${dateTimeStr}T00:00`;
    } else {
      return `${dateTimeStr}T23:00`;
    }
  }
  
  return dateTimeStr;
}

async function init() {
  await loadInboundFeeRuleData();
  loadPackages();
  renderPackageTable();
}

async function loadInboundFeeRuleData() {
  try {
    const response = await fetch('../入库费规则/data/inbound-fee-rule-data.json');
    inboundFeeRuleData = await response.json();
    console.log('✅ 入库费规则数据加载成功');
  } catch (error) {
    console.error('❌ 入库费规则数据加载失败:', error);
  }
}

function loadPackages() {
  const storedVersion = localStorage.getItem('packagesVersion');
  const stored = localStorage.getItem('packages');
  
  if (stored && storedVersion === DATA_VERSION) {
    packages = JSON.parse(stored);
  } else {
    localStorage.removeItem('packages');
    localStorage.removeItem('packagesVersion');
    
    packages = [
      {
        id: 1,
        name: '基础入库价卡',
        description: '包含基础入库和卸货服务',
        feeItems: [
          { 
            feeCategory: 'inbound',
            feeCategoryName: '入库费',
            feeType: 'cat_1',
            feeTypeName: '整柜入库',
            feeId: 'rule_1_1_1', 
            feeName: '卸货费',
            discountType: 'percentage',
            discountValue: 10
          }
        ],
        effectiveDate: '2024-01-01T00:00',
        expiryDate: '2024-12-31T23:00',
        status: 'active',
        createdAt: '2024-01-15 10:30:00'
      }
    ];
    savePackages();
  }
}

function savePackages() {
  localStorage.setItem('packages', JSON.stringify(packages));
  localStorage.setItem('packagesVersion', DATA_VERSION);
}

function switchFeeCategory(category) {
  currentFeeCategory = category;
  
  document.querySelectorAll('.fee-category-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.category === category) {
      tab.classList.add('active');
    }
  });
  
  renderFeeTable();
}

function getFeeTypes() {
  if (!inboundFeeRuleData || !inboundFeeRuleData.categories) {
    return [];
  }
  
  return inboundFeeRuleData.categories.map(cat => ({
    id: cat.id,
    name: cat.name
  }));
}

function getFeeItemsByType(feeTypeId) {
  if (!inboundFeeRuleData || !inboundFeeRuleData.categories) {
    return [];
  }
  
  const category = inboundFeeRuleData.categories.find(cat => cat.id === feeTypeId);
  if (!category) {
    return [];
  }
  
  let feeItems = [];
  
  category.children.forEach(operation => {
    if (operation.children && operation.children.length > 0) {
      operation.children.forEach(rule => {
        feeItems.push({
          id: rule.id,
          name: rule.subCategory ? `${rule.feeItem} - ${rule.subCategory}` : rule.feeItem,
          unit: rule.unit,
          operation: operation.name
        });
      });
    }
  });
  
  return feeItems;
}

function addFeeRow() {
  const rowId = Date.now();
  feeRows.push({
    id: rowId,
    feeCategory: currentFeeCategory,
    feeType: '',
    feeId: '',
    discountType: 'none',
    discountValue: 0
  });
  renderFeeTable();
}

function removeFeeRow(rowId) {
  feeRows = feeRows.filter(row => row.id !== rowId);
  renderFeeTable();
}

function updateFeeRow(rowId, field, value) {
  const row = feeRows.find(r => r.id === rowId);
  if (row) {
    row[field] = value;
    if (field === 'feeType') {
      row.feeId = '';
    }
    if (field === 'discountType') {
      row.discountValue = 0;
    }
    renderFeeTable();
  }
}

function renderFeeTable() {
  const tbody = document.getElementById('feeItemsTableBody');
  
  if (feeRows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-8 text-center text-text-muted">
          <i class="fas fa-inbox text-2xl mb-2"></i>
          <p>暂无费用项，请点击"新增行"添加</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const feeTypes = getFeeTypes();
  
  tbody.innerHTML = feeRows.map(row => {
    const feeTypeOptions = feeTypes.map(type => 
      `<option value="${type.id}" ${row.feeType === type.id ? 'selected' : ''}>
        ${type.name}
      </option>`
    ).join('');
    
    const feeItems = row.feeType ? getFeeItemsByType(row.feeType) : [];
    const feeOptions = row.feeType ? 
      feeItems.map(item =>
        `<option value="${item.id}" ${row.feeId === item.id ? 'selected' : ''}>
          ${item.name} (${item.unit})
        </option>`
      ).join('') : '<option value="">请先选择收费类型</option>';
    
    const discountTypeOptions = `
      <option value="none" ${row.discountType === 'none' ? 'selected' : ''}>无折扣</option>
      <option value="percentage" ${row.discountType === 'percentage' ? 'selected' : ''}>百分比</option>
      <option value="fixed" ${row.discountType === 'fixed' ? 'selected' : ''}>指定扣减</option>
    `;
    
    let discountValueInput = '';
    if (row.discountType === 'percentage') {
      discountValueInput = `
        <div class="flex items-center gap-2 mt-2">
          <input type="number" value="${row.discountValue || ''}" min="0" max="100" step="1"
                 onchange="updateFeeRow(${row.id}, 'discountValue', parseFloat(this.value) || 0)"
                 class="form-input text-sm w-24" placeholder="输入百分比">
          <span class="text-sm text-text-secondary">%</span>
        </div>
      `;
    } else if (row.discountType === 'fixed') {
      discountValueInput = `
        <div class="flex items-center gap-2 mt-2">
          <input type="number" value="${row.discountValue || ''}" min="0" step="0.01"
                 onchange="updateFeeRow(${row.id}, 'discountValue', parseFloat(this.value) || 0)"
                 class="form-input text-sm w-32" placeholder="输入金额">
          <span class="text-sm text-text-secondary">元</span>
        </div>
      `;
    }
    
    return `
      <tr class="hover:bg-hover transition-colors">
        <td class="px-4 py-3">
          <select onchange="updateFeeRow(${row.id}, 'feeType', this.value)" 
                  class="form-input text-sm">
            <option value="">请选择收费类型</option>
            ${feeTypeOptions}
          </select>
        </td>
        <td class="px-4 py-3">
          <select onchange="updateFeeRow(${row.id}, 'feeId', this.value)" 
                  class="form-input text-sm">
            <option value="">请选择收费项</option>
            ${feeOptions}
          </select>
        </td>
        <td class="px-4 py-3">
          <select onchange="updateFeeRow(${row.id}, 'discountType', this.value)" 
                  class="form-input text-sm">
            ${discountTypeOptions}
          </select>
          ${discountValueInput}
        </td>
        <td class="px-4 py-3">
          <button type="button" onclick="removeFeeRow(${row.id})" 
                  class="btn btn-danger btn-sm">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPackageTable() {
  const tbody = document.getElementById('packageTableBody');
  const emptyState = document.getElementById('emptyState');
  
  if (packages.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  tbody.innerHTML = packages.map(pkg => {
    const feeSummary = {};
    pkg.feeItems.forEach(item => {
      const key = item.feeCategoryName;
      if (!feeSummary[key]) {
        feeSummary[key] = 0;
      }
      feeSummary[key]++;
    });
    
    const feeSummaryText = Object.entries(feeSummary)
      .map(([name, count]) => `${name}(${count}项)`)
      .join('、');
    
    return `
      <tr class="hover:bg-hover transition-colors">
        <td class="px-6 py-4">
          <div class="font-semibold text-dark">${pkg.name}</div>
          ${pkg.description ? `<div class="text-xs text-text-muted mt-1">${pkg.description}</div>` : ''}
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${feeSummaryText}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${formatDateTime(pkg.effectiveDate)}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${formatDateTime(pkg.expiryDate)}</div>
        </td>
        <td class="px-6 py-4">
          <span class="status-badge ${
            pkg.status === 'active' ? 'status-active' : 
            pkg.status === 'draft' ? 'status-draft' : 
            pkg.status === 'cancelled' ? 'status-cancelled' : 'status-inactive'
          }">
            ${pkg.status === 'active' ? '生效' : 
              pkg.status === 'draft' ? '草稿' : 
              pkg.status === 'cancelled' ? '已作废' : '停用'}
          </span>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${pkg.createdAt}</div>
        </td>
        <td class="px-6 py-4">
          <div class="action-buttons">
            <button class="action-btn action-btn-view" onclick="viewPackage(${pkg.id})">
              <i class="fas fa-eye mr-1"></i>查看
            </button>
            <button class="action-btn action-btn-edit" onclick="editPackage(${pkg.id})">
              <i class="fas fa-edit mr-1"></i>编辑
            </button>
            <button class="action-btn action-btn-delete" onclick="cancelPackage(${pkg.id})">
              <i class="fas fa-ban mr-1"></i>作废
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openCreateModal() {
  editingPackageId = null;
  feeRows = [];
  currentFeeCategory = 'inbound';
  
  document.getElementById('modalTitleText').textContent = '创建价卡';
  document.getElementById('packageForm').reset();
  document.getElementById('packageStatus').checked = false;
  
  document.querySelectorAll('.fee-category-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.category === 'inbound') {
      tab.classList.add('active');
    }
  });
  
  renderFeeTable();
  document.getElementById('packageModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('packageModal').style.display = 'none';
  feeRows = [];
  editingPackageId = null;
}

function savePackage() {
  const name = document.getElementById('packageName').value.trim();
  const description = document.getElementById('packageDescription').value.trim();
  let effectiveDate = document.getElementById('effectiveDate').value;
  let expiryDate = document.getElementById('expiryDate').value;
  const isActive = document.getElementById('packageStatus').checked;
  
  effectiveDate = processDateTimeDefault(effectiveDate, true);
  expiryDate = processDateTimeDefault(expiryDate, false);
  
  const status = isActive ? 'active' : 'draft';
  
  if (!name) {
    alert('请输入价卡名称');
    return;
  }
  
  if (feeRows.length === 0) {
    alert('请至少添加一个费用项');
    return;
  }
  
  const validFeeRows = feeRows.filter(row => row.feeId && row.feeType);
  if (validFeeRows.length === 0) {
    alert('请至少选择一个费用项');
    return;
  }
  
  const feeItems = validFeeRows.map(row => {
    const category = inboundFeeRuleData.categories.find(cat => cat.id === row.feeType);
    let feeItem = null;
    
    category.children.forEach(operation => {
      if (operation.children && operation.children.length > 0) {
        const found = operation.children.find(rule => rule.id === row.feeId);
        if (found) {
          feeItem = {
            ...found,
            operationName: operation.name
          };
        }
      }
    });
    
    return {
      feeCategory: row.feeCategory || currentFeeCategory,
      feeCategoryName: '入库费',
      feeType: row.feeType,
      feeTypeName: category.name,
      feeId: row.feeId,
      feeName: feeItem.subCategory ? `${feeItem.feeItem} - ${feeItem.subCategory}` : feeItem.feeItem,
      unit: feeItem.unit,
      discountType: row.discountType,
      discountValue: row.discountValue || 0
    };
  });
  
  const packageData = {
    name,
    description,
    feeItems,
    effectiveDate,
    expiryDate,
    status
  };
  
  if (editingPackageId) {
    const index = packages.findIndex(p => p.id === editingPackageId);
    if (index > -1) {
      packages[index] = { ...packages[index], ...packageData };
    }
  } else {
    packageData.id = Date.now();
    packageData.createdAt = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-');
    packages.push(packageData);
  }
  
  savePackages();
  renderPackageTable();
  closeModal();
  
  alert(editingPackageId ? '价卡更新成功！' : '价卡创建成功！');
}

function editPackage(packageId) {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return;
  
  editingPackageId = packageId;
  feeRows = pkg.feeItems.map((item, index) => ({
    id: Date.now() + index,
    feeCategory: item.feeCategory,
    feeType: item.feeType,
    feeId: item.feeId,
    discountType: item.discountType || 'none',
    discountValue: item.discountValue || 0
  }));
  
  currentFeeCategory = pkg.feeItems[0]?.feeCategory || 'inbound';
  
  document.getElementById('modalTitleText').textContent = '编辑价卡';
  document.getElementById('packageName').value = pkg.name;
  document.getElementById('packageDescription').value = pkg.description;
  document.getElementById('effectiveDate').value = pkg.effectiveDate;
  document.getElementById('expiryDate').value = pkg.expiryDate;
  document.getElementById('packageStatus').checked = pkg.status === 'active';
  
  document.querySelectorAll('.fee-category-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.category === currentFeeCategory) {
      tab.classList.add('active');
    }
  });
  
  renderFeeTable();
  
  document.getElementById('packageModal').style.display = 'flex';
}

function cancelPackage(packageId) {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return;
  
  if (!confirm(`确定要作废价卡"${pkg.name}"吗？\n\n作废后该价卡将无法继续使用，此操作不可恢复。`)) {
    return;
  }
  
  pkg.status = 'cancelled';
  savePackages();
  renderPackageTable();
  
  alert('价卡已作废！');
}

function viewPackage(packageId) {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return;
  
  const levelLabels = {
    1: 'VIP1',
    2: 'VIP2',
    3: 'VIP3',
    4: 'VIP4'
  };
  
  const feeItemsHtml = pkg.feeItems.map(item => {
    let discountText = '无折扣';
    
    if (item.discountType === 'percentage') {
      discountText = `${item.discountValue}%折扣`;
    } else if (item.discountType === 'fixed') {
      discountText = `减免${item.discountValue}元`;
    }
    
    return `
      <div class="detail-fee-item">
        <div class="detail-fee-name">
          <span class="text-xs text-text-muted">${item.feeCategoryName} - ${item.feeTypeName}</span><br>
          ${item.feeName}
        </div>
        <div class="detail-fee-price">
          单位：${item.unit}<br>
          折扣方式：${discountText}
        </div>
      </div>
    `;
  }).join('');
  
  const detailHtml = `
    <div class="detail-section">
      <h4 class="detail-section-title">
        <i class="fas fa-info-circle mr-2 text-accent"></i>基本信息
      </h4>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">价卡名称</div>
          <div class="detail-value">${pkg.name}</div>
        </div>

        <div class="detail-item">
          <div class="detail-label">状态</div>
          <div class="detail-value">
            <span class="status-badge ${
              pkg.status === 'active' ? 'status-active' : 
              pkg.status === 'draft' ? 'status-draft' : 
              pkg.status === 'cancelled' ? 'status-cancelled' : 'status-inactive'
            }">
              ${pkg.status === 'active' ? '生效' : 
                pkg.status === 'draft' ? '草稿' : 
                pkg.status === 'cancelled' ? '已作废' : '停用'}
            </span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">创建时间</div>
          <div class="detail-value">${pkg.createdAt}</div>
        </div>
        ${pkg.description ? `
        <div class="detail-item" style="grid-column: 1 / -1;">
          <div class="detail-label">价卡描述</div>
          <div class="detail-value">${pkg.description}</div>
        </div>
        ` : ''}
      </div>
    </div>
    
    <div class="detail-section">
      <h4 class="detail-section-title">
        <i class="fas fa-list-check mr-2 text-accent"></i>费用项明细
      </h4>
      <div class="detail-fee-list">
        ${feeItemsHtml}
      </div>
    </div>
    
    ${pkg.effectiveDate || pkg.expiryDate ? `
    <div class="detail-section">
      <h4 class="detail-section-title">
        <i class="fas fa-calendar mr-2 text-accent"></i>有效期
      </h4>
      <div class="detail-grid">
        ${pkg.effectiveDate ? `
        <div class="detail-item">
          <div class="detail-label">生效时间</div>
          <div class="detail-value">${formatDateTime(pkg.effectiveDate)}</div>
        </div>
        ` : ''}
        ${pkg.expiryDate ? `
        <div class="detail-item">
          <div class="detail-label">失效时间</div>
          <div class="detail-value">${formatDateTime(pkg.expiryDate)}</div>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}
  `;
  
  document.getElementById('detailContent').innerHTML = detailHtml;
  document.getElementById('detailModal').style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function applyFilters() {
  const nameFilter = document.getElementById('filterName').value.toLowerCase();
  const statusFilter = document.getElementById('filterStatus').value;
  const effectiveDateStart = document.getElementById('filterEffectiveDateStart').value;
  const effectiveDateEnd = document.getElementById('filterEffectiveDateEnd').value;
  const expiryDateStart = document.getElementById('filterExpiryDateStart').value;
  const expiryDateEnd = document.getElementById('filterExpiryDateEnd').value;
  
  const filteredPackages = packages.filter(pkg => {
    const nameMatch = !nameFilter || pkg.name.toLowerCase().includes(nameFilter);
    const statusMatch = !statusFilter || pkg.status === statusFilter;
    
    const effectiveDateMatch = (!effectiveDateStart || !pkg.effectiveDate || pkg.effectiveDate >= effectiveDateStart) &&
                               (!effectiveDateEnd || !pkg.effectiveDate || pkg.effectiveDate <= effectiveDateEnd);
    
    const expiryDateMatch = (!expiryDateStart || !pkg.expiryDate || pkg.expiryDate >= expiryDateStart) &&
                            (!expiryDateEnd || !pkg.expiryDate || pkg.expiryDate <= expiryDateEnd);
    
    return nameMatch && statusMatch && effectiveDateMatch && expiryDateMatch;
  });
  
  const tbody = document.getElementById('packageTableBody');
  const emptyState = document.getElementById('emptyState');
  
  if (filteredPackages.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  const originalPackages = packages;
  packages = filteredPackages;
  renderPackageTable();
  packages = originalPackages;
}

function resetFilters() {
  document.getElementById('filterName').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterEffectiveDateStart').value = '';
  document.getElementById('filterEffectiveDateEnd').value = '';
  document.getElementById('filterExpiryDateStart').value = '';
  document.getElementById('filterExpiryDateEnd').value = '';
  
  renderPackageTable();
}

document.addEventListener('DOMContentLoaded', init);
