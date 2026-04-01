# 虚拟仓管理系统

## 项目结构

```
虚拟仓/
├── index.html              # 主入口文件（框架结构）
├── css/
│   └── styles.css          # 所有CSS样式
├── js/
│   ├── main.js             # 主要JavaScript逻辑
│   └── page-loader.js      # 页面模块加载器
├── pages/
│   ├── organization.html   # 组织机构管理页面
│   ├── warehouse.html      # 虚拟仓管理页面
│   ├── inventory.html      # 库存管理页面
│   ├── transfer.html       # 调拨管理页面
│   ├── shipment.html       # 出库列表页面
│   ├── new-shipment.html   # 新增出库页面
│   └── modals.html         # 所有模态框
├── prd.md                  # 产品需求文档
├── test-cases.html         # 测试用例（HTML格式）
├── test-cases.md           # 测试用例（Markdown格式）
└── README.md               # 项目说明文档
```

## 文件说明

### index.html
- 主入口文件，包含页面框架结构
- 引用外部CSS和JavaScript文件
- 包含导航栏和侧边栏
- 使用动态加载方式加载页面模块

### css/styles.css
- 包含所有CSS样式
- 包括Tailwind自定义样式
- 包括组件样式和动画效果

### js/main.js
- 包含主要JavaScript逻辑
- 模态框管理
- 表单处理
- 数据操作

### js/page-loader.js
- 页面模块加载器
- 动态加载各个页面模块
- 页面缓存管理
- 激活状态管理

### pages/ 目录
包含各个页面模块，每个模块独立维护：
- **organization.html**: 组织机构管理（部门树、用户关联）
- **warehouse.html**: 虚拟仓管理（仓库列表、新建仓库）
- **inventory.html**: 库存管理（库存查询、预警设置）
- **transfer.html**: 调拨管理（调拨单列表、审批流程）
- **shipment.html**: 出库列表（出库单查询）
- **new-shipment.html**: 新增出库（出库单创建）
- **modals.html**: 所有模态框（弹窗组件）

## 模块化架构

### 加载流程
```
index.html
    ↓
加载 CSS 和 JS
    ↓
初始化 PageLoader
    ↓
动态加载页面模块
    ↓
渲染页面内容
```

### 优势
1. **按需加载**: 只加载当前需要的页面模块
2. **缓存机制**: 已加载的页面会被缓存，提升性能
3. **独立维护**: 每个页面模块独立，便于维护
4. **清晰结构**: 文件结构清晰，职责明确

## 维护指南

### 修改页面内容
1. 找到对应的页面文件（如 `pages/organization.html`）
2. 修改HTML结构
3. 保存文件，刷新浏览器即可看到效果

### 修改样式
1. 打开 `css/styles.css` 文件
2. 找到对应的样式类
3. 修改样式属性
4. 保存文件

### 修改逻辑
1. 打开 `js/main.js` 文件
2. 找到对应的函数
3. 修改逻辑代码
4. 保存文件

### 添加新页面
1. 在 `pages/` 目录创建新的HTML文件
2. 在 `index.html` 的侧边栏添加导航链接
3. 在 `js/page-loader.js` 中添加页面加载逻辑

## 备份文件

- `index.html.backup`: 原始单文件版本（第一次拆分前）
- `index-old.html`: 拆分前的版本（模块化拆分前）

## 技术栈

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Font Awesome 4.7.0
- Marked.js (Markdown解析)
- Mermaid.js (图表渲染)

## 开发建议

1. **模块化开发**: 每个页面独立维护，避免耦合
2. **代码规范**: 保持代码风格一致，添加必要注释
3. **性能优化**: 利用缓存机制，避免重复加载
4. **测试验证**: 修改后务必测试所有相关功能

## 版本历史

### v2.0 (当前版本)
- 模块化拆分，页面独立维护
- 动态加载机制，提升性能
- 清晰的文件结构

### v1.0
- 单文件版本
- CSS和JS拆分
- 基础功能完整
