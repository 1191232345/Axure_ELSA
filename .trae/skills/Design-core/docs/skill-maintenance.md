# Skill 维护指南

维护 `.trae/skills` 规则体系时使用。

## 目录结构

```
.trae/skills/
├── role skills.md          # 角色路由（入口，最先读）
├── Design-core/            # PRD + 原型 + 测试用例
│   ├── SKILL.md            # 索引（≤50 行原则：仅索引，细节放子文件）
│   ├── workflow.md         # 五阶段工作流
│   ├── design-tokens.md    # 设计令牌
│   ├── html-templates.md   # HTML 模板
│   ├── css-styles.md       # CSS 规范
│   ├── javascript-guide.md # JS 交互
│   ├── logic-guide.md      # 逻辑说明
│   ├── components/         # 组件细则
│   ├── docs/               # 文档规范 + 检查清单
│   └── infra/              # 部署 + 合规检查
├── project-core/           # 通用工程规范
├── project-frontend-core/
└── project-backend-core/
```

## 维护原则

1. **单一数据源**：同类规范只在一处定义，其他文件引用而非复制
2. **索引与细节分离**：`SKILL.md` 只做索引；详细内容放子文件
3. **可执行优先**：每条规则应能对应可检查的产出物或脚本
4. **与仓库同步**：规范变更后同步更新 `template/` 黄金样例

## 变更检查清单

修改 Skill 后自检：

- [ ] `role skills.md` 中的 Skill 名称与路径仍正确？
- [ ] `SKILL.md` 索引表已更新？
- [ ] `workflow.md` 阶段与新增规范一致？
- [ ] `template/` 脚手架是否需要同步？
- [ ] `infra/compliance-check.sh` 是否需要新检查项？

## 冗余检测

合并或精简 Skill 时，检查：

```bash
# 查找可能重复的标题
rg "^# " .trae/skills/Design-core --glob "*.md" | sort

# 查找断裂的内部链接
rg "\]\([^)]+\.md\)" .trae/skills --glob "*.md"
```

## 版本记录

重大变更在此记录：

| 日期 | 变更 | 说明 |
|------|------|------|
| 2026-06-05 | 精简 Design-core | 从 70+ 文件合并为索引 + 子文件结构 |
| 2026-06-05 | 新增 workflow / template / compliance-check | 修复路由断裂，补齐脚手架 |

## 主题说明

- **标准主题**：`#2a3b7d`（design-tokens.md）— 新模块必须使用
- **Legacy 主题**：`#1B3A4B`（费用管理部分旧模块）— 维护旧模块时沿用，不扩散到新模块
