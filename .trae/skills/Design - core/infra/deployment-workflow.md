# 原型部署工作流（v1.0）

端到端工作流程，覆盖从开发到部署的全生命周期。

---

## 工作流程概览

```
Phase 1: 开发（本地） → Phase 2: 迭代（本地） → Phase 3: 部署（公开）
```

---

## Phase 1: 开发

### 1.1 创建目录结构

```bash
mkdir -p [模块名称]/{css,js,data}
```

### 1.2 复制基础模板

| 源文件 | 复制到 | 用途 |
|--------|--------|------|
| [html-structure](../design/html-structure.md) | `index.html` | 页面结构 |
| [css-styles](../design/css-styles.md) | `<style>` | CSS样式 |
| [javascript](../interaction/javascript.md) | `<script>` | JS交互 |

### 1.3 替换占位符

```
[模块名称] → 实际模块名
[page_id] → 页面唯一标识
```

### 1.4 本地预览

```bash
cd /Users/zsw/Desktop/Axure_ELSA/server
npm run pm2:start

open http://localhost:3100/[模块名称]/index.html
```

---

## Phase 2: 迭代

### 2.1 迭代原则

**重要：所有修改保持本地，不自动提交到Git**

- ✅ 编辑原型文件
- ✅ 每次修改后刷新浏览器预览
- ✅ 本地测试验证
- ❌ 不自动 `git commit`
- ❌ 不自动 `git push`
- ❌ 不自动创建 PR

### 2.2 迭代流程

```
修改 → 保存 → 切换浏览器 → 刷新 → 验证 → 重复
```

### 2.3 自动预览最佳实践

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

### 2.4 常见迭代模式

| 迭代类型 | 操作内容 |
|----------|----------|
| **布局调整** | 修改 HTML 结构、CSS Grid/Flex |
| **样式优化** | 调整颜色、间距、字体 |
| **交互增强** | 添加 JS 事件、动画效果 |
| **数据调整** | 修改测试数据、添加字段 |
| **组件替换** | 更换组件类型、调整变体 |

---

## Phase 3: 部署

### 3.1 部署前置检查

**⚠️ 部署前必须完成安全检查！**

参考 [security-checklist](../docs/security-checklist.md)，确认：

- ✅ 无真实用户数据（PII）
- ✅ 无 API keys / tokens
- ✅ 无内部 URL 暴露
- ✅ 无商业机密信息

**如未通过安全检查，禁止部署！**

### 3.2 选择部署平台

| 平台 | 适用场景 | 部署速度 | PR流程 |
|------|----------|---------|--------|
| **GitHub Pages** | 团队协作、长期维护 | 需合并到 main | 必需 |
| **Vercel** | 快速分享、即时预览 | 即时部署 | 可选 |

详细部署步骤见 [deployment-platforms](../infra/deployment-platforms.md)

### 3.3 部署后验证

部署完成后，打开公开 URL 验证：

```bash
# GitHub Pages
open https://<owner>.github.io/<repo>/[模块目录]/index.html

# Vercel
open https://[project-name].vercel.app
```

**验证清单：**
- ✅ 页面正常加载
- ✅ 样式正确渲染
- ✅ 交互功能正常
- ✅ 数据正确显示
- ✅ 无控制台错误

---

## 单文件原型模式

### 适用场景

- 快速原型验证
- 设计方案对比
- 客户演示
- 外部分享

### 模板结构

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
        
        /* 自定义样式 */
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- HTML 内容 -->
    <div id="app">
        <h1 class="text-2xl font-bold text-[#2a3b7d]">[模块名称]</h1>
        <!-- 更多内容 -->
    </div>

    <script>
        // 所有 JS 内联
        function handleClick() {
            alert('功能演示');
        }
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

## 版本历史

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v1.0** | 2026-05-27 | 初始版本：端到端工作流程、迭代机制、单文件模式 |