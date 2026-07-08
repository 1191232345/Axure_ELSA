/**
 * 快递费规则 - 详情页UI处理
 */

// 根据计费类型调整表格显示
function adjustTableByChargeType(chargeType) {
  const tableHead = document.getElementById('tableHead');
  if (!tableHead) return;
  
  if (chargeType === '基础价') {
    tableHead.innerHTML = `
      <tr>
        <th style="width:60px;">序号</th>
        <th style="width:180px;">重量段(KG)</th>
        <th style="width:100px;">2区费用</th>
        <th style="width:100px;">3区费用</th>
        <th style="width:100px;">4区费用</th>
        <th style="width:100px;">5区费用</th>
        <th style="width:100px;">6区费用</th>
        <th style="width:100px;">7区费用</th>
        <th style="width:100px;">8区费用</th>
        <th style="width:150px;">备注</th>
        <th style="width:80px;">操作</th>
      </tr>
    `;
  } else if (chargeType === '附加费' || chargeType === '其他') {
    tableHead.innerHTML = `
      <tr>
        <th style="width:60px;">序号</th>
        <th style="width:200px;">费用项</th>
        <th style="width:150px;">计费单位</th>
        <th style="width:120px;">价格</th>
        <th style="width:100px;">分区</th>
        <th style="width:120px;">开始重量段</th>
        <th style="width:120px;">结束重量段</th>
        <th style="width:150px;">备注</th>
        <th style="width:80px;">操作</th>
      </tr>
    `;
  }
}

// 加载重量段价格数据
function loadWeightTierData() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;
  
  const carrier = getCarrierById(currentCarrierId);
  if (!carrier) return;
  
  tableBody.innerHTML = '';
  
  if (carrier.chargeType === '基础价') {
    loadBasicPriceData(tableBody);
  } else if (carrier.chargeType === '附加费' || carrier.chargeType === '其他') {
    loadAdditionalFeeData(tableBody, carrier.chargeType);
  }
}

// 更新统计信息
function updateStatistics(count) {
  const statisticsText = document.getElementById('statisticsText');
  if (statisticsText) {
    statisticsText.innerHTML = `共 <strong>${count}</strong> 个重量段`;
  }
}

// 保存全部数据
function saveAllData() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;
  
  const carrier = getCarrierById(currentCarrierId);
  if (!carrier) return;
  
  const rows = tableBody.querySelectorAll('tr');
  const errors = [];
  
  if (carrier.chargeType === '基础价') {
    saveBasicPriceData(rows, errors);
  } else if (carrier.chargeType === '附加费' || carrier.chargeType === '其他') {
    saveAdditionalFeeData(rows, errors, carrier.chargeType);
  }
}

// 导出数据
function exportData() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;
  
  const rows = tableBody.querySelectorAll('tr');
  if (rows.length === 0) {
    showMessage('没有可导出的数据', 'error');
    return;
  }
  
  const carrier = getCarrierById(currentCarrierId);
  
  let headers = [];
  const csvContent = [];
  
  if (carrier.chargeType === '基础价') {
    headers = ['序号', '快递公司', '渠道', '计费类型', '重量段(KG)', '2区费用', '3区费用', '4区费用', '5区费用', '6区费用', '7区费用', '8区费用', '备注'];
  } else if (carrier.chargeType === '附加费' || carrier.chargeType === '其他') {
    headers = ['序号', '快递公司', '渠道', '计费类型', '费用项', '计费单位', '价格', '分区', '开始重量段', '结束重量段', '备注'];
  }
  
  csvContent.push(headers.join(','));
  
  if (carrier.chargeType === '基础价') {
    exportBasicPriceData(rows, carrier, csvContent);
  } else if (carrier.chargeType === '附加费' || carrier.chargeType === '其他') {
    exportAdditionalFeeData(rows, carrier, csvContent);
  }
  
  const blob = new Blob(['\ufeff' + csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `快递费_${carrier.chargeType}_${carrier.name}_${carrier.channel}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  showMessage('数据导出成功');
}