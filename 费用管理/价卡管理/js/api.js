let packages = [];
let inboundFeeRuleData = null;
let feeCategoriesData = null;

async function loadInboundFeeRuleData() {
  try {
    const response = await fetch('../入库费规则/data/inbound-fee-rule-data.json');
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
        name: '综合服务价卡',
        description: '包含入库、出库、快递及其他收费服务',
        feeItems: [
          { 
            feeCategory: 'inbound',
            feeCategoryName: '入库费',
            feeType: 'inbound_full_container',
            feeTypeName: '整柜入库',
            feeId: 'unload_fee', 
            feeName: '卸货费',
            unit: '柜',
            discountType: 'percentage',
            discountValue: 10,
            remark: '适用于标准集装箱'
          },
          { 
            feeCategory: 'outbound',
            feeCategoryName: '出库费',
            feeType: 'outbound_standard',
            feeTypeName: '标准出库',
            feeId: 'pick_fee', 
            feeName: '拣货费',
            unit: '件',
            discountType: 'percentage',
            discountValue: 5,
            remark: ''
          },
          { 
            feeCategory: 'express',
            feeCategoryName: '快递费',
            feeType: 'express_domestic',
            feeTypeName: '国内快递',
            feeId: 'domestic_standard', 
            feeName: '标准快递费',
            unit: '件',
            discountType: 'fixed',
            discountValue: 2,
            remark: '每件减免2元'
          },
          { 
            feeCategory: 'other',
            feeCategoryName: '其他收费',
            feeType: 'other_service',
            feeTypeName: '增值服务',
            feeId: 'photo_fee', 
            feeName: '拍照费',
            unit: '张',
            discountType: 'none',
            discountValue: 0,
            remark: ''
          }
        ],
        createdBy: '张三',
        createdAt: '2024-01-15 10:30:00',
        updatedBy: '李四',
        updatedAt: '2024-01-20 14:20:00'
      },
      {
        id: 2,
        name: '入库专用价卡',
        description: '仅包含入库相关费用',
        feeItems: [
          { 
            feeCategory: 'inbound',
            feeCategoryName: '入库费',
            feeType: 'inbound_express',
            feeTypeName: '快递散货入库',
            feeId: 'express_receive_fee', 
            feeName: '收货费',
            unit: '件',
            discountType: 'percentage',
            discountValue: 15,
            remark: ''
          },
          { 
            feeCategory: 'inbound',
            feeCategoryName: '入库费',
            feeType: 'inbound_pallet',
            feeTypeName: '托盘入库',
            feeId: 'pallet_receive_fee', 
            feeName: '收货费',
            unit: '托',
            discountType: 'fixed_price',
            discountValue: 45,
            remark: '每托固定价格'
          }
        ],
        createdBy: '王五',
        createdAt: '2024-02-01 09:00:00',
        updatedBy: '王五',
        updatedAt: '2024-02-01 09:00:00'
      },
      {
        id: 3,
        name: '出库快递组合价卡',
        description: '包含出库和快递费用组合',
        feeItems: [
          { 
            feeCategory: 'outbound',
            feeCategoryName: '出库费',
            feeType: 'outbound_bulk',
            feeTypeName: '批量出库',
            feeId: 'bulk_pick_fee', 
            feeName: '批量拣货费',
            unit: '件',
            discountType: 'percentage',
            discountValue: 20,
            remark: '批量出库优惠'
          },
          { 
            feeCategory: 'express',
            feeCategoryName: '快递费',
            feeType: 'express_international',
            feeTypeName: '国际快递',
            feeId: 'international_standard', 
            feeName: '国际标准快递费',
            unit: '件',
            discountType: 'fixed',
            discountValue: 10,
            remark: '国际快递每件减免10元'
          }
        ],
        createdBy: '赵六',
        createdAt: '2024-03-10 14:20:00',
        updatedBy: '张三',
        updatedAt: '2024-03-15 16:45:00'
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