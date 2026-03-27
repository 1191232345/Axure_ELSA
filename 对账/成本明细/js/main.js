// 主JavaScript代码
    // 模拟数据
    let reconciliationData = [];
    let modalData = [];
    let batchModalData = [];
    let batchModalDataLoaded = false;
    let isBatchTaskRunning = false;
    let currentPage = 1;
    const itemsPerPage = 10;
    let selectedItems = new Set();
    let modalSelectedItems = new Set();
    let batchModalSelectedItems = new Set();
    
    // 检索条件配置定义
    const filterConfigDefinitions = {
      basic: [
        {
          id: 'billType',
          label: '类型',
          type: 'select',
          options: [
            { value: '', text: '全部类型' },
            { value: '出库+快递(YC)', text: '出库+快递(YC)' },
            { value: '出库+快递(TMS)', text: '出库+快递(TMS)' },
            { value: '仓储费', text: '仓储费' },
            { value: '快递赔付', text: '快递赔付' },
            { value: '库内赔付(错发)', text: '库内赔付(错发)' },
            { value: '库内赔付(丢件)', text: '库内赔付(丢件)' },
            { value: '库内赔付(其他)', text: '库内赔付(其他)' },
            { value: '其他', text: '其他' },
            { value: '充值', text: '充值' },
            { value: '费用调整', text: '费用调整' }
          ],
          defaultVisible: true,
          defaultValue: '出库+快递(YC)'
        },
        {
          id: 'billMonth',
          label: '账单月',
          type: 'month',
          defaultVisible: true
        },
        {
          id: 'voyagePeriod',
          label: '航期',
          type: 'month',
          defaultVisible: true
        },
        {
          id: 'customerCode',
          label: '客户代码',
          type: 'select',
          options: [
            { value: '', text: '全部' },
            { value: 'ZJJS', text: 'ZJJS' },
            { value: 'ZJHW', text: 'ZJHW' },
            { value: 'ZJWL', text: 'ZJWL' }
          ],
          defaultVisible: true
        },
        // {
        //   id: 'operator',
        //   label: '操作人',
        //   type: 'select',
        //   options: [
        //     { value: '', text: '全部' },
        //     { value: '系统', text: '系统' },
        //     { value: '管理员', text: '管理员' },
        //     { value: '操作员', text: '操作员' }
        //   ],
        //   defaultVisible: true
        // },
        {
          id: 'customerService',
          label: '客服',
          type: 'select',
          options: [
            { value: '', text: '全部' },
            { value: '李四', text: '李四' },
            { value: '钱七', text: '钱七' },
            { value: '吴十', text: '吴十' }
          ],
          defaultVisible: true
        },
        {
          id: 'operateTimeRange',
          label: '操作时间',
          type: 'daterange',
          defaultVisible: true
        }
      ]
    };
    
    // 渲染基础筛选条件
    function renderBasicFilters() {
      const container = document.getElementById('basicFilters');
      container.innerHTML = '';

      const visibleFilters = filterConfigDefinitions.basic.filter(f => f.defaultVisible);

      visibleFilters.forEach(filter => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2';

        if (filter.type === 'select') {
          div.innerHTML = `
            <label class="text-sm font-medium text-gray-700 whitespace-nowrap">${filter.label}:</label>
            <select id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}" class="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[120px]">
              ${filter.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
            </select>
          `;
        } else if (filter.type === 'month') {
          div.innerHTML = `
            <label class="text-sm font-medium text-gray-700 whitespace-nowrap">${filter.label}:</label>
            <input type="month" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}" class="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[120px]">
          `;
        } else if (filter.type === 'date') {
          div.innerHTML = `
            <label class="text-sm font-medium text-gray-700 whitespace-nowrap">${filter.label}:</label>
            <input type="date" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}" class="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[120px]">
          `;
        } else if (filter.type === 'daterange') {
          div.innerHTML = `
            <label class="text-sm font-medium text-gray-700 whitespace-nowrap">${filter.label}:</label>
            <div class="flex items-center gap-2">
              <input type="date" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}Start" class="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[120px]" placeholder="开始日期">
              <span class="text-gray-400">-</span>
              <input type="date" id="filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}End" class="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[120px]" placeholder="结束日期">
            </div>
          `;
        }

        container.appendChild(div);

        // 设置默认值
        if (filter.defaultValue) {
          const input = document.getElementById(`filter${filter.id.charAt(0).toUpperCase() + filter.id.slice(1)}`);
          if (input) {
            input.value = filter.defaultValue;
          }
        }
      });
    }
    

    // 初始化页面
    document.addEventListener('DOMContentLoaded', function() {
      // 打开费用获取弹窗
      document.getElementById('btnGetFee').addEventListener('click', function() {
        document.getElementById('feeModal').classList.add('show');
        // 初始化客户代码和仓库为全部
        initCustomerCodeAll();
        initWarehouseCodeAll();
        // 如果已选择账单类型，更新表头和检索条件
        const billType = document.getElementById('modalBillType').value;
        if (billType) {
          updateModalTableHeader();
        }
        updateSearchConditions(); // 打开弹窗时更新检索条件显示
      });

      // 打开批量获取费用弹窗
      document.getElementById('btnBatchGetFee').addEventListener('click', function() {
        if (isBatchTaskRunning) {
          alert('任务正在执行中，请勿重复操作');
          return;
        }
        
        document.getElementById('batchFeeModal').classList.add('show');
        // 初始化客户代码和仓库为全部
        initBatchCustomerCodeAll();
        initBatchWarehouseCodeAll();
        // 打开弹窗时更新检索条件显示
        updateBatchSearchConditions();
        
        // 如果数据已加载，直接显示
        if (batchModalDataLoaded && batchModalData.length > 0) {
          renderBatchModalTable();
          updateBatchModalPagination();
        }
      });

      // 关闭费用获取弹窗
      document.getElementById('closeFeeModal').addEventListener('click', closeFeeModal);
      document.getElementById('modalCancel').addEventListener('click', closeFeeModal);
      
      // 点击弹窗外部关闭
      document.getElementById('feeModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeFeeModal();
        }
      });

      // 关闭批量获取费用弹窗
      document.getElementById('closeBatchFeeModal').addEventListener('click', closeBatchFeeModal);
      document.getElementById('batchModalCancel').addEventListener('click', closeBatchFeeModal);
      
      // 点击弹窗外部关闭
      document.getElementById('batchFeeModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeBatchFeeModal();
        }
      });

      // 关闭详情弹窗
      document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
      document.getElementById('detailClose').addEventListener('click', closeDetailModal);
      
      document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) {
          closeDetailModal();
        }
      });

      // 弹窗搜索
      document.getElementById('modalSearch').addEventListener('click', searchModalData);
      document.getElementById('modalReset').addEventListener('click', resetModalForm);

      // 批量弹窗搜索
      document.getElementById('batchModalSearch').addEventListener('click', searchBatchModalData);
      document.getElementById('batchModalReset').addEventListener('click', resetBatchModalForm);

      // 费用列表区域的出库单号搜索（已注释，暂不启用）
      // document.getElementById('modalListSearchBtn').addEventListener('click', searchByOutboundNo);

      // 账单类型变化时更新表头和检索条件
      document.getElementById('modalBillType').addEventListener('change', function() {
        updateModalTableHeader();
        updateSearchConditions();
        // 清空数据列表
        document.getElementById('modalDataTableBody').innerHTML = '';
        modalData = [];
        modalSelectedItems.clear();
        updateModalSelectedCount();
      });

      // 批量费用类型变化时更新检索条件
      document.getElementById('batchModalFeeType').addEventListener('change', function() {
        updateBatchSearchConditions();
        // 清空数据列表
        document.getElementById('batchModalDataTableBody').innerHTML = '';
        batchModalData = [];
        batchModalSelectedItems.clear();
        updateBatchModalSelectedCount();
      });

      // 弹窗提交
      document.getElementById('modalSubmit').addEventListener('click', submitModalData);

      // 批量弹窗提交
      document.getElementById('batchModalSubmit').addEventListener('click', submitBatchModalData);

      // 主表格全选
      document.getElementById('tableCheckAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#reconciliationTableBody input[type="checkbox"]');
        checkboxes.forEach(cb => {
          cb.checked = this.checked;
          if (this.checked) {
            selectedItems.add(cb.dataset.id);
          } else {
            selectedItems.delete(cb.dataset.id);
          }
        });
        updateSummary();
      });

      // 弹窗表格全选
      document.getElementById('modalCheckAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#modalDataTableBody input[type="checkbox"]');
        checkboxes.forEach(cb => {
          cb.checked = this.checked;
          if (this.checked) {
            modalSelectedItems.add(cb.dataset.id);
          } else {
            modalSelectedItems.delete(cb.dataset.id);
          }
        });
        updateModalSelectedCount();
      });

      // 批量弹窗表格全选
      document.getElementById('batchModalCheckAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#batchModalDataTableBody input[type="checkbox"]');
        checkboxes.forEach(cb => {
          cb.checked = this.checked;
          if (this.checked) {
            batchModalSelectedItems.add(cb.dataset.id);
          } else {
            batchModalSelectedItems.delete(cb.dataset.id);
          }
        });
        updateBatchModalSelectedCount();
      });

      // 筛选功能
      document.getElementById('btnFilter').addEventListener('click', filterData);
      document.getElementById('btnResetFilter').addEventListener('click', resetFilter);

      // 初始化检索条件
      renderBasicFilters();

      // 初始化账单月为当前月份
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const currentMonth = `${year}-${month}`;
      const billMonthInput = document.getElementById('filterBillMonth');
      if (billMonthInput) {
        billMonthInput.value = currentMonth;
      }

      // 导出功能
      document.getElementById('btnExport').addEventListener('click', exportData);
      
      // 批量提交功能（已隐藏）
      // document.getElementById('btnBatchSubmit').addEventListener('click', batchSubmitBills);

      // 初始化
      renderTable();
      updateSummary();
    });

    // 关闭费用获取弹窗
    function closeFeeModal() {
      document.getElementById('feeModal').classList.remove('show');
      resetModalForm();
    }

    // 关闭详情弹窗
    function closeDetailModal() {
      document.getElementById('detailModal').classList.remove('show');
    }

    // 切换客户代码下拉框
    function toggleCustomerCodeDropdown() {
      const options = document.getElementById('modalCustomerCodeOptions');
      options.classList.toggle('hidden');
    }

    // 切换仓库下拉框
    function toggleWarehouseCodeDropdown() {
      const options = document.getElementById('modalWarehouseCodeOptions');
      options.classList.toggle('hidden');
    }

    // 切换仓库下拉框 (旧版本 - 已弃用)
    function toggleWarehouseDropdown() {
      const options = document.getElementById('modalWarehouseOptions');
      if (options) options.classList.toggle('hidden');
    }

    // 切换客户搜索下拉框 (旧版本 - 已弃用)
    function toggleCustomerSearchDropdown() {
      const options = document.getElementById('modalCustomerSearchOptions');
      if (options) options.classList.toggle('hidden');
    }

    // 更新客户代码文本
    function updateCustomerCodeText() {
      const radio = document.querySelector('input[name="modalCustomerCode"]:checked');
      const text = document.getElementById('modalCustomerCodeText');
      if (!radio) {
        text.textContent = '请选择';
      } else {
        text.textContent = radio.value;
      }
    }

    // 初始化客户代码为未选中状态
    function initCustomerCodeAll() {
      document.querySelectorAll('input[name="modalCustomerCode"]').forEach(rb => {
        rb.checked = false;
      });
      updateCustomerCodeText();
    }

    // 更新仓库文本
    function updateWarehouseCodeText() {
      const checkboxes = document.querySelectorAll('input[name="modalWarehouseCode"]:checked');
      const allCheckboxes = document.querySelectorAll('input[name="modalWarehouseCode"]');
      const text = document.getElementById('modalWarehouseCodeText');
      if (checkboxes.length === 0) {
        text.textContent = '全部';
      } else if (checkboxes.length === allCheckboxes.length) {
        text.textContent = '全部';
      } else if (checkboxes.length === 1) {
        text.textContent = checkboxes[0].value;
      } else {
        text.textContent = `已选择 ${checkboxes.length} 个仓库`;
      }
    }
    
    // 初始化仓库为全部选中
    function initWarehouseCodeAll() {
      document.querySelectorAll('input[name="modalWarehouseCode"]').forEach(cb => {
        cb.checked = true;
      });
      updateWarehouseCodeText();
    }

    // 旧版本函数 - 保留兼容性
    function updateWarehouseText() {
      const checkboxes = document.querySelectorAll('input[name="modalWarehouse"]:checked');
      const allCheckboxes = document.querySelectorAll('input[name="modalWarehouse"]');
      const text = document.getElementById('modalWarehouseText');
      if (!text) return;
      if (checkboxes.length === 0) {
        text.textContent = '请选择仓库';
      } else if (checkboxes.length === allCheckboxes.length) {
        text.textContent = '全部';
      } else if (checkboxes.length === 1) {
        text.textContent = checkboxes[0].value;
      } else {
        text.textContent = `已选择 ${checkboxes.length} 个仓库`;
      }
    }
    
    // 旧版本函数 - 保留兼容性
    function initWarehouseAll() {
      document.querySelectorAll('input[name="modalWarehouse"]').forEach(cb => {
        cb.checked = true;
      });
      updateWarehouseText();
    }

    // 旧版本函数 - 保留兼容性
    function updateCustomerSearchText() {
      const checkboxes = document.querySelectorAll('input[name="modalCustomerSearch"]:checked');
      const allCheckboxes = document.querySelectorAll('input[name="modalCustomerSearch"]');
      const text = document.getElementById('modalCustomerSearchText');
      if (!text) return;
      if (checkboxes.length === 0) {
        text.textContent = '全部';
      } else if (checkboxes.length === allCheckboxes.length) {
        text.textContent = '全部';
      } else if (checkboxes.length === 1) {
        text.textContent = checkboxes[0].value;
      } else {
        text.textContent = `已选择 ${checkboxes.length} 个客户`;
      }
    }
    
    // 旧版本函数 - 保留兼容性
    function initCustomerSearchAll() {
      document.querySelectorAll('input[name="modalCustomerSearch"]').forEach(cb => {
        cb.checked = false;
      });
      updateCustomerSearchText();
    }

    // 重置弹窗表单
    function resetModalForm() {
      document.getElementById('modalBillMonth').value = '';
      document.getElementById('modalVoyagePeriod').value = '';
      document.getElementById('modalBillType').value = '';
      initCustomerCodeAll();
      initWarehouseCodeAll();
      document.getElementById('modalChannel').value = '';
      document.getElementById('modalShippingMethod').value = '';
      document.getElementById('modalCreateStartDate').value = '';
      document.getElementById('modalCreateEndDate').value = '';
      document.getElementById('modalOutboundStartDate').value = '';
      document.getElementById('modalOutboundEndDate').value = '';
      document.getElementById('modalSettlementStartDate').value = '';
      document.getElementById('modalSettlementEndDate').value = '';
      document.getElementById('modalCompensationStartDate').value = '';
      document.getElementById('modalCompensationEndDate').value = '';
      document.getElementById('modalDataTableBody').innerHTML = '';
      modalSelectedItems.clear();
      updateModalSelectedCount();
      updateSearchConditions(); // 重置后更新检索条件显示
    }

    // 关闭批量获取费用弹窗
    function closeBatchFeeModal() {
      document.getElementById('batchFeeModal').classList.remove('show');
      
      // 移除进度提示元素
      const progressModal = document.getElementById('batchModalProgress');
      if (progressModal) {
        progressModal.remove();
      }
      
      resetBatchModalForm();
    }

    // 重置批量弹窗表单
    function resetBatchModalForm() {
      document.getElementById('batchModalBillMonth').value = '';
      document.getElementById('batchModalVoyagePeriod').value = '';
      document.getElementById('batchModalFeeType').value = '';
      initBatchCustomerCodeAll();
      initBatchWarehouseCodeAll();
      document.getElementById('batchModalChannel').value = '';
      document.getElementById('batchModalShippingMethod').value = '';
      document.getElementById('batchModalCreateStartDate').value = '';
      document.getElementById('batchModalCreateEndDate').value = '';
      document.getElementById('batchModalOutboundStartDate').value = '';
      document.getElementById('batchModalOutboundEndDate').value = '';
      document.getElementById('batchModalSettlementStartDate').value = '';
      document.getElementById('batchModalSettlementEndDate').value = '';
      document.getElementById('batchModalCompensationStartDate').value = '';
      document.getElementById('batchModalCompensationEndDate').value = '';
      document.getElementById('batchModalDataTableBody').innerHTML = '';
      batchModalData = [];
      batchModalTotalItems = 0;
      batchModalCurrentPage = 1;
      batchModalDataLoaded = false;
      batchModalSelectedItems.clear();
      updateBatchModalSelectedCount();
      updateBatchSearchConditions(); // 重置后更新检索条件显示
    }

    // 切换批量客户代码下拉框
    function toggleBatchCustomerCodeDropdown() {
      const options = document.getElementById('batchModalCustomerCodeOptions');
      options.classList.toggle('hidden');
    }

    // 切换批量仓库下拉框
    function toggleBatchWarehouseCodeDropdown() {
      const options = document.getElementById('batchModalWarehouseCodeOptions');
      options.classList.toggle('hidden');
    }

    // 更新批量客户代码文本
    function updateBatchCustomerCodeText() {
      const radio = document.querySelector('input[name="batchModalCustomerCode"]:checked');
      const text = document.getElementById('batchModalCustomerCodeText');
      if (!radio) {
        text.textContent = '请选择';
      } else {
        text.textContent = radio.value;
      }
    }

    // 初始化批量客户代码为全部选中状态
    function initBatchCustomerCodeAll() {
      document.querySelectorAll('input[name="batchModalCustomerCode"]').forEach(rb => {
        rb.checked = rb.value === '';
      });
      updateBatchCustomerCodeText();
    }

    // 更新批量仓库文本
    function updateBatchWarehouseCodeText() {
      const checkboxes = document.querySelectorAll('input[name="batchModalWarehouseCode"]:checked');
      const allCheckboxes = document.querySelectorAll('input[name="batchModalWarehouseCode"]');
      const text = document.getElementById('batchModalWarehouseCodeText');
      if (checkboxes.length === 0) {
        text.textContent = '全部';
      } else if (checkboxes.length === allCheckboxes.length) {
        text.textContent = '全部';
      } else if (checkboxes.length === 1) {
        text.textContent = checkboxes[0].value;
      } else {
        text.textContent = `已选择 ${checkboxes.length} 个仓库`;
      }
    }
    
    // 初始化批量仓库为全部选中
    function initBatchWarehouseCodeAll() {
      document.querySelectorAll('input[name="batchModalWarehouseCode"]').forEach(cb => {
        cb.checked = true;
      });
      updateBatchWarehouseCodeText();
    }

    // 根据费用类型更新批量检索条件显示
    function updateBatchSearchConditions() {
      const feeType = document.getElementById('batchModalFeeType').value;
      const isTMS = feeType === '出库+快递(TMS)';
      const isStorageFee = feeType === '仓储费';
      const isCompensationFee = feeType.includes('赔付'); // 包括快递赔付和库内赔付
      const isRechargeOrAdjust = feeType === '充值' || feeType === '费用调整';
      const isOther = feeType === '其他';
      const isOutboundExpress = feeType === '出库+快递(YC)';
      
      // 获取所有检索条件元素
      const customerCodeEl = document.getElementById('batchConditionCustomerCode');
      const warehouseCodeEl = document.getElementById('batchConditionWarehouseCode');
      const channelEl = document.getElementById('batchConditionChannel');
      const settlementDateEl = document.getElementById('batchConditionSettlementDate');
      const compensationTimeEl = document.getElementById('batchConditionCompensationTime');
      const shippingMethodEl = document.getElementById('batchConditionShippingMethod');
      const createTimeEl = document.getElementById('batchConditionCreateTime');
      const outboundTimeEl = document.getElementById('batchConditionOutboundTime');
      const serialNoEl = document.getElementById('batchConditionSerialNo');
      const orderNoEl = document.getElementById('batchConditionOrderNo');

      // 默认全部隐藏
      if (customerCodeEl) customerCodeEl.style.display = 'none';
      if (warehouseCodeEl) warehouseCodeEl.style.display = 'none';
      if (channelEl) channelEl.style.display = 'none';
      if (settlementDateEl) settlementDateEl.style.display = 'none';
      if (compensationTimeEl) compensationTimeEl.style.display = 'none';
      if (shippingMethodEl) shippingMethodEl.style.display = 'none';
      if (createTimeEl) createTimeEl.style.display = 'none';
      if (outboundTimeEl) outboundTimeEl.style.display = 'none';
      if (serialNoEl) serialNoEl.style.display = 'none';
      if (orderNoEl) orderNoEl.style.display = 'none';

      if (isTMS) {
        // 出库+快递(TMS)显示：仓库、渠道、创建时间、出库时间
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (channelEl) channelEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
        if (outboundTimeEl) outboundTimeEl.style.display = 'block';
      } else if (isOutboundExpress) {
        // 出库+快递(YC)显示：仓库、运输方式、创建时间、出库时间
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (shippingMethodEl) shippingMethodEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
        if (outboundTimeEl) outboundTimeEl.style.display = 'block';
      } else if (isStorageFee) {
        // 仓储费显示：仓库、结算日期
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (settlementDateEl) settlementDateEl.style.display = 'block';
      } else if (isCompensationFee) {
        // 所有赔付类型显示：仓库
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
      } else if (isRechargeOrAdjust) {
        // 充值和费用调整显示：仓库、创建时间、流水号、订单号
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
        if (feeType === '充值') {
          if (serialNoEl) serialNoEl.style.display = 'block';
          if (orderNoEl) orderNoEl.style.display = 'none';
        } else if (feeType === '费用调整') {
          if (serialNoEl) serialNoEl.style.display = 'none';
          if (orderNoEl) orderNoEl.style.display = 'block';
        }
      } else if (isOther) {
        // 其他类型显示：仓库、创建时间
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
      }
    }

    // 分页相关变量
    let batchModalCurrentPage = 1;
    let batchModalItemsPerPage = 10;
    let batchModalTotalItems = 0;
    
    // 搜索相关变量
    let isSearching = false;

    // 搜索批量弹窗数据
    function searchBatchModalData() {
      // 防止重复搜索
      if (isSearching) return;
      
      const feeType = document.getElementById('batchModalFeeType').value;
      
      isSearching = true;
      
      // 生成任务ID
      const taskId = `TASK${new Date().getTime()}`;
      

      
      // 显示处理开始提示
      showNotification('查询任务已开始，系统正在异步处理数据');
      
      // 清除未使用的taskId变量
      taskId;
      
      // 关闭批量获取明细弹窗
      closeBatchFeeModal();
      
      // 模拟异步查询处理
      setTimeout(() => {
        // 生成模拟数据
        let mockData = [];
        const customerCodes = ['ZJJS', 'ZJHW', 'ZJWL'];
        const allFeeTypes = ['出库+快递(YC)', '出库+快递(TMS)', '仓储费', '快递赔付', '库内赔付(错发)', '库内赔付(丢件)', '库内赔付(其他)', '充值', '费用调整'];
        
        // 生成数据量
        const dataCount = !feeType ? 100 : 50;
        
        // 根据费用类型生成不同的模拟数据
        for (let i = 1; i <= dataCount; i++) {
          let item;
          if (!feeType) {
            const randomFeeType = allFeeTypes[Math.floor(Math.random() * allFeeTypes.length)];
            item = {
              id: `batch_${i}`,
              customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
              feeType: randomFeeType,
              feeItem: getFeeItemByType(randomFeeType),
              amount: (Math.random() * 1000).toFixed(2),
              currency: 'USD'
            };
          } else if (feeType.includes('出库+快递')) {
            item = {
              id: `batch_${i}`,
              customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
              feeType: feeType,
              feeItem: feeType.includes('TMS') ? 'TMS出库费' : 'YC出库费',
              amount: (Math.random() * 1000).toFixed(2),
              currency: 'USD'
            };
          } else if (feeType === '仓储费') {
            item = {
              id: `batch_${i}`,
              customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
              feeType: '仓储费',
              feeItem: '月度仓储费',
              amount: (Math.random() * 5000).toFixed(2),
              currency: 'USD'
            };
          } else if (feeType.includes('赔付')) {
            item = {
              id: `batch_${i}`,
              customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
              feeType: feeType,
              feeItem: '赔付费用',
              amount: (Math.random() * 200).toFixed(2),
              currency: 'USD'
            };
          } else if (feeType === '充值') {
            item = {
              id: `batch_${i}`,
              customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
              feeType: '充值',
              feeItem: '账户充值',
              amount: (Math.random() * 10000).toFixed(2),
              currency: 'USD'
            };
          } else if (feeType === '费用调整') {
            item = {
              id: `batch_${i}`,
              customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
              feeType: '费用调整',
              feeItem: '调整费用',
              amount: (Math.random() * 500).toFixed(2),
              currency: 'USD'
            };
          } else {
            item = {
              id: `batch_${i}`,
              customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
              feeType: '其他',
              feeItem: '其他费用',
              amount: (Math.random() * 300).toFixed(2),
              currency: 'USD'
            };
          }
          
          mockData.push(item);
        }
        
        // 保存数据到全局变量，以便下次打开弹窗时显示
        batchModalData = mockData;
        batchModalTotalItems = mockData.length;
        batchModalCurrentPage = 1;
        
        // 标记数据已加载
        batchModalDataLoaded = true;
        
        isSearching = false;
        
        // 显示处理完成提示
        showNotification('查询任务已完成，您可以重新打开批量获取费用弹窗查看结果');
        

      }, 3000); // 模拟处理时间
    }

    // 显示加载状态
    function showBatchModalLoading() {
      document.getElementById('batchModalLoading').classList.remove('hidden');
      document.getElementById('batchModalEmpty').classList.add('hidden');
      document.getElementById('batchModalDataTable').classList.add('hidden');
      document.getElementById('batchModalPagination').classList.add('hidden');
    }

    // 隐藏加载状态
    function hideBatchModalLoading() {
      document.getElementById('batchModalLoading').classList.add('hidden');
      
      if (batchModalData.length === 0) {
        document.getElementById('batchModalEmpty').classList.remove('hidden');
        document.getElementById('batchModalDataTable').classList.add('hidden');
        document.getElementById('batchModalPagination').classList.add('hidden');
      } else {
        document.getElementById('batchModalEmpty').classList.add('hidden');
        document.getElementById('batchModalDataTable').classList.remove('hidden');
        document.getElementById('batchModalPagination').classList.remove('hidden');
      }
    }

    // 更新分页控件
    function updateBatchModalPagination() {
      const totalPages = Math.ceil(batchModalTotalItems / batchModalItemsPerPage);
      const startItem = (batchModalCurrentPage - 1) * batchModalItemsPerPage + 1;
      const endItem = Math.min(batchModalCurrentPage * batchModalItemsPerPage, batchModalTotalItems);
      
      document.getElementById('batchModalStartItem').textContent = startItem;
      document.getElementById('batchModalEndItem').textContent = endItem;
      document.getElementById('batchModalTotalItems').textContent = batchModalTotalItems;
      
      const prevBtn = document.getElementById('batchModalPrevPage');
      const nextBtn = document.getElementById('batchModalNextPage');
      
      prevBtn.disabled = batchModalCurrentPage === 1;
      nextBtn.disabled = batchModalCurrentPage >= totalPages;
      
      // 添加分页事件监听
      prevBtn.onclick = function() {
        if (batchModalCurrentPage > 1) {
          batchModalCurrentPage--;
          renderBatchModalTable();
          updateBatchModalPagination();
        }
      };
      
      nextBtn.onclick = function() {
        const totalPages = Math.ceil(batchModalTotalItems / batchModalItemsPerPage);
        if (batchModalCurrentPage < totalPages) {
          batchModalCurrentPage++;
          renderBatchModalTable();
          updateBatchModalPagination();
        }
      };
    }

    // 根据费用类型获取费用项目
    function getFeeItemByType(feeType) {
      if (feeType.includes('出库+快递')) {
        return feeType.includes('TMS') ? 'TMS出库费' : 'YC出库费';
      } else if (feeType === '仓储费') {
        return '月度仓储费';
      } else if (feeType.includes('赔付')) {
        return '赔付费用';
      } else if (feeType === '充值') {
        return '账户充值';
      } else if (feeType === '费用调整') {
        return '调整费用';
      } else {
        return '其他费用';
      }
    }

    // 渲染批量弹窗表格
    function renderBatchModalTable() {
      const tbody = document.getElementById('batchModalDataTableBody');
      tbody.innerHTML = '';
      
      // 计算当前页的数据范围
      const startIndex = (batchModalCurrentPage - 1) * batchModalItemsPerPage;
      const endIndex = startIndex + batchModalItemsPerPage;
      const currentPageData = batchModalData.slice(startIndex, endIndex);
      
      currentPageData.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 table-row-hover';
        
        tr.innerHTML = `
          <td class="py-2 px-3">
            <input type="checkbox" data-id="${item.id}" class="rounded border-gray-300" onchange="toggleBatchModalItem('${item.id}')">
          </td>
          <td class="py-2 px-3">${item.customerCode}</td>
          <td class="py-2 px-3">${item.feeType}</td>
          <td class="py-2 px-3">${item.feeItem}</td>
          <td class="py-2 px-3">$${item.amount}</td>
          <td class="py-2 px-3">${item.currency}</td>
        `;
        
        tbody.appendChild(tr);
      });
    }

    // 切换批量弹窗表格项选择状态
    function toggleBatchModalItem(id) {
      const checkbox = document.querySelector(`input[data-id="${id}"]`);
      if (checkbox.checked) {
        batchModalSelectedItems.add(id);
      } else {
        batchModalSelectedItems.delete(id);
      }
      updateBatchModalSelectedCount();
    }

    // 更新批量弹窗选中计数
    function updateBatchModalSelectedCount() {
      document.getElementById('batchModalSelectedCount').textContent = batchModalSelectedItems.size;
    }



    // 提交批量弹窗数据
    function submitBatchModalData() {
      if (isBatchTaskRunning) {
        alert('任务正在执行中，请勿重复操作');
        return;
      }
      
      const selectedData = batchModalData.filter(item => batchModalSelectedItems.has(item.id));
      const dataToAdd = selectedData.length > 0 ? selectedData : batchModalData;
      
      // 显示提交确认对话框
      if (!confirm(`确定要批量获取 ${dataToAdd.length} 条费用记录吗？`)) {
        return;
      }
      
      // 设置任务执行状态为运行中
      isBatchTaskRunning = true;
      
      // 显示加载状态
      const loadingModal = document.createElement('div');
      loadingModal.id = 'batchModalLoading';
      loadingModal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
      loadingModal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-96">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 font-medium mb-2">批量获取费用任务已开始</p>
            <p class="text-gray-500 text-sm text-center mb-4">系统正在异步处理数据，请稍后回来查看任务状态</p>
            <p class="text-gray-400 text-xs text-center">您可以在「任务历史」中查看处理进度</p>
          </div>
        </div>
      `;
      document.body.appendChild(loadingModal);
      
      // 生成任务ID
      const taskId = `TASK${new Date().getTime()}`;
      

      
      // 模拟异步查询处理
      setTimeout(() => {
        // 模拟处理过程中的状态更新
        setTimeout(() => {
          // 模拟任务完成
          isBatchTaskRunning = false;
          loadingModal.remove();
          closeBatchFeeModal();
          
          // 显示完成通知
          showNotification('批量获取费用任务已提交，正在处理中');
          
          // 清除未使用的taskId变量
          taskId;
          console.log('批量获取费用任务执行完成');
          

        }, 3000); // 模拟更长的处理时间
      }, 1000); // 立即显示提示后关闭加载框
    }
    
    // 显示通知
    function showNotification(message) {
      // 创建通知元素
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in';
      notification.innerHTML = `
        <div class="flex items-center">
          <i class="fa fa-check-circle mr-2"></i>
          <span>${message}</span>
        </div>
      `;
      
      // 添加到页面
      document.body.appendChild(notification);
      
      // 3秒后自动消失
      setTimeout(() => {
        notification.classList.add('animate-slide-out');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 3000);
    }

    // 添加通知动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .animate-slide-in {
        animation: slideIn 0.3s ease-out;
      }
      
      .animate-slide-out {
        animation: slideOut 0.3s ease-in;
      }
    `;
    document.head.appendChild(style);

    // 获取账单类型对应的字配置
    function getBillTypeFields(billType) {
      const fieldConfigs = {
        '出库+快递(YC)': {
          headers: ['客户代码', '仓库', '出库单号', '订单号', '参考号', '快递单号', '运输方式', '出库费', '快递费', '合计', '币种'],
          fields: ['customerCode', 'warehouse', 'outboundNo', 'orderNo', 'refNo', 'trackingNo', 'shippingMethod', 'outboundFee', 'expressFee', 'total', 'currency']
        },
        '出库+快递(TMS)': {
          headers: ['客户代码', '仓库', '出库单号', '订单号', '参考号', '快递单号', '渠道', '出库费', '快递费', '合计', '币种'],
          fields: ['customerCode', 'warehouse', 'outboundNo', 'orderNo', 'refNo', 'trackingNo', 'channel', 'outboundFee', 'expressFee', 'total', 'currency']
        },
        '仓储费': {
          headers: ['客户代码', '仓库', 'SKU', '数量', '单价', '金额', '币种', '备注'],
          fields: ['customerCode', 'warehouse', 'sku', 'quantity', 'unitPrice', 'amount', 'currency', 'remark']
        },
        '快递赔付': {
          headers: ['客户代码', '仓库', '订单号', '赔付金额', '币种', '赔付原因', '备注'],
          fields: ['customerCode', 'warehouse', 'orderNo', 'compensationAmount', 'currency', 'reason', 'remark']
        },
        '库内赔付(错发)': {
          headers: ['客户代码', '仓库', '订单号', '赔付金额', '币种', '赔付原因', '备注'],
          fields: ['customerCode', 'warehouse', 'orderNo', 'compensationAmount', 'currency', 'reason', 'remark']
        },
        '库内赔付(丢件)': {
          headers: ['客户代码', '仓库', '订单号', '赔付金额', '币种', '赔付原因', '备注'],
          fields: ['customerCode', 'warehouse', 'orderNo', 'compensationAmount', 'currency', 'reason', 'remark']
        },
        '库内赔付(其他)': {
          headers: ['客户代码', '仓库', '订单号', '赔付金额', '币种', '赔付原因', '备注'],
          fields: ['customerCode', 'warehouse', 'orderNo', 'compensationAmount', 'currency', 'reason', 'remark']
        },
        '其他': {
          headers: ['客户代码', '仓库', '费用项目', '金额', '币种', '备注'],
          fields: ['customerCode', 'warehouse', 'feeItem', 'amount', 'currency', 'remark']
        },
        '充值': {
          headers: ['仓库', '客户名称', '流水号', '交易号', '汇款方式', '实际汇款人', '汇款金额', '汇率', '折算金额', '到账金额', '币种'],
          fields: ['warehouseCode', 'customerName', 'serialNo', 'transactionNo', 'paymentMethod', 'actualPayer', 'remittanceAmount', 'exchangeRate', 'convertedAmount', 'arrivedAmount', 'currency']
        },
        '费用调整': {
          headers: ['客户代码', '仓库', '订单号', '费用类型', '金额', '币种'],
          fields: ['customerCode', 'warehouseCode', 'orderNo', 'feeType', 'amount', 'currency']
        }
      };
      
      // 默认返回出库+快递的字配置
      return fieldConfigs[billType] || fieldConfigs['出库+快递(YC)'];
    }
    
    // 更新数据列表表头
    function updateModalTableHeader() {
      const billType = document.getElementById('modalBillType').value;
      const fieldConfig = getBillTypeFields(billType);
      const thead = document.getElementById('modalDataTableHead');
      const tr = thead.querySelector('tr');
      
      // 保留复选框列
      let headerHTML = `
        <th class="text-left py-2 px-3 font-semibold text-gray-700 text-sm">
          <input type="checkbox" id="modalCheckAll" class="rounded border-gray-300">
        </th>
      `;
      
      // 根据字配置生成表头
      fieldConfig.headers.forEach((header, index) => {
        const alignClass = header.includes('费') || header.includes('金额') || header.includes('合计') || header.includes('数量') || header.includes('单价') || header.includes('汇率')
          ? 'text-right' 
          : 'text-left';
        headerHTML += `<th class="${alignClass} py-2 px-3 font-semibold text-gray-700 text-sm">${header}</th>`;
      });
      
      tr.innerHTML = headerHTML;
      
      // 重新绑定全选事件
      document.getElementById('modalCheckAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#modalDataTableBody input[type="checkbox"]');
        checkboxes.forEach(cb => {
          cb.checked = this.checked;
          if (this.checked) {
            modalSelectedItems.add(cb.dataset.id);
          } else {
            modalSelectedItems.delete(cb.dataset.id);
          }
        });
        updateModalSelectedCount();
      });
    }
    
    // 根据账单类型更新检索条件显示
    function updateSearchConditions() {
      const billType = document.getElementById('modalBillType').value;
      const isTMS = billType === '出库+快递(TMS)';
      const isStorageFee = billType === '仓储费';
      const isCompensationFee = billType.includes('赔付'); // 包括快递赔付和库内赔付
      const isRechargeOrAdjust = billType === '充值' || billType === '费用调整';
      const isOther = billType === '其他';
      const isOutboundExpress = billType === '出库+快递(YC)';
      
      // 获取所有检索条件元素
      const customerCodeEl = document.getElementById('conditionCustomerCode');
      const warehouseCodeEl = document.getElementById('conditionWarehouseCode');
      const channelEl = document.getElementById('conditionChannel');
      const settlementDateEl = document.getElementById('conditionSettlementDate');
      const compensationTimeEl = document.getElementById('conditionCompensationTime');
      const shippingMethodEl = document.getElementById('conditionShippingMethod');
      const createTimeEl = document.getElementById('conditionCreateTime');
      const outboundTimeEl = document.getElementById('conditionOutboundTime');
      const serialNoEl = document.getElementById('conditionSerialNo');
      const orderNoEl = document.getElementById('conditionOrderNo');
      const listOutboundNoSearch = document.getElementById('listOutboundNoSearch');
      const listSearchConditions = document.getElementById('listSearchConditions');
      const listCompensationSearchConditions = document.getElementById('listCompensationSearchConditions');
      const listStorageFeeSearchConditions = document.getElementById('listStorageFeeSearchConditions');
      const listRechargeSearchConditions = document.getElementById('listRechargeSearchConditions');
      const listAdjustmentSearchConditions = document.getElementById('listAdjustmentSearchConditions');

      // 默认全部隐藏
      if (customerCodeEl) customerCodeEl.style.display = 'none';
      if (warehouseCodeEl) warehouseCodeEl.style.display = 'none';
      if (channelEl) channelEl.style.display = 'none';
      if (settlementDateEl) settlementDateEl.style.display = 'none';
      if (compensationTimeEl) compensationTimeEl.style.display = 'none';
      if (shippingMethodEl) shippingMethodEl.style.display = 'none';
      if (createTimeEl) createTimeEl.style.display = 'none';
      if (outboundTimeEl) outboundTimeEl.style.display = 'none';
      if (serialNoEl) serialNoEl.style.display = 'none';
      if (orderNoEl) orderNoEl.style.display = 'none';
      if (listOutboundNoSearch) {
        listOutboundNoSearch.classList.add('hidden');
      }
      if (listSearchConditions) {
        listSearchConditions.classList.add('hidden');
      }
      if (listCompensationSearchConditions) {
        listCompensationSearchConditions.classList.add('hidden');
      }
      if (listStorageFeeSearchConditions) {
        listStorageFeeSearchConditions.classList.add('hidden');
      }
      if (listRechargeSearchConditions) {
        listRechargeSearchConditions.classList.add('hidden');
      }
      if (listAdjustmentSearchConditions) {
        listAdjustmentSearchConditions.classList.add('hidden');
      }

      if (isTMS) {
        // 出库+快递(TMS)显示：客户代码、仓库、渠道、创建时间、出库时间
        if (customerCodeEl) customerCodeEl.style.display = 'block';
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (channelEl) channelEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
        if (outboundTimeEl) outboundTimeEl.style.display = 'block';
        if (listOutboundNoSearch) {
          listOutboundNoSearch.classList.remove('hidden');
        }
      } else if (isOutboundExpress) {
        // 出库+快递(YC)显示：客户代码、仓库、运输方式、创建时间、出库时间
        if (customerCodeEl) customerCodeEl.style.display = 'block';
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (shippingMethodEl) shippingMethodEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
        if (outboundTimeEl) outboundTimeEl.style.display = 'block';
        if (listSearchConditions) {
          listSearchConditions.classList.remove('hidden');
        }
        if (listOutboundNoSearch) {
          listOutboundNoSearch.classList.add('hidden');
        }
      } else if (isStorageFee) {
        // 仓储费显示：客户代码、仓库、结算日期
        if (customerCodeEl) customerCodeEl.style.display = 'block';
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (settlementDateEl) settlementDateEl.style.display = 'block';
        if (listStorageFeeSearchConditions) {
          listStorageFeeSearchConditions.classList.remove('hidden');
        }
        if (listSearchConditions) {
          listSearchConditions.classList.add('hidden');
        }
        if (listCompensationSearchConditions) {
          listCompensationSearchConditions.classList.add('hidden');
        }
        if (listOutboundNoSearch) {
          listOutboundNoSearch.classList.add('hidden');
        }
      } else if (isCompensationFee) {
        // 所有赔付类型显示：客户代码、仓库
        if (customerCodeEl) customerCodeEl.style.display = 'block';
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (listCompensationSearchConditions) {
          listCompensationSearchConditions.classList.remove('hidden');
        }
        if (listSearchConditions) {
          listSearchConditions.classList.add('hidden');
        }
        if (listOutboundNoSearch) {
          listOutboundNoSearch.classList.add('hidden');
        }
      } else if (isRechargeOrAdjust) {
        // 充值和费用调整显示：客户代码、仓库、创建时间、流水号、订单号
        if (customerCodeEl) customerCodeEl.style.display = 'block';
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
        if (billType === '充值') {
          if (serialNoEl) serialNoEl.style.display = 'block';
          if (orderNoEl) orderNoEl.style.display = 'none';
          if (listRechargeSearchConditions) {
            listRechargeSearchConditions.classList.remove('hidden');
          }
        } else if (billType === '费用调整') {
          if (serialNoEl) serialNoEl.style.display = 'none';
          if (orderNoEl) orderNoEl.style.display = 'block';
          if (listAdjustmentSearchConditions) {
            listAdjustmentSearchConditions.classList.remove('hidden');
          }
        }
      } else if (isOther) {
        // 其他类型显示：客户代码、仓库、创建时间
        if (customerCodeEl) customerCodeEl.style.display = 'block';
        if (warehouseCodeEl) warehouseCodeEl.style.display = 'block';
        if (createTimeEl) createTimeEl.style.display = 'block';
      }
    }

    // 搜索弹窗数据
    function searchModalData() {
      const billType = document.getElementById('modalBillType').value;
      if (!billType) {
        alert('请先选择账单类型');
        return;
      }
      
      // 根据账单类型生成不同的模拟数据
      let mockData = [];
      const fieldConfig = getBillTypeFields(billType);
      
      if (billType === '出库+快递(YC)') {
        mockData = [
          { id: 'm1', customerCode: 'ZJJS', warehouse: 'CA008', outboundNo: 'OUT-20250115-001', orderNo: 'ORD-20250115-001', refNo: 'REF-001', trackingNo: 'TRK-001', shippingMethod: '标准快递', outboundFee: 15.50, expressFee: 8.20, total: 23.70, currency: 'USD' },
          { id: 'm2', customerCode: 'ZJHW', warehouse: 'CA009', outboundNo: 'OUT-20250115-002', orderNo: 'ORD-20250115-002', refNo: 'REF-002', trackingNo: 'TRK-002', shippingMethod: '快速快递', outboundFee: 18.00, expressFee: 12.50, total: 30.50, currency: 'USD' },
          { id: 'm3', customerCode: 'ZJJS', warehouse: 'CA010', outboundNo: 'OUT-20250115-003', orderNo: 'ORD-20250115-003', refNo: 'REF-003', trackingNo: 'TRK-003', shippingMethod: '标准快递', outboundFee: 12.30, expressFee: 7.80, total: 20.10, currency: 'USD' }
        ];
      } else if (billType === '出库+快递(TMS)') {
        mockData = [
          { id: 'm1', customerCode: 'ZJJS', warehouse: 'CA008', outboundNo: 'OUT-20250115-011', orderNo: 'ORD-20250115-011', refNo: 'REF-011', trackingNo: 'TMS-TRK-001', channel: 'FEDEX_MPS', outboundFee: 16.50, expressFee: 9.20, total: 25.70, currency: 'USD' },
          { id: 'm2', customerCode: 'ZJHW', warehouse: 'CA009', outboundNo: 'OUT-20250115-012', orderNo: 'ORD-20250115-012', refNo: 'REF-012', trackingNo: 'TMS-TRK-002', channel: 'FEDEX_HOME_GROUND', outboundFee: 19.00, expressFee: 13.50, total: 32.50, currency: 'USD' },
          { id: 'm3', customerCode: 'ZJJS', warehouse: 'CA010', outboundNo: 'OUT-20250115-013', orderNo: 'ORD-20250115-013', refNo: 'REF-013', trackingNo: 'TMS-TRK-003', channel: 'UPS_GROUND', outboundFee: 14.30, expressFee: 8.80, total: 23.10, currency: 'USD' }
        ];
      } else if (billType === '仓储费') {
        mockData = [
          { id: 'm1', customerCode: 'ZJJS', warehouse: 'CA008', sku: 'SKU001', quantity: 100, unitPrice: 0.5, amount: 50.00, currency: 'USD', remark: '仓储费用' },
          { id: 'm2', customerCode: 'ZJHW', warehouse: 'CA009', sku: 'SKU002', quantity: 200, unitPrice: 0.3, amount: 60.00, currency: 'USD', remark: '仓储费用' },
          { id: 'm3', customerCode: 'ZJJS', warehouse: 'CA010', sku: 'SKU003', quantity: 150, unitPrice: 0.4, amount: 60.00, currency: 'USD', remark: '仓储费用' }
        ];
      } else if (billType === '快递赔付') {
        mockData = [
          { id: 'm1', customerCode: 'ZJJS', warehouse: 'CA008', orderNo: 'ORD-KD-001', compensationAmount: 45.00, currency: 'USD', reason: '快递丢失', remark: '快递赔付说明' },
          { id: 'm2', customerCode: 'ZJHW', warehouse: 'CA009', orderNo: 'ORD-KD-002', compensationAmount: 35.00, currency: 'USD', reason: '快递延误', remark: '快递赔付说明' },
          { id: 'm3', customerCode: 'ZJJS', warehouse: 'CA010', orderNo: 'ORD-KD-003', compensationAmount: 50.00, currency: 'USD', reason: '快递破损', remark: '快递赔付说明' }
        ];
      } else if (billType.includes('库内赔付')) {
        mockData = [
          { id: 'm1', customerCode: 'ZJJS', warehouse: 'CA008', orderNo: 'ORD-001', compensationAmount: 50.00, currency: 'USD', reason: billType, remark: '赔付说明' },
          { id: 'm2', customerCode: 'ZJHW', warehouse: 'CA009', orderNo: 'ORD-002', compensationAmount: 30.00, currency: 'USD', reason: billType, remark: '赔付说明' },
          { id: 'm3', customerCode: 'ZJJS', warehouse: 'CA010', orderNo: 'ORD-003', compensationAmount: 40.00, currency: 'USD', reason: billType, remark: '赔付说明' }
        ];
      } else if (billType === '其他') {
        mockData = [
          { id: 'm1', customerCode: 'ZJJS', warehouse: 'CA008', feeItem: '其他费用', amount: 25.00, currency: 'USD', remark: '其他费用说明' },
          { id: 'm2', customerCode: 'ZJHW', warehouse: 'CA009', feeItem: '其他费用', amount: 35.00, currency: 'USD', remark: '其他费用说明' }
        ];
      } else if (billType === '充值') {
        mockData = [
          { id: 'm1', warehouseCode: 'CA008', customerName: '张三公司', serialNo: 'SN-20250119-001', transactionNo: 'TRX-20250119-001', paymentMethod: '银行转账', actualPayer: '张三', remittanceAmount: 10000.00, exchangeRate: 1.0, convertedAmount: 10000.00, arrivedAmount: 10000.00, currency: 'USD' },
          { id: 'm2', warehouseCode: 'CA009', customerName: '李四公司', serialNo: 'SN-20250119-002', transactionNo: 'TRX-20250119-002', paymentMethod: '支付宝', actualPayer: '李四', remittanceAmount: 20000.00, exchangeRate: 0.14, convertedAmount: 2800.00, arrivedAmount: 2800.00, currency: 'USD' },
          { id: 'm3', warehouseCode: 'CA010', customerName: '王五公司', serialNo: 'SN-20250119-003', transactionNo: 'TRX-20250119-003', paymentMethod: '微信支付', actualPayer: '王五', remittanceAmount: 15000.00, exchangeRate: 1.0, convertedAmount: 15000.00, arrivedAmount: 15000.00, currency: 'USD' }
        ];
      } else if (billType === '费用调整') {
        mockData = [
          { id: 'm1', customerCode: 'ZJJS', warehouseCode: 'CA008', orderNo: 'ORD-20250119-001', feeType: '仓储费调整', amount: 50.00, currency: 'USD' },
          { id: 'm2', customerCode: 'ZJHW', warehouseCode: 'CA009', orderNo: 'ORD-20250119-002', feeType: '快递费调整', amount: -30.00, currency: 'USD' },
          { id: 'm3', customerCode: 'ZJWL', warehouseCode: 'CA010', orderNo: 'ORD-20250119-003', feeType: '出库费调整', amount: 25.00, currency: 'USD' }
        ];
      }
      
      modalData = mockData;
      updateModalTableHeader();
      renderModalTable();
    }

    // 渲染弹窗表格
    function renderModalTable() {
      const tbody = document.getElementById('modalDataTableBody');
      tbody.innerHTML = '';
      
      const billType = document.getElementById('modalBillType').value;
      const fieldConfig = getBillTypeFields(billType);
      const colCount = fieldConfig.fields.length + 1; // +1 for checkbox column
      
      if (modalData.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="${colCount}" class="py-6 text-center text-gray-500">
              <i class="fa fa-inbox text-3xl mb-2 block"></i>
              暂无数据
            </td>
          </tr>
        `;
        // 重置合计金额
        document.getElementById('modalTotalAmount').textContent = '$0.00';
        return;
      }

      let totalAmount = 0;
      
      modalData.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'table-row-hover border-b border-gray-100';
        
        let rowHTML = `
          <td class="py-2 px-3">
            <input type="checkbox" data-id="${item.id}" class="rounded border-gray-300 modal-item-checkbox">
          </td>
        `;
        
        // 根据字配置动态生成表格行
        fieldConfig.fields.forEach(field => {
          let value = item[field] || '-';
          let alignClass = 'text-left';
          let displayValue = value;
          
          // 处理数值字段
          if (field.includes('Fee') || field.includes('Amount') || field.includes('Price') || field === 'total' || field === 'quantity' || field === 'exchangeRate') {
            alignClass = 'text-right';
            if (typeof value === 'number') {
              // 汇率显示4位小数
              if (field === 'exchangeRate') {
                displayValue = value.toFixed(4);
              }
              // 费用调整的调整金额不显示$和+号
              else if (field === 'adjustAmount') {
                displayValue = value.toFixed(2);
              } else {
                displayValue = `$${value.toFixed(2)}`;
              }
              
              // 计算合计金额
              if (field === 'total' || field === 'amount' || field === 'compensationAmount' || field === 'arrivedAmount' || field === 'adjustAmount') {
                totalAmount += Math.abs(value);
              }
            }
          }
          
          rowHTML += `<td class="py-2 px-3 ${alignClass}">${displayValue}</td>`;
        });
        
        tr.innerHTML = rowHTML;
        tbody.appendChild(tr);
      });
      
      // 更新合计金额
      document.getElementById('modalTotalAmount').textContent = `$${totalAmount.toFixed(2)}`;

      // 绑定复选框事件
      document.querySelectorAll('.modal-item-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
          if (this.checked) {
            modalSelectedItems.add(this.dataset.id);
          } else {
            modalSelectedItems.delete(this.dataset.id);
          }
          updateModalSelectedCount();
          updateModalCheckAll();
        });
      });
    }

    // 更新弹窗选中数量
    function updateModalSelectedCount() {
      document.getElementById('modalSelectedCount').textContent = modalSelectedItems.size;
    }

    // 更新弹窗全选状态
    function updateModalCheckAll() {
      const checkAll = document.getElementById('modalCheckAll');
      const checkboxes = document.querySelectorAll('.modal-item-checkbox');
      checkAll.checked = checkboxes.length > 0 && checkboxes.length === modalSelectedItems.size;
    }

    // 费用列表区域按出库单号搜索
    function searchByOutboundNo() {
      const outboundNo = document.getElementById('modalListOutboundNo').value.trim();
      if (!outboundNo) {
        alert('请输入出库单号');
        return;
      }

      const billType = document.getElementById('modalBillType').value;
      if (billType !== '出库+快递(YC)' && billType !== '出库+快递(TMS)') {
        alert('出库单号搜索仅适用于出库+快递账单类型');
        return;
      }

      // 在现有数据中筛选
      const filteredData = mockData.filter(item => {
        return item.outboundNo && item.outboundNo.includes(outboundNo);
      });

      if (filteredData.length === 0) {
        alert('未找到匹配的出库单号');
        return;
      }

      // 更新表格数据
      modalData = filteredData;
      renderModalTable();

      // 清空选中状态
      modalSelectedItems.clear();
      updateModalSelectedCount();
      updateModalCheckAll();
    }

    // 根据客户代码获取客户信息（销售、客服）
    function getCustomerInfo(customerCode) {
      // 客户信息映射表，可以根据实际需求修改
      const customerMap = {
        'ZJJS': { sales: '张三', customerService: '李四' },
        'ZJHW': { sales: '赵六', customerService: '钱七' },
        'ZJWL': { sales: '周九', customerService: '吴十' }
      };
      
      // 如果找到映射，返回对应信息，否则返回默认值
      if (customerMap[customerCode]) {
        return customerMap[customerCode];
      }
      
      // 默认值
      return {
        sales: '-',
        customerService: '-'
      };
    }

    // 任务执行状态
    let isTaskRunning = false;

    // 提交弹窗数据
    function submitModalData() {
      if (isTaskRunning) {
        alert('任务正在执行中，请勿重复操作');
        return;
      }
      
      // 如果没有勾选任何项，默认提交全部数据；如果勾选了，只提交勾选的项
      let selectedData;
      if (modalSelectedItems.size === 0) {
        // 未勾选任何项，提交全部数据
        if (modalData.length === 0) {
          alert('没有可提交的数据，请先搜索数据');
          return;
        }
        selectedData = modalData;
      } else {
        // 只提交勾选的项
        selectedData = modalData.filter(item => modalSelectedItems.has(item.id));
      }
      
      // 获取账单类型
      const billType = document.getElementById('modalBillType').value;
      if (!billType) {
        alert('请选择账单类型');
        return;
      }
      
      // 数据量较大时的处理策略
      if (selectedData.length > 50) {
        if (!confirm(`您选择了 ${selectedData.length} 条记录，处理可能需要较长时间。是否继续？`)) {
          return;
        }
      }
      
      // 显示提交确认对话框
      if (!confirm(`确定要添加 ${selectedData.length} 条费用记录吗？`)) {
        return;
      }
      
      // 设置任务执行状态为运行中
      isTaskRunning = true;
      
      // 显示加载状态
      const loadingModal = document.createElement('div');
      loadingModal.id = 'modalLoading';
      loadingModal.className = 'fixed inset-0 z-50 flex items-center justify-center modal-overlay';
      loadingModal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-80">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600">正在处理数据，请稍候...</p>
          </div>
        </div>
      `;
      document.body.appendChild(loadingModal);
      
      // 模拟异步操作
      setTimeout(() => {
        // 将费用明细数据转换为账单数据（按客户代码和账单月份分组汇总）
        const billMap = new Map();
        
        // 记录本次提交中已生成的账单号，用于流水号计算
        const generatedBillNos = [];
        
        // 生成账单号函数：客户代码+年月日+3位流水号
        function generateBillNo(customerCode) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const dateStr = `${year}${month}${day}`;
          const billNoPrefix = `${customerCode}${dateStr}`;
          
          // 查找当天该客户代码已存在的账单数量（包括已保存的和本次生成的）
          const existingBills = reconciliationData.filter(bill => {
            if (!bill.billNo) return false;
            return bill.billNo.startsWith(billNoPrefix);
          });
          
          // 统计本次提交中已生成的相同前缀的账单号数量
          const currentSessionBills = generatedBillNos.filter(billNo => 
            billNo.startsWith(billNoPrefix)
          );
          
          // 计算流水号（从001开始）
          const totalCount = existingBills.length + currentSessionBills.length;
          const sequence = String(totalCount + 1).padStart(3, '0');
          
          const billNo = `${customerCode}${dateStr}${sequence}`;
          generatedBillNos.push(billNo);
          
          return billNo;
        }
        
        selectedData.forEach(item => {
          const billMonth = document.getElementById('modalBillMonth').value || new Date().toISOString().slice(0, 7);
          const key = `${item.customerCode}_${billMonth}_${billType}`;
          
          if (!billMap.has(key)) {
            const billNo = generateBillNo(item.customerCode);
            const voyagePeriod = document.getElementById('modalVoyagePeriod').value || '';
            
            // 根据客户代码自动填充销售、客服信息
            const customerInfo = getCustomerInfo(item.customerCode);
            
            const currentTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
            billMap.set(key, {
              id: billNo,
              billNo: billNo,
              billMonth: billMonth,
              voyagePeriod: voyagePeriod,
              customerCode: item.customerCode,
              sales: customerInfo.sales,
              customerService: customerInfo.customerService,
              billType: billType,
              billAmount: 0,
              billStatus: '已出账',
              creator: '系统',
              createTime: currentTime,
              createUser: '系统',
              voidUser: '',
              voidTime: '',
              submitUser: '',
              submitTime: '',
              billRemark: '',
              details: []
            });
          }
          
          const bill = billMap.get(key);
          // 根据账单类型获取金额字段
          let amount = 0;
          if (item.total !== undefined) {
            amount = item.total;
          } else if (item.amount !== undefined) {
            amount = item.amount;
          } else if (item.compensationAmount !== undefined) {
            amount = item.compensationAmount;
          } else if (item.rechargeAmount !== undefined) {
            amount = item.rechargeAmount;
          } else if (item.adjustAmount !== undefined) {
            amount = Math.abs(item.adjustAmount);
          }
          bill.billAmount += amount;
          
          // 为明细添加状态字段，默认为"已出账"
          const detailWithStatus = {
            ...item,
            detailStatus: '已出账'
          };
          bill.details.push(detailWithStatus);
        });
        
        // 将汇总后的账单数据添加到列表
        const newBills = Array.from(billMap.values());
        reconciliationData = [...reconciliationData, ...newBills];
        
        // 重新渲染表格和汇总数据
        renderTable();
        updateSummary();
        
        // 完成任务
        isTaskRunning = false;
        loadingModal.remove();
        closeFeeModal();
        showNotification('费用记录已成功添加，请稍后查看');
        console.log('费用获取任务执行完成');
        

      }, 1500);
    }

    // 渲染主表格
    function renderTable() {
      const tbody = document.getElementById('reconciliationTableBody');
      tbody.innerHTML = '';
      
      if (reconciliationData.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="14" class="py-8 text-center text-gray-500">
              <i class="fa fa-inbox text-4xl mb-2 block"></i>
              暂无数据，请点击"费用获取"按钮获取数据
            </td>
          </tr>
        `;
        return;
      }

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageData = reconciliationData.slice(startIndex, endIndex);

      pageData.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'table-row-hover border-b border-gray-100';
        
        // 获取状态标签样式
        const statusClass = getStatusClass(item.billStatus || '待审核');
        const statusText = item.billStatus || '待审核';
        
        tr.innerHTML = `
          <td class="py-3 px-4">
            <input type="checkbox" data-id="${item.id || item.billNo}" class="rounded border-gray-300 item-checkbox" ${selectedItems.has(item.id || item.billNo) ? 'checked' : ''}>
          </td>
          <td class="py-3 px-4 font-medium text-primary">${item.billNo || '-'}</td>
          <td class="py-3 px-4">${item.billMonth || '-'}</td>
          <td class="py-3 px-4">${item.voyagePeriod || '-'}</td>
          <td class="py-3 px-4">${item.customerCode || '-'}</td>
          <td class="py-3 px-4">${item.sales || '-'}</td>
          <td class="py-3 px-4">${item.customerService || '-'}</td>
          <td class="py-3 px-4">${item.billType || '-'}</td>
          <td class="py-3 px-4 text-right font-semibold text-success">$${(item.billAmount || 0).toFixed(2)}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${statusText}</span>
          </td>
          <td class="py-3 px-4">
            <div class="space-y-1 text-sm">
              ${item.createUser ? `<div class="text-gray-700"><span class="text-gray-500">创建人:</span> ${item.createUser}</div>` : ''}
              ${item.voidUser ? `<div class="text-gray-700"><span class="text-gray-500">作废人:</span> ${item.voidUser}</div>` : ''}
              ${item.submitUser ? `<div class="text-gray-700"><span class="text-gray-500">提交人:</span> ${item.submitUser}</div>` : ''}
              ${!item.createUser && !item.voidUser && !item.submitUser ? '-' : ''}
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="space-y-1 text-sm text-gray-500">
              ${item.createTime ? `<div>创建时间: ${item.createTime}</div>` : ''}
              ${item.voidTime ? `<div>作废时间: ${item.voidTime}</div>` : ''}
              ${item.submitTime ? `<div>提交时间: ${item.submitTime}</div>` : ''}
              ${!item.createTime && !item.voidTime && !item.submitTime ? '-' : ''}
            </div>
          </td>
          <td class="py-3 px-4 text-sm text-gray-600 max-w-xs truncate" title="${item.billRemark || ''}">${item.billRemark || '-'}</td>
          <td class="py-3 px-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="viewDetail('${item.id || item.billNo}')" class="px-3 py-1 text-primary hover:bg-primary/10 rounded transition-colors">
                <i class="fa fa-eye mr-1"></i>详情
            </button>
              ${item.billStatus === '已作废' ? '' : `
              <button onclick="voidBill('${item.id || item.billNo}')" class="px-3 py-1 text-danger hover:bg-danger/10 rounded transition-colors">
                <i class="fa fa-ban mr-1"></i>作废
              </button>
              `}
              ${item.billStatus === '已作废' ? '' : `
              <button onclick="submitBill('${item.id || item.billNo}')" class="hidden px-3 py-1 text-success hover:bg-success/10 rounded transition-colors">
                <i class="fa fa-check mr-1"></i>${item.billStatus === '已完成' ? '回退' : '提交'}
              </button>
              `}
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // 绑定复选框事件
      document.querySelectorAll('.item-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
          const itemId = this.dataset.id;
          if (this.checked) {
            selectedItems.add(itemId);
          } else {
            selectedItems.delete(itemId);
          }
          updateSummary();
          updateCheckAll();
        });
      });

      updatePagination();
      
      // 计算总金额
      const totalAmount = reconciliationData.reduce((sum, item) => {
        return sum + parseFloat(item.billAmount || 0);
      }, 0);
      
      // 更新总金额显示
      const totalAmountElement = document.getElementById('totalAmount');
      if (totalAmountElement) {
        // 找到金额显示的span元素并更新内容
        const amountSpan = totalAmountElement.querySelector('span.text-success');
        if (amountSpan) {
          amountSpan.textContent = `$${totalAmount.toFixed(2)}`;
        }
      }
    }
    
    // 获取状态标签样式
    function getStatusClass(status) {
      const statusMap = {
        '待审核': 'bg-warning/20 text-warning',
        '已审核': 'bg-success/20 text-success',
        '已驳回': 'bg-danger/20 text-danger',
        '已完成': 'bg-primary/20 text-primary',
        '已作废': 'bg-gray-300 text-gray-700',
        '已出账': 'bg-blue-100 text-blue-700',
        '未出账': 'bg-orange-100 text-orange-700'
      };
      return statusMap[status] || 'bg-gray-100 text-gray-600';
    }
    
    // 作废账单
    function voidBill(id) {
      const item = reconciliationData.find(d => (d.id === id || d.billNo === id));
      if (!item) {
        alert('账单不存在');
        return;
      }
      
      if (item.billStatus === '已作废') {
        alert('该账单已经作废');
        return;
      }
      
      if (item.billStatus === '已完成') {
        alert('已完成的账单不允许作废');
        return;
      }
      
      if (!confirm(`确定要作废账单 ${item.billNo} 吗？作废后将无法恢复。`)) {
        return;
      }
      
      // 更新账单状态为已作废
      item.billStatus = '已作废';
      item.voidUser = '系统'; // 可以改为当前用户
      item.voidTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
      
      // 更新明细状态为未出账
      if (item.details && item.details.length > 0) {
        item.details.forEach(detail => {
          detail.detailStatus = '未出账';
        });
      }
      
      // 重新渲染表格
      renderTable();
      
      alert('账单已作废');
    }
    
    // 提交账单（单条）- 支持已完成状态回退
    function submitBill(id) {
      const item = reconciliationData.find(d => (d.id === id || d.billNo === id));
      if (!item) {
        alert('账单不存在');
        return;
      }
      
      if (item.billStatus === '已作废') {
        alert('已作废的账单不能操作');
        return;
      }
      
      // 如果是已完成状态，执行回退操作
      if (item.billStatus === '已完成') {
        if (!confirm(`确定要回退账单 ${item.billNo} 吗？回退后状态将变为已出账。`)) {
          return;
        }
        
        // 更新账单状态为已出账
        item.billStatus = '已出账';
        item.submitUser = '';
        item.submitTime = '';
        
        // 更新明细状态为已出账
        if (item.details && item.details.length > 0) {
          item.details.forEach(detail => {
            detail.detailStatus = '已出账';
          });
        }
        
        // 重新渲染表格
        renderTable();
        
        alert('账单回退成功，状态已变更为已出账');
        return;
      }
      
      // 原有的提交逻辑
      if (!confirm(`确定要提交账单 ${item.billNo} 吗？提交后状态将变为已完成。`)) {
        return;
      }
      
      // 更新账单状态为已完成
      item.billStatus = '已完成';
      item.submitUser = '系统';
      item.submitTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
      
      // 更新明细状态为已完成
      if (item.details && item.details.length > 0) {
        item.details.forEach(detail => {
          detail.detailStatus = '已完成';
        });
      }
      
      // 重新渲染表格
      renderTable();
      
      alert('账单提交成功');
    }
    
    // 批量提交账单
    function batchSubmitBills() {
      if (selectedItems.size === 0) {
        alert('请至少选择一条账单');
        return;
      }
      
      const selectedBills = reconciliationData.filter(item => 
        selectedItems.has(item.id || item.billNo)
      );
      
      // 检查是否有已作废的账单
      const voidedBills = selectedBills.filter(item => item.billStatus === '已作废');
      if (voidedBills.length > 0) {
        alert('选中的账单中包含已作废的账单，无法提交');
        return;
      }
      
      // 检查是否都已完成
      const completedBills = selectedBills.filter(item => item.billStatus === '已完成');
      if (completedBills.length === selectedBills.length) {
        alert('选中的账单已经全部完成');
        return;
      }
      
      if (!confirm(`确定要批量提交 ${selectedBills.length} 条账单吗？提交后状态将变为已完成。`)) {
        return;
      }
      
      // 批量更新状态
      selectedBills.forEach(item => {
        if (item.billStatus !== '已完成' && item.billStatus !== '已作废') {
          item.billStatus = '已完成';
          item.submitUser = '系统';
          item.submitTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
          
          // 更新明细状态为已完成
          if (item.details && item.details.length > 0) {
            item.details.forEach(detail => {
              detail.detailStatus = '已完成';
            });
          }
        }
      });
      
      // 清空选择
      selectedItems.clear();
      
      // 重新渲染表格
      renderTable();
      updateSummary();
      
      alert(`成功提交 ${selectedBills.length} 条账单`);
    }

    // 更新汇总数据
    function updateSummary() {
      const totalRecords = reconciliationData.length;
      const selectedRecords = selectedItems.size;
      const totalAmount = reconciliationData.reduce((sum, item) => sum + (item.billAmount || 0), 0);
      const selectedAmount = reconciliationData
        .filter(item => selectedItems.has(item.id || item.billNo))
        .reduce((sum, item) => sum + (item.billAmount || 0), 0);
      
      const customers = new Set(reconciliationData.map(item => item.customerCode).filter(Boolean));
      
      // 计算明细总数（所有账单的明细数量）
      const totalDetails = reconciliationData.reduce((sum, item) => sum + (item.details ? item.details.length : 0), 0);

      // 只更新存在的元素
      const totalRecordsEl = document.getElementById('totalRecords');
      if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;
      
      const selectedRecordsEl = document.getElementById('selectedRecords');
      if (selectedRecordsEl) selectedRecordsEl.textContent = selectedRecords;
      
      const totalAmountEl = document.getElementById('totalAmount');
      if (totalAmountEl) {
        // 找到金额显示的span元素并更新内容
        const amountSpan = totalAmountEl.querySelector('span.text-success');
        if (amountSpan) {
          amountSpan.textContent = `$${totalAmount.toFixed(2)}`;
        }
      }
      
      const selectedAmountEl = document.getElementById('selectedAmount');
      if (selectedAmountEl) selectedAmountEl.textContent = `$${selectedAmount.toFixed(2)}`;
      
      const customerCountEl = document.getElementById('customerCount');
      if (customerCountEl) customerCountEl.textContent = customers.size;
      
      const warehouseCountEl = document.getElementById('warehouseCount');
      if (warehouseCountEl) warehouseCountEl.textContent = totalDetails; // 显示明细总数
    }

    // 更新全选状态
    function updateCheckAll() {
      const checkAll = document.getElementById('tableCheckAll');
      const checkboxes = document.querySelectorAll('.item-checkbox');
      checkAll.checked = checkboxes.length > 0 && checkboxes.length === selectedItems.size;
    }

    // 更新分页
    function updatePagination() {
      const totalPages = Math.ceil(reconciliationData.length / itemsPerPage);
      const startItem = reconciliationData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(currentPage * itemsPerPage, reconciliationData.length);
      
      document.getElementById('paginationInfo').textContent = `显示 ${startItem}-${endItem} 条，共 ${reconciliationData.length} 条`;

      const prevBtn = document.getElementById('prevPageBtn');
      const nextBtn = document.getElementById('nextPageBtn');
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage >= totalPages;

      const pageButtons = document.getElementById('pageButtons');
      pageButtons.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `w-8 h-8 flex items-center justify-center rounded border transition-all ${
          i === currentPage ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:border-primary hover:text-primary'
        }`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
          currentPage = i;
          renderTable();
        });
        pageButtons.appendChild(btn);
      }
    }

    // 筛选数据
    function filterData() {
      // 这里可以根据筛选条件过滤数据
      renderTable();
    }

    // 重置筛选
    function resetFilter() {
      // 动态获取所有筛选输入框并重置
      const basicContainer = document.getElementById('basicFilters');
      basicContainer.querySelectorAll('select, input').forEach(el => {
        el.value = '';
      });

      // 重新设置账单月为当前月份
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const currentMonth = `${year}-${month}`;
      const billMonthInput = document.getElementById('filterBillMonth');
      if (billMonthInput) {
        billMonthInput.value = currentMonth;
      }

      // 重新设置类型为第一个选项
      const billTypeInput = document.getElementById('filterBillType');
      if (billTypeInput) {
        billTypeInput.value = '出库+快递(YC)';
      }

      renderTable();
    }

    // 查看详情
    function viewDetail(id) {
      const item = reconciliationData.find(d => (d.id === id || d.billNo === id));
      if (!item) return;

      const billInfoSection = document.getElementById('billInfoSection');
      const detailContent = document.getElementById('detailContent');
      
      // 账单基本信息 - 固定在顶部，使用紧凑的标签式布局
      let billInfoHtml = `
        <div class="p-3">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <!-- 关键信息突出显示 -->
            <div class="flex items-center gap-1.5">
              <span class="text-gray-400">账单号</span>
              <span class="font-bold text-primary text-sm">${item.billNo || '-'}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-gray-400">金额</span>
              <span class="font-bold text-success text-sm">$${(item.billAmount || 0).toFixed(2)}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-gray-400">状态</span>
              <span class="px-1.5 py-0.5 rounded text-xs font-medium ${getStatusClass(item.billStatus || '待审核')}">${item.billStatus || '待审核'}</span>
            </div>
            <div class="w-px h-4 bg-gray-300"></div>
            <!-- 其他信息 -->
            <div class="flex items-center gap-1">
              <span class="text-gray-400">账单月</span>
              <span class="text-gray-700">${item.billMonth || '-'}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-400">客户代码</span>
              <span class="text-gray-700">${item.customerCode || '-'}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-400">账单类型</span>
              <span class="text-gray-700">${item.billType || '-'}</span>
            </div>
            ${item.voyagePeriod ? `
            <div class="flex items-center gap-1">
              <span class="text-gray-400">航期</span>
              <span class="text-gray-700">${item.voyagePeriod}</span>
            </div>
            ` : ''}
            ${item.billRemark ? `
            <div class="w-full flex items-start gap-1 mt-1">
              <span class="text-gray-400 whitespace-nowrap">备注</span>
              <span class="text-gray-700 flex-1">${item.billRemark}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `;
      
      billInfoSection.innerHTML = billInfoHtml;
      
      // 费用明细列表
      let detailHtml = '';
      if (item.details && item.details.length > 0) {
        // 根据账单类型获取字配置
        const billType = item.billType || '出库+快递(YC)';
        const fieldConfig = getBillTypeFields(billType);
        
        detailHtml += `
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-1 h-5 bg-primary rounded"></div>
              <h4 class="text-base font-semibold text-dark">费用明细</h4>
              <span class="text-sm text-gray-500 ml-2">共 ${item.details.length} 条</span>
            </div>
            <div class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
        `;
        
        // 根据字配置动态生成表头
        fieldConfig.headers.forEach(header => {
          const alignClass = header.includes('费') || header.includes('金额') || header.includes('合计') || header.includes('数量') || header.includes('单价') || header.includes('汇率')
            ? 'text-right' 
            : 'text-left';
          detailHtml += `<th class="${alignClass} py-2 px-3 font-semibold text-gray-700 text-xs">${header}</th>`;
        });
        
        detailHtml += `
                  </tr>
                </thead>
                <tbody>
        `;
        
        // 根据字配置动态生成数据行
        item.details.forEach((detail, index) => {
          detailHtml += `<tr class="border-b border-gray-100 hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}">`;
          
          fieldConfig.fields.forEach(field => {
            let value = detail[field] || '-';
            let alignClass = 'text-left';
            let displayValue = value;
            
            // 处理数值字段
            if (field.includes('Fee') || field.includes('Amount') || field.includes('Price') || field === 'total' || field === 'quantity' || field === 'exchangeRate') {
              alignClass = 'text-right';
              if (typeof value === 'number') {
                // 汇率显示4位小数
                if (field === 'exchangeRate') {
                  displayValue = value.toFixed(4);
                }
                // 费用调整的调整金额不显示$和+号
                else if (field === 'adjustAmount') {
                  displayValue = value.toFixed(2);
                } else {
                  displayValue = `$${value.toFixed(2)}`;
                }
              }
            }
            
            detailHtml += `<td class="py-2 px-3 ${alignClass}">${displayValue}</td>`;
          });
          
          detailHtml += `</tr>`;
        });
        
        detailHtml += `
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else {
        detailHtml += `
          <div class="text-center py-8 text-gray-500">
            <i class="fa fa-inbox text-4xl mb-2 block"></i>
            暂无明细数据
          </div>
        `;
      }
      
      detailContent.innerHTML = detailHtml;

      document.getElementById('detailModal').classList.add('show');
    }

    // 导出数据
    function exportData() {
      const dataToExport = selectedItems.size > 0 
        ? reconciliationData.filter(item => selectedItems.has(item.id))
        : reconciliationData;
      
      if (dataToExport.length === 0) {
        alert('没有可导出的数据');
        return;
      }

      // 这里可以实现实际的导出功能
      alert(`准备导出 ${dataToExport.length} 条数据`);
    }

    // 暴露全局函数
    window.toggleCustomerCodeDropdown = toggleCustomerCodeDropdown;
    window.updateCustomerCodeText = updateCustomerCodeText;
    window.toggleWarehouseCodeDropdown = toggleWarehouseCodeDropdown;
    window.updateWarehouseCodeText = updateWarehouseCodeText;
    window.toggleWarehouseDropdown = toggleWarehouseDropdown;
    window.updateWarehouseText = updateWarehouseText;
    window.toggleCustomerSearchDropdown = toggleCustomerSearchDropdown;
    window.updateCustomerSearchText = updateCustomerSearchText;
    window.viewDetail = viewDetail;
    window.voidBill = voidBill;
    window.submitBill = submitBill;
    
    // ==================== 折叠面板功能 ====================
    
    function toggleCollapse(id) {
      const content = document.getElementById(id + 'Content');
      const icon = document.getElementById(id + 'Icon');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(0deg)';
      } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(-90deg)';
      }
    }
    
    // 费用列表客户代码更新
    function updateListCustomerCodeText() {
      const radio = document.querySelector('input[name="listCustomerCode"]:checked');
      const text = document.getElementById('listCustomerCodeText');
      if (!radio) {
        text.textContent = '全部';
      } else {
        text.textContent = radio.value || '全部';
      }
    }
    
    // 费用列表仓库更新
    function updateListWarehouseText() {
      const radio = document.querySelector('input[name="listWarehouse"]:checked');
      const text = document.getElementById('listWarehouseText');
      if (!radio) {
        text.textContent = '全部';
      } else {
        text.textContent = radio.value || '全部';
      }
    }
    
    // 绑定费用列表下拉框事件
    function bindListDropdownEvents() {
      // 客户代码下拉框
      const listCustomerDropdown = document.getElementById('listCustomerCodeDropdown');
      const listCustomerOptions = document.getElementById('listCustomerCodeOptions');
      if (listCustomerDropdown && listCustomerOptions) {
        listCustomerDropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          listCustomerOptions.classList.toggle('hidden');
        });
      }
      
      // 仓库下拉框
      const listWarehouseDropdown = document.getElementById('listWarehouseDropdown');
      const listWarehouseOptions = document.getElementById('listWarehouseOptions');
      if (listWarehouseDropdown && listWarehouseOptions) {
        listWarehouseDropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          listWarehouseOptions.classList.toggle('hidden');
        });
      }
      
      // 赔付类型客户代码下拉框
      const listCompensationCustomerDropdown = document.getElementById('listCompensationCustomerCodeDropdown');
      const listCompensationCustomerOptions = document.getElementById('listCompensationCustomerCodeOptions');
      if (listCompensationCustomerDropdown && listCompensationCustomerOptions) {
        listCompensationCustomerDropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          listCompensationCustomerOptions.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (listCustomerOptions) listCustomerOptions.classList.add('hidden');
        if (listWarehouseOptions) listWarehouseOptions.classList.add('hidden');
        if (listCompensationCustomerOptions) listCompensationCustomerOptions.classList.add('hidden');
      });
    }
    
    // 费用列表赔付类型客户代码更新
    function updateListCompensationCustomerCodeText() {
      const radio = document.querySelector('input[name="listCompensationCustomerCode"]:checked');
      const text = document.getElementById('listCompensationCustomerCodeText');
      if (!radio) {
        text.textContent = '全部';
      } else {
        text.textContent = radio.value || '全部';
      }
    }
    
    // 更新工单号搜索类型
    function updateWorkOrderSearchType(type) {
      const text = document.getElementById('workOrderSearchTypeText');
      const options = document.getElementById('workOrderSearchTypeOptions');
      text.textContent = type;
      options.classList.add('hidden');
    }
    
    // 绑定工单号搜索类型下拉框事件
    function bindWorkOrderSearchTypeEvents() {
      const dropdown = document.getElementById('workOrderSearchTypeDropdown');
      const options = document.getElementById('workOrderSearchTypeOptions');
      if (dropdown && options) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          options.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (options) options.classList.add('hidden');
      });
    }
    
    // 更新搜索类型
    function updateSearchType(field, type) {
      const text = document.getElementById(field + 'SearchTypeText');
      const options = document.getElementById(field + 'SearchTypeOptions');
      if (text && options) {
        text.textContent = type;
        options.classList.add('hidden');
      }
    }
    
    // 绑定搜索类型下拉框事件
    function bindSearchTypeEvents() {
      const fields = ['referenceNo', 'outboundNo', 'expressNo'];
      fields.forEach(field => {
        const dropdown = document.getElementById(field + 'SearchTypeDropdown');
        const options = document.getElementById(field + 'SearchTypeOptions');
        if (dropdown && options) {
          dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            options.classList.toggle('hidden');
          });
        }
      });
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        fields.forEach(field => {
          const options = document.getElementById(field + 'SearchTypeOptions');
          if (options) options.classList.add('hidden');
        });
      });
    }
    
    // 更新仓储费客户代码显示文本
    function updateListStorageCustomerCodeText() {
      const radio = document.querySelector('input[name="listStorageCustomerCode"]:checked');
      const textEl = document.getElementById('listStorageCustomerCodeText');
      if (radio && textEl) {
        textEl.textContent = radio.parentElement.querySelector('span').textContent;
        document.getElementById('listStorageCustomerCodeOptions').classList.add('hidden');
      }
    }
    
    // 更新仓储订单号搜索类型
    function updateStorageOrderNoSearchType(type) {
      const text = document.getElementById('storageOrderNoSearchTypeText');
      const options = document.getElementById('storageOrderNoSearchTypeOptions');
      if (text && options) {
        text.textContent = type === '模糊查询' ? '模糊' : '精确';
        options.classList.add('hidden');
      }
    }
    
    // 绑定仓储费客户代码下拉框事件
    function bindStorageCustomerCodeEvents() {
      const dropdown = document.getElementById('listStorageCustomerCodeDropdown');
      const options = document.getElementById('listStorageCustomerCodeOptions');
      if (dropdown && options) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          options.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (options) options.classList.add('hidden');
      });
    }
    
    // 绑定仓储订单号搜索类型下拉框事件
    function bindStorageOrderNoSearchTypeEvents() {
      const dropdown = document.getElementById('storageOrderNoSearchTypeDropdown');
      const options = document.getElementById('storageOrderNoSearchTypeOptions');
      if (dropdown && options) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          options.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (options) options.classList.add('hidden');
      });
    }
    
    // 更新充值客户代码文本
    function updateListRechargeCustomerCodeText() {
      const radio = document.querySelector('input[name="listRechargeCustomerCode"]:checked');
      const textEl = document.getElementById('listRechargeCustomerCodeText');
      if (radio && textEl) {
        textEl.textContent = radio.parentElement.querySelector('span').textContent;
        document.getElementById('listRechargeCustomerCodeOptions').classList.add('hidden');
      }
    }
    
    // 更新费用调整客户代码文本
    function updateListAdjustmentCustomerCodeText() {
      const radio = document.querySelector('input[name="listAdjustmentCustomerCode"]:checked');
      const textEl = document.getElementById('listAdjustmentCustomerCodeText');
      if (radio && textEl) {
        textEl.textContent = radio.parentElement.querySelector('span').textContent;
        document.getElementById('listAdjustmentCustomerCodeOptions').classList.add('hidden');
      }
    }
    
    // 绑定充值客户代码下拉框事件
    function bindRechargeCustomerCodeEvents() {
      const dropdown = document.getElementById('listRechargeCustomerCodeDropdown');
      const options = document.getElementById('listRechargeCustomerCodeOptions');
      if (dropdown && options) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          options.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (options) options.classList.add('hidden');
      });
    }
    
    // 绑定费用调整客户代码下拉框事件
    function bindAdjustmentCustomerCodeEvents() {
      const dropdown = document.getElementById('listAdjustmentCustomerCodeDropdown');
      const options = document.getElementById('listAdjustmentCustomerCodeOptions');
      if (dropdown && options) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          options.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (options) options.classList.add('hidden');
      });
    }
    
    // 绑定充值流水号搜索类型下拉框事件
    function bindRechargeSerialNoSearchTypeEvents() {
      const dropdown = document.getElementById('rechargeSerialNoSearchTypeDropdown');
      const options = document.getElementById('rechargeSerialNoSearchTypeOptions');
      if (dropdown && options) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          options.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (options) options.classList.add('hidden');
      });
    }
    
    // 绑定费用调整订单号搜索类型下拉框事件
    function bindAdjustmentOrderNoSearchTypeEvents() {
      const dropdown = document.getElementById('adjustmentOrderNoSearchTypeDropdown');
      const options = document.getElementById('adjustmentOrderNoSearchTypeOptions');
      if (dropdown && options) {
        dropdown.addEventListener('click', function(e) {
          e.stopPropagation();
          options.classList.toggle('hidden');
        });
      }
      
      // 点击其他区域关闭下拉框
      document.addEventListener('click', function() {
        if (options) options.classList.add('hidden');
      });
    }
    
    // 初始化绑定事件
    document.addEventListener('DOMContentLoaded', function() {
      // TOB Template 初始化
      bindListDropdownEvents();
      bindWorkOrderSearchTypeEvents();
      bindSearchTypeEvents();
      bindStorageCustomerCodeEvents();
      bindStorageOrderNoSearchTypeEvents();
      bindRechargeCustomerCodeEvents();
      bindAdjustmentCustomerCodeEvents();
      bindRechargeSerialNoSearchTypeEvents();
      bindAdjustmentOrderNoSearchTypeEvents();
      
      // 初始化 Mermaid（如果存在）
      if (window.mermaid) {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          logLevel: 3
        });
      }
    });
    
    // 绑定函数到window对象
    window.updateListCompensationCustomerCodeText = updateListCompensationCustomerCodeText;
    window.updateWorkOrderSearchType = updateWorkOrderSearchType;
    window.updateSearchType = updateSearchType;
    window.updateListStorageCustomerCodeText = updateListStorageCustomerCodeText;
    window.updateStorageOrderNoSearchType = updateStorageOrderNoSearchType;
    window.updateListRechargeCustomerCodeText = updateListRechargeCustomerCodeText;
    window.updateListAdjustmentCustomerCodeText = updateListAdjustmentCustomerCodeText;
    
    // ==================== TOB Template 核心交互函数 ====================
    
    // 主标签切换
    function switchMainTab(tab) {
      document.querySelectorAll('.main-content').forEach(function(content) {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      document.querySelectorAll('.tab').forEach(function(t) {
        t.classList.remove('active');
      });
      const targetContent = document.getElementById('main-' + tab);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
      }
      const targetTab = document.getElementById('tab-' + tab);
      if (targetTab) {
        targetTab.classList.add('active');
      }
      if (tab === 'prd' && !prdLoaded) {
        loadPRD();
      } else if (tab === 'testcases' && !testCasesLoaded) {
        loadTestCases();
      }
    }
    
    // PRD 和测试用例加载状态
    let prdLoaded = false;
    let testCasesLoaded = false;
    
    // 配置marked库以支持Mermaid
    if (typeof marked !== 'undefined') {
      // 添加Mermaid代码块支持
      marked.use({
        extensions: [
          {
            name: 'mermaid',
            level: 'block',
            start(src) {
              return src.match(/^```mermaid\n/)?.index;
            },
            tokenizer(src, tokens) {
              const match = src.match(/^```mermaid\n([\s\S]*?)```/);
              if (match) {
                return {
                  type: 'mermaid',
                  raw: match[0],
                  code: match[1].trim()
                };
              }
            },
            renderer(token) {
              return `<div class="mermaid">${token.code}</div>`;
            }
          }
        ]
      });
    }

    // 加载PRD文档
    function loadPRD() {
      if (prdLoaded) return;
      const prdContentDiv = document.getElementById('prd-content');
      if (typeof marked === 'undefined') {
        prdContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-red-500">Marked库未加载，请确保已引入 marked.js</p></div>';
        return;
      }
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'prd.md', true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const markdown = xhr.responseText;
            const html = marked.parse(markdown);
            prdContentDiv.innerHTML = html;
            generateTOC();
            if (window.mermaid) {
              setTimeout(function() {
                // 使用mermaid.run()替代已废弃的mermaid.init()
                mermaid.run();
              }, 100);
            }
            prdLoaded = true;
          } else {
            prdContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-gray-500">PRD文档不存在，请创建 prd.md 文件</p></div>';
          }
        }
      };
      xhr.send();
    }
    
    // 加载测试用例文档
    function loadTestCases() {
      if (testCasesLoaded) return;
      const testCasesContentDiv = document.getElementById('testcases-content');
      if (typeof marked === 'undefined') {
        testCasesContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-red-500">Marked库未加载，请确保已引入 marked.js</p></div>';
        return;
      }
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'test-cases.md', true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const markdown = xhr.responseText;
            const html = marked.parse(markdown);
            testCasesContentDiv.innerHTML = html;
            generateTestCasesTOC();
            if (window.mermaid) {
              setTimeout(function() {
                // 使用mermaid.run()替代已废弃的mermaid.init()
                mermaid.run();
              }, 100);
            }
            testCasesLoaded = true;
          } else {
            testCasesContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-gray-500">测试用例文档不存在，请创建 test-cases.md 文件</p></div>';
          }
        }
      };
      xhr.send();
    }
    
    // 生成PRD目录导航
    function generateTOC() {
      const tocNav = document.getElementById('toc-nav');
      const headings = document.querySelectorAll('#prd-content h1, #prd-content h2, #prd-content h3');
      let tocHTML = '';
      headings.forEach(function(heading, index) {
        const id = 'heading-' + index;
        heading.id = id;
        const level = parseInt(heading.tagName.substring(1));
        const className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
      });
      tocNav.innerHTML = tocHTML;
    }
    
    // 生成测试用例目录导航
    function generateTestCasesTOC() {
      const tocNav = document.getElementById('testcases-toc-nav');
      const headings = document.querySelectorAll('#testcases-content h1, #testcases-content h2, #testcases-content h3');
      let tocHTML = '';
      headings.forEach(function(heading, index) {
        const id = 'testcases-heading-' + index;
        heading.id = id;
        const level = parseInt(heading.tagName.substring(1));
        const className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
      });
      tocNav.innerHTML = tocHTML;
    }
    
    // Mermaid图表放大预览
    function openMermaidModal(container) {
      const mermaidDiv = container.querySelector('.mermaid');
      if (!mermaidDiv) return;
      const modal = document.getElementById('mermaidModal');
      const modalContent = document.getElementById('mermaidModalContent');
      modalContent.innerHTML = mermaidDiv.innerHTML;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (window.mermaid) {
        mermaid.init(undefined, modalContent.querySelectorAll('.mermaid'));
      }
    }
    
    function closeMermaidModal(event) {
      if (event && event.target !== event.currentTarget && !event.target.closest('.mermaid-modal-close')) {
        return;
      }
      const modal = document.getElementById('mermaidModal');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMermaidModal();
      }
    });

    // 逻辑说明展开/折叠功能
    function toggleLogicDescription() {
      const content = document.getElementById('logicDescriptionContent');
      const toggleIcon = document.getElementById('logicDescriptionToggleIcon');
      
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        toggleIcon.classList.add('rotate-180');
      } else {
        content.classList.add('hidden');
        toggleIcon.classList.remove('rotate-180');
      }
    }

    // 绑定逻辑说明函数到window对象
    window.toggleLogicDescription = toggleLogicDescription;

