/**
 * 快递费规则 - 通用行处理
 */

// 添加新行
function addNewRow() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;
  
  const carrier = getCarrierById(currentCarrierId);
  if (!carrier) return;
  
  const rows = tableBody.querySelectorAll('tr');
  
  if (carrier.chargeType === '基础价') {
    let prevEndWeight = 0;
    
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      const weightInput = lastRow.querySelector('input[data-field="weight"]');
      if (weightInput) {
        prevEndWeight = parseFloat(weightInput.value) || 0;
      }
    }
    
    const newRow = createBasicPriceRow({}, rows.length, prevEndWeight);
    tableBody.appendChild(newRow);
  } else if (carrier.chargeType === '附加费' || carrier.chargeType === '其他') {
    const newRow = createAdditionalFeeRow({}, rows.length);
    tableBody.appendChild(newRow);
  }
  
  updateStatistics(tableBody.children.length);
}

// 删除行
function deleteRow(button) {
  const row = button.closest('tr');
  const carrier = getCarrierById(currentCarrierId);
  if (!carrier) return;
  
  if (carrier.chargeType === '基础价') {
    const tierId = row.dataset.tierId;
    
    if (tierId) {
      if (confirm('确定要删除这条重量段价格数据吗?')) {
        deleteWeightTier(tierId);
        row.remove();
        updateStatistics(document.getElementById('tableBody').children.length);
        showMessage('重量段删除成功');
      }
    } else {
      row.remove();
      updateStatistics(document.getElementById('tableBody').children.length);
    }
  } else if (carrier.chargeType === '附加费' || carrier.chargeType === '其他') {
    const itemId = row.dataset.itemId;
    
    if (itemId) {
      if (confirm('确定要删除这条费用项数据吗?')) {
        deleteFeeItem(itemId, carrier.chargeType);
        row.remove();
        updateStatistics(document.getElementById('tableBody').children.length);
        showMessage('费用项删除成功');
      }
    } else {
      row.remove();
      updateStatistics(document.getElementById('tableBody').children.length);
    }
  }
}