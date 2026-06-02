# LLM 智能问答系统

一个支持本地和云端大模型的智能问答系统，类似 DeepSeek 的聊天界面。

## 功能特点

### 🌟 核心功能
- **实时问答**：流式响应，打字机效果展示
- **Markdown 渲染**：支持代码高亮、表格、列表等
- **历史对话**：自动保存和查看历史对话记录
- **多模型支持**：支持本地和云端多种大模型

### 🔧 配置管理
- **本地 LLM**：支持 Ollama、LocalAI 等本地部署模型
- **云端 LLM**：支持 DeepSeek、OpenAI、Anthropic、智谱AI 等
- **快速配置**：一键配置本地模型
- **配置测试**：验证 API Key 和连接状态

## 支持的模型提供商

### 本地模型（无需 API Key）
| 提供商 | 默认地址 | 说明 |
|--------|---------|------|
| **Ollama** | http://localhost:11434/v1 | 本地运行的开源大模型 |
| **LocalAI** | http://localhost:8080/v1 | 本地 AI 服务，兼容 OpenAI API |

### 云端模型（需要 API Key）
| 提供商 | 说明 |
|--------|------|
| **DeepSeek** | DeepSeek 云端 API |
| **OpenAI** | OpenAI 官方 API |
| **Anthropic** | Claude API |
| **智谱AI** | 智谱 GLM 系列 |

## 快速开始

### 1. 安装依赖

```bash
cd llm-chat
pip install -r requirements.txt
```

### 2. 启动应用

```bash
python3 app.py
```

应用将在 http://127.0.0.1:5002 启动

### 3. 配置模型

访问 http://127.0.0.1:5002/config 进行模型配置

#### 本地模型快速配置
1. 点击提供商卡片（Ollama 或 LocalAI）
2. 系统自动创建默认配置
3. 点击"测试连接"验证服务状态

#### 云端模型配置
1. 点击"添加配置"按钮
2. 选择云端提供商
3. 输入 API Key
4. 选择模型
5. 点击"测试连接"验证配置

### 4. 开始对话

访问 http://127.0.0.1:5002 开始对话

## 本地模型部署指南

### Ollama 部署

#### 安装 Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

#### 启动服务
```bash
ollama serve
```

#### 下载模型
```bash
# 下载 Llama 3
ollama pull llama3

# 下载 Mistral
ollama pull mistral

# 下载 DeepSeek Coder
ollama pull deepseek-coder
```

### LocalAI 部署

#### 使用 Docker
```bash
docker run -p 8080:8080 localai/localai:latest
```

#### 配置模型
LocalAI 会自动下载和配置模型，兼容 OpenAI API 格式。

## API 接口

### 配置管理
- `GET /api/configs/providers` - 获取支持的提供商列表
- `GET /api/configs/` - 获取所有配置
- `POST /api/configs/` - 创建新配置
- `PUT /api/configs/<id>` - 更新配置
- `DELETE /api/configs/<id>` - 删除配置

### 测试接口
- `POST /api/configs/test` - 测试配置连接
- `POST /api/configs/<id>/test` - 测试指定配置
- `POST /api/configs/test-chat` - 测试对话功能
- `POST /api/configs/<id>/test-chat` - 测试指定配置对话

### 快速配置
- `GET /api/configs/default-local` - 获取本地默认配置
- `POST /api/configs/quick-setup/<provider>` - 快速配置本地模型

### 对话接口
- `GET /api/chat/conversations` - 获取对话列表
- `POST /api/chat/conversations` - 创建新对话
- `POST /api/chat/stream` - 流式对话
- `POST /api/chat/send` - 非流式对话

## 项目结构

```
llm-chat/
├── app.py                  # Flask 主应用
├── config.py               # 配置文件
├── requirements.txt        # 依赖
├── models/                 # 数据模型
│   ├── __init__.py         # 数据库初始化
│   ├── config.py           # 模型配置
│   └── chat.py             # 聊天记录
├── routes/                 # 路由
│   ├── __init__.py         # 路由注册
│   ├── config.py           # 配置路由
│   └── chat.py             # 聊天路由
├── services/               # 服务层
│   └── test_service.py     # 测试服务
├── static/                 # 静态文件
│   ├── css/chat.css        # 样式
│   └── js/                 # JavaScript
│       ├── config.js       # 配置管理
│       ├── api.js          # API 封装
│       ├── chat.js         # 聊天逻辑
│       ├── markdown.js     # Markdown 渲染
│       └── config-page.js  # 配置页面逻辑
└── templates/              # 模板
    ├── index.html          # 主页面
    └── config.html         # 配置页面
```

## 使用技巧

### 1. 本地模型优先
- 本地模型无需 API Key，完全免费
- 数据隐私安全，不传输到云端
- 响应速度快，无网络延迟

### 2. 云端模型备用
- 云端模型能力更强
- 适合复杂任务和专业领域
- 需要付费 API Key

### 3. 配置测试
- 添加配置后务必测试连接
- 测试对话验证模型响应质量
- 检查可用模型列表

### 4. 对话管理
- 历史对话自动保存
- 可以继续之前的对话
- 支持删除不需要的对话

## 常见问题

### Q: 本地模型连接失败？
A: 
1. 检查 Ollama/LocalAI 服务是否启动
2. 确认端口地址是否正确
3. 检查模型是否已下载

### Q: 云端模型 API Key 无效？
A: 
1. 检查 API Key 是否正确
2. 确认 API Key 是否有余额
3. 检查 Base URL 是否正确

### Q: 如何切换模型？
A: 在配置页面设置默认模型，或在对话页面选择模型

### Q: 如何查看可用模型？
A: 点击"测试连接"按钮，系统会显示可用模型列表

## 技术栈

- **后端**: Flask + SQLite
- **前端**: 原生 JavaScript + TailwindCSS
- **Markdown**: Marked.js + Highlight.js
- **流式响应**: Server-Sent Events (SSE)

## 许可证

MIT License