// test-data.js - 测试数据生成
// 从 api.js 拆分，负责所有模块的默认测试数据

const DATA_VERSION = '3.1.0';

function generateCustomers() {
  return [
    { id: 'C001', name: 'DEMO客户001', code: 'DEMO_C001', status: 1, created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00' },
    { id: 'C002', name: 'DEMO客户002', code: 'DEMO_C002', status: 1, created_at: '2024-01-02 10:00:00', updated_at: '2024-01-02 10:00:00' },
    { id: 'C003', name: 'DEMO客户003', code: 'DEMO_C003', status: 1, created_at: '2024-01-03 10:00:00', updated_at: '2024-01-03 10:00:00' },
    { id: 'C004', name: 'DEMO客户004', code: 'DEMO_C004', status: 1, created_at: '2024-01-04 10:00:00', updated_at: '2024-01-04 10:00:00' },
    { id: 'C005', name: 'DEMO客户005', code: 'DEMO_C005', status: 1, created_at: '2024-01-05 10:00:00', updated_at: '2024-01-05 10:00:00' }
  ];
}

function generateWarehouses() {
  return [
    { id: 'W001', name: 'DEMO仓库001', code: 'DEMO_W001', location: 'DEMO地区001', status: 1, created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00' },
    { id: 'W002', name: 'DEMO仓库002', code: 'DEMO_W002', location: 'DEMO地区002', status: 1, created_at: '2024-01-02 10:00:00', updated_at: '2024-01-02 10:00:00' },
    { id: 'W003', name: 'DEMO仓库003', code: 'DEMO_W003', location: 'DEMO地区003', status: 1, created_at: '2024-01-03 10:00:00', updated_at: '2024-01-03 10:00:00' },
    { id: 'W004', name: 'DEMO仓库004', code: 'DEMO_W004', location: 'DEMO地区004', status: 1, created_at: '2024-01-04 10:00:00', updated_at: '2024-01-04 10:00:00' },
    { id: 'W005', name: 'DEMO仓库005', code: 'DEMO_W005', location: 'DEMO地区005', status: 1, created_at: '2024-01-05 10:00:00', updated_at: '2024-01-05 10:00:00' }
  ];
}

function generatePriceCards() {
  return [
    {
      id: 'PC001', name: 'VIP客户折扣方案', business_type: 'all',
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
        storage: [{ fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 10, discount_description: '仓储费9折' }],
        express: [{ fee_item_id: 'domestic_standard', fee_item_name: '标准快递费', unit: '件', discount_type: 'percentage', discount_value: 8, discount_description: '快递费92折' }],
        other: []
      },
      adjustments: [{ type: 'add', name: '紧急处理费', amount: 100, description: '紧急订单处理附加费' }],
      status: 1, created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00'
    },
    {
      id: 'PC002', name: '标准客户折扣方案', business_type: 'all',
      fee_discounts: {
        inbound: [
          { fee_item_id: 'unload_fee', fee_item_name: '卸货费', unit: '柜', discount_type: 'percentage', discount_value: 5, discount_description: '入库费标准折扣' },
          { fee_item_id: 'express_receive_fee', fee_item_name: '收货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '收货费标准折扣' }
        ],
        outbound: [{ fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '拣货费标准折扣' }],
        storage: [{ fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 5, discount_description: '仓储费标准折扣' }],
        express: [], other: []
      },
      adjustments: [], status: 1, created_at: '2024-01-02 10:00:00', updated_at: '2024-01-02 10:00:00'
    },
    {
      id: 'PC003', name: '出库折扣方案', business_type: 'outbound',
      fee_discounts: {
        inbound: [],
        outbound: [
          { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'fixed', discount_value: 2, discount_description: '拣货费减免2元' },
          { fee_item_id: 'pack_fee', fee_item_name: '打包费', unit: '件', discount_type: 'percentage', discount_value: 10, discount_description: '打包费9折' }
        ],
        storage: [], express: [], other: []
      },
      adjustments: [], status: 1, created_at: '2024-01-03 10:00:00', updated_at: '2024-01-03 10:00:00'
    },
    {
      id: 'PC004', name: '转仓折扣方案', business_type: 'transfer',
      fee_discounts: {
        inbound: [], outbound: [],
        storage: [{ fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 15, discount_description: '仓储费85折' }],
        express: [], other: []
      },
      adjustments: [{ type: 'subtract', name: '批量转仓优惠', amount: 200, description: '批量转仓减收200元' }],
      status: 1, created_at: '2024-01-04 10:00:00', updated_at: '2024-01-04 10:00:00'
    }
  ];
}

function generateRuleConfigs() {
  return [
    {
      id: 'RC001', name: 'DEMO客户001-DEMO仓库001规则配置',
      customer_id: 'C001', customer_name: 'DEMO客户001',
      warehouse_id: 'W001', warehouse_name: 'DEMO仓库001',
      price_card_id: 'PC001', price_card_name: 'VIP客户折扣方案',
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
        storage: [{ fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 12, discount_description: '仓储费88折（微调）' }],
        express: [{ fee_item_id: 'domestic_standard', fee_item_name: '标准快递费', unit: '件', discount_type: 'percentage', discount_value: 8, discount_description: '快递费92折' }],
        other: []
      },
      adjustments: [{ type: 'add', name: '紧急处理费', amount: 100, description: '紧急订单处理附加费' }],
      is_adjusted: true,
      effective_start_time: '2024-01-01 00:00:00', effective_end_time: '2024-12-31 23:59:59',
      created_by: 'DEMO管理员', created_at: '2024-01-01 10:00:00', updated_at: '2024-01-01 10:00:00'
    },
    {
      id: 'RC002', name: 'DEMO客户002-DEMO仓库002规则配置',
      customer_id: 'C002', customer_name: 'DEMO客户002',
      warehouse_id: 'W002', warehouse_name: 'DEMO仓库002',
      price_card_id: 'PC002', price_card_name: '标准客户折扣方案',
      business_type: 'all',
      fee_discounts: {
        inbound: [
          { fee_item_id: 'unload_fee', fee_item_name: '卸货费', unit: '柜', discount_type: 'percentage', discount_value: 6, discount_description: '入库费微调折扣' },
          { fee_item_id: 'express_receive_fee', fee_item_name: '收货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '收货费标准折扣' }
        ],
        outbound: [{ fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'percentage', discount_value: 5, discount_description: '拣货费标准折扣' }],
        storage: [{ fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 5, discount_description: '仓储费标准折扣' }],
        express: [], other: []
      },
      adjustments: [],
      is_adjusted: true,
      effective_start_time: '2024-01-15 00:00:00', effective_end_time: '2024-06-30 23:59:59',
      created_by: 'DEMO管理员', created_at: '2024-01-15 10:00:00', updated_at: '2024-01-15 10:00:00'
    },
    {
      id: 'RC003', name: 'DEMO客户003-DEMO仓库003规则配置',
      customer_id: 'C003', customer_name: 'DEMO客户003',
      warehouse_id: 'W003', warehouse_name: 'DEMO仓库003',
      price_card_id: 'PC003', price_card_name: '出库折扣方案',
      business_type: 'outbound',
      fee_discounts: {
        inbound: [],
        outbound: [
          { fee_item_id: 'pick_fee', fee_item_name: '拣货费', unit: '件', discount_type: 'fixed', discount_value: 2, discount_description: '拣货费减免2元' },
          { fee_item_id: 'pack_fee', fee_item_name: '打包费', unit: '件', discount_type: 'percentage', discount_value: 10, discount_description: '打包费9折' }
        ],
        storage: [], express: [], other: []
      },
      adjustments: [],
      is_adjusted: false,
      effective_start_time: '2024-02-01 00:00:00', effective_end_time: '2024-12-31 23:59:59',
      created_by: 'DEMO管理员', created_at: '2024-02-01 10:00:00', updated_at: '2024-02-01 10:00:00'
    },
    {
      id: 'RC004', name: 'DEMO客户004-DEMO仓库004规则配置',
      customer_id: 'C004', customer_name: 'DEMO客户004',
      warehouse_id: 'W004', warehouse_name: 'DEMO仓库004',
      price_card_id: 'PC004', price_card_name: '转仓折扣方案',
      business_type: 'transfer',
      fee_discounts: {
        inbound: [], outbound: [],
        storage: [{ fee_item_id: 'storage_fee', fee_item_name: '仓储费', unit: '立方米/天', discount_type: 'percentage', discount_value: 15, discount_description: '仓储费85折' }],
        express: [], other: []
      },
      adjustments: [{ type: 'subtract', name: '批量转仓优惠', amount: 200, description: '批量转仓减收200元' }],
      is_adjusted: false,
      effective_start_time: '2024-03-01 00:00:00', effective_end_time: '2024-09-30 23:59:59',
      created_by: 'DEMO管理员', created_at: '2024-03-01 10:00:00', updated_at: '2024-03-01 10:00:00'
    }
  ];
}

window.DATA_VERSION = DATA_VERSION;
window.generateCustomers = generateCustomers;
window.generateWarehouses = generateWarehouses;
window.generatePriceCards = generatePriceCards;
window.generateRuleConfigs = generateRuleConfigs;
