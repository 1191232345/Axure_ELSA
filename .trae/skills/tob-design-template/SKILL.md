---
name: "tob-design-template"
description: "TOB产品全流程设计模板。用于生成企业级HTML原型页面、PRD文档和测试用例。包含完整的CSS样式、JS交互、页面结构模板、PRD规范、测试用例规范和评审检查清单，适用于所有TOB产品设计需求。"
---

# TOB 产品设计模板

确保所有产品设计保持一致的设计风格和交互体验。覆盖原型设计、PRD文档、测试用例编写全流程，适用于所有TOB产品需求。

## 📁 文件结构

| 文件 | 说明 |
|------|------|
| [01-design-spec.md](01-design-spec.md) | 核心设计规范（主题色彩、字体、间距） |
| [02-css-styles.md](02-css-styles.md) | CSS 样式模板（完整样式定义） |
| [03-html-structure.md](03-html-structure.md) | HTML 页面结构模板 |
| [04-javascript.md](04-javascript.md) | JavaScript 交互模板 |
| [05-logic-description.md](05-logic-description.md) | 逻辑说明区域模板 |
| [06-components.md](06-components.md) | 业务组件库 |
| [07-usage-guide.md](07-usage-guide.md) | 使用说明 |
| [08-interaction-states.md](08-interaction-states.md) | 交互状态规范 |
| [09-prd-spec.md](09-prd-spec.md) | PRD文档规范 |
| [10-testcase-spec.md](10-testcase-spec.md) | 测试用例文档规范 |
| [11-testcase-html-template.md](11-testcase-html-template.md) | 测试用例HTML页面模板 |
| [12-review-checklist.md](12-review-checklist.md) | 评审检查清单 |
| [13-button-interaction.md](13-button-interaction.md) | **按钮交互逻辑模板** |

## 🚀 快速开始

### 创建新模块页面

1. 复制 [03-html-structure.md](03-html-structure.md) 中的完整页面结构
2. 从 [02-css-styles.md](02-css-styles.md) 复制 CSS 样式到 `<style>` 标签
3. 从 [04-javascript.md](04-javascript.md) 复制 JavaScript 到 `<script>` 标签
4. 根据业务需求修改页面内容

### 引入必要资源

```html
<link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@4/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
```

## 🎨 核心设计规范

### 主题色彩

| 颜色 | 色值 | 用途 |
|------|------|------|
| primary | #2a3b7d | 主按钮、导航栏、重点文字 |
| secondary | #36CFC9 | 辅助按钮、图标高亮 |
| success | #00B42A | 成功状态 |
| warning | #FF7D00 | 警告状态 |
| danger | #F53F3F | 错误状态、删除按钮 |

详细规范请参考 [01-design-spec.md](01-design-spec.md)

## 🖱️ 交互状态规范

### 按钮状态

| 状态 | 效果 |
|------|------|
| 默认 | 基础样式 |
| 悬停 | 背景色加深、上移1px、阴影 |
| 按下 | 上移归零、透明度降低 |
| 禁用 | 灰色背景、禁止光标 |

### 输入框状态

| 状态 | 效果 |
|------|------|
| 默认 | 灰色边框 |
| 悬停 | 边框加深 |
| 聚焦 | 主色边框、外发光阴影 |
| 禁用 | 灰色背景、禁止光标 |
| 错误 | 红色边框、红色外发光 |

### 动画时长

| 类型 | 时长 | 使用场景 |
|------|------|----------|
| 快速 | 0.15s | 按钮点击、开关切换 |
| 标准 | 0.2s | 悬停、聚焦、颜色变化 |
| 中等 | 0.3s | 模态框、下拉菜单 |

详细规范请参考 [08-interaction-states.md](08-interaction-states.md)

## 🔘 按钮交互逻辑

### 按钮类型与交互流程

| 按钮类型 | 触发动作 | 后续逻辑 |
|----------|----------|----------|
| 搜索 | 收集搜索参数 → 验证 → 调用API → 渲染结果 | 更新分页、显示提示 |
| 重置 | 确认对话框 → 清空表单 → 加载默认数据 | 显示提示 |
| 新增 | 打开弹窗 → 重置表单 → 聚焦首个字段 | - |
| 保存 | 收集数据 → 验证 → 调用API → 关闭弹窗 → 刷新列表 | 显示成功/失败提示 |
| 编辑 | 加载数据 → 填充表单 → 打开弹窗 | - |
| 删除 | 确认对话框 → 调用API → 刷新列表 | 显示提示 |
| 状态切换 | 确认对话框 → 调用API → 更新行状态 | 显示提示 |
| 导出 | 确认对话框 → 调用API → 下载文件 | 显示提示 |
| 审批 | 打开审批弹窗 → 填写意见 → 调用API → 刷新 | 显示提示 |

### 必备交互组件

| 组件 | 用途 |
|------|------|
| Toast消息 | 操作成功/失败/警告提示 |
| 确认对话框 | 删除、重置等危险操作确认 |
| 加载状态 | 按钮loading、全局loading |
| 表单验证 | 实时验证、提交验证 |

详细模板请参考 [13-button-interaction.md](13-button-interaction.md)

## 🧩 业务组件

### 常用组件

| 组件 | 说明 |
|------|------|
| 筛选器 | 基础筛选器、高级筛选器 |
| 按钮 | 主按钮、次要按钮、警告按钮、危险按钮 |
| 模态框 | 基础模态框、确认对话框、表单模态框 |
| 表单 | 文本输入框、下拉选择框、日期选择器 |
| 状态徽章 | 启用、禁用、待审核、已完成 |
| 分页 | 基础分页、简洁分页 |
| 提示消息 | 成功、错误、警告、信息 |

详细组件请参考 [06-components.md](06-components.md)

## 📝 逻辑说明

每个原型页面底部都应包含逻辑说明区域，包含：

1. **初始化页面（数据展示逻辑）** - 页面加载时的数据展示规则
2. **检索条件** - 搜索字段的输入方式和查询逻辑
3. **按钮逻辑** - 按钮位置、触发动作、前置条件和后续操作
4. **属性取值逻辑** - 字段的数据来源、取值规则和显示格式

详细模板请参考 [05-logic-description.md](05-logic-description.md)

## 📋 PRD文档规范

### 文档结构

| 章节 | 说明 |
|------|------|
| Executive Summary | 执行摘要（问题陈述、解决方案、成功指标） |
| User Experience | 用户体验与用户流程 |
| Functional Modules | 功能模块清单 |
| Functional Logic | 功能模块详细逻辑 |

### 功能模块格式

每个功能模块包含：
- 功能描述
- 前置条件
- 页面元素
- 操作流程
- 业务规则
- 异常处理

详细规范请参考 [09-prd-spec.md](09-prd-spec.md)

## 🧪 测试用例规范

### 用例编号格式

`TC-[模块缩写]-[序号]`

| 模块 | 缩写 | 示例 |
|------|------|------|
| 组织架构管理 | ORG | TC-ORG-101 |
| 用户管理 | USR | TC-USR-001 |
| 集成测试 | INT | TC-INT-001 |

### 优先级定义

| 优先级 | 说明 |
|--------|------|
| P0 | 核心功能，必须通过 |
| P1 | 重要功能，应该通过 |
| P2 | 一般功能，建议通过 |

### 测试用例表格格式

| 字段 | 说明 |
|------|------|
| 用例编号 | 唯一标识 |
| 测试项 | 测试内容描述 |
| 前置条件 | 执行测试前的准备 |
| 测试步骤 | 详细操作步骤 |
| 预期结果 | 期望的测试结果 |
| 优先级 | P0/P1/P2 |

详细规范请参考 [10-testcase-spec.md](10-testcase-spec.md)

## 🌐 测试用例HTML模板

### 页面结构

测试用例HTML页面包含：
- Header（标题、版本、状态）
- 左侧目录导航（sticky定位）
- 右侧内容区域（Markdown渲染）
- Mermaid图表放大预览

### 核心功能

| 功能 | 说明 |
|------|------|
| Markdown渲染 | 自动加载并渲染test-cases.md |
| 目录导航 | 自动生成左侧目录树 |
| 表格样式 | 渐变表头、圆角边框、悬停高亮 |
| Mermaid图表 | 支持流程图点击放大预览 |

详细模板请参考 [11-testcase-html-template.md](11-testcase-html-template.md)

## ✅ 评审检查清单

### PRD评审检查项

- 文档基本信息完整
- 问题陈述清晰，痛点明确
- 解决方案具体可行
- 成功指标可量化
- 用户画像完整
- 用户流程图清晰
- 功能清单完整，优先级合理

### 原型评审检查项

- 页面结构符合设计规范
- 样式符合设计规范
- 交互状态完整
- 逻辑说明清晰

### 测试用例评审检查项

- 用例编号规范统一
- 测试项描述清晰
- 前置条件完整
- 测试步骤可执行
- 预期结果明确

详细清单请参考 [12-review-checklist.md](12-review-checklist.md)

## 📖 使用指南

完整使用说明请参考 [07-usage-guide.md](07-usage-guide.md)

## ⚠️ 重要提示

1. 确保所有 CDN 资源正确引入
2. 自定义 CSS 样式必须放在 `<style>` 标签内
3. JavaScript 必须放在 `</body>` 标签前
4. 保持命名规范一致（page-[模块标识]、modal-[功能标识]）
5. 遵循响应式设计原则
