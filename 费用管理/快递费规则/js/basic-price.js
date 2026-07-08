/**
 * 快递费规则 - 基础价处理
 */

// 加载基础价数据(重量段)
function loadBasicPriceData(tableBody) {
  const weightTiers = getWeightTiersByCarrierId(currentCarrierId);
  
  if (weightTiers.length === 0) {
    addNewRow();
    updateStatistics(0);
    return;
  }
  
  const sortedTiers = weightTiers.sort((a, b) => {
    const weightA = parseFloat(a.weight) || 0;
    const weightB = parseFloat(b.weight) || 0;
    return weightA - weightB;
  });
  
  let prevEndWeight = 0;
  sortedTiers.forEach((tier, index) => {
    const row = createBasicPriceRow(tier, index, prevEndWeight);
    tableBody.appendChild(row);
    prevEndWeight = parseFloat(tier.weight) || 0;
  });
  
  updateStatistics(sortedTiers.length);
}

// 创建基础价可编辑行(重量段)
function createBasicPriceRow(tier, index, prevEndWeight = 0) {
  const row = document.createElement('tr');
  row.className = 'hover:bg-hover transition-colors';
  row.dataset.tierId = tier.id || '';
  row.dataset.rowType = 'basic';
  
  const endWeight = tier.weight || '';
  const startWeight = index === 0 ? 0 : prevEndWeight;
  const weightRange = endWeight ? `${startWeight}-${endWeight}` : '-';
  
  row.innerHTML = `
    <td class="px-3 py-3 text-center border-r border-gray-200">${index + 1}</td>
    <td class="px-3 py-3 border-r border-gray-200">
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <div class="text-xs text-gray-500 mb-1">区间(左闭右开)</div>
          <div class="font-medium text-dark">${weightRange}</div>
        </div>
        <input type="number" class="form-input w-20 text-center" value="${endWeight}" 
          placeholder="截止重量" step="0.1" min="0" data-field="weight" onchange="updateWeightRanges()">
      </div>
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${tier.zone2 || ''}" 
        placeholder="如:12.5" step="0.01" min="0" data-field="zone2">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${tier.zone3 || ''}" 
        placeholder="如:15" step="0.01" min="0" data-field="zone3">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${tier.zone4 || ''}" 
        placeholder="如:18" step="0.01" min="0" data-field="zone4">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${tier.zone5 || ''}" 
        placeholder="如:22" step="0.01" min="0" data-field="zone5">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${tier.zone6 || ''}" 
        placeholder="如:25" step="0.01" min="0" data-field="zone6">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${tier.zone7 || ''}" 
        placeholder="如:30" step="0.01" min="0" data-field="zone7">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${tier.zone8 || ''}" 
        placeholder="如:35" step="0.01" min="0" data-field="zone8">
    </td>
    <td class="px-3 py-3 border-r border-gray-200">
      <input type="text" class="form-input w-full" value="${tier.remark || ''}" 
        placeholder="备注" data-field="remark">
    </td>
    <td class="px-3 py-3 text-center">
      <button onclick="deleteRow(this)" class="text-danger hover:text-danger-light transition-colors" title="删除">
        <i class="fa fa-trash"></i>
      </button>
    </td>
  `;
  
  return row;
}

// 更新重量段区间显示
function updateWeightRanges() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;
  
  const rows = tableBody.querySelectorAll('tr');
  let prevEndWeight = 0;
  
  rows.forEach((row, index) => {
    const weightInput = row.querySelector('input[data-field="weight"]');
    const weightDisplay = row.querySelector('.font-medium.text-dark');
    
    if (weightInput && weightDisplay) {
      const endWeight = parseFloat(weightInput.value) || 0;
      const startWeight = index === 0 ? 0 : prevEndWeight;
      const weightRange = endWeight > 0 ? `${startWeight}-${endWeight}` : '-';
      
      weightDisplay.textContent = weightRange;
      prevEndWeight = endWeight;
    }
  });
}

// 保存基础价数据
function saveBasicPriceData(rows, errors) {
  const validData = [];
  
  rows.forEach((row, index) => {
    const inputs = row.querySelectorAll('input[data-field]');
    const rowData = {
      id: row.dataset.tierId || generateId(),
      carrierId: currentCarrierId,
      weight: '',
      zone2: '',
      zone3: '',
      zone4: '',
      zone5: '',
      zone6: '',
      zone7: '',
      zone8: '',
      remark: ''
    };
    
    inputs.forEach(input => {
      const field = input.dataset.field;
      if (field) {
        rowData[field] = input.value.trim();
      }
    });
    
    if (!rowData.weight) {
      errors.push(`第${index + 1}行: 截止重量不能为空`);
    }
    if (!rowData.zone2) {
      errors.push(`第${index + 1}行: 2区费用不能为空`);
    }
    
    if (!errors.some(e => e.includes(`第${index + 1}行`))) {
      validData.push(rowData);
    }
  });
  
  if (errors.length > 0) {
    showMessage(`数据验证失败:\n${errors.join('\n')}`, 'error');
    return;
  }
  
  validData.forEach(data => {
    if (data.id && getWeightTierById(data.id)) {
      updateWeightTier(data.id, data);
    } else {
      addWeightTier(data);
    }
  });
  
  const existingIds = validData.map(d => d.id);
  const allTiers = getWeightTiersByCarrierId(currentCarrierId);
  allTiers.forEach(tier => {
    if (!existingIds.includes(tier.id)) {
      deleteWeightTier(tier.id);
    }
  });
  
  loadWeightTierData();
  showMessage('重量段价格保存成功');
}

// 导出基础价数据
function exportBasicPriceData(rows, carrier, csvContent) {
  let prevEndWeight = 0;
  rows.forEach((row, index) => {
    const weightInput = row.querySelector('input[data-field="weight"]');
    
    if (weightInput) {
      const endWeight = parseFloat(weightInput.value) || 0;
      const startWeight = index === 0 ? 0 : prevEndWeight;
      const weightRange = endWeight > 0 ? `${startWeight}-${endWeight}` : '-';
      
      const zoneInputs = ['zone2', 'zone3', 'zone4', 'zone5', 'zone6', 'zone7', 'zone8'];
      const zoneValues = zoneInputs.map(field => {
        const input = row.querySelector(`input[data-field="${field}"]`);
        return input ? input.value : '';
      });
      
      const remarkInput = row.querySelector('input[data-field="remark"]');
      
      const csvRow = [
        index + 1,
        carrier.name,
        carrier.channel || '',
        carrier.chargeType,
        weightRange,
        ...zoneValues,
        remarkInput ? remarkInput.value : ''
      ];
      csvContent.push(csvRow.join(','));
      
      prevEndWeight = endWeight;
    }
  });
}