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
          <div class="text-sm text-text-secondary">${formatDateTime(pkg.effectiveDate)}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">${formatDateTime(pkg.expiryDate)}</div>
        </td>
        <td class="px-6 py-4">
          <span class="status-badge ${
            pkg.status === 'active' ? 'status-active' : 
            pkg.status === 'draft' ? 'status-draft' : 
            pkg.status === 'cancelled' ? 'status-cancelled' : 'status-inactive'
          }">
            ${pkg.status === 'active' ? '生效' : 
              pkg.status === 'draft' ? '草稿' : 
              pkg.status === 'cancelled' ? '已作废' : '停用'}
          </span>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">
            ${pkg.customers && pkg.customers.length > 0 ? 
              `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <i class="fas fa-users mr-1"></i>${pkg.customers.length}个客户
              </span>` : 
              '<span class="text-xs text-text-muted">未关联</span>'
            }
          </div>
        </td>
        <td class="px-6 py-4">
          <div class="text-sm text-text-secondary">
            ${pkg.warehouses && pkg.warehouses.length > 0 ? 
              `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i class="fas fa-warehouse mr-1"></i>${pkg.warehouses.length}个仓库
              </span>` : 
              '<span class="text-xs text-text-muted">未关联</span>'
            }
          </div>
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
            <button class="action-btn action-btn-customer" onclick="openCustomerModal(${pkg.id})">
              <i class="fas fa-users mr-1"></i>关联客户
            </button>
            <button class="action-btn action-btn-warehouse" onclick="openWarehouseModal(${pkg.id})">
              <i class="fas fa-warehouse mr-1"></i>关联仓库
            </button>
            <button class="action-btn action-btn-delete" onclick="cancelPackage(${pkg.id})">
              <i class="fas fa-ban mr-1"></i>作废
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
               item.discountType === 'fixed_price' ? `一口价${item.discountValue}元` : '-'}
      </div>
    </div>
  `).join('');
  
  const customersHtml = pkg.customers && pkg.customers.length > 0 ?
    pkg.customers.map(c => `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">${c.name}</span>`).join('') :
    '<span class="text-xs text-text-muted">未关联客户</span>';
  
  const warehousesHtml = pkg.warehouses && pkg.warehouses.length > 0 ?
    pkg.warehouses.map(w => `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2">${w.name}</span>`).join('') :
    '<span class="text-xs text-text-muted">未关联仓库</span>';
  
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
          <div class="detail-label">状态</div>
          <div class="detail-value">
            <span class="status-badge ${
              pkg.status === 'active' ? 'status-active' : 
              pkg.status === 'draft' ? 'status-draft' : 
              pkg.status === 'cancelled' ? 'status-cancelled' : 'status-inactive'
            }">
              ${pkg.status === 'active' ? '生效' : 
                pkg.status === 'draft' ? '草稿' : 
                pkg.status === 'cancelled' ? '已作废' : '停用'}
            </span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">创建时间</div>
          <div class="detail-value">${pkg.createdAt}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">
        <i class="fas fa-clock mr-2"></i>有效期
      </div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">生效时间</div>
          <div class="detail-value">${formatDateTime(pkg.effectiveDate)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">失效时间</div>
          <div class="detail-value">${formatDateTime(pkg.expiryDate)}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">
        <i class="fas fa-users mr-2"></i>关联客户
      </div>
      <div class="detail-value flex flex-wrap">
        ${customersHtml}
      </div>
    </div>
    
    <div class="detail-section">
      <div class="detail-section-title">
        <i class="fas fa-warehouse mr-2"></i>关联仓库
      </div>
      <div class="detail-value flex flex-wrap">
        ${warehousesHtml}
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