/**
 * 映射表交互逻辑
 * 标签页切换、搜索筛选
 */
function initMappingInteraction() {
  // 标签页切换
  document.querySelectorAll('.mapping-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // 更新标签样式
      document.querySelectorAll('.mapping-tab').forEach(t => {
        t.classList.remove('text-primary', 'border-b-2', 'border-primary');
        t.classList.add('text-gray-500');
      });
      this.classList.remove('text-gray-500');
      this.classList.add('text-primary', 'border-b-2', 'border-primary');

      // 切换面板
      const tabName = this.dataset.tab;
      document.querySelectorAll('.mapping-panel').forEach(panel => {
        panel.classList.add('hidden');
      });
      const targetPanel = document.getElementById(tabName + '-content');
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }
    });
  });

  // 搜索筛选
  const searchInput = document.querySelector('.mapping-search');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const keyword = e.target.value.toLowerCase();
      document.querySelectorAll('.mapping-table tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(keyword) ? '' : 'none';
      });
    });
  }

  const filterSelect = document.querySelector('.mapping-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', function(e) {
      const type = e.target.value;
      document.querySelectorAll('.mapping-table tbody tr').forEach(row => {
        row.style.display = (!type || row.dataset.type === type) ? '' : 'none';
      });
    });
  }
}
