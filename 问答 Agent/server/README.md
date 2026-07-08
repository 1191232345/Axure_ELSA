# RAG 后端 API

与前端 **同一端口** 运行（默认 8000）。

## 启动

```bash
# 在项目根目录
npm install          # demo 依赖（首次）
cd server && pip install -r requirements.txt
cd ..
npm start            # 构建 demo/dist + 启动
```

访问 http://127.0.0.1:8000 ，点击 **⚙️ 配置** 设置模型并 **重建索引**。

## 接口

| 路径 | 说明 |
|------|------|
| `/` | 聊天 Demo（静态） |
| `GET /api/health` | 健康检查 |
| `GET /api/config` | 读取当前模型配置 |
| `PUT /api/config` | 保存配置 |
| `GET /api/index` | 索引状态 |
| `POST /api/index/rebuild` | 手动切分并构建向量索引 |
| `POST /api/chat` | SSE 多轮问答 |

## 配置

**模型与检索参数仅通过前端配置页管理**，持久化到 `server/settings.json`。向量索引缓存于 `data/index.cache.json`，启动时只加载缓存，需在配置页手动「重建索引」。

首次启动使用 `settings.example.json` 中的 Ollama 默认值。本地 Ollama 需先拉取模型：

```bash
ollama pull qwen2.5:3b
ollama pull bge-m3
```

可选环境变量（部署用）：`HOST`、`PORT`、`SERVE_FRONTEND=false`（仅 API 模式）。

## 模块

| 文件 | 职责 |
|------|------|
| `main.py` | 入口 |
| `settings_store.py` | 配置读写 |
| `static.py` | 托管 demo/dist |
| `routes.py` | API 路由 |
| `rag.py` | RAG 编排 |
