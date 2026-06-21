// main.js - 规则配置列表页协调逻辑
// 表单逻辑已拆分到 form-handlers.js

async function init() {
  await initApi();
  renderFilterOptions();
  renderRuleConfigTable();

  document.getElementById('filterCustomer').addEventListener('change', applyFilters);
  document.getElementById('filterWarehouse').addEventListener('change', applyFilters);
  document.getElementById('filterBusinessType').addEventListener('change', applyFilters);
  document.getElementById('filterCreatedBy').addEventListener('input', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
}

// ---- 页面跳转 ----

function openCreateModal() {
  window.location.href = 'rule-config-form.html';
}

function editRuleConfig(ruleConfigId) {
  window.location.href = 'rule-config-form.html?editId=' + ruleConfigId;
}

// ---- 详情弹窗 ----

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function viewRuleConfig(ruleConfigId) {
  var ruleConfig = getRuleConfigById(ruleConfigId);
  if (ruleConfig) {
    renderRuleConfigDetail(ruleConfig);
    document.getElementById('detailModal').style.display = 'flex';
  }
}

// ---- 删除 ----

function deleteRuleConfigConfirm(ruleConfigId) {
  if (confirm('确定要删除这条规则配置吗？删除后该客户+仓库组合可重新创建配置。')) {
    deleteRuleConfig(ruleConfigId);
    showToast('规则配置删除成功', 'success');
    renderRuleConfigTable();
  }
}

function publishRuleConfigConfirm(ruleConfigId) {
  var config = getRuleConfigById(ruleConfigId);
  if (!config) return;
  // 发布前检查生效期重叠冲突
  var conflicts = checkPublishConflict(config, ruleConfigId);
  if (conflicts.length > 0) {
    var conflictNames = conflicts.map(function(c) { return c.name; }).join('、');
    showToast('发布失败：与已发布规则[' + conflictNames + ']在相同客户+仓库+费用类型上存在生效期重叠', 'error');
    return;
  }
  if (confirm('确定要发布这条规则配置吗？发布后将立即生效。')) {
    var result = publishRuleConfig(ruleConfigId);
    if (result) { showToast('规则配置发布成功', 'success'); renderRuleConfigTable(); }
    else { showToast('发布失败，只有草稿状态的配置才能发布', 'error'); }
  }
}

function voidRuleConfigConfirm(ruleConfigId) {
  if (confirm('确定要作废这条规则配置吗？作废后将不再生效，且不可恢复。')) {
    var result = voidRuleConfig(ruleConfigId);
    if (result) { showToast('规则配置已作废', 'success'); renderRuleConfigTable(); }
    else { showToast('作废失败，只有已发布的配置才能作废', 'error'); }
  }
}

function copyAndCreateRuleConfig(ruleConfigId) {
  var config = getRuleConfigById(ruleConfigId);
  if (!config) { showToast('未找到配置数据', 'error'); return; }
  var newData = {
    name: config.name + '（副本）',
    customer_id: config.customer_id, customer_name: config.customer_name,
    warehouse_id: config.warehouse_id, warehouse_name: config.warehouse_name,
    price_card_id: config.price_card_id, price_card_name: config.price_card_name,
    business_type: config.business_type,
    fee_discounts: JSON.parse(JSON.stringify(config.fee_discounts || {})),
    adjustments: JSON.parse(JSON.stringify(config.adjustments || [])),
    is_adjusted: config.is_adjusted,
    effective_start_time: config.effective_start_time,
    effective_end_time: config.effective_end_time,
    created_by: 'DEMO管理员',
    status: 'draft'
  };
  var newConfig = createRuleConfig(newData);
  showToast('已复制创建草稿，即将跳转编辑', 'success');
  setTimeout(function() { window.location.href = 'rule-config-form.html?editId=' + newConfig.id; }, 800);
}

// ---- 筛选 ----

function applyFilters() {
  var filters = {
    customer_id: document.getElementById('filterCustomer').value,
    warehouse_id: document.getElementById('filterWarehouse').value,
    business_type: document.getElementById('filterBusinessType').value,
    created_by: document.getElementById('filterCreatedBy').value
  };
  renderRuleConfigTable(filters);
}

function resetFilters() {
  document.getElementById('filterCustomer').value = '';
  document.getElementById('filterWarehouse').value = '';
  document.getElementById('filterBusinessType').value = '';
  document.getElementById('filterCreatedBy').value = '';
  renderRuleConfigTable();
}

// ---- 数据重置 ----

function resetData() {
  if (confirm('确定要重置测试数据吗？这将清除所有本地数据并重新加载测试数据。')) {
    localStorage.clear();
    showToast('数据已重置，正在重新加载...', 'success');
    setTimeout(function() { location.reload(); }, 1000);
  }
}

// ---- 逻辑说明弹窗 ----

function openLogicModal() {
  document.getElementById('logic-modal').classList.remove('hidden');
}

function closeLogicModal() {
  document.getElementById('logic-modal').classList.add('hidden');
}

function switchLogicTab(button) {
  var group = button.getAttribute('data-group');
  var tab = button.getAttribute('data-tab');
  var tabs = document.querySelectorAll('.logic-tab[data-group="' + group + '"]');
  tabs.forEach(function(t) {
    t.classList.remove('text-primary', 'border-b-2', 'border-primary');
    t.classList.add('text-gray-500', 'hover:text-gray-700');
  });
  button.classList.remove('text-gray-500', 'hover:text-gray-700');
  button.classList.add('text-primary', 'border-b-2', 'border-primary');
  var panels = document.querySelectorAll('.logic-panel[data-group="' + group + '"]');
  panels.forEach(function(p) { p.classList.add('hidden'); });
  var targetPanel = document.querySelector('.logic-panel[data-group="' + group + '"][data-panel="' + tab + '"]');
  if (targetPanel) targetPanel.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', init);

// ---- 导出 ----

window.openCreateModal = openCreateModal;
window.closeDetailModal = closeDetailModal;
window.viewRuleConfig = viewRuleConfig;
window.editRuleConfig = editRuleConfig;
window.deleteRuleConfigConfirm = deleteRuleConfigConfirm;
window.publishRuleConfigConfirm = publishRuleConfigConfirm;
window.voidRuleConfigConfirm = voidRuleConfigConfirm;
window.copyAndCreateRuleConfig = copyAndCreateRuleConfig;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.resetData = resetData;
window.openLogicModal = openLogicModal;
window.closeLogicModal = closeLogicModal;
window.switchLogicTab = switchLogicTab;
