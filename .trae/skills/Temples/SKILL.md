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
| [13-button-interaction.md](13-button-interaction.md) | 按钮交互逻辑模板 |
| [14-config-panel.md](14-config-panel.md) | 可视化配置面板模板 |
| [15-data-persistence.md](15-data-persistence.md) | 数据持久化模板 |

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

主题色彩、字体、间距等详细规范请参考 [01-design-spec.md](01-design-spec.md)

## 🖱️ 交互状态规范

按钮、输入框、模态框等交互状态详细规范请参考 [08-interaction-states.md](08-interaction-states.md)

## 🔘 按钮交互逻辑

搜索、新增、编辑、删除、导出、审批等按钮的完整交互逻辑请参考 [13-button-interaction.md](13-button-interaction.md)

## 🧩 业务组件

筛选器、按钮、模态框、表单、状态徽章、分页等组件详细模板请参考 [06-components.md](06-components.md)

## 📝 逻辑说明

**重要：逻辑说明应放置在原型tab页下，而不是PRD或测试用例tab页。**

逻辑说明区域包含：初始化页面逻辑、检索条件、按钮逻辑、属性取值逻辑。详细模板请参考 [05-logic-description.md](05-logic-description.md)

## 📋 PRD文档规范

文档结构、功能模块格式等详细规范请参考 [09-prd-spec.md](09-prd-spec.md)

## 🧪 测试用例规范

用例编号格式、优先级定义、表格格式等详细规范请参考 [10-testcase-spec.md](10-testcase-spec.md)

## 🌐 测试用例HTML模板

页面结构、核心功能等详细模板请参考 [11-testcase-html-template.md](11-testcase-html-template.md)

## ✅ 评审检查清单

PRD评审、原型评审、测试用例评审的检查项详细清单请参考 [12-review-checklist.md](12-review-checklist.md)

## ⚙️ 可视化配置面板

可视化配置面板为非技术人员提供友好的原型配置界面，详细模板请参考 [14-config-panel.md](14-config-panel.md)

## � 数据持久化

列表数据和属性字段的持久化存储方案，确保页面刷新后数据仍然保留。详细模板请参考 [15-data-persistence.md](15-data-persistence.md)

## �📖 使用指南

完整使用说明请参考 [07-usage-guide.md](07-usage-guide.md)

## ⚠️ 重要提示

1. 确保所有 CDN 资源正确引入
2. 自定义 CSS 样式必须放在 `<style>` 标签内
3. JavaScript 必须放在 `</body>` 标签前
4. 保持命名规范一致（page-[模块标识]、modal-[功能标识]）
5. 遵循响应式设计原则
