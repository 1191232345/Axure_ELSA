/**
 * 快递费规则 - 主表UI处理
 */

// 加载快递公司数据
function loadCarrierData() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody || !window.carrierData) return;
  
  tableBody.innerHTML = '';
  
  if (window.carrierData.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-8 text-gray-500">
          <i class="fa fa-inbox text-4xl mb-2"></i>
          <p>暂无快递公司数据,请点击"新增"按钮添加</p>
        </td>
      </tr>
    `;
    updateStatistics(0);
    return;
  }
  
  window.carrierData.forEach((carrier, index) => {
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
  
  updateStatistics(window.carrierData.length);
}

// 查看快递公司详情
function viewCarrierDetail(carrierId) {
  window.location.href = `express-detail.html?carrierId=${carrierId}`;
}

// 编辑快递公司
function editCarrier(id) {
  const carrier = getCarrierById(id);
  if (!carrier) return;
  
  openCarrierModal();
  
  document.getElementById('carrierName').value = carrier.name;
  document.getElementById('carrierChannel').value = carrier.channel || '';
  document.getElementById('carrierChargeType').value = carrier.chargeType || '';
  document.getElementById('carrierRemark').value = carrier.remark || '';
  
  document.querySelector('#carrier-modal h3').textContent = '编辑快递公司';
  const saveBtn = document.querySelector('#carrier-modal button.erp-btn-primary');
  saveBtn.textContent = '更新';
  saveBtn.onclick = () => updateCarrierHandler(id);
}

// 更新快递公司处理
function updateCarrierHandler(id) {
  const name = document.getElementById('carrierName').value.trim();
  const channel = document.getElementById('carrierChannel').value.trim();
  const chargeType = document.getElementById('carrierChargeType').value.trim();
  const remark = document.getElementById('carrierRemark').value.trim();
  
  if (!name || !channel || !chargeType) {
    showMessage('请填写快递公司、渠道和计费类型', 'error');
    return;
  }
  
  updateCarrier(id, { name, channel, chargeType, remark });
  closeCarrierModal();
  loadCarrierData();
  showMessage('快递公司更新成功');
  
  document.querySelector('#carrier-modal h3').textContent = '新增快递公司';
  const saveBtn = document.querySelector('#carrier-modal button.erp-btn-primary');
  saveBtn.textContent = '保存';
  saveBtn.onclick = saveCarrier;
}

// 删除快递公司确认
function deleteCarrierConfirm(id) {
  const carrier = getCarrierById(id);
  if (!carrier) return;
  
  if (carrier.chargeType === '基础价') {
    const weightTiers = getWeightTiersByCarrierId(id);
    const warningMsg = weightTiers.length > 0 
      ? `\n\n注意:该快递公司下有 ${weightTiers.length} 个重量段价格数据,删除后这些数据也会被删除!` 
      : '';
    
    if (confirm(`确定要删除快递公司 "${carrier.name}" (${carrier.channel}) - ${carrier.chargeType} 吗?${warningMsg}`)) {
      deleteCarrier(id);
      deleteWeightTiersByCarrierId(id);
      loadCarrierData();
      showMessage('快递公司删除成功');
    }
  } else {
    if (confirm(`确定要删除快递公司 "${carrier.name}" (${carrier.channel}) - ${carrier.chargeType} 吗?`)) {
      deleteCarrier(id);
      loadCarrierData();
      showMessage('快递公司删除成功');
    }
  }
}