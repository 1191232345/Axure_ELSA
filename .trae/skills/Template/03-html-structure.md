# HTML 页面结构模板

本文件包含TOB产品的完整 HTML 页面结构模板，采用模块化文件结构，便于维护。

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
    
    <!-- CDN 资源 -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet" media="print" onload="this.media='all'">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked@4/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    
    <!-- 公共样式 -->
    <link rel="stylesheet" href="/common/css/common.css">
    <!-- 模块样式 -->
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- Tailwind 配置 -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#2a3b7d',
                        'primary-light': '#3a4ca7',
                        secondary: '#36CFC9',
                        accent: '#722ED1',
                        success: '#00B42A',
                        warning: '#FF7D00',
                        danger: '#F53F3F',
                        dark: '#1D2129',
                        'light-bg': '#FFFFFF',
                        'card-bg': '#FFFFFF',
                        border: '#E5E7EB'
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
        
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            logLevel: 3
        });
        
        const DATA_CONFIG = {
            pageId: '[page_id]',
            dataFile: '[模块目录]/data/[page_id]-data.json',
            apiBase: 'http://localhost:3100/api/data',
            version: '1.0.0'
        };
        
        const renderer = new marked.Renderer();
        renderer.code = function(code, language) {
            if (language === 'mermaid') {
                return '<div class="mermaid-container" onclick="openMermaidModal(this)"><div class="mermaid">' + code + '</div><span class="mermaid-hint"><i class="fa fa-search-plus mr-1"></i>点击放大</span></div>';
            }
            return '<pre><code class="language-' + language + '">' + code + '</code></pre>';
        };
        marked.setOptions({ renderer: renderer, breaks: true, gfm: true });
    </script>
</head>
<body class="font-sans bg-gray-50 text-neutral-800 min-h-screen">
    <!-- 切换标签 -->
    <div class="tabs fixed bottom-8 right-8 z-40">
        <button id="tab-prototype" class="tab active" onclick="switchMainTab('prototype')">原型</button>
        <button id="tab-prd" class="tab" onclick="switchMainTab('prd')">PRD</button>
        <button id="tab-testcases" class="tab" onclick="switchMainTab('testcases')">测试用例</button>
    </div>
    
    <!-- Header 导航 -->
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
                        <div class="toc-title"><i class="fa fa-list-alt mr-2"></i>目录导航</div>
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
    
    <!-- Mermaid 模态框 -->
    <div id="mermaidModal" class="mermaid-modal" onclick="closeMermaidModal(event)">
        <div class="mermaid-modal-content" onclick="event.stopPropagation()">
            <button class="mermaid-modal-close" onclick="closeMermaidModal()"><i class="fa fa-times"></i></button>
            <div class="mermaid-modal-title"><i class="fa fa-sitemap mr-2"></i>流程图预览</div>
            <div id="mermaidModalContent" class="mermaid-modal-svg"></div>
        </div>
    </div>
    
    <!-- 测试用例区域 -->
    <main id="main-testcases" class="main-content" style="display: none;"></main>
    
    <!-- 原型页面 -->
    <main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-2 py-6">
            <!-- 搜索卡片 -->
            <div class="bg-white rounded shadow-card p-4 mb-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div class="flex items-center w-full sm:w-auto">
                        <label class="text-xs text-neutral-600 mr-2">状态</label>
                        <select id="filterStatus" class="w-full sm:w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary outline-none">
                            <option value="">全部</option>
                            <option value="active">启用</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
                        <button class="erp-btn erp-btn-secondary" onclick="handleReset()">
                            <i class="fa fa-refresh mr-1.5"></i> 重置
                        </button>
                        <button class="erp-btn erp-btn-primary" onclick="handleSearch()">
                            <i class="fa fa-search mr-1.5"></i> 搜索
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 操作卡片 -->
            <div class="bg-white rounded shadow-card p-4 mb-4">
                <div class="flex justify-start gap-3">
                    <button class="erp-btn erp-btn-primary" onclick="openAddModal()">
                        <i class="fa fa-plus mr-1.5"></i> 新增
                    </button>
                    <button class="erp-btn erp-btn-secondary" onclick="handleExport()">
                        <i class="fa fa-upload mr-1.5"></i> 导出
                    </button>
                    <button class="erp-btn erp-btn-danger batch-btn" disabled onclick="handleBatchDelete()">
                        <i class="fa fa-trash mr-1.5"></i> 批量删除
                    </button>
                </div>
            </div>
            
            <!-- 数据表格 -->
            <div class="bg-white rounded shadow-card overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-neutral-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left">
                                    <input type="checkbox" id="selectAll" onchange="handleSelectAll()">
                                </th>
                                <th class="px-4 py-3 text-left font-medium">序号</th>
                                <th class="px-4 py-3 text-left font-medium">名称</th>
                                <th class="px-4 py-3 text-left font-medium">状态</th>
                                <th class="px-4 py-3 text-left font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody" class="divide-y divide-neutral-100"></tbody>
                    </table>
                </div>
            </div>
            
            <!-- 分页 -->
            <div class="flex justify-between items-center mt-4">
                <div class="text-sm text-gray-500">
                    共 <span id="totalCount">0</span> 条记录
                </div>
                <div id="pagination" class="flex gap-1"></div>
            </div>
            
            <!-- 逻辑说明 -->
            <div class="bg-white rounded shadow-card mt-4 overflow-hidden">
                <div class="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center cursor-pointer" onclick="toggleLogic()">
                    <div class="flex items-center">
                        <i class="fa fa-book text-primary mr-2"></i>
                        <span class="font-semibold text-primary">逻辑说明</span>
                    </div>
                    <i class="fa fa-chevron-down text-primary transition-transform" id="logicIcon"></i>
                </div>
                <div id="logicContent" class="hidden p-4">
                    <p class="text-gray-600">在此添加逻辑说明...</p>
                </div>
            </div>
        </div>
    </main>
    
    <!-- 新增/编辑模态框 -->
    <div id="formModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">新增</h3>
                <button class="modal-close" onclick="closeModal()"><i class="fa fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="dataForm">
                    <input type="hidden" id="editId">
                    <div class="form-group">
                        <label class="form-label">名称 <span class="text-danger">*</span></label>
                        <input type="text" id="formName" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">状态</label>
                        <select id="formStatus" class="form-input">
                            <option value="active">启用</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="erp-btn erp-btn-secondary" onclick="closeModal()">取消</button>
                <button class="erp-btn erp-btn-primary" onclick="handleSave()">保存</button>
            </div>
        </div>
    </div>
    
    <!-- 公共JS -->
    <script src="/common/js/common.js"></script>
    <!-- 模块JS -->
    <script src="js/main.js"></script>
</body>
</html>
```

## 2. 页面布局规范

```
┌─────────────────────────────────────────┐
│ 搜索卡片（筛选条件 + 搜索/重置按钮）      │
├─────────────────────────────────────────┤
│ 操作卡片（新增、导出、批量操作等按钮）    │
├─────────────────────────────────────────┤
│ 数据表格                                 │
├─────────────────────────────────────────┤
│ 分页                                     │
├─────────────────────────────────────────┤
│ 逻辑说明（可折叠）                        │
└─────────────────────────────────────────┘
```

## 3. 按钮位置规则

| 按钮类型 | 位置 | 样式 |
|----------|------|------|
| 搜索 | 搜索卡片右侧 | 主按钮 |
| 重置 | 搜索卡片右侧 | 次要按钮 |
| 新增 | 操作卡片左侧 | 主按钮 |
| 导出 | 操作卡片左侧 | 次要按钮 |
| 批量删除 | 操作卡片左侧 | 危险按钮 |
