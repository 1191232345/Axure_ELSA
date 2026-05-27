# 原型安全检查清单（v1.0）

部署前必查项，确保原型内容安全可公开分享。

---

## ⚠️ 重要提醒

**GitHub Pages 和 Vercel 默认部署到公开 URL！**

部署前必须完成以下检查，确认原型不含敏感信息。

---

## 1. 数据安全检查

### 1.1 用户数据

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 无真实用户数据 | 不含 PII（姓名/邮箱/手机号） | 检查 data/*.json |
| ✅ 无生产数据库内容 | 不含真实业务数据 | 检查测试数据来源 |
| ✅ 使用虚构测试数据 | 使用 fake usernames、placeholder repos | 验证数据真实性 |

**示例：虚构数据规范**

```json
{
  "users": [
    {"name": "张三（示例）", "email": "demo@example.com"},
    {"name": "李四（测试）", "email": "test@example.com"}
  ]
}
```

**禁止使用：**
```json
{
  "users": [
    {"name": "真实用户名", "email": "real@company.com"}  // ❌ 禁止
  ]
}
```

---

### 1.2 业务数据

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 无真实订单数据 | 不含订单号/金额/客户信息 | 检查表格数据 |
| ✅ 无真实库存数据 | 不含 SKU/库存数量/成本 | 检查商品数据 |
| ✅ 无真实财务数据 | 不含报表/预算/成本数据 | 检查财务模块 |

---

## 2. 凭证安全检查

### 2.1 API 凭证

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 无 API keys | 不含第三方 API 密钥 | 搜索 "api_key"、"apikey" |
| ✅ 无 tokens | 不含认证令牌 | 搜索 "token"、"bearer" |
| ✅ 无 secrets | 不含密钥/密码 | 搜索 "secret"、"password" |

**禁止硬编码：**
```javascript
const API_KEY = "sk-xxxxx";  // ❌ 禁止
const TOKEN = "eyJhbGc...";  // ❌ 禁止
```

**推荐做法：**
```javascript
const API_BASE = "/api/data";  // ✅ 使用相对路径
const DATA_FILE = "data/test-data.json";  // ✅ 本地文件
```

---

### 2.2 认证信息

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 无用户名密码 | 不含登录凭证 | 搜索 "username"、"password" |
| ✅ 无数据库连接串 | 不含 DB 连接信息 | 搜索 "mongodb"、"mysql" |
| ✅ 无 SSH keys | 不含私钥文件 | 检查是否有 .pem/.key 文件 |

---

## 3. 内容安全检查

### 3.1 内部信息

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 无内部 URL | 不含公司内部域名/IP | 搜索 "http://192"、"http://10" |
| ✅ 无内部工具截图 | 不含内部系统界面截图 | 检查图片资源 |
| ✅ 无未发布功能 | 不含未公开功能细节 | 检查功能描述 |

**禁止暴露：**
```html
<a href="http://192.168.1.100:8080">内部系统</a>  // ❌ 禁止
<img src="internal-dashboard.png">  // ❌ 禁止（真实截图）
```

---

### 3.2 商业机密

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 无商业逻辑 | 不含核心业务算法 | 检查 JS 逻辑 |
| ✅ 无定价策略 | 不含价格/折扣规则 | 检查价格数据 |
| ✅ 无客户名单 | 不含客户/供应商信息 | 检查客户数据 |

---

## 4. 依赖安全检查

### 4.1 外部资源

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 不引用未知 CDN | 不含可疑第三方脚本 | 检查 script src |
| ✅ 所有资源可信 | CDN 来源可信（jsdelivr/cloudflare） | 验证 CDN 域名 |
| ⚪ 资源内联（推荐） | 所有 CSS/JS 内联 | 检查是否有外部文件 |

**推荐 CDN：**
```html
<!-- ✅ 可信 CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"></script>
```

**禁止使用：**
```html
<!-- ❌ 未知来源 -->
<script src="https://unknown-site.com/script.js"></script>
```

---

### 4.2 第三方脚本

| 检查项 | 说明 | 检查方法 |
|--------|------|----------|
| ✅ 无跟踪脚本 | 不含 analytics/tracking | 搜索 "analytics"、"track" |
| ✅ 无广告脚本 | 不含 ad scripts | 搜索 "ads"、"advertisement" |
| ✅ 无恶意脚本 | 不含可疑代码 | 检查 eval/Function |

---

## 5. 检查流程

### 5.1 自动化检查脚本

```bash
#!/bin/bash
# security-check.sh

echo "🔍 开始安全检查..."

# 检查敏感关键词
grep -r "api_key\|apikey\|secret\|password\|token" --include="*.js" --include="*.html" .
grep -r "192\.168\|10\.0\|172\.16" --include="*.html" --include="*.js" .

# 检查外部脚本
grep -r "script src=" --include="*.html" . | grep -v "cdn.jsdelivr\|cdn.tailwind\|cdnjs"

echo "✅ 安全检查完成"
```

---

### 5.2 手动检查清单

**部署前逐项确认：**

```markdown
## 安全检查确认表

**检查人**：[姓名]
**检查日期**：YYYY-MM-DD
**模块名称**：[模块名]

### 数据安全
- [ ] 无真实用户数据（PII）
- [ ] 无生产数据库内容
- [ ] 使用虚构测试数据

### 凭证安全
- [ ] 无 API keys / tokens
- [ ] 无用户名密码硬编码
- [ ] 无数据库连接串

### 内容安全
- [ ] 无内部 URL 暴露
- [ ] 无内部工具截图
- [ ] 无未发布功能细节
- [ ] 无商业机密信息

### 依赖安全
- [ ] 不引用未知 CDN
- [ ] 无跟踪脚本
- [ ] 无恶意脚本

### 确认签字
**确认人**：[姓名]
**确认日期**：YYYY-MM-DD
**备注**：[补充说明]
```

---

## 6. 违规处理

### 6.1 发现违规项

**处理流程：**

1. **立即停止部署**
2. **标记违规内容**
3. **替换为安全内容**
4. **重新检查**
5. **确认通过后部署**

---

### 6.2 常见违规示例

| 违规类型 | 违规内容 | 修复方案 |
|----------|----------|----------|
| 真实数据 | `{"name": "真实用户"}` | 替换为 `{"name": "张三（示例）"}` |
| API key | `const KEY = "sk-xxx"` | 删除，使用本地数据 |
| 内部 URL | `http://192.168.1.100` | 替换为 `http://localhost:3100` |
| 真实截图 | `internal-dashboard.png` | 替换为虚构界面 |

---

## 7. 安全最佳实践

### 7.1 数据生成规范

**使用虚构数据生成器：**

```javascript
function generateFakeData(count) {
    const names = ['张三', '李四', '王五', '赵六'];
    const emails = ['demo1@example.com', 'demo2@example.com'];
    
    return Array.from({length: count}, (_, i) => ({
        id: i + 1,
        name: names[i % names.length] + '（示例）',
        email: emails[i % emails.length],
        status: ['active', 'inactive'][i % 2]
    }));
}
```

---

### 7.2 URL 规范

**使用相对路径或 localhost：**

```javascript
const API_BASE = "/api/data";  // ✅ 相对路径
const LOCAL_URL = "http://localhost:3100";  // ✅ 本地开发
```

**禁止使用：**
```javascript
const INTERNAL_URL = "http://192.168.1.100:8080";  // ❌ 内部地址
const PROD_URL = "https://prod.company.com";  // ❌ 生产环境
```

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|:----:|:----:|----------|
| **v1.0** | 2026-05-27 | 初始版本：数据/凭证/内容/依赖安全检查 |