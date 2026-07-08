/**
 * 快递费规则 - 费用项数据(附加费和其他费用)
 */

// 费用项数据存储
window.feeItemsData = [
  // Fedex os 附加费示例
  {
    id: 'f1',
    carrierId: '2',
    chargeType: '附加费',
    feeName: '燃油附加费',
    unit: '百分比',
    price: '12.5',
    zone: 'all',
    startWeight: '0',
    endWeight: '999',
    remark: '按基础价的百分比收取'
  },
  {
    id: 'f2',
    carrierId: '2',
    chargeType: '附加费',
    feeName: '偏远地区附加费',
    unit: '每单',
    price: '25',
    zone: '7',
    startWeight: '0',
    endWeight: '999',
    remark: '7区偏远地区附加费'
  },
  {
    id: 'f3',
    carrierId: '2',
    chargeType: '附加费',
    feeName: '超大件附加费',
    unit: '每件',
    price: '50',
    zone: 'all',
    startWeight: '30',
    endWeight: '999',
    remark: '重量超过30kg的包裹'
  },
  // Fedex os 其他费用示例
  {
    id: 'o1',
    carrierId: '3',
    chargeType: '其他',
    feeName: '签名确认费',
    unit: '每单',
    price: '3.5',
    zone: 'all',
    startWeight: '0',
    endWeight: '999',
    remark: '签名确认服务费'
  },
  {
    id: 'o2',
    carrierId: '3',
    chargeType: '其他',
    feeName: '保险费',
    unit: '百分比',
    price: '1.5',
    zone: 'all',
    startWeight: '0',
    endWeight: '999',
    remark: '货物价值保险费'
  },
  {
    id: 'o3',
    carrierId: '3',
    chargeType: '其他',
    feeName: '直接签名费',
    unit: '每单',
    price: '2.5',
    zone: 'all',
    startWeight: '0',
    endWeight: '999',
    remark: '直接签名服务'
  },
  {
    id: 'o4',
    carrierId: '3',
    chargeType: '其他',
    feeName: '货物运输保险费',
    unit: '每公斤',
    price: '0.5',
    zone: 'all',
    startWeight: '0',
    endWeight: '999',
    remark: '按重量计算的保险费'
  }
];

// 根据快递公司ID和计费类型获取费用项列表
function getFeeItemsByCarrierId(carrierId, chargeType) {
  return window.feeItemsData.filter(item => 
    item.carrierId === carrierId && item.chargeType === chargeType
  );
}

// 根据ID获取费用项
function getFeeItemById(id, chargeType) {
  return window.feeItemsData.find(item => 
    item.id === id && item.chargeType === chargeType
  );
}

// 新增费用项
function addFeeItem(item, chargeType) {
  const newItem = {
    id: generateId(),
    carrierId: item.carrierId,
    chargeType: chargeType,
    feeName: item.feeName,
    unit: item.unit,
    price: item.price,
    zone: item.zone,
    startWeight: item.startWeight,
    endWeight: item.endWeight,
    remark: item.remark || ''
  };
  window.feeItemsData.push(newItem);
  return newItem;
}

// 更新费用项
function updateFeeItem(id, data, chargeType) {
  const item = getFeeItemById(id, chargeType);
  if (item) {
    Object.assign(item, data);
    return item;
  }
  return null;
}

// 删除费用项
function deleteFeeItem(id, chargeType) {
  const index = window.feeItemsData.findIndex(item => 
    item.id === id && item.chargeType === chargeType
  );
  if (index !== -1) {
    window.feeItemsData.splice(index, 1);
    return true;
  }
  return false;
}

// 删除快递公司下的所有费用项(指定计费类型)
function deleteFeeItemsByCarrierId(carrierId, chargeType) {
  window.feeItemsData = window.feeItemsData.filter(item => 
    !(item.carrierId === carrierId && item.chargeType === chargeType)
  );
}