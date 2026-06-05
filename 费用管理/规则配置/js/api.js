const DATA_VERSION = '3.1.0';

let customers = [];
let warehouses = [];
let priceCards = [];
let ruleConfigs = [];
let feeCategoriesData = null;

const FEE_CATEGORIES = {
  inbound: { name: '入库费', icon: 'fa-download' }
};

async function initApi() {
  await loadFeeCategories();
  await loadCustomers();
  await loadWarehouses();
  await loadPriceCards();
  await loadRuleConfigs();
}

async function loadFeeCategories() {
  try {
    const response = await fetch('../价卡管理/data/fee-categories.json');
    feeCategoriesData = await response.json();
    console.log('✅ 费用类型分类数据加载成功');
  } catch (error) {
    console.error('❌ 费用类型分类数据加载失败:', error);
    feeCategoriesData = {
      feeCategories: {
        inbound: { name: '入库费', icon: 'fa-download', categories: [] },
        outbound: { name: '出库费', icon: 'fa-upload', categories: [] },
        storage: { name: '仓储费', icon: 'fa-warehouse', categories: [] },
        express: { name: '快递费', icon: 'fa-truck', categories: [] },
        other: { name: '其他费用', icon: 'fa-ellipsis-h', categories: [] }
      }
    };
  }
}

function getFeeCategoriesForUI() {
  if (!feeCategoriesData || !feeCategoriesData.feeCategories) return {};
  return feeCategoriesData.feeCategories;
}

function getFeeItemsByCategory(categoryKey) {
  if (!feeCategoriesData || !feeCategoriesData.feeCategories) return [];
  const category = feeCategoriesData.feeCategories[categoryKey];
  if (!category || !category.categories) return [];
  
  var items = [];
  category.categories.forEach(function(subCat) {
    if (subCat.feeItems) {
      subCat.feeItems.forEach(function(feeItem) {
        items.push({
          id: feeItem.id,
          name: feeItem.name,
          price: feeItem.price,
          unit: feeItem.unit,
          description: feeItem.description,
          sub_category: subCat.name,
          category_key: categoryKey,
          category_name: category.name
        });
      });
    }
  });
  return items;
}

function getAllFeeItems() {
  var allItems = [];
  var categories = getFeeCategoriesForUI();
  Object.keys(categories).forEach(function(key) {
    var items = getFeeItemsByCategory(key);
    allItems = allItems.concat(items);
  });
  return allItems;
}

async function loadCustomers() {
  try {
    var storedVersion = localStorage.getItem('customersVersion');
    var stored = localStorage.getItem('customers');
    
    if (stored && storedVersion === DATA_VERSION) {
      customers = JSON.parse(stored);
    } else {
      customers = [
        { id: 'C001', name: 'DEMO客户001', code: 'DEMO_C001', status: 1, created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00' },
        { id: 'C002', name: 'DEMO客户002', code: 'DEMO_C002', status: 1, created_at: '2024-01-02 10:00:00', updated_at: '2024-01-02 10:00:00' },
        { id: 'C003', name: 'DEMO客户003', code: 'DEMO_C003', status: 1, created_at: '2024-01-03 10:00:00', updated_at: '2024-01-03 10:00:00' },
        { id: 'C004', name: 'DEMO客户004', code: 'DEMO_C004', status: 1, created_at: '2024-01-04 10:00:00', updated_at: '2024-01-04 10:00:00' },
        { id: 'C005', name: 'DEMO客户005', code: 'DEMO_C005', status: 1, created_at: '2024-01-05 10:00:00', updated_at: '2024-01-05 10:00:00' }
      ];
      saveCustomers();
    }
    console.log('✅ 客户数据加载成功');
    return customers;
  } catch (error) {
    console.error('❌ 客户数据加载失败:', error);
    return [];
  }
}

function saveCustomers() {
  localStorage.setItem('customers', JSON.stringify(customers));
  localStorage.setItem('customersVersion', DATA_VERSION);
}

async function loadWarehouses() {
  try {
    var storedVersion = localStorage.getItem('warehousesVersion');
    var stored = localStorage.getItem('warehouses');
    
    if (stored && storedVersion === DATA_VERSION) {
      warehouses = JSON.parse(stored);
    } else {
      warehouses = [
        { id: 'W001', name: 'DEMO仓库001', code: 'DEMO_W001', location: 'DEMO地区001', status: 1, created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00' },
        { id: 'W002', name: 'DEMO仓库002', code: 'DEMO_W002', location: 'DEMO地区002', status: 1, created_at: '2024-01-02 10:00:00', updated_at: '2024-01-02 10:00:00' },
        { id: 'W003', name: 'DEMO仓库003', code: 'DEMO_W003', location: 'DEMO地区003', status: 1, created_at: '2024-01-03 10:00:00', updated_at: '2024-01-03 10:00:00' },
        { id: 'W004', name: 'DEMO仓库004', code: 'DEMO_W004', location: 'DEMO地区004', status: 1, created_at: '2024-01-04 10:00:00', updated_at: '2024-01-04 10:00:00' },
        { id: 'W005', name: 'DEMO仓库005', code: 'DEMO_W005', location: 'DEMO地区005', status: 1, created_at: '2024-01-05 10:00:00', updated_at: '2024-01-05 10:00:00' }
      ];
      saveWarehouses();
    }
    console.log('✅ 仓库数据加载成功');
    return warehouses;
  } catch (error) {
    console.error('❌ 仓库数据加载失败:', error);
    return [];
  }
}

function saveWarehouses() {
  localStorage.setItem('warehouses', JSON.stringify(warehouses));
  localStorage.setItem('warehousesVersion', DATA_VERSION);
}

async function loadPriceCards() {
  try {
    var storedVersion = localStorage.getItem('priceCardsVersion');
    var stored = localStorage.getItem('priceCards');
    
    if (stored && storedVersion === DATA_VERSION) {
      priceCards = JSON.parse(stored);
    } else {
      priceCards = [
        {
          id: 'PC001',
          name: 'VIP客户折扣方案',
          business_type: 'all',
          fee_discounts: {
            inbound: [
              { fee_item_id: 'unload_fee', fee_item_name: '卸货费', unit: '柜', discount_type: 'percentage', discount_value: 15, discount_description: '入库费额外5%折扣' },
              { fee_item_id: 'express_receive_fee', fee_item_name: '收货费', unit: '件', discount_type: 'fixed', discount_value: 2, discount_description: '收货费减免2元' },
              { fee_item_id: 'pallet_receive_fee', fee_item_name: '收货费', unit: '托', discount_type: 'percentage', discount_value: 10, discount_description: '托盘收货9折' }
            ],
            outbound: [
              { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'percentage', discount_value: 10, discount_description: '拣货费9折' },
              { fee_item_id: 'bulk_pick_fee', fee_item_name: '批量拣货费', unit: '件', discount_type: 'percentage', discount_value: 12, discount_description: '批量拣货88折' }
            ],
            storage: [
              { fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 10, discount_description: '仓储费9折' }
            ],
            express: [
              { fee_item_id: 'domestic_standard', fee_item_name: '标准快递费', unit: '件', discount_type: 'percentage', discount_value: 8, discount_description: '快递费92折' }
            ],
            other: []
          },
          adjustments: [
            { type: 'add', name: '紧急处理费', amount: 100, description: '紧急订单处理附加费' }
          ],
          status: 1,
          created_at: '2024-01-01 10:00:00',
          updated_at: '2024-01-01 10:00:00'
        },
        {
          id: 'PC002',
          name: '标准客户折扣方案',
          business_type: 'all',
          fee_discounts: {
            inbound: [
              { fee_item_id: 'unload_fee', fee_item_name: '卸货费', unit: '柜', discount_type: 'percentage', discount_value: 5, discount_description: '入库费标准折扣' },
              { fee_item_id: 'express_receive_fee', fee_item_name: '收货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '收货费标准折扣' }
            ],
            outbound: [
              { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '拣货费标准折扣' }
            ],
            storage: [
              { fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 5, discount_description: '仓储费标准折扣' }
            ],
            express: [],
            other: []
          },
          adjustments: [],
          status: 1,
          created_at: '2024-01-02 10:00:00',
          updated_at: '2024-01-02 10:00:00'
        },
        {
          id: 'PC003',
          name: '出库折扣方案',
          business_type: 'outbound',
          fee_discounts: {
            inbound: [],
            outbound: [
              { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'fixed', discount_value: 2, discount_description: '拣货费减免2元' },
              { fee_item_id: 'pack_fee', fee_item_name: '打包费', unit: '件', discount_type: 'percentage', discount_value: 10, discount_description: '打包费9折' }
            ],
            storage: [],
            express: [],
            other: []
          },
          adjustments: [],
          status: 1,
          created_at: '2024-01-03 10:00:00',
          updated_at: '2024-01-03 10:00:00'
        },
        {
          id: 'PC004',
          name: '转仓折扣方案',
          business_type: 'transfer',
          fee_discounts: {
            inbound: [],
            outbound: [],
            storage: [
              { fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 15, discount_description: '仓储费85折' }
            ],
            express: [],
            other: []
          },
          adjustments: [
            { type: 'subtract', name: '批量转仓优惠', amount: 200, description: '批量转仓减收200元' }
          ],
          status: 1,
          created_at: '2024-01-04 10:00:00',
          updated_at: '2024-01-04 10:00:00'
        }
      ];
      savePriceCards();
    }
    console.log('✅ 价卡数据加载成功');
    return priceCards;
  } catch (error) {
    console.error('❌ 价卡数据加载失败:', error);
    return [];
  }
}

function savePriceCards() {
  localStorage.setItem('priceCards', JSON.stringify(priceCards));
  localStorage.setItem('priceCardsVersion', DATA_VERSION);
}

async function loadRuleConfigs() {
  try {
    var storedVersion = localStorage.getItem('ruleConfigsVersion');
    var stored = localStorage.getItem('ruleConfigs');
    
    if (stored && storedVersion === DATA_VERSION) {
      ruleConfigs = JSON.parse(stored);
    } else {
      ruleConfigs = [
        {
          id: 'RC001',
          name: 'DEMO客户001-DEMO仓库001规则配置',
          customer_id: 'C001',
          customer_name: 'DEMO客户001',
          warehouse_id: 'W001',
          warehouse_name: 'DEMO仓库001',
          price_card_id: 'PC001',
          price_card_name: 'VIP客户折扣方案',
          business_type: 'all',
          fee_discounts: {
            inbound: [
              { fee_item_id: 'unload_fee', fee_item_name: '卸货费', unit: '柜', discount_type: 'percentage', discount_value: 15, discount_description: '入库费额外5%折扣' },
              { fee_item_id: 'express_receive_fee', fee_item_name: '收货费', unit: '件', discount_type: 'fixed', discount_value: 3, discount_description: '收货费减免3元（微调）' },
              { fee_item_id: 'pallet_receive_fee', fee_item_name: '收货费', unit: '托', discount_type: 'percentage', discount_value: 10, discount_description: '托盘收货9折' }
            ],
            outbound: [
              { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'percentage', discount_value: 12, discount_description: '拣货费88折（微调）' },
              { fee_item_id: 'bulk_pick_fee', fee_item_name: '批量拣货费', unit: '件', discount_type: 'percentage', discount_value: 12, discount_description: '批量拣货88折' }
            ],
            storage: [
              { fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 12, discount_description: '仓储费88折（微调）' }
            ],
            express: [
              { fee_item_id: 'domestic_standard', fee_item_name: '标准快递费', unit: '件', discount_type: 'percentage', discount_value: 8, discount_description: '快递费92折' }
            ],
            other: []
          },
          adjustments: [
            { type: 'add', name: '紧急处理费', amount: 100, description: '紧急订单处理附加费' }
          ],
          is_adjusted: true,
          effective_start_time: '2024-01-01 00:00:00',
          effective_end_time: '2024-12-31 23:59:59',
          created_by: 'DEMO管理员',
          created_at: '2024-01-01 10:00:00',
          updated_at: '2024-01-01 10:00:00'
        },
        {
          id: 'RC002',
          name: 'DEMO客户002-DEMO仓库002规则配置',
          customer_id: 'C002',
          customer_name: 'DEMO客户002',
          warehouse_id: 'W002',
          warehouse_name: 'DEMO仓库002',
          price_card_id: 'PC002',
          price_card_name: '标准客户折扣方案',
          business_type: 'all',
          fee_discounts: {
            inbound: [
              { fee_item_id: 'unload_fee', fee_item_name: '卸货费', unit: '柜', discount_type: 'percentage', discount_value: 6, discount_description: '入库费微调折扣' },
              { fee_item_id: 'express_receive_fee', fee_item_name: '收货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '收货费标准折扣' }
            ],
            outbound: [
              { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '拣货费标准折扣' }
            ],
            storage: [
              { fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 5, discount_description: '仓储费标准折扣' }
            ],
            express: [],
            other: []
          },
          adjustments: [],
          is_adjusted: true,
          effective_start_time: '2024-01-15 00:00:00',
          effective_end_time: '2024-06-30 23:59:59',
          created_by: 'DEMO管理员',
          created_at: '2024-01-15 10:00:00',
          updated_at: '2024-01-15 10:00:00'
        },
        {
          id: 'RC003',
          name: 'DEMO客户003-DEMO仓库003规则配置',
          customer_id: 'C003',
          customer_name: 'DEMO客户003',
          warehouse_id: 'W003',
          warehouse_name: 'DEMO仓库003',
          price_card_id: 'PC003',
          price_card_name: '出库折扣方案',
          business_type: 'outbound',
          fee_discounts: {
            inbound: [],
            outbound: [
              { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'fixed', discount_value: 2, discount_description: '拣货费减免2元' },
              { fee_item_id: 'pack_fee', fee_item_name: '打包费', unit: '件', discount_type: 'percentage', discount_value: 10, discount_description: '打包费9折' }
            ],
            storage: [],
            express: [],
            other: []
          },
          adjustments: [],
          is_adjusted: false,
          effective_start_time: '2024-02-01 00:00:00',
          effective_end_time: '2024-12-31 23:59:59',
          created_by: 'DEMO管理员',
          created_at: '2024-02-01 10:00:00',
          updated_at: '2024-02-01 10:00:00'
        },
        {
          id: 'RC004',
          name: 'DEMO客户004-DEMO仓库004规则配置',
          customer_id: 'C004',
          customer_name: 'DEMO客户004',
          warehouse_id: 'W004',
          warehouse_name: 'DEMO仓库004',
          price_card_id: 'PC004',
          price_card_name: '转仓折扣方案',
          business_type: 'transfer',
          fee_discounts: {
            inbound: [],
            outbound: [],
            storage: [
              { fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 15, discount_description: '仓储费85折' }
            ],
            express: [],
            other: []
          },
          adjustments: [
            { type: 'subtract', name: '批量转仓优惠', amount: 200, description: '批量转仓减收200元' }
          ],
          is_adjusted: false,
          effective_start_time: '2024-03-01 00:00:00',
          effective_end_time: '2024-09-30 23:59:59',
          created_by: 'DEMO管理员',
          created_at: '2024-03-01 10:00:00',
          updated_at: '2024-03-01 10:00:00'
        }
      ];
      saveRuleConfigs();
    }
    console.log('✅ 规则配置数据加载成功');
    return ruleConfigs;
  } catch (error) {
    console.error('❌ 规则配置数据加载失败:', error);
    return [];
  }
}

function saveRuleConfigs() {
  localStorage.setItem('ruleConfigs', JSON.stringify(ruleConfigs));
  localStorage.setItem('ruleConfigsVersion', DATA_VERSION);
}

function getCustomerById(customerId) {
  return customers.find(function(c) { return c.id === customerId; });
}

function getWarehouseById(warehouseId) {
  return warehouses.find(function(w) { return w.id === warehouseId; });
}

function getPriceCardById(priceCardId) {
  return priceCards.find(function(p) { return p.id === priceCardId; });
}

function getRuleConfigById(ruleConfigId) {
  return ruleConfigs.find(function(r) { return r.id === ruleConfigId; });
}

function createRuleConfig(ruleConfigData) {
  var newRuleConfig = {
    id: generateId('RC'),
    ...ruleConfigData,
    created_at: getCurrentDateTime(),
    updated_at: getCurrentDateTime()
  };
  ruleConfigs.push(newRuleConfig);
  saveRuleConfigs();
  return newRuleConfig;
}

function updateRuleConfig(ruleConfigId, ruleConfigData) {
  var index = ruleConfigs.findIndex(function(r) { return r.id === ruleConfigId; });
  if (index !== -1) {
    ruleConfigs[index] = {
      ...ruleConfigs[index],
      ...ruleConfigData,
      created_at: ruleConfigs[index].created_at,
      created_by: ruleConfigs[index].created_by,
      updated_at: getCurrentDateTime()
    };
    saveRuleConfigs();
    return ruleConfigs[index];
  }
  return null;
}

function deleteRuleConfig(ruleConfigId) {
  var index = ruleConfigs.findIndex(function(r) { return r.id === ruleConfigId; });
  if (index !== -1) {
    ruleConfigs.splice(index, 1);
    saveRuleConfigs();
    return true;
  }
  return false;
}

function getActiveCustomers() {
  return customers.filter(function(c) { return c.status === 1; });
}

function getActiveWarehouses() {
  return warehouses.filter(function(w) { return w.status === 1; });
}

function getActivePriceCards() {
  return priceCards.filter(function(p) { return p.status === 1; });
}

function getActiveRuleConfigs() {
  return ruleConfigs.filter(function(r) { return !r.effective_end_time || new Date(r.effective_end_time) > new Date(); });
}

function checkUniqueConfig(customerId, warehouseId, excludeId) {
  if (!excludeId) excludeId = null;
  var existing = ruleConfigs.find(function(r) {
    return r.customer_id === customerId &&
      r.warehouse_id === warehouseId &&
      r.id !== excludeId &&
      (!r.effective_end_time || new Date(r.effective_end_time) > new Date());
  });
  return !existing;
}

function getExistingConfig(customerId, warehouseId) {
  return ruleConfigs.find(function(r) {
    return r.customer_id === customerId &&
      r.warehouse_id === warehouseId &&
      (!r.effective_end_time || new Date(r.effective_end_time) > new Date());
  });
}

window.initApi = initApi;
window.loadFeeCategories = loadFeeCategories;
window.getFeeCategoriesForUI = getFeeCategoriesForUI;
window.getFeeItemsByCategory = getFeeItemsByCategory;
window.getAllFeeItems = getAllFeeItems;
window.loadCustomers = loadCustomers;
window.loadWarehouses = loadWarehouses;
window.loadPriceCards = loadPriceCards;
window.loadRuleConfigs = loadRuleConfigs;
window.getCustomerById = getCustomerById;
window.getWarehouseById = getWarehouseById;
window.getPriceCardById = getPriceCardById;
window.getRuleConfigById = getRuleConfigById;
window.createRuleConfig = createRuleConfig;
window.updateRuleConfig = updateRuleConfig;
window.deleteRuleConfig = deleteRuleConfig;
window.getActiveCustomers = getActiveCustomers;
window.getActiveWarehouses = getActiveWarehouses;
window.getActivePriceCards = getActivePriceCards;
window.getActiveRuleConfigs = getActiveRuleConfigs;
window.checkUniqueConfig = checkUniqueConfig;
window.getExistingConfig = getExistingConfig;
window.FEE_CATEGORIES = FEE_CATEGORIES;
