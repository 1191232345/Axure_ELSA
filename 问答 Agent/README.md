# 问答 Agent

多轮 RAG 问答 Demo：**前后端同一端口**（默认 `8000`）。

## 一键启动

```bash
# 首次
cd server && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd ..

cd demo && npm install && cd ..

# 构建前端 + 启动（同一端口）
npm start
```

浏览器打开：**http://127.0.0.1:8000**（请用 127.0.0.1，不要用 0.0.0.0）

- 页面：`/` → 聊天 Demo
- **⚙️ 配置** → 模型与检索参数（保存到 `server/settings.json`）
- **📚 知识库** → 文档编辑、分块预览与向量索引构建
- **✏️ 新建原型** → 四区需求配置页（检索条件 / 主要按钮 / 列表属性 / 行内操作）
- **📐 原型预览** → 查看 `prototype-skeleton/generated` 下所有归档原型
- API：`/api/chat`、`/api/prototypes`、`/api/prototypes/generate`、`/api/health`、`/api/config`

## 目录

```
├── demo/                 # 前端 React SPA
├── server/               # FastAPI 后端
├── prototype-skeleton/   # 原型骨架；生成物在 generated/
└── data/                 # 知识库、原型注册表等
```

## 原理

FastAPI 同时提供：

1. `/api/*` — RAG 后端
2. `/`、`/assets/*` — `demo/dist` 静态资源（SPA 回退）
3. `/api/prototype-files/*` — `prototype-skeleton/` 静态资源（原型预览）

前端请求 `/api/chat` 为同源相对路径，无需 Vite 代理。

## 仅 API 模式

```bash
SERVE_FRONTEND=false python server/main.py
```

## 开发提示

`python server/main.py` 启动时会**自动编译前端**（`demo/dist` 缺失或源码比 dist 新时），并在开发模式下**监听 `demo/src` 变更**后自动重新编译。刷新浏览器即可看到最新页面。

**RAG 路由：** 聊天时 LLM 会根据各知识库的「描述（意图路由范围）」自动选择已索引库检索；选不中时回退到「使用中」库。请在 📚 知识库 → ⚙️ 库设置 填写清晰的范围描述，并为每个库单独构建索引。

**原型需求：** 点击 **✏️ 新建原型** 打开四区需求配置页；在 **📐 原型预览** 页可用 **✨ AI 修改** 描述改动，先生成草稿预览路径，确认后替换正式原型，取消则保持现状。

**检索质量（P0）：** 默认启用 **BM25 + 向量混合检索（RRF）** 与 **轻量重排**，可在 ⚙️ 配置页调整。知识库页「召回测试 → 批量评测」读取 `data/kb/{id}/recall_tests.json` 跑回归。修改分块策略或 Embedding 后请重新构建索引。

环境变量（可选）：

- `FRONTEND_AUTO_BUILD=false` — 跳过启动时自动编译
- `FRONTEND_WATCH=false` — 关闭源码监听
- `RELOAD=false` — 关闭 Python 热重载（同时默认关闭前端监听）

仅改 Python 后端时，保存后 uvicorn 会自动重载。
