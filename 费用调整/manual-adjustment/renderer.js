/**
 * 手工调价模块 - 渲染逻辑
 */

const ManualAdjustRenderer = {
  renderFeeTable(feeData) {
    const tbody = document.getElementById('feeTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    const newRow = document.getElementById('newRow');
    tbody.innerHTML = '';
    
    if (newRow) {
      tbody.appendChild(newRow);
    }
    
    if (feeData.length === 0 && !newRow) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    const fragment = document.createDocumentFragment();
    
    feeData.forEach(fee => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition-colors';
      tr.dataset.id = fee.id;
      
      tr.innerHTML = this.createFeeRowHTML(fee);
      fragment.appendChild(tr);
    });
    
    tbody.appendChild(fragment);
  },
  
  createFeeRowHTML(fee) {
    const newAmountDisplay = fee.newAmount !== null && fee.newAmount !== undefined 
      ? CommonUtils.formatNumber(fee.newAmount) 
      : '-';
    
    return `
      <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(fee.name)}</td>
      <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(fee.unit)}</td>
      <td class="px-4 py-3 text-sm font-medium">${CommonUtils.formatNumber(fee.amount)}</td>
      <td class="px-4 py-3 text-sm font-medium ${fee.newAmount ? 'text-primary' : ''}">${newAmountDisplay}</td>
      <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(fee.currency)}</td>
      <td class="px-4 py-3 text-sm">${CommonUtils.escapeHtml(fee.remark || '-')}</td>
      <td class="px-4 py-3 text-sm">
        <button class="text-primary hover:text-primary/80 mr-2 transition-colors" onclick="editFee('${fee.id}')">
          <i class="fa fa-edit"></i> 编辑
        </button>
        <button class="text-danger hover:text-danger/80 transition-colors" onclick="deleteFee('${fee.id}')">
          <i class="fa fa-trash"></i> 删除
        </button>
      </td>
    `;
  },
  
  renderNewRow(tabType) {
    const tbody = document.getElementById('feeTableBody');
    if (!tbody) return;
    
    const newRowTr = document.createElement('tr');
    newRowTr.id = 'newRow';
    newRowTr.className = 'bg-blue-50 border-2 border-blue-200';
    
    newRowTr.innerHTML = this.createNewRowHTML(tabType);
    tbody.insertBefore(newRowTr, tbody.firstChild);
  },
  
  createNewRowHTML(tabType) {
    const feeOptions = tabType === CommonConstants.TAB_TYPES.VALUE_ADDED 
      ? CommonRenderer.createSelectOptions(ManualAdjustConstants.VALUE_ADDED_FEE_OPTIONS)
      : CommonRenderer.createSelectOptions(ManualAdjustConstants.FEE_NAME_OPTIONS);
    const unitOptions = CommonRenderer.createSelectOptions(CommonConstants.UNIT_OPTIONS);
    const currencyOptions = CommonRenderer.createSelectOptions(CommonConstants.CURRENCY_OPTIONS, 'USD');
    
    return `
      <td class="px-4 py-3">
        <select id="newFeeName" class="form-input w-full">
          <option value="">请选择费用名称</option>
          ${feeOptions}
        </select>
      </td>
      <td class="px-4 py-3">
        <select id="newFeeUnit" class="form-input w-full">
          <option value="">请选择计费单位</option>
          ${unitOptions}
        </select>
      </td>
      <td class="px-4 py-3">
        <input type="number" id="newFeeAmount" class="form-input w-full" placeholder="输入原金额" min="0" step="0.01">
      </td>
      <td class="px-4 py-3">
        <input type="number" id="newFeeNewAmount" class="form-input w-full" placeholder="输入新金额（可选）" min="0" step="0.01">
      </td>
      <td class="px-4 py-3">
        <select id="newFeeCurrency" class="form-input w-full">
          ${currencyOptions}
        </select>
      </td>
      <td class="px-4 py-3">
        <input type="text" id="newFeeRemark" class="form-input w-full" placeholder="输入备注（可选）">
      </td>
      <td class="px-4 py-3">
        <button class="text-success hover:text-success/80 mr-2 transition-colors" onclick="saveNewRow()">
          <i class="fa fa-check"></i> 保存
        </button>
        <button class="text-danger hover:text-danger/80 transition-colors" onclick="cancelNewRow()">
          <i class="fa fa-times"></i> 取消
        </button>
      </td>
    `;
  },
  
  renderEditRow(fee, tabType) {
    const row = document.querySelector(`tr[data-id="${fee.id}"]`);
    if (!row) return;
    
    row.className = 'bg-yellow-50 border-2 border-yellow-200';
    row.innerHTML = this.createEditRowHTML(fee, tabType);
  },
  
  createEditRowHTML(fee, tabType) {
    const feeOptions = tabType === CommonConstants.TAB_TYPES.VALUE_ADDED 
      ? CommonRenderer.createSelectOptions(ManualAdjustConstants.VALUE_ADDED_FEE_OPTIONS, fee.name)
      : CommonRenderer.createSelectOptions(ManualAdjustConstants.FEE_NAME_OPTIONS, fee.name);
    const unitOptions = CommonRenderer.createSelectOptions(CommonConstants.UNIT_OPTIONS, fee.unit);
    const currencyOptions = CommonRenderer.createSelectOptions(CommonConstants.CURRENCY_OPTIONS, fee.currency);
    
    return `
      <td class="px-4 py-3">
        <select id="editFeeName_${fee.id}" class="form-input w-full">
          ${feeOptions}
        </select>
      </td>
      <td class="px-4 py-3">
        <select id="editFeeUnit_${fee.id}" class="form-input w-full">
          ${unitOptions}
        </select>
      </td>
      <td class="px-4 py-3">
        <input type="number" id="editFeeAmount_${fee.id}" class="form-input w-full" value="${fee.amount}" min="0" step="0.01">
      </td>
      <td class="px-4 py-3">
        <input type="number" id="editFeeNewAmount_${fee.id}" class="form-input w-full" value="${fee.newAmount || ''}" placeholder="输入新金额（可选）" min="0" step="0.01">
      </td>
      <td class="px-4 py-3">
        <select id="editFeeCurrency_${fee.id}" class="form-input w-full">
          ${currencyOptions}
        </select>
      </td>
      <td class="px-4 py-3">
        <input type="text" id="editFeeRemark_${fee.id}" class="form-input w-full" value="${CommonUtils.escapeHtml(fee.remark || '')}" placeholder="输入备注（可选）">
      </td>
      <td class="px-4 py-3">
        <button class="text-success hover:text-success/80 mr-2 transition-colors" onclick="saveEditRow('${fee.id}')">
          <i class="fa fa-check"></i> 保存
        </button>
        <button class="text-danger hover:text-danger/80 transition-colors" onclick="cancelEditRow('${fee.id}')">
          <i class="fa fa-times"></i> 取消
        </button>
      </td>
    `;
  },
  
  updateDimensionsDisplay(feeData) {
    const dimensionsDisplay = document.getElementById('dimensionsDisplay');
    const volumeWeightDisplay = document.getElementById('volumeWeightDisplay');
    const chargeableWeightDisplay = document.getElementById('chargeableWeightDisplay');
    
    if (!dimensionsDisplay || !volumeWeightDisplay || !chargeableWeightDisplay) return;
    
    const dimensionsInfo = ManualAdjustUtils.calculateTotalVolumeWeight(feeData);
    
    dimensionsDisplay.textContent = dimensionsInfo.dimensions;
    volumeWeightDisplay.textContent = dimensionsInfo.volumeWeight;
    chargeableWeightDisplay.textContent = dimensionsInfo.chargeableWeight;
  },
  
  updateValueAddedDisplay(feeData) {
    const customerNameDisplay = document.getElementById('customerNameDisplay');
    const instructionTimeDisplay = document.getElementById('instructionTimeDisplay');
    const completionTimeDisplay = document.getElementById('completionTimeDisplay');
    
    if (!customerNameDisplay || !instructionTimeDisplay || !completionTimeDisplay) return;
    
    // 从费用数据中获取增值服务信息
    const valueAddedInfo = feeData.length > 0 ? {
      customerName: feeData[0].customerName || '-',
      instructionTime: feeData[0].instructionTime || '-',
      completionTime: feeData[0].completionTime || '-'
    } : {
      customerName: '-',
      instructionTime: '-',
      completionTime: '-'
    };
    
    customerNameDisplay.textContent = valueAddedInfo.customerName;
    instructionTimeDisplay.textContent = valueAddedInfo.instructionTime;
    completionTimeDisplay.textContent = valueAddedInfo.completionTime;
  },
  
  toggleInfoDisplay(tabType) {
    const dimensionsInfo = document.getElementById('dimensionsInfo');
    const valueAddedInfo = document.getElementById('valueAddedInfo');
    
    if (!dimensionsInfo || !valueAddedInfo) return;
    
    if (tabType === CommonConstants.TAB_TYPES.VALUE_ADDED) {
      dimensionsInfo.classList.add('hidden');
      valueAddedInfo.classList.remove('hidden');
    } else {
      dimensionsInfo.classList.remove('hidden');
      valueAddedInfo.classList.add('hidden');
    }
  },
  
  updatePageContent(tabType) {
    const orderNumberLabel = document.getElementById('orderNumberLabel');
    const feeNumberInput = document.getElementById('feeNumber');
    
    const config = ManualAdjustConstants.TAB_CONFIGS[tabType];
    
    if (orderNumberLabel) {
      orderNumberLabel.textContent = config.label;
    }
    
    if (feeNumberInput) {
      feeNumberInput.placeholder = config.placeholder;
      feeNumberInput.value = config.exampleValue;
    }
    
    // 切换信息显示区域
    this.toggleInfoDisplay(tabType);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ManualAdjustRenderer;
}