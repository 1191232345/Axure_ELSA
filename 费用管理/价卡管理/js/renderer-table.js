function renderPackageTable() {
  const tbody = document.getElementById('packageTableBody');
  const emptyState = document.getElementById('emptyState');
  
  if (packages.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  tbody.innerHTML = packages.map(pkg => {
    const feeSummary = {};
    pkg.feeItems.forEach(item => {
      const key = item.feeCategoryName;
      if (!feeSummary[key]) {
        feeSummary[key] = 0;
      }
      feeSummary[key]++;
    });
    
    const feeSummaryText = Object.entries(feeSummary)
      .map(([name, count]) => `${name}(${count}项)`)
      .join('、');
    
    return `
      <tr class="hover:bg-hover transition-colors">
        <td class="px-6 py-4">
          <div class="font-semibold text-dark">${pkg.name}</div>
          ${pkg.description ? `<div class="text-xs text-text-muted mt-1">${pkg.description}</div>` : ''}
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${feeSummaryText}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${pkg.createdAt}</div>
        </td>
        <td class="px-6 py-4">
          <div class="action-buttons">
            <button class="action-btn action-btn-view" onclick="viewPackage(${pkg.id})">
              <i class="fas fa-eye mr-1"></i>查看
            </button>
            <button class="action-btn action-btn-edit" onclick="editPackage(${pkg.id})">
              <i class="fas fa-edit mr-1"></i>编辑
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewPackage(packageId) {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return;
  
  const feeItemsHtml = pkg.feeItems.map(item => `
    <div class="detail-item">
      <div class="detail-label">${item.feeTypeName} - ${item.feeName}</div>
      <div class="detail-value">
        单位: ${item.unit || '-'} | 
        折扣: ${item.discountType === 'none' ? '无' : 
               item.discountType === 'percentage' ? `${item.discountValue}%` : 
               item.discountType === 'fixed' ? `扣减${item.discountValue}元` : 
               item.discountType === 'fixed_price' ? `一口价${item.discountValue}元` : '-'}${item.remark ? ` | 备注: ${item.remark}` : ''}
      </div>
    </div>
  `).join('');
  
  const detailContent = `
    <div class="detail-section">
      <div class="detail-section-title">
        <i class="fas fa-info-circle mr-2"></i>基本信息
      </div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">价卡名称</div>
          <div class="detail-value">${pkg.name}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">描述</div>
          <div class="detail-value">${pkg.description || '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">创建人</div>
          <div class="detail-value">${pkg.createdBy || '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">创建时间</div>
          <div class="detail-value">${pkg.createdAt}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">更新人</div>
          <div class="detail-value">${pkg.updatedBy || '-'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">更新时间</div>
          <div class="detail-value">${pkg.updatedAt || '-'}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">
        <i class="fas fa-list mr-2"></i>费用项明细
      </div>
      <div class="space-y-2">
        ${feeItemsHtml}
      </div>
    </div>
  `;
  
  document.getElementById('detailContent').innerHTML = detailContent;
  document.getElementById('detailModal').style.display = 'flex';
}

function closeDetailModal() {
  document.getElementById('detailModal').style.display = 'none';
}

function toggleLogic() {
  const content = document.getElementById('logic-content');
  const icon = document.getElementById('logic-icon');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
}