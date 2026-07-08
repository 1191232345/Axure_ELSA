// 逻辑说明弹窗逻辑
const LogicDescriptionModal = {
  // 打开逻辑说明弹窗
  open() {
    const modal = document.getElementById('logic-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  },

  // 关闭逻辑说明弹窗
  close() {
    const modal = document.getElementById('logic-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  // 切换逻辑说明Tab
  switchTab(button) {
    const group = button.getAttribute('data-group');
    const tab = button.getAttribute('data-tab');

    // 更新Tab按钮样式
    const tabs = document.querySelectorAll(`.logic-tab[data-group="${group}"]`);
    tabs.forEach(tabBtn => {
      tabBtn.classList.remove('text-primary', 'border-b-2', 'border-primary');
      tabBtn.classList.add('text-gray-500', 'hover:text-gray-700');
    });

    button.classList.remove('text-gray-500', 'hover:text-gray-700');
    button.classList.add('text-primary', 'border-b-2', 'border-primary');

    // 显示对应面板
    const panels = document.querySelectorAll(`.logic-panel[data-group="${group}"]`);
    panels.forEach(panel => {
      panel.classList.add('hidden');
    });

    const activePanel = document.querySelector(`.logic-panel[data-group="${group}"][data-panel="${tab}"]`);
    if (activePanel) {
      activePanel.classList.remove('hidden');
    }
  },

  // 初始化事件监听
  init() {
    const modal = document.getElementById('logic-modal');
    if (modal) {
      // 点击弹窗外部关闭
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
  LogicDescriptionModal.init();
});

// 全局函数兼容
function openLogicModal() {
  LogicDescriptionModal.open();
}

function closeLogicModal() {
  LogicDescriptionModal.close();
}

function switchLogicTab(button) {
  LogicDescriptionModal.switchTab(button);
}