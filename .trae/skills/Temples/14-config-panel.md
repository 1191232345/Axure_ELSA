# 可视化配置面板模板

本文件包含TOB产品可视化配置面板的完整模板，用于非技术人员修改高保真原型的页面元素和数据。

## 1. 概述

### 1.1 功能说明

可视化配置面板提供以下功能：

| 功能模块 | 说明 |
|----------|------|
| 页面配置 | 修改页面标题、模块名称 |
| 筛选条件配置 | 添加/删除/排序筛选字段 |
| 表格列配置 | 配置表格列名、宽度、对齐方式、显示状态 |
| 操作按钮配置 | 配置按钮名称、类型、图标、显示状态 |
| 状态徽章配置 | 配置状态名称、颜色、背景色 |
| 数据管理 | 管理列表数据，支持增删改查 |
| 导入导出 | 配置的JSON导入导出 |

### 1.2 文件结构

```
模块目录/
├── index.html      # 主页面（包含配置按钮）
├── config.html     # 配置页面
├── prd.md          # PRD文档
└── test-cases.md   # 测试用例
```

### 1.3 数据同步机制

配置页面与主页面通过 localStorage 进行数据同步：

- 存储键名：`pageConfig_[模块名称]`
- 配置保存：配置页面点击"保存并应用"后写入 localStorage
- 配置加载：主页面加载时从 localStorage 读取配置

## 2. 主页面配置按钮

### 2.1 HTML 结构

在主页面 `index.html` 的 `</body>` 标签前添加配置按钮：

```html
<!-- 配置模式按钮 - 跳转到配置页面 -->
<a href="config.html" class="config-toggle-btn" id="configToggleBtn">
    <i class="fa fa-cog"></i>
    <span>配置模式</span>
</a>
```

### 2.2 CSS 样式

在主页面 `<style>` 标签内添加：

```css
/* 配置按钮样式 */
.config-toggle-btn {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 100;
    background: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(42, 59, 125, 0.3);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
}

.config-toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(42, 59, 125, 0.4);
}
```

### 2.3 JavaScript 配置加载

在主页面 `<script>` 标签内添加：

```javascript
// 配置加载功能
const STORAGE_KEY = 'pageConfig_[模块名称]';

function loadConfigFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const pageConfig = JSON.parse(saved);
            if (pageConfig.pageTitle) {
                document.title = pageConfig.pageTitle + ' - ELSA';
            }
            // 可根据需要扩展更多配置应用逻辑
        } catch (e) {
            console.error('加载配置失败', e);
        }
    }
}

// 页面加载时尝试加载保存的配置
document.addEventListener('DOMContentLoaded', function() {
    loadConfigFromStorage();
});
```

## 3. 配置页面完整模板

### 3.1 完整 HTML 文件

创建 `config.html` 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>可视化配置 - [模块名称]</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <style>
        /* 见下方 CSS 样式部分 */
    </style>
</head>
<body>
    <!-- 见下方 HTML 结构部分 -->
    <script>
        /* 见下方 JavaScript 逻辑部分 */
    </script>
</body>
</html>
```

### 3.2 CSS 样式

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f7fa;
    min-height: 100vh;
}

:root {
    --primary: #2a3b7d;
    --primary-light: #4a5b9d;
    --primary-dark: #1a2b5d;
}

/* 头部样式 */
.config-header {
    background: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%);
    color: white;
    padding: 20px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(42, 59, 125, 0.2);
}

.config-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.config-header-title {
    font-size: 22px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}

.config-header-title i {
    font-size: 26px;
}

.config-header-subtitle {
    font-size: 14px;
    opacity: 0.85;
}

.config-header-actions {
    display: flex;
    gap: 12px;
}

.config-header-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.config-header-btn.back {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.config-header-btn.back:hover {
    background: rgba(255, 255, 255, 0.3);
}

.config-header-btn.primary {
    background: white;
    color: var(--primary);
}

.config-header-btn.primary:hover {
    background: #f0f4ff;
    transform: translateY(-1px);
}

/* 容器样式 */
.config-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    padding-bottom: 100px;
}

.config-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
}

@media (max-width: 1200px) {
    .config-grid {
        grid-template-columns: 1fr;
    }
}

/* 区块样式 */
.config-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.config-section-header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.config-section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 10px;
}

.config-section-title i {
    color: var(--primary);
    font-size: 18px;
}

.config-section-body {
    padding: 20px;
}

/* 表单样式 */
.config-form-group {
    margin-bottom: 16px;
}

.config-form-group:last-child {
    margin-bottom: 0;
}

.config-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

.config-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s;
}

.config-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(42, 59, 125, 0.1);
}

/* 配置项列表 */
.config-item-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.config-item-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s;
    cursor: move;
    user-select: none;
}

.config-item-row:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.config-item-row.dragging {
    opacity: 0.5;
    background: #e0e7ff !important;
    border: 2px dashed var(--primary);
}

.config-item-row.drag-over {
    border-top: 2px solid var(--primary);
}

.config-item-row.drag-over-bottom {
    border-bottom: 2px solid var(--primary);
}

.config-drag-handle {
    cursor: grab;
    color: #9ca3af;
    padding: 4px;
}

.config-drag-handle:hover {
    color: var(--primary);
}

.config-drag-handle:active {
    cursor: grabbing;
}

.config-item-row input,
.config-item-row select {
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    transition: all 0.2s;
}

.config-item-row input:focus,
.config-item-row select:focus {
    outline: none;
    border-color: var(--primary);
}

.config-item-row input[type="text"] {
    flex: 1;
    min-width: 80px;
}

.config-item-row select {
    min-width: 90px;
}

.config-item-row input[type="number"] {
    width: 70px;
}

.config-item-row input[type="color"] {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
}

.config-item-actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
}

.config-item-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 12px;
}

.config-item-btn.delete {
    background: #fee2e2;
    color: #dc2626;
}

.config-item-btn.delete:hover {
    background: #fecaca;
}

.config-checkbox-group {
    display: flex;
    align-items: center;
    gap: 6px;
}

.config-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.config-add-btn {
    width: 100%;
    padding: 10px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background: white;
    color: #6b7280;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
    margin-top: 12px;
}

.config-add-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: #f0f4ff;
}

/* 标签页样式 */
.config-tabs {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #f3f4f6;
    border-radius: 8px;
    margin-bottom: 20px;
}

.config-tab {
    padding: 8px 16px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.2s;
}

.config-tab:hover {
    color: #374151;
}

.config-tab.active {
    background: white;
    color: var(--primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.config-tab-content {
    display: none;
}

.config-tab-content.active {
    display: block;
}

/* 数据管理表格 */
.config-list-section {
    grid-column: 1 / -1;
}

.config-list-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.config-list-search {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
}

.config-list-search:focus {
    outline: none;
    border-color: var(--primary);
}

.config-list-table-wrapper {
    max-height: 400px;
    overflow: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.config-list-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.config-list-table th {
    background: #f8fafc;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 1;
}

.config-list-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #f3f4f6;
}

.config-list-table tr:hover td {
    background: #f9fafb;
}

.config-list-table input,
.config-list-table select {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 13px;
}

.config-list-table input:focus,
.config-list-table select:focus {
    outline: none;
    border-color: var(--primary);
}

.config-list-btn {
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
}

.config-list-btn.delete {
    background: #fee2e2;
    color: #dc2626;
}

.config-list-btn.delete:hover {
    background: #fecaca;
}

.config-list-empty {
    text-align: center;
    padding: 60px;
    color: #9ca3af;
}

.config-list-empty i {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
}

/* 分页样式 */
.config-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.config-pagination-info {
    font-size: 13px;
    color: #6b7280;
}

.config-pagination-pages {
    display: flex;
    gap: 6px;
}

.config-pagination-btn {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
}

.config-pagination-btn:hover {
    background: #f3f4f6;
}

.config-pagination-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.config-pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 底部操作栏 */
.config-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 16px 40px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.config-footer-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.config-footer-btn.secondary {
    background: #f3f4f6;
    color: #374151;
}

.config-footer-btn.secondary:hover {
    background: #e5e7eb;
}

.config-footer-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%);
    color: white;
}

.config-footer-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(42, 59, 125, 0.3);
}

/* Toast 提示 */
.config-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 14px 20px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateX(120%);
    transition: transform 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
}

.config-toast.show {
    transform: translateX(0);
}

.config-toast.error {
    background: #ef4444;
}

.hidden {
    display: none !important;
}
```

### 3.3 HTML 结构

```html
<div class="config-header">
    <div class="config-header-left">
        <div>
            <div class="config-header-title">
                <i class="fa fa-magic"></i>
                <span>可视化配置中心</span>
            </div>
            <div class="config-header-subtitle">[模块名称] - 配置页面元素和数据</div>
        </div>
    </div>
    <div class="config-header-actions">
        <button class="config-header-btn back" onclick="goBack()">
            <i class="fa fa-arrow-left"></i>
            <span>返回主页面</span>
        </button>
        <button class="config-header-btn primary" onclick="saveAndApply()">
            <i class="fa fa-check"></i>
            <span>保存并应用</span>
        </button>
    </div>
</div>

<div class="config-container">
    <div class="config-tabs">
        <button class="config-tab active" onclick="switchTab('basic')">
            <i class="fa fa-cog"></i> 基础配置
        </button>
        <button class="config-tab" onclick="switchTab('data')">
            <i class="fa fa-database"></i> 数据管理
        </button>
        <button class="config-tab" onclick="switchTab('import')">
            <i class="fa fa-exchange-alt"></i> 导入导出
        </button>
    </div>

    <!-- 基础配置 Tab -->
    <div id="tabBasic" class="config-tab-content active">
        <div class="config-grid">
            <!-- 页面配置 -->
            <div class="config-section">
                <div class="config-section-header">
                    <div class="config-section-title">
                        <i class="fa fa-file-text-o"></i>
                        <span>页面配置</span>
                    </div>
                </div>
                <div class="config-section-body">
                    <div class="config-form-group">
                        <label class="config-label">页面标题</label>
                        <input type="text" class="config-input" id="configPageTitle" value="[默认标题]" placeholder="请输入页面标题">
                    </div>
                    <div class="config-form-group">
                        <label class="config-label">模块名称</label>
                        <input type="text" class="config-input" id="configModuleName" value="[模块名称]" placeholder="请输入模块名称">
                    </div>
                </div>
            </div>

            <!-- 筛选条件配置 -->
            <div class="config-section">
                <div class="config-section-header">
                    <div class="config-section-title">
                        <i class="fa fa-filter"></i>
                        <span>筛选条件配置</span>
                    </div>
                    <button class="config-add-btn" style="width: auto; margin-top: 0; padding: 6px 12px;" onclick="addFilterItem()">
                        <i class="fa fa-plus"></i> 添加
                    </button>
                </div>
                <div class="config-section-body">
                    <div class="config-item-list" id="configFilters"></div>
                </div>
            </div>

            <!-- 表格列配置 -->
            <div class="config-section">
                <div class="config-section-header">
                    <div class="config-section-title">
                        <i class="fa fa-table"></i>
                        <span>表格列配置</span>
                    </div>
                    <button class="config-add-btn" style="width: auto; margin-top: 0; padding: 6px 12px;" onclick="addColumnItem()">
                        <i class="fa fa-plus"></i> 添加
                    </button>
                </div>
                <div class="config-section-body">
                    <div class="config-item-list" id="configColumns"></div>
                </div>
            </div>

            <!-- 操作按钮配置 -->
            <div class="config-section">
                <div class="config-section-header">
                    <div class="config-section-title">
                        <i class="fa fa-mouse-pointer"></i>
                        <span>操作按钮配置</span>
                    </div>
                    <button class="config-add-btn" style="width: auto; margin-top: 0; padding: 6px 12px;" onclick="addButtonItem()">
                        <i class="fa fa-plus"></i> 添加
                    </button>
                </div>
                <div class="config-section-body">
                    <div class="config-item-list" id="configButtons"></div>
                </div>
            </div>

            <!-- 状态徽章配置 -->
            <div class="config-section">
                <div class="config-section-header">
                    <div class="config-section-title">
                        <i class="fa fa-tags"></i>
                        <span>状态徽章配置</span>
                    </div>
                    <button class="config-add-btn" style="width: auto; margin-top: 0; padding: 6px 12px;" onclick="addStatusItem()">
                        <i class="fa fa-plus"></i> 添加
                    </button>
                </div>
                <div class="config-section-body">
                    <div class="config-item-list" id="configStatuses"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 数据管理 Tab -->
    <div id="tabData" class="config-tab-content">
        <div class="config-section config-list-section">
            <div class="config-section-header">
                <div class="config-section-title">
                    <i class="fa fa-database"></i>
                    <span>列表数据管理</span>
                </div>
                <button class="config-add-btn" style="width: auto; margin-top: 0; padding: 6px 12px;" onclick="addListDataRow()">
                    <i class="fa fa-plus"></i> 添加数据
                </button>
            </div>
            <div class="config-section-body">
                <div class="config-list-toolbar">
                    <input type="text" class="config-list-search" id="configListSearch" placeholder="搜索数据..." oninput="filterListData()">
                </div>
                <div class="config-list-table-wrapper">
                    <div id="configListDataContainer"></div>
                </div>
                <div class="config-pagination">
                    <div class="config-pagination-info">
                        共 <span id="configListTotal">0</span> 条数据
                    </div>
                    <div class="config-pagination-pages" id="configListPages"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- 导入导出 Tab -->
    <div id="tabImport" class="config-tab-content">
        <div class="config-grid">
            <div class="config-section">
                <div class="config-section-header">
                    <div class="config-section-title">
                        <i class="fa fa-download"></i>
                        <span>导出配置</span>
                    </div>
                </div>
                <div class="config-section-body">
                    <p style="color: #6b7280; margin-bottom: 16px;">将当前配置导出为 JSON 文件，方便备份或分享给他人。</p>
                    <button class="config-footer-btn primary" onclick="exportConfig()">
                        <i class="fa fa-download"></i>
                        <span>导出配置文件</span>
                    </button>
                </div>
            </div>

            <div class="config-section">
                <div class="config-section-header">
                    <div class="config-section-title">
                        <i class="fa fa-upload"></i>
                        <span>导入配置</span>
                    </div>
                </div>
                <div class="config-section-body">
                    <p style="color: #6b7280; margin-bottom: 16px;">从 JSON 文件导入配置，将覆盖当前配置。</p>
                    <input type="file" id="configFileInput" accept=".json" style="display: none;" onchange="handleConfigImport(event)">
                    <button class="config-footer-btn secondary" onclick="importConfig()">
                        <i class="fa fa-upload"></i>
                        <span>选择配置文件</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Toast 提示 -->
<div class="config-toast" id="configToast">
    <i class="fa fa-check-circle"></i>
    <span id="configToastText">操作成功</span>
</div>
```

### 3.4 JavaScript 逻辑

```javascript
// 存储键名（根据模块修改）
const STORAGE_KEY = 'pageConfig_[模块名称]';

// 默认配置数据
let pageConfig = {
    pageTitle: '[默认标题]',
    moduleName: '[模块名称]',
    filters: [
        { id: 1, label: '筛选字段', field: 'field1', type: 'text', placeholder: '请输入' }
    ],
    columns: [
        { id: 1, label: '列名', field: 'field1', width: '120', align: 'left', visible: true }
    ],
    buttons: [
        { id: 1, label: '新增', type: 'primary', icon: 'fa-plus', visible: true, action: 'add' }
    ],
    statuses: [
        { id: 1, label: '启用', value: 'enabled', color: '#00B42A', bgColor: '#dcfce7' }
    ],
    listData: []
};

// 列表数据分页配置
let listDataPage = {
    current: 1,
    pageSize: 5,
    total: 0,
    filtered: []
};

// 拖拽相关变量
let draggedItem = null;
let draggedType = null;

// 标签页切换
function switchTab(tab) {
    document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.config-tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.config-tab[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

// 返回主页面
function goBack() {
    window.location.href = 'index.html';
}

// 保存并应用配置
function saveAndApply() {
    pageConfig.pageTitle = document.getElementById('configPageTitle').value;
    pageConfig.moduleName = document.getElementById('configModuleName').value;
    
    saveConfigToStorage();
    toast('配置已保存！');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Toast 提示
function toast(message, type = 'success') {
    const toastEl = document.getElementById('configToast');
    const textEl = document.getElementById('configToastText');
    textEl.textContent = message;
    toastEl.className = 'config-toast show' + (type === 'error' ? ' error' : '');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// 加载配置到面板
function loadConfigToPanel() {
    document.getElementById('configPageTitle').value = pageConfig.pageTitle;
    document.getElementById('configModuleName').value = pageConfig.moduleName;
    
    renderFilterItems();
    renderColumnItems();
    renderButtonItems();
    renderStatusItems();
    renderListDataConfig();
}

// 渲染筛选条件项
function renderFilterItems() {
    const container = document.getElementById('configFilters');
    container.innerHTML = pageConfig.filters.map((item) => `
        <div class="config-item-row" data-id="${item.id}" data-type="filter" draggable="true" 
             ondragstart="handleDragStart(event, 'filter', ${item.id})" 
             ondragover="handleDragOver(event)" 
             ondragleave="handleDragLeave(event)" 
             ondrop="handleDrop(event, 'filter', ${item.id})">
            <span class="config-drag-handle"><i class="fa fa-grip-vertical"></i></span>
            <input type="text" value="${item.label}" placeholder="标签名" onchange="updateFilterItem(${item.id}, 'label', this.value)">
            <select onchange="updateFilterItem(${item.id}, 'type', this.value)">
                <option value="text" ${item.type === 'text' ? 'selected' : ''}>文本框</option>
                <option value="select" ${item.type === 'select' ? 'selected' : ''}>下拉框</option>
                <option value="date" ${item.type === 'date' ? 'selected' : ''}>日期</option>
            </select>
            <input type="text" value="${item.placeholder || item.options || ''}" placeholder="占位符/选项" onchange="updateFilterItem(${item.id}, this.previousElementSibling.value === 'select' ? 'options' : 'placeholder', this.value)">
            <div class="config-item-actions">
                <button class="config-item-btn delete" onclick="deleteFilterItem(${item.id})" title="删除"><i class="fa fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addFilterItem() {
    const newId = Math.max(...pageConfig.filters.map(f => f.id), 0) + 1;
    pageConfig.filters.push({
        id: newId,
        label: '新筛选',
        field: 'field' + newId,
        type: 'text',
        placeholder: '请输入'
    });
    renderFilterItems();
}

function updateFilterItem(id, key, value) {
    const item = pageConfig.filters.find(f => f.id === id);
    if (item) item[key] = value;
}

function deleteFilterItem(id) {
    pageConfig.filters = pageConfig.filters.filter(f => f.id !== id);
    renderFilterItems();
}

// 渲染表格列项
function renderColumnItems() {
    const container = document.getElementById('configColumns');
    container.innerHTML = pageConfig.columns.map((item) => `
        <div class="config-item-row" data-id="${item.id}" data-type="column" draggable="true"
             ondragstart="handleDragStart(event, 'column', ${item.id})" 
             ondragover="handleDragOver(event)" 
             ondragleave="handleDragLeave(event)" 
             ondrop="handleDrop(event, 'column', ${item.id})">
            <span class="config-drag-handle"><i class="fa fa-grip-vertical"></i></span>
            <input type="text" value="${item.label}" placeholder="列名" style="width: 100px; flex: none;" onchange="updateColumnItem(${item.id}, 'label', this.value)">
            <input type="text" value="${item.field}" placeholder="字段名" style="width: 100px; flex: none;" onchange="updateColumnItem(${item.id}, 'field', this.value)">
            <input type="number" value="${item.width}" placeholder="宽度" style="width: 70px;" onchange="updateColumnItem(${item.id}, 'width', this.value)">
            <select onchange="updateColumnItem(${item.id}, 'align', this.value)">
                <option value="left" ${item.align === 'left' ? 'selected' : ''}>左</option>
                <option value="center" ${item.align === 'center' ? 'selected' : ''}>中</option>
                <option value="right" ${item.align === 'right' ? 'selected' : ''}>右</option>
            </select>
            <div class="config-checkbox-group">
                <input type="checkbox" class="config-checkbox" ${item.visible ? 'checked' : ''} onchange="updateColumnItem(${item.id}, 'visible', this.checked)">
                <span style="font-size: 12px; color: #6b7280;">显示</span>
            </div>
            <div class="config-item-actions">
                <button class="config-item-btn delete" onclick="deleteColumnItem(${item.id})" title="删除"><i class="fa fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addColumnItem() {
    const newId = Math.max(...pageConfig.columns.map(c => c.id), 0) + 1;
    pageConfig.columns.push({
        id: newId,
        label: '新列',
        field: 'field' + newId,
        width: '100',
        align: 'left',
        visible: true
    });
    renderColumnItems();
}

function updateColumnItem(id, key, value) {
    const item = pageConfig.columns.find(c => c.id === id);
    if (item) item[key] = value;
}

function deleteColumnItem(id) {
    pageConfig.columns = pageConfig.columns.filter(c => c.id !== id);
    renderColumnItems();
}

// 渲染按钮项
function renderButtonItems() {
    const container = document.getElementById('configButtons');
    container.innerHTML = pageConfig.buttons.map((item) => `
        <div class="config-item-row" data-id="${item.id}" data-type="button" draggable="true"
             ondragstart="handleDragStart(event, 'button', ${item.id})" 
             ondragover="handleDragOver(event)" 
             ondragleave="handleDragLeave(event)" 
             ondrop="handleDrop(event, 'button', ${item.id})">
            <span class="config-drag-handle"><i class="fa fa-grip-vertical"></i></span>
            <input type="text" value="${item.label}" placeholder="按钮名" style="width: 100px; flex: none;" onchange="updateButtonItem(${item.id}, 'label', this.value)">
            <select onchange="updateButtonItem(${item.id}, 'type', this.value)">
                <option value="primary" ${item.type === 'primary' ? 'selected' : ''}>主按钮</option>
                <option value="secondary" ${item.type === 'secondary' ? 'selected' : ''}>次要按钮</option>
                <option value="warning" ${item.type === 'warning' ? 'selected' : ''}>警告按钮</option>
                <option value="danger" ${item.type === 'danger' ? 'selected' : ''}>危险按钮</option>
                <option value="success" ${item.type === 'success' ? 'selected' : ''}>成功按钮</option>
            </select>
            <input type="text" value="${item.icon || ''}" placeholder="图标类名" style="width: 100px; flex: none;" onchange="updateButtonItem(${item.id}, 'icon', this.value)">
            <div class="config-checkbox-group">
                <input type="checkbox" class="config-checkbox" ${item.visible ? 'checked' : ''} onchange="updateButtonItem(${item.id}, 'visible', this.checked)">
                <span style="font-size: 12px; color: #6b7280;">显示</span>
            </div>
            <div class="config-item-actions">
                <button class="config-item-btn delete" onclick="deleteButtonItem(${item.id})" title="删除"><i class="fa fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addButtonItem() {
    const newId = Math.max(...pageConfig.buttons.map(b => b.id), 0) + 1;
    pageConfig.buttons.push({
        id: newId,
        label: '新按钮',
        type: 'secondary',
        icon: 'fa-cog',
        visible: true,
        action: 'action' + newId
    });
    renderButtonItems();
}

function updateButtonItem(id, key, value) {
    const item = pageConfig.buttons.find(b => b.id === id);
    if (item) item[key] = value;
}

function deleteButtonItem(id) {
    pageConfig.buttons = pageConfig.buttons.filter(b => b.id !== id);
    renderButtonItems();
}

// 渲染状态项
function renderStatusItems() {
    const container = document.getElementById('configStatuses');
    container.innerHTML = pageConfig.statuses.map((item) => `
        <div class="config-item-row" data-id="${item.id}" data-type="status" draggable="true"
             ondragstart="handleDragStart(event, 'status', ${item.id})" 
             ondragover="handleDragOver(event)" 
             ondragleave="handleDragLeave(event)" 
             ondrop="handleDrop(event, 'status', ${item.id})">
            <span class="config-drag-handle"><i class="fa fa-grip-vertical"></i></span>
            <input type="text" value="${item.label}" placeholder="状态名" style="width: 80px; flex: none;" onchange="updateStatusItem(${item.id}, 'label', this.value)">
            <input type="text" value="${item.value}" placeholder="值" style="width: 80px; flex: none;" onchange="updateStatusItem(${item.id}, 'value', this.value)">
            <input type="color" value="${item.color}" style="width: 40px; height: 28px; border: none; cursor: pointer;" onchange="updateStatusItem(${item.id}, 'color', this.value)" title="文字颜色">
            <input type="color" value="${item.bgColor}" style="width: 40px; height: 28px; border: none; cursor: pointer;" onchange="updateStatusItem(${item.id}, 'bgColor', this.value)" title="背景颜色">
            <div class="config-item-actions">
                <button class="config-item-btn delete" onclick="deleteStatusItem(${item.id})" title="删除"><i class="fa fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addStatusItem() {
    const newId = Math.max(...pageConfig.statuses.map(s => s.id), 0) + 1;
    pageConfig.statuses.push({
        id: newId,
        label: '新状态',
        value: 'status' + newId,
        color: '#2a3b7d',
        bgColor: '#e0e7ff'
    });
    renderStatusItems();
}

function updateStatusItem(id, key, value) {
    const item = pageConfig.statuses.find(s => s.id === id);
    if (item) item[key] = value;
}

function deleteStatusItem(id) {
    pageConfig.statuses = pageConfig.statuses.filter(s => s.id !== id);
    renderStatusItems();
}

// 拖拽功能
function handleDragStart(event, type, id) {
    draggedItem = id;
    draggedType = type;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const target = event.target.closest('.config-item-row');
    if (target && !target.classList.contains('dragging')) {
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        target.classList.remove('drag-over', 'drag-over-bottom');
        target.classList.add(event.clientY < midY ? 'drag-over' : 'drag-over-bottom');
    }
}

function handleDragLeave(event) {
    const target = event.target.closest('.config-item-row');
    if (target) target.classList.remove('drag-over', 'drag-over-bottom');
}

function handleDrop(event, type, targetId) {
    event.preventDefault();
    const target = event.target.closest('.config-item-row');
    if (target) target.classList.remove('drag-over', 'drag-over-bottom');
    
    if (draggedItem === targetId || draggedType !== type) return;
    
    const configKey = { 'filter': 'filters', 'column': 'columns', 'button': 'buttons', 'status': 'statuses' }[type];
    const list = pageConfig[configKey];
    const draggedIndex = list.findIndex(item => item.id === draggedItem);
    const targetIndex = list.findIndex(item => item.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const [draggedObj] = list.splice(draggedIndex, 1);
    const rect = target.getBoundingClientRect();
    const insertIndex = event.clientY < rect.top + rect.height / 2 ? targetIndex : targetIndex + 1;
    list.splice(insertIndex > draggedIndex ? insertIndex - 1 : insertIndex, 0, draggedObj);
    
    const renderFunc = { 'filter': renderFilterItems, 'column': renderColumnItems, 'button': renderButtonItems, 'status': renderStatusItems }[type];
    renderFunc();
    draggedItem = null;
    draggedType = null;
}

// 列表数据管理
function renderListDataConfig() {
    const container = document.getElementById('configListDataContainer');
    const searchTerm = document.getElementById('configListSearch').value.toLowerCase();
    
    listDataPage.filtered = pageConfig.listData.filter(item => 
        Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm))
    );
    
    listDataPage.total = listDataPage.filtered.length;
    const start = (listDataPage.current - 1) * listDataPage.pageSize;
    const pageData = listDataPage.filtered.slice(start, start + listDataPage.pageSize);
    
    if (pageData.length === 0) {
        container.innerHTML = `<div class="config-list-empty"><i class="fa fa-inbox"></i>暂无数据</div>`;
    } else {
        const visibleColumns = pageConfig.columns.filter(c => c.visible && c.field !== 'actions');
        container.innerHTML = `
            <table class="config-list-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        ${visibleColumns.map(col => `<th>${col.label}</th>`).join('')}
                        <th style="width: 80px;">操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageData.map((item, idx) => `
                        <tr>
                            <td>${start + idx + 1}</td>
                            ${visibleColumns.map(col => `
                                <td>
                                    ${col.field === 'status' ? 
                                        `<select onchange="updateListDataRow(${item.id}, 'status', this.value)">
                                            ${pageConfig.statuses.map(s => `<option value="${s.value}" ${item.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
                                        </select>` :
                                        `<input type="text" value="${item[col.field] || ''}" onchange="updateListDataRow(${item.id}, '${col.field}', this.value)">`
                                    }
                                </td>
                            `).join('')}
                            <td>
                                <button class="config-list-btn delete" onclick="deleteListDataRow(${item.id})"><i class="fa fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    document.getElementById('configListTotal').textContent = listDataPage.total;
    renderListDataPagination();
}

function renderListDataPagination() {
    const totalPages = Math.ceil(listDataPage.total / listDataPage.pageSize);
    const pagesContainer = document.getElementById('configListPages');
    
    if (totalPages <= 1) {
        pagesContainer.innerHTML = '';
        return;
    }
    
    let html = `<button class="config-pagination-btn" onclick="goToListDataPage(${listDataPage.current - 1})" ${listDataPage.current === 1 ? 'disabled' : ''}><i class="fa fa-chevron-left"></i></button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= listDataPage.current - 1 && i <= listDataPage.current + 1)) {
            html += `<button class="config-pagination-btn ${i === listDataPage.current ? 'active' : ''}" onclick="goToListDataPage(${i})">${i}</button>`;
        } else if (i === listDataPage.current - 2 || i === listDataPage.current + 2) {
            html += `<span style="padding: 4px 8px;">...</span>`;
        }
    }
    
    html += `<button class="config-pagination-btn" onclick="goToListDataPage(${listDataPage.current + 1})" ${listDataPage.current === totalPages ? 'disabled' : ''}><i class="fa fa-chevron-right"></i></button>`;
    pagesContainer.innerHTML = html;
}

function goToListDataPage(page) {
    const totalPages = Math.ceil(listDataPage.total / listDataPage.pageSize);
    if (page < 1 || page > totalPages) return;
    listDataPage.current = page;
    renderListDataConfig();
}

function filterListData() {
    listDataPage.current = 1;
    renderListDataConfig();
}

function addListDataRow() {
    const newId = Math.max(...pageConfig.listData.map(d => d.id), 0) + 1;
    const newRow = { id: newId };
    pageConfig.columns.forEach(col => {
        if (col.field !== 'actions') newRow[col.field] = '';
    });
    newRow.status = pageConfig.statuses[0]?.value || '';
    pageConfig.listData.unshift(newRow);
    listDataPage.current = 1;
    renderListDataConfig();
}

function updateListDataRow(id, field, value) {
    const item = pageConfig.listData.find(d => d.id === id);
    if (item) item[field] = value;
}

function deleteListDataRow(id) {
    if (confirm('确定要删除这条数据吗？')) {
        pageConfig.listData = pageConfig.listData.filter(d => d.id !== id);
        renderListDataConfig();
    }
}

// 导出配置
function exportConfig() {
    const configJson = JSON.stringify(pageConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${pageConfig.moduleName}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('配置已导出！');
}

// 导入配置
function importConfig() {
    document.getElementById('configFileInput').click();
}

function handleConfigImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            pageConfig = JSON.parse(e.target.result);
            loadConfigToPanel();
            toast('配置已导入！');
        } catch (error) {
            toast('配置文件格式错误！', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// 保存配置到本地存储
function saveConfigToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pageConfig));
}

// 从本地存储加载配置
function loadConfigFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            pageConfig = JSON.parse(saved);
        } catch (e) {
            console.error('加载配置失败', e);
        }
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    loadConfigFromStorage();
    loadConfigToPanel();
});
```

## 4. 配置数据结构

### 4.1 完整配置对象

```javascript
{
    "pageTitle": "页面标题",
    "moduleName": "模块名称",
    "filters": [
        {
            "id": 1,
            "label": "字段标签",
            "field": "fieldName",
            "type": "text|select|date",
            "placeholder": "占位符文本",
            "options": "选项1,选项2,选项3"
        }
    ],
    "columns": [
        {
            "id": 1,
            "label": "列名",
            "field": "fieldName",
            "width": "120",
            "align": "left|center|right",
            "visible": true
        }
    ],
    "buttons": [
        {
            "id": 1,
            "label": "按钮名",
            "type": "primary|secondary|warning|danger|success",
            "icon": "fa-icon-name",
            "visible": true,
            "action": "actionName"
        }
    ],
    "statuses": [
        {
            "id": 1,
            "label": "状态名",
            "value": "statusValue",
            "color": "#000000",
            "bgColor": "#ffffff"
        }
    ],
    "listData": [
        {
            "id": 1,
            "field1": "value1",
            "field2": "value2",
            "status": "statusValue"
        }
    ]
}
```

## 5. 使用说明

### 5.1 创建新模块配置

1. 复制 `config.html` 模板到模块目录
2. 修改 `STORAGE_KEY` 为 `pageConfig_[模块名称]`
3. 修改默认配置数据 `pageConfig`
4. 在主页面添加配置按钮和配置加载逻辑

### 5.2 配置按钮位置

配置按钮默认固定在页面右上角，可根据需要调整 `top` 和 `right` 值：

```css
.config-toggle-btn {
    top: 80px;   /* 距离顶部的距离 */
    right: 20px; /* 距离右侧的距离 */
}
```

### 5.3 扩展配置功能

如需扩展配置功能，可按以下步骤操作：

1. 在 `pageConfig` 对象中添加新的配置项
2. 在 HTML 中添加对应的配置区块
3. 在 JavaScript 中添加渲染和更新函数
4. 在主页面的 `loadConfigFromStorage` 函数中添加应用逻辑

## 6. 注意事项

1. **存储键名唯一性**：每个模块的 `STORAGE_KEY` 必须唯一，避免配置冲突
2. **配置数据备份**：建议定期导出配置文件进行备份
3. **浏览器兼容性**：配置功能依赖 localStorage，需确保浏览器支持
4. **数据量限制**：localStorage 通常有 5MB 限制，大量数据建议使用其他存储方案
