// 数据加载与存储服务
const DataService = {
  loadPackages() {
    const storedVersion = localStorage.getItem('packagesVersion');
    const stored = localStorage.getItem('packages');

    if (stored && storedVersion === AppState.DATA_VERSION) {
      AppState.packages = JSON.parse(stored);
    } else {
      localStorage.removeItem('packages');
      localStorage.removeItem('packagesVersion');
      AppState.packages = this.getDefaultPackages();
      this.savePackages();
    }
  },

  savePackages() {
    localStorage.setItem('packages', JSON.stringify(AppState.packages));
    localStorage.setItem('packagesVersion', AppState.DATA_VERSION);
  },

  getDefaultPackages() {
    return [
      {
        id: 1, name: '基础入库价卡', description: '包含基础入库和卸货服务',
        feeItems: [
          { feeGroup: '入库', feeGroupName: '入库', feeType: 'cat_1', feeTypeName: '卸货费（整柜）', unit: '柜', unitPrice: 300, discountType: 'percentage', discountValue: 10, expectedAmount: 270, remark: '适用于标准集装箱入库' },
          { feeGroup: '入库', feeGroupName: '入库', feeType: 'cat_3', feeTypeName: 'SKU 超重费（整柜）', unit: '托', unitPrice: 25, discountType: 'none', discountValue: 0, expectedAmount: 25, remark: '适用于托盘货物入库' }
        ],
        createdBy: '系统管理员', createdAt: '2024-01-15 10:30:00', updatedBy: '系统管理员', updatedAt: '2024-01-15 10:30:00'
      },
      {
        id: 2, name: 'VIP客户价卡', description: 'VIP客户专属价卡，享受更多折扣',
        feeItems: [
          { feeGroup: '入库', feeGroupName: '入库', feeType: 'cat_1', feeTypeName: '卸货费（整柜）', unit: '柜', unitPrice: 300, discountType: 'percentage', discountValue: 20, expectedAmount: 240, remark: 'VIP客户享受20%折扣' },
          { feeGroup: '入库', feeGroupName: '入库', feeType: 'cat_3', feeTypeName: '托盘入库', unit: '托', unitPrice: 25, discountType: 'fixed', discountValue: -10, expectedAmount: 15, remark: 'VIP客户每托减少10美元' }
        ],
        createdBy: '系统管理员', createdAt: '2024-01-16 14:20:00', updatedBy: '系统管理员', updatedAt: '2024-01-16 14:20:00'
      },
      {
        id: 3, name: '一口价价卡', description: '固定价格价卡，不随市场波动',
        feeItems: [
          { feeGroup: '入库', feeGroupName: '入库', feeType: 'cat_1', feeTypeName: '整柜入库', unit: '柜', unitPrice: 300, discountType: 'fixed_price', discountValue: 250, expectedAmount: 250, remark: '一口价，不受市场波动影响' }
        ],
        createdBy: '系统管理员', createdAt: '2024-01-17 09:15:00', updatedBy: '系统管理员', updatedAt: '2024-01-17 09:15:00'
      }
    ];
  },

  deletePackage(packageId) {
    AppState.packages = AppState.packages.filter(p => p.id !== packageId);
    this.savePackages();
  },

  getCurrentTime() {
    return new Date().toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(/\//g, '-');
  }
};
