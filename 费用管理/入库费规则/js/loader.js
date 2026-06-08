/**
 * HTML片段加载器
 * 将partials目录下的HTML片段异步加载到页面中
 */
class PartialLoader {
  constructor() {
    this.basePath = 'partials/';
    // 片段加载配置：[容器选择器, 片段文件名]
    this.fragments = [
      // 头部导航
      { selector: '#partial-header', file: 'header.html' },
      // Tab切换
      { selector: '#partial-tabs', file: 'tabs.html' },
      // 筛选区域
      { selector: '#partial-filter', file: 'filter.html' },
      // 数据表格
      { selector: '#partial-table', file: 'table.html' },
      // 逻辑说明 - 初始化页面
      { selector: '#partial-logic-init', file: 'logic-init.html' },
      // 逻辑说明 - 按钮逻辑
      { selector: '#partial-logic-buttons', file: 'logic-buttons.html' },
      // 逻辑说明 - 属性取值（主表）
      { selector: '#partial-logic-fields-main', file: 'logic-fields-main.html' },
      // 逻辑说明 - 属性取值（弹窗）
      { selector: '#partial-logic-fields-modal', file: 'logic-fields-modal.html' },
      // 逻辑说明 - 交互逻辑
      { selector: '#partial-logic-interaction', file: 'logic-interaction.html' },
      // 逻辑说明 - 费率映射表
      { selector: '#partial-logic-mapping', file: 'logic-mapping.html' },
      // 逻辑说明 - 字段取值卡片
      { selector: '#partial-logic-fields-cards', file: 'logic-fields-cards.html' },
      // 逻辑说明 - 计费单位映射
      { selector: '#partial-logic-units', file: 'logic-units.html' },
    ];
  }

  async loadAll() {
    const promises = this.fragments.map(({ selector, file }) => {
      return this.loadFragment(selector, file);
    });
    await Promise.all(promises);
    console.log('✅ 所有片段加载完成');
    // 片段加载完成后初始化映射表交互
    if (typeof initMappingInteraction === 'function') {
      initMappingInteraction();
    }
  }

  async loadFragment(selector, file) {
    const container = document.querySelector(selector);
    if (!container) {
      console.warn(`⚠️ 容器 ${selector} 不存在`);
      return;
    }
    try {
      const response = await fetch(this.basePath + file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      container.innerHTML = html;
    } catch (error) {
      console.error(`❌ 加载片段 ${file} 失败:`, error);
      container.innerHTML = `<div class="p-4 text-red-500 text-sm">加载失败: ${file}</div>`;
    }
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  const loader = new PartialLoader();
  loader.loadAll();
});
