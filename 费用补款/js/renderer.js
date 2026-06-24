/**
 * 费用补收模块 - 渲染层
 */

const SupplementRenderer = {
  /**
   * 渲染任务列表表格
   */
  renderTable(tasks) {
    const tbody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const totalCount = document.getElementById('totalCount');

    if (!tasks || tasks.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      totalCount.textContent = '0';
      return;
    }

    emptyState.classList.add('hidden');
    totalCount.textContent = tasks.length;

    tbody.innerHTML = tasks.map(task => `
      <tr class="hover:bg-gray-50 transition-colors cursor-pointer" onclick="SupplementApp.showDetail('${task.task_id}')">
        <td class="px-4 py-3 font-medium text-primary">${task.task_id}</td>
        <td class="px-4 py-3">${task.order_id}</td>
        <td class="px-4 py-3 font-semibold ${task.supplement_amount > 0 ? 'text-danger' : ''}">
          ${SupplementUtils.formatCurrency(task.supplement_amount)}
        </td>
        <td class="px-4 py-3">${SupplementUtils.getStatusBadge(task.status)}</td>
        <td class="px-4 py-3">
          <span class="${this.getDeadlineClass(task.deadline)}">
            ${SupplementUtils.formatDateTime(task.deadline).split(' ')[0]}
          </span>
        </td>
        <td class="px-4 py-3 text-neutral-500">${SupplementUtils.formatDateTime(task.created_at).split(' ')[0]}</td>
        <td class="px-4 py-3">
          <button class="text-primary hover:text-primary-light text-sm font-medium" onclick="event.stopPropagation(); SupplementApp.showDetail('${task.task_id}')">
            <i class="fas fa-eye mr-1"></i>查看
          </button>
        </td>
      </tr>
    `).join('');
  },

  /**
   * 渲染状态统计卡片
   */
  renderStatusCounts(counts) {
    const elements = {
      'countAll': counts.all,
      'countPendingInput': counts.pending_input,
      'countPendingConfirm': counts.pending_confirm,
      'countConfirmed': counts.confirmed,
      'countAppealed': counts.appealed
    };

    for (const [id, value] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }
  },

  /**
   * 渲染详情页 - 步骤条
   */
  renderStepBar(status) {
    const steps = [
      { key: 'input', label: '输入尺寸', icon: 'fa-edit' },
      { key: 'recalculate', label: '费用重计', icon: 'fa-calculator' },
      { key: 'confirm', label: '确认补收', icon: 'fa-check-circle' },
      { key: 'complete', label: '完成', icon: 'fa-flag-checkered' }
    ];

    // 根据状态确定当前步骤
    let currentStep = 0;
    switch (status) {
      case 'pending_input':
        currentStep = 0;
        break;
      case 'pending_confirm':
        currentStep = 1;
        break;
      case 'confirmed':
      case 'appealed':
        currentStep = 2;
        break;
      default:
        currentStep = 0;
    }

    const stepBar = document.getElementById('stepBar');
    stepBar.innerHTML = steps.map((step, index) => {
      let stateClass = '';
      if (index < currentStep) {
        stateClass = 'completed';
      } else if (index === currentStep) {
        stateClass = 'active';
      }

      return `
        <div class="step-item ${stateClass}">
          <div class="step-circle">
            ${index < currentStep ? '<i class="fas fa-check"></i>' : (index + 1)}
          </div>
          <span class="step-label">${step.label}</span>
        </div>
      `;
    }).join('');
  },

  /**
   * 渲染详情页 - 基本信息
   */
 renderTaskDetail(task) {
    document.getElementById('detailTaskId').textContent = task.task_id;
    document.getElementById('detailOrderId').textContent = task.order_id;
    document.getElementById('detailCustomerName').textContent = task.customer_name;
    document.getElementById('detailCreatedAt').textContent = SupplementUtils.formatDateTime(task.created_at);
    document.getElementById('detailDeadline').textContent = SupplementUtils.formatDateTime(task.deadline);

    // 倒计时
    const countdown = SupplementUtils.formatCountdown(task.deadline);
    const remainingEl = document.getElementById('detailRemainingTime');
    remainingEl.textContent = countdown.text;
    remainingEl.className = countdown.urgent || countdown.expired ? 'font-medium text-danger countdown-urgent' : 'font-medium';

    // 尺寸对比表
    this.renderDimensionTable(task);

    // 费用对比
    this.renderFeeComparison(task);

    // 操作按钮状态
    this.updateOperationButtons(task.status);

    // 处理历史时间线
    this.renderHistoryTimeline(task.history);
  },

  /**
   * 渲染尺寸对比表
   */
  renderDimensionTable(task) {
    const tbody = document.getElementById('dimensionTableBody');
    const originalDim = task.original_dimensions;
    const actualDim = task.actual_dimensions;

    const dimensions = [
      { field: 'length', label: '长度 (cm)', unit: 'cm' },
      { field: 'width', label: '宽度 (cm)', unit: 'cm' },
      { field: 'height', label: '高度 (cm)', unit: 'cm' },
      { field: 'weight', label: '重量 (kg)', unit: 'kg' }
    ];

    tbody.innerHTML = dimensions.map(dim => {
      const originalVal = originalDim[dim.field];
      const actualVal = actualDim[dim.field];

      // 计算差异（仅对长宽高计算百分比）
      let diffDisplay = '-';
      let diffClass = '';

      if (actualVal !== null && actualVal !== undefined && originalVal !== null) {
        if (dim.field === 'weight') {
          const diff = ((actualVal - originalVal) / originalVal * 100).toFixed(1);
          diffDisplay = `${diff > 0 ? '+' : ''}${diff}%`;
          diffClass = diff > 0 ? 'dimension-diff-positive' : 'dimension-diff-negative';
        } else {
          const diff = ((actualVal - originalVal) / originalVal * 100).toFixed(1);
          diffDisplay = `${diff > 0 ? '+' : ''}${diff}%`;
          diffClass = diff > 0 ? 'dimension-diff-positive' : 'dimension-diff-negative';
        }
      }

      return `
        <tr>
          <td class="px-4 py-3 font-medium">${dim.label}</td>
          <td class="px-4 py-3 text-center">${originalVal !== null ? originalVal + ' ' + dim.unit : '-'}</td>
          <td class="px-4 py-3 text-center font-semibold ${actualVal !== null ? 'text-primary' : 'text-neutral-400'}">
            ${actualVal !== null ? actualVal + ' ' + dim.unit : '待输入'}
          </td>
          <td class="px-4 py-3 text-center ${diffClass}">${diffDisplay}</td>
        </tr>
      `;
    }).join('');

    // 证明图片
    const evidenceSection = document.getElementById('evidenceSection');
    const evidenceImages = document.getElementById('evidenceImages');

    if (task.evidence_images && task.evidence_images.length > 0) {
      evidenceSection.classList.remove('hidden');
      evidenceImages.innerHTML = task.evidence_images.map(img => `
        <div class="evidence-image-wrapper" onclick="window.open('${img.url}', '_blank')">
          <img src="${img.url}" alt="${img.file_name}">
          <div class="remove-btn"><i class="fas fa-times"></i></div>
        </div>
      `).join('');
    } else {
      evidenceSection.classList.add('hidden');
    }
  },

  /**
   * 渲染费用对比
   */
  renderFeeComparison(task) {
    // 汇总显示
    document.getElementById('originalFeeDisplay').textContent = SupplementUtils.formatCurrency(task.original_fee);
    document.getElementById('recalculatedFeeDisplay').textContent =
      task.recalculated_fee ? SupplementUtils.formatCurrency(task.recalculated_fee) : '计算中...';
    document.getElementById('supplementAmountDisplay').textContent =
      task.supplement_amount !== null ? SupplementUtils.formatCurrency(task.supplement_amount) : '-';

    // 明细表格
    if (task.fee_details && task.fee_details.length > 0) {
      const tbody = document.getElementById('feeDetailBody');
      tbody.innerHTML = task.fee_details.map(detail => `
        <tr>
          <td class="px-4 py-3">
            <span class="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium">${detail.category}</span>
          </td>
          <td class="px-4 py-3">${detail.item_name}</td>
          <td class="px-4 py-3 text-right">${SupplementUtils.formatCurrency(detail.original_subtotal)}</td>
          <td class="px-4 py-3 text-right">${SupplementUtils.formatCurrency(detail.new_subtotal)}</td>
          <td class="px-4 py-3 text-right font-semibold ${detail.difference > 0 ? 'fee-diff-positive' : 'fee-diff-negative'}">
            ${detail.difference > 0 ? '+' : ''}${SupplementUtils.formatCurrency(detail.difference)}
          </td>
        </tr>
      `).join('');
    }
  },

  /**
   * 更新操作按钮状态
   */
  updateOperationButtons(status) {
    const confirmBtn = document.getElementById('confirmBtn');
    const appealBtn = document.getElementById('appealBtn');
    const editDimensionBtn = document.getElementById('editDimensionBtn');
    const operationHint = document.getElementById('operationHint');

    // 重置所有按钮
    confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    appealBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    editDimensionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    confirmBtn.disabled = false;
    appealBtn.disabled = false;
    editDimensionBtn.disabled = false;

    switch (status) {
      case 'pending_input':
        confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        confirmBtn.disabled = true;
        appealBtn.classList.add('opacity-50', 'cursor-not-allowed');
        appealBtn.disabled = true;
        operationHint.textContent = '请先输入真实尺寸信息，系统将自动重算费用。';
        operationHint.className = 'text-sm text-warning';
        break;

      case 'pending_confirm':
        operationHint.textContent = '请确认补收金额或发起申诉。确认后将生成正式账单，申诉将进入工单处理流程。';
        operationHint.className = 'text-sm text-info';
        break;

      case 'confirmed':
        confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        confirmBtn.disabled = true;
        appealBtn.classList.add('opacity-50', 'cursor-not-allowed');
        appealBtn.disabled = true;
        editDimensionBtn.classList.add('opacity-50', 'cursor-not-allowed');
        editDimensionBtn.disabled = true;
        operationHint.textContent = `已确认补收，账单号：${SupplementApi.currentTask?.bill_info?.bill_id || '-'}`;
        operationHint.className = 'text-sm text-success';
        break;

      case 'appealed':
        confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        confirmBtn.disabled = true;
        appealBtn.classList.add('opacity-50', 'cursor-not-allowed');
        appealBtn.disabled = true;
        editDimensionBtn.classList.add('opacity-50', 'cursor-not-allowed');
        editDimensionBtn.disabled = true;
        operationHint.textContent = `已发起申诉，工单号：${SupplementApi.currentTask?.appeal_info?.ticket_id || '-'}`;
        operationHint.className = 'text-sm text-danger';
        break;

      default:
        operationHint.textContent = '';
    }
  },

  /**
   * 渲染处理历史时间线
   */
  renderHistoryTimeline(history) {
    const container = document.getElementById('historyTimeline');

    if (!history || history.length === 0) {
      container.innerHTML = '<p class="text-neutral-500 text-center py-4">暂无处理记录</p>';
      return;
    }

    container.innerHTML = history.map(item => {
      let dotClass = 'system';
      if (item.operator === 'customer') dotClass = 'customer';
      if (item.action.includes('appeal')) dotClass = 'warning';

      return `
        <div class="timeline-item">
          <div class="timeline-dot ${dotClass}"></div>
          <div class="timeline-content">
            <div class="timeline-time">${item.timestamp}</div>
            <div class="timeline-action">${this.getActionLabel(item.action)}</div>
            <div class="timeline-detail">${item.detail}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * 获取操作标签
   */
  getActionLabel(action) {
    const labels = {
      'create': '创建任务',
      'input_dimensions': '输入尺寸',
      'recalculate_fee': '费用重算',
      'confirm_supplement': '确认补收',
      'submit_appeal': '提交申诉'
    };
    return labels[action] || action;
  },

  /**
   * 填充尺寸编辑弹窗
   */
  fillDimensionForm(task) {
    const dim = task.actual_dimensions;

    document.getElementById('dimLength').value = dim.length || '';
    document.getElementById('dimWidth').value = dim.width || '';
    document.getElementById('dimHeight').value = dim.height || '';
    document.getElementById('dimWeight').value = dim.weight || '';
  },

  /**
   * 清除尺寸编辑弹窗
   */
  clearDimensionForm() {
    document.getElementById('dimLength').value = '';
    document.getElementById('dimWidth').value = '';
    document.getElementById('dimHeight').value = '';
    document.getElementById('dimWeight').value = '';
    document.getElementById('dimRemark').value = '';
    document.getElementById('evidencePreview').innerHTML = '';

    // 清除错误提示
    ['Length', 'Width', 'Height', 'Weight'].forEach(field => {
      const errorEl = document.getElementById(`dim${field}Error`);
      if (errorEl) errorEl.classList.add('hidden');
    });
  },

  /**
   * 填充确认弹窗数据
   */
  fillConfirmModal(task) {
    document.getElementById('confirmAmountDisplay').textContent = SupplementUtils.formatCurrency(task.supplement_amount);
    document.getElementById('confirmOrderId').textContent = task.order_id;

    const dueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    document.getElementById('confirmDueDate').textContent = dueDate.toISOString().slice(0, 10);

    // 重置协议勾选
    document.getElementById('agreeTerms').checked = false;
    document.getElementById('finalConfirmBtn').disabled = true;
  },

  /**
   * 填充申诉表单
   */
  clearAppealForm() {
    document.getElementById('appealType').value = '';
    document.getElementById('appealReason').value = '';
    document.getElementById('reasonCharCount').textContent = '0';
    document.getElementById('appealPhone').value = '';
    document.getElementById('appealExpectedDate').value = '';
    document.getElementById('appealEvidencePreview').innerHTML = '';

    // 清除错误提示
    ['Type', 'Reason', 'Evidence', 'Phone'].forEach(field => {
      const errorEl = document.getElementById(`appeal${field}Error`);
      if (errorEl) errorEl.classList.add('hidden');
    });
  },

  /**
   * 获取截止日期样式类
   */
  getDeadlineClass(deadlineStr) {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) return 'text-danger font-medium';
    if (diff < 72 * 60 * 60 * 1000) return 'text-warning'; // 小于3天
    return 'text-neutral-600';
  },

  /**
   * 显示字段错误
   */
  showFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  },

  /**
   * 隐藏字段错误
   */
  hideFieldError(fieldId) {
    const errorEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
  }
};
