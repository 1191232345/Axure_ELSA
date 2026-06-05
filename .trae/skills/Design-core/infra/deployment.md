# 部署指南

原型部署完整指南，包含平台选择、GitHub Pages 部署、Vercel 部署、工作流程和最佳实践。

---

## 平台对比

| 特性 | GitHub Pages | Vercel |
|------|-------------|--------|
| 部署速度 | 需合并到 main | 即时部署 |
| PR 流程 | 必需 | 可选 |
| 适用场景 | 团队协作、长期维护 | 快速分享、即时预览 |
| URL 格式 | `https://<owner>.github.io/<repo>/` | `https://<project>.vercel.app` |
| 费用 | 免费 | 免费（个人项目） |

---

## 工作流程

```
Phase 1: 开发（本地） → Phase 2: 迭代（本地） → Phase 3: 部署（公开）
```

### Phase 1: 开发

```bash
mkdir -p [模块名称]/{css,js,data}
# 复制模板到对应位置，替换占位符
# 本地预览
cd /Users/zsw/Desktop/Axure_ELSA/server && npm run pm2:start
open http://localhost:3100/[模块名称]/index.html
```

### Phase 2: 迭代

- 所有修改保持本地，不自动提交到 Git
- 修改 → 保存 → 刷新浏览器 → 验证 → 重复

### Phase 3: 部署

**部署前必须完成安全检查**（见 [docs/checklists.md](../docs/checklists.md)），确认无真实数据、无凭证泄露、无内部 URL。

---

## GitHub Pages 部署

### 1. 启用 Pages

```bash
gh api repos/<owner>/<repo>/pages -X POST -f source='{"branch":"main","path":"/"}'
```

### 2. 部署流程

```bash
# 创建部署分支
git checkout -b deploy/prototype-[模块名]

# 提交原型文件
git add [模块目录]/
git commit -m "Add [模块名] prototype"

# 推送并创建 PR
git push origin deploy/prototype-[模块名]
gh pr create --title "[模块名] 原型" --body "原型预览"

# 合并到 main（Pages 只部署 main 分支）
gh pr merge [PR编号] --squash --delete-branch

# 打开公开 URL（等待1-2分钟）
open "https://<owner>.github.io/<repo>/[模块目录]/index.html"
```

### 3. 更新已部署原型

```bash
git checkout -b update/prototype-[模块名]
# 修改文件...
git add [模块目录]/ && git commit -m "Update [模块名] prototype"
git push origin update/prototype-[模块名]
gh pr create --title "Update [模块名] prototype"
gh pr merge [PR编号] --squash --delete-branch
```

---

## Vercel 部署

### 1. 前置条件

```bash
npm install -g vercel && vercel login
```

### 2. 部署流程

```bash
cd [模块目录]
vercel deploy --prod --yes
# 输出：Production: https://[project-name].vercel.app
```

### 3. 更新已部署原型

```bash
cd [模块目录]
vercel deploy --prod --yes
# Vercel 即时更新
```

### 4. 项目管理

```bash
vercel list                    # 查看项目列表
vercel inspect [project-name]  # 查看项目详情
vercel remove [project-name]   # 删除项目
```

---

## 部署后验证

| 检查项 | 检查方法 |
|--------|----------|
| 页面加载 | 打开 URL 查看 |
| 样式渲染 | 检查 CSS 效果 |
| 交互功能 | 测试按钮/表单 |
| 数据显示 | 检查表格/列表 |
| 无报错 | 打开开发者工具 |

### 常见问题

| 问题 | 排查方法 |
|------|----------|
| 页面 404 | 检查文件路径、是否已合并到 main |
| 样式不加载 | 检查 CSS 路径、CDN 可访问性 |
| JS 不执行 | 检查 JS 路径、语法错误 |

---

## 部署策略

| 场景 | 推荐平台 | 原因 |
|------|----------|------|
| 团队协作 | GitHub Pages | PR流程、版本控制 |
| 客户演示 | Vercel | 即时部署、快速分享 |
| 长期维护 | GitHub Pages | 与代码仓库同步 |
| 临时分享 | Vercel | 无需PR、快速更新 |

---

## 单文件原型模式

适用于快速原型验证、设计方案对比、客户演示、外部分享。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[模块名称] - 原型演示</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <style>
        :root { --color-primary: #2a3b7d; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app">
        <h1 class="text-2xl font-bold text-[#2a3b7d]">[模块名称]</h1>
    </div>
    <script>
        function handleClick() { alert('功能演示'); }
    </script>
</body>
</html>
```

优点：无需构建工具、可离线使用、易于分享。
不适用：复杂业务系统、需数据持久化、多模块复用。
