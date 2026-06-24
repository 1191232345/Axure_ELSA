/**
 * 费用补收模块 - 数据访问层
 */

const SupplementApi = {
  allTasks: [],
  currentTask: null,

  /**
   * 初始化：加载数据
   */
  async init() {
    try {
      let data;

      // 尝试使用 fetch（HTTP/HTTPS 环境）
      try {
        const response = await fetch(DATA_CONFIG.dataFile);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
      } catch (fetchError) {
        // file:// 协议下 fetch 会失败，尝试使用 XMLHttpRequest
        console.warn('[API] fetch 失败，尝试 XMLHttpRequest:', fetchError.message);
        data = await this.loadWithXHR(DATA_CONFIG.dataFile);
      }

      this.allTasks = Array.isArray(data) ? data : [];
      console.log(`[API] 加载了 ${this.allTasks.length} 条补收任务`);
      return true;
    } catch (error) {
      console.error('[API] 数据加载失败:', error);

      // 如果所有方法都失败，使用内置的默认数据
      console.warn('[API] 使用内置默认数据');
      this.allTasks = this.getDefaultData();
      return true;
    }
  },

  /**
   * 使用 XMLHttpRequest 加载数据（兼容 file:// 协议）
   */
  loadWithXHR(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) { // status 0 for file:// protocol
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('JSON 解析失败'));
          }
        } else {
          reject(new Error(`XHR 状态: ${xhr.status}`));
        }
      };
      xhr.onerror = function() {
        reject(new Error('XHR 请求失败'));
      };
      xhr.send();
    });
  },

  /**
   * 内置默认数据（当外部文件无法加载时使用）
   */
  getDefaultData() {
    return [
      {
        "task_id": "SUP-20260624-001",
        "order_id": "ORD-20260601-123",
        "customer_id": "CUST-001",
        "customer_name": "测试客户A",
        "status": "pending_confirm",
        "original_dimensions": {
          "length": 50.0,
          "width": 40.0,
          "height": 30.0,
          "weight": 20.0,
          "volume": 0.06,
          "unit": "cm/kg"
        },
        "actual_dimensions": {
          "length": 55.0,
          "width": 42.0,
          "height": 35.0,
          "weight": 22.0,
          "volume": 0.08085,
          "unit": "cm/kg"
        },
        "evidence_images": [
          {
            "file_name": "measure_001.jpg",
            "url": "https://via.placeholder.com/150x100?text=测量证明1",
            "upload_time": "2026-06-24 14:30:00"
          }
        ],
        "original_fee": 800.00,
        "recalculated_fee": 950.00,
        "supplement_amount": 150.00,
        "fee_details": [
          {"category": "仓储费", "item": "基础仓储费", "original": 500, "recalculated": 580, "diff": 80},
          {"category": "操作费", "item": "入库操作费", "original": 200, "recalculated": 240, "diff": 40},
          {"category": "其他费用", "item": "耗材费", "original": 100, "recalculated": 130, "diff": 30}
        ],
        "created_at": "2026-06-20 10:30:00",
        "updated_at": "2026-06-24 14:35:00",
        "deadline": "2026-06-25 23:59:59",
        "bill_info": null,
        "appeal_info": null,
        "history": [
          {"action": "create_task", "operator": "system", "timestamp": "2026-06-20 10:30:00", "detail": "系统创建补收任务"},
          {"action": "input_dimensions", "operator": "customer", "timestamp": "2026-06-24 14:30:00", "detail": "输入真实尺寸"},
          {"action": "recalculate_fee", "operator": "system", "timestamp": "2026-06-24 14:32:00", "detail": "TMS费用重算完成"}
        ]
      },
      {
        "task_id": "SUP-20260624-002",
        "order_id": "ORD-20260610-456",
        "customer_id": "CUST-002",
        "customer_name": "测试客户B",
        "status": "pending_input",
        "original_dimensions": {
          "length": 40.0,
          "width": 30.0,
          "height": 25.0,
          "weight": 15.0,
          "volume": 0.03,
          "unit": "cm/kg"
        },
        "actual_dimensions": null,
        "evidence_images": [],
        "original_fee": 450.00,
        "recalculated_fee": null,
        "supplement_amount": null,
        "fee_details": [],
        "created_at": "2026-06-22 09:15:00",
        "updated_at": "2026-06-22 09:15:00",
        "deadline": "2026-06-27 23:59:59",
        "bill_info": null,
        "appeal_info": null,
        "history": [
          {"action": "create_task", "operator": "system", "timestamp": "2026-06-22 09:15:00", "detail": "系统创建补收任务"}
        ]
      },
      {
        "task_id": "SUP-20260623-003",
        "order_id": "ORD-20260605-789",
        "customer_id": "CUST-003",
        "customer_name": "测试客户C",
        "status": "confirmed",
        "original_dimensions": {
          "length": 60.0,
          "width": 50.0,
          "height": 40.0,
          "weight": 25.0,
          "volume": 0.12,
          "unit": "cm/kg"
        },
        "actual_dimensions": {
          "length": 65.0,
          "width": 52.0,
          "height": 42.0,
          "weight": 26.5,
          "volume": 0.14196,
          "unit": "cm/kg"
        },
        "evidence_images": [
          {
            "file_name": "measure_002.jpg",
            "url": "https://via.placeholder.com/150x100?text=测量证明2",
            "upload_time": "2026-06-23 11:20:00"}
        ],
        "original_fee": 1200.00,
        "recalculated_fee": 1380.00,
        "supplement_amount": 180.00,
        "fee_details": [
          {"category": "仓储费", "item": "基础仓储费", "original": 800, "recalculated": 920, "diff": 120},
          {"category": "操作费", "item": "入库操作费", "original": 300, "recalculated": 350, "diff": 50},
          {"category": "其他费用", "item": "耗材费", "original": 100, "recalculated": 110, "diff": 10}
        ],
        "created_at": "2026-06-18 16:45:00",
        "updated_at": "2026-06-23 14:55:00",
        "deadline": "2026-06-28 23:59:59",
        "bill_info": {
          "bill_id": "BILL-20260623-001",
          "task_id": "SUP-20260623-003",
          "bill_type": "费用补收",
          "amount": 180.00,
          "status": "unpaid",
          "created_at": "2026-06-23 14:55:00",
          "due_date": "2026-07-03 23:59:59"
        },
        "appeal_info": null,
        "history": [
          {"action": "create_task", "operator": "system", "timestamp": "2026-06-18 16:45:00", "detail": "系统创建补收任务"},
          {"action": "input_dimensions", "operator": "customer", "timestamp": "2026-06-23 11:20:00", "detail": "输入真实尺寸"},
          {"action": "recalculate_fee", "operator": "system", "timestamp": "2026-06-23 11:22:00", "detail": "TMS费用重算完成"},
          {"action": "confirm_supplement", "operator": "customer", "timestamp": "2026-06-23 14:55:00", "detail": "确认补收，生成账单 BILL-20260623-001"}
        ]
      },
      {
        "task_id": "SUP-20260622-004",
        "order_id": "ORD-20260608-321",
        "customer_id": "CUST-004",
        "customer_name": "测试客户D",
        "status": "appealed",
        "original_dimensions": {
          "length": 35.0,
          "width": 28.0,
          "height": 22.0,
          "weight": 12.0,
          "volume": 0.02156,
          "unit": "cm/kg"
        },
        "actual_dimensions": {
          "length": 38.0,
          "width": 30.0,
          "height": 25.0,
          "weight": 13.5,
          "volume": 0.0285,
          "unit": "cm/kg"
        },
        "evidence_images": [
          {
            "file_name": "measure_003.jpg",
            "url": "https://via.placeholder.com/150x100?text=测量证明3",
            "upload_time": "2026-06-22 08:45:00"}
        ],
        "original_fee": 320.00,
        "recalculated_fee": 398.00,
        "supplement_amount": 78.00,
        "fee_details": [
          {"category": "仓储费", "item": "基础仓储费", "original": 220, "recalculated": 270, "diff": 50},
          {"category": "操作费", "item": "入库操作费", "original": 80, "recalculated": 98, "diff": 18},
          {"category": "其他费用", "item": "耗材费", "original": 20, "recalculated": 30, "diff": 10}
        ],
        "created_at": "2026-06-19 13:20:00",
        "updated_at": "2026-06-22 16:30:00",
        "deadline": "2026-06-26 23:59:59",
        "bill_info": null,
        "appeal_info": {
          "ticket_id": "TK-20260622-001",
          "task_id": "SUP-20260622-004",
          "appeal_type": "尺寸测量有误",
          "reason": "实际测量尺寸与仓库记录不符，已提供第三方测量报告作为证据。",
          "evidence_images": [
            {"file_name": "third_party_report.pdf", "url": "#", "upload_time": "2026-06-22 16:25:00"}
          ],
          "contact_phone": "13800138000",
          "expected_resolve_time": "2026-06-25",
          "status": "pending_review",
          "created_at": "2026-06-22 16:30:00"
        },
        "history": [
          {"action": "create_task", "operator": "system", "timestamp": "2026-06-19 13:20:00", "detail": "系统创建补收任务"},
          {"action": "input_dimensions", "operator": "customer", "timestamp": "2026-06-22 08:45:00", "detail": "输入真实尺寸"},
          {"action": "recalculate_fee", "operator": "system", "timestamp": "2026-06-22 08:47:00", "detail": "TMS费用重算完成"},
          {"action": "submit_appeal", "operator": "customer", "timestamp": "2026-06-22 16:30:00", "detail": "发起申诉，工单号 TK-20260622-001"}
        ]
      }
    ];
  },

  /**
   * 获取所有任务（支持筛选）
   */
  getTasks(filters = {}) {
    let tasks = [...this.allTasks];

    if (filters.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      tasks = tasks.filter(t =>
        t.task_id.toLowerCase().includes(keyword) ||
        t.order_id.toLowerCase().includes(keyword)
      );
    }

    // 按创建时间倒序
    tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return tasks;
  },

  /**
   * 根据ID获取单个任务
   */
  getTaskById(taskId) {
    return this.allTasks.find(t => t.task_id === taskId);
  },

  /**
   * 统计各状态数量
   */
  getStatusCounts() {
    const counts = {
      all: this.allTasks.length,
      pending_input: 0,
      pending_confirm: 0,
      confirmed: 0,
      appealed: 0
    };

    this.allTasks.forEach(task => {
      if (counts.hasOwnProperty(task.status)) {
        counts[task.status]++;
      }
    });

    return counts;
  },

  /**
   * 更新任务尺寸信息
   */
  updateDimensions(taskId, dimensions) {
    const taskIndex = this.allTasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) return { success: false, message: '任务不存在' };

    const task = this.allTasks[taskIndex];
    const oldActualDim = { ...task.actual_dimensions };

    // 更新尺寸
    task.actual_dimensions = {
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      weight: dimensions.weight,
      volume: SupplementUtils.calculateVolume(dimensions.length, dimensions.width, dimensions.height),
      unit: 'cm/kg'
    };

    // 添加历史记录
    task.history.push({
      action: 'input_dimensions',
      operator: 'customer',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      detail: '输入真实尺寸'
    });

    // 如果尺寸发生变化，触发费用重算
    if (JSON.stringify(oldActualDim) !== JSON.stringify(task.actual_dimensions)) {
      const feeResult = SupplementUtils.simulateTMSCalculation(
        task.original_dimensions,
        task.actual_dimensions
      );

      task.original_fee = feeResult.original_fee;
      task.recalculated_fee = feeResult.recalculated_fee;
      task.supplement_amount = feeResult.supplement_amount;
      task.fee_details = feeResult.fee_details;

      // 更新状态为待确认
      if (task.status === 'pending_input') {
        task.status = 'pending_confirm';
      }

      // 添加费用重算记录
      task.history.push({
        action: 'recalculate_fee',
        operator: 'system',
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        detail: 'TMS费用重算完成'
      });
    }

    // 更新时间戳
    task.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    this.currentTask = task;

    return { success: true, task };
  },

  /**
   * 确认补收
   */
  confirmSupplement(taskId) {
    const taskIndex = this.allTasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) return { success: false, message: '任务不存在' };

    const task = this.allTasks[taskIndex];

    // 生成账单信息
    const billInfo = {
      bill_id: SupplementUtils.generateBillId(),
      task_id: taskId,
      bill_type: '费用补收',
      amount: task.supplement_amount,
      status: 'unpaid',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') + ':59'
    };

    // 更新任务状态
    task.status = 'confirmed';
    task.bill_info = billInfo;

    // 添加历史记录
    task.history.push({
      action: 'confirm_supplement',
      operator: 'customer',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      detail: `确认补收，生成账单 ${billInfo.bill_id}`
    });

    task.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    this.currentTask = task;

    return { success: true, task, billId: billInfo.bill_id };
  },

  /**
   * 提交申诉
   */
  submitAppeal(taskId, appealData) {
    const taskIndex = this.allTasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) return { success: false, message: '任务不存在' };

    const task = this.allTasks[taskIndex];

    // 生成申诉信息
    const appealInfo = {
      ticket_id: SupplementUtils.generateTicketId(),
      task_id: taskId,
      appeal_type: appealData.appeal_type,
      reason: appealData.reason,
      evidence_images: appealData.evidence_images || [],
      contact_phone: appealData.contact_phone,
      expected_resolve_time: appealData.expected_date || null,
      status: 'pending_review',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // 更新任务状态
    task.status = 'appealed';
    task.appeal_info = appealInfo;

    // 添加历史记录
    task.history.push({
      action: 'submit_appeal',
      operator: 'customer',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      detail: `发起申诉，工单号 ${appealInfo.ticket_id}`
    });

    task.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    this.currentTask = task;

    return { success: true, task, ticketId: appealInfo.ticket_id };
  },

  /**
   * 保存数据到localStorage（可选，用于持久化）
   */
  saveToStorage() {
    try {
      localStorage.setItem('supplement_tasks', JSON.stringify(this.allTasks));
      return true;
    } catch (e) {
      console.error('[API] 保存到本地存储失败:', e);
      return false;
    }
  },

  /**
   * 从localStorage恢复数据（可选）
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('supplement_tasks');
      if (data) {
        this.allTasks = JSON.parse(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('[API] 从本地存储加载失败:', e);
      return false;
    }
  }
};
