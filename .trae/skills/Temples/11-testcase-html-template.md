# 测试用例 HTML 页面模板

本文件包含测试用例展示页面的完整 HTML 模板，与企业级项目风格一致。

## 1. 完整页面结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[模块名称]测试用例 - ELSA</title>
    
    <!-- CDN 资源 -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet" media="print" onload="this.media='all'">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked@4/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    
    <!-- 内联样式 -->
    <style>
        /* 页面样式 */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            background: #f9fafb;
            margin: 0;
            padding: 0;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            background: linear-gradient(135deg, #2a3b7d 0%, #4f46e5 100%);
            color: white;
            padding: 1.5rem 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 600;
        }
        
        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
            font-size: 0.875rem;
        }
        
        /* Test Cases Markdown 渲染样式 */
        .prose { 
            color: #374151; 
            line-height: 1.8; 
            font-size: 0.95rem;
            max-width: 100%;
        }
        .prose h1 { 
            font-size: 2rem; 
            font-weight: 700; 
            color: #1e293b; 
            margin-bottom: 1.5rem; 
            padding-bottom: 1rem; 
            border-bottom: 3px solid #2a3b7d;
            background: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .prose h2 { 
            font-size: 1.4rem; 
            font-weight: 600; 
            color: #2a3b7d; 
            margin: 2.5rem 0 1.2rem; 
            padding: 0.75rem 1rem;
            background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
            border-left: 4px solid #2a3b7d;
            border-radius: 0 8px 8px 0;
        }
        .prose h3 { 
            font-size: 1.15rem; 
            font-weight: 600; 
            color: #475569; 
            margin: 2rem 0 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        .prose h4 { 
            font-size: 1rem; 
            font-weight: 600; 
            color: #2a3b7d; 
            margin: 1.5rem 0 0.5rem; 
        }
        .prose p { margin-bottom: 1rem; color: #4b5563; }
        .prose ul, .prose ol { margin-left: 1.5rem; margin-bottom: 1.2rem; }
        .prose li { margin-bottom: 0.5rem; color: #4b5563; }
        .prose li::marker { color: #2a3b7d; }
        
        /* 增强表格样式 */
        .prose table { 
            width: 100%; 
            border-collapse: separate; 
            border-spacing: 0;
            margin: 1.5rem 0; 
            font-size: 0.85rem; 
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .prose th { 
            padding: 0.875rem 1rem; 
            background: linear-gradient(135deg, #2a3b7d 0%, #4f46e5 100%);
            color: white;
            font-weight: 600;
            text-align: left;
            border: none;
            white-space: nowrap;
        }
        .prose th:first-child { border-top-left-radius: 12px; }
        .prose th:last-child { border-top-right-radius: 12px; }
        .prose td { 
            padding: 0.75rem 1rem; 
            border: none;
            border-bottom: 1px solid #e5e7eb;
            background: white;
        }
        .prose tr:last-child td { border-bottom: none; }
        .prose tr:nth-child(even) td { background: #f9fafb; }
        .prose tr:hover td { background: #f0f4ff; }
        
        /* 代码块样式 */
        .prose pre { 
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
            padding: 1.25rem; 
            border-radius: 12px; 
            font-size: 0.8rem; 
            border: 1px solid #334155;
            overflow-x: auto; 
            margin: 1.5rem 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .prose code { 
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            color: #dc2626;
            padding: 0.2rem 0.4rem; 
            border-radius: 4px; 
            font-size: 0.875em;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        .prose pre code { 
            background: none; 
            padding: 0; 
            color: #e2e8f0;
        }
        .prose blockquote { 
            border-left: 4px solid #2a3b7d; 
            padding: 1rem 1.5rem; 
            margin: 1.5rem 0; 
            color: #64748b;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 0 8px 8px 0;
            font-style: italic;
        }
        .prose strong { 
            color: #1e293b; 
            font-weight: 700;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 0.1rem 0.3rem;
            border-radius: 4px;
        }
        .prose a { 
            color: #2a3b7d; 
            text-decoration: none;
            border-bottom: 1px solid #2a3b7d;
            transition: all 0.2s;
        }
        .prose a:hover { 
            color: #4f46e5;
            border-bottom-color: #4f46e5;
        }
        
        /* 标签样式 */
        .prose .badge { 
            display: inline-block; 
            padding: 0.25rem 0.75rem; 
            border-radius: 9999px; 
            font-size: 0.75rem; 
            font-weight: 600;
            margin: 0.125rem;
        }
        .prose .badge-p0 { 
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); 
            color: #dc2626;
            border: 1px solid #fca5a5;
        }
        .prose .badge-p1 { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            color: #d97706;
            border: 1px solid #fcd34d;
        }
        
        /* 分隔线 */
        .prose hr {
            border: none;
            height: 2px;
            background: linear-gradient(90deg, transparent, #2a3b7d, transparent);
            margin: 2.5rem 0;
        }
        
        /* 目录导航样式 */
        .toc {
            position: sticky;
            top: 100px;
            max-height: calc(100vh - 150px);
            overflow-y: auto;
            padding: 1rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        .toc-title {
            font-weight: 600;
            color: #2a3b7d;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #2a3b7d;
        }
        .toc a {
            display: block;
            padding: 0.375rem 0.5rem;
            color: #6b7280;
            text-decoration: none;
            font-size: 0.875rem;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .toc a:hover {
            background: #f0f4ff;
            color: #2a3b7d;
        }
        .toc-level-2 {
            padding-left: 0;
            font-weight: 500;
            position: relative;
        }
        .toc-level-2::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: #2a3b7d;
            border-radius: 3px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .toc-level-2:hover::before,
        .toc-level-2.active::before {
            opacity: 1;
        }
        .toc-level-3 {
            padding-left: 1.5rem;
            font-size: 0.8rem;
            color: #64748b;
            position: relative;
        }
        .toc-level-3::before {
            content: '';
            position: absolute;
            left: 0.75rem;
            top: 12px;
            width: 4px;
            height: 4px;
            background: #94a3b8;
            border-radius: 50%;
        }
        
        /* 折叠功能样式 */
        .toc-item {
            position: relative;
        }
        .toc-toggle {
            position: absolute;
            left: -1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            border: none;
            background: transparent;
            cursor: pointer;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            transition: transform 0.2s ease;
        }
        .toc-toggle:hover {
            color: #2a3b7d;
        }
        .toc-toggle.collapsed {
            transform: translateY(-50%) rotate(-90deg);
        }
        .toc-children {
            max-height: 500px;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        .toc-children.collapsed {
            max-height: 0;
        }
        
        /* Mermaid图表放大预览样式 */
        .mermaid {
            cursor: zoom-in;
            transition: transform 0.3s ease;
        }
        .mermaid:hover {
            transform: scale(1.02);
        }
        
        /* 放大预览模态框 */
        .mermaid-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 9999;
            justify-content: center;
            align-items: center;
            padding: 20px;
            backdrop-filter: blur(5px);
        }
        .mermaid-modal.active {
            display: flex;
        }
        .mermaid-modal-content {
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 95%;
            max-height: 95%;
            overflow: auto;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: modalZoomIn 0.3s ease-out;
        }
        @keyframes modalZoomIn {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        .mermaid-modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            background: #f3f4f6;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            color: #374151;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        .mermaid-modal-close:hover {
            background: #e5e7eb;
            transform: rotate(90deg);
        }
        .mermaid-modal-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2a3b7d;
            margin-bottom: 20px;
            padding-right: 50px;
        }
        .mermaid-modal-svg {
            min-width: 800px;
        }
        .mermaid-hint {
            position: absolute;
            bottom: 10px;
            right: 15px;
            background: rgba(42, 59, 125, 0.9);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }
        .mermaid-container {
            position: relative;
            display: inline-block;
        }
        .mermaid-container:hover .mermaid-hint {
            opacity: 1;
        }
        
        /* 加载状态 */
        .loading {
            text-align: center;
            padding: 4rem 2rem;
        }
        .loading i {
            font-size: 3rem;
            color: #2a3b7d;
            margin-bottom: 1rem;
        }
        .loading p {
            color: #6b7280;
            font-size: 1rem;
        }
        
        /* 错误状态 */
        .error {
            text-align: center;
            padding: 4rem 2rem;
            color: #dc2626;
        }
        .error i {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
    </style>
    
    <!-- Tailwind 配置 -->
    <script>
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
<body>
    <!-- Header -->
    <div class="header">
        <h1><i class="fa fa-flask mr-2"></i>[模块名称]测试用例</h1>
        <p>版本: V1.0 | 日期: YYYY-MM-DD | 状态: 待评审</p>
    </div>
    
    <!-- 主内容区域 -->
    <div class="container">
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
                    <div id="testcases-content" class="prose max-w-none">
                        <div class="loading">
                            <div class="animate-pulse">
                                <i class="fa fa-spinner fa-spin"></i>
                                <p>正在加载测试用例文档...</p>
                                <button onclick="loadTestCases()" class="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors" style="background: #2a3b7d;">
                                    <i class="fa fa-refresh mr-2"></i>重新加载
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
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
    
    <!-- JavaScript -->
    <script>
        // 加载测试用例Markdown文档
        async function loadTestCases() {
            try {
                const response = await fetch('test-cases.md');
                if (!response.ok) throw new Error('加载失败');
                
                const markdown = await response.text();
                const content = document.getElementById('testcases-content');
                content.innerHTML = marked.parse(markdown);
                
                // 重新渲染Mermaid图表
                setTimeout(function() {
                    mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                }, 100);
                
                // 生成目录
                generateTOC();
            } catch (error) {
                document.getElementById('testcases-content').innerHTML = `
                    <div class="error">
                        <i class="fa fa-exclamation-triangle"></i>
                        <p>加载测试用例文档失败</p>
                        <button onclick="loadTestCases()" class="mt-6 px-6 py-3 bg-primary text-white rounded-lg" style="background: #2a3b7d;">
                            <i class="fa fa-refresh mr-2"></i>重新加载
                        </button>
                    </div>
                `;
            }
        }
        
        // 生成目录导航
        function generateTOC() {
            const content = document.getElementById('testcases-content');
            const headings = content.querySelectorAll('h2, h3');
            const tocNav = document.getElementById('toc-nav');
            let html = '';
            
            headings.forEach((heading, index) => {
                const id = 'heading-' + index;
                heading.id = id;
                
                const level = heading.tagName === 'H2' ? 2 : 3;
                const className = level === 2 ? 'toc-level-2' : 'toc-level-3';
                
                html += `<a href="#${id}" class="${className}">${heading.textContent}</a>`;
            });
            
            tocNav.innerHTML = html;
        }
        
        // Mermaid图表放大预览
        function openMermaidModal(container) {
            const modal = document.getElementById('mermaidModal');
            const content = document.getElementById('mermaidModalContent');
            const svg = container.querySelector('.mermaid').innerHTML;
            content.innerHTML = svg;
            modal.classList.add('active');
        }
        
        function closeMermaidModal(event) {
            if (event && event.target !== event.currentTarget) return;
            document.getElementById('mermaidModal').classList.remove('active');
        }
        
        // 页面加载完成后执行
        document.addEventListener('DOMContentLoaded', function() {
            loadTestCases();
        });
    </script>
</body>
</html>
```

## 2. 使用说明

### 2.1 文件结构

```
[模块名称]/
├── index.html          # 原型页面（包含PRD和测试用例切换）
├── prd.md              # PRD文档
├── test-cases.html     # 测试用例展示页面（使用本模板）
└── test-cases.md       # 测试用例文档
```

### 2.2 快速使用

1. 复制上述完整HTML代码
2. 替换 `[模块名称]` 为实际模块名称
3. 创建 `test-cases.md` 文件并编写测试用例
4. 在浏览器中打开 `test-cases.html`

### 2.3 核心功能

| 功能 | 说明 |
|------|------|
| Markdown渲染 | 自动加载并渲染test-cases.md |
| 目录导航 | 自动生成左侧目录树 |
| 表格样式 | 渐变表头、圆角边框、悬停高亮 |
| Mermaid图表 | 支持流程图点击放大预览 |
| 加载状态 | 显示加载动画和错误提示 |
| 响应式布局 | 适配不同屏幕尺寸 |

## 3. 样式规范

### 3.1 表格样式

- 表头：渐变背景（#2a3b7d → #4f46e5）
- 边框：圆角12px
- 悬停：行背景变为 #f0f4ff
- 斑马纹：偶数行背景 #f9fafb

### 3.2 标题样式

- H1：渐变文字，底部边框
- H2：左侧边框 + 渐变背景
- H3：底部细线边框
- H4：主色文字

### 3.3 目录样式

- sticky定位，跟随滚动
- 层级缩进显示
- 悬停高亮效果
- 支持折叠展开

## 4. 与原型页面集成

如果需要将测试用例集成到原型页面中，可以使用以下切换标签：

```html
<!-- 切换标签 -->
<div class="tabs fixed bottom-8 right-8 z-40">
    <button id="tab-prototype" class="tab active" onclick="switchMainTab('prototype')">原型</button>
    <button id="tab-prd" class="tab" onclick="switchMainTab('prd')">PRD</button>
    <button id="tab-testcases" class="tab" onclick="switchMainTab('testcases')">测试用例</button>
</div>
```

```javascript
function switchMainTab(tab) {
    // 切换标签激活状态
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    
    // 切换内容区域
    document.querySelectorAll('.main-content').forEach(c => c.style.display = 'none');
    document.getElementById('main-' + tab).style.display = 'block';
}
```
