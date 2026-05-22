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
| [00-design-tokens.md](00-design-tokens.md) | **设计令牌系统**（统一色彩/字体/间距变量 - **唯一数据源**） |
| [01-design-spec.md](01-design-spec.md) | **5分钟速查卡 v2.2**（Top 10最常用设计变量，其余引用 00） |
| [02-css-styles.md](02-css-styles.md) | CSS 样式模板（变量引用 00-design-tokens，.prose 引用 16） |
| [03-html-structure.md](03-html-structure.md) | HTML 页面结构模板（模块化 + FA6升级） |
| [04-javascript.md](04-javascript.md) | **JavaScript 交互函数库 v2.3**（Part1 已迁移至 17，保留模块独有逻辑） |
| [05-logic-description.md](05-logic-description.md) | 逻辑说明区域模板 |
| [06-components.md](06-components.md) | **业务组件库 v2.0**（含空状态/骨架屏/通知等新组件） |
| [07-usage-guide.md](07-usage-guide.md) | **使用说明 v2.2**（5分钟快速上手 + Top 10 FAQ） |
| [08-interaction-states.md](08-interaction-states.md) | 交互状态规范 |
| [09-prd-spec.md](09-prd-spec.md) | PRD文档规范 |
| [10-testcase-spec.md](10-testcase-spec.md) | 测试用例文档规范 |
| [11-testcase-html-template.md](11-testcase-html-template.md) | 测试用例HTML模板（精简版，样式引用 common.css） |
| [12-review-checklist.md](12-review-checklist.md) | 评审检查清单 |
| ~~[13-button-interaction.md]~~ | 🗄️ **已合并**入04-javascript.md |
| ~~[14-config-panel.md]~~ | 🗄️ 已归档至 `/archive/` 目录 |
| [15-data-persistence.md](15-data-persistence.md) | 数据持久化**架构指南**（代码实现见 17-common-js.md） |
| [16-common-css.md](16-common-css.md) | 公共 CSS（.prose 增强版权威定义 + 补充变量） |
| [17-common-js.md](17-common-js.md) | 公共 JS（APIDataManager/StateManager/Toast/Mermaid/Tab **唯一代码源**） |
| [18-skill-maintenance.md](18-skill-maintenance.md) | 🧠 **Skills 自我维护指南**（漂移检测/冗余检测/索引同步/变更记录） |

### 🆕 版本更新记录

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v2.5** | 2026-05-22 | **新增自我维护**：新增18-skill-maintenance.md元技能（漂移检测/冗余检测/索引同步/变更记录），skills体系具备自我总结和更新能力 |
| **v2.4** | 2026-05-22 | **去重优化**：消除CSS变量三重定义(02/16→00)、.prose三重定义(02/11→16)、JS核心函数重复(04 Part1→17)、01字体/间距/动画表格→引用00；15标记为架构指南、11标记为精简版 |
| **v2.3** | 2026-01-18 | 合并13-button-interaction.md到04-javascript.md、精简01-design-spec.md为速查卡、归档14-config-panel.md、重构07-usage-guide.md |
| **v2.1** | 2026-01-18 | **第3批优化**：交互状态全面引入设计令牌(80+硬编码消除)、新增5类v2.0组件完整JS实现(Toast/标签页/骨架屏/Alert/面包屑)、响应式设计系统(6断点+自适应布局)、暗色模式双方案框架(系统跟随+手动切换) |
| **v2.0** | 2026-01-15 | **第1批优化**：新增设计令牌系统、升级前端依赖(FA6/marked9/mermaid11)、补充5个核心组件库（空状态/骨架屏/通知提醒/面包屑/标签页）、移除重复Tailwind配置 |
| **v1.5** | 2026-01-14 | 增加按钮交互逻辑模板、数据持久化支持、公共资源分离 |
| **v1.0** | 2026-01-13 | 初始版本，包含基础设计规范和组件库 |

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

### 设计令牌系统（v2.0 新增）

**推荐优先使用** [00-design-tokens.md](00-design-tokens.md) 中的统一变量，确保全局一致性。

| 规范项 | 值 | 令牌引用 |
|--------|------|----------|
| 主色调 | `#2a3b7d` | `--color-primary` |
| 辅助色 | `#36CFC9` | `--color-secondary` |
| 成功色 | `#00B42A` | `--color-success` |
| 警告色 | `#FF7D00` | `--color-warning` |
| 危险色 | `#F53F3F` | `--color-danger` |

> 详细色彩系统、字体、间距、圆角、阴影等完整定义请参考：
> - **[00-design-tokens.md](00-design-tokens.md)** - 统一令牌（推荐）
> - **[01-design-spec.md](01-design-spec.md)** - 设计规范详解

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

### v2.0 新增组件（2026-01-15）

| 组件 | 文件位置 | 说明 |
|------|----------|------|
| **空状态 (Empty State)** | [06-components.md#12](06-components.md#12) | 无数据/搜索无结果/错误状态，带操作引导 |
| **骨架屏 (Skeleton)** | [06-components.md#13](06-components.md#13) | 表格/卡片/详情页加载占位，支持闪烁动画 |
| **通知提醒 (Alert/Toast)** | [06-components.md#14](06-components.md#14) | 内联提示框 + 全局浮动通知，4种类型 |
| **面包屑导航 (Breadcrumb)** | [06-components.md#15](06-components.md#15) | 基础版 + 图标版 + 可编辑路径版 |
| **标签页 (Tabs)** | [06-components.md#16](06-components.md#16) | 线型 + 卡片型(Pills)，含完整JS控制 |

### 基础组件

筛选器、按钮、模态框、表单、状态徽章、分页等组件详细模板请参考 [06-components.md](06-components.md)

> **注意**：所有组件已统一升级至 **Font Awesome 6** 图标规范

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

> 🗄️ 已归档至 `/archive/` 目录，不再维护。

## 📖 使用指南

完整使用说明请参考 [07-usage-guide.md](07-usage-guide.md)

## ⚠️ 重要提示

1. **设计令牌**：优先使用 [00-design-tokens.md](00-design-tokens.md) 中的CSS变量，避免硬编码颜色值
2. **图标规范**：统一使用 **Font Awesome 6**（`fas`/`far`/`fab`前缀），不再使用FA4的`fa`前缀
3. **依赖版本**：
   - Font Awesome: `6.4.0` (CDN)
   - Marked: `9.1.6` (CDN)
   - Mermaid: `11.6.3` (CDN)
4. 公共资源通过 `/common/` 路径引用
5. 模块样式放在 `css/styles.css`
6. 模块逻辑放在 `js/main.js`
7. 数据文件放在 `data/` 目录
8. 保持命名规范一致（page-[模块标识]、modal-[功能标识]）

### 📌 v2.0 迁移指南

从旧版模板升级时，请注意以下变更：

- [x] **Tailwind配置**：已移除HTML模板中的重复配置，改为引用`00-design-tokens.md`
- [x] **图标class**：`fa fa-xxx` → `fas fa-xxx`（详见03-html-structure.md的迁移对照表）
- [x] **新增组件**：空状态、骨架屏、通知提醒、面包屑、标签页（详见06-components.md v2.0章节）
- [x] **动画增强**：骨架屏支持shimmer闪烁效果，空状态支持fadeInUp入场动画
