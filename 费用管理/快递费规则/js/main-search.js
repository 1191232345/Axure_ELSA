/**
 * 快递费规则 - 搜索和导出
 */

// 重置筛选条件
function resetFilters() {
  document.getElementById('filterCarrierName').value = '';
  document.getElementById('filterChannel').value = '';
  document.getElementById('filterChargeType').value = '';
  document.getElementById('filterCreator').value = '';
  document.getElementById('filterCreateTimeStart').value = '';
  document.getElementById('filterCreateTimeEnd').value = '';
  document.getElementById('filterUpdateTimeStart').value = '';
  document.getElementById('filterUpdateTimeEnd').value = '';
  
  loadCarrierData();
}

// 搜索快递公司
function searchCarriers() {
  const carrierName = document.getElementById('filterCarrierName').value.trim().toLowerCase();
  const channel = document.getElementById('filterChannel').value.trim().toLowerCase();
  const chargeType = document.getElementById('filterChargeType').value;
  const creator = document.getElementById('filterCreator').value.trim().toLowerCase();
  const createTimeStart = document.getElementById('filterCreateTimeStart').value;
  const createTimeEnd = document.getElementById('filterCreateTimeEnd').value;
  const updateTimeStart = document.getElementById('filterUpdateTimeStart').value;
  const updateTimeEnd = document.getElementById('filterUpdateTimeEnd').value;
  
  let filteredData = window.carrierData.filter(carrier => {
    if (carrierName && !carrier.name.toLowerCase().includes(carrierName)) return false;
    if (channel && (!carrier.channel || !carrier.channel.toLowerCase().includes(channel))) return false;
    if (chargeType && carrier.chargeType !== chargeType) return false;
    if (creator && (!carrier.creator || !carrier.creator.toLowerCase().includes(creator))) return false;
    
    if (createTimeStart || createTimeEnd) {
      const createTime = new Date(carrier.createTime);
      if (createTimeStart && createTime < new Date(createTimeStart)) return false;
      if (createTimeEnd && createTime > new Date(createTimeEnd + ' 23:59:59')) return false;
    }
    
    if (updateTimeStart || updateTimeEnd) {
      const updateTime = new Date(carrier.updateTime);
      if (updateTimeStart && updateTime < new Date(updateTimeStart)) return false;
      if (updateTimeEnd && updateTime > new Date(updateTimeEnd + ' 23:59:59')) return false;
    }
    
    return true;
  });
  
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (filteredData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-8 text-gray-500">
          <i class="fa fa-search text-4xl mb-2"></i>
          <p>未找到符合条件的快递公司</p>
        </td>
      </tr>
    `;
    updateStatistics(0);
    return;
  }
  
  filteredData.forEach((carrier, index) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-hover transition-colors';
    row.innerHTML = `
      <td class="px-3 py-3 text-center border-r border-gray-200">${index + 1}</td>
      <td class="px-3 py-3 border-r border-gray-200 font-medium">${carrier.name}</td>
      <td class="px-3 py-3 text-center border-r border-gray-200">${carrier.channel || '-'}</td>
      <td class="px-3 py-3 text-center border-r border-gray-200">
        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getChargeTypeColor(carrier.chargeType)}">
          ${carrier.chargeType || '-'}
        </span>
      </td>
      <td class="px-3 py-3 text-center border-r border-gray-200">${carrier.creator || '管理员'}</td>
      <td class="px-3 py-3 text-center border-r border-gray-200">${formatDateTime(carrier.createTime)}</td>
      <td class="px-3 py-3 text-center border-r border-gray-200">${carrier.updater || '管理员'}</td>
      <td class="px-3 py-3 text-center border-r border-gray-200">${formatDateTime(carrier.updateTime)}</td>
      <td class="px-3 py-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <button onclick="viewCarrierDetail('${carrier.id}')" class="text-primary hover:text-primary-light transition-colors" title="查看详情">
            <i class="fa fa-eye"></i>
          </button>
          <button onclick="editCarrier('${carrier.id}')" class="text-primary hover:text-primary-light transition-colors" title="编辑">
            <i class="fa fa-edit"></i>
          </button>
          <button onclick="deleteCarrierConfirm('${carrier.id}')" class="text-danger hover:text-danger-light transition-colors" title="删除">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  updateStatistics(filteredData.length);
}

// 导出数据
function exportData() {
  if (window.carrierData.length === 0) {
    showMessage('没有可导出的数据', 'error');
    return;
  }
  
  const headers = ['序号', '快递公司', '渠道', '计费类型', '创建人', '创建时间', '更新人', '更新时间', '备注'];
  const csvContent = [headers.join(',')];
  
  window.carrierData.forEach((carrier, index) => {
    const row = [
      index + 1,
      carrier.name,
      carrier.channel || '',
      carrier.chargeType || '',
      carrier.creator || '管理员',
      formatDateTime(carrier.createTime),
      carrier.updater || '管理员',
      formatDateTime(carrier.updateTime),
      carrier.remark || ''
    ];
    csvContent.push(row.join(','));
  });
  
  const blob = new Blob(['\ufeff' + csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `快递费快递公司列表_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showMessage('数据导出成功');
}