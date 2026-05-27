# 使用说明（v2.2 精简版）

**📅 最后更新：2026-01-18 | 版本：v2.2（结构优化 + 去冗余）**

> **目标**：让产品经理在 **5分钟内** 完成新模块创建，开发/测试在 **3分钟内** 找到所需文档。

---

## 📖 目录

1. [⚡ 5分钟快速上手](#1--5分钟快速上手)
2. [❓ 常见问题FAQ（Top 10）](#2--常见问题faq-top-10)
3. [📚 完整文档索引](#3--完整文档索引)

---

## 1. ⚡ 5分钟快速上手

### 步骤1：创建目录结构（30秒）

```bash
# 在项目根目录执行
mkdir -p [模块名称]/{css,js,data}
```

### 步骤2：复制基础模板（2分钟）

从以下文件复制内容到对应位置：

| 源文件 | 复制到 | 用途 |
|--------|--------|------|
| [03-html-structure.md](03-html-structure.md) | `index.html` | 页面结构（含Tab导航） |
| [02-css-styles.md](02-css-styles.md) | `<style>` 标签内 | CSS样式（可选，按需引用） |
| [04-javascript.md](04-javascript.md) | `<script>` 标签内 | JS交互逻辑 |

### 步骤3：替换占位符（1分钟）

在 `index.html` 中搜索并替换：

```
[模块名称] → 你的实际模块名
[page_id] → 页面唯一标识（如：warehouse-list）
```

### 步骤4：配置数据持久化（30秒）

```javascript
// 在 main.js 中设置
const DATA_CONFIG = {
    pageId: 'your-page-id',
    dataFile: 'your-module/data/page-data.json',
    apiBase: 'http://localhost:3100/api/data',
    version: '1.0.0'
};
```

### 步骤5：启动服务器并预览（1分钟）

```bash
cd /Users/zsw/Desktop/Axure_ELSA/server
npm run pm2:start

# 访问 http://localhost:3100/[模块名称]/index.html
```

---

### 步骤6：自动预览最佳实践（可选）

**推荐使用浏览器自动刷新工具：**

```bash
# 方案1：Live Server
npm install -g live-server
live-server --port=3100

# 方案2：Browser Sync
npm install -g browser-sync
browser-sync start --server --port=3100 --files "**/*.html, **/*.css, **/*.js"
```

**手动刷新流程：**
1. 修改 HTML/CSS/JS
2. 保存文件（Cmd+S）
3. 切换到浏览器（Cmd+Tab）
4. 刷新页面（Cmd+R）
5. 验证效果
6. 重复步骤1-5

---

## ✨ 最小化示例（一键复制）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[模块名称] - ELSA</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div id="app">
        <!-- 你的页面内容 -->
        <h1 class="text-2xl font-bold text-[#2a3b7d]">[模块名称]</h1>
    </div>

    <!-- 公共JS -->
    <script src="/common/js/common.js"></script>
    
    <!-- 模块JS -->
    <script src="./js/main.js"></script>
</body>
</html>
```

---

## 📄 单文件原型模式

### 适用场景

- ✅ 快速原型验证
- ✅ 设计方案对比
- ✅ 客户演示
- ✅ 外部分享

### 单文件模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[模块名称] - 原型演示</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    
    <style>
        /* 所有 CSS 内联 */
        :root {
            --color-primary: #2a3b7d;
            --color-secondary: #6b7280;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
        }
        
        /* 自定义样式 */
        .btn-primary {
            background: var(--color-primary);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- HTML 内容 -->
    <div id="app" class="container mx-auto p-6">
        <h1 class="text-2xl font-bold text-[#2a3b7d]">[模块名称]</h1>
        
        <!-- 示例内容 -->
        <div class="bg-white rounded shadow p-4 mt-4">
            <button class="btn-primary" onclick="handleClick()">
                <i class="fas fa-plus mr-2"></i>新增
            </button>
        </div>
    </div>

    <script>
        // 所有 JS 内联
        function handleClick() {
            alert('功能演示');
        }
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('原型已加载');
        });
    </script>
</body>
</html>
```

### 优点

- ✅ 无需构建工具
- ✅ 无外部依赖（除CDN）
- ✅ 可离线使用（CDN缓存后）
- ✅ 易于分享和部署
- ✅ 单文件管理简单

### 何时不用

- ❌ 复杂业务系统（需多文件组织）
- ❌ 需要数据持久化（需服务器支持）
- ❌ 多模块复用（需公共资源）

---

## 2. ❓ 常见问题FAQ（Top 10）

### Q1：如何使用设计令牌？
**A**：优先使用CSS变量而非硬编码颜色值。
```css
/* ✅ 正确 */
color: var(--color-primary);

/* ❌ 错误 */
color: #2a3b7d;
```
详细变量列表见 → [00-design-tokens.md](00-design-tokens.md)

---

### Q2：图标应该用哪个版本的Font Awesome？
**A**：统一使用 **Font Awesome 6**。
```html
<!-- ✅ FA6 写法 -->
<i class="fas fa-user"></i>

<!-- ❌ FA4 已废弃 -->
<i class="fa fa-user"></i>
```

---

### Q3：如何添加新的业务组件？
**A**：参考 [06-components.md](06-components.md) 的HTML结构，复制对应的组件代码块。

常用组件：
- 空状态 → 第12节
- 骨架屏 → 第13节
- Toast通知 → 第14节
- 面包屑 → 第15节
- 标签页 → 第16节

---

### Q4：JavaScript函数在哪里查找？
**A**：所有JS函数已整合到 [04-javascript.md](04-javascript.md)，按6大分区组织：
- Part1：核心框架（标签切换、PRD加载）
- Part2：UI组件（Toast、骨架屏、Alert）
- Part3：表单操作（搜索、验证）
- Part4：CRUD（新增、编辑、删除）
- Part5：数据处理（导出、审批）
- Part6：列表交互（分页、选择）

---

### Q5：如何编写逻辑说明？
**A**：使用 [05-logic-description.md](05-logic-description.md) 的模板，放置在原型tab页的数据表格下方。

---

### Q6：PRD文档格式要求？
**A**：遵循 [09-prd-spec.md](09-prd-spec.md) 规范，包含：
1. Executive Summary（执行摘要）
2. User Experience（用户体验）
3. Functional Modules（功能模块）
4. Functional Logic Details（功能逻辑详情）

---

### Q7：测试用例如何编写？
**A**：按照 [10-testcase-spec.md](10-testcase-spec.md) 格式，使用表格形式描述测试步骤。

---

### Q8：如何确保设计一致性？
**A**：使用 [01-design-spec.md](01-design-spec.md) 的"5分钟速查卡"，检查Top 10最常用变量是否正确。

---

### Q9：响应式和暗色模式支持？
**A**：已在 [00-design-tokens.md](00-design-tokens.md) 中定义完整的响应式断点和暗色模式变量。详见该文件的"响应式设计系统"和"暗色模式框架"章节。

---

### Q10：遇到问题如何排查？
**A**：按以下顺序检查：
1. 控制台是否有报错？
2. CDN资源是否加载成功？（FA6、marked、mermaid）
3. DATA_CONFIG配置是否正确？
4. 数据文件路径是否正确？

如仍有问题，查看 [12-review-checklist.md](12-review-checklist.md) 的评审清单。

---

## 3. 📚 完整文档索引

### 核心规范（必读）

| 文件 | 说明 | 适用角色 |
|------|------|----------|
| **[00-design-tokens.md](00-design-tokens.md)** | 设计令牌系统（**唯一数据源**） | 全员 |
| **[01-design-spec.md](01-design-spec.md)** | 5分钟速查卡（Top 10变量） | PM / 开发 |
| **[03-html-structure.md](03-html-structure.md)** | HTML页面结构模板 + FA6迁移指南 | 开发 |
| **[04-javascript.md](04-javascript.md)** | JavaScript交互函数库（v2.2 统一入口） | 开发 |
| **[06-components.md](06-components.md)** | 业务组件库（20+组件变体） | PM / 开发 |

### 样式与交互

| 文件 | 说明 | 适用角色 |
|------|------|----------|
| [02-css-styles.md](02-css-styles.md) | CSS样式模板（完整样式定义） | 开发 |
| [08-interaction-states.md](08-interaction-states.md) | 交互状态规范（hover/focus/disabled） | 开发 / 测试 |
| [16-common-css.md](16-common-css.md) | 公共CSS模板（common.css） | 开发 |
| [17-common-js.md](17-common-js.md) | 公共JS模板（APIDataManager等） | 开发 |

### 文档与测试

| 文件 | 说明 | 适用角色 |
|------|------|----------|
| [05-logic-description.md](05-logic-description.md) | 逻辑说明区域模板 | PM |
| [09-prd-spec.md](09-prd-spec.md) | PRD文档规范 | PM |
| [10-testcase-spec.md](10-testcase-spec.md) | 测试用例文档规范 | 测试 |
| [11-testcase-html-template.md](11-testcase-html-template.md) | 测试用例HTML页面模板 | 测试 |
| [12-review-checklist.md](12-review-checklist.md) | 评审检查清单 | PM / 测试 |

### 工具与辅助

| 文件 | 说明 | 适用角色 |
|------|------|----------|
| [15-data-persistence.md](15-data-persistence.md) | 数据持久化方案（Node.js服务器） | 开发 |

### 归档文件（历史参考）

| 文件 | 说明 | 状态 |
|------|------|------|
| ~~14-config-panel.md~~ | 可视化配置面板模板 | 🗄️ 已归档至 `/archive/` |
| ~~13-button-interaction.md~~ | 按钮交互逻辑模板 | 🗄️ **已合并**入04-javascript.md |

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v2.2** | 2026-01-18 | **结构优化**：精简为3章（快速上手/FAQ/索引）、删除重复内容、增加Top 10 FAQ、归档低频功能 |
| **v2.1** | 2026-01-18 | 更新CDN依赖版本、补充v2.0组件使用指南、增加迁移指南 |
| **v2.0** | 2026-01-15 | 初始版本，包含完整的使用说明和最佳实践 |
