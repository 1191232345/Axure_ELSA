# 销售收支统计 - 规格文档

## 文件信息

| 属性 | 值 |
|------|------|
| 文件路径 | `/对账/销售收支统计/Detailed Management.html` |
| 页面名称 | 销售收支统计 |
| 所属模块 | 对账管理 |
| 最后更新 | 2026-03-27 |

## 1. 页面概述

销售收支统计模块用于管理业务明细数据，提供完整的增删改查、导入导出以及明细调整功能。页面采用三段式布局设计，包含搜索区域、操作区域和数据表格区域。

## 2. 页面结构

### 2.1 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  页面标题: 销售收支统计                                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  搜索卡片 (Search Card)                              │   │
│  │  - 月度筛选                                          │   │
│  │  - 客户代码筛选                                      │   │
│  │  - 搜索/重置按钮                                     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  操作卡片 (Action Card)                              │   │
│  │  - 新增、导入、导出、批量删除、明细调整按钮           │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  数据表格 (Table Card)                               │   │
│  │  - 业务明细数据列表                                  │   │
│  │  - 分页控件                                          │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  逻辑说明区域 (可折叠)                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PRD文档 (Tab切换)                                   │   │
│  │  测试用例 (Tab切换)                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 弹窗组件

| 弹窗名称 | 用途 | 触发方式 |
|----------|------|----------|
| 查看弹窗 (viewModal) | 查看业务详情 | 点击行查看按钮 |
| 编辑弹窗 (editModal) | 新增/编辑业务 | 点击新增/编辑按钮 |
| 导入弹窗 (importModal) | 导入业务数据 | 点击导入按钮 |
| 明细调整弹窗 (detailAdjustModal) | 批量调整成本收入 | 点击明细调整按钮 |
| Mermaid预览弹窗 (mermaidModal) | 放大查看流程图 | 点击PRD中的Mermaid图表 |

## 3. 数据模型

### 3.1 业务数据字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 唯一标识 |
| businessNo | String | 是 | 业务编号 |
| billMonth | String | 是 | 账单月 (YYYY-MM格式) |
| customerCode | String | 是 | 客户代码 |
| customerNo | String | 否 | 客户编号 |
| sailingDate | String | 否 | 预计开航日 |
| salesman | String | 否 | 业务员 |
| customerService | String | 否 | 客服 |
| secondaryService | String | 否 | 次客服 |
| billNo | String | 否 | 提单号 |
| expenseUnit | String | 否 | 支出结算单位 |
| incomeUnit | String | 否 | 收入结算单位 |
| project | String | 否 | 项目 |
| currency | String | 否 | 币种 |
| warehouseCost | Number | 否 | 对仓成本 |
| serviceIncome | Number | 否 | 客服收入 |

### 3.2 状态管理

```javascript
// 全局状态
let businessData = [...]      // 原始业务数据
let filteredData = [...]      // 筛选后的数据
let selectedIds = new Set()   // 选中的行ID集合
let currentPage = 1           // 当前页码
let pageSize = 10             // 每页条数
```

## 4. 交互功能

### 4.1 搜索功能

**触发条件**: 点击搜索按钮
**逻辑**:
1. 获取月度筛选值和客户代码筛选值
2. 遍历businessData进行条件匹配
3. 更新filteredData并重新渲染表格
4. 重置currentPage为1

### 4.2 分页功能

**页码计算**: `Math.ceil(filteredData.length / pageSize)`
**跳转逻辑**:
- 上一页: currentPage - 1
- 下一页: currentPage + 1
- 指定页: 直接跳转

### 4.3 批量操作

**全选逻辑**:
- 点击表头复选框，切换所有行复选框状态
- 同步更新selectedIds集合

**批量删除**:
- 检查selectedIds是否为空
- 确认后从businessData中过滤掉选中项
- 刷新表格和分页

### 4.4 明细调整

**功能说明**: 批量修改选中行的对仓成本和客服收入
**操作流程**:
1. 打开明细调整弹窗
2. 勾选需要调整的行
3. 修改成本或收入数值
4. 点击保存，更新businessData

## 5. PRD文档展示

### 5.1 Markdown渲染

使用marked.js库解析Markdown内容，支持:
- 标题层级 (H1-H6)
- 表格
- 代码块
- Mermaid流程图

### 5.2 Mermaid图表支持

**配置**:
```javascript
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
});
```

**渲染时机**: PRD Tab激活后延迟100ms执行mermaid.run()

### 5.3 图表放大预览

- 点击PRD中的Mermaid图表区域
- 打开全屏模态框显示放大的图表
- 支持ESC键关闭

## 6. 样式规范

### 6.1 颜色系统

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 主色 | #2563eb | 按钮、链接、高亮 |
| 主色浅 | #3b82f6 | 悬停状态 |
| 危险色 | #dc2626 | 删除操作 |
| 成功色 | #16a34a | 成功提示 |
| 背景色 | #f3f4f6 | 页面背景 |
| 卡片背景 | #ffffff | 卡片背景 |

### 6.2 间距规范

| 元素 | 间距 |
|------|------|
| 页面内边距 | p-6 (24px) |
| 卡片内边距 | p-4 (16px) |
| 表单元素间距 | space-y-3 (12px) |
| 按钮间距 | space-x-2 (8px) |
| 表格行高 | py-3 (12px) |

### 6.3 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| 默认 | < 640px | 单列堆叠 |
| sm | ≥ 640px | 两列布局 |
| md | ≥ 768px | 标准布局 |
| lg | ≥ 1024px | 宽屏布局 |

## 7. 事件绑定

### 7.1 按钮事件

| 按钮ID | 事件 | 处理函数 |
|--------|------|----------|
| searchBtn | click | search() |
| resetBtn | click | reset() |
| addBtn | click | openAddModal() |
| importBtn | click | openImportModal() |
| exportBtn | click | alert('开发中') |
| batchDeleteBtn | click | batchDelete() |
| detailAdjustBtn | click | openDetailAdjustModal() |

### 7.2 表单事件

| 元素ID | 事件 | 处理函数 |
|--------|------|----------|
| editForm | submit | saveData(e) |
| selectAll | change | toggleSelectAll() |
| pageSize | change | 更新pageSize并刷新 |
| goToPage | change | 跳转到指定页 |

### 7.3 弹窗事件

| 弹窗 | 关闭按钮 | 取消按钮 | 确认按钮 |
|------|----------|----------|----------|
| viewModal | closeViewModal | - | - |
| editModal | closeEditModal | cancelEdit | 表单提交 |
| importModal | closeImportModal | cancelImport | confirmImport |
| detailAdjustModal | closeDetailAdjustModal | cancelDetailAdjust | saveDetailAdjust |

## 8. 文件依赖

### 8.1 外部资源

| 资源 | 用途 |
|------|------|
| Tailwind CSS (CDN) | 样式框架 |
| Font Awesome (CDN) | 图标库 |
| Mermaid (CDN) | 流程图渲染 |
| Marked (CDN) | Markdown解析 |

### 8.2 内部资源

无内部资源依赖，所有代码内联在HTML文件中。

## 9. 版本记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-27 | 初始版本，完成页面重构 | AI Assistant |

## 10. 测试检查清单

### 10.1 功能测试

- [ ] 页面正常加载，显示默认数据
- [ ] 搜索功能正常工作
- [ ] 分页功能正常工作
- [ ] 新增业务成功
- [ ] 编辑业务成功
- [ ] 删除业务成功
- [ ] 批量删除成功
- [ ] 全选/取消全选正常
- [ ] 明细调整功能正常

### 10.2 界面测试

- [ ] 响应式布局正常
- [ ] 弹窗显示/隐藏正常
- [ ] 表格行悬停效果正常
- [ ] 按钮禁用状态正常

### 10.3 PRD展示测试

- [ ] PRD Tab正常切换
- [ ] Markdown正确渲染
- [ ] Mermaid图表正常显示
- [ ] 图表点击放大正常
