# 交互状态规范

交互状态索引，代码拆分到 `states/` 子目录。

> 设计令牌变量 → [design-tokens](design-tokens.md) | CSS样式 → [css/](css/)

## 子文件索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [buttons](states/buttons.md) | 按钮状态（主/次/危险/警告/成功/加载） | ~80 |
| [inputs](states/inputs.md) | 输入框状态（悬停/聚焦/禁用/错误/成功） | ~30 |
| [tabs](states/tabs.md) | 标签页状态（线型/Pills/动画） | ~40 |
| [modals](states/modals.md) | 模态框状态（遮罩/内容/Mermaid放大） | ~30 |
| [tables](states/tables.md) | 表格行状态（悬停/选中/斑马纹/按钮） | ~25 |
| [navigation](states/navigation.md) | 导航状态（下拉菜单/链接） | ~25 |
| [toc](states/toc.md) | 目录导航状态（链接/指示器/折叠） | ~30 |
| [badges-loading](states/badges-loading.md) | 徽章 + 旋转/脉冲/骨架屏 | ~40 |
| [toast-empty](states/toast-empty.md) | Toast通知 + 空状态 + 面包屑 | ~60 |

## 使用方式

按需读取子文件。典型页面仅需：
- `buttons` + `inputs` + `tables` + `modals`
