// renderer.js - 列表页渲染模块

function renderOrderTable(filters) {
  if (!filters) filters = {};
  var tbody = document.getElementById('tableBody');
  var statisticsText = document.getElementById('statisticsText');

  var filteredOrders = getActiveOrders();

  // 应用筛选条件
  if (filters.customer_id) {
    filteredOrders = filteredOrders.filter(function(o) { return o.customer_id === filters.customer_id; });
  }
  if (filters.warehouse_id) {
    filteredOrders = filteredOrders.filter(function(o) { return o.warehouse_id === filters.warehouse_id; });
  }
  if (filters.service_type) {
    filteredOrders = filteredOrders.filter(function(o) { return o.service_type === filters.service_type; });
  }
  if (filters.status) {
    filteredOrders = filteredOrders.filter(function(o) { return o.status === filters.status; });
  }

  // 更新统计信息
  if (statisticsText) {
    statisticsText.innerHTML = '共 <strong>' + filteredOrders.length + '</strong> 个订单';
  }

  if (filteredOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-12 text-center text-text-muted"><i class="fa fa-inbox text-3xl mb-2"></i><p>暂无订单数据</p></td></tr>';
    return;
  }

  tbody.innerHTML = filteredOrders.map(function(order, index) {
    var statusBadge = '<span class="status-badge status-' + order.status + '">' +
      getStatusText(order.status) + '</span>';

    var serviceIcon = SERVICE_TYPES[order.service_type] ?
      '<i class="fa ' + SERVICE_TYPES[order.service_type].icon + ' mr-2 text-accent"></i>' : '';

    // 根据状态控制按钮显示
    var actionButtons = '';
    if (order.status === 'pending') {
      actionButtons =
        '<div class="action-btns">' +
          '<button onclick="completeOrder(\'' + order.id + '\')" class="action-btn" title="完成"><i class="fa fa-check-circle"></i></button>' +
          '<button onclick="editOrder(\'' + order.id + '\')" class="action-btn" title="编辑"><i class="fa fa-edit"></i></button>' +
          '<button onclick="deleteOrderConfirm(\'' + order.id + '\')" class="action-btn danger" title="删除"><i class="fa fa-trash"></i></button>' +
        '</div>';
    } else {
      actionButtons =
        '<div class="action-btns">' +
          '<button onclick="viewOrder(\'' + order.id + '\')" class="action-btn" title="查看"><i class="fa fa-eye"></i></button>' +
        '</div>';
    }

    return '<tr>' +
      '<td style="width:60px;">' + (index + 1) + '</td>' +
      '<td style="width:150px;">' +
        '<div class="font-medium text-primary">' + order.order_no + '</div>' +
        '<div class="text-xs text-text-muted mt-1">' + order.id + '</div>' +
      '</td>' +
      '<td style="width:120px;">' +
        '<div class="text-dark">' + order.customer_name + '</div>' +
      '</td>' +
      '<td style="width:120px;">' +
        '<div class="text-dark">' + order.warehouse_name + '</div>' +
      '</td>' +
      '<td style="width:150px;">' +
        '<div class="text-dark">' + serviceIcon + order.service_name + '</div>' +
      '</td>' +
      '<td style="width:100px;">' +
        '<div class="text-dark">' + order.quantity + ' ' + (SERVICE_TYPES[order.service_type] ? SERVICE_TYPES[order.service_type].unit : '件') + '</div>' +
      '</td>' +
      '<td style="width:100px;">' +
        '<div class="price-display">' + formatCurrency(order.total_amount) + '</div>' +
      '</td>' +
      '<td style="width:100px;">' + statusBadge + '</td>' +
      '<td style="width:150px;">' +
        '<div class="text-dark">' + formatDateTime(order.created_at) + '</div>' +
        '<div class="text-xs text-text-muted mt-1">' + order.created_by + '</div>' +
      '</td>' +
      '<td style="width:100px;">' + actionButtons + '</td>' +
    '</tr>';
  }).join('');
}

function getStatusIcon(status) {
  var iconMap = {
    'pending': 'fa-clock',
    'completed': 'fa-check-circle'
  };
  return iconMap[status] || 'fa-question';
}

function openLogicModal() {
  var modal = document.getElementById('logic-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeLogicModal() {
  var modal = document.getElementById('logic-modal');
  if (modal) modal.classList.add('hidden');
}

function renderFilterOptions() {
  // 客户筛选
  var cs = document.getElementById('filterCustomer');
  if (cs) {
    cs.innerHTML = '<option value="">全部客户</option>' +
      '<option value="C001">DEMO客户001</option>' +
      '<option value="C002">DEMO客户002</option>' +
      '<option value="C003">DEMO客户003</option>';
  }

  // 仓库筛选
  var ws = document.getElementById('filterWarehouse');
  if (ws) {
    ws.innerHTML = '<option value="">全部仓库</option>' +
      '<option value="W001">DEMO仓库001</option>' +
      '<option value="W002">DEMO仓库002</option>' +
      '<option value="W003">DEMO仓库003</option>';
  }

  // 服务类型筛选
  var st = document.getElementById('filterServiceType');
  if (st) {
    var options = '<option value="">全部服务</option>';
    Object.keys(SERVICE_TYPES).forEach(function(key) {
      options += '<option value="' + key + '">' + SERVICE_TYPES[key].name + '</option>';
    });
    st.innerHTML = options;
  }

  // 状态筛选
  var ss = document.getElementById('filterStatus');
  if (ss) {
    ss.innerHTML = '<option value="">全部状态</option>' +
      '<option value="pending">待处理</option>' +
      '<option value="completed">已完成</option>';
  }
}

function renderOrderDetail(order) {
  var modal = document.getElementById('detailModal');
  var content = document.getElementById('detailContent');

  var serviceIcon = SERVICE_TYPES[order.service_type] ?
    '<i class="fa ' + SERVICE_TYPES[order.service_type].icon + ' text-accent mr-2"></i>' : '';

  content.innerHTML =
    '<div class="detail-section">' +
      '<h4 class="detail-section-title"><i class="fa fa-info-circle text-primary mr-2"></i>基本信息</h4>' +
      '<div class="detail-grid">' +
        '<div class="detail-item"><div class="detail-label">订单号</div><div class="detail-value">' + order.order_no + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">客户</div><div class="detail-value">' + order.customer_name + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">仓库</div><div class="detail-value">' + order.warehouse_name + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">状态</div><div class="detail-value">' +
          '<span class="status-badge status-' + order.status + '">' +
          getStatusText(order.status) + '</span></div></div>' +
      '</div>' +
    '</div>' +
    '<div class="detail-section">' +
      '<h4 class="detail-section-title"><i class="fa fa-star text-primary mr-2"></i>服务详情</h4>' +
      '<div class="detail-grid">' +
        '<div class="detail-item"><div class="detail-label">服务类型</div><div class="detail-value">' + serviceIcon + order.service_name + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">数量</div><div class="detail-value">' + order.quantity + ' ' + (SERVICE_TYPES[order.service_type] ? SERVICE_TYPES[order.service_type].unit : '件') + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">单价</div><div class="detail-value">' + formatCurrency(order.unit_price) + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">总金额</div><div class="detail-value text-accent font-bold">' + formatCurrency(order.total_amount) + '</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="detail-section">' +
      '<h4 class="detail-section-title"><i class="fa fa-clock-o text-primary mr-2"></i>时间信息</h4>' +
      '<div class="detail-grid">' +
        '<div class="detail-item"><div class="detail-label">创建时间</div><div class="detail-value">' + formatDateTime(order.created_at) + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">创建人</div><div class="detail-value">' + order.created_by + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">更新时间</div><div class="detail-value">' + formatDateTime(order.updated_at) + '</div></div>' +
      '</div>' +
    '</div>' +
    (order.remark ? '<div class="detail-section"><h4 class="detail-section-title"><i class="fa fa-comment-o text-primary mr-2"></i>备注</h4><div class="detail-item"><div class="detail-value">' + order.remark + '</div></div></div>' : '');

  modal.classList.remove('hidden');
}

window.renderOrderTable = renderOrderTable;
window.renderFilterOptions = renderFilterOptions;
window.renderOrderDetail = renderOrderDetail;
window.openLogicModal = openLogicModal;
window.closeLogicModal = closeLogicModal;