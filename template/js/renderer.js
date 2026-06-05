const ModuleRenderer = {
  renderTable(rows) {
    const tbody = document.getElementById('tableBody');
    const empty = document.getElementById('emptyState');
    const totalEl = document.getElementById('totalCount');

    if (totalEl) totalEl.textContent = rows.length;

    if (!rows.length) {
      tbody.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    tbody.innerHTML = rows.map(row => `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3">${ModuleUtils.escapeHtml(row.name)}</td>
        <td class="px-4 py-3">${ModuleUtils.statusLabel(row.status)}</td>
        <td class="px-4 py-3 text-neutral-500">${ModuleUtils.formatDate(row.createdAt)}</td>
        <td class="px-4 py-3">
          <button class="text-primary hover:underline mr-3" onclick="MainPage.openEdit(${row.id})">编辑</button>
          <button class="text-danger hover:underline" onclick="MainPage.handleDelete(${row.id})">删除</button>
        </td>
      </tr>
    `).join('');
  },

  fillForm(row) {
    document.getElementById('fieldName').value = row ? row.name : '';
    document.getElementById('fieldStatus').value = row ? row.status : 'active';
    document.getElementById('fieldNameError').classList.add('hidden');
  }
};
