// 编辑价卡弹窗逻辑
const EditPackageModal = {
  currentPackageId: null,

  // 打开编辑价卡弹窗
  open(packageId) {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.add('active');
      this.currentPackageId = packageId;
      this.loadPackageData(packageId);
    }
  },

  // 关闭编辑价卡弹窗
  close() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.remove('active');
      this.currentPackageId = null;
    }
  },

  // 加载价卡数据到弹窗
  loadPackageData(packageId) {
    const pkg = AppState.packages.find(p => p.id === packageId);
    if (!pkg) {
      alert('价卡不存在');
      this.close();
      return;
    }

    // 填充表单数据
    document.getElementById('editPackageId').value = pkg.id;
    document.getElementById('editPackageName').value = pkg.name;
    document.getElementById('editPackageDescription').value = pkg.description || '';
  },

  // 更新价卡基本信息
  update() {
    const packageId = parseInt(document.getElementById('editPackageId').value);
    const name = document.getElementById('editPackageName').value.trim();
    const description = document.getElementById('editPackageDescription').value.trim();

    // 验证
    if (!name) {
      alert('请输入价卡名称');
      return;
    }

    // 检查价卡名称是否与其他价卡重复(排除当前价卡)
    const duplicate = AppState.packages.find(p => p.id !== packageId && p.name === name);
    if (duplicate) {
      alert('价卡名称已存在，请使用其他名称');
      return;
    }

    // 查找并更新价卡
    const pkg = AppState.packages.find(p => p.id === packageId);
    if (!pkg) {
      alert('价卡不存在');
      return;
    }

    // 更新基本信息
    pkg.name = name;
    pkg.description = description;
    pkg.updatedBy = '管理员';
    pkg.updatedAt = DataService.getCurrentTime();

    // 保存到localStorage
    DataService.savePackages();

    // 关闭弹窗并刷新列表
    this.close();
    PackageList.render();

    alert('价卡基本信息更新成功！');
  },

  // 初始化事件监听
  init() {
    const modal = document.getElementById('editModal');
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
  EditPackageModal.init();
});

// 全局函数兼容
function openEditModal(packageId) {
  EditPackageModal.open(packageId);
}

function closeEditModal() {
  EditPackageModal.close();
}

function updatePackage() {
  EditPackageModal.update();
}