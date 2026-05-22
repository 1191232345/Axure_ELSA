# 测试用例 HTML 页面模板（精简版）

> **⚠️ 本模板已精简，样式依赖公共资源。**
> - **.prose 样式**：已统一至 [16-common-css.md §14](16-common-css.md)（common.css）
> - **Mermaid/TOC 样式**：已统一至 [16-common-css.md](16-common-css.md)（common.css）
> - **JS 函数**：已统一至 [17-common-js.md](17-common-js.md)（common.js）
> - **推荐**：测试用例已集成到主 index.html 的 tab 切换中，独立页面模板仅在特殊场景使用

本文件包含测试用例展示页面的完整 HTML 模板，与企业级项目风格一致。

## 1. 完整页面结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[模块名称]测试用例 - ELSA</title>
    
    <!-- CDN 资源（v2.1 统一版本） -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" media="print" onload="this.media='all'">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked@9/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
    
    <!-- 公共样式（含 .prose 增强版） -->
    <link rel="stylesheet" href="/common/css/common.css">
    
    <!-- 内联样式（仅页面特有样式） -->
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
        
        /* .prose 样式已统一至 common.css（16-common-css.md §14），此处不再重复定义 */
        
        /* 目录导航样式 - 已统一至 common.css */
        
        /* Mermaid图表放大预览样式 - 已统一至 common.css */
        
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
