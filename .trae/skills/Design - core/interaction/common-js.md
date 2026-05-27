# 公共 JS 模板

公共 JavaScript 模块索引，代码拆分到 `common/` 子目录。

## 模块索引

| 文件 | 用途 | 行数 |
|------|------|------|
| [api-data-manager](common/api-data-manager.md) | 数据持久化（JSON读取 + localStorage缓存） | ~80 |
| [state-manager](common/state-manager.md) | 状态管理（筛选/分页/排序持久化） | ~60 |
| [toast](common/toast.md) | Toast 提示（success/warning/error/info） | ~30 |
| [modal](common/modal.md) | 模态框管理（openModal/closeModal） | ~20 |
| [tab](common/tab.md) | Tab 切换（prototype/prd/testcases） | ~30 |
| [content-loader](common/content-loader.md) | 内容加载（PRD/测试用例 Markdown 渲染） | ~60 |
| [mermaid-modal](common/mermaid-modal.md) | Mermaid 放大查看 | ~30 |
| [export](common/export.md) | 数据导出（JSON 文件下载） | ~20 |
| [format](common/format.md) | 格式化工具（日期/HTML转义） | ~40 |
| [init](common/init.md) | 页面初始化（DATA_CONFIG 自动加载） | ~20 |

## 使用方式

```html
<script src="/common/js/common.js"></script>
```

## DATA_CONFIG 配置

```html
<script>
const DATA_CONFIG = {
    pageId: 'cost-detail',
    dataFile: 'data/cost-detail-data.json',
    version: '1.0.0'
};
</script>
```

## 依赖关系

```
common.js
├── APIDataManager    → 数据持久化（依赖 DATA_CONFIG）
├── StateManager      → 状态管理（依赖 pageId）
├── switchMainTab     → Tab 切换 → 触发 loadPRD/loadTestCases
├── showToast         → 提示消息
├── openModal         → 打开模态框
├── closeModal        → 关闭模态框
├── loadPRD           → 加载 PRD（依赖 marked.js）
├── loadTestCases     → 加载测试用例（依赖 marked.js）
├── generateTOC       → 目录生成
├── exportData        → 数据导出
└── formatDate        → 日期格式化
```

## 数据流转

```
读取：fetch JSON → 成功缓存 localStorage → 失败读取 localStorage
写入：保存 localStorage → 提示导出 → 用户下载 JSON 文件
```