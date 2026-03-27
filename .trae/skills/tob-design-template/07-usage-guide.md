# 使用说明

本文档说明如何使用TOB产品设计模板创建新的模块页面。

## 1. 文件结构

```
virtual-warehouse-template/
├── SKILL.md                 # 主入口文件
├── 01-design-spec.md        # 核心设计规范
├── 02-css-styles.md         # CSS 样式模板
├── 03-html-structure.md     # HTML 页面结构模板
├── 04-javascript.md         # JavaScript 交互模板
├── 05-logic-description.md  # 逻辑说明区域模板
├── 06-components.md         # 业务组件库
└── 07-usage-guide.md        # 使用说明（本文件）
```

## 2. 快速开始

### 2.1 创建新模块页面

1. 复制 [03-html-structure.md](03-html-structure.md) 中的完整页面结构
2. 替换 `[模块名称]` 为实际模块名称
3. 根据业务需求修改页面内容

### 2.2 引入必要资源

确保页面包含以下 CDN 资源：

```html
<!-- CDN 资源 -->
<link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@4/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
```

### 2.3 引入样式和脚本

1. 从 [02-css-styles.md](02-css-styles.md) 复制完整 CSS 样式到 `<style>` 标签内
2. 从 [04-javascript.md](04-javascript.md) 复制完整 JavaScript 到 `<script>` 标签内

## 3. 组件使用指南

### 3.1 筛选器组件

从 [06-components.md](06-components.md) 选择合适的筛选器组件：
- 基础筛选器：适用于简单搜索场景
- 高级筛选器：适用于复杂搜索场景

### 3.2 按钮组件

根据操作类型选择合适的按钮：
- 主按钮（erp-btn-primary）：主要操作，如新增、保存
- 次要按钮（erp-btn-secondary）：次要操作，如导出、重置
- 警告按钮（erp-btn-warning）：警告操作，如编辑
- 危险按钮（erp-btn-danger）：危险操作，如删除
- 成功按钮（erp-btn-success）：确认操作

### 3.3 模态框组件

从 [06-components.md](06-components.md) 选择合适的模态框：
- 基础模态框：通用弹窗
- 确认对话框：删除确认等操作
- 表单模态框：新增/编辑表单

### 3.4 表单组件

根据字段类型选择合适的表单组件：
- 文本输入框：单行文本
- 下拉选择框：固定选项
- 多行文本框：长文本
- 日期选择器：日期字段
- 复选框：多选
- 单选按钮组：单选

### 3.5 状态徽章

根据状态类型选择合适的徽章：
- 启用状态：bg-green-100 text-green-700
- 禁用状态：bg-red-100 text-red-700
- 待审核状态：bg-yellow-100 text-yellow-700
- 已完成状态：bg-blue-100 text-blue-700

## 4. 逻辑说明编写指南

### 4.1 逻辑说明区域

每个原型页面底部都应包含逻辑说明区域，参考 [05-logic-description.md](05-logic-description.md)。

### 4.2 逻辑说明包含内容

1. **初始化页面（数据展示逻辑）**
   - 页面加载时的数据展示规则
   - 数据来源和展示顺序

2. **检索条件**
   - 搜索字段的输入方式
   - 查询逻辑说明

3. **按钮逻辑**
   - 按钮位置和触发动作
   - 前置条件和后续操作

4. **属性取值逻辑**
   - 字段的数据来源
   - 取值规则和显示格式

## 5. 设计规范遵循

### 5.1 色彩使用

参考 [01-design-spec.md](01-design-spec.md) 中的色彩系统：
- 主色调：#2a3b7d（深蓝）
- 辅助色：#36CFC9（青色）
- 功能色：成功、警告、危险

### 5.2 字体规范

- 页面主标题：2rem (32px)
- 区块标题：1.4rem (22px)
- 正文内容：0.95rem (15px)
- 辅助文字：0.875rem (14px)

### 5.3 间距规范

- 紧凑间距：0.25rem (4px)
- 小间距：0.5rem (8px)
- 标准间距：1rem (16px)
- 大间距：1.5rem (24px)

## 6. 常见问题

### 6.1 样式不生效

确保：
1. Tailwind CSS CDN 正确引入
2. 自定义 CSS 样式正确复制到 `<style>` 标签内
3. Tailwind 配置正确设置

### 6.2 交互不工作

确保：
1. JavaScript 正确复制到 `<script>` 标签内
2. 元素 ID 和函数调用匹配
3. 事件绑定正确

### 6.3 PRD/测试用例不加载

确保：
1. prd.md 和 test-cases.md 文件存在于同目录
2. Marked.js 和 Mermaid.js 正确引入
3. 文件编码为 UTF-8

## 7. 最佳实践

### 7.1 命名规范

- 页面 ID：`page-[模块标识]`
- 模态框 ID：`modal-[功能标识]`
- 逻辑说明 ID：`[模块标识]-logic-content`

### 7.2 代码组织

1. CSS 样式放在 `<head>` 内
2. JavaScript 放在 `</body>` 前
3. 保持代码缩进一致

### 7.3 响应式设计

使用 Tailwind 的响应式类：
- `sm:` - 640px 以上
- `md:` - 768px 以上
- `lg:` - 1024px 以上

## 8. 模板更新

当设计规范更新时，需要同步更新模板文件：

1. 检查项目的设计变化
2. 更新对应的模板文件
3. 测试新模板的兼容性
4. 更新使用说明文档
