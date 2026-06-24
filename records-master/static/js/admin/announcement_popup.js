/** 公告弹窗模块 - 参考Axure原型样式 */
window.AnnouncementPopup = (function () {
  var STORAGE_KEY = 'announcement_hidden_until';
  var initialized = false;
  var announcements = [];

  function init() {
    if (initialized) return;
    initialized = true;
    
    bindEvents();
    checkAndShowAnnouncement();
  }

  function bindEvents() {
    var showBtn = document.getElementById('showAnnouncementBtn');
    var confirmBtn = document.getElementById('confirmAnnouncement');

    if (showBtn) {
      showBtn.addEventListener('click', function () {
        localStorage.removeItem(STORAGE_KEY);
        loadAndShow();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        handleConfirm();
      });
    }
    
    // 键盘事件
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideAnnouncementPopup();
      }
    });
    
    // 点击遮罩关闭
    var overlay = document.querySelector('.announcement-overlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          hideAnnouncementPopup();
        }
      });
    }
  }

  function checkAndShowAnnouncement() {
    var hiddenUntil = localStorage.getItem(STORAGE_KEY);
    if (hiddenUntil) {
      try {
        var hiddenDate = new Date(hiddenUntil);
        
        if (hiddenDate > new Date()) {
          return; 
        } else {
          localStorage.removeItem(STORAGE_KEY); 
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    loadAndShow();
  }
  
  function loadAndShow() {
    loadAnnouncements().then(function (data) {
      if (data && data.length > 0) {
        announcements = data;
        renderAnnouncements();
        setTimeout(function() {
          showAnnouncementPopup();
        }, 300);
      }
    }).catch(function (err) {
      console.error('[公告] 加载失败:', err);
    });
  }

  function loadAnnouncements() {
    return fetch('/api/announcements/enabled')
      .then(function (response) {
        if (!response.ok) throw new Error('网络错误');
        return response.json();
      })
      .then(function (data) {
        if (!data || data.length === 0) {
          console.log('[公告] 暂无公告');
          return null;
        }
        return data;
      });
  }

  function renderAnnouncements() {
    var container = document.getElementById('announcementContent');
    if (!container || announcements.length === 0) return;
    
    var html = '';
    
    announcements.forEach(function(item, index) {
      var dateStr = formatDate(item.created_at);
      var parsedContent = parseContent(item.content);
      
      // 版本区块
      html += '<div class="mb-5' + (index < announcements.length - 1 ? ' pb-5 border-b border-gray-100' : '') + '">';
      
      // 标题行
      html += '<div class="flex items-center justify-between mb-3.5">';
      html += '<div class="flex items-center gap-2.5">';
      html += '<span class="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded">' + escapeHtml(item.title.split(' ')[0]) + '</span>';
      html += '<h2 class="text-xs font-semibold text-gray-800">' + escapeHtml(item.title.replace(/^[vV][\d.]+\s*/, '')) + '</h2>';
      html += '</div>';
      html += '<span class="text-xs text-gray-400 tabular-nums">' + dateStr + '</span>';
      html += '</div>';
      
      // 变更表格
      if (parsedContent.rows && parsedContent.rows.length > 0) {
        html += '<div class="rounded-lg border border-gray-200 overflow-hidden bg-white">';
        html += '<table class="w-full text-xs">';
        html += '<thead><tr class="bg-gray-50/80 border-b border-gray-100">';
        html += '<th class="text-left py-2 px-3 font-medium text-gray-500 w-[18%]">变更项</th>';
        html += '<th class="text-left py-2 px-3 font-medium text-gray-500 w-[37%]">描述</th>';
        html += '<th class="text-left py-2 px-3 font-medium text-gray-400 w-[22%]">变更前</th>';
        html += '<th class="text-left py-2 px-3 font-medium text-blue-600 w-[23%]">变更后</th>';
        html += '</tr></thead><tbody>';
        
        parsedContent.rows.forEach(function(row, rowIndex) {
          html += '<tr class="' + (rowIndex % 2 === 1 ? 'bg-gray-50/40' : '') + ' hover:bg-blue-50/30 transition-colors" style="border-bottom: 1px solid #f9fafb;">';
          
          // 变更项
          html += '<td class="py-2 px-3 align-top"><span class="text-gray-700">' + escapeHtml(row.item) + '</span></td>';
          
          // 描述
          html += '<td class="py-2 px-3 align-top text-gray-600 leading-relaxed">' + escapeHtml(row.desc) + '</td>';
          
          // 变更前
          if (row.before && row.before !== '-' && row.before !== '无') {
            html += '<td class="py-2 px-3 align-top"><span class="text-gray-400 line-through decoration-gray-300">' + escapeHtml(row.before) + '</span></td>';
          } else {
            html += '<td class="py-2 px-3 align-top text-gray-300 italic">' + (row.before || '-') + '</td>';
          }
          
          // 变更后
          if (row.after && row.after !== '-' && row.after !== '无') {
            html += '<td class="py-2 px-3 align-top"><span class="inline-flex items-center gap-1 text-blue-600 font-medium">' + escapeHtml(row.after) + '</span></td>';
          } else {
            html += '<td class="py-2 px-3 align-top text-gray-400">' + (row.after || '-') + '</td>';
          }
          
          html += '</tr>';
        });
        html += '</tbody></table></div>';
      } else {
        // 纯文本
        html += '<div class="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50/50 rounded-lg p-4 border border-gray-100">' + formatText(item.content) + '</div>';
      }
      html += '</div>';
    });
    
    container.innerHTML = html;
  }
  
  /**
   * 解析公告内容为结构化数据
   * 支持格式：
   * • 项目名：描述 | 变更前内容 | 变更后内容
   * - 项目名：描述 | 变更前 | 变更后
   * 【标题】作为分组标题
   */
  function parseContent(content) {
    if (!content) return { rows: [] };
    
    var lines = content.split('\n').filter(function(line) { return line.trim(); });
    var rows = [];
    
    lines.forEach(function(line) {
      // 跳过标题行（【】包裹）
      if (/^【.+】$/.test(line.trim())) {
        return;
      }
      
      // 尝试解析列表项格式
      var match = line.match(/^[•\-]\s*(.+?)[:：]\s*(.+?)(?:\s*\|\s*(.+?))?(?:\s*\|\s*(.+?))?$/);
      
      if (match) {
        rows.push({
          item: match[1].trim(),
          desc: match[2].trim(),
          before: match[3] ? match[3].trim() : '',
          after: match[4] ? match[4].trim() : ''
        });
      } else if (/^[•\-]/.test(line)) {
        // 普通列表项，放入描述列
        var text = line.replace(/^[•\-]\s*/, '').trim();
        rows.push({
          item: '-',
          desc: text,
          before: '',
          after: ''
        });
      }
    });
    
    return { rows: rows };
  }
  
  function formatText(content) {
    if (!content) return '';
    content = escapeHtml(content);
    // 处理列表项
    content = content.replace(/^[•\-]\s(.+)$/gm, '<span class="inline-block w-2 h-2 bg-neutral-400 rounded-full mr-3 align-middle"></span>$1<br>');
    // 处理标题
    content = content.replace(/^【(.+?)】$/gm, '<strong class="block text-lg font-semibold text-neutral-800 my-4 pb-2 border-b border-neutral-200">$1</strong>');
    return content;
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function formatDate(dateString) {
    try {
      var date = new Date(dateString);
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    } catch (e) {
      return dateString;
    }
  }

  function showAnnouncementPopup() {
    var popup = document.getElementById('announcementPopup');
    var modal = popup ? popup.querySelector('.announcement-modal') : null;
    
    if (popup) {
      popup.classList.remove('hidden');
      popup.classList.add('flex');
      
      // 触发入场动画
      setTimeout(function() {
        if (modal) {
          modal.classList.remove('scale-95', 'opacity-0');
          modal.classList.add('scale-100', 'opacity-100');
        }
      }, 10);
      
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    }
  }

  function hideAnnouncementPopup() {
    var popup = document.getElementById('announcementPopup');
    var modal = popup ? popup.querySelector('.announcement-modal') : null;
    
    if (modal) {
      modal.classList.add('scale-95', 'opacity-0');
      modal.classList.remove('scale-100', 'opacity-100');
    }
    
    setTimeout(function() {
      if (popup) {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
      }
      document.body.style.overflow = '';
    }, 200);
  }

  function handleConfirm() {
    var dontShowAgain = document.getElementById('dontShowAgain');
    if (dontShowAgain && dontShowAgain.checked) {
      var hideUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(STORAGE_KEY, hideUntil.toISOString());
    }
    hideAnnouncementPopup();
  }

  function addStyles() {
    if (document.getElementById('announcement-styles')) return;
    var style = document.createElement('style');
    style.id = 'announcement-styles';
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
    `;
    document.head.appendChild(style);
  }

  addStyles();

  return {
    init: init,
    show: function() { loadAndShow(); },
    hide: function() { hideAnnouncementPopup(); }
  };
})();