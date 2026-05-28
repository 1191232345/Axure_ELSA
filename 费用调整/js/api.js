/**
 * 费用调整主页面 - API请求封装
 */

const MainAPI = {
  async loadOrderData(tabType) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = MainUtils.generateMockData(15, tabType);
        resolve({ success: true, data: mockData });
      }, 500);
    });
  },
  
  async searchOrders(searchParams, tabType) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = MainUtils.generateMockData(50, tabType);
        const filteredData = MainUtils.filterData(mockData, searchParams);
        resolve({ success: true, data: filteredData });
      }, 500);
    });
  },
  
  async loadRecalculateDetailData(tabType) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = MainUtils.generateMockRecalculateData(20, tabType);
        resolve({ success: true, data: mockData });
      }, 800);
    });
  },
  
  async submitBatchRecalculate(selectedCount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: `批量重计任务已提交，处理数量：${selectedCount}` 
        });
      }, 1500);
    });
  },
  
  async uploadRecalculateFile(file) {
    if (!CommonUtils.validateFileType(file.name)) {
      throw new Error('文件类型不支持');
    }
    
    if (!CommonUtils.validateFileSize(file.size)) {
      throw new Error('文件大小超过限制');
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: '文件上传成功' });
      }, 1000);
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MainAPI;
}