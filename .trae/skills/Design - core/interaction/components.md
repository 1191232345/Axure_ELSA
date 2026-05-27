# 业务组件库

业务组件库索引，代码拆分到 `components/` 子目录。

## 组件索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [filter](components/filter.md) | 筛选器（基础筛选器、高级筛选器） | ~60 |
| [button](components/button.md) | 按钮（主按钮、次要按钮、警告按钮、危险按钮、成功按钮） | ~40 |
| [badge](components/badge.md) | 状态徽章（基础徽章、带图标徽章） | ~30 |
| [modal](components/modal.md) | 模态框（基础模态框、确认对话框、表单模态框） | ~60 |
| [form](components/form.md) | 表单元素（输入框、下拉框、文本框、日期、复选框、单选） | ~70 |
| [skeleton](components/skeleton.md) | 骨架屏（表格骨架屏、卡片骨架屏） | ~60 |
| [empty-state](components/empty-state.md) | 空状态（无数据、搜索无结果、错误状态） | ~50 |
| [pagination](components/pagination.md) | 分页（基础分页、简洁分页） | ~40 |
| [toast](components/toast.md) | Toast通知（成功/错误/警告/信息） | ~50 |
| [tree-table](components/tree-table.md) | 树形表格（展开/收起） | ~60 |
| [alert](components/alert.md) | Alert提示框（成功/警告/错误/信息） | ~50 |
| [breadcrumb](components/breadcrumb.md) | 面包屑导航（基础面包屑、带图标面包屑） | ~40 |
| [tabs](components/tabs.md) | 标签页（线型标签页、卡片型标签页） | ~70 |

## 使用建议

| 组件 | 适用场景 | 优先级 |
|------|----------|:------:|
| 空状态 | 表格/列表无数据、搜索无结果、错误状态 | ⭐⭐⭐ |
| 骨架屏 | 数据加载中、首屏优化 | ⭐⭐⭐ |
| Toast | 表单验证反馈、系统通知、操作结果 | ⭐⭐⭐ |
| Alert | 页面内重要信息提示 | ⭐⭐ |
| 面包屑 | 多层级页面导航、当前位置指示 | ⭐⭐ |
| 标签页 | 详情页多视图切换、设置分类 | ⭐⭐ |

## 图标规范

统一使用 **Font Awesome 6**（`fas`/`far`/`fab`前缀）。