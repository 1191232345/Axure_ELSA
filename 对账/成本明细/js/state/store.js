class Store {
  constructor() {
    this.state = {
      reconciliationData: [],
      modalData: [],
      batchModalData: [],
      batchModalDataLoaded: false,
      isBatchTaskRunning: false,
      currentPage: 1,
      itemsPerPage: 10,
      selectedItems: new Set(),
      modalSelectedItems: new Set(),
      batchModalSelectedItems: new Set(),
      filters: {},
      modalFilters: {},
      batchModalFilters: {}
    };
    this.listeners = [];
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setData(data) {
    this.setState({ reconciliationData: data });
  }

  setModalData(data) {
    this.setState({ modalData: data });
  }

  setBatchModalData(data) {
    this.setState({ batchModalData: data, batchModalDataLoaded: true });
  }

  setCurrentPage(page) {
    this.setState({ currentPage: page });
  }

  setSelectedItems(items) {
    this.setState({ selectedItems: items });
  }

  setModalSelectedItems(items) {
    this.setState({ modalSelectedItems: items });
  }

  setBatchModalSelectedItems(items) {
    this.setState({ batchModalSelectedItems: items });
  }

  setFilters(filters) {
    this.setState({ filters });
  }

  setModalFilters(filters) {
    this.setState({ modalFilters: filters });
  }

  setBatchModalFilters(filters) {
    this.setState({ batchModalFilters: filters });
  }

  toggleSelectedItem(id) {
    const newSelected = new Set(this.state.selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    this.setSelectedItems(newSelected);
  }

  toggleModalSelectedItem(id) {
    const newSelected = new Set(this.state.modalSelectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    this.setModalSelectedItems(newSelected);
  }

  toggleBatchModalSelectedItem(id) {
    const newSelected = new Set(this.state.batchModalSelectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    this.setBatchModalSelectedItems(newSelected);
  }

  clearSelectedItems() {
    this.setSelectedItems(new Set());
  }

  clearModalSelectedItems() {
    this.setModalSelectedItems(new Set());
  }

  clearBatchModalSelectedItems() {
    this.setBatchModalSelectedItems(new Set());
  }

  setBatchTaskRunning(running) {
    this.setState({ isBatchTaskRunning: running });
  }

  reset() {
    this.setState({
      reconciliationData: [],
      modalData: [],
      batchModalData: [],
      batchModalDataLoaded: false,
      isBatchTaskRunning: false,
      currentPage: 1,
      selectedItems: new Set(),
      modalSelectedItems: new Set(),
      batchModalSelectedItems: new Set(),
      filters: {},
      modalFilters: {},
      batchModalFilters: {}
    });
  }
}

export const store = new Store();