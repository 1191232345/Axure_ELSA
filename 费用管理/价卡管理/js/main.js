let inboundFeeRuleData = null;
let feeCategoriesData = null;
let packages = [];
let feeRows = [];
let editingPackageId = null;
let currentFeeCategory = 'inbound';

const DATA_VERSION = '7.0';

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
  await Promise.all([
    loadInboundFeeRuleData(),
    loadFeeCategoriesData()
  ]);
  loadPackages();
  renderPackageTable();
}

async function loadInboundFeeRuleData() {
  try {
    const response = await fetch('data/inbound-fee-rule-data.json');
    inboundFeeRuleData = await response.json();
    console.log('✅ 入库费规则数据加载成功');
  } catch (error) {
    console.error('❌ 入库费规则数据加载失败:', error);
  }
}

async function loadFeeCategoriesData() {
  try {
    const response = await fetch('data/fee-categories.json');
    feeCategoriesData = await response.json();
    console.log('✅ 收费分类数据加载成功');
  } catch (error) {
    console.error('❌ 收费分类数据加载失败:', error);
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
            unit: '柜',
            discountType: 'percentage',
            discountValue: 10,
            remark: ''
          }
        ],
        createdBy: '系统管理员',
        createdAt: '2024-01-15 10:30:00',
        updatedBy: '系统管理员',
        updatedAt: '2024-01-15 10:30:00'
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

function getFeeTypes(category = 'inbound') {
  // 如果是入库费，使用入库费规则数据
  if (category === 'inbound' && inboundFeeRuleData && inboundFeeRuleData.categories) {
    return inboundFeeRuleData.categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  }
  
  // 其他收费分类，使用fee-categories.json数据
  if (feeCategoriesData && feeCategoriesData.feeCategories && feeCategoriesData.feeCategories[category]) {
    const categoryData = feeCategoriesData.feeCategories[category];
    return categoryData.categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  }
  
  return [];
}

function getFeeItemsByType(feeTypeId, category = 'inbound') {
  // 如果是入库费，使用入库费规则数据
  if (category === 'inbound' && inboundFeeRuleData && inboundFeeRuleData.categories) {
    const categoryData = inboundFeeRuleData.categories.find(cat => cat.id === feeTypeId);
    if (!categoryData) {
      return [];
    }
    
    let feeItems = [];
    
    categoryData.children.forEach(operation => {
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
  
  // 其他收费分类，使用fee-categories.json数据
  if (feeCategoriesData && feeCategoriesData.feeCategories) {
    for (const catKey in feeCategoriesData.feeCategories) {
      const catData = feeCategoriesData.feeCategories[catKey];
      if (catData.categories) {
        const foundCategory = catData.categories.find(cat => cat.id === feeTypeId);
        if (foundCategory && foundCategory.feeItems) {
          return foundCategory.feeItems.map(item => ({
            id: item.id,
            name: item.name,
            unit: item.unit,
            description: item.description
          }));
        }
      }
    }
  }
  
  return [];
}

function addFeeRow() {
  const rowId = Date.now();
  feeRows.push({
    id: rowId,
    feeCategory: currentFeeCategory,
    feeType: '',
    feeId: '',
    discountType: 'none',
    discountValue: 0,
    remark: ''
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
        <td colspan="7" class="px-4 py-8 text-center text-text-muted">
          <i class="fas fa-inbox text-2xl mb-2"></i>
          <p>暂无费用项，请点击"新增行"添加</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const feeTypes = getFeeTypes(currentFeeCategory);
  
  tbody.innerHTML = feeRows.map(row => {
    const feeTypeOptions = feeTypes.map(type => 
      `<option value="${type.id}" ${row.feeType === type.id ? 'selected' : ''}>
        ${type.name}
      </option>`
    ).join('');
    
    const feeItems = row.feeType ? getFeeItemsByType(row.feeType, currentFeeCategory) : [];
    const feeOptions = row.feeType ? 
      feeItems.map(item =>
        `<option value="${item.id}" ${row.feeId === item.id ? 'selected' : ''}>
          ${item.name}
        </option>`
      ).join('') : '<option value="">请先选择收费类型</option>';
    
    const selectedItem = feeItems.find(item => item.id === row.feeId);
    const unitDisplay = selectedItem ? selectedItem.unit : '-';
    
    const discountTypeOptions = `
      <option value="none" ${row.discountType === 'none' ? 'selected' : ''}>无折扣</option>
      <option value="percentage" ${row.discountType === 'percentage' ? 'selected' : ''}>百分比</option>
      <option value="fixed" ${row.discountType === 'fixed' ? 'selected' : ''}>指定扣减</option>
      <option value="fixed_price" ${row.discountType === 'fixed_price' ? 'selected' : ''}>一口价</option>
    `;
    
    let discountValueInput = '';
    if (row.discountType === 'percentage') {
      discountValueInput = `
        <div class="flex items-center gap-1">
          <input type="number" value="${row.discountValue || ''}" min="0" max="100" step="1"
                 onchange="updateFeeRow(${row.id}, 'discountValue', parseFloat(this.value) || 0)"
                 class="form-input text-sm w-20" placeholder="百分比">
          <span class="text-sm text-text-secondary">%</span>
        </div>
      `;
    } else if (row.discountType === 'fixed') {
      discountValueInput = `
        <div class="flex items-center gap-1">
          <input type="number" value="${row.discountValue || ''}" min="0" step="0.01"
                 onchange="updateFeeRow(${row.id}, 'discountValue', parseFloat(this.value) || 0)"
                 class="form-input text-sm w-24" placeholder="金额">
          <span class="text-sm text-text-secondary">元</span>
        </div>
      `;
    } else if (row.discountType === 'fixed_price') {
      discountValueInput = `
        <div class="flex items-center gap-1">
          <input type="number" value="${row.discountValue || ''}" min="0" step="0.01"
                 onchange="updateFeeRow(${row.id}, 'discountValue', parseFloat(this.value) || 0)"
                 class="form-input text-sm w-24" placeholder="一口价">
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
          <div class="text-sm text-text-secondary">${unitDisplay}</div>
        </td>
        <td class="px-4 py-3">
          <select onchange="updateFeeRow(${row.id}, 'discountType', this.value)" 
                  class="form-input text-sm">
            ${discountTypeOptions}
          </select>
        </td>
        <td class="px-4 py-3">
          ${discountValueInput || '<span class="text-sm text-text-muted">-</span>'}
        </td>
        <td class="px-4 py-3">
          <input type="text" value="${row.remark || ''}" 
                 onchange="updateFeeRow(${row.id}, 'remark', this.value)"
                 class="form-input text-sm" placeholder="输入备注">
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
          <div class="text-sm text-text-secondary">${pkg.createdBy || '-'}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${pkg.createdAt}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${pkg.updatedBy || '-'}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${pkg.updatedAt || '-'}</div>
        </td>
        <td class="px-6 py-4">
          <div class="action-buttons">
            <button class="action-btn action-btn-view" onclick="viewPackage(${pkg.id})">
              <i class="fas fa-eye mr-1"></i>查看
            </button>
            <button class="action-btn action-btn-edit" onclick="editPackage(${pkg.id})">
              <i class="fas fa-edit mr-1"></i>编辑
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
    // 获取收费分类名称
    const feeCategoryNames = {
      'inbound': '入库费',
      'outbound': '出库费',
      'express': '快递费',
      'other': '其他收费'
    };
    
    const feeCategoryName = feeCategoryNames[row.feeCategory] || '入库费';
    
    // 获取收费类型名称
    let feeTypeName = '';
    let feeName = '';
    let unit = '';
    
    if (row.feeCategory === 'inbound') {
      // 入库费使用入库费规则数据
      const category = inboundFeeRuleData.categories.find(cat => cat.id === row.feeType);
      if (category) {
        feeTypeName = category.name;
        
        category.children.forEach(operation => {
          if (operation.children && operation.children.length > 0) {
            const found = operation.children.find(rule => rule.id === row.feeId);
            if (found) {
              feeName = found.subCategory ? `${found.feeItem} - ${found.subCategory}` : found.feeItem;
              unit = found.unit;
            }
          }
        });
      }
    } else {
      // 其他收费分类使用fee-categories.json数据
      if (feeCategoriesData && feeCategoriesData.feeCategories && feeCategoriesData.feeCategories[row.feeCategory]) {
        const categoryData = feeCategoriesData.feeCategories[row.feeCategory];
        const foundCategory = categoryData.categories.find(cat => cat.id === row.feeType);
        if (foundCategory) {
          feeTypeName = foundCategory.name;
          const foundItem = foundCategory.feeItems.find(item => item.id === row.feeId);
          if (foundItem) {
            feeName = foundItem.name;
            unit = foundItem.unit;
          }
        }
      }
    }
    
    return {
      feeCategory: row.feeCategory || currentFeeCategory,
      feeCategoryName,
      feeType: row.feeType,
      feeTypeName,
      feeId: row.feeId,
      feeName,
      unit,
      discountType: row.discountType,
      discountValue: row.discountValue || 0,
      remark: row.remark || ''
    };
  });
  
  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-');
  
  const currentUser = '系统管理员'; // 实际应用中应从登录信息获取
  
  const packageData = {
    name,
    description,
    feeItems
  };
  
  if (editingPackageId) {
    const index = packages.findIndex(p => p.id === editingPackageId);
    if (index > -1) {
      packages[index] = { 
        ...packages[index], 
        ...packageData,
        updatedBy: currentUser,
        updatedAt: currentTime
      };
    }
  } else {
    packageData.id = Date.now();
    packageData.createdBy = currentUser;
    packageData.createdAt = currentTime;
    packageData.updatedBy = currentUser;
    packageData.updatedAt = currentTime;
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
    discountValue: item.discountValue || 0,
    remark: item.remark || ''
  }));
  
  currentFeeCategory = pkg.feeItems[0]?.feeCategory || 'inbound';
  
  document.getElementById('modalTitleText').textContent = '编辑价卡';
  document.getElementById('packageName').value = pkg.name;
  document.getElementById('packageDescription').value = pkg.description;
  
  document.querySelectorAll('.fee-category-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.category === currentFeeCategory) {
      tab.classList.add('active');
    }
  });
  
  renderFeeTable();
  
  document.getElementById('packageModal').style.display = 'flex';
}

function viewPackage(packageId) {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return;
  
  const feeItemsHtml = pkg.feeItems.map(item => {
    let discountText = '无折扣';
    
    if (item.discountType === 'percentage') {
      discountText = `${item.discountValue}%折扣`;
    } else if (item.discountType === 'fixed') {
      discountText = `减免${item.discountValue}元`;
    } else if (item.discountType === 'fixed_price') {
      discountText = `一口价${item.discountValue}元`;
    }
    
    return `
      <div class="detail-fee-item">
        <div class="detail-fee-name">
          <span class="text-xs text-text-muted">${item.feeCategoryName} - ${item.feeTypeName}</span><br>
          ${item.feeName}
        </div>
        <div class="detail-fee-price">
          单位：${item.unit}<br>
          折扣方式：${discountText}${item.remark ? `<br>备注：${item.remark}` : ''}
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
          <div class="detail-label">创建人</div>
          <div class="detail-value">${pkg.createdBy || '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">创建时间</div>
          <div class="detail-value">${pkg.createdAt}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">更新人</div>
          <div class="detail-value">${pkg.updatedBy || '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">更新时间</div>
          <div class="detail-value">${pkg.updatedAt || '-'}</div>
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
  `;
  
  document.getElementById('detailContent').innerHTML = detailHtml;
  document.getElementById('detailModal').style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function applyFilters() {
  const nameFilter = document.getElementById('filterName').value.toLowerCase();
  
  const filteredPackages = packages.filter(pkg => {
    return !nameFilter || pkg.name.toLowerCase().includes(nameFilter);
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
  
  renderPackageTable();
}

document.addEventListener('DOMContentLoaded', init);
