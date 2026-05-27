# TOB 产品设计模板

覆盖原型设计、PRD文档、测试用例编写全流程。

## 文件结构

```
[模块目录]/
├── index.html              # 主页面
├── css/styles.css          # 模块样式
├── js/main.js              # 模块交互逻辑
├── data/[page_id]-data.json # 数据文件
├── prd.md                  # PRD文档
└── test-cases.md           # 测试用例
```

## 模板索引

### 设计规范 `design/`

| 索引文件 | 子目录 | 子文件数 | 用途 |
|----------|--------|---------|------|
| [design-tokens](design/design-tokens.md) | `tokens/` | 6 | 设计令牌（色彩/字体/间距/阴影/布局/配置） |
| [css-styles](design/css-styles.md) | `css/` | 11 | CSS样式（基础/导航/标签/卡片/按钮/表格/模态框/表单/图表/反馈/面包屑） |
| [interaction-states](design/interaction-states.md) | `states/` | 9 | 交互状态（按钮/输入框/标签页/模态框/表格/导航/目录/徽章/Toast） |
| [html-structure](design/html-structure.md) | `html/` | 6 | HTML结构（Head/骨架/原型/逻辑说明/模态框/设计方案对比） |
| [common-css](design/common-css.md) | `common-css/` | 3 | 公共CSS（按钮/表单模态框/表格分页） |
| [design-spec](design/design-spec.md) | - | - | 速查卡（Top 10变量） |

### 交互逻辑 `interaction/`

| 索引文件 | 子目录 | 子文件数 | 用途 |
|----------|--------|---------|------|
| [logic-description](interaction/logic-description.md) | `logic/` | 5 | 逻辑说明（初始化/检索/按钮/属性取值/示例） |
| [components](interaction/components.md) | - | - | 业务组件库索引 |
| [javascript](interaction/javascript.md) | - | - | JS交互函数索引 |
| [common-js](interaction/common-js.md) | - | - | 公共JS索引 |

### 文档规范 `docs/`

| 文件 | 用途 | 何时读取 |
|------|------|---------|
| [prd-spec](docs/prd-spec.md) | PRD文档规范 | 写PRD时 |
| [testcase-spec](docs/testcase-spec.md) | 测试用例规范 | 写测试用例时 |
| [security-checklist](docs/security-checklist.md) | 安全检查清单 | 部署前检查 |

### 基础设施 `infra/`

| 文件 | 用途 | 何时读取 |
|------|------|---------|
| [data-persistence](infra/data-persistence.md) | 数据持久化方案 | 配置数据存储时 |
| [deployment-workflow](infra/deployment-workflow.md) | 端到端部署工作流 | 开发→迭代→部署流程 |
| [deployment-platforms](infra/deployment-platforms.md) | 部署平台指南 | GitHub Pages/Vercel部署 |
| [usage-guide](infra/usage-guide.md) | 使用说明 | 快速上手/FAQ |
| [skill-maintenance](infra/skill-maintenance.md) | Skills维护指南 | 检查skills健康状态 |

## 重要提示

1. **设计令牌**：优先使用CSS变量，禁止硬编码颜色值
2. **图标规范**：统一使用 Font Awesome 6（`fas`/`far`/`fab`前缀）
3. **文件拆分**：索引文件≤200行，子文件≤300行
4. **按需读取**：先读索引文件，再按需读取子文件，避免一次性加载全部内容
