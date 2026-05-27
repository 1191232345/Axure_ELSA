# 原型部署平台指南（v1.0）

GitHub Pages 和 Vercel 部署详细步骤。

---

## 平台对比

| 特性 | GitHub Pages | Vercel |
|------|-------------|--------|
| **部署速度** | 需合并到 main | 即时部署 |
| **PR 流程** | 必需 | 可选 |
| **自定义域名** | 支持 | 支持 |
| **HTTPS** | 自动 | 自动 |
| **适用场景** | 团队协作、长期维护 | 快速分享、即时预览 |
| **URL 格式** | `https://<owner>.github.io/<repo>/` | `https://<project>.vercel.app` |
| **费用** | 免费 | 免费（个人项目） |

---

## GitHub Pages 部署

### 1. 前置条件

- ✅ 仓库已推送到 GitHub
- ✅ 有仓库写入权限
- ✅ 已安装 GitHub CLI（`gh`）

---

### 2. 启用 GitHub Pages

```bash
# 检查 Pages 是否已启用
gh api repos/<owner>/<repo>/pages --jq '.html_url'

# 如未启用，执行以下命令
gh api repos/<owner>/<repo>/pages -X POST \
  -f source='{"branch":"main","path":"/"}'
```

**参数说明：**
- `branch`: 部署分支（通常为 `main`）
- `path`: 部署路径（根目录 `/` 或 `/docs`）

---

### 3. 部署流程

#### 3.1 创建部署分支

```bash
# 创建新分支
git checkout -b deploy/prototype-[模块名]

# 示例
git checkout -b deploy/prototype-warehouse
```

---

#### 3.2 提交原型文件

```bash
# 添加文件到 Git
git add [模块目录]/

# 示例
git add warehouse/

# 提交
git commit -m "Add [模块名] prototype"

# 示例
git commit -m "Add warehouse prototype"
```

---

#### 3.3 推送并创建 PR

```bash
# 推送到远程
git push origin deploy/prototype-[模块名]

# 创建 Pull Request
gh pr create --title "[模块名] 原型" --body "原型预览"

# 示例
gh pr create --title "仓库管理原型" --body "仓库管理模块原型预览"
```

---

#### 3.4 合并到 main

**⚠️ GitHub Pages 只部署 main 分支内容！**

```bash
# 等待 CI 检查完成（如有）
# 合并 PR
gh pr merge [PR编号] --squash --delete-branch

# 示例
gh pr merge 123 --squash --delete-branch
```

---

#### 3.5 打开公开 URL

```bash
# 获取 Pages URL
PAGES_URL=$(gh api repos/<owner>/<repo>/pages --jq '.html_url')

# 打开浏览器
open "${PAGES_URL}[模块目录]/index.html"

# 示例
open "https://zsw.github.io/Axure_ELSA/warehouse/index.html"
```

---

### 4. URL 格式

```
https://<owner>.github.io/<repo>/[模块目录]/index.html
```

**示例：**
```
https://zsw.github.io/Axure_ELSA/warehouse/index.html
https://zsw.github.io/Axure_ELSA/inventory/index.html
```

---

### 5. 更新已部署原型

```bash
# 1. 创建新分支
git checkout -b update/prototype-[模块名]

# 2. 修改原型文件
# 编辑 HTML/CSS/JS

# 3. 提交并推送
git add [模块目录]/
git commit -m "Update [模块名] prototype"
git push origin update/prototype-[模块名]

# 4. 创建 PR 并合并
gh pr create --title "Update [模块名] prototype"
gh pr merge [PR编号] --squash --delete-branch

# 5. Pages 自动更新（等待1-2分钟）
```

---

## Vercel 部署

### 1. 前置条件

- ✅ 安装 Vercel CLI
- ✅ 已登录 Vercel

```bash
# 安装 CLI
npm install -g vercel

# 登录
vercel login

# 检查登录状态
vercel whoami
```

---

### 2. 部署流程

#### 2.1 进入模块目录

```bash
cd [模块目录]

# 示例
cd warehouse
```

---

#### 2.2 准备部署文件

**⚠️ Vercel 默认查找 `index.html`！**

如果你的主文件名不是 `index.html`，需要创建临时副本：

```bash
# 如果主文件是 index.html，无需操作
# 如果主文件是其他名称（如 prototype.html），创建副本
cp prototype.html index.html
```

---

#### 2.3 部署到生产环境

```bash
# 部署（--prod 表示生产环境）
vercel deploy --prod --yes

# 输出示例：
# Production: https://warehouse-prototype.vercel.app
# Alias: https://warehouse.vercel.app
```

---

#### 2.4 清理临时文件

```bash
# 如果创建了临时 index.html，删除它
rm index.html

# 保持原文件名作为 source of truth
```

---

#### 2.5 打开部署 URL

```bash
# Vercel 会输出生产 URL 和别名 URL
# 打开别名 URL（更简洁）
open https://[project-name].vercel.app

# 示例
open https://warehouse-prototype.vercel.app
```

---

### 3. URL 格式

```
https://[project-name].vercel.app
```

**示例：**
```
https://warehouse-prototype.vercel.app
https://inventory-management.vercel.app
```

---

### 4. 更新已部署原型

```bash
# 1. 修改原型文件
# 编辑 HTML/CSS/JS

# 2. 进入模块目录
cd [模块目录]

# 3. 重新部署
vercel deploy --prod --yes

# 4. Vercel 即时更新（无需等待）
```

---

### 5. Vercel 项目管理

```bash
# 查看项目列表
vercel list

# 查看项目详情
vercel inspect [project-name]

# 删除项目
vercel remove [project-name]
```

---

## 部署后验证

### 1. 验证清单

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 页面加载 | 页面正常显示 | 打开 URL 查看 |
| ✅ 样式渲染 | CSS 正确应用 | 检查样式效果 |
| ✅ 交互功能 | JS 功能正常 | 测试按钮/表单 |
| ✅ 数据显示 | 数据正确加载 | 检查表格/列表 |
| ✅ 无报错 | 控制台无错误 | 打开开发者工具 |

---

### 2. 常见问题排查

#### 问题1：页面404

**GitHub Pages：**
- 检查文件路径是否正确
- 检查是否已合并到 main
- 等待1-2分钟让 Pages 更新

**Vercel：**
- 检查是否有 `index.html`
- 检查部署是否成功

---

#### 问题2：样式不加载

**检查项：**
- CSS 文件路径是否正确
- CDN 是否可访问
- 是否有 CORS 问题

---

#### 问题3：JS 不执行

**检查项：**
- JS 文件路径是否正确
- 是否有语法错误
- 控制台是否有报错

---

## 最佳实践

### 1. 部署前准备

```bash
# 1. 完成安全检查
# 参考 security-checklist.md

# 2. 本地测试验证
open http://localhost:3100/[模块名]/index.html

# 3. 确认功能正常
# 测试所有交互功能

# 4. 选择部署平台
# GitHub Pages：团队协作
# Vercel：快速分享
```

---

### 2. 部署策略

| 场景 | 推荐平台 | 原因 |
|------|----------|------|
| **团队协作** | GitHub Pages | PR流程、版本控制 |
| **客户演示** | Vercel | 即时部署、快速分享 |
| **长期维护** | GitHub Pages | 与代码仓库同步 |
| **临时分享** | Vercel | 无需PR、快速更新 |

---

### 3. 版本管理

**GitHub Pages：**
- 每次更新通过 PR
- 保留完整版本历史
- 可回滚到任意版本

**Vercel：**
- 每次部署生成新 URL
- 可查看部署历史
- 可回滚到历史版本

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v1.0** | 2026-05-27 | 初始版本：GitHub Pages + Vercel 部署指南 |