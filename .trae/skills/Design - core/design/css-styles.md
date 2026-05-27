# CSS 样式模板

模块级 CSS 样式索引，代码拆分到 `css/` 子目录。

> 交互状态样式 → [states/](../states/) | 设计令牌 → [design-tokens](design-tokens.md)

## 子文件索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [base](css/base.md) | 页面基础 + 令牌速查 + 页面切换 | ~50 |
| [toc](css/toc.md) | 目录导航样式 | ~80 |
| [tabs](css/tabs.md) | 浮动标签 + 线型标签 + Pills | ~90 |
| [cards](css/cards.md) | 搜索卡片 + 操作卡片 + 响应式 | ~80 |
| [buttons](css/buttons.md) | 按钮样式（主/次/危险/警告/成功） | ~50 |
| [tables](css/tables.md) | 表格行悬停 + 状态徽章 | ~20 |
| [modals](css/modals.md) | 模态框（遮罩/内容/头部/底部） | ~70 |
| [forms](css/forms.md) | 表单（输入框/下拉/文本域） | ~60 |
| [mermaid](css/mermaid.md) | Mermaid图表放大预览 | ~70 |
| [feedback](css/feedback.md) | 空状态/骨架屏/Alert/Toast | ~90 |
| [breadcrumb](css/breadcrumb.md) | 面包屑导航 | ~40 |

## .prose 样式

已统一至 [common-css](common-css.md) §14，引入 `common.css` 即可使用。

## 使用方式

按需读取子文件，不要一次性加载全部样式。典型页面仅需：
- `base` + `cards` + `buttons` + `tables` + `modals` + `forms`
