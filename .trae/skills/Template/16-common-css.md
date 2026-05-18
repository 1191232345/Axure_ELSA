# 公共样式模板 (common.css) - v2.1 升级版

本文件包含所有模块共用的公共样式，放置在 `/common/css/common.css`。

> **⚠️ v2.1 更新**：已统一升级为 [00-design-tokens.md](00-design-tokens.md) 标准命名体系（`--color-xxx`）

## 完整样式代码

```css
/* ========================================
   TOB 产品公共样式（v2.1 - 统一设计令牌）
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

/* 2. CSS 变量（统一设计令牌） */
:root {
    /* 品牌色系 */
    --color-primary: #2a3b7d;
    --color-primary-hover: #3a4ca7;

    /* 功能色系 */
    --color-secondary: #36CFC9;
    --color-accent: #722ED1;
    --color-success: #00B42A;
    --color-warning: #FF7D00;
    --color-danger: #F53F3F;

    /* 中性色系 */
    --color-text-primary: #1D2129;
    --color-border: #E5E7EB;
    --color-card-bg: #FFFFFF;

    /* 阴影和圆角 */
    --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.05);
    --radius-lg: 8px;
    --radius-md: 6px;
}

/* 3. 按钮样式 */
.erp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-200) var(--ease-default);
    border: 1px solid transparent;
    white-space: nowrap;
}

.erp-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.erp-btn-primary {
    background-color: var(--color-primary);
    color: var(--color-neutral-50);
    border-color: var(--color-primary);
}

.erp-btn-primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
}

.erp-btn-secondary {
    background: white;
    color: var(--color-text-primary);
    border-color: var(--color-border);
}

.erp-btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
}

.erp-btn-success {
    background-color: var(--color-success);
    color: var(--color-neutral-50);
}

.erp-btn-success:hover:not(:disabled) {
    background: #00a023;
}

.erp-btn-warning {
    background-color: var(--color-warning);
    color: var(--color-neutral-50);
}

.erp-btn-warning:hover:not(:disabled) {
    background: #e67000;
}

.erp-btn-danger {
    background-color: var(--color-danger);
    color: var(--color-neutral-50);
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
    color: var(--color-text-primary);
}

.form-input {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: border-color var(--duration-200), box-shadow var(--duration-200);
}

.form-input:focus {
    outline: none;
    border-color: var(--color-primary);
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
    border-radius: var(--radius-lg);
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
    border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
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
    color: var(--color-text-primary);
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
    border-top: 1px solid var(--color-border);
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
    transition: all var(--duration-200) var(--ease-default);
    color: #6b7280;
}

.tab:hover {
    color: var(--color-primary);
}

.tab.active {
    background: var(--color-primary);
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
    color: var(--color-success);
}

.badge-warning {
    background: #fff7e6;
    color: var(--color-warning);
}

.badge-danger {
    background: #ffe6e6;
    color: var(--color-danger);
}

.badge-info {
    background: #e6f4ff;
    color: var(--color-primary);
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
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn var(--duration-300) var(--ease-out);
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
    border-left: 4px solid var(--color-success);
}

.toast-warning {
    border-left: 4px solid var(--color-warning);
}

.toast-error {
    border-left: 4px solid var(--color-danger);
}

.toast-info {
    border-left: 4px solid var(--color-primary);
}

/* 11. 分页样式 */
.pagination-btn {
    padding: 6px 12px;
    font-size: 14px;
    border: 1px solid var(--color-border);
    background: white;
    cursor: pointer;
    transition: all var(--duration-200);
}

.pagination-btn:hover:not(:disabled) {
    background: #f3f4f6;
}

.pagination-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
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
    border-radius: var(--radius-lg);
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
    color: var(--color-text-primary);
}

.mermaid-modal-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--color-text-primary);
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
    color: var(--color-primary);
    opacity: 0;
    transition: opacity var(--duration-200);
}

/* 13. 目录样式 */
.toc {
    background: white;
    border-radius: var(--radius-lg);
    padding: 16px;
    box-shadow: var(--shadow-card);
}

.toc-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--color-text-primary);
}

.toc-item {
    display: block;
    padding: 6px 12px;
    color: #6b7280;
    text-decoration: none;
    font-size: 14px;
    border-radius: 4px;
    transition: all var(--duration-200);
}

.toc-item:hover {
    background: #f3f4f6;
    color: var(--color-primary);
}

.toc-item.active {
    background: rgba(42, 59, 125, 0.1);
    color: var(--color-primary);
}

/* 14. 文档样式 */
.prose {
    line-height: 1.8;
}

.prose h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--color-text-primary);
}

.prose h2 {
    font-size: 22px;
    font-weight: 600;
    margin-top: 32px;
    margin-bottom: 16px;
    color: var(--color-text-primary);
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: 8px;
}

.prose h3 {
    font-size: 18px;
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 12px;
    color: var(--color-text-primary);
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
    border: 1px solid var(--color-border);
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
    border-radius: var(--radius-md);
    overflow-x: auto;
}

.prose code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 14px;
}

/* 15. 响应式适配 */
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
<!-- 公共样式（v2.1 统一设计令牌版本） -->
<link rel="stylesheet" href="/common/css/common.css">
```

## v2.1 变更说明

| 变更类型 | 旧值 | 新值 |
|----------|------|------|
| **变量命名** | `--primary` | `--color-primary` |
| **变量命名** | `--dark` | `--color-text-primary` |
| **变量命名** | `--border` | `--color-border` |
| **变量命名** | `--radius` | `--radius-lg` |
| **变量命名** | `--radius-sm` | `--radius-md` |
| **动画时长** | `0.2s ease` | `var(--duration-200) var(--ease-default)` |

> 详细设计令牌定义请查看：[00-design-tokens.md](00-design-tokens.md)
