/**
 * 费用补收模块 - 主逻辑控制器
 */

const SupplementApp = {
  currentView: 'list', // 'list' | 'detail'
  currentTaskId: null,
  evidenceFiles: [],
  appealEvidenceFiles: [],

  /**
   * 初始化应用
   */
  async init() {
    console.log('[App] 初始化费用补收模块...');

    // 加载数据
    const success = await SupplementApi.init();
    if (!success) return;

    // 绑定事件
    this.bindEvents();

    // 渲染列表
    this.renderList();

    // 加载逻辑说明文档
    this.loadLogicDocs();

    // 启动倒计时更新定时器
    this.startCountdownTimer();

    console.log('[App] 初始化完成');
  },

  /**
   * 绑定全局事件
   */
  bindEvents() {
    // 搜索和筛选
    document.getElementById('searchBtn').addEventListener('click', () => this.renderList());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetFilter());

    // 状态卡片点击
    document.querySelectorAll('.status-card').forEach(card => {
      card.addEventListener('click', () => {
        const status = card.dataset.status;
        document.getElementById('filterStatus').value = status;
        this.renderList();
      });
    });

    // 尺寸编辑弹窗 - 协议勾选
    document.getElementById('agreeTerms').addEventListener('change', (e) => {
      document.getElementById('finalConfirmBtn').disabled = !e.target.checked;
    });

    // 申诉表单 - 字数统计
    document.getElementById('appealReason').addEventListener('input', (e) => {
      document.getElementById('reasonCharCount').textContent = e.target.value.length;
    });

    // Enter键搜索
    document.getElementById('filterKeyword').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.renderList();
    });
  },

  /**
   * 渲染列表页
   */
  renderList() {
    const filters = {
      status: document.getElementById('filterStatus').value,
      keyword: document.getElementById('filterKeyword').value.trim()
    };

    const tasks = SupplementApi.getTasks(filters);
    SupplementRenderer.renderTable(tasks);

    // 更新统计（使用全部数据）
    const counts = SupplementApi.getStatusCounts();
    SupplementRenderer.renderStatusCounts(counts);
  },

  /**
   * 重置筛选条件
   */
  resetFilter() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterKeyword').value = '';
    this.renderList();
  },

  /**
   * 通过统计卡片筛选状态
   */
  filterByStatus(status) {
    document.getElementById('filterStatus').value = status;
    this.renderList();
  },

  /**
   * 显示列表视图
   */
  showList() {
    document.getElementById('listView').classList.remove('hidden');
    document.getElementById('detailView').classList.add('hidden');
    document.getElementById('backToListBtn').classList.add('hidden');

    this.currentView = 'list';
    this.currentTaskId = null;

    // 刷新列表数据
    this.renderList();
  },

  /**
   * 显示详情视图
   */
  showDetail(taskId) {
    const task = SupplementApi.getTaskById(taskId);
    if (!task) {
      showToast('任务不存在', 'error');
      return;
    }

    this.currentTaskId = taskId;
    SupplementApi.currentTask = task;

    // 切换视图
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    document.getElementById('backToListBtn').classList.remove('hidden');

    this.currentView = 'detail';

    // 渲染详情
    SupplementRenderer.renderStepBar(task.status);
    SupplementRenderer.renderTaskDetail(task);

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ==================== 尺寸编辑功能 ====================

  /**
   * 打开尺寸编辑弹窗
   */
  openDimensionModal() {
    const task = SupplementApi.currentTask;
    if (!task) return;

    // 填充当前值
    SupplementRenderer.fillDimensionForm(task);
    this.evidenceFiles = [];

    // 如果已有图片，显示预览
    if (task.evidence_images && task.evidence_images.length > 0) {
      const previewContainer = document.getElementById('evidencePreview');
      previewContainer.innerHTML = task.evidence_images.map(img => `
        <div class="evidence-image-wrapper">
          <img src="${img.url}" alt="${img.file_name}">
        </div>
      `).join('');
    }

    openModal('dimensionModal');
  },

  /**
   * 处理证明图片上传
   */
  handleEvidenceUpload(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('evidencePreview');

    Array.from(files).forEach(file => {
      // 验证文件类型
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        showToast(`文件 ${file.name} 格式不支持，仅支持 JPG/PNG`, 'error');
        return;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast(`文件 ${file.name} 超过5MB限制`, 'error');
        return;
      }

      // 验证数量限制 (最多3张)
      const existingCount = previewContainer.children.length + this.evidenceFiles.length;
      if (existingCount >= 3) {
        showToast('最多上传3张图片', 'warning');
        return;
      }

      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        this.evidenceFiles.push({
          file: file,
          url: e.target.result,
          name: file.name
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'evidence-image-wrapper';
        wrapper.innerHTML = `
          <img src="${e.target.result}" alt="${file.name}">
          <div class="remove-btn" onclick="SupplementApp.removeEvidenceImage(this, ${this.evidenceFiles.length - 1})">
            <i class="fas fa-times"></i>
          </div>
        `;
        previewContainer.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });

    // 清空input以允许重复选择同一文件
    event.target.value = '';
  },

  /**
   * 移除已上传的证明图片
   */
  removeEvidenceImage(element, index) {
    element.parentElement.remove();
    this.evidenceFiles.splice(index, 1);
  },

  /**
   * 保存尺寸信息
   */
  saveDimensions() {
    const dimensions = {
      length: parseFloat(document.getElementById('dimLength').value),
      width: parseFloat(document.getElementById('dimWidth').value),
      height: parseFloat(document.getElementById('dimHeight').value),
      weight: parseFloat(document.getElementById('dimWeight').value),
      original_length: SupplementApi.currentTask.original_dimensions.length,
      original_width: SupplementApi.currentTask.original_dimensions.width,
      original_height: SupplementApi.currentTask.original_dimensions.height,
      original_volume: null // 将在validateDimensions中计算
    };

    // 校验
    const validation = SupplementUtils.validateDimensions(dimensions);

    // 显示/隐藏错误
    ['Length', 'Width', 'Height', 'Weight'].forEach(field => {
      const fieldLower = field.toLowerCase();
      if (validation.errors[fieldLower]) {
        SupplementRenderer.showFieldError(`dim${field}Error`, validation.errors[fieldLower]);
      } else {
        SupplementRenderer.hideFieldError(`dim${field}Error`);
      }
    });

    if (validation.errors.volume) {
      showToast(validation.errors.volume, 'warning');
    }

    if (!validation.valid) {
      return;
    }

    // 保存
    const result = SupplementApi.updateDimensions(this.currentTaskId, dimensions);

    if (result.success) {
      closeModal('dimensionModal');
      showToast('尺寸保存成功，费用重算完成', 'success');

      // 刷新详情页
      this.showDetail(this.currentTaskId);
    } else {
      showToast(result.message || '保存失败', 'error');
    }
  },

  // ==================== 费用明细展开/收起 ====================

  /**
   * 切换费用明细显示
   */
  toggleFeeDetail() {
    const content = document.getElementById('feeDetailContent');
    const icon = document.getElementById('feeDetailIcon');

    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? '' : 'rotate(180deg)';
  },

  // ==================== 确认补收功能 ====================

  /**
   * 打开确认弹窗
   */
  openConfirmModal() {
    const task = SupplementApi.currentTask;
    if (!task) return;

    // 检查前置条件
    if (task.status !== 'pending_confirm') {
      showToast('当前状态不允许确认补收', 'warning');
      return;
    }

    if (!task.recalculated_fee || !task.supplement_amount) {
      showToast('费用尚未计算完成，请稍候', 'warning');
      return;
    }

    SupplementRenderer.fillConfirmModal(task);
    openModal('confirmModal');
  },

  /**
   * 最终确认补收
   */
  finalConfirm() {
    const result = SupplementApi.confirmSupplement(this.currentTaskId);

    if (result.success) {
      closeModal('confirmModal');
      showToast(`补收确认成功！账单号：${result.billId}`, 'success');

      // 刷新详情
      this.showDetail(this.currentTaskId);
    } else {
      showToast(result.message || '确认失败', 'error');
    }
  },

  // ==================== 申诉功能 ====================

  /**
   * 打开申诉弹窗
   */
  openAppealModal() {
    const task = SupplementApi.currentTask;
    if (!task) return;

    SupplementRenderer.clearAppealForm();
    this.appealEvidenceFiles = [];

    // 设置期望处理时间最小值为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('appealExpectedDate').min = tomorrow.toISOString().split('T')[0];

    openModal('appealModal');
  },

  /**
   * 处理申诉证据上传
   */
  handleAppealEvidenceUpload(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('appealEvidencePreview');

    Array.from(files).forEach(file => {
      // 验证文件类型
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        showToast(`文件 ${file.name} 格式不支持`, 'error');
        return;
      }

      // 验证文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast(`文件 ${file.name} 超过10MB限制`, 'error');
        return;
      }

      // 验证数量限制 (1-5张)
      const existingCount = previewContainer.children.length + this.appealEvidenceFiles.length;
      if (existingCount >= 5) {
        showToast('最多上传5张证据图片', 'warning');
        return;
      }

      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        this.appealEvidenceFiles.push({
          file: file,
          url: e.target.result,
          name: file.name
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'evidence-image-wrapper';
        wrapper.innerHTML = `
          <img src="${e.target.result}" alt="${file.name}">
          <div class="remove-btn" onclick="SupplementApp.removeAppealEvidenceImage(this, ${this.appealEvidenceFiles.length - 1})">
            <i class="fas fa-times"></i>
          </div>
        `;
        previewContainer.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  },

  /**
   * 移除申诉证据图片
   */
  removeAppealEvidenceImage(element, index) {
    element.parentElement.remove();
    this.appealEvidenceFiles.splice(index, 1);
  },

  /**
   * 保存申诉草稿
   */
  saveAppealDraft() {
    showToast('草稿已保存', 'success');
    closeModal('appealModal');
  },

  /**
   * 提交申诉
   */
  submitAppeal() {
    const data = {
      appeal_type: document.getElementById('appealType').value,
      reason: document.getElementById('appealReason').value.trim(),
      evidence_images: this.appealEvidenceFiles.map(f => ({
        file_name: f.name,
        url: f.url
      })),
      contact_phone: document.getElementById('appealPhone').value.trim(),
      expected_date: document.getElementById('appealExpectedDate').value
    };

    // 校验
    const validation = SupplementUtils.validateAppealForm(data);

    // 显示错误
    Object.keys(validation.errors).forEach(field => {
      const errorEl = document.getElementById(`appeal${field.charAt(0).toUpperCase() + field.slice(1)}Error`);
      if (errorEl && field !== 'evidence') {
        errorEl.textContent = validation.errors[field];
        errorEl.classList.remove('hidden');
      }
    });

    if (validation.errors.evidence) {
      SupplementRenderer.showFieldError('appealEvidenceError', validation.errors.evidence);
    } else {
      SupplementRenderer.hideFieldError('appealEvidenceError');
    }

    if (!validation.valid) {
      return;
    }

    // 提交
    const result = SupplementApi.submitAppeal(this.currentTaskId, data);

    if (result.success) {
      closeModal('appealModal');
      showToast(`申诉提交成功！工单号：${result.ticketId}`, 'success');

      // 刷新详情
      this.showDetail(this.currentTaskId);
    } else {
      showToast(result.message || '提交失败', 'error');
    }
  },

  // ==================== 辅助功能 ====================

  /**
   * 启动倒计时定时器
   */
  startCountdownTimer() {
    // 每分钟更新一次倒计时
    setInterval(() => {
      if (this.currentView === 'detail' && SupplementApi.currentTask) {
        const countdown = SupplementUtils.formatCountdown(SupplementApi.currentTask.deadline);
        const remainingEl = document.getElementById('detailRemainingTime');
        if (remainingEl) {
          remainingEl.textContent = countdown.text;
          remainingEl.className = countdown.urgent || countdown.expired
            ? 'font-medium text-danger countdown-urgent'
            : 'font-medium';
        }
      }
    }, 60000); // 每分钟
  },

  /**
   * 加载逻辑说明文档
   */
  loadLogicDocs() {
    fetch('logic-docs.html')
      .then(r => r.text())
      .then(html => {
        document.getElementById('logic-docs-container').innerHTML = html;
      })
      .catch(() => {
        document.getElementById('logic-docs-container').innerHTML =
          '<p class="text-center text-gray-500 py-4">逻辑说明加载失败</p>';
      });
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  SupplementApp.init();
});
