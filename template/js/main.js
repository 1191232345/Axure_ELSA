const MainPage = {
  filteredRows: [],
  currentPage: 1,
  pageSize: 10,
  editingId: null,

  async init() {
    await ModuleApi.init();
    this.bindEvents();
    this.applyFilter();
    this.loadLogicDocs();
  },

  bindEvents() {
    document.getElementById('searchBtn').addEventListener('click', () => this.applyFilter());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetFilter());
    document.getElementById('addBtn').addEventListener('click', () => this.openCreate());
    document.getElementById('saveBtn').addEventListener('click', () => this.handleSave());
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());
  },

  getFilters() {
    return {
      status: document.getElementById('filterStatus').value,
      keyword: document.getElementById('filterKeyword').value.trim().toLowerCase()
    };
  },

  applyFilter() {
    const { status, keyword } = this.getFilters();
    this.filteredRows = ModuleApi.allRows.filter(row => {
      if (status && row.status !== status) return false;
      if (keyword && !row.name.toLowerCase().includes(keyword)) return false;
      return true;
    });
    this.currentPage = 1;
    this.renderPage();
  },

  resetFilter() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterKeyword').value = '';
    this.applyFilter();
  },

  renderPage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const pageRows = this.filteredRows.slice(start, start + this.pageSize);
    ModuleRenderer.renderTable(pageRows);
  },

  openCreate() {
    this.editingId = null;
    document.getElementById('formModalTitle').textContent = '新增记录';
    ModuleRenderer.fillForm(null);
    openModal('formModal');
  },

  openEdit(id) {
    const row = ModuleApi.allRows.find(r => r.id === id);
    if (!row) return;
    this.editingId = id;
    document.getElementById('formModalTitle').textContent = '编辑记录';
    ModuleRenderer.fillForm(row);
    openModal('formModal');
  },

  validateForm() {
    const name = document.getElementById('fieldName').value.trim();
    const err = document.getElementById('fieldNameError');
    if (!name) {
      err.textContent = '名称不能为空';
      err.classList.remove('hidden');
      return null;
    }
    err.classList.add('hidden');
    return {
      name,
      status: document.getElementById('fieldStatus').value
    };
  },

  async handleSave() {
    const data = this.validateForm();
    if (!data) return;
    if (this.editingId) {
      await ModuleApi.updateRow(this.editingId, data);
      showToast('更新成功', 'success');
    } else {
      await ModuleApi.addRow(data);
      showToast('新增成功', 'success');
    }
    closeModal('formModal');
    this.applyFilter();
  },

  pendingDeleteId: null,

  handleDelete(id) {
    this.pendingDeleteId = id;
    openModal('deleteModal');
  },

  async confirmDelete() {
    if (this.pendingDeleteId) {
      await ModuleApi.deleteRow(this.pendingDeleteId);
      showToast('删除成功', 'success');
      this.pendingDeleteId = null;
      closeModal('deleteModal');
      this.applyFilter();
    }
  },

  loadLogicDocs() {
    fetch('logic-docs.html')
      .then(r => r.text())
      .then(html => {
        document.getElementById('logic-docs-container').innerHTML = html;
      })
      .catch(() => {
        document.getElementById('logic-docs-container').innerHTML =
          '<p class="text-center text-gray-500 py-4">逻辑说明加载失败</p>';
      });
  }
};

document.addEventListener('DOMContentLoaded', () => MainPage.init());
