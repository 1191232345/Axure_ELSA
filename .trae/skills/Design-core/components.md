# 组件库

完整的UI组件库，包含按钮、标签页、模态框、Toast提示、面包屑导航等所有组件。

## 组件列表

| 组件 | 文件 | 行数 | 包含内容 |
|------|------|------|---------|
| [按钮组件](components/button.md) | button.md | 196行 | 样式 + 状态 + HTML模板 + JavaScript |
| [标签页组件](components/tabs.md) | tabs.md | 379行 | 线型/Pills/逻辑说明面板 + JavaScript |
| [模态框组件](components/modal.md) | modal.md | 209行 | 基础/确认/表单模态框 + JavaScript |
| [Toast提示组件](components/toast.md) | toast.md | 309行 | 成功/错误/警告/信息提示 + JavaScript |
| [面包屑导航组件](components/breadcrumb.md) | breadcrumb.md | 113行 | 基础/带图标样式 + HTML模板 |
| [表格组件](components/table.md) | table.md | - | 数据表格 + 空状态 + 渲染 |
| [表单组件](components/form.md) | form.md | - | 字段布局 + 校验 + 提交流程 |
| [筛选器组件](components/filter.md) | filter.md | - | 搜索卡片 + 筛选逻辑 |
| [分页组件](components/pagination.md) | pagination.md | - | 分页导航 + 每页条数 |

## 快速开始

### 1. 按钮组件

```html
<!-- 主按钮 -->
<button class="erp-btn erp-btn-primary">
    <i class="fa fa-plus mr-1.5"></i> 新增
</button>

<!-- 次要按钮 -->
<button class="erp-btn erp-btn-secondary">
    <i class="fa fa-download mr-1.5"></i> 导出
</button>

<!-- 危险按钮 -->
<button class="erp-btn erp-btn-danger">
    <i class="fa fa-trash mr-1.5"></i> 删除
</button>
```

### 2. 标签页组件

```html
<div class="tabs-container">
    <div class="tabs-header flex border-b border-neutral-200" role="tablist">
        <button class="tab-item active" onclick="switchTab(this, 'tab-1')">基本信息</button>
        <button class="tab-item" onclick="switchTab(this, 'tab-2')">附件管理</button>
    </div>
    <div class="tabs-content pt-4">
        <div id="tab-1" class="tab-pane active">内容1</div>
        <div id="tab-2" class="tab-pane hidden">内容2</div>
    </div>
</div>
```

### 3. 模态框组件

```html
<div id="myModal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">模态框标题</h3>
            <button class="close-btn" onclick="closeModal('myModal')">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="modal-body">内容区域</div>
        <div class="modal-footer">
            <button class="erp-btn erp-btn-secondary" onclick="closeModal('myModal')">取消</button>
            <button class="erp-btn erp-btn-primary">确认</button>
        </div>
    </div>
</div>
```

### 4. Toast提示组件

```javascript
// 成功提示
showToast('操作成功', 'success');

// 错误提示
showToast('操作失败', 'error');

// 警告提示
showToast('请注意', 'warning');

// 信息提示
showToast('提示信息', 'info');
```

### 5. 面包屑导航组件

```html
<nav aria-label="面包屑导航" class="mb-4">
    <ol class="breadcrumb flex items-center flex-wrap gap-2 text-sm">
        <li class="breadcrumb-item">
            <a href="/" class="text-neutral-500 hover:text-primary">
                <i class="fas fa-house-chimney mr-1"></i>首页
            </a>
        </li>
        <li class="breadcrumb-separator text-neutral-400">
            <i class="fas fa-chevron-right text-xs"></i>
        </li>
        <li class="breadcrumb-item active text-primary font-medium">当前页面</li>
    </ol>
</nav>
```

## 组件使用规范

### 1. 按钮组件

- **按钮文案**：简洁明了，建议2-4个字
- **图标使用**：统一使用 Font Awesome 6，`mr-1.5` 表示图标与文字间距
- **禁用状态**：使用 `disabled` 属性，自动应用禁用样式
- **按钮组合**：使用 `flex gap-2` 布局，保持按钮间距一致

### 2. 标签页组件

- **标签数量**：建议不超过5个标签，避免界面拥挤
- **标签文案**：简洁明了，建议2-4个字
- **默认激活**：第一个标签默认添加 `active` 类
- **响应式**：标签头部支持横向滚动，适配移动端

### 3. 模态框组件

- **模态框ID**：每个模态框必须有唯一的ID
- **遮罩层点击**：支持点击遮罩层关闭，提升用户体验
- **滚动锁定**：打开模态框时锁定body滚动，关闭时恢复
- **按钮布局**：取消按钮在左，确认按钮在右

### 4. Toast提示组件

- **消息内容**：简洁明了，建议不超过20个字
- **类型选择**：success/error/warning/info
- **显示时长**：默认3秒，重要信息可延长至5秒
- **位置固定**：右上角显示，避免遮挡重要内容

### 5. 面包屑导航组件

- **层级深度**：建议不超过4级，避免路径过长
- **分隔符**：统一使用 `fa-chevron-right` 图标
- **当前页面**：最后一项添加 `active` 类
- **无障碍**：使用 `nav` 和 `aria-label` 提升可访问性

## 设计原则

1. **一致性**：所有组件遵循统一的设计规范
2. **可复用**：组件设计考虑复用性，避免重复开发
3. **可扩展**：组件结构清晰，易于扩展新功能
4. **无障碍**：所有组件支持无障碍访问
5. **响应式**：所有组件支持响应式布局

## 文件结构

```
components/
├── button.md          # 按钮组件（完整）
├── tabs.md            # 标签页组件（完整）
├── modal.md           # 模态框组件（完整）
├── toast.md           # Toast提示组件（完整）
└── breadcrumb.md      # 面包屑导航组件（完整）
```

## 相关文档

- [设计令牌](design-tokens.md) - 色彩、字体、间距等设计规范
- [CSS样式](css-styles.md) - 页面基础、卡片、表单等样式规范
- [交互状态](interaction-states.md) - 输入框、模态框、表格等交互状态
- [JavaScript指南](javascript-guide.md) - CRUD、搜索、分页等交互逻辑
- [逻辑说明](logic-guide.md) - 页面逻辑说明模板
