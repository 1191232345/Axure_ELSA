---
name: "tob-design-template"
description: "TOB产品全流程设计模板。用于生成企业级HTML原型页面、PRD文档和测试用例。采用模块化文件结构，便于维护。"
---

# TOB 产品设计模板

确保所有产品设计保持一致的设计风格和交互体验。覆盖原型设计、PRD文档、测试用例编写全流程，采用模块化文件结构。

## 📁 文件结构

### 模块目录结构

```
[模块目录]/
├── index.html              # 主页面（精简版）
├── css/
│   └── styles.css          # 模块样式
├── js/
│   └── main.js             # 模块交互逻辑
├── data/
│   └── [page_id]-data.json # 数据文件
├── prd.md                  # PRD文档
└── test-cases.md           # 测试用例
```

### 公共资源结构

```
common/
├── css/
│   └── common.css          # 公共样式
└── js/
    └── common.js           # 公共JS（APIDataManager等）

server/                      # Node.js 服务器
├── server.js
├── package.json
└── ecosystem.config.js
```

## 📋 模板文件清单

| 文件 | 说明 |
|------|------|
| [01-design-spec.md](01-design-spec.md) | 核心设计规范（主题色彩、字体、间距） |
| [02-css-styles.md](02-css-styles.md) | CSS 样式模板（完整样式定义） |
| [03-html-structure.md](03-html-structure.md) | HTML 页面结构模板（模块化） |
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
| [16-common-css.md](16-common-css.md) | 公共 CSS 模板 |
| [17-common-js.md](17-common-js.md) | 公共 JS 模板 |

## 🚀 快速开始

### 1. 启动服务器

```bash
cd /Users/zsw/Desktop/Axure_ELSA/server
npm run pm2:start
```

访问地址：http://localhost:3100/

### 2. 创建新模块

1. 创建模块目录：`mkdir -p [模块目录]/{css,js,data}`
2. 复制 [03-html-structure.md](03-html-structure.md) 中的页面结构到 `index.html`
3. 创建 `js/main.js` 编写模块交互逻辑
4. 创建 `css/styles.css` 编写模块样式（可选）
5. 配置 `DATA_CONFIG` 数据持久化

### 3. 引入公共资源

```html
<!-- 公共样式 -->
<link rel="stylesheet" href="/common/css/common.css">

<!-- 公共JS -->
<script src="/common/js/common.js"></script>
```

## 🎨 核心设计规范

主题色彩、字体、间距等详细规范请参考 [01-design-spec.md](01-design-spec.md)

| 规范项 | 值 |
|--------|------|
| 主色调 | `#2a3b7d` |
| 辅助色 | `#36CFC9` |
| 成功色 | `#00B42A` |
| 警告色 | `#FF7D00` |
| 危险色 | `#F53F3F` |

## 💾 数据持久化

使用 Node.js 服务器读写数据文件，支持 Git 同步。

```javascript
const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: '[模块目录]/data/[page_id]-data.json',
    apiBase: 'http://localhost:3100/api/data',
    version: '1.0.0'
};
```

详细模板请参考 [15-data-persistence.md](15-data-persistence.md)

## 🧩 业务组件

筛选器、按钮、模态框、表单、状态徽章、分页等组件详细模板请参考 [06-components.md](06-components.md)

## 📝 逻辑说明

**重要：逻辑说明应放置在原型tab页下。**

详细模板请参考 [05-logic-description.md](05-logic-description.md)

## 📋 PRD文档规范

文档结构、功能模块格式等详细规范请参考 [09-prd-spec.md](09-prd-spec.md)

## 🧪 测试用例规范

用例编号格式、优先级定义、表格格式等详细规范请参考 [10-testcase-spec.md](10-testcase-spec.md)

## ✅ 评审检查清单

PRD评审、原型评审、测试用例评审的检查项详细清单请参考 [12-review-checklist.md](12-review-checklist.md)

## ⚙️ 可视化配置面板

可视化配置面板为非技术人员提供友好的原型配置界面，详细模板请参考 [14-config-panel.md](14-config-panel.md)

## 📖 使用指南

完整使用说明请参考 [07-usage-guide.md](07-usage-guide.md)

## ⚠️ 重要提示

1. 公共资源通过 `/common/` 路径引用
2. 模块样式放在 `css/styles.css`
3. 模块逻辑放在 `js/main.js`
4. 数据文件放在 `data/` 目录
5. 保持命名规范一致（page-[模块标识]、modal-[功能标识]）
