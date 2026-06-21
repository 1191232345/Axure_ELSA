/**
 * 变更公告组件 (changelog.js)
 * 独立管理版本变更公告的展示，与主页面逻辑解耦
 * 依赖：Tailwind CSS、Font Awesome（页面已加载）
 */

/* ========== 变更公告配置 ========== */

// 公告版本号（内容更新时递增，用户查看后不再自动弹出）
var CHANGELOG_VERSION = '1.0.0';

// localStorage 存储键
var CHANGELOG_STORAGE_KEY = 'elsa_rule_config_changelog_v';

/* ========== 变更公告数据（按版本倒序） ========== */

var CHANGELOG_DATA = [
  {
    version: 'v3.3.0',
    date: '2026-06-21',
    title: '发布冲突校验与作废复制新增',
    icon: 'fa-shield-alt',
    color: 'text-blue-600',
    changes: [
      { item: '发布冲突校验', desc: '同客户+仓库+费用类型+生效期重叠时校验', before: '无校验，可直接发布', after: '重叠时阻断发布并提示' },
      { item: '暂存校验策略', desc: '草稿暂存时的冲突检查', before: '暂存也校验唯一性', after: '暂存不校验，仅发布校验' },
      { item: '作废复制新增', desc: '作废状态规则的操作权限', before: '仅可查看', after: '支持复制新增创建草稿副本' },
      { item: '重复信息提示', desc: '选择客户/仓库时的提示方式', before: '阻止保存', after: '信息提示，不阻止暂存' }
    ]
  },
  {
    version: 'v3.2.0',
    date: '2026-06-21',
    title: '发布状态三态生命周期',
    icon: 'fa-sitemap',
    color: 'text-green-600',
    changes: [
      { item: '状态字段', desc: '规则配置新增状态管理', before: '无状态字段', after: '草稿/已发布/已作废三态' },
      { item: '新增保存', desc: '新建规则的保存方式', before: '仅「保存配置」', after: '支持「暂存」或「发布」' },
      { item: '草稿编辑', desc: '草稿状态规则的可编辑性', before: '所有规则均可编辑', after: '仅草稿可编辑' },
      { item: '草稿发布', desc: '草稿规则的发布操作', before: '无发布功能', after: '主表支持发布草稿规则' },
      { item: '规则作废', desc: '已发布规则的处理', before: '无法终止', after: '支持作废，状态更新为「已作废」' },
      { item: '操作按钮', desc: '操作按钮的显示方式', before: '固定显示查看/编辑/删除', after: '按状态动态显示' }
    ]
  },
  {
    version: 'v3.1.0',
    date: '2026-06-21',
    title: '主表字段精简',
    icon: 'fa-columns',
    color: 'text-orange-600',
    changes: [
      { item: '主表列精简', desc: '删除冗余展示列', before: '含引用价卡/业务类型/折扣配置/微调状态', after: '仅保留核心字段' },
      { item: '示例数据', desc: '页面首次加载的数据', before: '自动生成4条示例', after: '空状态，引导创建' },
      { item: '状态列', desc: '主表新增状态展示', before: '无状态列', after: '新增「状态」列' },
      { item: '逻辑说明', desc: '逻辑说明弹窗内容', before: '5个卡片', after: '新增「状态变更流程」卡片' }
    ]
  }
];

/* ========== 核心逻辑 ========== */

/**
 * 检查是否有未查看的公告
 */
function hasUnviewedChangelog() {
  var viewed = localStorage.getItem(CHANGELOG_STORAGE_KEY) || '';
  return viewed !== CHANGELOG_VERSION;
}

/**
 * 标记当前版本已查看
 */
function markChangelogViewed() {
  localStorage.setItem(CHANGELOG_STORAGE_KEY, CHANGELOG_VERSION);
}

/**
 * 构建单条变更记录的HTML
 */
function buildChangelogEntry(log) {
  var rowsHtml = log.changes.map(function(c) {
    return '<tr class="border-b border-gray-100 last:border-0">' +
      '<td class="px-3 py-2 text-gray-800 font-medium text-sm whitespace-nowrap">' + c.item + '</td>' +
      '<td class="px-3 py-2 text-gray-500 text-xs">' + c.desc + '</td>' +
      '<td class="px-3 py-2 text-gray-400 text-xs line-through">' + c.before + '</td>' +
      '<td class="px-3 py-2 text-green-600 text-xs font-medium">' + c.after + '</td>' +
    '</tr>';
  }).join('');

  return '<div class="mb-6 last:mb-0">' +
    '<div class="flex items-center mb-2">' +
      '<i class="fas ' + log.icon + ' ' + log.color + ' mr-2 text-base"></i>' +
      '<span class="font-semibold text-gray-800">' + log.version + ' ' + log.title + '</span>' +
      '<span class="ml-auto text-xs text-gray-400">' + log.date + '</span>' +
    '</div>' +
    '<div class="overflow-x-auto">' +
      '<table class="min-w-full text-sm border border-gray-200 rounded">' +
        '<thead class="bg-gray-50">' +
          '<tr>' +
            '<th class="px-3 py-2 text-left font-medium text-gray-700 border-b w-24">变更项</th>' +
            '<th class="px-3 py-2 text-left font-medium text-gray-700 border-b">描述</th>' +
            '<th class="px-3 py-2 text-left font-medium text-gray-700 border-b">变更前</th>' +
            '<th class="px-3 py-2 text-left font-medium text-gray-700 border-b">变更后</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
    '</div>' +
  '</div>';
}

/**
 * 创建并显示变更公告弹窗
 */
function createChangelogModal() {
  var existing = document.getElementById('changelog-modal');
  if (existing) existing.remove();

  var contentHtml = CHANGELOG_DATA.map(buildChangelogEntry).join('');

  var modal = document.createElement('div');
  modal.id = 'changelog-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.2s ease';

  modal.innerHTML =
    '<div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">' +
      // 头部
      '<div class="px-6 py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center">' +
        '<div class="flex items-center">' +
          '<i class="fas fa-bullhorn text-primary mr-2"></i>' +
          '<span class="font-semibold text-primary text-lg">变更公告</span>' +
          '<span class="ml-2 text-xs text-gray-400">最近更新</span>' +
        '</div>' +
        '<button onclick="closeChangelogModal()" class="text-gray-400 hover:text-gray-600 transition-colors">' +
          '<i class="fas fa-times text-xl"></i>' +
        '</button>' +
      '</div>' +
      // 内容区
      '<div class="flex-1 overflow-y-auto p-6">' + contentHtml + '</div>' +
      // 底部操作栏
      '<div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">' +
        '<label class="flex items-center text-sm text-gray-500 cursor-pointer select-none">' +
          '<input type="checkbox" id="changelog-dont-show" class="mr-2 cursor-pointer">' +
          '不再自动提醒此版本' +
        '</label>' +
        '<button onclick="closeChangelogModal()" class="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">' +
          '我知道了' +
        '</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);

  // 淡入动画
  requestAnimationFrame(function() {
    modal.style.opacity = '1';
  });

  // 点击遮罩关闭
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeChangelogModal();
  });

  // ESC 关闭
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeChangelogModal();
  });
}

/* ========== 对外接口 ========== */

/**
 * 打开变更公告弹窗
 */
function openChangelogModal() {
  createChangelogModal();
}

/**
 * 关闭变更公告弹窗
 */
function closeChangelogModal() {
  var modal = document.getElementById('changelog-modal');
  if (!modal) return;

  var dontShow = document.getElementById('changelog-dont-show');
  if (dontShow && dontShow.checked) {
    markChangelogViewed();
  }

  modal.style.opacity = '0';
  setTimeout(function() {
    modal.remove();
  }, 200);
}

/**
 * 初始化变更公告
 * 页面加载后如果有未查看的公告则自动弹出
 */
function initChangelog() {
  if (hasUnviewedChangelog()) {
    setTimeout(function() {
      openChangelogModal();
    }, 600);
  }
}

/* ========== 自动初始化 ========== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChangelog);
} else {
  initChangelog();
}
