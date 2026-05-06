# 公共样式模板 (common.css)

本文件包含所有模块共用的公共样式，放置在 `/common/css/common.css`。

## 完整样式代码

```css
/* ========================================
   TOB 产品公共样式
   ======================================== */

/* 1. 基础重置 */
*, *::before, *::after {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
}

/* 2. CSS 变量 */
:root {
    --primary: #2a3b7d;
    --primary-light: #3a4ca7;
    --secondary: #36CFC9;
    --accent: #722ED1;
    --success: #00B42A;
    --warning: #FF7D00;
    --danger: #F53F3F;
    --dark: #1D2129;
    --border: #E5E7EB;
    --card-bg: #FFFFFF;
    --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.05);
    --radius: 8px;
    --radius-sm: 6px;
}

/* 3. 按钮样式 */
.erp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    white-space: nowrap;
}

.erp-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.erp-btn-primary {
    background: var(--primary);
    color: white;
}

.erp-btn-primary:hover:not(:disabled) {
    background: var(--primary-light);
}

.erp-btn-secondary {
    background: white;
    color: var(--dark);
    border-color: var(--border);
}

.erp-btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
}

.erp-btn-success {
    background: var(--success);
    color: white;
}

.erp-btn-success:hover:not(:disabled) {
    background: #00a023;
}

.erp-btn-warning {
    background: var(--warning);
    color: white;
}

.erp-btn-warning:hover:not(:disabled) {
    background: #e67000;
}

.erp-btn-danger {
    background: var(--danger);
    color: white;
}

.erp-btn-danger:hover:not(:disabled) {
    background: #d93636;
}

/* 4. 表单样式 */
.form-group {
    margin-bottom: 16px;
}

.form-label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--dark);
}

.form-input {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(42, 59, 125, 0.1);
}

.form-input:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
}

/* 5. 模态框样式 */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    align-items: center;
    justify-content: center;
}

.modal.show {
    display: flex;
}

.modal-content {
    background: white;
    border-radius: var(--radius);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
}

.modal-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--dark);
}

.modal-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px;
}

.modal-close:hover {
    color: var(--dark);
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
    max-height: calc(90vh - 140px);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    background: #f9fafb;
}

/* 6. Tab 切换样式 */
.tabs {
    display: flex;
    gap: 4px;
    background: white;
    padding: 4px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tab {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    background: transparent;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #6b7280;
}

.tab:hover {
    color: var(--primary);
}

.tab.active {
    background: var(--primary);
    color: white;
}

/* 7. 主内容区域 */
.main-content {
    display: none;
}

.main-content.active {
    display: block;
}

/* 8. 卡片样式 */
.shadow-card {
    box-shadow: var(--shadow-card);
}

/* 9. 状态徽章 */
.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
}

.badge-success {
    background: #e6ffed;
    color: var(--success);
}

.badge-warning {
    background: #fff7e6;
    color: var(--warning);
}

.badge-danger {
    background: #ffe6e6;
    color: var(--danger);
}

.badge-info {
    background: #e6f4ff;
    color: var(--primary);
}

/* 10. Toast 提示 */
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.toast {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: white;
    border-radius: var(--radius-sm);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.toast-success {
    border-left: 4px solid var(--success);
}

.toast-warning {
    border-left: 4px solid var(--warning);
}

.toast-error {
    border-left: 4px solid var(--danger);
}

.toast-info {
    border-left: 4px solid var(--primary);
}

/* 11. 分页样式 */
.pagination-btn {
    padding: 6px 12px;
    font-size: 14px;
    border: 1px solid var(--border);
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background: #f3f4f6;
}

.pagination-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 12. Mermaid 模态框 */
.mermaid-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1100;
    align-items: center;
    justify-content: center;
}

.mermaid-modal.show {
    display: flex;
}

.mermaid-modal-content {
    background: white;
    border-radius: var(--radius);
    padding: 24px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    position: relative;
}

.mermaid-modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #9ca3af;
}

.mermaid-modal-close:hover {
    color: var(--dark);
}

.mermaid-modal-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--dark);
}

.mermaid-container {
    cursor: pointer;
    position: relative;
}

.mermaid-container:hover .mermaid-hint {
    opacity: 1;
}

.mermaid-hint {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 12px;
    color: var(--primary);
    opacity: 0;
    transition: opacity 0.2s;
}

/* 13. 目录样式 */
.toc {
    background: white;
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: var(--shadow-card);
}

.toc-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--dark);
}

.toc-item {
    display: block;
    padding: 6px 12px;
    color: #6b7280;
    text-decoration: none;
    font-size: 14px;
    border-radius: 4px;
    transition: all 0.2s;
}

.toc-item:hover {
    background: #f3f4f6;
    color: var(--primary);
}

.toc-item.active {
    background: rgba(42, 59, 125, 0.1);
    color: var(--primary);
}

/* 14. 文档样式 */
.prose {
    line-height: 1.8;
}

.prose h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--dark);
}

.prose h2 {
    font-size: 22px;
    font-weight: 600;
    margin-top: 32px;
    margin-bottom: 16px;
    color: var(--dark);
    border-bottom: 2px solid var(--primary);
    padding-bottom: 8px;
}

.prose h3 {
    font-size: 18px;
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 12px;
    color: var(--dark);
}

.prose p {
    margin-bottom: 16px;
    color: #4b5563;
}

.prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
}

.prose th,
.prose td {
    padding: 12px;
    border: 1px solid var(--border);
    text-align: left;
}

.prose th {
    background: #f9fafb;
    font-weight: 600;
}

.prose pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 16px;
    border-radius: var(--radius-sm);
    overflow-x: auto;
}

.prose code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 14px;
}

/* 15. 响应式 */
@media (max-width: 640px) {
    .erp-btn {
        padding: 8px 12px;
        font-size: 13px;
    }
    
    .modal-content {
        width: 95%;
        margin: 10px;
    }
    
    .tabs {
        bottom: 16px;
        right: 16px;
    }
}
```

## 使用方式

在 HTML 中引用：

```html
<link rel="stylesheet" href="/common/css/common.css">
```
