/**
 * 快递费规则 - 重量段价格数据
 */

// 重量段价格数据存储
window.weightTierData = [
  {
    id: '1',
    carrierId: '1',
    carrierName: 'FedEx',
    carrierChannel: 'Fedex os',
    weight: 0.5,
    zone2: 10.00,
    zone3: 12.00,
    zone4: 15.00,
    zone5: 18.00,
    zone6: 20.00,
    zone7: 25.00,
    zone8: 30.00,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-20 15:30:00',
    updater: '管理员',
    remark: 'Fedex os 0.5kg重量段基础价'
  },
  {
    id: '2',
    carrierId: '1',
    carrierName: 'FedEx',
    carrierChannel: 'Fedex os',
    weight: 1,
    zone2: 12.00,
    zone3: 15.00,
    zone4: 18.00,
    zone5: 22.00,
    zone6: 25.00,
    zone7: 30.00,
    zone8: 35.00,
    createTime: '2024-01-15 10:00:00',
    updateTime: '2024-01-20 15:30:00',
    updater: '管理员',
    remark: 'Fedex os 1kg重量段基础价'
  },
  {
    id: '3',
    carrierId: '2',
    carrierName: 'FedEx',
    carrierChannel: 'Express',
    weight: 0.5,
    zone2: 15.00,
    zone3: 18.00,
    zone4: 22.00,
    zone5: 26.00,
    zone6: 30.00,
    zone7: 35.00,
    zone8: 42.00,
    createTime: '2024-01-16 09:00:00',
    updateTime: '2024-01-21 16:00:00',
    updater: '管理员',
    remark: 'FedEx Express 0.5kg重量段基础价'
  },
  {
    id: '4',
    carrierId: '2',
    carrierName: 'FedEx',
    carrierChannel: 'Express',
    weight: 1,
    zone2: 18.00,
    zone3: 22.00,
    zone4: 26.00,
    zone5: 30.00,
    zone6: 35.00,
    zone7: 42.00,
    zone8: 50.00,
    createTime: '2024-01-16 09:00:00',
    updateTime: '2024-01-21 16:00:00',
    updater: '管理员',
    remark: 'FedEx Express 1kg重量段基础价'
  },
  {
    id: '5',
    carrierId: '3',
    carrierName: 'UPS',
    carrierChannel: 'Standard',
    weight: 0.5,
    zone2: 9.00,
    zone3: 11.00,
    zone4: 14.00,
    zone5: 17.00,
    zone6: 19.00,
    zone7: 24.00,
    zone8: 29.00,
    createTime: '2024-01-17 08:00:00',
    updateTime: '2024-01-22 17:00:00',
    updater: '管理员',
    remark: 'UPS Standard 0.5kg重量段'
  },
  {
    id: '6',
    carrierId: '3',
    carrierName: 'UPS',
    carrierChannel: 'Standard',
    weight: 1,
    zone2: 11.00,
    zone3: 14.00,
    zone4: 17.00,
    zone5: 21.00,
    zone6: 24.00,
    zone7: 29.00,
    zone8: 34.00,
    createTime: '2024-01-17 08:00:00',
    updateTime: '2024-01-22 17:00:00',
    updater: '管理员',
    remark: 'UPS Standard 1kg重量段'
  },
  {
    id: '7',
    carrierId: '4',
    carrierName: 'UPS',
    carrierChannel: 'Express',
    weight: 0.5,
    zone2: 14.00,
    zone3: 17.00,
    zone4: 21.00,
    zone5: 25.00,
    zone6: 29.00,
    zone7: 34.00,
    zone8: 41.00,
    createTime: '2024-01-18 07:00:00',
    updateTime: '2024-01-23 18:00:00',
    updater: '管理员',
    remark: 'UPS Express 0.5kg重量段'
  },
  {
    id: '8',
    carrierId: '5',
    carrierName: 'USPS',
    carrierChannel: 'Standard',
    weight: 0.5,
    zone2: 8.00,
    zone3: 10.00,
    zone4: 13.00,
    zone5: 16.00,
    zone6: 18.00,
    zone7: 23.00,
    zone8: 28.00,
    createTime: '2024-01-19 06:00:00',
    updateTime: '2024-01-24 19:00:00',
    updater: '管理员',
    remark: 'USPS Standard 0.5kg重量段'
  },
  {
    id: '9',
    carrierId: '6',
    carrierName: 'USPS',
    carrierChannel: 'Priority',
    weight: 0.5,
    zone2: 12.00,
    zone3: 15.00,
    zone4: 19.00,
    zone5: 23.00,
    zone6: 27.00,
    zone7: 32.00,
    zone8: 38.00,
    createTime: '2024-01-20 05:00:00',
    updateTime: '2024-01-25 20:00:00',
    updater: '管理员',
    remark: 'USPS Priority 0.5kg重量段'
  }
];

// 获取所有重量段数据
function getAllWeightTiers() {
  return window.weightTierData || [];
}

// 根据承运商ID获取重量段数据
function getWeightTiersByCarrierId(carrierId) {
  return window.weightTierData.filter(tier => tier.carrierId === carrierId);
}

// 根据ID获取重量段数据
function getWeightTierById(id) {
  return window.weightTierData.find(tier => tier.id === id);
}

// 新增重量段数据
function addWeightTier(tier) {
  const carrier = getCarrierById(tier.carrierId);
  const newTier = {
    id: generateId(),
    carrierId: tier.carrierId,
    carrierName: carrier ? carrier.name : '',
    carrierChannel: carrier ? carrier.channel : '',
    weight: tier.weight,
    zone2: tier.zone2,
    zone3: tier.zone3,
    zone4: tier.zone4,
    zone5: tier.zone5,
    zone6: tier.zone6,
    zone7: tier.zone7,
    zone8: tier.zone8,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    updater: getCurrentUser(),
    remark: tier.remark || ''
  };
  window.weightTierData.push(newTier);
  return newTier;
}

// 更新重量段数据
function updateWeightTier(id, data) {
  const tier = getWeightTierById(id);
  if (tier) {
    Object.assign(tier, data, {
      updateTime: new Date().toISOString(),
      updater: getCurrentUser()
    });
    return tier;
  }
  return null;
}

// 删除重量段数据
function deleteWeightTier(id) {
  const index = window.weightTierData.findIndex(tier => tier.id === id);
  if (index !== -1) {
    window.weightTierData.splice(index, 1);
    return true;
  }
  return false;
}

// 根据承运商ID删除所有重量段数据
function deleteWeightTiersByCarrierId(carrierId) {
  window.weightTierData = window.weightTierData.filter(tier => tier.carrierId !== carrierId);
}