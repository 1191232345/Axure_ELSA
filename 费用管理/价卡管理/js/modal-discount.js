// 折扣编辑弹窗逻辑
const DiscountModal = {
  // 打开折扣编辑弹窗
  open(tabName, index, dataRef) {
    const modal = document.getElementById('discountModal');
    if (modal) {
      modal.classList.add('active');
      
      // 存储当前编辑的tab和index
      document.getElementById('discountEditTab').value = tabName;
      document.getElementById('discountEditIndex').value = index;
      
      // 加载当前折扣设置
      const item = dataRef[tabName][index];
      document.getElementById('discountType').value = item.discountType || 'none';
      
      if (item.discountType && item.discountType !== 'none') {
        document.getElementById('discountValueGroup').classList.remove('hidden');
        document.getElementById('discountValue').value = item.discountValue || 0;
        this.updatePreview();
      } else {
        document.getElementById('discountValueGroup').classList.add('hidden');
        document.getElementById('discountPreview').classList.add('hidden');
      }
    }
  },

  // 关闭折扣编辑弹窗
  close() {
    const modal = document.getElementById('discountModal');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // 更新折扣预览
  updatePreview() {
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    const previewContent = document.getElementById('discountPreviewContent');
    
    if (!previewContent) return;
    
    let previewText = '';
    if (discountType === 'percentage') {
      previewText = `将享受 ${discountValue}% 的折扣优惠`;
    } else if (discountType === 'fixed') {
      if (discountValue < 0) {
        previewText = `单价将减少 ${Math.abs(discountValue)}$`;
      } else {
        previewText = `单价将增加 ${discountValue}$`;
      }
    } else if (discountType === 'fixed_price') {
      previewText = `最终价格将固定为 ${discountValue}$`;
    }
    
    previewContent.textContent = previewText;
  },

  // 保存折扣设置
  save(dataRef, renderCallback) {
    const tabName = document.getElementById('discountEditTab').value;
    const index = parseInt(document.getElementById('discountEditIndex').value);
    
    const item = dataRef[tabName][index];
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    
    item.discountType = discountType;
    item.discountValue = discountType === 'none' ? 0 : discountValue;
    
    this.close();
    if (renderCallback) renderCallback();
  },

  // 初始化事件监听
  init() {
    // 折扣类型变化事件
    const discountTypeSelect = document.getElementById('discountType');
    if (discountTypeSelect) {
      discountTypeSelect.addEventListener('change', () => {
        const discountType = discountTypeSelect.value;
        const valueGroup = document.getElementById('discountValueGroup');
        const preview = document.getElementById('discountPreview');
        
        if (discountType === 'none') {
          valueGroup.classList.add('hidden');
          preview.classList.add('hidden');
        } else {
          valueGroup.classList.remove('hidden');
          preview.classList.remove('hidden');
          this.updatePreview();
        }
      });
    }

    // 折扣值变化事件
    const discountValueInput = document.getElementById('discountValue');
    if (discountValueInput) {
      discountValueInput.addEventListener('input', () => {
        this.updatePreview();
      });
    }

    // 点击弹窗外部关闭
    const modal = document.getElementById('discountModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    }
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  DiscountModal.init();
});

// 格式化折扣显示
function formatDiscountDisplay(item) {
  if (!item.discountType || item.discountType === 'none') {
    return '无折扣';
  }

  if (item.discountType === 'percentage') {
    return `${item.discountValue}%折扣`;
  } else if (item.discountType === 'fixed') {
    return item.discountValue < 0 ? 
      `减少${Math.abs(item.discountValue)}$` : 
      `增加${item.discountValue}$`;
  } else if (item.discountType === 'fixed_price') {
    return `一口价${item.discountValue}$`;
  }

  return '无折扣';
}