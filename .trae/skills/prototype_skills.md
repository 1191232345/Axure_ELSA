---
name: "prototypeskills"
description: "Generate standardized HTML prototypes for virtual warehouse modules including interactive interfaces, tab switching, and integrated Markdown rendering. Supports rapid creation of consistent system components with proper UI structure."
---

# 原型设计技能

This skill generates standardized HTML prototypes for virtual warehouse modules based on the standard template. It creates interactive interfaces with tab switching, Markdown rendering, and Mermaid chart support, ensuring consistency across system components.

## When to Use

Invoke this skill when:
- User needs to create interactive HTML prototypes for virtual warehouse modules
- User wants to generate standardized UI components with proper structure
- User needs to maintain consistency across multiple prototype interfaces
- User wants to accelerate the development of new feature interfaces
- User needs to ensure proper UI structure for system components

## Prototype Structure

### Directory Structure

```
<Module Name>/
├── index.html          # HTML prototype implementation
├── prd.md              # Product Requirements Document
├── test-cases.md       # Test cases documentation
└── prompt.md           # AI prompt (optional)
```

### Prototype Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Tab Switching** | Switch between prototype, PRD, and test cases | JavaScript tab switching |
| **Markdown Rendering** | Render PRD and test cases from Markdown files | Marked.js integration |
| **Mermaid Charts** | Render flowcharts and diagrams | Mermaid.js integration |
| **Responsive Design** | Adapt to different screen sizes | Tailwind CSS responsive classes |
| **Interactive Elements** | Forms, buttons, tables, modals | Tailwind CSS components |
| **Navigation** | Top navigation bar with menu items | Fixed header navigation |

## Prototype Implementation

### HTML Structure

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <style>
        .main-content { display: none; }
        .main-content.active { display: block; }
        .tab-btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        .tab-btn.active { background: #2a3b7d; color: white; }
        .tab-btn:not(.active) { background: #f3f4f6; color: #374151; }
        .tab-btn:hover { opacity: 0.9; }
        
        /* PRD Markdown 渲染样式 */
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
        .prose .badge-p2 { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
            color: #2563eb;
            border: 1px solid #93c5fd;
        }
        .prose .badge-p3 { 
            background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); 
            color: #0d9488;
            border: 1px solid #5eead4;
        }
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

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{Module Name}} Prototype</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet" media="print" onload="this.media='all'">
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Markdown 解析库 -->
    <script src="https://cdn.jsdelivr.net/npm/marked@4/marked.min.js"></script>
    <!-- Mermaid 图表库 -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
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
                    fontFamily: {
                        inter: ['Inter', 'system-ui', 'sans-serif'],
                    },
                    boxShadow: {
                        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
                        'card-hover': '0 10px 25px -5px rgba(42, 59, 125, 0.1)',
                        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.1)',
                        'header': '0 2px 4px rgba(0, 0, 0, 0.05)'
                    },
                    transitionTimingFunction: {
                        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                },
            }
        }
    </script>
    <style type="text/tailwindcss">
        @layer utilities {
            .content-auto {
                content-visibility: auto;
            }
            .text-shadow {
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .text-shadow-sm {
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }
            .btn-primary {
                @apply bg-primary text-white px-4 py-2 rounded-lg transition-all hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2;
            }
            .btn-secondary {
                @apply bg-white text-primary border border-border px-4 py-2 rounded-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2;
            }
            .btn-danger {
                @apply bg-white text-danger border border-danger/20 px-4 py-2 rounded-lg transition-all hover:bg-danger/5 focus:outline-none focus:ring-2 focus:ring-danger/30 focus:ring-offset-2;
            }
            .input-primary {
                @apply w-full px-4 py-2.5 rounded-lg border border-border bg-white text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all;
            }
            .form-label {
                @apply block text-sm font-medium text-gray-700 mb-1;
            }
            .checkbox-primary {
                @apply w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/30;
            }
            .scroll-smooth {
                scroll-behavior: smooth;
            }
            .scale-fade-in {
                animation: scaleFadeIn 0.3s ease-out forwards;
            }
            @keyframes scaleFadeIn {
                0% {
                    opacity: 0;
                    transform: scale(0.95);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            .scale-fade-out {
                animation: scaleFadeOut 0.2s ease-in forwards;
            }
            @keyframes scaleFadeOut {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.95);
                }
            }
            .table-hover-row:hover {
                background-color: #f9fafb;
            }
            .status-badge {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                border-radius: 9999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: 500;
            }
            .table-btn {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                border-radius: 4px;
                transition: all 0.2s ease;
                border: none;
                cursor: pointer;
            }
            .table-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .erp-btn {
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 14px;
                transition: all 0.2s ease;
                border: 1px solid transparent;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                text-decoration: none;
            }
            .erp-btn:hover {
                opacity: 0.9;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .erp-btn:active {
                transform: translateY(0);
            }
            .erp-btn-primary {
                background-color: #2a3b7d;
                color: white;
                border-color: #2a3b7d;
            }
            .erp-btn-primary:hover {
                background-color: #3a4ca7;
                border-color: #3a4ca7;
            }
            .erp-btn-secondary {
                background-color: white;
                color: #525252;
                border-color: #d4d4d4;
            }
            .erp-btn-secondary:hover {
                border-color: #a3a3a3;
                color: #262626;
            }
            .erp-btn-warning {
                background-color: #FF7D00;
                color: white;
                border-color: #FF7D00;
            }
            .erp-btn-warning:hover {
                background-color: #ff952e;
                border-color: #ff952e;
            }
            .erp-btn-danger {
                background-color: #F53F3F;
                color: white;
                border-color: #F53F3F;
            }
            .erp-btn-danger:hover {
                background-color: #ff5c5c;
                border-color: #ff5c5c;
            }
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 50;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .modal-overlay.show {
                opacity: 1;
                visibility: visible;
            }
            .modal-content {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }
            .modal-overlay.show .modal-content {
                transform: translateY(0);
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #E5E7EB;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-title {
                font-size: 18px;
                font-weight: 600;
                color: #1D2129;
            }
            .modal-body {
                padding: 20px;
            }
            .modal-footer {
                padding: 16px 20px;
                border-top: 1px solid #E5E7EB;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            .close-btn {
                background-color: white;
                color: #2a3b7d;
                border: 1px solid #E5E7EB;
                border-radius: 4px;
                padding: 8px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .close-btn:hover {
                background-color: #f9fafb;
            }
            .form-group {
                margin-bottom: 16px;
            }
            .form-group label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 6px;
            }
            .form-group .required {
                color: #F53F3F;
            }
            .form-select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #E5E7EB;
                border-radius: 6px;
                font-size: 14px;
                color: #1D2129;
                background-color: white;
                transition: all 0.2s ease;
            }
            .form-select:focus {
                outline: none;
                border-color: #2a3b7d;
                box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1);
            }
            .form-select option:disabled {
                color: #9ca3af;
                background-color: #f3f4f6;
                cursor: not-allowed;
            }
            .form-select option:not(:disabled):hover {
                background-color: #e5e7eb;
            }
            .form-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #E5E7EB;
                border-radius: 6px;
                font-size: 14px;
                color: #1D2129;
                background-color: white;
                transition: all 0.2s ease;
            }
            .form-input:focus {
                outline: none;
                border-color: #2a3b7d;
                box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1);
            }
            .tabs {
                display: flex;
                gap: 2px;
                background: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%);
                padding: 4px;
                border-radius: 12px;
                width: fit-content;
                box-shadow: 0 4px 20px rgba(42, 59, 125, 0.3);
            }
            .tab {
                padding: 10px 20px;
                border: none;
                background: transparent;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .tab:hover {
                color: white;
                transform: translateY(-1px);
            }
            .tab.active {
                background: white;
                color: #2a3b7d;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                font-weight: 600;
            }
            .page {
                display: none;
            }
            .page.active {
                display: block;
            }
        }
    </style>
</head>
<body class="font-sans bg-gray-50 text-neutral-800 min-h-screen">
    <!-- 切换标签 -->
    <div class="tabs fixed bottom-8 right-8 z-40">
        <button id="tab-prototype" class="tab active" onclick="switchMainTab('prototype')">原型</button>
        <button id="tab-prd" class="tab" onclick="switchMainTab('prd')">PRD</button>
        <button id="tab-testcases" class="tab" onclick="switchMainTab('testcases')">测试用例</button>
    </div>

    <header class="bg-primary text-white shadow-header sticky top-0 z-50">
        <div class="container mx-auto px-2 sm:px-3 lg:px-4">
            <div class="flex justify-between items-center h-14">
                <div class="flex items-center">
                    <div class="flex-shrink-0 flex items-center">
                        <span class="text-lg font-semibold">ELSA</span>
                    </div>
                    <nav class="hidden md:ml-10 md:flex md:space-x-6">
                        <div class="relative group">
                            <a href="#" class="px-3 py-2 text-sm hover:bg-primary/80 transition-colors flex items-center">
                                基础数据
                                <i class="fa fa-angle-down ml-1 text-xs"></i>
                            </a>
                            <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                <a href="#" class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100" data-page="organization">组织机构管理</a>
                                <a href="#" class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100" data-page="warehouse">虚拟仓管理</a>
                            </div>
                        </div>
                        <div class="relative group">
                            <a href="#" class="px-3 py-2 text-sm hover:bg-primary/80 transition-colors flex items-center">
                                出库管理
                                <i class="fa fa-angle-down ml-1 text-xs"></i>
                            </a>
                            <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                <a href="#" class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100" data-page="shipment">出库管理</a>
                                <a href="#" class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100" data-page="transfer">调拨管理</a>
                            </div>
                        </div>
                        <div class="relative group">
                            <a href="#" class="px-3 py-2 text-sm hover:bg-primary/80 transition-colors flex items-center">
                                库存管理
                                <i class="fa fa-angle-down ml-1 text-xs"></i>
                            </a>
                            <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                <a href="#" class="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100" data-page="inventory">库存管理</a>
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
                        <span class="ml-2 text-sm hidden sm:inline-block">zsw</span>
                        <i class="fa fa-angle-down ml-1 text-xs"></i>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- PRD 内容 - 从 Markdown 加载 -->
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
    
    <!-- 测试用例内容 - 从 Markdown 加载 -->
    <main id="main-testcases" class="main-content" style="display: none;">
        <div class="container mx-auto px-4 py-8">
            <div class="flex gap-6">
                <!-- 左侧目录 -->
                <aside class="w-64 flex-shrink-0 hidden lg:block">
                    <div class="toc sticky top-4">
                        <div class="toc-title">
                            <i class="fa fa-list-alt mr-2"></i>目录导航
                        </div>
                        <div id="testcases-toc-nav"></div>
                    </div>
                </aside>
                <!-- 右侧内容 -->
                <div class="flex-1 min-w-0">
                    <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
                        <div id="testcases-content" class="prose max-w-none">
                            <div class="text-center py-16">
                                <div class="animate-pulse">
                                    <i class="fa fa-spinner fa-spin text-5xl text-primary mb-4"></i>
                                    <p class="text-lg text-gray-500">正在加载测试用例文档...</p>
                                    <button onclick="loadTestCases()" class="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">
                                        <i class="fa fa-refresh mr-2"></i>重新加载
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- 原型页面 -->
    <main id="main-prototype" class="main-content active flex-1 overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-2 py-6">
            <div id="page-{{page-id}}" class="page active">
                <div class="bg-white rounded shadow-card p-4 mb-4">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div class="flex items-center w-full sm:w-auto">
                            <label class="text-xs text-neutral-600 mr-2">搜索条件</label>
                            <div class="relative flex-1 sm:w-64">
                                <input type="text" placeholder="请输入搜索内容..." class="w-full pl-7 pr-3 py-1.5 text-sm border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" id="search-input">
                                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
                            </div>
                        </div>
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

                <div class="bg-white rounded shadow-card p-4 mb-4">
                    <div class="flex justify-start gap-3">
                        <button class="erp-btn erp-btn-primary" onclick="openAddModal()">
                            <i class="fa fa-plus mr-1.5"></i> 新增
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded shadow-card overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-neutral-200 text-sm table-auto">
                            <thead class="bg-primary/10">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">
                                        <input type="checkbox" class="rounded border-gray-300 text-primary focus:ring-primary">
                                    </th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">ID</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">名称</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">状态</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-primary whitespace-nowrap">创建时间</th>
                                    <th class="px-4 py-3 text-center text-sm font-semibold text-primary whitespace-nowrap sticky right-0 bg-primary/10 z-20">操作</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-neutral-100" id="data-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- 新增/编辑模态框 -->
    <div id="edit-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modal-title">新增记录</h2>
                <button class="close-btn" onclick="closeEditModal()">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="edit-form">
                    <input type="hidden" id="record-id">
                    <div class="form-group">
                        <label>名称 <span class="required">*</span></label>
                        <input type="text" id="record-name" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>状态 <span class="required">*</span></label>
                        <select id="record-status" class="form-select" required>
                            <option value="active">活跃</option>
                            <option value="inactive">非活跃</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>描述 <span class="required">*</span></label>
                        <textarea id="record-description" class="form-input" rows="3" required></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="close-btn" onclick="closeEditModal()">取消</button>
                <button class="erp-btn erp-btn-primary" onclick="saveRecord()">保存</button>
            </div>
        </div>
    </div>
    
    <!-- 确认删除模态框 -->
    <div id="delete-modal" class="modal-overlay">
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2 class="modal-title">确认删除</h2>
                <button class="close-btn" onclick="closeDeleteModal()">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            <div class="modal-body text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 text-danger mb-4">
                    <i class="fa fa-trash-o text-2xl"></i>
                </div>
                <p class="text-gray-500 mt-2">确定要删除选中的记录吗？此操作不可撤销。</p>
            </div>
            <div class="modal-footer justify-center">
                <button class="close-btn" onclick="closeDeleteModal()">取消</button>
                <button class="erp-btn erp-btn-danger" onclick="confirmDelete()">删除</button>
            </div>
        </div>
    </div>

    <script>
        // 标签切换功能
        function switchMainTab(tab) {
            document.querySelectorAll('.main-content').forEach(content => {
                content.style.display = 'none';
            });
            document.querySelectorAll('.tab').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`main-${tab}`).style.display = 'block';
            document.getElementById(`tab-${tab}`).classList.add('active');
            
            if (tab === 'prd') {
                loadPRD();
            } else if (tab === 'testcases') {
                loadTestCases();
            }
        }
        
        // 加载PRD内容
        function loadPRD() {
            const prdContent = document.getElementById('prd-content');
            prdContent.innerHTML = '<div class="text-center py-20"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载PRD文档中...</p></div>';
            
            fetch('prd.md')
                .then(response => response.text())
                .then(text => {
                    prdContent.innerHTML = marked.parse(text);
                    setTimeout(() => {
                        mermaid.init(undefined, prdContent.querySelectorAll('.mermaid'));
                    }, 100);
                })
                .catch(error => {
                    prdContent.innerHTML = '<div class="text-center py-20"><i class="fa fa-exclamation-triangle text-4xl text-danger mb-4"></i><p class="text-gray-500">加载PRD文档失败</p></div>';
                });
        }
        
        // 加载测试用例内容
        function loadTestCases() {
            const testcasesContent = document.getElementById('testcases-content');
            testcasesContent.innerHTML = '<div class="text-center py-20"><i class="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i><p class="text-gray-500">加载测试用例文档中...</p></div>';
            
            fetch('test-cases.md')
                .then(response => response.text())
                .then(text => {
                    testcasesContent.innerHTML = marked.parse(text);
                    setTimeout(() => {
                        mermaid.init(undefined, testcasesContent.querySelectorAll('.mermaid'));
                    }, 100);
                })
                .catch(error => {
                    testcasesContent.innerHTML = '<div class="text-center py-20"><i class="fa fa-exclamation-triangle text-4xl text-danger mb-4"></i><p class="text-gray-500">加载测试用例文档失败</p></div>';
                });
        }
        
        // 打开Mermaid图表放大预览
        function openMermaidModal(element) {
            const mermaidCode = element.querySelector('.mermaid').innerHTML;
            const modal = document.getElementById('mermaidModal');
            const modalContent = document.getElementById('mermaidModalContent');
            
            modalContent.innerHTML = `<div class="mermaid">${mermaidCode}</div>`;
            modal.classList.add('active');
            
            setTimeout(() => {
                mermaid.init(undefined, modalContent.querySelectorAll('.mermaid'));
            }, 100);
        }
        
        // 关闭Mermaid图表放大预览
        function closeMermaidModal() {
            const modal = document.getElementById('mermaidModal');
            modal.classList.remove('active');
        }
        
        // 全局变量
        let data = [];
        let filteredData = [];
        let page = 1;
        let pageSize = 10;
        let totalPages = 1;
        let selectedIds = [];
        
        // 模拟数据
        function generateMockData() {
            const mockData = [];
            for (let i = 1; i <= 50; i++) {
                mockData.push({
                    id: i,
                    name: `项目 ${i}`,
                    status: i % 2 === 0 ? 'active' : 'inactive',
                    description: `这是项目 ${i} 的描述信息，包含详细的项目内容和要求。`,
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')
                });
            }
            return mockData;
        }
        
        // 初始化数据
        function initData() {
            data = generateMockData();
            filteredData = [...data];
            renderTable();
            renderPagination();
        }
        
        // 渲染表格
        function renderTable() {
            const tbody = document.getElementById('data-table-body');
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const pageData = filteredData.slice(startIndex, endIndex);
            
            tbody.innerHTML = '';
            
            if (pageData.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="6" class="px-6 py-10 text-center text-gray-500">暂无数据</td>`;
                tbody.appendChild(emptyRow);
                return;
            }
            
            pageData.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-200 hover:bg-gray-50';
                
                const statusBadge = item.status === 'active' 
                    ? '<span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">活跃</span>'
                    : '<span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">非活跃</span>';
                
                row.innerHTML = `
                    <td class="px-6 py-4">
                        <input type="checkbox" class="record-checkbox rounded border-gray-300 text-primary focus:ring-primary" data-id="${item.id}">
                    </td>
                    <td class="px-6 py-4">${item.id}</td>
                    <td class="px-6 py-4 font-medium">${item.name}</td>
                    <td class="px-6 py-4">${statusBadge}</td>
                    <td class="px-6 py-4">${item.createdAt}</td>
                    <td class="px-6 py-4">
                        <div class="flex gap-2">
                            <button class="text-primary hover:text-primary-light" onclick="editRecord(${item.id})"><i class="fa fa-edit"></i></button>
                            <button class="text-danger hover:text-danger/80" onclick="deleteRecord(${item.id})"><i class="fa fa-trash"></i></button>
                            <button class="text-gray-600 hover:text-gray-800" onclick="viewRecord(${item.id})"><i class="fa fa-eye"></i></button>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
            
            // 绑定复选框事件
            bindCheckboxEvents();
        }
        
        // 绑定复选框事件
        function bindCheckboxEvents() {
            // 全选复选框
            const selectAllCheckbox = document.getElementById('select-all');
            selectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.record-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
                updateSelectedIds();
            });
            
            // 单个复选框
            const checkboxes = document.querySelectorAll('.record-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    updateSelectedIds();
                    // 更新全选状态
                    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                    selectAllCheckbox.checked = allChecked;
                });
            });
        }
        
        // 更新选中的ID
        function updateSelectedIds() {
            const checkboxes = document.querySelectorAll('.record-checkbox:checked');
            selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
        }
        
        // 渲染分页
        function renderPagination() {
            totalPages = Math.ceil(filteredData.length / pageSize);
            const pageButtons = document.getElementById('page-buttons');
            const showingCount = document.getElementById('showing-count');
            const totalCount = document.getElementById('total-count');
            
            // 更新显示信息
            const start = (page - 1) * pageSize + 1;
            const end = Math.min(page * pageSize, filteredData.length);
            showingCount.textContent = `${start}-${end}`;
            totalCount.textContent = filteredData.length;
            
            // 渲染页码按钮
            pageButtons.innerHTML = '';
            
            // 显示最多5个页码按钮
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, startPage + 4);
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                const button = document.createElement('button');
                button.className = `px-3 py-1 rounded ${i === page ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`;
                button.textContent = i;
                button.addEventListener('click', () => changePage(i));
                pageButtons.appendChild(button);
            }
            
            // 更新分页按钮状态
            document.getElementById('first-page').disabled = page === 1;
            document.getElementById('prev-page').disabled = page === 1;
            document.getElementById('next-page').disabled = page === totalPages;
            document.getElementById('last-page').disabled = page === totalPages;
        }
        
        // 切换页码
        function changePage(newPage) {
            if (newPage < 1 || newPage > totalPages) return;
            page = newPage;
            renderTable();
            renderPagination();
        }
        
        // 搜索和筛选
        function initSearchAndFilter() {
            const searchInput = document.getElementById('search-input');
            const filterSelect = document.getElementById('filter-select');
            const sortSelect = document.getElementById('sort-select');
            
            searchInput.addEventListener('input', applyFilters);
            filterSelect.addEventListener('change', applyFilters);
            sortSelect.addEventListener('change', applyFilters);
        }
        
        // 应用筛选
        function applyFilters() {
            const searchInput = document.getElementById('search-input').value.toLowerCase();
            const filterValue = document.getElementById('filter-select').value;
            const sortValue = document.getElementById('sort-select').value;
            
            // 筛选
            filteredData = data.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchInput) || 
                                     item.description.toLowerCase().includes(searchInput);
                const matchesFilter = filterValue === 'all' || item.status === filterValue;
                return matchesSearch && matchesFilter;
            });
            
            // 排序
            filteredData.sort((a, b) => {
                switch (sortValue) {
                    case 'id':
                        return a.id - b.id;
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'date':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    default:
                        return 0;
                }
            });
            
            page = 1;
            renderTable();
            renderPagination();
        }
        
        // 打开新增模态框
        function openAddModal() {
            document.getElementById('modal-title').textContent = '新增记录';
            document.getElementById('record-id').value = '';
            document.getElementById('record-name').value = '';
            document.getElementById('record-status').value = 'active';
            document.getElementById('record-description').value = '';
            document.getElementById('edit-modal').classList.add('show');
        }
        
        // 编辑记录
        function editRecord(id) {
            const record = data.find(item => item.id === id);
            if (record) {
                document.getElementById('modal-title').textContent = '编辑记录';
                document.getElementById('record-id').value = record.id;
                document.getElementById('record-name').value = record.name;
                document.getElementById('record-status').value = record.status;
                document.getElementById('record-description').value = record.description;
                document.getElementById('edit-modal').classList.add('show');
            }
        }
        
        // 查看记录
        function viewRecord(id) {
            const record = data.find(item => item.id === id);
            if (record) {
                alert(`查看记录：\nID: ${record.id}\n名称: ${record.name}\n状态: ${record.status === 'active' ? '活跃' : '非活跃'}\n描述: ${record.description}\n创建日期: ${record.createdAt}`);
            }
        }
        
        // 删除记录
        function deleteRecord(id) {
            selectedIds = [id];
            document.getElementById('delete-modal').classList.add('show');
        }
        
        // 关闭编辑模态框
        function closeEditModal() {
            document.getElementById('edit-modal').classList.remove('show');
        }
        
        // 关闭删除模态框
        function closeDeleteModal() {
            document.getElementById('delete-modal').classList.remove('show');
        }
        
        // 确认删除
        function confirmDelete() {
            data = data.filter(item => !selectedIds.includes(item.id));
            applyFilters();
            closeDeleteModal();
            showToast('删除成功');
        }
        
        // 保存记录
        function saveRecord() {
            const id = document.getElementById('record-id').value;
            const name = document.getElementById('record-name').value;
            const status = document.getElementById('record-status').value;
            const description = document.getElementById('record-description').value;
            
            if (!name || !description) {
                showToast('请填写完整信息', 'error');
                return;
            }
            
            if (id) {
                // 编辑
                const index = data.findIndex(item => item.id === parseInt(id));
                if (index !== -1) {
                    data[index] = {
                        ...data[index],
                        name,
                        status,
                        description
                    };
                    showToast('更新成功');
                }
            } else {
                // 新增
                const newId = Math.max(...data.map(item => item.id), 0) + 1;
                data.push({
                    id: newId,
                    name,
                    status,
                    description,
                    createdAt: new Date().toLocaleDateString('zh-CN')
                });
                showToast('创建成功');
            }
            
            applyFilters();
            closeEditModal();
        }
        
        // 显示提示
        function showToast(message, type = 'success') {
            // 创建提示元素
            const toast = document.createElement('div');
            toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`;
            toast.textContent = message;
            
            // 添加到页面
            document.body.appendChild(toast);
            
            // 3秒后移除
            setTimeout(() => {
                toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }
        
        // 初始化表单提交
        function initForm() {
            const form = document.getElementById('edit-form');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                saveRecord();
            });
        }
        
        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            switchMainTab('prototype');
            initData();
            initSearchAndFilter();
            initForm();
        });
    </script>
</body>
</html>
```

### Virtual Warehouse Module Specific Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Department Tree** | Hierarchical department structure | Recursive JavaScript rendering |
| **Virtual Warehouse Management** | Create and configure virtual warehouses | Dedicated modal forms |
| **Inventory Management** | Real-time inventory tracking | Dynamic table updates |
| **Transfer Management** | Cross-department inventory transfers | Multi-step approval workflow |
| **Billing System** | Department-specific billing | Automated bill generation |
| **Data Isolation** | Role-based access control | Permission-based filtering |
