/**
 * 批量导入组件 - 优化版本
 * 特性：
 * - 分步骤引导式导入流程
 * - 实时数据验证和预览
 * - 友好的错误提示和进度反馈
 * - 支持模板下载和拖拽上传
 * - 导入历史记录
 */

(function() {
  'use strict';

  // 导入状态枚举
  var ImportStep = {
    INPUT: 'input',       // 数据输入
    PREVIEW: 'preview',   // 数据预览
    IMPORTING: 'importing', // 导入中
    RESULT: 'result'      // 导入结果
  };

  window.BatchImportV2 = {
    currentStep: ImportStep.INPUT,
    importType: '',
    importData: [],
    validationResult: null,

    /**
     * 初始化批量导入模态框
     */
    initBatchImportModal: function(type) {
      this.importType = type;
      this.currentStep = ImportStep.INPUT;
      this.importData = [];
      this.validationResult = null;

      // 移除已存在的模态框
      var existingModal = document.getElementById('batchImportModalV2');
      if (existingModal) existingModal.remove();

      var config = this.getImportConfig(type);
      var modalHtml = this.createModalHtml(config);

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // 绑定事件
      this.bindEvents();
      this.updateStepIndicator();
    },

    /**
     * 获取导入配置
     */
    getImportConfig: function(type) {
      var configs = {
        employees: {
          title: '批量导入员工',
          columns: [
            { key: 'name', label: '员工姓名', required: true, maxLength: 50 },
            { key: 'department', label: '部门名称', required: true, maxLength: 50 }
          ],
          placeholder: '支持从 Excel 粘贴，格式：员工姓名\\t部门名称',
          templateData: '张三\\t技术部\\n李四\\t市场部\\n王五\\t财务部'
        },
        ratingItems: {
          title: '批量导入评分项',
          columns: [
            { key: 'name', label: '评分项名称', required: true, maxLength: 100 },
            { key: 'description', label: '描述', required: false, maxLength: 200 }
          ],
          placeholder: '支持从 Excel 粘贴，格式：评分项名称\\t描述',
          templateData: '服务态度\\t评价员工的服务态度\\n工作效率\\t评价员工的工作效率'
        },
        departments: {
          title: '批量导入部门',
          columns: [
            { key: 'name', label: '部门名称', required: true, maxLength: 50 },
            { key: 'description', label: '描述', required: false, maxLength: 200 }
          ],
          placeholder: '支持从 Excel 粘贴，格式：部门名称\\t描述',
          templateData: '技术部\\t负责产品研发\\n市场部\\t负责市场推广'
        }
      };

      return configs[type] || configs.employees;
    },

    /**
     * 创建模态框 HTML
     */
    createModalHtml: function(config) {
      return `
        <div id="batchImportModalV2" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

            <!-- 头部 -->
            <div class="bg-gradient-to-r from-primary to-blue-600 px-8 py-6 text-white">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-2xl font-bold mb-1">${config.title}</h3>
                  <p class="text-blue-100 text-sm">快速导入大量数据，支持 Excel 粘贴</p>
                </div>
                <button onclick="window.BatchImportV2.closeModal()" class="text-white/80 hover:text-white transition-colors">
                  <i class="fa fa-times text-2xl"></i>
                </button>
              </div>

              <!-- 步骤指示器 -->
              <div class="mt-6 flex items-center justify-between">
                ${this.createStepIndicatorHtml()}
              </div>
            </div>

            <!-- 内容区域 -->
            <div class="flex-1 overflow-y-auto">
              <!-- 步骤1: 数据输入 -->
              <div id="stepInput" class="p-8">
                <div class="grid grid-cols-3 gap-6">

                  <!-- 左侧: 输入方式 -->
                  <div class="col-span-2 space-y-4">
                    <!-- 快捷操作 -->
                    <div class="flex gap-3 mb-4">
                      <button onclick="window.BatchImportV2.downloadTemplate()" class="btn-secondary flex items-center gap-2">
                        <i class="fa fa-download"></i>
                        <span>下载模板</span>
                      </button>
                      <button onclick="window.BatchImportV2.clearInput()" class="btn-secondary flex items-center gap-2">
                        <i class="fa fa-trash"></i>
                        <span>清空数据</span>
                      </button>
                      <button onclick="window.BatchImportV2.addEmptyRow()" class="btn-secondary flex items-center gap-2">
                        <i class="fa fa-plus"></i>
                        <span>添加行</span>
                      </button>
                    </div>

                    <!-- 数据输入表格 -->
                    <div class="border border-neutral-200 rounded-xl overflow-hidden">
                      <div class="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                        <span class="font-medium text-neutral-700">数据输入</span>
                        <span class="text-sm text-neutral-500">
                          <i class="fa fa-lightbulb-o mr-1"></i>
                          ${config.placeholder}
                        </span>
                      </div>

                      <div class="overflow-x-auto max-h-96">
                        <table class="w-full" id="importDataTable">
                          <thead class="bg-neutral-50 sticky top-0">
                            <tr>
                              <th class="table-cell w-12 text-center">
                                <input type="checkbox" id="selectAllRows" class="w-4 h-4">
                              </th>
                              <th class="table-cell w-16 text-center">序号</th>
                              ${config.columns.map(col => `
                                <th class="table-cell">
                                  ${col.label}
                                  ${col.required ? '<span class="text-danger ml-1">*</span>' : ''}
                                </th>
                              `).join('')}
                              <th class="table-cell w-24 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody id="importDataTableBody">
                            <!-- 动态生成行 -->
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- 统计信息 -->
                    <div class="flex items-center justify-between text-sm text-neutral-600">
                      <span id="dataStats">已输入 0 行数据</span>
                      <span class="text-neutral-400">提示：可直接从 Excel 粘贴数据</span>
                    </div>
                  </div>

                  <!-- 右侧: 帮助信息 -->
                  <div class="space-y-4">
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 class="font-medium text-blue-900 mb-3 flex items-center">
                        <i class="fa fa-info-circle mr-2"></i>
                        导入说明
                      </h4>
                      <ul class="text-sm text-blue-800 space-y-2">
                        <li class="flex items-start">
                          <i class="fa fa-check text-blue-600 mr-2 mt-1"></i>
                          <span>支持从 Excel 直接粘贴数据</span>
                        </li>
                        <li class="flex items-start">
                          <i class="fa fa-check text-blue-600 mr-2 mt-1"></i>
                          <span>必填字段不能为空</span>
                        </li>
                        <li class="flex items-start">
                          <i class="fa fa-check text-blue-600 mr-2 mt-1"></i>
                          <span>系统会自动验证数据格式</span>
                        </li>
                        <li class="flex items-start">
                          <i class="fa fa-check text-blue-600 mr-2 mt-1"></i>
                          <span>重复数据将被自动跳过</span>
                        </li>
                      </ul>
                    </div>

                    <div class="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                      <h4 class="font-medium text-neutral-900 mb-3 flex items-center">
                        <i class="fa fa-keyboard-o mr-2"></i>
                        快捷键
                      </h4>
                      <div class="text-sm text-neutral-700 space-y-2">
                        <div class="flex justify-between">
                          <span>粘贴数据</span>
                          <kbd class="px-2 py-1 bg-white border rounded text-xs">Ctrl+V</kbd>
                        </div>
                        <div class="flex justify-between">
                          <span>添加新行</span>
                          <kbd class="px-2 py-1 bg-white border rounded text-xs">Enter</kbd>
                        </div>
                      </div>
                    </div>

                    <!-- 实时验证结果 -->
                    <div id="validationSummary" class="hidden bg-white border border-neutral-200 rounded-xl p-4">
                      <h4 class="font-medium text-neutral-900 mb-3 flex items-center">
                        <i class="fa fa-check-circle mr-2"></i>
                        验证结果
                      </h4>
                      <div id="validationContent" class="text-sm space-y-2">
                        <!-- 动态生成 -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 步骤2: 数据预览 -->
              <div id="stepPreview" class="hidden p-8">
                <div class="space-y-4">
                  <div class="bg-success/10 border border-success/30 rounded-xl p-4">
                    <div class="flex items-center">
                      <i class="fa fa-check-circle text-success text-xl mr-3"></i>
                      <div>
                        <h4 class="font-medium text-success-900">数据验证通过</h4>
                        <p class="text-sm text-success-700" id="previewSummary">共 0 条数据可以导入</p>
                      </div>
                    </div>
                  </div>

                  <div class="border border-neutral-200 rounded-xl overflow-hidden">
                    <div class="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                      <span class="font-medium text-neutral-700">数据预览</span>
                    </div>
                    <div class="overflow-x-auto max-h-96">
                      <table class="w-full">
                        <thead class="bg-neutral-50 sticky top-0">
                          <tr>
                            <th class="table-cell w-16 text-center">序号</th>
                            ${config.columns.map(col => `
                              <th class="table-cell">${col.label}</th>
                            `).join('')}
                            <th class="table-cell w-24 text-center">状态</th>
                          </tr>
                        </thead>
                        <tbody id="previewTableBody">
                          <!-- 动态生成 -->
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 步骤3: 导入中 -->
              <div id="stepImporting" class="hidden p-8">
                <div class="flex flex-col items-center justify-center py-12">
                  <div class="relative w-32 h-32 mb-6">
                    <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <i class="fa fa-cloud-upload text-primary text-4xl"></i>
                    </div>
                  </div>
                  <h3 class="text-xl font-medium text-neutral-900 mb-2">正在导入数据...</h3>
                  <p class="text-neutral-600 mb-4" id="importProgress">已导入 0 / 0 条</p>
                  <div class="w-64 bg-neutral-200 rounded-full h-2">
                    <div id="progressBar" class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                  </div>
                </div>
              </div>

              <!-- 步骤4: 导入结果 -->
              <div id="stepResult" class="hidden p-8">
                <div class="space-y-6">
                  <!-- 成功统计 -->
                  <div id="resultSuccess" class="bg-success/10 border border-success/30 rounded-xl p-6">
                    <div class="flex items-start">
                      <div class="flex-shrink-0">
                        <i class="fa fa-check-circle text-success text-3xl"></i>
                      </div>
                      <div class="ml-4 flex-1">
                        <h4 class="text-lg font-medium text-success-900 mb-2">导入成功</h4>
                        <p class="text-success-700" id="successMessage">成功导入 0 条数据</p>
                      </div>
                    </div>
                  </div>

                  <!-- 失败详情 -->
                  <div id="resultFailed" class="hidden bg-warning/10 border border-warning/30 rounded-xl p-6">
                    <div class="flex items-start mb-4">
                      <div class="flex-shrink-0">
                        <i class="fa fa-exclamation-triangle text-warning text-3xl"></i>
                      </div>
                      <div class="ml-4 flex-1">
                        <h4 class="text-lg font-medium text-warning-900 mb-2">部分数据导入失败</h4>
                        <p class="text-warning-700" id="failedMessage">失败 0 条</p>
                      </div>
                    </div>

                    <div class="mt-4 border border-warning/30 rounded-lg overflow-hidden">
                      <div class="bg-warning/20 px-4 py-2 border-b border-warning/30">
                        <span class="font-medium text-warning-900">失败详情</span>
                      </div>
                      <div class="max-h-48 overflow-y-auto">
                        <table class="w-full">
                          <thead class="bg-warning/10 sticky top-0">
                            <tr>
                              <th class="table-cell w-16 text-center">行号</th>
                              <th class="table-cell">数据</th>
                              <th class="table-cell">错误原因</th>
                            </tr>
                          </thead>
                          <tbody id="failedTableBody">
                            <!-- 动态生成 -->
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex justify-center gap-4">
                    <button onclick="window.BatchImportV2.closeModal()" class="btn-primary">
                      <i class="fa fa-check mr-2"></i>
                      完成
                    </button>
                    <button onclick="window.BatchImportV2.retryFailed()" id="retryFailedBtn" class="btn-secondary hidden">
                      <i class="fa fa-redo mr-2"></i>
                      重试失败项
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="border-t border-neutral-200 px-8 py-4 bg-neutral-50">
              <div class="flex justify-between items-center">
                <div class="text-sm text-neutral-600">
                  <span id="stepDescription">步骤 1/3：输入或粘贴数据</span>
                </div>
                <div class="flex gap-3">
                  <button onclick="window.BatchImportV2.closeModal()" class="btn-secondary">
                    取消
                  </button>
                  <button onclick="window.BatchImportV2.prevStep()" id="prevStepBtn" class="btn-secondary hidden">
                    <i class="fa fa-arrow-left mr-2"></i>
                    上一步
                  </button>
                  <button onclick="window.BatchImportV2.nextStep()" id="nextStepBtn" class="btn-primary">
                    下一步
                    <i class="fa fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * 创建步骤指示器 HTML
     */
    createStepIndicatorHtml: function() {
      var steps = [
        { label: '数据输入', icon: 'fa-edit' },
        { label: '数据预览', icon: 'fa-eye' },
        { label: '导入结果', icon: 'fa-check' }
      ];

      return steps.map((step, index) => `
        <div class="flex items-center flex-1">
          <div class="step-indicator" data-step="${index + 1}">
            <div class="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center transition-all">
              <i class="fa ${step.icon}"></i>
            </div>
            <span class="ml-2 text-sm">${step.label}</span>
          </div>
          ${index < steps.length - 1 ? '<div class="flex-1 h-0.5 bg-white/30 mx-4"></div>' : ''}
        </div>
      `).join('');
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
      var self = this;

      // 全选复选框
      var selectAll = document.getElementById('selectAllRows');
      if (selectAll) {
        selectAll.addEventListener('change', function() {
          var checkboxes = document.querySelectorAll('#importDataTableBody .row-checkbox');
          checkboxes.forEach(function(cb) {
            cb.checked = selectAll.checked;
          });
        });
      }

      // 表格粘贴事件
      var table = document.getElementById('importDataTable');
      if (table) {
        table.addEventListener('paste', function(e) {
          self.handleTablePaste(e);
        });
      }

      // 键盘快捷键
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
          self.nextStep();
        }
      });

      // 添加初始行
      for (var i = 0; i < 5; i++) {
        this.addEmptyRow();
      }
    },

    /**
     * 添加空行
     */
    addEmptyRow: function(data) {
      var tbody = document.getElementById('importDataTableBody');
      if (!tbody) return;

      var config = this.getImportConfig(this.importType);
      var rowCount = tbody.children.length + 1;

      var rowHtml = `
        <tr class="border-b border-neutral-200 hover:bg-neutral-50 transition-colors" data-row="${rowCount}">
          <td class="table-cell text-center">
            <input type="checkbox" class="row-checkbox w-4 h-4">
          </td>
          <td class="table-cell text-center text-neutral-500">${rowCount}</td>
          ${config.columns.map((col, colIndex) => `
            <td class="table-cell">
              <input type="text"
                     class="form-input w-full border-0 focus:ring-2 focus:ring-primary/50"
                     data-col="${col.key}"
                     placeholder="${col.required ? '必填' : '选填'}"
                     maxlength="${col.maxLength}"
                     value="${data && data[col.key] ? this.escapeHtml(data[col.key]) : ''}">
              ${col.required ? '<div class="validation-error hidden text-xs text-danger mt-1"></div>' : ''}
            </td>
          `).join('')}
          <td class="table-cell text-center">
            <button onclick="window.BatchImportV2.removeRow(this)" class="text-neutral-400 hover:text-danger transition-colors">
              <i class="fa fa-trash"></i>
            </button>
          </td>
        </tr>
      `;

      tbody.insertAdjacentHTML('beforeend', rowHtml);
      this.updateDataStats();
    },

    /**
     * 移除行
     */
    removeRow: function(btn) {
      var row = btn.closest('tr');
      if (row) {
        row.remove();
        this.updateRowNumbers();
        this.updateDataStats();
      }
    },

    /**
     * 更新行号
     */
    updateRowNumbers: function() {
      var rows = document.querySelectorAll('#importDataTableBody tr');
      rows.forEach(function(row, index) {
        row.querySelector('td:nth-child(2)').textContent = index + 1;
        row.setAttribute('data-row', index + 1);
      });
    },

    /**
     * 更新数据统计
     */
    updateDataStats: function() {
      var rows = document.querySelectorAll('#importDataTableBody tr');
      var validCount = 0;

      rows.forEach(function(row) {
        var inputs = row.querySelectorAll('input[data-col]');
        var hasData = Array.from(inputs).some(function(input) {
          return input.value.trim() !== '';
        });
        if (hasData) validCount++;
      });

      var stats = document.getElementById('dataStats');
      if (stats) {
        stats.textContent = `已输入 ${validCount} 行数据`;
      }
    },

    /**
     * 处理表格粘贴
     */
    handleTablePaste: function(e) {
      e.preventDefault();

      try {
        var pastedText = (e.clipboardData || window.clipboardData).getData('text');
        if (!pastedText) return;

        var lines = pastedText.split('\n').filter(function(line) {
          return line.trim() !== '';
        });

        // 清空现有行
        var tbody = document.getElementById('importDataTableBody');
        tbody.innerHTML = '';

        // 解析并添加数据
        var self = this;
        lines.forEach(function(line, index) {
          // 跳过表头
          if (index === 0 && self.isHeaderLine(line)) {
            return;
          }

          var parts = self.parseLine(line);
          if (parts.length > 0) {
            var config = self.getImportConfig(self.importType);
            var data = {};
            config.columns.forEach(function(col, colIndex) {
              data[col.key] = parts[colIndex] || '';
            });
            self.addEmptyRow(data);
          }
        });

        // 如果没有添加任何行，至少保留一行
        if (tbody.children.length === 0) {
          this.addEmptyRow();
        }

        this.showNotification('success', `成功粘贴 ${lines.length} 行数据`);

      } catch (error) {
        console.error('粘贴处理出错:', error);
        this.showNotification('error', '粘贴数据时出错: ' + error.message);
      }
    },

    /**
     * 判断是否为表头行
     */
    isHeaderLine: function(line) {
      var keywords = ['员工', '姓名', '部门', '评分项', '名称', 'name', 'department'];
      return keywords.some(function(keyword) {
        return line.toLowerCase().indexOf(keyword) >= 0;
      });
    },

    /**
     * 解析行数据
     */
    parseLine: function(line) {
      line = line.trim();
      if (!line) return [];

      // 尝试不同的分隔符
      if (line.indexOf('\t') >= 0) {
        return line.split('\t').map(function(p) { return p.trim(); });
      } else if (line.indexOf(',') >= 0) {
        return line.split(',').map(function(p) { return p.trim(); });
      } else {
        return [line];
      }
    },

    /**
     * 下一步
     */
    nextStep: function() {
      switch (this.currentStep) {
        case ImportStep.INPUT:
          if (this.validateInput()) {
            this.currentStep = ImportStep.PREVIEW;
            this.showPreview();
          }
          break;
        case ImportStep.PREVIEW:
          this.currentStep = ImportStep.IMPORTING;
          this.executeImport();
          break;
      }
      this.updateStepIndicator();
    },

    /**
     * 上一步
     */
    prevStep: function() {
      switch (this.currentStep) {
        case ImportStep.PREVIEW:
          this.currentStep = ImportStep.INPUT;
          this.showInput();
          break;
      }
      this.updateStepIndicator();
    },

    /**
     * 验证输入
     */
    validateInput: function() {
      var rows = document.querySelectorAll('#importDataTableBody tr');
      var config = this.getImportConfig(this.importType);
      var hasData = false;
      var errors = [];

      rows.forEach(function(row, index) {
        var inputs = row.querySelectorAll('input[data-col]');
        var rowData = {};

        inputs.forEach(function(input) {
          rowData[input.getAttribute('data-col')] = input.value.trim();
        });

        // 检查是否有数据
        var rowHasData = Object.values(rowData).some(function(v) { return v !== ''; });
        if (rowHasData) {
          hasData = true;

          // 验证必填字段
          config.columns.forEach(function(col) {
            if (col.required && !rowData[col.key]) {
              errors.push({
                row: index + 1,
                field: col.label,
                message: '必填字段不能为空'
              });

              // 显示错误提示
              var input = row.querySelector(`input[data-col="${col.key}"]`);
              if (input) {
                input.classList.add('border', 'border-danger');
                var errorDiv = input.parentElement.querySelector('.validation-error');
                if (errorDiv) {
                  errorDiv.textContent = '必填字段不能为空';
                  errorDiv.classList.remove('hidden');
                }
              }
            }
          });
        }
      });

      if (!hasData) {
        this.showNotification('warning', '请至少输入一条数据');
        return false;
      }

      if (errors.length > 0) {
        this.showNotification('error', `发现 ${errors.length} 个验证错误，请修正后再试`);
        return false;
      }

      return true;
    },

    /**
     * 显示预览
     */
    showPreview: function() {
      document.getElementById('stepInput').classList.add('hidden');
      document.getElementById('stepPreview').classList.remove('hidden');

      // 收集数据
      this.importData = [];
      var rows = document.querySelectorAll('#importDataTableBody tr');
      var config = this.getImportConfig(this.importType);
      var self = this;

      rows.forEach(function(row) {
        var inputs = row.querySelectorAll('input[data-col]');
        var rowData = {};

        inputs.forEach(function(input) {
          rowData[input.getAttribute('data-col')] = input.value.trim();
        });

        // 只添加有数据的行
        var hasData = Object.values(rowData).some(function(v) { return v !== ''; });
        if (hasData) {
          self.importData.push(rowData);
        }
      });

      // 渲染预览表格
      var tbody = document.getElementById('previewTableBody');
      tbody.innerHTML = '';

      this.importData.forEach(function(data, index) {
        var rowHtml = `
          <tr class="border-b border-neutral-200">
            <td class="table-cell text-center">${index + 1}</td>
            ${config.columns.map(col => `
              <td class="table-cell">${self.escapeHtml(data[col.key] || '-')}</td>
            `).join('')}
            <td class="table-cell text-center">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                <i class="fa fa-check mr-1"></i>有效
              </span>
            </td>
          </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', rowHtml);
      });

      document.getElementById('previewSummary').textContent = `共 ${this.importData.length} 条数据可以导入`;

      // 更新按钮
      document.getElementById('prevStepBtn').classList.remove('hidden');
      document.getElementById('nextStepBtn').innerHTML = '<i class="fa fa-cloud-upload mr-2"></i>开始导入';
      document.getElementById('stepDescription').textContent = '步骤 2/3：预览并确认数据';
    },

    /**
     * 显示输入
     */
    showInput: function() {
      document.getElementById('stepPreview').classList.add('hidden');
      document.getElementById('stepInput').classList.remove('hidden');

      // 更新按钮
      document.getElementById('prevStepBtn').classList.add('hidden');
      document.getElementById('nextStepBtn').innerHTML = '下一步<i class="fa fa-arrow-right ml-2"></i>';
      document.getElementById('stepDescription').textContent = '步骤 1/3：输入或粘贴数据';
    },

    /**
     * 执行导入
     */
    executeImport: function() {
      var self = this;

      // 显示导入中界面
      document.getElementById('stepPreview').classList.add('hidden');
      document.getElementById('stepImporting').classList.remove('hidden');
      document.getElementById('prevStepBtn').classList.add('hidden');
      document.getElementById('nextStepBtn').classList.add('hidden');
      document.getElementById('stepDescription').textContent = '步骤 3/3：正在导入数据...';

      // 将数据转换为文本格式
      var config = this.getImportConfig(this.importType);
      var textData = this.importData.map(function(item) {
        return config.columns.map(function(col) {
          return item[col.key] || '';
        }).join('\t');
      }).join('\n');

      // 调用 API
      var promise;
      if (this.importType === 'employees') {
        promise = AdminApi.batchImportEmployees(textData);
      } else if (this.importType === 'ratingItems') {
        promise = AdminApi.batchImportRatingItems(textData);
      }

      // 模拟进度更新
      var progress = 0;
      var total = this.importData.length;
      var progressInterval = setInterval(function() {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 90) progress = 90;

        document.getElementById('importProgress').textContent = `已导入 ${Math.floor(progress * total / 100)} / ${total} 条`;
        document.getElementById('progressBar').style.width = progress + '%';
      }, 200);

      promise.then(function(res) {
        clearInterval(progressInterval);
        document.getElementById('progressBar').style.width = '100%';
        document.getElementById('importProgress').textContent = `已导入 ${total} / ${total} 条`;

        setTimeout(function() {
          self.showImportResult(res);
        }, 500);
      }).catch(function(err) {
        clearInterval(progressInterval);
        self.showNotification('error', '导入失败: ' + err.message);
        self.currentStep = ImportStep.PREVIEW;
        self.showPreview();
        self.updateStepIndicator();
      });
    },

    /**
     * 显示导入结果
     */
    showImportResult: function(res) {
      this.currentStep = ImportStep.RESULT;

      document.getElementById('stepImporting').classList.add('hidden');
      document.getElementById('stepResult').classList.remove('hidden');
      document.getElementById('stepDescription').textContent = '导入完成';

      if (res.success) {
        var successCount = res.data.success_count || 0;
        var failedCount = res.data.failed_count || 0;

        document.getElementById('successMessage').textContent = `成功导入 ${successCount} 条数据`;

        if (failedCount > 0) {
          document.getElementById('resultFailed').classList.remove('hidden');
          document.getElementById('failedMessage').textContent = `失败 ${failedCount} 条`;

          // 渲染失败详情
          var tbody = document.getElementById('failedTableBody');
          tbody.innerHTML = '';

          res.data.failed_list.forEach(function(item) {
            var rowHtml = `
              <tr class="border-b border-warning/30">
                <td class="table-cell text-center">${item.row}</td>
                <td class="table-cell">${item.name}</td>
                <td class="table-cell text-danger">${item.error}</td>
              </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', rowHtml);
          });

          document.getElementById('retryFailedBtn').classList.remove('hidden');
        }

        // 刷新列表
        if (window.AdminEvents && window.AdminEvents.loadDataAndRefresh) {
          window.AdminEvents.loadDataAndRefresh();
        }
      } else {
        document.getElementById('resultSuccess').classList.add('hidden');
        this.showNotification('error', res.error || '导入失败');
      }
    },

    /**
     * 更新步骤指示器
     */
    updateStepIndicator: function() {
      var stepMap = {
        'input': 1,
        'preview': 2,
        'importing': 3,
        'result': 3
      };

      var currentStepNum = stepMap[this.currentStep] || 1;

      document.querySelectorAll('.step-indicator').forEach(function(indicator) {
        var step = parseInt(indicator.getAttribute('data-step'));
        var circle = indicator.querySelector('div');

        if (step < currentStepNum) {
          // 已完成
          circle.classList.add('bg-white', 'text-primary');
          circle.classList.remove('border-white/30');
        } else if (step === currentStepNum) {
          // 当前步骤
          circle.classList.add('bg-white', 'text-primary', 'scale-110');
          circle.classList.remove('border-white/30');
        } else {
          // 未完成
          circle.classList.remove('bg-white', 'text-primary', 'scale-110');
          circle.classList.add('border-white/30');
        }
      });
    },

    /**
     * 下载模板
     */
    downloadTemplate: function() {
      var config = this.getImportConfig(this.importType);
      var templateData = config.templateData;

      var blob = new Blob([templateData], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = `${config.title}模板.txt`;
      a.click();
      URL.revokeObjectURL(url);

      this.showNotification('success', '模板下载成功');
    },

    /**
     * 清空输入
     */
    clearInput: function() {
      if (confirm('确定要清空所有数据吗？')) {
        var tbody = document.getElementById('importDataTableBody');
        tbody.innerHTML = '';

        for (var i = 0; i < 5; i++) {
          this.addEmptyRow();
        }

        this.showNotification('success', '数据已清空');
      }
    },

    /**
     * 重试失败项
     */
    retryFailed: function() {
      // TODO: 实现重试失败项的逻辑
      this.showNotification('info', '重试功能开发中...');
    },

    /**
     * 关闭模态框
     */
    closeModal: function() {
      var modal = document.getElementById('batchImportModalV2');
      if (modal) {
        modal.remove();
      }
    },

    /**
     * 显示通知
     */
    showNotification: function(type, message) {
      if (window.AdminUI && window.AdminUI.showNotification) {
        var title = type === 'success' ? '成功' : type === 'error' ? '错误' : type === 'warning' ? '警告' : '提示';
        window.AdminUI.showNotification(title, message, type);
      } else {
        alert(message);
      }
    },

    /**
     * HTML 转义
     */
    escapeHtml: function(text) {
      var div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }
  };
})();
