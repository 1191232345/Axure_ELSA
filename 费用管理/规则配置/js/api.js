// api.js - 数据访问层（CRUD + localStorage 持久化）
// 测试数据生成已拆分到 test-data.js

let customers = [];
let warehouses = [];
let priceCards = [];
let ruleConfigs = [];
let feeCategoriesData = null;

const FEE_CATEGORIES = {
  inbound: { name: '入库费', icon: 'fa-download' },
  storage: { name: '仓储费', icon: 'fa-warehouse' },
  outbound_onepiece: { name: '出库（一件代发）', icon: 'fa-parachute-box' },
  outbound_transfer: { name: '出库（中转）', icon: 'fa-exchange-alt' },
  value_service: { name: '增值服务', icon: 'fa-star' },
  outbound: { name: '出库费', icon: 'fa-upload' },
  express: { name: '快递费', icon: 'fa-truck' },
  other: { name: '其他费用', icon: 'fa-ellipsis-h' }
};

async function initApi() {
  await loadFeeCategories();
  await loadCustomers();
  await loadWarehouses();
  await loadPriceCards();
  await loadRuleConfigs();
}

// ---- 费用分类 ----

async function loadFeeCategories() {
  try {
    var response = await fetch('../价卡管理/data/fee-categories.json');
    feeCategoriesData = await response.json();
    console.log('✅ 费用类型分类数据加载成功');
  } catch (error) {
    console.error('❌ 费用类型分类数据加载失败:', error);
    feeCategoriesData = { feeCategories: {} };
    Object.keys(FEE_CATEGORIES).forEach(function(key) {
      feeCategoriesData.feeCategories[key] = { name: FEE_CATEGORIES[key].name, icon: FEE_CATEGORIES[key].icon, categories: [] };
    });
  }
}

function getFeeCategoriesForUI() {
  if (!feeCategoriesData || !feeCategoriesData.feeCategories) return {};
  return feeCategoriesData.feeCategories;
}

function getFeeItemsByCategory(categoryKey) {
  if (!feeCategoriesData || !feeCategoriesData.feeCategories) return [];
  var category = feeCategoriesData.feeCategories[categoryKey];
  if (!category || !category.categories) return [];
  var items = [];
  category.categories.forEach(function(subCat) {
    if (subCat.feeItems) {
      subCat.feeItems.forEach(function(fi) {
        items.push({ id: fi.id, name: fi.name, price: fi.price, unit: fi.unit, description: fi.description, sub_category: subCat.name, category_key: categoryKey, category_name: category.name });
      });
    }
  });
  return items;
}

function getAllFeeItems() {
  var all = [];
  var cats = getFeeCategoriesForUI();
  Object.keys(cats).forEach(function(key) { all = all.concat(getFeeItemsByCategory(key)); });
  return all;
}

// ---- 通用加载/保存 ----

function _loadFromStorage(key, generator) {
  var storedVersion = localStorage.getItem(key + 'Version');
  var stored = localStorage.getItem(key);
  if (stored && storedVersion === DATA_VERSION) {
    return JSON.parse(stored);
  }
  return generator();
}

function _saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(key + 'Version', DATA_VERSION);
}

// ---- 客户 ----

async function loadCustomers() {
  try {
    customers = _loadFromStorage('customers', generateCustomers);
    _saveToStorage('customers', customers);
    console.log('✅ 客户数据加载成功');
    return customers;
  } catch (e) { console.error('❌ 客户数据加载失败:', e); return []; }
}

function saveCustomers() { _saveToStorage('customers', customers); }

// ---- 仓库 ----

async function loadWarehouses() {
  try {
    warehouses = _loadFromStorage('warehouses', generateWarehouses);
    _saveToStorage('warehouses', warehouses);
    console.log('✅ 仓库数据加载成功');
    return warehouses;
  } catch (e) { console.error('❌ 仓库数据加载失败:', e); return []; }
}

function saveWarehouses() { _saveToStorage('warehouses', warehouses); }

// ---- 价卡 ----

async function loadPriceCards() {
  try {
    priceCards = _loadFromStorage('priceCards', generatePriceCards);
    _saveToStorage('priceCards', priceCards);
    console.log('✅ 价卡数据加载成功');
    return priceCards;
  } catch (e) { console.error('❌ 价卡数据加载失败:', e); return []; }
}

function savePriceCards() { _saveToStorage('priceCards', priceCards); }

// ---- 规则配置 ----

async function loadRuleConfigs() {
  try {
    ruleConfigs = _loadFromStorage('ruleConfigs', generateRuleConfigs);
    _saveToStorage('ruleConfigs', ruleConfigs);
    console.log('✅ 规则配置数据加载成功');
    return ruleConfigs;
  } catch (e) { console.error('❌ 规则配置数据加载失败:', e); return []; }
}

function saveRuleConfigs() { _saveToStorage('ruleConfigs', ruleConfigs); }

// ---- 查询 ----

function getCustomerById(id) { return customers.find(function(c) { return c.id === id; }); }
function getWarehouseById(id) { return warehouses.find(function(w) { return w.id === id; }); }
function getPriceCardById(id) { return priceCards.find(function(p) { return p.id === id; }); }
function getRuleConfigById(id) { return ruleConfigs.find(function(r) { return r.id === id; }); }
function getActiveCustomers() { return customers.filter(function(c) { return c.status === 1; }); }
function getActiveWarehouses() { return warehouses.filter(function(w) { return w.status === 1; }); }
function getActivePriceCards() { return priceCards.filter(function(p) { return p.status === 1; }); }
function getActiveRuleConfigs() {
  var now = new Date();
  return ruleConfigs.filter(function(r) {
    return r.status === 'published' && computeEffectiveStatus(r, now) === 'active';
  });
}
function getAllRuleConfigs() { return ruleConfigs; }

// ---- CRUD ----

function createRuleConfig(data) {
  var item = { id: generateId('RC'), ...data, created_at: getCurrentDateTime(), updated_at: getCurrentDateTime() };
  ruleConfigs.push(item);
  saveRuleConfigs();
  return item;
}

function updateRuleConfig(id, data) {
  var idx = ruleConfigs.findIndex(function(r) { return r.id === id; });
  if (idx !== -1) {
    ruleConfigs[idx] = { ...ruleConfigs[idx], ...data, created_at: ruleConfigs[idx].created_at, created_by: ruleConfigs[idx].created_by, updated_at: getCurrentDateTime() };
    saveRuleConfigs();
    return ruleConfigs[idx];
  }
  return null;
}

function deleteRuleConfig(id) {
  var idx = ruleConfigs.findIndex(function(r) { return r.id === id; });
  if (idx !== -1) { ruleConfigs.splice(idx, 1); saveRuleConfigs(); return true; }
  return false;
}

function applyTruncationForPublish(config, excludeId) {
  if (!excludeId) excludeId = null;
  var overlaps = checkPublishConflict(config, excludeId);
  var truncations = [];

  overlaps.forEach(function(r) {
    var idx = ruleConfigs.findIndex(function(item) { return item.id === r.id; });
    if (idx === -1) return;

    var newEnd = computeTruncateEndBefore(config.effective_start_time);
    var oldEnd = ruleConfigs[idx].effective_end_time;
    var oldStart = parseDateTime(ruleConfigs[idx].effective_start_time);
    var truncEndDate = parseDateTime(newEnd);

    if (!truncEndDate || !oldStart || truncEndDate < oldStart) {
      ruleConfigs[idx].status = 'voided';
      truncations.push({ id: r.id, name: r.name, action: 'void', oldEnd: oldEnd });
    } else {
      ruleConfigs[idx].effective_end_time = newEnd;
      truncations.push({ id: r.id, name: r.name, action: 'truncate', oldEnd: oldEnd, newEnd: newEnd });
    }
    ruleConfigs[idx].updated_at = getCurrentDateTime();
  });

  if (truncations.length) saveRuleConfigs();
  return truncations;
}

function publishRuleConfig(id) {
  var idx = ruleConfigs.findIndex(function(r) { return r.id === id; });
  if (idx === -1 || ruleConfigs[idx].status !== 'draft') return null;

  var config = ruleConfigs[idx];
  config.effective_start_time = normalizeEffectiveStart(config.effective_start_time);
  config.effective_end_time = normalizeEffectiveEnd(config.effective_end_time);

  var truncations = applyTruncationForPublish(config, id);
  config.status = 'published';
  config.updated_at = getCurrentDateTime();
  saveRuleConfigs();
  return { config: ruleConfigs[idx], truncations: truncations };
}

function voidRuleConfig(id) {
  var idx = ruleConfigs.findIndex(function(r) { return r.id === id; });
  if (idx !== -1 && ruleConfigs[idx].status === 'published') {
    ruleConfigs[idx].status = 'voided';
    ruleConfigs[idx].updated_at = getCurrentDateTime();
    saveRuleConfigs();
    return ruleConfigs[idx];
  }
  return null;
}

// ---- 唯一性校验 ----

function checkUniqueConfig(customerId, warehouseId, excludeId) {
  if (!excludeId) excludeId = null;
  return !ruleConfigs.find(function(r) {
    return r.customer_id === customerId && r.warehouse_id === warehouseId && r.id !== excludeId &&
      r.status !== 'voided';
  });
}

function getExistingConfig(customerId, warehouseId) {
  return ruleConfigs.find(function(r) {
    return r.customer_id === customerId && r.warehouse_id === warehouseId &&
      r.status === 'published';
  });
}

// ---- 发布冲突校验：同客户+同仓库+同费用类型+生效期重叠 ----

function getFeeTypesOfConfig(config) {
  var types = [];
  if (config.fee_discounts) {
    Object.keys(config.fee_discounts).forEach(function(key) {
      if (config.fee_discounts[key] && config.fee_discounts[key].length > 0) types.push(key);
    });
  }
  return types;
}

function checkPublishConflict(config, excludeId) {
  if (!excludeId) excludeId = null;
  var myTypes = getFeeTypesOfConfig(config);
  if (myTypes.length === 0) return [];
  var conflicts = [];
  ruleConfigs.forEach(function(r) {
    if (r.id === excludeId || r.status !== 'published') return;
    if (r.customer_id !== config.customer_id || r.warehouse_id !== config.warehouse_id) return;
    var theirTypes = getFeeTypesOfConfig(r);
    var hasCommon = myTypes.some(function(t) { return theirTypes.indexOf(t) !== -1; });
    if (!hasCommon) return;
    if (!isTimeOverlap(config.effective_start_time, config.effective_end_time, r.effective_start_time, r.effective_end_time)) return;
    conflicts.push(r);
  });
  return conflicts;
}

// ---- 导出 ----

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
window.getActiveCustomers = getActiveCustomers;
window.getActiveWarehouses = getActiveWarehouses;
window.getActivePriceCards = getActivePriceCards;
window.getActiveRuleConfigs = getActiveRuleConfigs;
window.createRuleConfig = createRuleConfig;
window.updateRuleConfig = updateRuleConfig;
window.deleteRuleConfig = deleteRuleConfig;
window.checkUniqueConfig = checkUniqueConfig;
window.getExistingConfig = getExistingConfig;
window.getAllRuleConfigs = getAllRuleConfigs;
window.publishRuleConfig = publishRuleConfig;
window.voidRuleConfig = voidRuleConfig;
window.getFeeTypesOfConfig = getFeeTypesOfConfig;
window.checkPublishConflict = checkPublishConflict;
window.applyTruncationForPublish = applyTruncationForPublish;
window.FEE_CATEGORIES = FEE_CATEGORIES;
