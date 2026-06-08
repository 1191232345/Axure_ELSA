/**
 * 操作模块 - 原型扩展
 * 方法：deleteRule, exportData
 */

Object.assign(InboundFeeRuleEngine.prototype, {

  deleteRule(ruleId) {
    if (!confirm('确定要删除该规则吗？此操作不可恢复！')) return;

    const index = this.flatItems.findIndex(i => i.id === ruleId);
    if (index === -1) return;

    this.flatItems.splice(index, 1);

    const filteredIndex = this.filteredItems.findIndex(i => i.id === ruleId);
    if (filteredIndex !== -1) {
      this.filteredItems.splice(filteredIndex, 1);
    }

    this.renderItemList();
    this.updateStatistics();
    showToast('规则删除成功', 'success');
  },

  exportData() {
    if (this.filteredItems.length === 0) {
      showToast('当前分类下没有可导出的数据', 'warning');
      return;
    }

    const headers = ['序号', '费用组', '操作项目', '费用类型', '仓库操作项目', '计费单位', '计费模式', '单价', '状态'];
    const rows = this.filteredItems.map((item, index) => [
      index + 1,
      item.categoryName,
      item.operationName,
      item.feeItem,
      item.warehouseOperation || '-',
      item.unit || '-',
      item.chargeMode || '-',
      item.unitPrice || '-',
      item.publishStatus === 'published' ? '已发布' : item.publishStatus === 'draft' ? '草稿' : '已作废'
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `入库费规则_${this.currentCategory}_${new Date().toLocaleDateString()}.csv`;
    link.click();

    showToast(`成功导出 ${this.filteredItems.length} 条数据`, 'success');
  }

});
