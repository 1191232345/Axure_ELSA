# HTML 模板规范

所有 HTML 模板统一定义在此文件，包含页面结构、Head 配置、原型页面、模态框、筛选器、树形表格、逻辑说明区域。

---

## 1. 文件结构与 Head 配置

### 文件结构

```
[模块目录]/
├── index.html
├── css/styles.css
├── js/main.js
├── data/[page_id]-data.json
├── prd.md
└── test-cases.md

公共资源（项目根目录）/
├── common/css/common.css
└── common/js/common.js
```

### CDN 依赖

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11.6.3/dist/mermaid.min.js"></script>
<link rel="stylesheet" href="/common/css/common.css">
<link rel="stylesheet" href="css/styles.css">
```

### Tailwind + Mermaid + DATA_CONFIG

```html
<script>
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#2a3b7d', light: '#3a4ca7', dark: '#1e2d5f' },
                success: { DEFAULT: '#00B42A', bg: '#E8FFEC', text: '#006B19' },
                warning: { DEFAULT: '#FF7D00', bg: '#FFF7E8', text: '#994D00' },
                danger: { DEFAULT: '#F53F3F', bg: '#FFECE8', text: '#B3261E' },
                info: { DEFAULT: '#1677FF', bg: '#E8F3FF', text: '#094D8C' }
            }
        }
    }
};

mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });

const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: '[模块目录]/data/[page_id]-data.json',
    version: '2.0.0'
};
</script>
```

### Marked 渲染器

```javascript
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
    if (language === 'mermaid') {
        return '<div class="mermaid-container" onclick="openMermaidModal(this)">' +
               '<div class="mermaid">' + code + '</div>' +
               '<span class="mermaid-hint"><i class="fas fa-magnifying-glass-plus mr-1"></i>点击放大</span></div>';
    }
    return '<pre><code class="language-' + (language || '') + '">' +
           code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>';
};
marked.setOptions({ renderer, breaks: true, gfm: true });
```

---

## 2. 页面骨架

Header + Tab切换 + PRD区域 + Mermaid模态框 + 测试用例区域。

```html
<body class="font-sans bg-gray-50 text-neutral-800 min-h-screen">
    <!-- 切换标签（固定右下角） -->
    <div class="tabs fixed bottom-8 right-8 z-40">
        <button id="tab-prototype" class="tab active" onclick="switchMainTab('prototype')">原型</button>
        <button id="tab-prd" class="tab" onclick="switchMainTab('prd')">PRD</button>
        <button id="tab-testcases" class="tab" onclick="switchMainTab('testcases')">测试用例</button>
    </div>

    <!-- Header -->
    <header class="bg-primary text-white shadow-header sticky top-0 z-50">
        <div class="container mx-auto px-2 sm:px-3 lg:px-4">
            <div class="flex justify-between items-center h-14">
                <span class="text-lg font-semibold">ELSA</span>
            </div>
        </div>
    </header>

    <!-- PRD 区域 -->
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

    <!-- Mermaid 放大模态框 -->
    <div id="mermaidModal" class="mermaid-modal" onclick="closeMermaidModal(event)">
        <div class="mermaid-modal-content" onclick="event.stopPropagation()">
            <button class="mermaid-modal-close" onclick="closeMermaidModal()"><i class="fas fa-xmark"></i></button>
            <div class="mermaid-modal-title"><i class="fas fa-diagram-project mr-2"></i>流程图预览</div>
            <div id="mermaidModalContent" class="mermaid-modal-svg"></div>
        </div>
    </div>

    <!-- 测试用例区域 -->
    <main id="main-testcases" class="main-content" style="display: none;"></main>

    <!-- 原型主内容区（见第3节） -->
    <main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
        <!-- 见第3节 -->
    </main>

    <script src="/common/js/common.js"></script>
    <script src="js/main.js"></script>
</body>
```

---

## 3. 原型页面

搜索卡片 + 操作卡片 + 数据表格 + 分页。

```html
<main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
<div class="container mx-auto px-2 py-6">

    <!-- 搜索卡片 -->
    <div class="bg-white rounded shadow-card p-4 mb-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div class="flex items-center w-full sm:w-auto">
                <label class="text-xs text-neutral-600 mr-2">状态</label>
                <select id="filterStatus" class="w-full sm:w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">全部</option>
                    <option value="active">启用</option>
                    <option value="inactive">禁用</option>
                </select>
            </div>
            <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
                <button class="erp-btn erp-btn-secondary" onclick="handleReset()"><i class="fas fa-rotate-right mr-1.5"></i> 重置</button>
                <button class="erp-btn erp-btn-primary" onclick="handleSearch()"><i class="fas fa-search mr-1.5"></i> 搜索</button>
            </div>
        </div>
    </div>

    <!-- 操作卡片 -->
    <div class="bg-white rounded shadow-card p-4 mb-4">
        <div class="flex justify-start gap-3 flex-wrap">
            <button class="erp-btn erp-btn-primary" onclick="openAddModal()"><i class="fas fa-plus mr-1.5"></i> 新增</button>
            <button class="erp-btn erp-btn-secondary" onclick="handleExport()"><i class="fas fa-upload mr-1.5"></i> 导出</button>
            <button class="erp-btn erp-btn-danger batch-btn" disabled onclick="handleBatchDelete()"><i class="fas fa-trash-can mr-1.5"></i> 批量删除</button>
        </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white rounded shadow-card overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-neutral-200 text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left"><input type="checkbox" id="selectAll" onchange="handleSelectAll()" class="w-4 h-4 text-primary border-gray-300 rounded"></th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">序号</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">名称</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">状态</th>
                        <th class="px-4 py-3 text-left font-medium text-gray-700">操作</th>
                    </tr>
                </thead>
                <tbody id="tableBody" class="divide-y divide-neutral-100"></tbody>
            </table>
        </div>
        <div id="emptyState" class="hidden text-center py-12">
            <i class="fas fa-inbox text-6xl text-neutral-300 mb-4"></i>
            <h3 class="text-lg font-medium text-neutral-500 mb-2">暂无数据</h3>
            <button class="erp-btn erp-btn-primary" onclick="openAddModal()"><i class="fas fa-plus mr-1.5"></i> 立即添加</button>
        </div>
    </div>

    <!-- 分页 -->
    <div class="flex justify-between items-center mt-4">
        <div class="text-sm text-gray-500">共 <span id="totalCount" class="font-medium text-gray-700">0</span> 条</div>
        <div id="pagination" class="flex gap-1"></div>
    </div>

</div>
</main>
```

---

## 4. 模态框

### 表单模态框

```html
<div id="addModal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title" id="modalTitle">新增</h3>
            <button class="modal-close" onclick="closeModal('addModal')"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">名称 <span class="required">*</span></label>
                <input type="text" id="formName" class="form-input" placeholder="请输入名称">
            </div>
            <div class="form-group">
                <label class="form-label">状态</label>
                <select id="formStatus" class="form-select">
                    <option value="active">启用</option>
                    <option value="inactive">禁用</option>
                </select>
            </div>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('addModal')">取消</button>
            <button class="erp-btn erp-btn-primary" onclick="handleSave()">确定</button>
        </div>
    </div>
</div>
```

### 确认删除对话框

```html
<div id="deleteModal" class="modal-overlay">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h3 class="modal-title">确认删除</h3>
            <button class="modal-close" onclick="closeModal('deleteModal')"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="flex items-start gap-3">
                <i class="fas fa-triangle-exclamation text-warning text-xl mt-0.5"></i>
                <p class="text-gray-600">确定要删除选中的数据吗？此操作不可恢复。</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('deleteModal')">取消</button>
            <button class="erp-btn erp-btn-danger" onclick="confirmDelete()">确认删除</button>
        </div>
    </div>
</div>
```

---

## 5. 筛选器

### 基础筛选器

```html
<div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <!-- 文本输入筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">[字段名称]</label>
            <div class="relative flex-1 sm:w-64">
                <input type="text" placeholder="请输入..." class="w-full pl-7 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
            </div>
        </div>
        <!-- 下拉选择筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">[字段名称]</label>
            <select class="flex-1 sm:w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                <option value="">全部</option>
                <option value="1">选项1</option>
            </select>
        </div>
        <!-- 日期范围筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">日期范围</label>
            <div class="flex items-center gap-2">
                <input type="date" class="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <span class="text-neutral-400">至</span>
                <input type="date" class="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            </div>
        </div>
        <!-- 操作按钮 -->
        <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <button class="erp-btn erp-btn-secondary"><i class="fa fa-refresh mr-1.5"></i> 重置</button>
            <button class="erp-btn erp-btn-primary"><i class="fa fa-search mr-1.5"></i> 搜索</button>
        </div>
    </div>
</div>
```

### 高级筛选器（可折叠）

```html
<div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-700">筛选条件</span>
        <button class="text-xs text-primary hover:text-primary-light" onclick="toggleAdvancedFilter()">
            <i class="fa fa-chevron-down mr-1" id="filter-toggle-icon"></i>展开/收起
        </button>
    </div>
    <div class="flex flex-wrap gap-3"><!-- 基础筛选项 --></div>
    <div id="advanced-filter" class="hidden mt-4 pt-4 border-t border-gray-100">
        <div class="flex flex-wrap gap-3"><!-- 更多筛选项 --></div>
    </div>
</div>
```

```javascript
function toggleAdvancedFilter() {
    const filter = document.getElementById('advanced-filter');
    const icon = document.getElementById('filter-toggle-icon');
    filter.classList.toggle('hidden');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}
```

---

## 6. 树形表格

```html
<div class="bg-white rounded shadow-card overflow-hidden">
    <table class="min-w-full">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
            <!-- 父级节点 -->
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <button class="mr-2 text-gray-400 hover:text-gray-600" onclick="toggleTreeNode(this)">
                            <i class="fa fa-caret-right"></i>
                        </button>
                        <i class="fa fa-folder text-yellow-500 mr-2"></i>
                        <span class="font-medium">父级节点</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">文件夹</td>
                <td class="px-4 py-3"><span class="status-badge bg-green-100 text-green-700">启用</span></td>
                <td class="px-4 py-3 text-sm">
                    <button class="table-btn text-primary mr-2">编辑</button>
                    <button class="table-btn text-danger">删除</button>
                </td>
            </tr>
            <!-- 子级节点（默认隐藏） -->
            <tr class="hover:bg-gray-50 hidden tree-child">
                <td class="px-4 py-3">
                    <div class="flex items-center pl-8">
                        <i class="fa fa-file text-blue-500 mr-2"></i>
                        <span>子级节点</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">文件</td>
                <td class="px-4 py-3"><span class="status-badge bg-green-100 text-green-700">启用</span></td>
                <td class="px-4 py-3 text-sm">
                    <button class="table-btn text-primary mr-2">编辑</button>
                    <button class="table-btn text-danger">删除</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

```javascript
function toggleTreeNode(btn) {
    var icon = btn.querySelector('i');
    var row = btn.closest('tr');
    var nextRows = row.nextElementSibling;
    if (icon.classList.contains('fa-caret-right')) {
        icon.classList.remove('fa-caret-right');
        icon.classList.add('fa-caret-down');
        if (nextRows && nextRows.classList.contains('tree-child')) nextRows.classList.remove('hidden');
    } else {
        icon.classList.remove('fa-caret-down');
        icon.classList.add('fa-caret-right');
        if (nextRows && nextRows.classList.contains('tree-child')) nextRows.classList.add('hidden');
    }
}
```

---

## 7. 逻辑说明区域

可折叠的逻辑说明区域，放置在原型tab页数据表格下方。

```html
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
        <div class="space-y-6">
            <!-- 初始化页面 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-play-circle text-primary mr-2"></i>初始化页面
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">数据项</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">取值规则</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">展示规则</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="3">待补充...</td></tr></tbody>
                </table>
            </section>
            <!-- 检索条件 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-filter text-primary mr-2"></i>检索条件
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">筛选项</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">输入方式</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">查询逻辑</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="3">待补充...</td></tr></tbody>
                </table>
            </section>
            <!-- 按钮逻辑 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-hand-pointer text-primary mr-2"></i>按钮逻辑
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">按钮</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">触发动作</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">前置条件</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">后续操作</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="4">待补充...</td></tr></tbody>
                </table>
            </section>
            <!-- 属性取值逻辑 -->
            <section>
                <h4 class="font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-list-alt text-primary mr-2"></i>属性取值逻辑
                </h4>
                <table class="w-full text-sm border border-neutral-200">
                    <thead class="bg-neutral-50"><tr>
                        <th class="border border-neutral-200 px-3 py-2 text-left">字段</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">说明</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">数据来源</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">取值规则</th>
                        <th class="border border-neutral-200 px-3 py-2 text-left">存储类型</th>
                    </tr></thead>
                    <tbody><tr><td class="border border-neutral-200 px-3 py-2" colspan="5">待补充...</td></tr></tbody>
                </table>
            </section>
        </div>
    </div>
</div>
```
