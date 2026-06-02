let packages = [];
let inboundFeeRuleData = null;

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
            unit: '柜',
            discountType: 'percentage',
            discountValue: 10
          }
        ],
        customers: [
          { id: 'cust_1', name: '华为技术有限公司' },
          { id: 'cust_2', name: '小米科技有限公司' }
        ],
        warehouses: [
          { id: 'wh_1', name: '深圳仓库' },
          { id: 'wh_2', name: '广州仓库' }
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

function getFeeItemDetails(feeId) {
  if (!inboundFeeRuleData || !inboundFeeRuleData.categories) {
    return null;
  }
  
  for (const category of inboundFeeRuleData.categories) {
    for (const operation of category.children) {
      if (operation.children && operation.children.length > 0) {
        const rule = operation.children.find(r => r.id === feeId);
        if (rule) {
          return {
            ...rule,
            feeCategory: 'inbound',
            feeCategoryName: category.name,
            feeType: category.id,
            feeTypeName: category.name,
            feeId: rule.id,
            feeName: rule.subCategory ? `${rule.feeItem} - ${rule.subCategory}` : rule.feeItem,
            unit: rule.unit,
            operation: operation.name
          };
        }
      }
    }
  }
  
  return null;
}