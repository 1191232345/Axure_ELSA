// form-handlers.js - 规则配置表单逻辑（创建/编辑页面共用）

var currentEditId = null;
var feeRows = [];
var currentFeeCategory = 'inbound';

// ---- 初始化 ----

async function initFormPage() {
  await initApi();
  renderCreateModalOptions();
  var params = new URLSearchParams(window.location.search);
  var editId = params.get('editId');
  if (editId) { currentEditId = editId; loadEditData(editId); }
  else {
    var now = new Date();
    document.getElementById('effectiveStartTime').value =
      now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0')
      + 'T' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  }
}

function loadEditData(editId) {
  var config = getRuleConfigById(editId);
  if (!config) { showToast('未找到配置数据', 'error'); return; }
  document.getElementById('selectCustomer').value = config.customer_id;
  document.getElementById('selectWarehouse').value = config.warehouse_id;
  document.getElementById('selectPriceCard').value = config.price_card_id;
  document.getElementById('configName').value = config.name;
  document.getElementById('effectiveStartTime').value = processDateTimeDefault(config.effective_start_time, true);
  document.getElementById('effectiveEndTime').value = processDateTimeDefault(config.effective_end_time, false);
  document.getElementById('backLink').href = 'index.html';

  feeRows = [];
  var fd = config.fee_discounts || {};
  Object.keys(fd).forEach(function(catKey) {
    (fd[catKey] || []).forEach(function(item) {
      feeRows.push({
        id: generateId('row'), fee_category: catKey,
        fee_item_id: item.fee_item_id || '', fee_item_name: item.fee_item_name || '',
        unit: item.unit || '', discount_type: item.discount_type || 'none',
        discount_value: item.discount_value || 0, discount_description: item.discount_description || '',
        original_tier_pricing: item.original_tier_pricing || null
      });
    });
  });
  currentFeeCategory = 'inbound';
  document.getElementById('discountPreviewSection').classList.remove('hidden');
  renderFeeCategoryTabs();
}

// ---- 下拉框/名称/校验 ----

function renderCreateModalOptions() {
  document.getElementById('selectCustomer').innerHTML = '<option value="">请选择客户</option>' + getActiveCustomers().map(function(c) { return '<option value="'+c.id+'">'+c.name+'</option>'; }).join('');
  document.getElementById('selectWarehouse').innerHTML = '<option value="">请选择仓库</option>' + getActiveWarehouses().map(function(w) { return '<option value="'+w.id+'">'+w.name+'</option>'; }).join('');
  document.getElementById('selectPriceCard').innerHTML = '<option value="">请选择价卡模板</option>' + getActivePriceCards().map(function(p) { return '<option value="'+p.id+'">'+p.name+'</option>'; }).join('');
}

function updateConfigName() {
  var cs = document.getElementById('selectCustomer'), ws = document.getElementById('selectWarehouse'), cn = document.getElementById('configName');
  var c = cs.options[cs.selectedIndex], w = ws.options[ws.selectedIndex];
  if (c.value && w.value && (!cn.value || cn.value.includes('规则配置'))) cn.value = c.text + '-' + w.text + '规则配置';
}

function checkDuplicateConfig() {
  var cid = document.getElementById('selectCustomer').value, wid = document.getElementById('selectWarehouse').value;
  var hint = document.getElementById('duplicateHint');
  if (cid && wid) {
    var ex = getExistingConfig(cid, wid);
    if (ex && ex.id !== currentEditId) { hint.classList.remove('hidden'); hint.innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i>该客户和仓库已存在配置：' + ex.name + '，请编辑现有配置'; }
    else hint.classList.add('hidden');
  } else hint.classList.add('hidden');
}

// ---- 价卡加载 ----

function loadPriceCardDiscount() {
  var pcid = document.getElementById('selectPriceCard').value;
  if (!pcid) { document.getElementById('discountPreviewSection').classList.add('hidden'); feeRows = []; return; }
  var pc = getPriceCardById(pcid);
  if (!pc) return;
  feeRows = [];
  var fd = pc.fee_discounts || {};
  Object.keys(fd).forEach(function(catKey) {
    (fd[catKey] || []).forEach(function(item) {
      feeRows.push({ id: generateId('row'), fee_category: catKey, fee_item_id: item.fee_item_id || '', fee_item_name: item.fee_item_name || '',
        unit: item.unit || '', discount_type: item.discount_type || 'none', discount_value: item.discount_value || 0, discount_description: item.discount_description || '' });
    });
  });
  currentFeeCategory = 'inbound';
  document.getElementById('discountPreviewSection').classList.remove('hidden');
  renderFeeCategoryTabs();
}

// ---- Tab/行操作 ----

function switchFeeCategory(category) {
  currentFeeCategory = category;
  document.querySelectorAll('.tab-btn').forEach(function(tab) { tab.classList.toggle('active', tab.dataset.group === category); });
  renderFeeTable();
}

function renderFeeCategoryTabs() {
  var tc = document.getElementById('feeCategoryTabs');
  tc.innerHTML = Object.keys(FEE_CATEGORIES).map(function(k) {
    var cat = FEE_CATEGORIES[k];
    return '<button type="button" class="tab-btn' + (k === currentFeeCategory ? ' active' : '') + '" data-group="' + k + '" onclick="switchFeeCategory(\'' + k + '\')"><i class="fas ' + cat.icon + ' mr-2"></i>' + cat.name + '</button>';
  }).join('');
  renderFeeTable();
}

function addFeeRow() {
  feeRows.push({ id: generateId('row'), fee_category: currentFeeCategory, fee_item_id: '', fee_item_name: '', unit: '', discount_type: 'none', discount_value: 0, discount_description: '' });
  renderFeeTable();
}

function removeFeeRow(rowId) { feeRows = feeRows.filter(function(r) { return r.id !== rowId; }); renderFeeTable(); }

function updateFeeRow(rowId, field, value) {
  var row = feeRows.find(function(r) { return r.id === rowId; });
  if (!row) return;
  row[field] = value;
  if (field === 'fee_item_id') { var sel = getFeeItemsByCategory(row.fee_category).find(function(i) { return i.id === value; }); if (sel) { row.fee_item_name = sel.name; row.unit = sel.unit; } }
  if (field === 'discount_type') row.discount_value = 0;
  renderFeeTable();
}

// ---- 折扣徽章/弹窗 ----

function _renderDiscountBadge(row) {
  if (row.discount_type === 'fixed_price') return '<span class="badge badge-success"><i class="fas fa-tag mr-1"></i>一口价: ¥' + (row.discount_value || 0) + '</span>';
  if (row.discount_type && row.discount_type !== 'none') {
    var dt = DISCOUNT_TYPES[row.discount_type] || row.discount_type, v = row.discount_value || 0, u = row.discount_type === 'percentage' ? '%' : '$';
    return '<span class="badge badge-accent"><i class="fas fa-layer-group mr-1"></i>' + dt + ': ' + v + u + '</span>';
  }
  return '<span class="badge badge-warning"><i class="fas fa-exclamation-triangle mr-1"></i>未配置</span>';
}

function openDiscountConfigForRow(rowId) {
  var row = feeRows.find(function(r) { return r.id === rowId; });
  if (!row) return;
  window._isRuleConfigMode = true;
  window._ruleConfigRowId = rowId;
  var appStateRow = {
    id: row.id, feeType: row.fee_item_id, feeGroup: currentFeeCategory,
    unitPrice: row.unit_price || 0, originalTierPricing: row.original_tier_pricing || null,
    pricingType: (row.original_tier_pricing && row.original_tier_pricing.length > 0) ? 'tier' : 'standard',
    remark: row.discount_description || '',
    tierDiscountConfig: row.tierDiscountConfig || { discountType: row.discount_type || 'none', discountValue: row.discount_value || 0 },
    discountType: row.discount_type || 'none', discountValue: row.discount_value || 0
  };
  var existingIdx = AppState.feeRows.findIndex(function(r) { return r.id === rowId; });
  if (existingIdx >= 0) AppState.feeRows[existingIdx] = appStateRow; else AppState.feeRows.push(appStateRow);
  if (appStateRow.pricingType === 'tier') TierDiscountModal.show(rowId); else StandardDiscountModal.show(rowId);
}

// ---- 表格渲染 ----

function renderFeeTable() {
  var tb = document.getElementById('feeItemsTableBody');
  var ci = feeRows.filter(function(r) { return r.fee_category === currentFeeCategory; });
  if (!ci.length) { tb.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-text-muted"><i class="fas fa-inbox text-2xl mb-2 block"></i><p>当前分类暂无折扣配置，请点击"新增行"添加</p></td></tr>'; return; }
  var fi = getFeeItemsByCategory(currentFeeCategory);
  tb.innerHTML = ci.map(function(row) {
    var opts = '', subs = {};
    fi.forEach(function(item) { if (!subs[item.sub_category]) subs[item.sub_category] = []; subs[item.sub_category].push(item); });
    Object.keys(subs).forEach(function(sc) { opts += '<optgroup label="' + sc + '">' + subs[sc].map(function(item) { return '<option value="'+item.id+'"'+(row.fee_item_id===item.id?' selected':'')+'>'+item.name+'</option>'; }).join('') + '</optgroup>'; });
    if (row.fee_item_id && !fi.find(function(i) { return i.id === row.fee_item_id; })) opts += '<option value="'+row.fee_item_id+'" selected>'+(row.fee_item_name||row.fee_item_id)+'</option>';
    return '<tr class="hover:bg-hover transition-colors">'
      + '<td class="px-4 py-3"><select onchange="updateFeeRow(\''+row.id+'\',\'fee_item_id\',this.value)" class="form-input text-sm"><option value="">请选择费用类型</option>'+opts+'</select></td>'
      + '<td class="px-4 py-3">'+_renderDiscountBadge(row)+'</td>'
      + '<td class="px-4 py-3"><input type="text" value="'+(row.discount_description||'')+'" onchange="updateFeeRow(\''+row.id+'\',\'discount_description\',this.value)" class="form-input text-sm" placeholder="备注"></td>'
      + '<td class="px-4 py-3"><div class="flex items-center gap-2"><button type="button" onclick="openDiscountConfigForRow(\''+row.id+'\')" class="btn btn-secondary btn-sm"><i class="fas fa-cog mr-1"></i>配置</button><button type="button" onclick="removeFeeRow(\''+row.id+'\')" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i></button></div></td></tr>';
  }).join('');
}

// ---- 数据收集/保存 ----

function collectFormData() {
  var cid = document.getElementById('selectCustomer').value, wid = document.getElementById('selectWarehouse').value, pcid = document.getElementById('selectPriceCard').value;
  var c = getCustomerById(cid), w = getWarehouseById(wid), pc = getPriceCardById(pcid);
  var fd = { inbound:[], outbound:[], storage:[], express:[], value_service:[], other:[] };
  feeRows.forEach(function(r) {
    if (r.fee_item_id && r.fee_item_name) { (fd[r.fee_category] = fd[r.fee_category] || []).push({ fee_item_id:r.fee_item_id, fee_item_name:r.fee_item_name, unit:r.unit||'', discount_type:r.discount_type||'none', discount_value:r.discount_value||0, discount_description:r.discount_description||'' }); }
  });
  return { name: document.getElementById('configName').value, customer_id:cid, customer_name:c?c.name:'', warehouse_id:wid, warehouse_name:w?w.name:'', price_card_id:pcid, price_card_name:pc?pc.name:'', business_type:'all', fee_discounts:fd, adjustments:pc?deepCopy(pc.adjustments||[]):[], is_adjusted:_checkIfAdjusted(pc, fd), effective_start_time: document.getElementById('effectiveStartTime').value, effective_end_time: document.getElementById('effectiveEndTime').value, created_by: 'DEMO管理员' };
}

function _checkIfAdjusted(pc, cfd) {
  if (!pc) return false;
  var ofd = pc.fee_discounts || {};
  var cats = Object.keys(FEE_CATEGORIES);
  for (var i = 0; i < cats.length; i++) {
    var k = cats[i], oi = ofd[k]||[], ci = cfd[k]||[];
    if (oi.length !== ci.length) return true;
    for (var j = 0; j < oi.length; j++) { var o = oi[j], cc = ci[j]; if (!cc || o.fee_item_id !== cc.fee_item_id || o.discount_type !== cc.discount_type || o.discount_value !== cc.discount_value || o.discount_description !== cc.discount_description) return true; }
  }
  return false;
}

function saveRuleConfig() {
  var name = document.getElementById('configName').value, cid = document.getElementById('selectCustomer').value, wid = document.getElementById('selectWarehouse').value, pcid = document.getElementById('selectPriceCard').value, est = document.getElementById('effectiveStartTime').value, eet = document.getElementById('effectiveEndTime').value;
  if (!name || !cid || !wid || !pcid || !est || !eet) { showToast('请填写所有必填项', 'error'); return; }
  if (!checkUniqueConfig(cid, wid, currentEditId)) { showToast('该客户和仓库已存在配置：' + getExistingConfig(cid, wid).name, 'error'); return; }
  var data = collectFormData();
  if (currentEditId) { updateRuleConfig(currentEditId, data); showToast('规则配置更新成功', 'success'); }
  else { createRuleConfig(data); showToast('规则配置创建成功', 'success'); }
  setTimeout(function() { window.location.href = 'index.html'; }, 800);
}

function checkPendingData() {
  if (new URLSearchParams(window.location.search).get('_refresh') !== '1') return;
  feeRows.forEach(function(r) {
    var pending = localStorage.getItem('_rc_pending_row_' + r.id);
    if (!pending) return;
    try { var d = JSON.parse(pending); if (d.discount_type) r.discount_type = d.discount_type; if (d.discount_value !== undefined) r.discount_value = d.discount_value; if (d.discount_description) r.discount_description = d.discount_description; localStorage.removeItem('_rc_pending_row_' + r.id); } catch(e) {}
  });
  renderFeeTable();
}

// ---- 导出 ----
['initFormPage','updateConfigName','checkDuplicateConfig','loadPriceCardDiscount','switchFeeCategory','addFeeRow','removeFeeRow','updateFeeRow','openDiscountConfigForRow','renderFeeCategoryTabs','renderFeeTable','collectFormData','saveRuleConfig','checkPendingData'].forEach(function(fn) { window[fn] = eval(fn); });
