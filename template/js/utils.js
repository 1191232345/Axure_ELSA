const ModuleUtils = {
  formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  statusLabel(status) {
    return status === 'active'
      ? '<span class="inline-flex px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">启用</span>'
      : '<span class="inline-flex px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">禁用</span>';
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
