# HTML 页面结构模板

本文件包含TOB产品的完整 HTML 页面结构模板。

## 0. 页面结构概述

每个页面包含三个tab页：
- **原型tab**：包含页面原型UI和逻辑说明
- **PRD tab**：包含产品需求文档
- **测试用例tab**：包含测试用例文档

**重要：逻辑说明应放置在原型tab页下，而不是PRD或测试用例tab页。**

```
页面结构
├── Tab导航（原型 | PRD | 测试用例）
├── 原型tab内容
│   ├── 搜索卡片
│   ├── 操作卡片
│   ├── 数据表格
│   └── 逻辑说明 ← 放置在这里
├── PRD tab内容
└── 测试用例tab内容
```

## 1. 完整页面结构

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
    
    <!-- 内联样式 -->
    <style>
        /* [在此插入完整的CSS样式模板] */
    </style>
    
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
        }
        
        // 初始化Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            logLevel: 3
        });
        
        // 配置Marked
        const renderer = new marked.Renderer();
        renderer.code = function(code, language) {
            if (language === 'mermaid') {
                return `<div class="mermaid-container" onclick="openMermaidModal(this)">
                    <div class="mermaid">${code}</div>
                    <span class="mermaid-hint"><i class="fa fa-search-plus mr-1"></i>点击放大</span>
                </div>`;
            }
            return `<pre><code class="language-${language}">${code}</code></pre>`;
        };
        
        marked.setOptions({
            renderer: renderer,
            breaks: true,
            gfm: true
        });
    </script>
</head>
<body class="font-sans bg-gray-50 text-neutral-800 min-h-screen">
    <!-- 切换标签 - 固定在右下角 -->
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
                    <div class="flex-shrink-0 flex items-center">
                        <span class="text-lg font-semibold">ELSA</span>
                    </div>
                    <nav class="hidden md:ml-10 md:flex md:space-x-6">
                        <!-- 导航菜单项 -->
                    </nav>
                </div>
                <div class="flex items-center space-x-4">
                    <!-- 用户信息 -->
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
                        <div class="toc-title">
                            <i class="fa fa-list-alt mr-2"></i>目录导航
                        </div>
                        <div id="toc-nav"></div>
                    </div>
                </aside>
                <div class="flex-1 min-w-0">
                    <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
                        <div id="prd-content" class="prose max-w-none">
                            <!-- PRD 内容 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Mermaid 图表放大预览模态框 -->
    <div id="mermaidModal" class="mermaid-modal" onclick="closeMermaidModal(event)">
        <div class="mermaid-modal-content" onclick="event.stopPropagation()">
            <button class="mermaid-modal-close" onclick="closeMermaidModal()">
                <i class="fa fa-times"></i>
            </button>
            <div class="mermaid-modal-title">
                <i class="fa fa-sitemap mr-2"></i>流程图预览
            </div>
            <div id="mermaidModalContent" class="mermaid-modal-svg"></div>
        </div>
    </div>
    
    <!-- 测试用例内容区域 -->
    <main id="main-testcases" class="main-content" style="display: none;">
        <!-- 同 PRD 结构 -->
    </main>
    
    <!-- 原型页面 -->
    <main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-2 py-6">
            <!-- 原型内容 -->
        </div>
    </main>
    
    <!-- JavaScript -->
    <script>
        // [在此插入完整的JS交互模板]
    </script>
</body>
</html>
```

## 2. Header 导航结构

```html
<header class="bg-primary text-white shadow-header sticky top-0 z-50">
    <div class="container mx-auto px-2 sm:px-3 lg:px-4">
        <div class="flex justify-between items-center h-14">
            <div class="flex items-center">
                <div class="flex-shrink-0 flex items-center">
                    <span class="text-lg font-semibold">ELSA</span>
                </div>
                <nav class="hidden md:ml-10 md:flex md:space-x-6">
                    <!-- 带下拉菜单的导航项 -->
                    <div class="relative group">
                        <a href="javascript:void(0)" class="px-3 py-2 text-sm hover:bg-primary/80 transition-colors flex items-center">
                            菜单名称
                            <i class="fa fa-angle-down ml-1 text-xs"></i>
                        </a>
                        <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <a href="javascript:void(0)" class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100" data-page="page1">子菜单1</a>
                            <a href="javascript:void(0)" class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100" data-page="page2">子菜单2</a>
                        </div>
                    </div>
                </nav>
            </div>
            <div class="flex items-center space-x-4">
                <div class="relative">
                    <button class="p-1.5 rounded hover:bg-primary/80 transition-colors">
                        <i class="fa fa-bell-o"></i>
                        <span class="absolute top-0 right-0 w-2 h-2 bg-warning rounded-full"></span>
                    </button>
                </div>
                <div class="flex items-center">
                    <span class="ml-2 text-sm hidden sm:inline-block">用户名</span>
                    <i class="fa fa-angle-down ml-1 text-xs"></i>
                </div>
            </div>
        </div>
    </div>
</header>
```

## 3. 原型页面结构

### 3.1 页面布局规范（重要）

原型页面采用**搜索卡片 + 操作卡片 + 数据表格**的三段式布局：

```
┌─────────────────────────────────────────┐
│ 搜索卡片（筛选条件 + 搜索/重置按钮）      │
├─────────────────────────────────────────┤
│ 操作卡片（新增、导出、批量操作等按钮）    │
├─────────────────────────────────────────┤
│ 数据表格                                 │
├─────────────────────────────────────────┤
│ 逻辑说明（可折叠）                        │
└─────────────────────────────────────────┘
```

### 3.2 完整页面结构

```html
<!-- 原型页面 -->
<main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
    <div class="container mx-auto px-2 py-6">
        <!-- 页面内容区域 -->
        <div id="page-[页面标识]" class="page active">
            
            <!-- 搜索卡片：只包含筛选条件和搜索/重置按钮 -->
            <div class="bg-white rounded shadow-card p-4 mb-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <!-- 筛选条件 -->
                    <div class="flex items-center w-full sm:w-auto">
                        <label class="text-xs text-neutral-600 mr-2">状态</label>
                        <select class="w-full sm:w-48 pl-3 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                            <option value="all">全部</option>
                            <option value="active">启用</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                    <!-- 更多筛选条件... -->
                    
                    <!-- 搜索/重置按钮：放在搜索卡片右侧 -->
                    <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
                        <button class="erp-btn erp-btn-secondary flex items-center justify-center flex-1 sm:flex-none">
                            <i class="fa fa-refresh mr-1.5"></i> 重置
                        </button>
                        <button class="erp-btn erp-btn-primary flex items-center justify-center flex-1 sm:flex-none">
                            <i class="fa fa-search mr-1.5"></i> 搜索
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 操作卡片：单独放置，包含主操作按钮 -->
            <div class="bg-white rounded shadow-card p-4 mb-4">
                <div class="flex justify-start gap-3">
                    <button class="erp-btn erp-btn-primary">
                        <i class="fa fa-plus mr-1.5"></i> 新增
                    </button>
                    <button class="erp-btn erp-btn-secondary">
                        <i class="fa fa-upload mr-1.5"></i> 导出
                    </button>
                    <button class="erp-btn erp-btn-danger batch-btn" disabled>
                        <i class="fa fa-trash mr-1.5"></i> 批量删除
                    </button>
                </div>
            </div>
            
            <!-- 数据表格区域 -->
            <div class="bg-white rounded shadow-card overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-neutral-200 text-sm table-auto">
                        <!-- 表格内容 -->
                    </table>
                </div>
            </div>
            
            <!-- 逻辑说明区域 -->
            <div class="bg-white rounded shadow-card mt-4 overflow-hidden">
                <!-- 逻辑说明内容 -->
            </div>
        </div>
    </div>
</main>
```

### 3.3 按钮位置规则

| 按钮类型 | 位置 | 样式 | 说明 |
|----------|------|------|------|
| 搜索 | 搜索卡片右侧 | 主按钮 | 筛选数据 |
| 重置 | 搜索卡片右侧 | 次要按钮 | 清空筛选条件 |
| 新增 | 操作卡片左侧 | 主按钮 | 主操作按钮 |
| 导出 | 操作卡片左侧 | 次要按钮 | 次要操作 |
| 批量删除 | 操作卡片左侧 | 危险按钮 | 需选中数据后启用 |
| 导入 | 操作卡片左侧 | 次要按钮 | 次要操作 |

### 3.4 搜索卡片详解

```html
<!-- 搜索卡片：只包含筛选条件和搜索/重置按钮 -->
<div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <!-- 下拉筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">状态</label>
            <select class="w-full sm:w-48 pl-3 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="all">全部</option>
            </select>
        </div>
        
        <!-- 文本筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">关键词</label>
            <input type="text" class="w-full sm:w-48 pl-3 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="请输入">
        </div>
        
        <!-- 日期筛选 -->
        <div class="flex items-center w-full sm:w-auto">
            <label class="text-xs text-neutral-600 mr-2">日期</label>
            <input type="date" class="w-full sm:w-48 pl-3 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
        </div>
        
        <!-- 搜索/重置按钮：放在最右侧 -->
        <div class="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <button class="erp-btn erp-btn-secondary flex items-center justify-center flex-1 sm:flex-none">
                <i class="fa fa-refresh mr-1.5"></i> 重置
            </button>
            <button class="erp-btn erp-btn-primary flex items-center justify-center flex-1 sm:flex-none">
                <i class="fa fa-search mr-1.5"></i> 搜索
            </button>
        </div>
    </div>
</div>
```

### 3.5 操作卡片详解

```html
<!-- 操作卡片：单独放置，包含主操作按钮 -->
<div class="bg-white rounded shadow-card p-4 mb-4">
    <div class="flex justify-start gap-3">
        <!-- 主操作按钮 -->
        <button class="erp-btn erp-btn-primary" onclick="openAddModal()">
            <i class="fa fa-plus mr-1.5"></i> 新增
        </button>
        
        <!-- 次要操作按钮 -->
        <button class="erp-btn erp-btn-secondary">
            <i class="fa fa-upload mr-1.5"></i> 导出
        </button>
        
        <button class="erp-btn erp-btn-secondary">
            <i class="fa fa-download mr-1.5"></i> 导入
        </button>
        
        <!-- 批量操作按钮（默认禁用） -->
        <button class="erp-btn erp-btn-danger batch-btn" disabled>
            <i class="fa fa-trash mr-1.5"></i> 批量删除
        </button>
    </div>
</div>
```

## 4. PRD/测试用例页面结构

```html
<!-- PRD 内容区域 -->
<main id="main-prd" class="main-content" style="display: none;">
    <div class="container mx-auto px-4 py-8">
        <div class="flex gap-6">
            <!-- 左侧目录 -->
            <aside class="w-64 flex-shrink-0 hidden lg:block">
                <div class="toc sticky top-4">
                    <div class="toc-title">
                        <i class="fa fa-list-alt mr-2"></i>目录导航
                    </div>
                    <div id="toc-nav"></div>
                </div>
            </aside>
            <!-- 右侧内容 -->
            <div class="flex-1 min-w-0">
                <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
                    <div id="prd-content" class="prose max-w-none">
                        <div class="text-center py-16">
                            <div class="animate-pulse">
                                <i class="fa fa-spinner fa-spin text-5xl text-primary mb-4"></i>
                                <p class="text-lg text-gray-500">正在加载PRD文档...</p>
                                <button onclick="loadPRD()" class="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
                                    <i class="fa fa-refresh mr-2"></i>手动加载PRD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
```

## 5. 切换标签结构

```html
<!-- 切换标签 - 固定在右下角 -->
<div class="tabs fixed bottom-8 right-8 z-40">
    <button id="tab-prototype" class="tab active" onclick="switchMainTab('prototype')">原型</button>
    <button id="tab-prd" class="tab" onclick="switchMainTab('prd')">PRD</button>
    <button id="tab-testcases" class="tab" onclick="switchMainTab('testcases')">测试用例</button>
</div>
```

## 6. Mermaid 模态框结构

```html
<!-- Mermaid图表放大预览模态框 -->
<div id="mermaidModal" class="mermaid-modal" onclick="closeMermaidModal(event)">
    <div class="mermaid-modal-content" onclick="event.stopPropagation()">
        <button class="mermaid-modal-close" onclick="closeMermaidModal()">
            <i class="fa fa-times"></i>
        </button>
        <div class="mermaid-modal-title">
            <i class="fa fa-sitemap mr-2"></i>流程图预览
        </div>
        <div id="mermaidModalContent" class="mermaid-modal-svg"></div>
    </div>
</div>
```
