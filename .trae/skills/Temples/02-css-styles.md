# CSS 样式模板

本文件包含TOB产品的完整 CSS 样式定义，确保所有模块样式一致性。

**注意：交互状态样式（悬停、聚焦、按下、禁用等）请参考 [08-interaction-states.md](08-interaction-states.md)**

## 1. 页面基础样式

```css
/* 主内容区域切换 */
.main-content { display: none; }
.main-content.active { display: block; }

/* Body 基础样式 */
body {
    font-family: system-ui, -apple-system, sans-serif;
    background-color: #f9fafb;
    color: #374151;
    min-height: 100vh;
}
```

## 2. PRD/测试用例 Markdown 渲染样式

```css
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
```

## 3. 目录导航样式

```css
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

/* 目录折叠功能样式 */
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
```

## 4. 切换标签样式

```css
/* 切换标签样式 - 固定在右下角 */
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
```

## 5. 卡片布局规范

### 5.1 搜索卡片

```css
/* 搜索卡片 */
.search-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 16px;
}

.search-card .search-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}

.search-card .search-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-card .search-label {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
}

.search-card .search-buttons {
    display: flex;
    gap: 8px;
    margin-left: auto;
}
```

### 5.2 操作卡片

```css
/* 操作卡片 */
.action-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 16px;
}

.action-card .action-buttons {
    display: flex;
    justify-content: flex-start;
    gap: 12px;
}
```

### 5.3 按钮位置规则

| 按钮类型 | 位置 | 说明 |
|----------|------|------|
| 搜索 | 搜索卡片右侧 | 筛选数据 |
| 重置 | 搜索卡片右侧 | 清空筛选条件 |
| 新增 | 操作卡片左侧 | 主操作按钮，使用主按钮样式 |
| 导出 | 操作卡片左侧 | 次要操作，使用次要按钮样式 |
| 批量操作 | 操作卡片左侧 | 需要选中数据后启用 |

### 5.4 响应式布局

```css
/* 响应式布局 */
@media (max-width: 768px) {
    .search-card .search-fields {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-card .search-field {
        width: 100%;
    }
    
    .search-card .search-buttons {
        margin-left: 0;
        width: 100%;
        justify-content: stretch;
    }
    
    .search-card .search-buttons .erp-btn {
        flex: 1;
    }
    
    .action-card .action-buttons {
        flex-wrap: wrap;
    }
}
```

## 6. 按钮样式

**注意：按钮交互状态（悬停、按下、禁用、加载）请参考 [08-interaction-states.md](08-interaction-states.md)**

```css
/* ERP 按钮样式 */
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

.erp-btn-primary {
    background-color: #2a3b7d;
    color: white;
    border-color: #2a3b7d;
}

.erp-btn-secondary {
    background-color: white;
    color: #525252;
    border-color: #d4d4d4;
}

.erp-btn-warning {
    background-color: #FF7D00;
    color: white;
    border-color: #FF7D00;
}

.erp-btn-danger {
    background-color: #F53F3F;
    color: white;
    border-color: #F53F3F;
}

.erp-btn-success {
    background-color: #00B42A;
    color: white;
    border-color: #00B42A;
}

/* 表格内按钮 */
.table-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    background: transparent;
}
```

## 7. 表格样式

```css
/* 表格样式 */
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
```

## 8. 模态框样式

**注意：模态框交互状态和动画请参考 [08-interaction-states.md](08-interaction-states.md)**

```css
/* 模态框样式 */
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
```

## 9. 表单样式

**注意：输入框交互状态（悬停、聚焦、禁用、错误）请参考 [08-interaction-states.md](08-interaction-states.md)**

```css
/* 表单样式 */
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
    cursor: pointer;
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

.form-textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    font-size: 14px;
    color: #1D2129;
    background-color: white;
    transition: all 0.2s ease;
    resize: vertical;
    min-height: 80px;
}
```

## 10. Mermaid 图表放大预览

```css
/* Mermaid图表放大预览样式 */
.mermaid {
    cursor: zoom-in;
    transition: transform 0.3s ease;
}

.mermaid:hover {
    transform: scale(1.02);
}

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
```

## 11. 页面切换动画

```css
.page {
    display: none;
}

.page.active {
    display: block;
}
```
