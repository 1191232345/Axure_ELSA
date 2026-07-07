// 价卡创建/编辑页逻辑
const PackageForm = {
  init() {
    DataService.loadPackages();
    FeeTable.render();
    // 创建页默认新增一行
    if (AppState.feeRows.length === 0) FeeTable.addRow();
  },

  initEdit() {
    DataService.loadPackages();
    this._loadFromUrl();
  },

  // 只编辑基本信息(名称和描述)
  initEditBasicInfo() {
    DataService.loadPackages();
    this._loadBasicInfoFromUrl();
  },

  _loadFromUrl() {
    const packageId = new URLSearchParams(window.location.search).get('id');
    if (!packageId) { alert('缺少价卡ID参数'); window.location.href = 'index.html'; return; }

    const stored = localStorage.getItem('packages');
    if (!stored) { alert('价卡数据不存在'); window.location.href = 'index.html'; return; }

    const packages = JSON.parse(stored);
    const pkg = packages.find(p => p.id == packageId);
    if (!pkg) { alert('价卡不存在'); window.location.href = 'index.html'; return; }

    document.getElementById('packageId').value = pkg.id;
    document.getElementById('packageName').value = pkg.name;
    document.getElementById('packageDescription').value = pkg.description || '';

    const createdByEl = document.getElementById('createdBy');
    const createdAtEl = document.getElementById('createdAt');
    if (createdByEl) createdByEl.textContent = pkg.createdBy || '-';
    if (createdAtEl) createdAtEl.textContent = formatDateTime(pkg.createdAt);

    AppState.editingPackageId = pkg.id;
    AppState.feeRows = pkg.feeItems.map((item, i) => ({
      id: Date.now() + i, feeGroup: item.feeGroup, feeType: item.feeType,
      feeTypeName: item.feeTypeName, unit: item.unit, unitPrice: item.unitPrice,
      discountType: item.discountType || 'none', discountValue: item.discountValue || 0,
      expectedAmount: item.expectedAmount || 0, remark: item.remark || '',
      pricingType: item.pricingType, originalTierPricing: item.originalTierPricing,
      tierDiscountConfig: item.tierDiscountConfig, finalTierPricing: item.finalTierPricing
    }));

    FeeTable.render();
    if (AppState.feeRows.length === 0) FeeTable.addRow();
  },

  _loadBasicInfoFromUrl() {
    const packageId = new URLSearchParams(window.location.search).get('id');
    if (!packageId) { alert('缺少价卡ID参数'); window.location.href = 'index.html'; return; }

    const pkg = AppState.packages.find(p => p.id == packageId);
    if (!pkg) { alert('价卡不存在'); window.location.href = 'index.html'; return; }

    document.getElementById('packageId').value = pkg.id;
    document.getElementById('packageName').value = pkg.name;
    document.getElementById('packageDescription').value = pkg.description || '';

    // 显示创建和更新信息
    const createdByEl = document.getElementById('createdBy');
    const createdAtEl = document.getElementById('createdAt');
    const updatedByEl = document.getElementById('updatedBy');
    const updatedAtEl = document.getElementById('updatedAt');

    if (createdByEl) createdByEl.textContent = pkg.createdBy || '-';
    if (createdAtEl) createdAtEl.textContent = pkg.createdAt || '-';
    if (updatedByEl) updatedByEl.textContent = pkg.updatedBy || '-';
    if (updatedAtEl) updatedAtEl.textContent = pkg.updatedAt || '-';

    AppState.editingPackageId = pkg.id;
  },

  save() {
    const name = document.getElementById('packageName').value.trim();
    const description = document.getElementById('packageDescription').value.trim();
    if (!name) { alert('请输入价卡名称'); return; }

    const validRows = AppState.feeRows.filter(r => r.feeType);
    if (validRows.length === 0) { alert('请至少添加一个费用项'); return; }

    const feeItems = validRows.map(row => {
      const info = FeeDataService.getFeeTypeInfo(row.feeType, row.feeGroup);
      const unitPrice = row.unitPrice || 0;
      let expectedAmount = 0;
      if (unitPrice > 0) {
        if (row.discountType === 'none') expectedAmount = unitPrice;
        else if (row.discountType === 'percentage') expectedAmount = unitPrice * (1 - (row.discountValue || 0) / 100);
        else if (row.discountType === 'fixed') expectedAmount = Math.max(0, unitPrice - (row.discountValue || 0));
        else if (row.discountType === 'fixed_price') expectedAmount = row.discountValue || 0;
      }
      return {
        feeGroup: row.feeGroup || '入库', feeGroupName: row.feeGroup || '入库',
        feeType: row.feeType, feeTypeName: info.name, unit: info.unit,
        unitPrice, discountType: row.discountType, discountValue: row.discountValue || 0,
        expectedAmount, remark: row.remark || '',
        pricingType: row.pricingType, originalTierPricing: row.originalTierPricing,
        tierDiscountConfig: row.tierDiscountConfig, finalTierPricing: row.finalTierPricing
      };
    });

    const currentTime = DataService.getCurrentTime();
    const currentUser = '系统管理员';

    if (AppState.editingPackageId) {
      const idx = AppState.packages.findIndex(p => p.id === AppState.editingPackageId);
      if (idx > -1) {
        AppState.packages[idx] = { ...AppState.packages[idx], name, description, feeItems, updatedBy: currentUser, updatedAt: currentTime };
      }
    } else {
      AppState.packages.push({ id: Date.now(), name, description, feeItems, createdBy: currentUser, createdAt: currentTime, updatedBy: currentUser, updatedAt: currentTime });
    }

    DataService.savePackages();
    alert(AppState.editingPackageId ? '价卡更新成功！' : '价卡创建成功！');
    window.location.href = 'index.html';
  },

  // 只保存基本信息(名称和描述)
  saveBasicInfo() {
    const name = document.getElementById('packageName').value.trim();
    const description = document.getElementById('packageDescription').value.trim();

    if (!name) {
      alert('请输入价卡名称');
      return;
    }

    // 检查价卡名称是否与其他价卡重复(排除当前价卡)
    const packageId = parseInt(document.getElementById('packageId').value);
    const duplicate = AppState.packages.find(p => p.id !== packageId && p.name === name);
    if (duplicate) {
      alert('价卡名称已存在，请使用其他名称');
      return;
    }

    // 更新价卡基本信息
    const pkg = AppState.packages.find(p => p.id === packageId);
    if (!pkg) {
      alert('价卡不存在');
      return;
    }

    pkg.name = name;
    pkg.description = description;
    pkg.updatedBy = '管理员';
    pkg.updatedAt = DataService.getCurrentTime();

    DataService.savePackages();

    alert('价卡基本信息更新成功！');
    window.location.href = 'index.html';
  }
};

// 全局函数兼容
function savePackage() { PackageForm.save(); }
function savePackageBasicInfo() { PackageForm.saveBasicInfo(); }
