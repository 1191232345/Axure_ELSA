// inboundFeeRuleData 变量由 ../入库费规则/js/inbound-fee-rule-data.js 提供
let feeCategoriesData = null;
let packages = [];
let feeRows = [];
let editingPackageId = null;

const DATA_VERSION = '11.0';

const FEE_TYPE_ENUMS = {
  'cat_1': '卸货费（整柜）',
  'cat_2': '卸货费（散货）',
  'cat_3': 'SKU 超重费（整柜）'
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
  loadInboundFeeRuleData(); // 数据已经通过HTML引用加载
  await loadFeeCategoriesData();
  loadPackages();
  renderFilterOptions();
  renderPackageTable();
}

function renderFilterOptions() {
  // 获取所有创建人和更新人
  const creators = [...new Set(packages.map(pkg => pkg.createdBy).filter(Boolean))];
  const updaters = [...new Set(packages.map(pkg => pkg.updatedBy).filter(Boolean))];
  
  // 填充创建人下拉选项
  const creatorSelect = document.getElementById('filterCreator');
  creatorSelect.innerHTML = '<option value="">请选择创建人</option>';
  creators.forEach(creator => {
    creatorSelect.innerHTML += `<option value="${creator}">${creator}</option>`;
  });
  
  // 填充更新人下拉选项
  const updaterSelect = document.getElementById('filterUpdater');
  updaterSelect.innerHTML = '<option value="">请选择更新人</option>';
  updaters.forEach(updater => {
    updaterSelect.innerHTML += `<option value="${updater}">${updater}</option>`;
  });
}

// 入库费规则数据已经通过HTML引用加载，这里只需要确认
function loadInboundFeeRuleData() {
  // 数据已经通过<script src="../入库费规则/js/inbound-fee-rule-data.js"></script>加载
  // inboundFeeRuleData变量已经存在
  if (typeof inboundFeeRuleData !== 'undefined') {
    console.log('✅ 入库费规则数据已加载');
  } else {
    console.error('❌ 入库费规则数据未加载');
  }
}

async function loadFeeCategoriesData() {
  try {
    const response = await fetch('data/fee-categories.json');
    feeCategoriesData = await response.json();
    console.log('✅ 费用组数据加载成功');
  } catch (error) {
    console.error('❌ 费用组数据加载失败:', error);
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
            feeGroup: '入库',
            feeGroupName: '入库',
            feeType: 'cat_1',
            feeTypeName: '整柜入库',
            unit: '柜',
            unitPrice: 300,
            discountType: 'percentage',
            discountValue: 10,
            expectedAmount: 270,
            remark: '适用于标准集装箱入库'
          },
          { 
            feeGroup: '入库',
            feeGroupName: '入库',
            feeType: 'cat_3',
            feeTypeName: '托盘入库',
            unit: '托',
            unitPrice: 25,
            discountType: 'none',
            discountValue: 0,
            expectedAmount: 25,
            remark: '适用于托盘货物入库'
          }
        ],
        createdBy: '系统管理员',
        createdAt: '2024-01-15 10:30:00',
        updatedBy: '系统管理员',
        updatedAt: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        name: 'VIP客户价卡',
        description: 'VIP客户专属价卡，享受更多折扣',
        feeItems: [
          { 
            feeGroup: '入库',
            feeGroupName: '入库',
            feeType: 'cat_1',
            feeTypeName: '整柜入库',
            unit: '柜',
            unitPrice: 300,
            discountType: 'percentage',
            discountValue: 20,
            expectedAmount: 240,
            remark: 'VIP客户享受20%折扣'
          },
          { 
            feeGroup: '入库',
            feeGroupName: '入库',
            feeType: 'cat_3',
            feeTypeName: '托盘入库',
            unit: '托',
            unitPrice: 25,
            discountType: 'fixed',
            discountValue: -10,
            expectedAmount: 15,
            remark: 'VIP客户每托减少10美元'
          }
        ],
        createdBy: '系统管理员',
        createdAt: '2024-01-16 14:20:00',
        updatedBy: '系统管理员',
        updatedAt: '2024-01-16 14:20:00'
      },
      {
        id: 3,
        name: '一口价价卡',
        description: '固定价格价卡，不随市场波动',
        feeItems: [
          { 
            feeGroup: '入库',
            feeGroupName: '入库',
            feeType: 'cat_1',
            feeTypeName: '整柜入库',
            unit: '柜',
            unitPrice: 300,
            discountType: 'fixed_price',
            discountValue: 250,
            expectedAmount: 250,
            remark: '一口价，不受市场波动影响'
          }
        ],
        createdBy: '系统管理员',
        createdAt: '2024-01-17 09:15:00',
        updatedBy: '系统管理员',
        updatedAt: '2024-01-17 09:15:00'
      }
    ];
    savePackages();
  }
}

function savePackages() {
  localStorage.setItem('packages', JSON.stringify(packages));
  localStorage.setItem('packagesVersion', DATA_VERSION);
}

function getFeeTypes(category = 'inbound') {
  // 如果是入库费，使用入库费规则数据
  if (category === 'inbound' && inboundFeeRuleData && inboundFeeRuleData.categories) {
    return inboundFeeRuleData.categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  }
  
  // 其他费用组，使用fee-categories.json数据
  if (feeCategoriesData && feeCategoriesData.feeCategories && feeCategoriesData.feeCategories[category]) {
    const categoryData = feeCategoriesData.feeCategories[category];
    return categoryData.categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  }
  
  return [];
}

// 根据费用组获取费用类型
function getFeeTypesByGroup(feeGroup) {
  // 如果是入库，使用入库费规则数据
  if (feeGroup === '入库' && inboundFeeRuleData && inboundFeeRuleData.categories) {
    return inboundFeeRuleData.categories.map(cat => {
      // 获取单位：从第一个子项中获取
      let unit = '-';
      let price = 0;
      
      if (cat.children && cat.children.length > 0) {
        const firstOperation = cat.children[0];
        if (firstOperation.children && firstOperation.children.length > 0) {
          const firstRule = firstOperation.children[0];
          unit = firstRule.unit || '-';
          
          // 获取单价：从 pricingRules 中获取第一个规格的价格
          if (firstRule.pricingRules && firstRule.pricingRules.length > 0) {
            price = firstRule.pricingRules[0].price || 0;
          }
        }
      }
      
      return {
        id: cat.id,
        name: cat.name,
        unit,
        price
      };
    });
  }
  
  // 其他费用组，暂时返回空数组（后续可以扩展）
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
  
  // 其他费用组，使用fee-categories.json数据
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
    feeGroup: '',
    feeType: '',
    unitPrice: 0,
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
    
    // 当费用组改变时，清空费用类型和单价
    if (field === 'feeGroup') {
      row.feeType = '';
      row.unitPrice = 0;
    }
    
    // 当费用类型改变时，自动设置单价
    if (field === 'feeType') {
      const feeTypes = getFeeTypesByGroup(row.feeGroup);
      const selectedType = feeTypes.find(type => type.id === value);
      if (selectedType && selectedType.price) {
        row.unitPrice = selectedType.price;
      } else {
        row.unitPrice = 0;
      }
    }
    
    // 当折扣方式改变时，重置折扣金额
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
        <td colspan="9" class="px-4 py-8 text-center text-text-muted">
          <i class="fas fa-inbox text-2xl mb-2"></i>
          <p>暂无费用项，请点击"新增行"添加</p>
        </td>
      </tr>
    `;
    return;
  }
  
  // 获取费用组选项（与入库费规则一致）
  const feeGroups = [
    { id: '入库', name: '入库' },
    { id: '出库', name: '出库' },
    { id: '仓储', name: '仓储' },
    { id: '其他', name: '其他' }
  ];
  
  tbody.innerHTML = feeRows.map(row => {
    // 费用组下拉选项
    const feeGroupOptions = feeGroups.map(group => 
      `<option value="${group.id}" ${row.feeGroup === group.id ? 'selected' : ''}>
        ${group.name}
      </option>`
    ).join('');
    
    // 费用类型下拉选项（根据费用组获取）
    const feeTypes = row.feeGroup ? getFeeTypesByGroup(row.feeGroup) : [];
    const feeTypeOptions = feeTypes.map(type => 
      `<option value="${type.id}" ${row.feeType === type.id ? 'selected' : ''}>
        ${type.name}
      </option>`
    ).join('');
    
    // 计费单位自动填充（从费用类型数据中获取）
    const selectedType = feeTypes.find(type => type.id === row.feeType);
    const unitDisplay = selectedType ? (selectedType.unit || '-') : '-';
    
    // 单价自动填充（从费用类型数据中获取）
    const unitPriceValue = selectedType ? (selectedType.price || 0) : 0;
    const unitPriceDisplay = unitPriceValue > 0 ? `${unitPriceValue.toFixed(2)}$` : '-';
    
    // 计算预计金额（使用row.unitPrice，如果没有则使用从费用类型获取的单价）
    let expectedAmount = 0;
    const unitPrice = row.unitPrice || unitPriceValue || 0;
    
    if (row.discountType === 'none') {
      expectedAmount = unitPrice;
    } else if (row.discountType === 'percentage') {
      expectedAmount = unitPrice * (1 - (row.discountValue || 0) / 100);
    } else if (row.discountType === 'fixed') {
      // 指定增减：使用加法运算
      // 输入负数：原金额 + 负数 = 减少
      // 输入正数：原金额 + 正数 = 增加
      expectedAmount = unitPrice + (row.discountValue || 0);
    } else if (row.discountType === 'fixed_price') {
      expectedAmount = row.discountValue || 0;
    }
    
    const expectedAmountDisplay = expectedAmount !== 0 ? `${expectedAmount.toFixed(2)}$` : '-';
    
    const discountTypeOptions = `
      <option value="none" ${row.discountType === 'none' ? 'selected' : ''}>无折扣</option>
      <option value="percentage" ${row.discountType === 'percentage' ? 'selected' : ''}>百分比</option>
      <option value="fixed" ${row.discountType === 'fixed' ? 'selected' : ''}>指定增减</option>
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
          <input type="number" value="${row.discountValue || ''}" step="0.01"
                 onchange="updateFeeRow(${row.id}, 'discountValue', parseFloat(this.value) || 0)"
                 class="form-input text-sm w-24" placeholder="增减金额">
          <span class="text-sm text-text-secondary">$</span>
        </div>
      `;
    } else if (row.discountType === 'fixed_price') {
      discountValueInput = `
        <div class="flex items-center gap-1">
          <input type="number" value="${row.discountValue || ''}" min="0" step="0.01"
                 onchange="updateFeeRow(${row.id}, 'discountValue', parseFloat(this.value) || 0)"
                 class="form-input text-sm w-24" placeholder="一口价">
          <span class="text-sm text-text-secondary">$</span>
        </div>
      `;
    }
    
    return `
      <tr class="hover:bg-hover transition-colors">
        <td class="px-4 py-3">
          <select onchange="updateFeeRow(${row.id}, 'feeGroup', this.value)" 
                  class="form-input text-sm">
            <option value="">请选择费用组</option>
            ${feeGroupOptions}
          </select>
        </td>
        <td class="px-4 py-3">
          <select onchange="updateFeeRow(${row.id}, 'feeType', this.value)" 
                  class="form-input text-sm" ${!row.feeGroup ? 'disabled' : ''}>
            <option value="">请选择费用类型</option>
            ${feeTypeOptions}
          </select>
        </td>
        <td class="px-4 py-3">
          <div class="text-sm text-text-secondary">${unitDisplay}</div>
        </td>
        <td class="px-4 py-3">
          <div class="text-sm text-text-secondary">${unitPriceDisplay}</div>
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
          <div class="text-sm font-semibold text-accent">${expectedAmountDisplay}</div>
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
      const key = item.feeGroupName || '入库';
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
            <button class="action-btn action-btn-delete" onclick="deletePackage(${pkg.id})">
              <i class="fas fa-trash mr-1"></i>删除
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
  
  document.getElementById('modalTitleText').textContent = '创建价卡';
  document.getElementById('packageForm').reset();
  
  renderFeeTable();
  document.getElementById('packageModal').classList.add('active');
}

function closeModal() {
  document.getElementById('packageModal').classList.remove('active');
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
  
  const validFeeRows = feeRows.filter(row => row.feeType);
  if (validFeeRows.length === 0) {
    alert('请至少选择一个费用类型');
    return;
  }
  
  const feeItems = validFeeRows.map(row => {
    // 获取费用组名称
    const feeGroupName = row.feeGroup || '入库';
    
    // 获取费用类型名称和单位
    let feeTypeName = '';
    let unit = '';
    
    if (row.feeGroup === '入库' && inboundFeeRuleData && inboundFeeRuleData.categories) {
      // 入库使用入库费规则数据
      const category = inboundFeeRuleData.categories.find(cat => cat.id === row.feeType);
      if (category) {
        feeTypeName = category.name;
        // 从第一个子项中获取单位作为默认单位
        if (category.children && category.children.length > 0 && category.children[0].children) {
          unit = category.children[0].children[0].unit || '-';
        }
      }
    }
    
    // 使用用户输入的单价
    const unitPrice = row.unitPrice || 0;
    
    // 计算预计金额
    let expectedAmount = 0;
    if (unitPrice > 0) {
      if (row.discountType === 'none') {
        expectedAmount = unitPrice;
      } else if (row.discountType === 'percentage') {
        expectedAmount = unitPrice * (1 - (row.discountValue || 0) / 100);
      } else if (row.discountType === 'fixed') {
        expectedAmount = Math.max(0, unitPrice - (row.discountValue || 0));
      } else if (row.discountType === 'fixed_price') {
        expectedAmount = row.discountValue || 0;
      }
    }
    
    return {
      feeGroup: row.feeGroup || '入库',
      feeGroupName,
      feeType: row.feeType,
      feeTypeName,
      unit,
      unitPrice,
      discountType: row.discountType,
      discountValue: row.discountValue || 0,
      expectedAmount,
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
    feeGroup: item.feeGroup || '入库',
    feeType: item.feeType,
    unitPrice: item.unitPrice || 0,
    discountType: item.discountType || 'none',
    discountValue: item.discountValue || 0,
    remark: item.remark || ''
  }));
  
  document.getElementById('modalTitleText').textContent = '编辑价卡';
  document.getElementById('packageName').value = pkg.name;
  document.getElementById('packageDescription').value = pkg.description;
  
  renderFeeTable();
  
  document.getElementById('packageModal').classList.add('active');
}

function viewPackage(packageId) {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return;
  
  const feeItemsHtml = pkg.feeItems.map(item => {
    let discountText = '无折扣';
    
    if (item.discountType === 'percentage') {
      discountText = `${item.discountValue}%折扣`;
    } else if (item.discountType === 'fixed') {
      if (item.discountValue < 0) {
        discountText = `减少${Math.abs(item.discountValue)}$`;
      } else {
        discountText = `增加${item.discountValue}$`;
      }
    } else if (item.discountType === 'fixed_price') {
      discountText = `一口价${item.discountValue}$`;
    }
    
    return `
      <div class="detail-fee-item">
        <div class="detail-fee-name">
          <span class="text-xs text-text-muted">${item.feeGroupName || '入库'}</span><br>
          <span class="font-semibold">${item.feeTypeName}</span>
        </div>
        <div class="detail-fee-price">
          计费单位：${item.unit}<br>
          单价：${item.unitPrice ? item.unitPrice.toFixed(2) + '$' : '-'}<br>
          折扣方式：${discountText}<br>
          预计金额：<span class="font-semibold text-accent">${item.expectedAmount ? item.expectedAmount.toFixed(2) + '$' : '-'}</span>${item.remark ? `<br>备注：${item.remark}` : ''}
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
        <span class="text-xs text-text-muted ml-2 font-normal">（引用入库费规则）</span>
      </h4>
      <div class="detail-fee-list">
        ${feeItemsHtml}
      </div>
    </div>
  `;
  
  document.getElementById('detailContent').innerHTML = detailHtml;
  document.getElementById('detailModal').classList.add('active');
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}

function deletePackage(packageId) {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return;
  
  // 弹出确认对话框
  const confirmed = confirm(`确定要删除价卡"${pkg.name}"吗？\n删除后无法恢复。`);
  
  if (confirmed) {
    // 删除价卡
    packages = packages.filter(p => p.id !== packageId);
    savePackages();
    renderPackageTable();
    
    alert('价卡删除成功！');
  }
}

function applyFilters() {
  const nameFilter = document.getElementById('filterName').value.toLowerCase();
  const creatorFilter = document.getElementById('filterCreator').value;
  const updaterFilter = document.getElementById('filterUpdater').value;
  const createTimeStart = document.getElementById('filterCreateTimeStart').value;
  const createTimeEnd = document.getElementById('filterCreateTimeEnd').value;
  const updateTimeStart = document.getElementById('filterUpdateTimeStart').value;
  const updateTimeEnd = document.getElementById('filterUpdateTimeEnd').value;
  
  const filteredPackages = packages.filter(pkg => {
    // 价卡名称筛选
    if (nameFilter && !pkg.name.toLowerCase().includes(nameFilter)) {
      return false;
    }
    
    // 创建人筛选
    if (creatorFilter && pkg.createdBy !== creatorFilter) {
      return false;
    }
    
    // 更新人筛选
    if (updaterFilter && pkg.updatedBy !== updaterFilter) {
      return false;
    }
    
    // 创建时间范围筛选
    if (createTimeStart || createTimeEnd) {
      const pkgCreateTime = new Date(pkg.createdAt);
      if (createTimeStart && pkgCreateTime < new Date(createTimeStart)) {
        return false;
      }
      if (createTimeEnd && pkgCreateTime > new Date(createTimeEnd)) {
        return false;
      }
    }
    
    // 更新时间范围筛选
    if (updateTimeStart || updateTimeEnd) {
      const pkgUpdateTime = new Date(pkg.updatedAt);
      if (updateTimeStart && pkgUpdateTime < new Date(updateTimeStart)) {
        return false;
      }
      if (updateTimeEnd && pkgUpdateTime > new Date(updateTimeEnd)) {
        return false;
      }
    }
    
    return true;
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
  document.getElementById('filterCreator').value = '';
  document.getElementById('filterUpdater').value = '';
  document.getElementById('filterCreateTimeStart').value = '';
  document.getElementById('filterCreateTimeEnd').value = '';
  document.getElementById('filterUpdateTimeStart').value = '';
  document.getElementById('filterUpdateTimeEnd').value = '';
  
  renderPackageTable();
}

document.addEventListener('DOMContentLoaded', init);
