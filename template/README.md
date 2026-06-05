# 模块脚手架模板

新建 TOB 模块时复制此目录：

```bash
cp -r template/ 费用管理/新模块名/
```

## 替换清单

| 占位符 | 替换为 |
|--------|--------|
| `[模块名称]` | 实际模块中文名 |
| `[page_id]` | 英文 page id（如 `rule-config`） |
| `module-data.json` | `[page_id]-data.json` |

## 交付检查

```bash
bash .trae/skills/Design-core/infra/compliance-check.sh 费用管理/新模块名/
```

## 参考范例

- `费用管理/规则配置/` — logic-docs + JS 拆分
- `费用调整/` — PRD / 测试用例 Tab 集成
