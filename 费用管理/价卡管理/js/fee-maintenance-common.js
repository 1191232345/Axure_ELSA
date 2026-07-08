// 费用维护页面公共逻辑
const FeeMaintenanceCommon = {
  // 获取当前价卡ID
  getPackageId() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
  },

  // 加载价卡数据
  loadPackage(packageId) {
    DataService.loadPackages();
    const pkg = AppState.packages.find(p => p.id === packageId);

    if (!pkg) {
      alert('价卡不存在');
      window.location.href = 'index.html';
      return null;
    }

    return pkg;
  },

  // 显示价卡名称
  displayPackageName(pkg) {
    const displayElement = document.getElementById('packageNameDisplay');
    if (displayElement && pkg) {
      displayElement.textContent = pkg.name;
    }
  },

  // 格式化折扣文本
  formatDiscountText(item) {
    if (!item.discountType || item.discountType === 'none') {
      return '无折扣';
    }

    if (item.discountType === 'percentage') {
      return `${item.discountValue}%折扣`;
    } else if (item.discountType === 'fixed') {
      return item.discountValue < 0 ?
        `减少${Math.abs(item.discountValue)}$` :
        `增加${item.discountValue}$`;
    } else if (item.discountType === 'fixed_price') {
      return `一口价${item.discountValue}$`;
    }

    return '无折扣';
  },

  // 创建新费用项模板
  createNewItemTemplate(feeGroup, feeGroupName) {
    return {
      feeGroup: feeGroup,
      feeGroupName: feeGroupName,
      feeType: '',
      feeTypeName: '',
      unit: '',
      unitPrice: 0,
      discountType: 'none',
      discountValue: 0,
      expectedAmount: 0,
      remark: ''
    };
  },

  // 保存费用项到价卡
  saveFees(packageId, feeItems, feeGroupNames) {
    DataService.loadPackages();
    const pkg = AppState.packages.find(p => p.id === packageId);

    if (!pkg) {
      alert('价卡不存在');
      return false;
    }

    // 过滤保留不属于当前费用组的费用项
    const otherFeeItems = pkg.feeItems.filter(item =>
      !feeGroupNames.includes(item.feeGroup) &&
      !feeGroupNames.includes(item.feeGroupName)
    );

    // 更新费用项列表
    pkg.feeItems = [...otherFeeItems, ...feeItems];
    pkg.updatedBy = '管理员';
    pkg.updatedAt = DataService.getCurrentTime();

    DataService.savePackages();

    return true;
  },

  // 确认删除
  confirmDelete(index, callback) {
    if (!confirm('确定要删除该费用项吗？')) return;
    callback(index);
  },

  // 渲染空状态
  renderEmptyState(tableBody, emptyState, addButtonCallback) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
  }
};

// 全局工具函数
function addFeeRowCommon(feeItems, feeGroup, feeGroupName, renderCallback) {
  const newItem = FeeMaintenanceCommon.createNewItemTemplate(feeGroup, feeGroupName);
  feeItems.push(newItem);
  renderCallback();
  alert('已添加新费用项，请点击编辑按钮进行详细配置');
}

function deleteFeeRowCommon(feeItems, index, renderCallback) {
  FeeMaintenanceCommon.confirmDelete(index, () => {
    feeItems.splice(index, 1);
    renderCallback();
  });
}

function saveFeesCommon(packageId, feeItems, feeGroupNames, successMessage) {
  if (FeeMaintenanceCommon.saveFees(packageId, feeItems, feeGroupNames)) {
    alert(successMessage);
    window.location.href = 'index.html';
  }
}