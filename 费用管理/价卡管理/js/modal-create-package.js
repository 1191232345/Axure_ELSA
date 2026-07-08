// 新增价卡弹窗逻辑
const CreatePackageModal = {
  // 打开新增价卡弹窗
  open() {
    const modal = document.getElementById('createModal');
    if (modal) {
      modal.classList.add('active');
      this.fillDefaultValues();
    }
  },

  // 关闭新增价卡弹窗
  close() {
    const modal = document.getElementById('createModal');
    if (modal) modal.classList.remove('active');
  },

  // 自动填写默认的价卡名称和描述
  fillDefaultValues() {
    const packageNameInput = document.getElementById('createPackageName');
    const packageDescInput = document.getElementById('createPackageDescription');

    if (packageNameInput) {
      // 生成默认价卡名称：新价卡001、新价卡002等
      const existingPackages = AppState.packages || [];
      let newNumber = existingPackages.length + 1;
      let defaultName = `新价卡${String(newNumber).padStart(3, '0')}`;

      // 检查是否已存在同名价卡，如果存在则递增编号
      while (existingPackages.some(p => p.name === defaultName)) {
        newNumber++;
        defaultName = `新价卡${String(newNumber).padStart(3, '0')}`;
      }

      packageNameInput.value = defaultName;
    }

    if (packageDescInput) {
      packageDescInput.value = '请填写价卡描述';
    }
  },

  // 创建价卡
  create() {
    const nameInput = document.getElementById('createPackageName');
    const descInput = document.getElementById('createPackageDescription');

    if (!nameInput || !nameInput.value.trim()) {
      alert('请输入价卡名称');
      return;
    }

    const packageName = nameInput.value.trim();
    const packageDesc = descInput ? descInput.value.trim() : '';

    // 检查价卡名称是否已存在
    if (AppState.packages.some(p => p.name === packageName)) {
      alert('价卡名称已存在，请使用其他名称');
      return;
    }

    // 创建新价卡
    const newPackage = {
      id: Date.now(),
      name: packageName,
      description: packageDesc,
      feeItems: [],
      createdBy: '管理员',
      createdAt: DataService.getCurrentTime(),
      updatedBy: '管理员',
      updatedAt: DataService.getCurrentTime()
    };

    // 添加到状态并保存
    AppState.packages.unshift(newPackage);
    DataService.savePackages();

    // 关闭弹窗并刷新列表
    this.close();
    PackageList.render();

    alert('价卡创建成功！');
  },

  // 初始化事件监听
  init() {
    const modal = document.getElementById('createModal');
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
  CreatePackageModal.init();
});

// 全局函数兼容
function openCreateModal() {
  CreatePackageModal.open();
}

function closeCreateModal() {
  CreatePackageModal.close();
}

function createPackage() {
  CreatePackageModal.create();
}