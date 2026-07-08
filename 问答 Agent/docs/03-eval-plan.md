# 多轮知识问答助手 — 评估方案（Demo 版）

> **版本：** v0.2 · **定位：** 作品集质量佐证，非生产上线门禁

---

## 1. 评估目标

- 证明 Demo **不是只会单轮问答**，多轮上下文是核心能力
- 为 README / 面试提供 **可截图的指标**
- 指导 Prompt、Query 改写、Chunk 迭代

---

## 2. 测试集结构

MVP 目标 **≥ 30 条**，建议分布：

| 维度 | 占比 | 说明 |
|------|------|------|
| 单轮规则查询 | 25% | 基础 RAG |
| 单轮流程/对比 | 20% | |
| **多轮追问** | **30%** | **v0.2 新增重点** |
| 话题切换 | 10% | 上下文不污染 |
| 拒答/边界 | 15% | |

### 2.1 多轮 Eval 格式（扩展列，可选）

在 CSV 中增加 `turn` 和 `prior_context` 列，或使用 `conversation_id` 分组：

| conversation_id | turn | question | expected_key_points | notes |
|-----------------|------|----------|---------------------|-------|
| CONV-01 | 1 | 英德退货周期区别？ | 英国\|德国\|分别说明 | |
| CONV-01 | 2 | 那德国仓质检标准呢？ | 德国仓\|质检\|CE/UN38.3 | 须继承德国实体 |
| CONV-01 | 3 | 超过 7 天怎么处理？ | 德国\|退货\|升级/隔离 | 指代继承 |

---

## 3. 指标定义

| 指标 | MVP 目标 | 说明 |
|------|----------|------|
| Answer Accuracy（单轮） | ≥ 80% | |
| **Multi-turn Success Rate** | **≥ 80%** | 多轮组内各 turn 均通过 |
| Hit@3 | ≥ 75% | Demo 略放宽 |
| Faithfulness | ≥ 85% | |
| Refusal Precision | ≥ 85% | |
| Topic Switch Accuracy | ≥ 80% | 切换后不受上文误导 |

---

## 4. Demo 门禁（替代「生产上线门禁」）

**V1.0 Demo 可发布须满足：**

- [ ] 3 条 Demo 脚本（PRD UC-01~04）人工通过
- [ ] 多轮 Eval 子集 ≥ 5 组，成功率 ≥ 80%
- [ ] 单轮 Eval ≥ 30 条，Accuracy ≥ 80%
- [ ] 有 1 份 `eval-report.md` 可放进作品集

---

## 5. 多轮判定标准

**通过：** 当前 turn 答案覆盖 `expected_key_points`，且 **实体/话题与 prior_context 一致**。

**典型失败：**

- Turn 2 问「德国仓」却答成美国仓
- Turn 3 指代丢失，答成通用废话
- 话题切换后仍引用上一轮错误 chunk

---

## 6. Bad Case 分类（新增）

| 根因 | 修复方向 |
|------|----------|
| `context_loss` | 增加 history 轮数；Prompt 强调继承实体 |
| `coreference_fail` | 加 Query 改写步骤 |
| `topic_bleed` | 切换话题时 summary 或清空部分 history |
| `retrieval_miss` | 调 chunk / metadata |
| `should_refuse` | 拒答 Prompt |

---

**变更：** v0.2 新增多轮 Eval 维度，门槛从生产 85% 调整为 Demo 80%。
