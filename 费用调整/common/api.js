/**
 * 费用调整公共模块 - API请求封装
 */

const CommonAPI = {
  async request(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, finalOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  async loadData(dataFile) {
    try {
      const response = await fetch(dataFile);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Load data failed:', error);
      return null;
    }
  },
  
  async uploadFile(file, uploadUrl) {
    if (!CommonUtils.validateFileType(file.name)) {
      throw new Error('文件类型不支持');
    }
    
    if (!CommonUtils.validateFileSize(file.size)) {
      throw new Error('文件大小超过限制');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },
  
  LocalStorageAPI: {
    get(key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('LocalStorage get failed:', error);
        return null;
      }
    },
    
    set(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('LocalStorage set failed:', error);
        return false;
      }
    },
    
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('LocalStorage remove failed:', error);
        return false;
      }
    },
    
    clear() {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('LocalStorage clear failed:', error);
        return false;
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommonAPI;
}