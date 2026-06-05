# 模块交付工作流

定义从需求澄清到评审交付的五个阶段。每个阶段有明确输入、输出和准入条件。

## 阶段总览

```mermaid
graph LR
    A["1 需求澄清"] --> B["2 PRD 草案"]
    B --> C["3 原型设计"]
    C --> D["4 测试用例"]
    D --> E["5 评审交付"]
```

---

## 阶段 1：需求澄清

**目标**：确认做什么、不做什么，消除歧义。

| 项 | 内容 |
|----|------|
| 读取 | [docs/discovery-guide.md](docs/discovery-guide.md) |
| 输出 | 范围说明（In/Out of Scope）+ 待确认问题清单 |
| 准入下一阶段 | 用户确认范围，无未决 P0 问题 |

**禁止**：未确认范围前写 PRD 或画原型。

---

## 阶段 2：PRD 草案

**目标**：产出可评审的产品需求文档。

| 项 | 内容 |
|----|------|
| 读取 | [docs/prd-spec.md](docs/prd-spec.md) |
| 输出 | `prd.md`（执行摘要 + 用户流程 + 功能清单 + 按钮/字段逻辑） |
| 准入下一阶段 | PRD 功能清单完整，P0 功能无歧义 |

**PRD 与 logic-docs 分工**：

- **PRD**：为什么做、业务流程、业务规则、成功指标
- **logic-docs**（下一阶段）：页面怎么表现、字段怎么取、按钮前后置

**禁止**：在 PRD 中写具体 CSS 类名或 DOM 结构。

---

## 阶段 3：原型设计

**目标**：产出可交互高保真原型 + 页面逻辑说明。

| 项 | 内容 |
|----|------|
| 读取 | [SKILL.md](SKILL.md)、[design-tokens.md](design-tokens.md)、[html-templates.md](html-templates.md)、按需读组件文档 |
| 起点 | `cp -r template/ [业务目录]/[模块名]/` |
| 输出 | `index.html` + `css/styles.css` + `js/` + `logic-docs.html` + `data/*.json` |
| 准入下一阶段 | 原型覆盖 PRD 全部 P0 功能；logic-docs 四项完整 |

### logic-docs 四项（强制）

1. 初始化页面（数据展示逻辑）
2. 检索条件
3. 模块按钮逻辑
4. 属性取值逻辑

### 代码约束

- 新模块使用标准设计令牌（`#2a3b7d`，见 design-tokens.md）
- `main.js` ≤ 300 行；超过 50 行的逻辑块拆到子文件
- 沿用 `common/js/common.js` 公共能力

**禁止**：PRD 未评审通过前实现 P1 增强功能；禁止硬编码真实用户数据。

---

## 阶段 4：测试用例

**目标**：覆盖 PRD 功能点，支撑验收。

| 项 | 内容 |
|----|------|
| 读取 | [docs/testcase-spec.md](docs/testcase-spec.md) |
| 输出 | `test-cases.md` |
| 准入下一阶段 | P0 用例齐全；正向 + 异常 + 边界场景覆盖 |

**禁止**：测试用例描述与 PRD / 原型字段名不一致。

---

## 阶段 5：评审交付

**目标**：三方一致性通过，可交付研发。

| 项 | 内容 |
|----|------|
| 读取 | [docs/checklists.md](docs/checklists.md) |
| 执行 | 运行 `infra/compliance-check.sh [模块目录]` |
| 输出 | 评审记录（可用 checklists 中的模板） |

### 一致性检查（必须通过）

- [ ] PRD 功能点 ↔ 原型功能一一对应
- [ ] PRD 业务规则 ↔ logic-docs 逻辑一致
- [ ] 原型交互 ↔ 测试用例步骤一致
- [ ] 字段名 / 按钮名三方统一

---

## 快速路径（小改动）

仅修改已有模块的单个功能时，可跳过阶段 1，但仍需：

1. 更新 `prd.md` 对应章节
2. 更新原型与 `logic-docs.html`
3. 补充或修改 `test-cases.md` 对应用例
