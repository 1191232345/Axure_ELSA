import { store } from './state/store.js';
import { renderTable, renderFilters } from './renderer/tableRenderer.js';
import { bindEvents } from './events/handlers.js';
import { getCurrentMonth } from './utils/helpers.js';

class CostDetailApp {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    await this.initMermaid();
    this.initStore();
    this.initFilters();
    this.bindEvents();
    this.loadData();
    
    this.initialized = true;
  }

  async initMermaid() {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        logLevel: 3
      });
    }
  }

  initStore() {
    store.subscribe((state) => {
      renderTable();
    });
  }

  initFilters() {
    renderFilters();
    
    const billMonthInput = document.getElementById('filterBillMonth');
    if (billMonthInput) {
      billMonthInput.value = getCurrentMonth();
    }
  }

  bindEvents() {
    bindEvents();
    
    document.getElementById('feeModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'feeModal') {
        import('./events/handlers.js').then(module => {
          module.handleCloseFeeModal();
        });
      }
    });
    
    document.getElementById('batchFeeModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'batchFeeModal') {
        import('./events/handlers.js').then(module => {
          module.handleCloseBatchFeeModal();
        });
      }
    });
    
    document.getElementById('detailModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'detailModal') {
        import('./renderer/modalRenderer.js').then(module => {
          module.hideDetailModal();
        });
      }
    });
  }

  async loadData() {
    const mockData = this.generateMockData();
    store.setData(mockData);
    renderTable();
  }

  generateMockData() {
    const data = [];
    const billTypes = ['出库+快递(YC)', '出库+快递(TMS)', '仓储费', '快递赔付'];
    const statuses = ['待获取', '处理中', '已完成', '失败'];
    const customerCodes = ['ZJJS', 'ZJHW', 'ZJWL'];
    const customerServices = ['李四', '钱七', '吴十'];
    
    for (let i = 1; i <= 50; i++) {
      data.push({
        id: `bill-${i}`,
        billNo: `BILL${String(i).padStart(6, '0')}`,
        billMonth: getCurrentMonth(),
        voyagePeriod: getCurrentMonth(),
        customerCode: customerCodes[Math.floor(Math.random() * customerCodes.length)],
        sales: '张三',
        customerService: customerServices[Math.floor(Math.random() * customerServices.length)],
        billType: billTypes[Math.floor(Math.random() * billTypes.length)],
        amount: Math.random() * 10000,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        operator: '管理员',
        operateTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        remark: ''
      });
    }
    
    return data;
  }
}

const app = new CostDetailApp();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

export default app;