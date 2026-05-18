# HTML 页面结构模板

本文件包含TOB产品的完整 HTML 页面结构模板，采用模块化文件结构，便于维护。

> **⚠️ 重要更新 (v2.0)**：
> - ✅ 升级 Font Awesome 4→6
> - ✅ 升级 marked@4→@9
> - ✅ 升级 mermaid@10→@11
> - ✅ Tailwind 配置引用统一设计令牌（[00-design-tokens.md](00-design-tokens.md)）

## 0. 模块化文件结构

```
[模块目录]/
├── index.html              # 主页面（精简版）
├── css/
│   └── styles.css          # 模块样式
├── js/
│   └── main.js             # 模块交互逻辑
├── data/
│   └── [page_id]-data.json # 数据文件
├── prd.md                  # PRD文档
└── test-cases.md           # 测试用例

公共资源（项目根目录）/
├── common/
│   ├── css/
│   │   └── common.css      # 公共样式
│   └── js/
│       └── common.js       # 公共JS（APIDataManager等）
└── server/                 # Node.js 服务器
```

## 1. 主页面 (index.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[模块名称] - ELSA</title>

    <!-- CDN 资源预连接（优化加载性能） -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">

    <!--
        ════════════════════════════════════════════════════════
        前端依赖库（v2.0 升级版本）
        ════════════════════════════════════════════════════════

        版本说明：
        • Font Awesome: 4.7.0 → 6.4.0（图标库升级，class名称变更：fa → fas/far/fab）
        • Marked: @4 → @9（Markdown解析器升级，API略有调整）
        • Mermaid: @10 → @11（图表库升级，性能优化）

        ⚠️ 注意：FA6的class命名规则：
        - 实心图标：fas fa-* （如 fas fa-search, fas fa-plus）
        - 常规图标：far fa-* （如 far fa-clock, far fa-edit）
        - 品牌图标：fab fa-* （如 fab fa-github）
        - 双向建议使用fas（实心）以保持视觉一致性
    -->

    <!-- Font Awesome 6.4.0 (升级自4.7.0) -->
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOyTj2nH09Kw8Zp5l4O9Q1LdCJbVgloaRIhP5qRy/L1BcXUlaCEM9yFfqw=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
          media="print" onload="this.media='all'">

    <!-- Tailwind CSS (Play CDN - 开发环境使用) -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Marked 9.1.6 (升级自@4) -->
    <script src="https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js"></script>

    <!-- Mermaid 11.6.3 (升级自@10) -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11.6.3/dist/mermaid.min.js"></script>

    <!-- 公共样式 -->
    <link rel="stylesheet" href="/common/css/common.css">
    <!-- 模块样式 -->
    <link rel="stylesheet" href="css/styles.css">

    <!--
        ════════════════════════════════════════════════════════
        Tailwind + 应用配置
        ════════════════════════════════════════════════════════

        ⚠️ 重要：完整的设计令牌定义请参考：
        👉 00-design-tokens.md (第9节包含完整的Tailwind配置对象)

        以下为精简版配置，仅包含核心必要项。
        如需完整配置（色彩系统、字体、间距、阴影等），请复制00-design-tokens.md第9节的内容。
    -->
    <script>
        // 从统一设计令牌导入核心配置
        const DESIGN_TOKENS = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            DEFAULT: '#2a3b7d',
                            light: '#3a4ca7',
                            dark: '#1e2d5f'
                        },
                        secondary: {
                            DEFAULT: '#36CFC9'
                        },
                        accent: {
                            DEFAULT: '#722ED1'
                        },
                        success: {
                            DEFAULT: '#00B42A',
                            bg: '#E8FFEC',
                            text: '#006B19'
                        },
                        warning: {
                            DEFAULT: '#FF7D00',
                            bg: '#FFF7E8',
                            text: '#994D00'
                        },
                        danger: {
                            DEFAULT: '#F53F3F',
                            bg: '#FFECE8',
                            text: '#B3261E'
                        },
                        info: {
                            DEFAULT: '#1677FF',
                            bg: '#E8F3FF',
                            text: '#094D8C'
                        },
                        neutral: {
                            50: '#FAFAFA',
                            100: '#F5F5F5',
                            200: '#E5E7EB',
                            300: '#D1D5DB',
                            400: '#9CA3AF',
                            500: '#6B7280',
                            600: '#4B5563',
                            700: '#374151',
                            800: '#1F2937',
                            900: '#111827'
                        },
                        dark: '#1D2129',
                        border: '#E5E7EB',
                        'light-bg': '#FFFFFF',
                        'card-bg': '#FFFFFF'
                    },
                    boxShadow: {
                        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
                        'card-hover': '0 10px 25px -5px rgba(42, 59, 125, 0.1)',
                        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.1)',
                        'header': '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        };

        tailwind.config = DESIGN_TOKENS;

        // Mermaid 初始化配置
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            logLevel: 3,
            fontFamily: 'Inter, system-ui, sans-serif'
        });

        // 数据持久化配置
        const DATA_CONFIG = {
            pageId: '[page_id]',
            dataFile: '[模块目录]/data/[page_id]-data.json',
            apiBase: 'http://localhost:3100/api/data',
            version: '2.0.0'  // 升级版本号
        };

        // Marked 自定义渲染器（适配Marked 9.x API）
        const renderer = new marked.Renderer();

        renderer.code = function(code, language) {
            if (language === 'mermaid') {
                return '<div class="mermaid-container" onclick="openMermaidModal(this)">' +
                       '<div class="mermaid">' + code + '</div>' +
                       '<span class="mermaid-hint"><i class="fas fa-magnifying-glass-plus mr-1"></i>点击放大</span>' +
                       '</div>';
            }

            return '<pre><code class="language-' + (language || '') + '">' +
                   code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
                   '</code></pre>';
        };

        marked.setOptions({
            renderer: renderer,
            breaks: true,
            gfm: true
        });
    </script>
</head>
<body class="font-sans bg-gray-50 text-neutral-800 min-h-screen">
    <!--
        ════════════════════════════════════════════════════════
        页面主体结构
        ════════════════════════════════════════════════════════
    -->

    <!-- 切换标签（固定在右下角） -->
    <div class="tabs fixed bottom-8 right-8 z-40">
        <button id="tab-prototype" class="tab active" onclick="switchMainTab('prototype')">原型</button>
        <button id="tab-prd" class="tab" onclick="switchMainTab('prd')">PRD</button>
        <button id="tab-testcases" class="tab" onclick="switchMainTab('testcases')">测试用例</button>
    </div>

    <!-- Header 导航栏 -->
    <header class="bg-primary text-white shadow-header sticky top-0 z-50">
        <div class="container mx-auto px-2 sm:px-3 lg:px-4">
            <div class="flex justify-between items-center h-14">
                <div class="flex items-center">
                    <span class="text-lg font-semibold">ELSA</span>
                </div>
            </div>
        </div>
    </header>

    <!-- PRD 内容区域 -->
    <main id="main-prd" class="main-content" style="display: none;">
        <div class="container mx-auto px-4 py-8">
            <div class="flex gap-6">
                <aside class="w-64 flex-shrink-0 hidden lg:block">
                    <div class="toc sticky top-4">
                        <div class="toc-title"><i class="fas fa-list-alt mr-2"></i>目录导航</div>
                        <div id="toc-nav"></div>
                    </div>
                </aside>
                <div class="flex-1 min-w-0">
                    <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
                        <div id="prd-content" class="prose max-w-none"></div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Mermaid 图表放大模态框 -->
    <div id="mermaidModal" class="mermaid-modal" onclick="closeMermaidModal(event)">
        <div class="mermaid-modal-content" onclick="event.stopPropagation()">
            <button class="mermaid-modal-close" onclick="closeMermaidModal()">
                <i class="fas fa-xmark"></i>
            </button>
            <div class="mermaid-modal-title">
                <i class="fas fa-diagram-project mr-2"></i>流程图预览
            </div>
            <div id="mermaidModalContent" class="mermaid-modal-svg"></div>
        </div>
    </div>

    <!-- 测试用例区域 -->
    <main id="main-testcases" class="main-content" style="display: none;"></main>

    <!--
        ════════════════════════════════════════════════════════
        原型页面主内容区
        ════════════════════════════════════════════════════════
    -->
    <main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-2 py-6">

            <!-- ========== 搜索卡片（筛选区域）========== -->
            <div class="bg-white rounded shadow-card p-4 mb-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div class="flex items-center w-full sm:w-auto">
                        <label class="text-xs text-neutral-600 mr-2">状态</label>
                        <select id="filterStatus"
                                class="w-full sm:w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                            <option value="">全部</option>
                            <option value="active">启用</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
                        <button class="erp-btn erp-btn-secondary" onclick="handleReset()">
                            <i class="fas fa-rotate-right mr-1.5"></i> 重置
                        </button>
                        <button class="erp-btn erp-btn-primary" onclick="handleSearch()">
                            <i class="fas fa-search mr-1.5"></i> 搜索
                        </button>
                    </div>
                </div>
            </div>

            <!-- ========== 操作卡片（按钮组）========== -->
            <div class="bg-white rounded shadow-card p-4 mb-4">
                <div class="flex justify-start gap-3 flex-wrap">
                    <button class="erp-btn erp-btn-primary" onclick="openAddModal()">
                        <i class="fas fa-plus mr-1.5"></i> 新增
                    </button>
                    <button class="erp-btn erp-btn-secondary" onclick="handleExport()">
                        <i class="fas fa-upload mr-1.5"></i> 导出
                    </button>
                    <button class="erp-btn erp-btn-danger batch-btn" disabled onclick="handleBatchDelete()">
                        <i class="fas fa-trash-can mr-1.5"></i> 批量删除
                    </button>
                </div>
            </div>

            <!-- ========== 数据表格 ========== -->
            <div class="bg-white rounded shadow-card overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-neutral-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left">
                                    <input type="checkbox" id="selectAll" onchange="handleSelectAll()"
                                           class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/30">
                                </th>
                                <th class="px-4 py-3 text-left font-medium text-gray-700">序号</th>
                                <th class="px-4 py-3 text-left font-medium text-gray-700">名称</th>
                                <th class="px-4 py-3 text-left font-medium text-gray-700">状态</th>
                                <th class="px-4 py-3 text-left font-medium text-gray-700">操作</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody" class="divide-y divide-neutral-100">
                            <!-- 动态数据行将通过JavaScript渲染 -->
                        </tbody>
                    </table>
                </div>

                <!-- 空状态提示（当表格无数据时显示） -->
                <div id="emptyState" class="hidden text-center py-12">
                    <i class="fas fa-inbox text-6xl text-neutral-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-neutral-500 mb-2">暂无数据</h3>
                    <p class="text-sm text-neutral-400 mb-4">您可以点击下方按钮添加新数据</p>
                    <button class="erp-btn erp-btn-primary" onclick="openAddModal()">
                        <i class="fas fa-plus mr-1.5"></i> 立即添加
                    </button>
                </div>
            </div>

            <!-- ========== 分页组件 ========== -->
            <div class="flex justify-between items-center mt-4">
                <div class="text-sm text-gray-500">
                    共 <span id="totalCount" class="font-medium text-gray-700">0</span> 条记录
                </div>
                <div id="pagination" class="flex gap-1">
                    <!-- 分页按钮将由JavaScript动态生成 -->
                </div>
            </div>

            <!-- ========== 逻辑说明区域（可折叠）========== -->
            <div class="bg-white rounded shadow-card mt-4 overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-all"
                     onclick="toggleLogic()">
                    <div class="flex items-center">
                        <i class="fas fa-book text-primary mr-2"></i>
                        <span class="font-semibold text-primary">逻辑说明</span>
                    </div>
                    <i class="fas fa-chevron-down text-primary transition-transform duration-300" id="logicIcon"></i>
                </div>
                <div id="logicContent" class="hidden p-4 bg-gray-50/50">
                    <p class="text-gray-600 mb-4">在此添加逻辑说明...</p>

                    <!-- 逻辑说明模板结构（参考05-logic-description.md） -->
                    <div class="space-y-6">
                        <!-- 初始化页面 -->
                        <section>
                            <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                                <i class="fas fa-play-circle text-primary mr-2"></i>
                                初始化页面（数据展示逻辑）
                            </h4>
                            <table class="w-full text-sm border border-neutral-200">
                                <thead class="bg-neutral-50">
                                    <tr>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">数据项</th>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">取值规则</th>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">展示规则</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td class="border border-neutral-200 px-3 py-2" colspan="3">待补充具体业务逻辑...</td></tr>
                                </tbody>
                            </table>
                        </section>

                        <!-- 检索条件 -->
                        <section>
                            <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                                <i class="fas fa-filter text-primary mr-2"></i>
                                检索条件
                            </h4>
                            <table class="w-full text-sm border border-neutral-200">
                                <thead class="bg-neutral-50">
                                    <tr>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">筛选项</th>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">输入方式</th>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">查询逻辑</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td class="border border-neutral-200 px-3 py-2" colspan="3">待补充具体检索条件...</td></tr>
                                </tbody>
                            </table>
                        </section>

                        <!-- 按钮逻辑 -->
                        <section>
                            <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                                <i class="fas fa-hand-pointer text-primary mr-2"></i>
                                按钮逻辑
                            </h4>
                            <table class="w-full text-sm border border-neutral-200">
                                <thead class="bg-neutral-50">
                                    <tr>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">按钮</th>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">前置条件</th>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">触发动作</th>
                                        <th class="border border-neutral-200 px-3 py-2 text-left">后续操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td class="border border-neutral-200 px-3 py-2" colspan="4">待补充具体按钮逻辑...</td></tr>
                                </tbody>
                            </table>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!--
        ════════════════════════════════════════════════════════
        新增/编辑模态框
        ════════════════════════════════════════════════════════
    -->
    <div id="formModal" class="modal-overlay" onclick="closeModalOnOverlay(event)">
        <div class="modal-content scale-fade-in">
            <div class="modal-header">
                <h3 id="modalTitle" class="modal-title">新增</h3>
                <button class="modal-close" onclick="closeModal('formModal')">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="dataForm" class="space-y-4">
                    <input type="hidden" id="editId">

                    <div class="form-group">
                        <label for="formName" class="form-label">
                            名称 <span class="text-danger">*</span>
                        </label>
                        <input type="text"
                               id="formName"
                               name="name"
                               class="input-primary"
                               placeholder="请输入名称"
                               required>
                    </div>

                    <div class="form-group">
                        <label for="formStatus" class="form-label">状态</label>
                        <select id="formStatus" name="status" class="input-primary">
                            <option value="active">启用</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="erp-btn erp-btn-secondary" onclick="closeModal('formModal')">
                    取消
                </button>
                <button type="button" class="erp-btn erp-btn-primary" onclick="handleSave()">
                    <i class="fas fa-check mr-1.5"></i> 保存
                </button>
            </div>
        </div>
    </div>

    <!--
        ════════════════════════════════════════════════════════
        JavaScript 加载
        ════════════════════════════════════════════════════════
    -->
    <!-- 公共JS（APIDataManager等工具函数） -->
    <script src="/common/js/common.js"></script>
    <!-- 模块JS（页面特定交互逻辑） -->
    <script src="js/main.js"></script>
</body>
</html>
```

## 2. 页面布局规范

```
┌─────────────────────────────────────────┐
│ Header 导航栏（固定顶部）                 │
├─────────────────────────────────────────┤
│                                         │
│ 搜索卡片（筛选条件 + 搜索/重置按钮）      │
│                                         │
├─────────────────────────────────────────┤
│ 操作卡片（新增、导出、批量操作等按钮）    │
│                                         │
├─────────────────────────────────────────┤
│ 数据表格                                 │
│ ├─ 表头（列名 + 全选复选框）              │
│ ├─ 数据行（动态渲染）                     │
│ └─ 空状态提示（无数据时显示）             │
│                                         │
├─────────────────────────────────────────┤
│ 分页（记录总数 + 页码导航）               │
│                                         │
├─────────────────────────────────────────┤
│ 逻辑说明（可折叠，默认收起）              │
│ ├─ 初始化页面逻辑                         │
│ ├─ 检索条件说明                          │
│ └─ 按钮逻辑说明                          │
│                                         │
└─────────────────────────────────────────┘
         ↑ 固定标签切换（右下角）
```

## 3. 按钮位置规则

| 按钮类型 | 位置 | 样式 | FA6图标 |
|----------|------|------|---------|
| 搜索 | 搜索卡片右侧 | 主按钮 (primary) | `fas fa-search` |
| 重置 | 搜索卡片右侧 | 次要按钮 (secondary) | `fas fa-rotate-right` |
| 新增 | 操作卡片左侧 | 主按钮 (primary) | `fas fa-plus` |
| 导出 | 操作卡片左侧 | 次要按钮 (secondary) | `fas fa-upload` |
| 批量删除 | 操作卡片左侧 | 危险按钮 (danger) | `fas fa-trash-can` |
| 保存 | 模态框底部右侧 | 主按钮 (primary) | `fas fa-check` |
| 取消 | 模态框底部右侧 | 次要按钮 (secondary) | 文字 |

## 4. Font Awesome 6 迁移指南

### 4.1 Class 名称变更对照表

| FA4 (旧) | FA6 (新) | 说明 |
|----------|----------|------|
| `fa fa-search` | `fas fa-search` | 搜索图标 |
| `fa fa-plus` | `fas fa-plus` | 加号 |
| `fa fa-times` / `fa fa-close` | `fas fa-xmark` | 关闭/叉号 |
| `fa fa-trash` | `fas fa-trash-can` | 删除（垃圾桶）|
| `fa fa-refresh` | `fas fa-rotate-right` | 刷新/重置 |
| `fa fa-list-alt` | `fas fa-list-alt` | 列表 |
| `fa fa-book` | `fas fa-book` | 书本 |
| `fa fa-chevron-down` | `fas fa-chevron-down` | 下箭头 |
| `fa fa-search-plus` | `fas fa-magnifying-glass-plus` | 放大镜+ |
| `fa fa-sitemap` | `fas fa-diagram-project` | 流程图 |
| `fa fa-upload` | `fas fa-upload` | 上传（不变）|

### 4.2 使用示例

```html
<!-- ❌ FA4 写法（已废弃）-->
<i class="fa fa-search"></i>
<i class="fa fa-times"></i>
<i class="fa fa-refresh"></i>

<!-- ✅ FA6 正确写法 -->
<i class="fas fa-search"></i>
<i class="fas fa-xmark"></i>
<i class="fas fa-rotate-right"></i>
```

### 4.3 图标风格选择

```html
<!-- 实心图标（推荐，视觉权重适中）-->
<i class="fas fa-home"></i>

<!-- 常规图标（线条感，适合次要元素）-->
<i class="far fa-calendar"></i>

<!-- 品牌图标（社交媒体等）-->
<i class="fab fa-github"></i>
```

**建议**：TOB产品界面统一使用 `fas`（实心图标）以保持视觉一致性。

## 5. 性能优化建议

### 5.1 资源加载优化

```html
<!-- 关键CSS内联（可选） -->
<style>
    /* 首屏关键样式 */
    body { margin: 0; font-family: system-ui, sans-serif; }
</style>

<!-- 非关键JS延迟加载 -->
<script defer src="js/main.js"></script>

<!-- 预加载重要资源 -->
<link rel="preload" href="/common/css/common.css" as="style">
```

### 5.2 CDN 降级方案

```javascript
// 在<script>标签末尾添加错误检测
window.addEventListener('load', function() {
    if (!window.marked) {
        console.warn('[警告] Marked库未加载，PRD功能将不可用');
    }
    if (!window.mermaid) {
        console.warn('[警告] Mermaid库未加载，图表功能将不可用');
    }
});
```

---

## 📚 相关资源

- **[00-design-tokens.md](00-design-tokens.md)** - 完整设计令牌（**必读**）
- **[01-design-spec.md](01-design-spec.md)** - 设计规范概览
- **[04-javascript.md](04-javascript.md)** - JavaScript交互模板
- **[06-components.md](06-components.md)** - 业务组件库

---

## 🔄 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v2.0.0 | 2026-01-15 | 升级FA4→FA6, marked@4→@9, mermaid@10→@11；移除重复Tailwind配置；增加空状态组件；完善逻辑说明模板；增加FA6迁移指南 |
| v1.0.0 | 2024-XX-XX | 初始版本 |

---

**💡 提示**：创建新页面时，直接复制本文件第1节的完整HTML代码到 `index.html`，然后替换占位符即可快速开始开发。
