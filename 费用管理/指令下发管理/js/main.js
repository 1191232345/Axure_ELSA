// main.js - 主入口文件

document.addEventListener('DOMContentLoaded', async function() {
  console.log('增值服务指令下单模块初始化...');

  // 初始化API
  await initApi();

  // 判断是列表页还是表单页
  var isListPage = document.getElementById('tableBody');
  var isFormPage = document.getElementById('orderForm');

  if (isListPage) {
    // 列表页初始化
    initListPage();
  } else if (isFormPage) {
    // 表单页初始化
    initFormPage();
  }
});

function initListPage() {
  console.log('初始化列表页...');

  // 渲染筛选选项
  renderFilterOptions();

  // 渲染订单列表
  renderOrderTable({});

  // 绑定筛选器事件
  var filterCustomer = document.getElementById('filterCustomer');
  var filterWarehouse = document.getElementById('filterWarehouse');
  var filterServiceType = document.getElementById('filterServiceType');
  var filterStatus = document.getElementById('filterStatus');

  if (filterCustomer) filterCustomer.addEventListener('change', applyFilters);
  if (filterWarehouse) filterWarehouse.addEventListener('change', applyFilters);
  if (filterServiceType) filterServiceType.addEventListener('change', applyFilters);
  if (filterStatus) filterStatus.addEventListener('change', applyFilters);

  // 绑定重置按钮
  var resetBtn = document.getElementById('btnReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }

  // 绑定搜索按钮
  var searchBtn = document.getElementById('btnSearch');
  if (searchBtn) {
    searchBtn.addEventListener('click', applyFilters);
  }

  // 绑定新建按钮
  var createBtn = document.getElementById('btnAddOrder');
  if (createBtn) {
    createBtn.addEventListener('click', function() {
      window.location.href = 'order-form.html';
    });
  }

  // 绑定详情弹窗关闭事件
  var closeBtn = document.getElementById('closeDetailBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDetailModal);
  }

  // 点击弹窗背景关闭
  var detailModal = document.getElementById('detailModal');
  if (detailModal) {
    detailModal.addEventListener('click', function(e) {
      if (e.target === detailModal) {
        closeDetailModal();
      }
    });
  }

  console.log('列表页初始化完成');
}

function initFormPage() {
  console.log('初始化表单页...');

  // 初始化表单
  initOrderForm();

  // 绑定服务类型变化事件
  var serviceTypeSelect = document.getElementById('serviceType');
  if (serviceTypeSelect) {
    serviceTypeSelect.addEventListener('change', onServiceTypeChange);
  }

  // 绑定数量变化事件
  var quantityInput = document.getElementById('quantity');
  if (quantityInput) {
    quantityInput.addEventListener('input', onQuantityChange);
  }

  // 绑定表单提交
  var orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', submitOrderForm);
  }

  // 绑定取消按钮
  var cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', cancelOrderForm);
  }

  console.log('表单页初始化完成');
}

console.log('main.js 加载完成');