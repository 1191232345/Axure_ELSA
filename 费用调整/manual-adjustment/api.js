/**
 * 手工调价模块 - API请求封装
 */

const ManualAdjustAPI = {
  async loadFeeData() {
    return new Promise((resolve, reject) => {
      try {
        const savedData = CommonAPI.LocalStorageAPI.get(ManualAdjustConstants.STORAGE_KEY);
        if (savedData) {
          resolve({ success: true, data: savedData });
        } else {
          const defaultData = ManualAdjustUtils.getDefaultFeeData();
          this.saveFeeData(defaultData);
          resolve({ success: true, data: defaultData });
        }
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  },
  
  async saveFeeData(data) {
    return new Promise((resolve, reject) => {
      try {
        CommonAPI.LocalStorageAPI.set(ManualAdjustConstants.STORAGE_KEY, data);
        resolve({ success: true });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  },
  
  async addFeeItem(feeItem) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.loadFeeData();
        if (!result.success) {
          reject(result);
          return;
        }
        
        const data = result.data;
        const newItem = {
          ...feeItem,
          id: CommonUtils.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.push(newItem);
        await this.saveFeeData(data);
        
        resolve({ success: true, data: newItem });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  },
  
  async updateFeeItem(id, updates) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.loadFeeData();
        if (!result.success) {
          reject(result);
          return;
        }
        
        const data = result.data;
        const index = data.findIndex(item => item.id === id);
        
        if (index === -1) {
          reject({ success: false, error: '费用项不存在' });
          return;
        }
        
        data[index] = {
          ...data[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        await this.saveFeeData(data);
        resolve({ success: true, data: data[index] });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  },
  
  async deleteFeeItem(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.loadFeeData();
        if (!result.success) {
          reject(result);
          return;
        }
        
        const data = result.data;
        const index = data.findIndex(item => item.id === id);
        
        if (index === -1) {
          reject({ success: false, error: '费用项不存在' });
          return;
        }
        
        data.splice(index, 1);
        await this.saveFeeData(data);
        
        resolve({ success: true });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  },
  
  async uploadFile(file) {
    return new Promise((resolve, reject) => {
      try {
        if (!CommonUtils.validateFileType(file.name)) {
          reject({ success: false, error: '文件类型不支持' });
          return;
        }
        
        if (!CommonUtils.validateFileSize(file.size)) {
          reject({ success: false, error: '文件大小超过限制' });
          return;
        }
        
        setTimeout(() => {
          resolve({ success: true, message: '文件上传成功' });
        }, 1000);
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  },
  
  async clearAllData() {
    return new Promise((resolve, reject) => {
      try {
        CommonAPI.LocalStorageAPI.remove(ManualAdjustConstants.STORAGE_KEY);
        resolve({ success: true });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ManualAdjustAPI;
}