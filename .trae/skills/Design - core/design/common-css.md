# 公共CSS样式

跨页面复用的公共CSS索引，代码拆分到 `common-css/` 子目录。

> 模块级CSS → [css/](css/) | 交互状态 → [states/](states/)

## 子文件索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [buttons](common-css/buttons.md) | 按钮基础样式（主/次/成功/警告/危险） | ~30 |
| [forms-modals](common-css/forms-modals.md) | 表单元素 + 模态框布局 | ~40 |
| [tables-pagination](common-css/tables-pagination.md) | 数据表格 + 分页组件 | ~25 |

## 使用方式

`/common/css/common.css` 应引入以上全部子文件内容。
模块级 `css/styles.css` 仅需补充本模块特有样式。
