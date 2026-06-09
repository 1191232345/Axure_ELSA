// 价卡列表页逻辑
const PackageList = {
  init() {
    DataService.loadPackages();
    this.renderFilterOptions();
    this.render();
  },

  renderFilterOptions() {
    const creators = [...new Set(AppState.packages.map(p => p.createdBy).filter(Boolean))];
    const updaters = [...new Set(AppState.packages.map(p => p.updatedBy).filter(Boolean))];
    const creatorSelect = document.getElementById('filterCreator');
    const updaterSelect = document.getElementById('filterUpdater');
    if (creatorSelect) {
      creatorSelect.innerHTML = '<option value="">请选择创建人</option>';
      creators.forEach(c => { creatorSelect.innerHTML += `<option value="${c}">${c}</option>`; });
    }
    if (updaterSelect) {
      updaterSelect.innerHTML = '<option value="">请选择更新人</option>';
      updaters.forEach(u => { updaterSelect.innerHTML += `<option value="${u}">${u}</option>`; });
    }
  },

  render() {
    const tbody = document.getElementById('packageTableBody');
    const emptyState = document.getElementById('emptyState');
    if (!tbody || !emptyState) return;

    if (AppState.packages.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    tbody.innerHTML = AppState.packages.map(pkg => {
      const feeSummary = {};
      pkg.feeItems.forEach(item => {
        const key = item.feeGroupName || '入库';
        feeSummary[key] = (feeSummary[key] || 0) + 1;
      });
      const feeSummaryText = Object.entries(feeSummary).map(([n, c]) => `${n}(${c}项)`).join('、');

      return `<tr class="hover:bg-hover transition-colors">
        <td class="px-6 py-4"><div class="font-semibold text-dark">${pkg.name}</div>
          ${pkg.description ? `<div class="text-xs text-text-muted mt-1">${pkg.description}</div>` : ''}</td>
        <td class="px-6 py-4"><div class="text-sm text-text-secondary">${feeSummaryText}</div></td>
        <td class="px-6 py-4"><div class="text-sm text-text-secondary">${pkg.createdBy || '-'}</div></td>
        <td class="px-6 py-4"><div class="text-sm text-text-secondary">${pkg.createdAt}</div></td>
        <td class="px-6 py-4"><div class="text-sm text-text-secondary">${pkg.updatedBy || '-'}</div></td>
        <td class="px-6 py-4"><div class="text-sm text-text-secondary">${pkg.updatedAt || '-'}</div></td>
        <td class="px-6 py-4"><div class="action-buttons">
          <button class="action-btn action-btn-view" onclick="PackageList.view(${pkg.id})"><i class="fas fa-eye mr-1"></i>查看</button>
          <a href="package-edit.html?id=${pkg.id}" class="action-btn action-btn-edit"><i class="fas fa-edit mr-1"></i>编辑</a>
          <button class="action-btn action-btn-delete" onclick="PackageList.deletePkg(${pkg.id})"><i class="fas fa-trash mr-1"></i>删除</button>
        </div></td></tr>`;
    }).join('');
  },

  view(packageId) {
    const pkg = AppState.packages.find(p => p.id === packageId);
    if (!pkg) return;

    const feeItemsHtml = pkg.feeItems.map(item => {
      let discountText = '无折扣';
      if (item.discountType === 'percentage') discountText = `${item.discountValue}%折扣`;
      else if (item.discountType === 'fixed') discountText = item.discountValue < 0 ? `减少${Math.abs(item.discountValue)}$` : `增加${item.discountValue}$`;
      else if (item.discountType === 'fixed_price') discountText = `一口价${item.discountValue}$`;

      return `<div class="detail-fee-item">
        <div class="detail-fee-name"><span class="text-xs text-text-muted">${item.feeGroupName || '入库'}</span><br>
          <span class="font-semibold">${item.feeTypeName}</span></div>
        <div class="detail-fee-price">计费单位：${item.unit}<br>单价：${item.unitPrice ? item.unitPrice.toFixed(2) + '$' : '-'}<br>
          折扣方式：${discountText}<br>预计金额：<span class="font-semibold text-accent">${item.expectedAmount ? item.expectedAmount.toFixed(2) + '$' : '-'}</span>
          ${item.remark ? `<br>备注：${item.remark}` : ''}</div></div>`;
    }).join('');

    document.getElementById('detailContent').innerHTML = `
      <div class="detail-section"><h4 class="detail-section-title"><i class="fas fa-info-circle mr-2 text-accent"></i>基本信息</h4>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-label">价卡名称</div><div class="detail-value">${pkg.name}</div></div>
          <div class="detail-item"><div class="detail-label">创建人</div><div class="detail-value">${pkg.createdBy || '-'}</div></div>
          <div class="detail-item"><div class="detail-label">创建时间</div><div class="detail-value">${pkg.createdAt}</div></div>
          <div class="detail-item"><div class="detail-label">更新人</div><div class="detail-value">${pkg.updatedBy || '-'}</div></div>
          <div class="detail-item"><div class="detail-label">更新时间</div><div class="detail-value">${pkg.updatedAt || '-'}</div></div>
          ${pkg.description ? `<div class="detail-item" style="grid-column:1/-1;"><div class="detail-label">价卡描述</div><div class="detail-value">${pkg.description}</div></div>` : ''}
        </div></div>
      <div class="detail-section"><h4 class="detail-section-title"><i class="fas fa-list-check mr-2 text-accent"></i>费用项明细</h4>
        <div class="detail-fee-list">${feeItemsHtml}</div></div>`;

    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.add('active');
  },

  closeDetail() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
  },

  deletePkg(packageId) {
    const pkg = AppState.packages.find(p => p.id === packageId);
    if (!pkg) return;
    if (!confirm(`确定要删除价卡"${pkg.name}"吗？\n删除后无法恢复。`)) return;
    DataService.deletePackage(packageId);
    this.render();
    alert('价卡删除成功！');
  },

  applyFilters() {
    const nameFilter = (document.getElementById('filterName').value || '').toLowerCase();
    const creatorFilter = document.getElementById('filterCreator').value;
    const updaterFilter = document.getElementById('filterUpdater').value;
    const ctStart = document.getElementById('filterCreateTimeStart').value;
    const ctEnd = document.getElementById('filterCreateTimeEnd').value;
    const utStart = document.getElementById('filterUpdateTimeStart').value;
    const utEnd = document.getElementById('filterUpdateTimeEnd').value;

    const filtered = AppState.packages.filter(pkg => {
      if (nameFilter && !pkg.name.toLowerCase().includes(nameFilter)) return false;
      if (creatorFilter && pkg.createdBy !== creatorFilter) return false;
      if (updaterFilter && pkg.updatedBy !== updaterFilter) return false;
      if (ctStart && new Date(pkg.createdAt) < new Date(ctStart)) return false;
      if (ctEnd && new Date(pkg.createdAt) > new Date(ctEnd)) return false;
      if (utStart && new Date(pkg.updatedAt) < new Date(utStart)) return false;
      if (utEnd && new Date(pkg.updatedAt) > new Date(utEnd)) return false;
      return true;
    });

    const tbody = document.getElementById('packageTableBody');
    const emptyState = document.getElementById('emptyState');
    if (!tbody || !emptyState) return;

    if (filtered.length === 0) { tbody.innerHTML = ''; emptyState.classList.remove('hidden'); return; }
    emptyState.classList.add('hidden');
    const orig = AppState.packages;
    AppState.packages = filtered;
    this.render();
    AppState.packages = orig;
  },

  resetFilters() {
    ['filterName', 'filterCreator', 'filterUpdater'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['filterCreateTimeStart', 'filterCreateTimeEnd', 'filterUpdateTimeStart', 'filterUpdateTimeEnd'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    this.render();
  }
};

// 全局函数兼容
function viewPackage(id) { PackageList.view(id); }
function closeDetailModal() { PackageList.closeDetail(); }
function deletePackage(id) { PackageList.deletePkg(id); }
function applyFilters() { PackageList.applyFilters(); }
function resetFilters() { PackageList.resetFilters(); }
function renderPackageTable() { PackageList.render(); }
