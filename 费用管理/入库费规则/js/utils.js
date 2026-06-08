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
