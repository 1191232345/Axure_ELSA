// detail.js - 详情页渲染与交互

function initDetailPage() {
  var urlParams = new URLSearchParams(window.location.search);
  var orderId = urlParams.get('id');

  if (!orderId) {
    showToast('缺少订单ID', 'error');
    setTimeout(function() { window.location.href = 'index.html'; }, 1500);
    return;
  }

  var order = getOrderById(orderId);
  if (!order) {
    showToast('订单不存在', 'error');
    setTimeout(function() { window.location.href = 'index.html'; }, 1500);
    return;
  }

  renderDetailPage(order);
  bindDetailBack();
}

function bindDetailBack() {
  var backBtn = document.getElementById('detailBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }
}

function renderDetailPage(order) {
  var statusText = getStatusText(order.status);
  var statusClass = 'detail-status-tag status-' + order.status;

  document.getElementById('detailStatusTag').className = statusClass;
  document.getElementById('detailStatusTag').textContent = statusText;

  document.getElementById('fieldOrderNo').textContent = order.order_no || '-';
  document.getElementById('fieldInstructionNo').textContent = order.id || '-';
  document.getElementById('fieldRefNo').textContent = order.order_no || '-';

  document.getElementById('fieldWarehouse').textContent = order.warehouse_name || '-';
  document.getElementById('fieldWarehouseCode').textContent = order.warehouse_id || '-';
  document.getElementById('fieldCustomerCode').textContent = order.customer_id || '-';
  document.getElementById('fieldCustomerName').textContent = order.customer_name || '-';
  document.getElementById('fieldCreatedBy').textContent = order.created_by || '-';
  document.getElementById('fieldCreatedAt').textContent = formatDateTime(order.created_at);
  document.getElementById('fieldUpdatedAt').textContent = formatDateTime(order.updated_at);

  renderFeeDetails(order);
  renderRemark(order);
}

function renderFeeDetails(order) {
  var fees = order.fees || [
    { item: order.service_name || '增值服务', unit: '件', qty: order.quantity, price: '2.50', amount: (order.quantity * 2.5).toFixed(2) }
  ];
  var total = fees.reduce(function(sum, f) { return sum + parseFloat(f.amount || 0); }, 0);

  document.getElementById('feeItemsBody').innerHTML = fees.map(function(fee) {
    return '<tr>' +
      '<td>' + fee.item + '</td>' +
      '<td>' + fee.unit + '</td>' +
      '<td>' + fee.qty + '</td>' +
      '<td>$' + fee.price + '</td>' +
      '<td>$' + fee.amount + '</td>' +
    '</tr>';
  }).join('');

  document.getElementById('feeTotal').textContent = '合计：$' + total.toFixed(2);
}

function renderRemark(order) {
  document.getElementById('detailRemark').textContent = order.remark || '-';
}

window.initDetailPage = initDetailPage;
