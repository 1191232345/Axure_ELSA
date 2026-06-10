# TOB 产品设计模板（Design-core）

覆盖需求澄清 → PRD → 原型 → 测试用例 → 评审交付全流程。

> **入口**：先读 [workflow.md](workflow.md) 确认当前阶段，再按需读取下方文档。

## 文件结构

```
[模块目录]/
├── index.html              # 主页面（含原型/PRD/测试用例 Tab）
├── logic-docs.html         # 逻辑说明（独立文件，原型页加载）
├── css/styles.css          # 模块样式
├── js/main.js              # 页面协调（≤300 行）
├── js/api.js               # 数据访问
├── js/renderer.js          # 渲染逻辑
├── js/utils.js             # 工具函数
├── data/[page_id]-data.json
├── prd.md                  # PRD 文档
└── test-cases.md           # 测试用例
```

**新建模块**：`cp -r template/ [业务目录]/[模块名]/`，再替换占位符。

**黄金样例**：`费用管理/规则配置/`（logic-docs + JS 拆分）、`费用调整/`（三件套 Tab 集成）。

## 核心文档索引

### 工作流

| 文档 | 用途 | 何时读取 |
|------|------|---------|
| [工作流](workflow.md) | 五阶段交付流程 + 准入条件 | 任何模块任务开始时 |
| [需求澄清](docs/discovery-guide.md) | 范围确认、待确认问题 | 阶段 1 |
| [Skill 维护](docs/skill-maintenance.md) | 规则体系维护 | 更新 Skill 时 |

### 设计规范

| 文档 | 用途 | 何时读取 |
|------|------|---------|
| [设计令牌](design-tokens.md) | 色彩、字体、间距（新模块用 `#2a3b7d`） | 开始设计时 |
| [CSS 样式](css-styles.md) | 页面、表格、表单、模态框等样式 | 编写 CSS 时 |
| [HTML 模板](html-templates.md) | 页面骨架、搜索卡片、表格、模态框 | 编写 HTML 时 |
| [交互状态](interaction-states.md) | 输入框、按钮、表格等状态 | 添加交互时 |

### 组件库

| 文档 | 用途 |
|------|------|
| [组件库索引](components.md) | 快速索引 |
| [按钮](components/button.md) · [标签页](components/tabs.md) · [模态框](components/modal.md) |
| [Toast](components/toast.md) · [面包屑](components/breadcrumb.md) |
| [表格](components/table.md) · [表单](components/form.md) · [筛选器](components/filter.md) · [分页](components/pagination.md) |

### 交互与文档

| 文档 | 用途 |
|------|------|
| [JavaScript 指南](javascript-guide.md) | CRUD、搜索、分页、状态管理 |
| [逻辑说明指南](logic-guide.md) | 弹窗式逻辑说明编写模板（入口卡片+弹窗+Tab切换） |
| [PRD 规范](docs/prd-spec.md) | PRD 编写 |
| [测试用例规范](docs/testcase-spec.md) | 测试用例编写 |
| [检查清单](docs/checklists.md) | 评审 + 安全检查 |

### 基础设施

| 文档 | 用途 |
|------|------|
| [数据持久化](infra/data-persistence.md) | localStorage + JSON 方案 |
| [部署指南](infra/deployment.md) | GitHub Pages / Vercel |
| [合规检查脚本](infra/compliance-check.sh) | 交付前自动检查 |

## 设计规范（摘要）

1. **设计令牌优先**：新模块用 `#2a3b7d`，禁止随意自定义主题色
2. **图标**：Font Awesome 6（`fas`/`far`），图标与文字间距 `mr-1.5`
3. **文件拆分**：`main.js` ≤ 300 行；逻辑说明内嵌弹窗模式（见 logic-guide.md）
4. **按需读取**：先读索引，再读详细文档
5. **交付前**：运行 `bash .trae/skills/Design-core/infra/compliance-check.sh [模块目录]`
