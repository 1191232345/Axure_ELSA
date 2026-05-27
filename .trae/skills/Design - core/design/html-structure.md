# HTML 页面结构模板

HTML结构索引，代码拆分到 `html/` 子目录。

> CSS样式 → [css/](css/) | 交互逻辑 → [interaction/](../interaction/)

## 子文件索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [head-setup](html/head-setup.md) | 文件结构 + CDN + Tailwind/Mermaid/Marked配置 | ~80 |
| [page-skeleton](html/page-skeleton.md) | Header + Tab + PRD + Mermaid模态框 | ~60 |
| [prototype](html/prototype.md) | 搜索卡片 + 操作卡片 + 表格 + 分页 | ~70 |
| [logic-section](html/logic-section.md) | 可折叠逻辑说明区域 | ~80 |
| [modals](html/modals.md) | 表单模态框 + 确认删除对话框 | ~60 |

## 组装顺序

1. `head-setup` → `<head>` 部分
2. `page-skeleton` → `<body>` 骨架
3. `prototype` → 原型主内容区
4. `logic-section` → 逻辑说明（表格下方）
5. `modals` → 模态框（`</body>` 前）

## Font Awesome 6 命名

- 实心：`fas fa-*`（如 `fas fa-search`）
- 常规：`far fa-*`（如 `far fa-edit`）
- 品牌：`fab fa-*`（如 `fab fa-github`）
