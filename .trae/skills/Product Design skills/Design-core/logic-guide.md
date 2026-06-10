# 页面逻辑说明指南

逻辑说明采用**弹窗交互模式**：页面底部入口卡片 → 点击打开居中弹窗 → 弹窗内按卡片分组 → 卡片内可含 Tab 切换。

> **核心原则**：逻辑说明直接内嵌在页面 HTML 中，不使用外部文件加载。

## 一、交互结构

### 1.1 入口卡片

插入在页面主内容区末尾（`</main>` 前）：

```html
<!-- 逻辑说明 -->
<div class="bg-white rounded-lg shadow-card mt-4 overflow-hidden">
  <div class="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center cursor-pointer" onclick="openLogicModal()">
    <div class="flex items-center">
      <i class="fas fa-book text-primary mr-2"></i>
      <span class="font-semibold text-primary">逻辑说明</span>
      <span class="ml-2 text-xs text-gray-500">(点击查看详细逻辑)</span>
    </div>
    <i class="fas fa-external-link text-primary"></i>
  </div>
</div>
```

### 1.2 弹窗容器

插入在入口卡片之后：

```html
<div id="logic-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
    <!-- 头部 -->
    <div class="px-6 py-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 flex justify-between items-center">
      <div class="flex items-center">
        <i class="fas fa-book text-primary mr-2"></i>
        <span class="font-semibold text-primary text-lg">{{页面名称}} - 逻辑说明</span>
      </div>
      <button onclick="closeLogicModal()" class="text-gray-500 hover:text-gray-700 transition-colors">
        <i class="fas fa-times text-xl"></i>
      </button>
    </div>
    <!-- 内容区 -->
    <div class="flex-1 overflow-y-auto p-6" id="logic-modal-content">
      <!-- 内容卡片插入此处 -->
    </div>
  </div>
</div>
```

### 1.3 内容卡片（无 Tab）

```html
<div class="mb-4 border border-gray-200 rounded-lg overflow-hidden">
  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
    <h4 class="font-semibold text-gray-800 flex items-center">
      <i class="fas fa-{{图标}} text-primary mr-2"></i>{{卡片标题}}
    </h4>
  </div>
  <div class="p-4">
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border border-gray-200 rounded">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left font-medium text-gray-700 border-b">{{列名}}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr class="hover:bg-gray-50">
            <td class="px-3 py-2 text-gray-800">{{值}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

### 1.4 内容卡片（带 Tab）

```html
<div class="mb-4 border border-gray-200 rounded-lg overflow-hidden">
  <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
    <h4 class="font-semibold text-gray-800 flex items-center">
      <i class="fas fa-{{图标}} text-primary mr-2"></i>{{卡片标题}}
    </h4>
  </div>
  <!-- Tab 栏 -->
  <div class="border-b border-gray-200 px-4 flex">
    <button class="logic-tab px-4 py-2.5 text-sm font-medium text-primary border-b-2 border-primary"
            data-group="{{组名}}" data-tab="{{tab1-id}}" onclick="switchLogicTab(this)">{{Tab1名称}}</button>
    <button class="logic-tab px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700"
            data-group="{{组名}}" data-tab="{{tab2-id}}" onclick="switchLogicTab(this)">{{Tab2名称}}</button>
  </div>
  <!-- Tab 面板 -->
  <div class="logic-panel p-4" data-group="{{组名}}" data-panel="{{tab1-id}}">
    <!-- Tab1 内容 -->
  </div>
  <div class="logic-panel p-4 hidden" data-group="{{组名}}" data-panel="{{tab2-id}}">
    <!-- Tab2 内容 -->
  </div>
</div>
```

### 1.5 JavaScript

插入在 `</body>` 前的最后一个 `<script>` 标签内：

```javascript
function openLogicModal() {
  document.getElementById('logic-modal').classList.remove('hidden');
}
function closeLogicModal() {
  document.getElementById('logic-modal').classList.add('hidden');
}
function switchLogicTab(button) {
  var group = button.getAttribute('data-group');
  var tab = button.getAttribute('data-tab');
  // 切换 Tab 高亮
  var tabs = document.querySelectorAll('.logic-tab[data-group="' + group + '"]');
  tabs.forEach(function(t) {
    t.classList.remove('text-primary', 'border-b-2', 'border-primary');
    t.classList.add('text-gray-500', 'hover:text-gray-700');
  });
  button.classList.remove('text-gray-500', 'hover:text-gray-700');
  button.classList.add('text-primary', 'border-b-2', 'border-primary');
  // 切换面板显示
  var panels = document.querySelectorAll('.logic-panel[data-group="' + group + '"]');
  panels.forEach(function(p) { p.classList.add('hidden'); });
  var targetPanel = document.querySelector('.logic-panel[data-group="' + group + '"][data-panel="' + tab + '"]');
  if (targetPanel) targetPanel.classList.remove('hidden');
}
// 点击遮罩关闭
document.getElementById('logic-modal').addEventListener('click', function(e) {
  if (e.target === this) closeLogicModal();
});
```

## 二、命名规范

| 元素 | 命名规则 | 示例 |
|------|----------|------|
| 弹窗 ID | `logic-modal`（固定） | - |
| Tab 组名 (data-group) | `{{功能域}}-logic` | `table-column-logic`、`form-field-logic` |
| Tab ID (data-tab) | `{{功能域}}-{{子类}}` | `column-main`、`column-display` |
| Panel ID (data-panel) | 与 data-tab 一致 | `column-main`、`column-display` |
| 入口函数 | `openLogicModal` / `closeLogicModal`（固定） | - |
| Tab 切换函数 | `switchLogicTab`（固定） | - |

## 三、卡片类型与图标

| 卡片类型 | 图标 (fas) | 适用场景 |
|----------|-----------|----------|
| 初始化与数据展示 | `play-circle` | 页面加载、数据获取、排序、空状态 |
| 检索与筛选逻辑 | `search` | 搜索条件、筛选器、重置 |
| 表格列展示逻辑 | `table` | 列取值、展示样式、徽章 |
| 按钮交互逻辑 | `mouse-pointer` | 新增/编辑/删除/查看按钮行为 |
| 字段定义 | `database` | 数据模型、字段属性、约束 |
| 表单字段逻辑 | `edit` | 表单取值、联动、计算 |
| 弹窗逻辑 | `window-restore` | 弹窗初始化、交互、校验 |
| 校验逻辑 | `check-circle` | 必填、格式、范围校验 |

## 四、表格列定义模板

### 4.1 逻辑说明表格（5列）

| 列名 | 宽度 | 说明 |
|------|------|------|
| 逻辑项 | 15% | 功能点名称 |
| 说明 | 25% | 功能描述 |
| 数据来源 | 20% | 数据获取方式 |
| 展示规则 | 25% | 显示条件与样式 |
| 备注 | 15% | 补充说明 |

### 4.2 字段定义表格（6列）

| 列名 | 宽度 | 说明 |
|------|------|------|
| 字段名 | 15% | 英文字段名 |
| 中文名 | 15% | 中文标签 |
| 类型 | 10% | String/Number/Enum/DateTime/Boolean |
| 长度 | 8% | 最大长度 |
| 必填 | 8% | 是/否/计算/冗余 |
| 说明 | 44% | 取值规则、校验、关联 |

### 4.3 按钮交互表格（5列）

| 列名 | 宽度 | 说明 |
|------|------|------|
| 按钮 | 12% | 按钮名称 |
| 触发条件 | 18% | 何时可用 |
| 交互行为 | 30% | 点击后发生什么 |
| 校验规则 | 25% | 前置校验 |
| 备注 | 15% | 补充说明 |

### 4.4 校验规则表格（4列）

| 列名 | 宽度 | 说明 |
|------|------|------|
| 校验项 | 20% | 校验名称 |
| 规则 | 30% | 校验逻辑 |
| 错误提示 | 30% | 不通过时的提示 |
| 触发时机 | 20% | 何时触发 |

## 五、页面类型与推荐卡片组合

### 5.1 列表页（index.html）

| 序号 | 卡片 | Tab | 说明 |
|------|------|-----|------|
| 1 | 初始化与数据展示 | 无 | 页面加载、测试数据、排序、空状态 |
| 2 | 检索与筛选逻辑 | 无 | 搜索条件、筛选器、重置 |
| 3 | 表格列展示逻辑 | 字段取值 / 展示样式 | 列数据来源 + 显示规则 |
| 4 | 按钮交互逻辑 | 无 | 新增/查询/重置/查看/编辑/删除 |
| 5 | 主表字段定义 | 字段定义 / 约束校验 | 数据模型 + 校验规则 |

### 5.2 新增/编辑页（*-form.html / *-create.html）

| 序号 | 卡片 | Tab | 说明 |
|------|------|-----|------|
| 1 | 页面初始化逻辑 | 无 | URL参数解析、数据加载、模式判断 |
| 2 | 表单字段逻辑 | 字段取值 / 校验规则 | 表单取值 + 校验 |
| 3 | 折扣配置弹窗逻辑 | 弹窗初始化 / 字段取值 / 交互逻辑 | 折扣弹窗（如有） |
| 4 | 保存逻辑 | 无 | 提交校验、数据组装、保存流程 |

### 5.3 弹窗页（含弹窗的列表页）

在列表页基础上，额外添加弹窗相关卡片，使用独立 `data-group` 区分。

## 六、生成流程

为页面添加逻辑说明时，按以下步骤执行：

1. **阅读页面代码**：理解数据流、交互逻辑、字段定义
2. **确定卡片组合**：根据页面类型选择推荐卡片（见第五节）
3. **生成 HTML**：按模板生成入口卡片 + 弹窗 + 内容卡片
4. **插入位置**：
   - 入口卡片：`</main>` 前
   - 弹窗：入口卡片之后
   - JavaScript：`</body>` 前最后一个 `<script>` 内
5. **验证**：
   - `data-group` 在同一弹窗内唯一
   - Tab/Panel 的 `data-tab`/`data-panel` 对应
   - 首个 Tab 有 `text-primary border-b-2 border-primary` 激活样式
   - 首个 Panel 无 `hidden`，其余 Panel 有 `hidden`

## 七、样式规范

| 元素 | 样式 |
|------|------|
| 表格行 hover | `hover:bg-gray-50`（冒号，非连字符） |
| 字段值文字 | `text-gray-800` |
| 说明文字 | `text-gray-600` |
| 表头背景 | `bg-gray-50` |
| 表头文字 | `font-medium text-gray-700` |
| 卡片头部背景 | `bg-gray-50` |
| 弹窗头部 | `bg-gradient-to-r from-primary/5 to-primary/10` |
| 入口卡片头部 | 同弹窗头部 |

## 八、注意事项

- 每个页面只有一个 `logic-modal`，所有卡片共享同一个弹窗
- 同一弹窗内不同卡片的 `data-group` 必须唯一
- 首个 Tab 按钮需有激活样式，其余为 `text-gray-500 hover:text-gray-700`
- 首个 Panel 不能有 `hidden` 类，其余 Panel 必须有 `hidden`
- 逻辑说明直接内嵌页面 HTML，不使用 fetch 加载外部文件
- 保留公共规则库引用能力：字段校验可引用 `common-rules-library` 中的标准规则
