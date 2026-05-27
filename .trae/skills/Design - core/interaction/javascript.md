# JavaScript 交互模板

模块级 JavaScript 交互函数库索引，代码拆分到 `js/` 子目录。

## 函数索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [ui-components](js/ui-components.md) | UI组件（Toast/标签页/骨架屏/Alert/加载状态） | ~80 |
| [search-filter](js/search-filter.md) | 搜索筛选（搜索按钮/重置按钮） | ~50 |
| [form-validation](js/form-validation.md) | 表单验证（错误显示/验证函数） | ~40 |
| [crud-add](js/crud-add.md) | 新增逻辑（打开弹窗/保存新增） | ~40 |
| [crud-edit](js/crud-edit.md) | 编辑逻辑（打开弹窗/保存编辑） | ~50 |
| [crud-delete](js/crud-delete.md) | 删除逻辑（单条删除/批量删除） | ~60 |
| [status-toggle](js/status-toggle.md) | 状态切换（启用/禁用） | ~50 |
| [export-approval](js/export-approval.md) | 导出审批（数据导出/审批流程） | ~60 |
| [pagination-selection](js/pagination-selection.md) | 分页选择（分页渲染/表格选择） | ~60 |

## 公共函数

以下函数已统一至 [common-js](common-js.md)，引入 `/common/js/common.js` 即可使用：

| 函数 | 说明 |
|------|------|
| `APIDataManager` | 数据持久化管理器 |
| `StateManager` | 状态管理器 |
| `showToast()` | Toast提示 |
| `openModal()` / `closeModal()` | 模态框管理 |
| `switchMainTab()` | 主标签切换 |
| `loadPRD()` / `loadTestCases()` | 文档加载 |
| `formatDate()` | 日期格式化 |
| `exportData()` | 数据导出 |

## 使用方式

```html
<script src="/common/js/common.js"></script>
<script src="js/main.js"></script>
```