// api.js - 数据访问层（CRUD + localStorage 持久化）

const DATA_VERSION = '1.0.0';
const STORAGE_KEY = 'value_service_orders';

let orders = [];

// 增值服务类型定义
const SERVICE_TYPES = {
  photo: { name: '拍照服务', icon: 'fa-camera', unit: '张' },
  measure: { name: '测量服务', icon: 'fa-arrows-h', unit: '件' },
  quality_check: { name: '质检服务', icon: 'fa-check-square-o', unit: '件' },
  custom_pack: { name: '定制包装', icon: 'fa-cube', unit: '件' },
  label_service: { name: '贴标服务', icon: 'fa-tag', unit: '件' },
  return_handle: { name: '退货处理', icon: 'fa-undo', unit: '件' }
};

async function initApi() {
  loadOrders();
  if (orders.length === 0) {
    generateTestOrders();
    saveOrders();
  }
}

function loadOrders() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      var data = JSON.parse(stored);
      if (data.version === DATA_VERSION) {
        orders = data.orders || [];
        orders.forEach(function(o) {
          if (o.status === 'draft') o.status = 'pending';
          if (o.status === 'completed') o.status = 'processing';
        });
      }
    }
  } catch (error) {
    console.error('加载订单数据失败:', error);
    orders = [];
  }
}

function saveOrders() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: DATA_VERSION,
      orders: orders,
      lastUpdated: getCurrentDateTime()
    }));
  } catch (error) {
    console.error('保存订单数据失败:', error);
  }
}

function getAllOrders() {
  return orders;
}

function getActiveOrders() {
  return orders.filter(function(o) { return o.status !== 'cancelled'; });
}

function getOrderById(id) {
  return orders.find(function(o) { return o.id === id; });
}

function createOrder(orderData) {
  var order = {
    id: generateId('VS'),
    order_no: 'VS' + Date.now(),
    customer_id: orderData.customer_id,
    customer_name: orderData.customer_name,
    warehouse_id: orderData.warehouse_id,
    warehouse_name: orderData.warehouse_name,
    service_type: orderData.service_type,
    service_name: getServiceTypeText(orderData.service_type),
    quantity: orderData.quantity || 1,
    status: 'pending',
    remark: orderData.remark || '',
    created_by: orderData.created_by || 'DEMO管理员',
    created_at: getCurrentDateTime(),
    updated_at: getCurrentDateTime()
  };
  orders.unshift(order);
  saveOrders();
  return order;
}

function updateOrder(id, updateData) {
  var order = getOrderById(id);
  if (!order) return null;
  Object.keys(updateData).forEach(function(key) {
    if (key !== 'id' && key !== 'created_at') {
      order[key] = updateData[key];
    }
  });
  order.updated_at = getCurrentDateTime();
  saveOrders();
  return order;
}

function deleteOrder(id) {
  var index = orders.findIndex(function(o) { return o.id === id; });
  if (index !== -1) {
    orders.splice(index, 1);
    saveOrders();
    return true;
  }
  return false;
}

function updateOrderStatus(id, status) {
  var order = orders.find(function(o) { return o.id === id; });
  if (order) {
    order.status = status;
    order.updated_at = getCurrentDateTime();
    saveOrders();
    return true;
  }
  return false;
}

function generateTestOrders() {
  orders = [
    {
      id: 'VS001', order_no: 'VS001',
      customer_id: 'C001', customer_name: 'DEMO客户001',
      warehouse_id: 'W001', warehouse_name: 'DEMO仓库001',
      service_type: 'photo', service_name: '拍照服务',
      quantity: 50,
      status: 'pending', remark: '产品上架前拍照',
      created_by: 'DEMO管理员', created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00'
    },
    {
      id: 'VS002', order_no: 'VS002',
      customer_id: 'C002', customer_name: 'DEMO客户002',
      warehouse_id: 'W002', warehouse_name: 'DEMO仓库002',
      service_type: 'quality_check', service_name: '质检服务',
      quantity: 100,
      status: 'pending', remark: '入库质检',
      created_by: 'DEMO管理员', created_at: '2024-01-02 10:00:00', updated_at: '2024-01-02 10:00:00'
    },
    {
      id: 'VS003', order_no: 'VS003',
      customer_id: 'C003', customer_name: 'DEMO客户003',
      warehouse_id: 'W003', warehouse_name: 'DEMO仓库003',
      service_type: 'custom_pack', service_name: '定制包装',
      quantity: 30,
      status: 'processing', remark: '特殊商品定制包装',
      created_by: 'DEMO管理员', created_at: '2024-01-03 10:00:00', updated_at: '2024-01-03 10:00:00',
      fees: [
        { item: '定制包装', unit: '件', qty: 30, price: '2.50', amount: '75.00' },
        { item: '材料费', unit: '件', qty: 30, price: '1.00', amount: '30.00' }
      ]
    }
  ];
}

window.DATA_VERSION = DATA_VERSION;
window.SERVICE_TYPES = SERVICE_TYPES;
window.initApi = initApi;
window.getAllOrders = getAllOrders;
window.getActiveOrders = getActiveOrders;
window.getOrderById = getOrderById;
window.createOrder = createOrder;
window.updateOrder = updateOrder;
window.deleteOrder = deleteOrder;
window.updateOrderStatus = updateOrderStatus;