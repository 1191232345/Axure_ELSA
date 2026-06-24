/**
 * 费用补收模块 - 工具函数
 */

const SupplementUtils = {
  /**
   * 格式化金额显示
   */
  formatCurrency(amount) {
    if (amount === null || amount === undefined) return '¥0.00';
    return '¥' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * 计算体积（立方米）
   */
  calculateVolume(length, width, height) {
    return (length * width * height) / 1000000; // cm -> m³
  },

  /**
   * 计算尺寸差异百分比
   */
  calculateVolumeDiff(originalVol, actualVol) {
    if (!originalVol || originalVol === 0) return 0;
    return ((actualVol - originalVol) / originalVol * 100).toFixed(1);
  },

  /**
   * 格式化倒计时
   */
  formatCountdown(deadlineStr) {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline - now;

    if (diff <= 0) {
      return { text: '已过期', urgent: true, expired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let text = '';
    if (days > 0) {
      text = `${days}天${hours}小时`;
    } else if (hours > 0) {
      text = `${hours}小时${minutes}分钟`;
    } else {
      text = `${minutes}分钟`;
    }

    const urgent = diff < 24 * 60 * 60 * 1000; // 小于24小时

    return { text, urgent, expired: false };
  },

  /**
   * 状态映射
   */
  statusMap: {
    'pending_input': { label: '待输入', class: 'status-pending_input' },
    'pending_confirm': { label: '待确认', class: 'status-pending_confirm' },
    'confirmed': { label: '已完成', class: 'status-confirmed' },
    'appealed': { label: '已申诉', class: 'status-appealed' }
  },

  /**
   * 获取状态标签HTML
   */
  getStatusBadge(status) {
    const info = this.statusMap[status] || { label: status, class: '' };
    return `<span class="status-badge ${info.class}">${info.label}</span>`;
  },

  /**
   * 验证尺寸数据
   */
  validateDimensions(dimensions) {
    const errors = {};

    // 检查必填和正值
    ['length', 'width', 'height', 'weight'].forEach(field => {
      const value = dimensions[field];
      if (value === null || value === undefined || value === '') {
        errors[field] = `${this.getFieldLabel(field)}不能为空`;
      } else if (value <= 0) {
        errors[field] = `${this.getFieldLabel(field)}必须大于0`;
      }
    });

    // 检查上限
    if (dimensions.length > 500) errors.length = '长度不能超过500cm';
    if (dimensions.width > 500) errors.width = '宽度不能超过500cm';
    if (dimensions.height > 500) errors.height = '高度不能超过500cm';
    if (dimensions.weight > 1000) errors.weight = '重量不能超过1000kg';

    // 检查小数位数
    ['length', 'width', 'height'].forEach(field => {
      const value = String(dimensions[field]);
      if (value.includes('.') && value.split('.')[1].length > 1) {
        errors[field] = `${this.getFieldLabel(field)}最多保留1位小数`;
      }
    });

    if (String(dimensions.weight).includes('.') && String(dimensions.weight).split('.')[1].length > 2) {
      errors.weight = '重量最多保留2位小数';
    }

    // 检查体积突变
    if (!errors.length && !errors.width && !errors.height && dimensions.original_volume) {
      const originalVolume = this.calculateVolume(
        dimensions.original_length,
        dimensions.original_width,
        dimensions.original_height
      );
      const actualVolume = this.calculateVolume(dimensions.length, dimensions.width, dimensions.height);
      const diffPercent = Math.abs((actualVolume - originalVolume) / originalVolume * 100);

      if (diffPercent > 200) {
        errors.volume = `尺寸差异过大(${diffPercent.toFixed(1)}%)，请核实测量数据`;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * 获取字段中文标签
   */
  getFieldLabel(field) {
    const labels = {
      length: '长度',
      width: '宽度',
      height: '高度',
      weight: '重量'
    };
    return labels[field] || field;
  },

  /**
   * 生成任务ID
   */
  generateTaskId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    return `SUP-${dateStr}-${random}`;
  },

  /**
   * 生成账单ID
   */
  generateBillId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    return `BILL-${dateStr}-${random}`;
  },

  /**
   * 生成工单ID
   */
  generateTicketId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    return `TK-${dateStr}-${random}`;
  },

  /**
   * 格式化日期时间
   */
  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },

  /**
   * 验证手机号
   */
  validatePhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },

  /**
   * 验证申诉表单
   */
  validateAppealForm(data) {
    const errors = {};

    if (!data.appeal_type) {
      errors.appeal_type = '请选择申诉类型';
    }

    if (!data.reason || data.reason.trim().length < 10) {
      errors.reason = '申诉理由至少需要10个字';
    } else if (data.reason.trim().length > 500) {
      errors.reason = '申诉理由不能超过500个字';
    }

    if (!data.evidence_images || data.evidence_images.length < 1) {
      errors.evidence = '请至少上传1张证据图片';
    } else if (data.evidence_images.length > 5) {
      errors.evidence = '证据图片最多5张';
    }

    if (!data.contact_phone || !this.validatePhone(data.contact_phone)) {
      errors.phone = '请输入正确的11位手机号码';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * 模拟TMS费用计算
   */
  simulateTMSCalculation(originalDim, actualDim) {
    // 原费用构成
    const originalVolume = this.calculateVolume(originalDim.length, originalDim.width, originalDim.height);
    const actualVolume = this.calculateVolume(actualDim.length, actualDim.width, actualDim.height);

    // 仓储费：5000元/立方米/月
    const storageFeePerUnit = 5000;
    const originalStorageFee = storageFeePerUnit * originalVolume;
    const actualStorageFee = storageFeePerUnit * actualVolume;

    // 操作费：8333.33元/立方米（入库）
    const handlingFeePerUnit = 8333.33;
    const originalHandlingFee = handlingFeePerUnit * originalVolume;
    const actualHandlingFee = handlingFeePerUnit * actualVolume;

    return {
      original_fee: originalStorageFee + originalHandlingFee,
      recalculated_fee: actualStorageFee + actualHandlingFee,
      supplement_amount: (actualStorageFee + actualHandlingFee) - (originalStorageFee + originalHandlingFee),
      fee_details: [
        {
          category: '仓储费',
          item_name: '月度仓储费',
          unit_price: storageFeePerUnit,
          unit: '元/立方米/月',
          quantity_original: originalVolume,
          quantity_actual: actualVolume,
          original_subtotal: originalStorageFee,
          new_subtotal: actualStorageFee,
          difference: actualStorageFee - originalStorageFee
        },
        {
          category: '操作费',
          item_name: '入库操作费',
          unit_price: handlingFeePerUnit,
          unit: '元/立方米',
          quantity_original: originalVolume,
          quantity_actual: actualVolume,
          original_subtotal: originalHandlingFee,
          new_subtotal: actualHandlingFee,
          difference: actualHandlingFee - originalHandlingFee
        }
      ]
    };
  }
};
