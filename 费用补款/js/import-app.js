/**
 * 数据导入模块 - 主控制器
 */

const ImportApp = {
  // 状态管理
  state: {
    currentStep: 1,
    file: null,
    workbook: null,
    sheetData: [],
    parsedData: [],
    validationResults: [],
    showOnlyErrors: false
  },

  // 必填字段配置
  requiredFields: [
    { key: 'order_id', label: '订单号', required: true },
    { key: 'customer_name', label: '客户名称', required: true },
    { key: 'orig_length', label: '原长(cm)', required: true, type: 'number', min: 0, max: 500 },
    { key: 'orig_width', label: '原宽(cm)', required: true, type: 'number', min: 0, max: 500 },
    { key: 'orig_height', label: '原高(cm)', required: true, type: 'number', min: 0, max: 500 },
    { key: 'orig_weight', label: '原重(kg)', required: true, type: 'number', min: 0, max: 1000 },
    { key: 'new_length', label: '新长(cm)', required: true, type: 'number', min: 0, max: 500 },
    { key: 'new_width', label: '新宽(cm)', required: true, type: 'number', min: 0, max: 500 },
    { key: 'new_height', label: '新高(cm)', required: true, type: 'number', min: 0, max: 500 },
    { key: 'new_weight', label: '新重(kg)', required: true, type: 'number', min: 0, max: 1000 }
  ],

  /**
   * 初始化应用
   */
  init() {
    console.log('[Import] 初始化数据导入模块...');
    this.bindEvents();
    console.log('[Import] 初始化完成');
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 拖拽事件
    const dropZone = document.getElementById('dropZone');

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFile(files[0]);
      }
    });
  },

  /**
   * 处理文件选择
   */
  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  },

  /**
   * 处理文件
   */
  handleFile(file) {
    // 验证文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      this.showToast('不支持的文件格式，请上传 .xlsx、.xls 或 .csv 文件', 'error');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('文件大小超过10MB限制', 'error');
      return;
    }

    this.state.file = file;

    // 更新UI显示
    document.getElementById('uploadPlaceholder').classList.add('hidden');
    document.getElementById('uploadSuccess').classList.remove('hidden');
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
    document.getElementById('dropZone').classList.add('has-file');

    // 解析文件
    this.parseExcelFile(file);
  },

  /**
   * 解析Excel/CSV文件
   */
  async parseExcelFile(file) {
    try {
      const data = await file.arrayBuffer();
      this.state.workbook = XLSX.read(data, { type: 'array' });

      // 填充工作表选择器
      const sheetSelect = document.getElementById('sheetSelect');
      sheetSelect.innerHTML = '';
      sheetSelect.disabled = false;

      this.state.workbook.SheetNames.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = name;
        sheetSelect.appendChild(option);
      });

      // 自动加载第一个工作表
      this.onSheetChange();

      // 启用解析按钮
      document.getElementById('parseBtn').disabled = false;

      this.showToast(`文件解析成功，共 ${this.state.workbook.SheetNames.length} 个工作表`, 'success');

    } catch (error) {
      console.error('[Import] 文件解析失败:', error);
      this.showToast('文件解析失败，请检查文件格式是否正确', 'error');
    }
  },

  /**
   * 工作表切换事件
   */
  onSheetChange() {
    const sheetIndex = parseInt(document.getElementById('sheetSelect').value);
    const headerRow = parseInt(document.getElementById('headerRowSelect').value);

    if (isNaN(sheetIndex)) return;

    const sheetName = this.state.workbook.SheetNames[sheetIndex];
    const worksheet = this.state.workbook.Sheets[sheetName];

    // 转换为JSON数组
    this.state.sheetData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    });

    // 显示数据统计
    const rowCount = this.state.sheetData.length - headerRow - 1;
    document.getElementById('importStats').classList.remove('hidden');
    document.getElementById('loadedCount').textContent = Math.max(0, rowCount);

    console.log(`[Import] 工作表 "${sheetName}" 已加载，共 ${this.state.sheetData.length} 行`);
  },

  /**
   * 解析并校验数据
   */
  parseFile() {
    if (!this.state.workbook) {
      this.showToast('请先上传文件', 'warning');
      return;
    }

    const headerRow = parseInt(document.getElementById('headerRowSelect').value);

    // 获取表头
    if (this.state.sheetData.length <= headerRow) {
      this.showToast('数据行数不足', 'error');
      return;
    }

    const headers = this.state.sheetData[headerRow].map(h =>
      String(h).trim().toLowerCase().replace(/[\s_]+/g, '_')
    );

    console.log('[Import] 表头:', headers);

    // 解析数据行
    this.state.parsedData = [];
    this.state.validationResults = [];

    for (let i = headerRow + 1; i < this.state.sheetData.length; i++) {
      const row = this.state.sheetData[i];
      if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) {
        continue; // 跳过空行
      }

      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      record._rowNum = i + 1; // 记录原始行号

      // 校验数据
      const validation = this.validateRecord(record, i - headerRow);
      record._validation = validation;

      this.state.parsedData.push(record);
      this.state.validationResults.push(validation);
    }

    // 渲染预览表格
    this.renderPreviewTable();

    // 更新校验摘要
    this.updateValidationSummary();

    // 切换到步骤2
    this.setStep(2);

    // 显示确认操作区
    const validCount = this.state.validationResults.filter(v => v.isValid).length;
    if (validCount > 0) {
      document.getElementById('confirmActions').classList.remove('hidden');
      document.getElementById('confirmActions').classList.add('fade-in-up');
      document.getElementById('importCount').textContent = validCount;
    }

    this.showToast(`完成校验：${this.state.parsedData.length} 条数据`, 'success');
  },

  /**
   * 校验单条记录
   */
  validateRecord(record, index) {
    const errors = [];
    const warnings = [];

    this.requiredFields.forEach(field => {
      const value = record[field.key];

      // 必填检查
      if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
        errors.push(`${field.label}不能为空`);
        return;
      }

      // 数值类型检查
      if (field.type === 'number' && value !== undefined && value !== null && value !== '') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push(`${field.label}必须是有效数字`);
          return;
        }

        // 范围检查
        if (field.min !== undefined && numValue < field.min) {
          errors.push(`${field.label}不能小于${field.min}`);
        }
        if (field.max !== undefined && numValue > field.max) {
          errors.push(`${field.label}不能大于${field.max}`);
        }

        // 业务逻辑警告：尺寸差异过大
        if (field.key.startsWith('new_')) {
          const origKey = field.key.replace('new_', 'orig_');
          const origValue = parseFloat(record[origKey]);
          if (!isNaN(origValue) && origValue > 0) {
            const diffPercent = ((numValue - origValue) / origValue * 100).toFixed(1);
            if (Math.abs(diffPercent) > 200) {
              warnings.push(`${field.label}差异过大(${diffPercent}%)，请核实`);
            } else if (Math.abs(diffPercent) > 50) {
              warnings.push(`${field.label}差异较大(${diffPercent}%)`);
            }
          }
        }
      }
    });

    // 检查订单号重复
    const orderId = record.order_id || record['订单号'];
    if (orderId) {
      const duplicates = this.state.parsedData.filter((r, idx) =>
        (r.order_id || r['订单号']) === orderId && idx < index
      );
      if (duplicates.length > 0) {
        errors.push('订单号重复');
      }
    }

    return {
      index,
      isValid: errors.length === 0,
      hasWarnings: warnings.length > 0,
      errors,
      warnings
    };
  },

  /**
   * 渲染预览表格
   */
  renderPreviewTable() {
    const tbody = document.getElementById('previewTableBody');
    const showOnlyErrors = document.getElementById('showOnlyErrors').checked;

    let displayData = this.state.parsedData;
    if (showOnlyErrors) {
      displayData = displayData.filter(d => !d._validation.isValid);
    }

    if (displayData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" class="px-4 py-12 text-center text-neutral-400">
            <i class="fas fa-inbox text-4xl mb-3 block"></i>
            ${showOnlyErrors ? '没有错误数据' : '暂无数据'}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = displayData.map((record, idx) => {
      const v = record._validation;
      const rowClass = v.isValid ? (v.hasWarnings ? 'warning-row' : 'success-row') : 'error-row';
      const statusTag = v.isValid
        ? `<span class="status-tag ${v.hasWarnings ? 'warning' : 'valid'}">
             <i class="fas ${v.hasWarnings ? 'fa-exclamation-triangle' : 'fa-check'} mr-1"></i>
             ${v.hasWarnings ? '有警告' : '有效'}
           </span>`
        : `<span class="status-tag invalid">
             <i class="fas fa-times mr-1"></i>错误
           </span>`;

      return `
        <tr class="${rowClass}">
          <td class="px-4 py-3 row-number">${record._rowNum}</td>
          <td class="px-4 py-3 font-medium">${this.escapeHtml(record.order_id || record['订单号'] || '-')}</td>
          <td class="px-4 py-3">${this.escapeHtml(record.customer_name || record['客户名称'] || '-')}</td>
          <td class="px-4 py-3 numeric-cell">${this.formatNum(record.orig_length || record['原长(cm)'])}</td>
          <td class="px-4 py-3 numeric-cell">${this.formatNum(record.orig_width || record['原宽(cm)'])}</td>
          <td class="px-4 py-3 numeric-cell">${this.formatNum(record.orig_height || record['原高(cm)'])}</td>
          <td class="px-4 py-3 numeric-cell">${this.formatNum(record.orig_weight || record['原重(kg)'])}</td>
          <td class="px-4 py-3 numeric-cell font-medium text-primary">${this.formatNum(record.new_length || record['新长(cm)'])}</td>
          <td class="px-4 py-3 numeric-cell font-medium text-primary">${this.formatNum(record.new_width || record['新宽(cm)'])}</td>
          <td class="px-4 py-3 numeric-cell font-medium text-primary">${this.formatNum(record.new_height || record['新高(cm)'])}</td>
          <td class="px-4 py-3 numeric-cell font-medium text-primary">${this.formatNum(record.new_weight || record['新重(kg)'])}</td>
          <td class="px-4 py-3">${statusTag}</td>
        </tr>
      `;
    }).join('');

    // 渲染错误详情
    this.renderErrorDetails();
  },

  /**
   * 渲染错误详情
   */
  renderErrorDetails() {
    const errorPanel = document.getElementById('errorPanel');
    const errorList = document.getElementById('errorList');
    const errors = this.state.validationResults.filter(v => !v.isValid);

    if (errors.length === 0) {
      errorPanel.classList.add('hidden');
      return;
    }

    errorPanel.classList.remove('hidden');
    errorList.innerHTML = errors.map(v => `
      <div class="error-item">
        <span class="row-num">第${this.state.parsedData[v.index]._rowNum}行</span>
        <div class="error-msg">
          ${v.errors.map(e => `• ${e}`).join('<br>')}
          ${v.warnings.length > 0 ? '<br>' + v.warnings.map(w => `<span class="text-warning">⚠ ${w}</span>`).join('<br>') : ''}
        </div>
      </div>
    `).join('');
  },

  /**
   * 更新校验摘要
   */
  updateValidationSummary() {
    const summary = document.getElementById('validationSummary');
    summary.classList.remove('hidden');
    summary.classList.add('fade-in-up');

    const total = this.state.validationResults.length;
    const valid = this.state.validationResults.filter(v => v.isValid).length;
    const errors = this.state.validationResults.filter(v => !v.isValid).length;
    const warnings = this.state.validationResults.filter(v => v.hasWarnings).length;

    document.getElementById('totalRows').textContent = total;
    document.getElementById('validRows').textContent = valid;
    document.getElementById('errorRows').textContent = errors;
    document.getElementById('warningRows').textContent = warnings;
  },

  /**
   * 切换错误过滤
   */
  toggleErrorFilter() {
    this.renderPreviewTable();
  },

  /**
   * 设置当前步骤
   */
  setStep(step) {
    this.state.currentStep = step;

    document.querySelectorAll('.import-step').forEach(el => {
      const stepNum = parseInt(el.dataset.step);
      el.classList.remove('active', 'completed');

      if (stepNum < step) {
        el.classList.add('completed');
      } else if (stepNum === step) {
        el.classList.add('active');
      }
    });
  },

  /**
   * 确认导入
   */
  confirmImport() {
    const skipErrors = document.getElementById('skipErrors').checked;
    const validRecords = this.state.parsedData.filter(r =>
      skipErrors ? r._validation.isValid : true
    );

    if (validRecords.length === 0) {
      this.showToast('没有可导入的有效数据', 'error');
      return;
    }

    // 生成补款任务数据
    const tasks = validRecords.map(record => {
      const now = new Date();
      const task_id = `SUP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;

      const origLength = parseFloat(record.orig_length || record['原长(cm)']);
      const origWidth = parseFloat(record.orig_width || record['原宽(cm)']);
      const origHeight = parseFloat(record.orig_height || record['原高(cm)']);
      const origWeight = parseFloat(record.orig_weight || record['原重(kg)']);

      const newLength = parseFloat(record.new_length || record['新长(cm)']);
      const newWidth = parseFloat(record.new_width || record['新宽(cm)']);
      const newHeight = parseFloat(record.new_height || record['新高(cm)']);
      const newWeight = parseFloat(record.new_weight || record['新重(kg)']);

      const origVolume = (origLength * origWidth * origHeight) / 1000000; // cm³ to m³
      const newVolume = (newLength * newWidth * newHeight) / 1000000;

      // 简化的费用计算（基于体积）
      const pricePerM3 = 8000; // 元/立方米/月
      const originalFee = Math.round(origVolume * pricePerM3 * 100) / 100;
      const recalculatedFee = Math.round(newVolume * pricePerM3 * 100) / 100;
      const supplementAmount = Math.round((recalculatedFee - originalFee) * 100) / 100;

      return {
        task_id,
        order_id: record.order_id || record['订单号'],
        customer_id: `CUST-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        customer_name: record.customer_name || record['客户名称'] || '未知客户',
        status: supplementAmount > 0 ? 'pending_confirm' : 'pending_input',
        original_dimensions: {
          length: origLength,
          width: origWidth,
          height: origHeight,
          weight: origWeight,
          volume: origVolume,
          unit: 'cm/kg'
        },
        actual_dimensions: {
          length: newLength,
          width: newWidth,
          height: newHeight,
          weight: newWeight,
          volume: newVolume,
          unit: 'cm/kg'
        },
        evidence_images: [],
        original_fee: originalFee,
        recalculated_fee: recalculatedFee,
        supplement_amount: Math.max(0, supplementAmount),
        fee_details: [
          {
            category: '仓储费',
            item_name: '月度仓储费',
            unit_price: pricePerM3,
            unit: '元/立方米/月',
            quantity_original: origVolume,
            quantity_actual: newVolume,
            original_subtotal: originalFee,
            new_subtotal: recalculatedFee,
            difference: recalculatedFee - originalFee
          }
        ],
        created_at: now.toISOString().slice(0, 19).replace('T', ' '),
        updated_at: now.toISOString().slice(0, 19).replace('T', ' '),
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') + ':59',
        bill_info: null,
        appeal_info: null,
        history: [
          {
            action: 'create',
            operator: 'system',
            timestamp: now.toISOString().slice(0, 19).replace('T', ' '),
            detail: '通过批量导入创建补款任务'
          },
          {
            action: 'input_dimensions',
            operator: 'system',
            timestamp: now.toISOString().slice(0, 19).replace('T', ' '),
            detail: '自动导入真实尺寸'
          },
          {
            action: 'recalculate_fee',
            operator: 'system',
            timestamp: now.toISOString().slice(0, 19).replace('T', ' '),
            detail: 'TMS费用重算完成'
          }
        ]
      };
    });

    // 保存到localStorage（模拟后端存储）
    this.saveTasksToStorage(tasks);

    // 切换到步骤3
    this.setStep(3);

    // 显示成功弹窗
    document.getElementById('createdCount').textContent = tasks.length;
    openModal('successModal');

    console.log(`[Import] 成功导入 ${tasks.length} 条任务`);
  },

  /**
   * 保存任务到存储
   */
  saveTasksToStorage(tasks) {
    try {
      let existingTasks = JSON.parse(localStorage.getItem('supplement_tasks_imported') || '[]');
      existingTasks = existingTasks.concat(tasks);
      localStorage.setItem('supplement_tasks_imported', JSON.stringify(existingTasks));
    } catch (e) {
      console.error('[Import] 保存失败:', e);
    }
  },

  /**
   * 返回修改
   */
  goBack() {
    this.setStep(2);
  },

  /**
   * 重置所有状态
   */
  reset() {
    this.state = {
      currentStep: 1,
      file: null,
      workbook: null,
      sheetData: [],
      parsedData: [],
      validationResults: [],
      showOnlyErrors: false
    };

    // 重置UI
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
    document.getElementById('uploadSuccess').classList.add('hidden');
    document.getElementById('dropZone').classList.remove('has-file');
    document.getElementById('fileInput').value = '';

    document.getElementById('sheetSelect').innerHTML = '<option value="">请先上传文件</option>';
    document.getElementById('sheetSelect').disabled = true;
    document.getElementById('parseBtn').disabled = true;

    document.getElementById('importStats').classList.add('hidden');
    document.getElementById('validationSummary').classList.add('hidden');
    document.getElementById('confirmActions').classList.add('hidden');
    document.getElementById('errorPanel').classList.add('hidden');

    document.getElementById('previewTableBody').innerHTML = `
      <tr>
        <td colspan="12" class="px-4 py-12 text-center text-neutral-400">
          <i class="fas fa-inbox text-4xl mb-3 block"></i>
          请上传文件后查看数据预览
        </td>
      </tr>
    `;

    document.getElementById('showOnlyErrors').checked = false;

    this.setStep(1);
    this.showToast('已重置', 'info');
  },

  /**
   * 下载模板
   */
  downloadTemplate() {
    const templateData = [
      ['订单号', '客户名称', '原长(cm)', '原宽(cm)', '原高(cm)', '原重(kg)', '新长(cm)', '新宽(cm)', '新高(cm)', '新重(kg)'],
      ['ORD-20260601-001', '测试客户A', 50, 40, 30, 20, 55, 42, 35, 22],
      ['ORD-20260602-002', '测试客户B', 35, 25, 20, 15, 38, 28, 23, 16]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '补款数据导入模板');

    // 设置列宽
    ws['!cols'] = [
      { wch: 18 }, // 订单号
      { wch: 14 }, // 客户名称
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, // 原尺寸
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }  // 新尺寸
    ];

    XLSX.writeFile(wb, '费用补收导入模板.xlsx');
    this.showToast('模板下载中...', 'info');
  },

  // ========== 工具方法 ==========

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },

  formatNum(value) {
    if (value === undefined || value === null || value === '') return '-';
    const num = parseFloat(value);
    return isNaN(num) ? '-' : num.toFixed(1);
  },

  escapeHtml(str) {
    if (!str) return '-';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-orange-50 border-orange-200 text-orange-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    toast.className = `${colors[type]} border rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 fade-in-up`;
    toast.innerHTML = `
      <i class="fas ${icons[type]}"></i>
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  ImportApp.init();
});
