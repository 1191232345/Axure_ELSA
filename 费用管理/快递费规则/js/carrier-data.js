/**
 * 快递费规则 - 快递公司数据
 */

// 快递公司数据存储
window.carrierData = [
  {
    id: '1',
    name: 'FedEx',
    channel: 'Fedex os',
    chargeType: '基础价',
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-20 15:30:00',
    remark: 'Fedex os渠道基础价'
  },
  {
    id: '2',
    name: 'FedEx',
    channel: 'Fedex os',
    chargeType: '附加费',
    createTime: '2024-01-16 09:00:00',
    updateTime: '2024-01-21 16:00:00',
    remark: 'Fedex os渠道附加费'
  },
  {
    id: '3',
    name: 'FedEx',
    channel: 'Fedex os',
    chargeType: '其他',
    createTime: '2024-01-17 08:00:00',
    updateTime: '2024-01-22 17:00:00',
    remark: 'Fedex os渠道其他费用'
  },
  {
    id: '4',
    name: 'UPS',
    channel: 'Standard',
    chargeType: '基础价',
    createTime: '2024-01-18 07:00:00',
    updateTime: '2024-01-23 18:00:00',
    remark: 'UPS标准渠道基础价'
  },
  {
    id: '5',
    name: 'USPS',
    channel: 'Priority',
    chargeType: '基础价',
    createTime: '2024-01-19 06:00:00',
    updateTime: '2024-01-24 19:00:00',
    remark: 'USPS优先渠道基础价'
  }
];

// 获取所有快递公司
function getAllCarriers() {
  return window.carrierData || [];
}

// 根据ID获取快递公司
function getCarrierById(id) {
  return window.carrierData.find(carrier => carrier.id === id);
}

// 新增快递公司
function addCarrier(carrier) {
  const newCarrier = {
    id: generateId(),
    name: carrier.name,
    channel: carrier.channel,
    chargeType: carrier.chargeType,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    remark: carrier.remark || ''
  };
  window.carrierData.push(newCarrier);
  return newCarrier;
}

// 更新快递公司
function updateCarrier(id, data) {
  const carrier = getCarrierById(id);
  if (carrier) {
    Object.assign(carrier, data, {
      updateTime: new Date().toISOString()
    });
    return carrier;
  }
  return null;
}

// 删除快递公司
function deleteCarrier(id) {
  const index = window.carrierData.findIndex(carrier => carrier.id === id);
  if (index !== -1) {
    window.carrierData.splice(index, 1);
    return true;
  }
  return false;
}