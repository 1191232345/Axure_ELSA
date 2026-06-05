const ModuleApi = {
  allRows: [],

  async init() {
    if (typeof DATA_CONFIG !== 'undefined') {
      APIDataManager.init(DATA_CONFIG);
      const result = await APIDataManager.loadData();
      this.allRows = Array.isArray(result.data) ? result.data : [];
    }
    return this.allRows;
  },

  async saveAll(rows) {
    this.allRows = rows;
    if (typeof APIDataManager !== 'undefined') {
      await APIDataManager.saveData(rows);
    }
  },

  async addRow(row) {
    const rows = [...this.allRows];
    row.id = row.id || Date.now();
    row.createdAt = row.createdAt || new Date().toISOString();
    rows.unshift(row);
    await this.saveAll(rows);
    return row;
  },

  async updateRow(id, updates) {
    const rows = this.allRows.map(r => r.id === id ? { ...r, ...updates } : r);
    await this.saveAll(rows);
    return rows.find(r => r.id === id);
  },

  async deleteRow(id) {
    const rows = this.allRows.filter(r => r.id !== id);
    await this.saveAll(rows);
  }
};
