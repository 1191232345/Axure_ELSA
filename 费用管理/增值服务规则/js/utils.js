/**
 * 工具函数模块
 */

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function switchMainTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.main-content').forEach(content => content.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.getElementById(`main-${tabName}`).classList.add('active');
}

function togglePrdLogic(moduleId) {
  const content = document.getElementById(`${moduleId}-logic-content`);
  const icon = document.getElementById(`${moduleId}-logic-icon`);

  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
    // 首次展开时初始化映射表交互
    if (typeof initMappingInteraction === 'function' && !content.dataset.initialized) {
      initMappingInteraction();
      content.dataset.initialized = 'true';
    }
  } else {
    content.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
}

function switchLogicTab(btn) {
  const group = btn.dataset.group;
  const tab = btn.dataset.tab;

  // 切换同组tab样式
  document.querySelectorAll(`.logic-tab[data-group="${group}"]`).forEach(t => {
    t.classList.remove('text-primary', 'border-b-2', 'border-primary');
    t.classList.add('text-gray-500');
  });
  btn.classList.remove('text-gray-500');
  btn.classList.add('text-primary', 'border-b-2', 'border-primary');

  // 切换同组面板显示
  document.querySelectorAll(`.logic-panel[data-group="${group}"]`).forEach(p => {
    p.classList.add('hidden');
  });
  const targetPanel = document.querySelector(`.logic-panel[data-group="${group}"][data-panel="${tab}"]`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
  }
}

// 逻辑说明弹窗打开/关闭函数
function openLogicModal() {
  const modal = document.getElementById('logic-modal');
  if (modal) {
    modal.classList.remove('hidden');
    // 阻止背景滚动
    document.body.style.overflow = 'hidden';
  }
}

function closeLogicModal() {
  const modal = document.getElementById('logic-modal');
  if (modal) {
    modal.classList.add('hidden');
    // 恢复背景滚动
    document.body.style.overflow = '';
  }
}

// 映射表Tab切换函数
function switchMappingTab(btn) {
  const tab = btn.dataset.tab;

  // 切换tab样式
  document.querySelectorAll('.mapping-tab').forEach(t => {
    t.classList.remove('text-primary', 'border-b-2', 'border-primary');
    t.classList.add('text-gray-500');
  });
  btn.classList.remove('text-gray-500');
  btn.classList.add('text-primary', 'border-b-2', 'border-primary');

  // 切换面板显示
  document.querySelectorAll('.mapping-panel').forEach(p => {
    p.classList.add('hidden');
  });
  const targetPanel = document.getElementById(`${tab}-content`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
  }
}
