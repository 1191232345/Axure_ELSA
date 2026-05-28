/**
 * 费用调整公共模块 - 渲染器
 */

const CommonRenderer = {
  setActiveTab(activeBtn, inactiveBtns) {
    activeBtn.className = 'tab-btn tab-btn-active';
    inactiveBtns.forEach(btn => {
      btn.className = 'tab-btn tab-btn-inactive';
    });
  },
  
  createTableHTML(headers, data, options = {}) {
    if (!data || data.length === 0) {
      return `<tr class="border-t border-gray-100">
        <td colspan="${headers.length}" class="px-4 py-12 text-center text-gray-400">
          <i class="fa fa-inbox text-4xl mb-2 block"></i>
          <p>${options.emptyMessage || '暂无数据'}</p>
        </td>
      </tr>`;
    }
    
    const rowsHTML = data.map(row => {
      const cellsHTML = headers.map(header => {
        const value = row[header.key];
        const formattedValue = this.formatCellValue(value, header.key, row);
        return `<td class="px-4 py-3 text-sm">${formattedValue}</td>`;
      }).join('');
      
      return `<tr class="border-t border-gray-100 table-hover-row">${cellsHTML}</tr>`;
    }).join('');
    
    return rowsHTML;
  },
  
  formatCellValue(value, key, row) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    
    switch (key) {
      case 'amount':
      case 'originalAmount':
      case 'newAmount':
        return CommonUtils.formatNumber(value);
      
      case 'operateTime':
      case 'orderTime':
      case 'createdAt':
      case 'updatedAt':
        return CommonUtils.formatDate(value);
      
      case 'status':
        return this.createStatusBadge(value);
      
      default:
        return CommonUtils.escapeHtml(value);
    }
  },
  
  createStatusBadge(status) {
    const statusMap = {
      success: { class: 'status-badge-success', text: '成功' },
      processing: { class: 'status-badge-warning', text: '处理中' },
      failed: { class: 'status-badge-error', text: '失败' }
    };
    
    const config = statusMap[status] || { class: 'status-badge-default', text: status };
    return `<span class="status-badge ${config.class}">${config.text}</span>`;
  },
  
  createSelectOptions(options, selectedValue = '') {
    return options.map(option => {
      const selected = option === selectedValue ? 'selected' : '';
      return `<option value="${CommonUtils.escapeHtml(option)}" ${selected}>${CommonUtils.escapeHtml(option)}</option>`;
    }).join('');
  },
  
  createButtonHTML(id, text, icon, className = 'erp-btn erp-btn-primary') {
    const iconHTML = icon ? `<i class="fa ${icon} mr-2"></i>` : '';
    return `<button id="${id}" class="${className}">${iconHTML}${text}</button>`;
  },
  
  createModalHTML(id, title, content, options = {}) {
    return `
      <div id="${id}" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-lg shadow-xl ${options.maxWidth || 'max-w-3xl'} w-full max-h-[90vh] overflow-auto relative">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              <i class="fa ${options.icon || 'fa-info-circle'} text-primary mr-2"></i>${title}
            </h3>
            <button class="modal-close text-gray-400 hover:text-gray-600 transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="px-4 py-3">${content}</div>
          ${options.footer ? `<div class="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">${options.footer}</div>` : ''}
        </div>
      </div>
    `;
  },
  
  createPaginationHTML(currentPage, totalPages, totalCount) {
    if (totalPages <= 1) return '';
    
    const prevDisabled = currentPage <= 1 ? 'disabled' : '';
    const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
    
    return `
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div class="text-sm text-gray-500">
          共 ${totalCount} 条记录，第 ${currentPage}/${totalPages} 页
        </div>
        <div class="flex gap-2">
          <button class="erp-btn erp-btn-secondary text-sm ${prevDisabled}" 
                  onclick="changePage(${currentPage - 1})" ${prevDisabled}>
            <i class="fa fa-chevron-left mr-1"></i>上一页
          </button>
          <button class="erp-btn erp-btn-secondary text-sm ${nextDisabled}" 
                  onclick="changePage(${currentPage + 1})" ${nextDisabled}>
            下一页<i class="fa fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    `;
  },
  
  createUploadAreaHTML(fileInputId, selectBtnId) {
    return `
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors duration-200">
        <div class="mb-3">
          <i class="fa fa-cloud-upload text-3xl text-gray-400"></i>
        </div>
        <p class="text-gray-600 mb-2 text-sm">拖拽文件到此处或点击选择文件</p>
        <p class="text-xs text-gray-500 mb-3">支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式，文件大小不超过 10MB</p>
        <input type="file" id="${fileInputId}" class="hidden" accept=".xlsx,.xls,.csv">
        <button id="${selectBtnId}" class="erp-btn erp-btn-primary text-sm">
          <i class="fa fa-folder-open mr-1.5"></i>选择文件
        </button>
      </div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommonRenderer;
}