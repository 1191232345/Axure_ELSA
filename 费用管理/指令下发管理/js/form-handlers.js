// form-handlers.js - 表单处理模块

function viewOrder(orderId) {
  var order = getOrderById(orderId);
  if (!order) {
    showToast('订单不存在', 'error');
    return;
  }
  renderOrderDetail(order);
}

function closeDetailModal() {
  var modal = document.getElementById('detailModal');
  if (modal) modal.classList.add('hidden');
}

function editOrder(orderId) {
  var order = getOrderById(orderId);
  if (!order) {
    showToast('订单不存在', 'error');
    return;
  }

  if (order.status !== 'pending') {
    showToast('只能编辑未处理状态的订单', 'error');
    return;
  }

  // 跳转到编辑页面
  window.location.href = 'order-form.html?id=' + orderId;
}

function deleteOrderConfirm(orderId) {
  var order = getOrderById(orderId);
  if (!order) {
    showToast('订单不存在', 'error');
    return;
  }

  if (order.status !== 'pending') {
    showToast('只能删除未处理状态的订单', 'error');
    return;
  }

  if (confirm('确定要删除订单 ' + order.order_no + ' 吗？此操作不可恢复。')) {
    if (deleteOrder(orderId)) {
      showToast('订单已删除', 'success');
      applyFilters();
    } else {
      showToast('删除失败', 'error');
    }
  }
}

function completeOrder(orderId) {
  var order = getOrderById(orderId);
  if (!order) {
    showToast('订单不存在', 'error');
    return;
  }

  if (order.status !== 'pending') {
    showToast('只能对未处理状态的订单开始处理', 'error');
    return;
  }

  if (confirm('确认开始处理订单 "' + order.order_no + '" 吗？')) {
    updateOrderStatus(orderId, 'processing');
    showToast('订单已进入已完成', 'success');
    applyFilters();
  }
}

function applyFilters() {
  var filters = {
    customer_id: document.getElementById('filterCustomer').value,
    warehouse_id: document.getElementById('filterWarehouse').value,
    service_type: document.getElementById('filterServiceType').value,
    status: document.getElementById('filterStatus').value
  };
  renderOrderTable(filters);
}

function resetFilters() {
  document.getElementById('filterCustomer').value = '';
  document.getElementById('filterWarehouse').value = '';
  document.getElementById('filterServiceType').value = '';
  document.getElementById('filterStatus').value = '';
  renderOrderTable({});
}

// 下单表单相关函数
function initOrderForm() {
  var urlParams = new URLSearchParams(window.location.search);
  var orderId = urlParams.get('id');

  renderServiceTypeOptions();

  if (orderId) {
    loadOrderForEdit(orderId);
  }
}

function renderServiceTypeOptions() {
  var select = document.getElementById('serviceType');
  if (!select) return;

  var html = '<option value="">请选择服务类型</option>';
  Object.keys(SERVICE_TYPES).forEach(function(key) {
    var service = SERVICE_TYPES[key];
    html += '<option value="' + key + '">' + service.name + '</option>';
  });
  select.innerHTML = html;
}

function loadOrderForEdit(orderId) {
  var order = getOrderById(orderId);
  if (!order) {
    showToast('订单不存在', 'error');
    setTimeout(function() { window.location.href = 'index.html'; }, 1500);
    return;
  }

  document.getElementById('formTitle').textContent = '编辑增值服务订单';
  document.getElementById('orderId').value = order.id;
  document.getElementById('customerId').value = order.customer_id;
  document.getElementById('customerName').value = order.customer_name;
  document.getElementById('warehouseId').value = order.warehouse_id;
  document.getElementById('warehouseName').value = order.warehouse_name;
  document.getElementById('serviceType').value = order.service_type;
  document.getElementById('quantity').value = order.quantity;
  document.getElementById('remark').value = order.remark || '';
}

function submitOrderForm(event) {
  event.preventDefault();

  var orderId = document.getElementById('orderId').value;
  var customerId = document.getElementById('customerId').value.trim();
  var customerName = document.getElementById('customerName').value.trim();
  var warehouseId = document.getElementById('warehouseId').value.trim();
  var warehouseName = document.getElementById('warehouseName').value.trim();
  var serviceType = document.getElementById('serviceType').value;
  var quantity = parseInt(document.getElementById('quantity').value) || 0;
  var remark = document.getElementById('remark').value.trim();

  // 验证
  if (!customerId) { showToast('请输入客户ID', 'error'); return; }
  if (!customerName) { showToast('请输入客户名称', 'error'); return; }
  if (!warehouseId) { showToast('请输入仓库ID', 'error'); return; }
  if (!warehouseName) { showToast('请输入仓库名称', 'error'); return; }
  if (!serviceType) { showToast('请选择服务类型', 'error'); return; }
  if (quantity <= 0) { showToast('请输入有效的数量', 'error'); return; }

  var orderData = {
    customer_id: customerId,
    customer_name: customerName,
    warehouse_id: warehouseId,
    warehouse_name: warehouseName,
    service_type: serviceType,
    quantity: quantity,
    remark: remark
  };

  try {
    if (orderId) {
      // 编辑模式
      var updated = updateOrder(orderId, orderData);
      if (updated) {
        showToast('订单更新成功', 'success');
        setTimeout(function() { window.location.href = 'index.html'; }, 1500);
      } else {
        showToast('更新失败', 'error');
      }
    } else {
      // 新建模式
      var newOrder = createOrder(orderData);
      if (newOrder) {
        showToast('订单创建成功', 'success');
        setTimeout(function() { window.location.href = 'index.html'; }, 1500);
      } else {
        showToast('创建失败', 'error');
      }
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    showToast('操作失败: ' + error.message, 'error');
  }
}

function cancelOrderForm() {
  if (confirm('确定要取消吗？未保存的数据将丢失。')) {
    window.location.href = 'index.html';
  }
}

window.viewOrder = viewOrder;
window.closeDetailModal = closeDetailModal;
window.editOrder = editOrder;
window.deleteOrderConfirm = deleteOrderConfirm;
window.completeOrder = completeOrder;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.initOrderForm = initOrderForm;
window.submitOrderForm = submitOrderForm;
window.cancelOrderForm = cancelOrderForm;