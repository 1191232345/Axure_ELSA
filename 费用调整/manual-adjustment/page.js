/**
 * 手工调价模块 - 页面协调器
 */

const ManualAdjustPage = {
  feeData: [],
  currentEditId: null,
  currentTabType: CommonConstants.TAB_TYPES.OUTBOUND,
  
  init() {
    this.loadInitialData();
    this.bindEvents();
    this.bindTabButtons();
  },
  
  async loadInitialData() {
    try {
      const result = await ManualAdjustAPI.loadFeeData();
      if (result.success) {
        this.feeData = result.data;
        ManualAdjustRenderer.renderFeeTable(this.feeData);
        ManualAdjustRenderer.updateDimensionsDisplay(this.feeData);
      }
    } catch (error) {
      ToastManager.show('数据加载失败：' + error.error, 'error');
    }
  },
  
  bindEvents() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.addEventListener('click', CommonUtils.throttle((e) => {
      this.handleClickEvent(e);
    }, 100));
    
    document.addEventListener('click', () => {
      const adjustDropdown = document.getElementById('adjustDropdown');
      if (adjustDropdown) adjustDropdown.classList.add('hidden');
    });
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }
    
    const uploadModal = document.getElementById('uploadModal');
    if (uploadModal) {
      uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) this.closeUploadModal();
      });
    }
  },
  
  handleClickEvent(e) {
    if (e.target.closest('#addFeeBtn')) {
      this.showNewRow();
    } else if (e.target.closest('#adjustFeeBtn')) {
      e.stopPropagation();
      const adjustDropdown = document.getElementById('adjustDropdown');
      if (adjustDropdown) adjustDropdown.classList.toggle('hidden');
    } else if (e.target.closest('#adjustDropdown a')) {
      e.preventDefault();
      e.stopPropagation();
      const adjustDropdown = document.getElementById('adjustDropdown');
      if (adjustDropdown) adjustDropdown.classList.add('hidden');
      this.openUploadModal();
    } else if (e.target.closest('#closeUploadModal') || e.target.closest('#cancelUploadBtn')) {
      this.closeUploadModal();
    } else if (e.target.closest('#selectFileBtn')) {
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.click();
    } else if (e.target.closest('#removeFileBtn')) {
      this.removeSelectedFile();
    } else if (e.target.closest('#startUploadBtn')) {
      this.startUpload();
    } else if (e.target.closest('#searchBtn')) {
      this.performSearch();
    } else if (e.target.closest('#saveFeeBtn')) {
      this.saveAllFeeData();
    }
  },
  
  bindTabButtons() {
    const outboundTabBtn = document.getElementById('outboundTabBtn');
    const inboundTabBtn = document.getElementById('inboundTabBtn');
    
    if (outboundTabBtn && inboundTabBtn) {
      outboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(outboundTabBtn, [inboundTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.OUTBOUND;
        ManualAdjustRenderer.updatePageContent(this.currentTabType);
        this.loadInitialData();
      });
      
      inboundTabBtn.addEventListener('click', () => {
        CommonRenderer.setActiveTab(inboundTabBtn, [outboundTabBtn]);
        this.currentTabType = CommonConstants.TAB_TYPES.INBOUND;
        ManualAdjustRenderer.updatePageContent(this.currentTabType);
        this.loadInitialData();
      });
    }
  },
  
  showNewRow() {
    ManualAdjustRenderer.renderNewRow();
  },
  
  async saveNewRow() {
    const name = document.getElementById('newFeeName')?.value;
    const unit = document.getElementById('newFeeUnit')?.value;
    const amount = document.getElementById('newFeeAmount')?.value;
    const newAmount = document.getElementById('newFeeNewAmount')?.value;
    const currency = document.getElementById('newFeeCurrency')?.value;
    const remark = document.getElementById('newFeeRemark')?.value;
    
    const feeItem = {
      name,
      unit,
      amount: parseFloat(amount),
      newAmount: newAmount ? parseFloat(newAmount) : null,
      currency,
      remark
    };
    
    const validation = ManualAdjustUtils.validateFeeData(feeItem);
    if (!validation.isValid) {
      ToastManager.show(validation.errors[0], 'error');
      return;
    }
    
    try {
      const result = await ManualAdjustAPI.addFeeItem(feeItem);
      if (result.success) {
        this.feeData.push(result.data);
        ManualAdjustRenderer.renderFeeTable(this.feeData);
        ManualAdjustRenderer.updateDimensionsDisplay(this.feeData);
        ToastManager.show('费用项添加成功', 'success');
      }
    } catch (error) {
      ToastManager.show('添加失败：' + error.error, 'error');
    }
  },
  
  cancelNewRow() {
    const newRow = document.getElementById('newRow');
    if (newRow) newRow.remove();
  },
  
  async editFee(id) {
    this.currentEditId = id;
    const fee = this.feeData.find(item => item.id === id);
    if (fee) {
      ManualAdjustRenderer.renderEditRow(fee);
    }
  },
  
  async saveEditRow(id) {
    const name = document.getElementById(`editFeeName_${id}`)?.value;
    const unit = document.getElementById(`editFeeUnit_${id}`)?.value;
    const amount = document.getElementById(`editFeeAmount_${id}`)?.value;
    const newAmount = document.getElementById(`editFeeNewAmount_${id}`)?.value;
    const currency = document.getElementById(`editFeeCurrency_${id}`)?.value;
    const remark = document.getElementById(`editFeeRemark_${id}`)?.value;
    
    const updates = {
      name,
      unit,
      amount: parseFloat(amount),
      newAmount: newAmount ? parseFloat(newAmount) : null,
      currency,
      remark
    };
    
    const validation = ManualAdjustUtils.validateFeeData(updates);
    if (!validation.isValid) {
      ToastManager.show(validation.errors[0], 'error');
      return;
    }
    
    try {
      const result = await ManualAdjustAPI.updateFeeItem(id, updates);
      if (result.success) {
        const index = this.feeData.findIndex(item => item.id === id);
        if (index !== -1) {
          this.feeData[index] = result.data;
        }
        ManualAdjustRenderer.renderFeeTable(this.feeData);
        ManualAdjustRenderer.updateDimensionsDisplay(this.feeData);
        ToastManager.show('费用项更新成功', 'success');
        this.currentEditId = null;
      }
    } catch (error) {
      ToastManager.show('更新失败：' + error.error, 'error');
    }
  },
  
  cancelEditRow(id) {
    const fee = this.feeData.find(item => item.id === id);
    if (fee) {
      ManualAdjustRenderer.renderFeeTable(this.feeData);
    }
    this.currentEditId = null;
  },
  
  async deleteFee(id) {
    if (!confirm('确定要删除这个费用项吗？')) return;
    
    try {
      const result = await ManualAdjustAPI.deleteFeeItem(id);
      if (result.success) {
        this.feeData = this.feeData.filter(item => item.id !== id);
        ManualAdjustRenderer.renderFeeTable(this.feeData);
        ManualAdjustRenderer.updateDimensionsDisplay(this.feeData);
        ToastManager.show('费用项删除成功', 'success');
      }
    } catch (error) {
      ToastManager.show('删除失败：' + error.error, 'error');
    }
  },
  
  async performSearch() {
    const feeNumber = document.getElementById('feeNumber')?.value;
    
    if (!feeNumber || feeNumber.trim() === '') {
      ToastManager.show('请输入搜索条件', 'warning');
      return;
    }
    
    ToastManager.show('搜索功能暂未实现', 'info');
  },
  
  async saveAllFeeData() {
    try {
      const result = await ManualAdjustAPI.saveFeeData(this.feeData);
      if (result.success) {
        ToastManager.show('数据保存成功', 'success');
      }
    } catch (error) {
      ToastManager.show('保存失败：' + error.error, 'error');
    }
  },
  
  openUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },
  
  closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.resetUploadForm();
    }
  },
  
  resetUploadForm() {
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = document.getElementById('selectedFiles');
    const startUploadBtn = document.getElementById('startUploadBtn');
    
    if (fileInput) fileInput.value = '';
    if (selectedFiles) selectedFiles.classList.add('hidden');
    if (startUploadBtn) {
      startUploadBtn.disabled = true;
      startUploadBtn.className = 'erp-btn bg-gray-300 text-gray-500 cursor-not-allowed text-sm';
    }
  },
  
  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!CommonUtils.validateFileType(file.name)) {
      ToastManager.show('文件类型不支持，仅支持 Excel 和 CSV 格式', 'error');
      return;
    }
    
    if (!CommonUtils.validateFileSize(file.size)) {
      ToastManager.show('文件大小超过 10MB 限制', 'error');
      return;
    }
    
    const selectedFiles = document.getElementById('selectedFiles');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const startUploadBtn = document.getElementById('startUploadBtn');
    
    if (selectedFiles) selectedFiles.classList.remove('hidden');
    if (fileName) fileName.textContent = file.name;
    if (fileSize) fileSize.textContent = CommonUtils.formatFileSize(file.size);
    if (startUploadBtn) {
      startUploadBtn.disabled = false;
      startUploadBtn.className = 'erp-btn erp-btn-primary text-sm';
    }
  },
  
  removeSelectedFile() {
    this.resetUploadForm();
  },
  
  async startUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput?.files[0];
    
    if (!file) {
      ToastManager.show('请先选择文件', 'warning');
      return;
    }
    
    try {
      ToastManager.show('正在上传文件...', 'info');
      const result = await ManualAdjustAPI.uploadFile(file);
      if (result.success) {
        ToastManager.show(result.message, 'success');
        this.closeUploadModal();
      }
    } catch (error) {
      ToastManager.show('上传失败：' + error.error, 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ManualAdjustPage.init();
});

function saveNewRow() {
  ManualAdjustPage.saveNewRow();
}

function cancelNewRow() {
  ManualAdjustPage.cancelNewRow();
}

function editFee(id) {
  ManualAdjustPage.editFee(id);
}

function saveEditRow(id) {
  ManualAdjustPage.saveEditRow(id);
}

function cancelEditRow(id) {
  ManualAdjustPage.cancelEditRow(id);
}

function deleteFee(id) {
  ManualAdjustPage.deleteFee(id);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ManualAdjustPage;
}