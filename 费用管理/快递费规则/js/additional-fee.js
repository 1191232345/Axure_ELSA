/**
 * 快递费规则 - 附加费处理
 */

// 加载附加费/其他费用数据
function loadAdditionalFeeData(tableBody, chargeType) {
  const feeItems = getFeeItemsByCarrierId(currentCarrierId, chargeType);
  
  if (feeItems.length === 0) {
    addNewRow();
    updateStatistics(0);
    return;
  }
  
  feeItems.forEach((item, index) => {
    const row = createAdditionalFeeRow(item, index);
    tableBody.appendChild(row);
  });
  
  updateStatistics(feeItems.length);
}

// 创建附加费/其他费用可编辑行
function createAdditionalFeeRow(item, index) {
  const row = document.createElement('tr');
  row.className = 'hover:bg-hover transition-colors';
  row.dataset.itemId = item.id || '';
  row.dataset.rowType = 'additional';
  
  // 获取当前快递公司的计费类型
  const carrier = getCarrierById(currentCarrierId);
  const chargeType = carrier ? carrier.chargeType : '附加费';
  
  const selectedZones = item.zone ? item.zone.split(',') : [];
  
  row.innerHTML = `
    <td class="px-3 py-3 text-center border-r border-gray-200">${index + 1}</td>
    <td class="px-3 py-3 border-r border-gray-200">
      <select class="form-input w-full" data-field="feeName">
        <option value="">请选择费用项</option>
        ${getFeeNameOptions(item.feeName, chargeType)}
      </select>
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <select class="form-input w-full" data-field="unit">
        <option value="">请选择</option>
        <option value="每公斤" ${item.unit === '每公斤' ? 'selected' : ''}>每公斤</option>
        <option value="每单" ${item.unit === '每单' ? 'selected' : ''}>每单</option>
        <option value="每件" ${item.unit === '每件' ? 'selected' : ''}>每件</option>
        <option value="百分比" ${item.unit === '百分比' ? 'selected' : ''}>百分比</option>
      </select>
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${item.price || ''}" 
        placeholder="如:5.5" step="0.01" min="0" data-field="price">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      ${createZoneCheckboxes(selectedZones)}
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${item.startWeight || ''}" 
        placeholder="如:0" step="0.1" min="0" data-field="startWeight">
    </td>
    <td class="px-3 py-3 text-center border-r border-gray-200">
      <input type="number" class="form-input w-full text-center" value="${item.endWeight || ''}" 
        placeholder="如:999" step="0.1" min="0" data-field="endWeight">
    </td>
    <td class="px-3 py-3 border-r border-gray-200">
      <input type="text" class="form-input w-full" value="${item.remark || ''}" 
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

// 获取费用项选项(根据计费类型)
function getFeeNameOptions(selectedFeeName, chargeType) {
  // 附加费用项
  const additionalFeeNames = [
    '燃油附加费', '偏远地区附加费', '超大件附加费', '超重件附加费',
    '住宅配送附加费', '偏远地区派送附加费', '偏远地区取件附加费',
    '非标准包装附加费', '危险品附加费', '锂电池附加费',
    '节日附加费', '旺季附加费', '高峰时段附加费',
    '周末配送附加费', '节假日配送附加费',
    '地址更正附加费', '退货附加费'
  ];
  
  // 其他费用项(只包含签名和保险)
  const otherFeeNames = [
    '签名确认费', '直接签名费', '间接签名费', '成人签名费', '签名服务费',
    '保险费', '货物运输保险费', '全额保险费', '部分保险费'
  ];
  
  // 根据计费类型选择对应的费用项列表
  const feeNames = chargeType === '其他' ? otherFeeNames : additionalFeeNames;
  
  return feeNames.map(name => 
    `<option value="${name}" ${name === selectedFeeName ? 'selected' : ''}>${name}</option>`
  ).join('\n');
}

// 创建分区复选框组
function createZoneCheckboxes(selectedZones) {
  return `
    <div class="zone-checkbox-group">
      <div class="flex items-center mb-1">
        <input type="checkbox" class="zone-checkbox" value="all" ${selectedZones.includes('all') ? 'checked' : ''} onchange="toggleAllZones(this)">
        <label class="ml-1 text-xs text-gray-700">全部</label>
      </div>
      <div class="grid grid-cols-4 gap-1">
        ${[2, 3, 4, 5, 6, 7, 8].map(zone => 
          `<div class="flex items-center">
            <input type="checkbox" class="zone-checkbox" value="${zone}" ${selectedZones.includes(String(zone)) ? 'checked' : ''}>
            <label class="ml-1 text-xs text-gray-700">${zone}区</label>
          </div>`
        ).join('\n')}
      </div>
    </div>
  `;
}

// 全部区域复选框切换
function toggleAllZones(checkbox) {
  const row = checkbox.closest('tr');
  const zoneCheckboxes = row.querySelectorAll('.zone-checkbox:not([value="all"])');
  
  if (checkbox.checked) {
    zoneCheckboxes.forEach(cb => cb.checked = true);
  } else {
    zoneCheckboxes.forEach(cb => cb.checked = false);
  }
}

// 保存附加费/其他费用数据
function saveAdditionalFeeData(rows, errors, chargeType) {
  const validData = [];
  
  rows.forEach((row, index) => {
    const inputs = row.querySelectorAll('input[data-field]');
    const selects = row.querySelectorAll('select[data-field]');
    const zoneCheckboxes = row.querySelectorAll('.zone-checkbox:checked');
    
    const rowData = {
      id: row.dataset.itemId || generateId(),
      carrierId: currentCarrierId,
      chargeType: chargeType,
      feeName: '',
      unit: '',
      price: '',
      zone: '',
      startWeight: '',
      endWeight: '',
      remark: ''
    };
    
    inputs.forEach(input => {
      const field = input.dataset.field;
      if (field) {
        rowData[field] = input.value.trim();
      }
    });
    
    selects.forEach(select => {
      const field = select.dataset.field;
      if (field) {
        rowData[field] = select.value;
      }
    });
    
    const selectedZones = [];
    zoneCheckboxes.forEach(cb => {
      if (cb.value !== 'all') {
        selectedZones.push(cb.value);
      }
    });
    
    const allCheckbox = row.querySelector('.zone-checkbox[value="all"]');
    if (allCheckbox && allCheckbox.checked) {
      rowData.zone = 'all';
    } else {
      rowData.zone = selectedZones.join(',');
    }
    
    if (!rowData.feeName) {
      errors.push(`第${index + 1}行: 费用项不能为空`);
    }
    if (!rowData.unit) {
      errors.push(`第${index + 1}行: 计费单位不能为空`);
    }
    if (!rowData.price) {
      errors.push(`第${index + 1}行: 价格不能为空`);
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
    if (data.id && getFeeItemById(data.id, chargeType)) {
      updateFeeItem(data.id, data, chargeType);
    } else {
      addFeeItem(data, chargeType);
    }
  });
  
  const existingIds = validData.map(d => d.id);
  const allItems = getFeeItemsByCarrierId(currentCarrierId, chargeType);
  allItems.forEach(item => {
    if (!existingIds.includes(item.id)) {
      deleteFeeItem(item.id, chargeType);
    }
  });
  
  loadWeightTierData();
  showMessage('费用项保存成功');
}

// 导出附加费/其他费用数据
function exportAdditionalFeeData(rows, carrier, csvContent) {
  rows.forEach((row, index) => {
    const feeNameSelect = row.querySelector('select[data-field="feeName"]');
    const unitSelect = row.querySelector('select[data-field="unit"]');
    const priceInput = row.querySelector('input[data-field="price"]');
    const zoneCheckboxes = row.querySelectorAll('.zone-checkbox:checked');
    const startWeightInput = row.querySelector('input[data-field="startWeight"]');
    const endWeightInput = row.querySelector('input[data-field="endWeight"]');
    const remarkInput = row.querySelector('input[data-field="remark"]');
    
    const selectedZones = [];
    zoneCheckboxes.forEach(cb => {
      if (cb.value === 'all') {
        selectedZones.push('全部');
      } else {
        selectedZones.push(cb.value + '区');
      }
    });
    const zoneStr = selectedZones.length > 0 ? selectedZones.join(',') : '全部';
    
    const csvRow = [
      index + 1,
      carrier.name,
      carrier.channel || '',
      carrier.chargeType,
      feeNameSelect ? feeNameSelect.value : '',
      unitSelect ? unitSelect.value : '',
      priceInput ? priceInput.value : '',
      zoneStr,
      startWeightInput ? startWeightInput.value : '',
      endWeightInput ? endWeightInput.value : '',
      remarkInput ? remarkInput.value : ''
    ];
    csvContent.push(csvRow.join(','));
  });
}