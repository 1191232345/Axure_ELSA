// 全局状态管理
const AppState = {
  packages: [],
  feeRows: [],
  currentFeeGroup: '入库',
  editingPackageId: null,
  DATA_VERSION: '12.0',
  // 支持的费用组配置
  FEE_GROUPS: [
    { id: '入库', name: '入库', icon: 'fa-arrow-down' },
    { id: '增值服务', name: '增值服务', icon: 'fa-star' }
  ]
};
