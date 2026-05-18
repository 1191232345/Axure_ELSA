# 部署指南 - 公网访问

本文档提供了几种将应用发布到公网的方法。

## 方案一：使用 ngrok（推荐 - 最简单快速）

ngrok 是一个内网穿透工具，可以快速将本地服务暴露到公网。

### 步骤：

1. **安装 ngrok**
   ```bash
   # macOS
   brew install ngrok
   
   # 或从官网下载：https://ngrok.com/download
   ```

2. **启动 Flask 应用**
   ```bash
   cd /Users/zsw/Desktop/records-master
   source .venv/bin/activate
   python app.py
   ```

3. **在另一个终端启动 ngrok**
   ```bash
   ngrok http 5002
   ```

4. **获取公网地址**
   ngrok 会显示一个公网地址，例如：`https://xxxx-xxxx-xxxx.ngrok-free.app`
   使用这个地址即可从任何地方访问你的应用。

### 注意事项：
- 免费版 ngrok 地址每次重启会变化
- 免费版有连接数限制
- 适合测试和演示使用

---

## 方案二：部署到云服务器（生产环境推荐）

### 2.1 使用 Gunicorn + Nginx

#### 步骤：

1. **安装 Gunicorn**
   ```bash
   pip install gunicorn
   ```

2. **创建 Gunicorn 配置文件** (`gunicorn_config.py`)
   ```python
   bind = "0.0.0.0:5002"
   workers = 4
   worker_class = "sync"
   timeout = 120
   keepalive = 5
   ```

3. **使用 Gunicorn 启动应用**
   ```bash
   gunicorn -c gunicorn_config.py app:app
   ```

4. **配置 Nginx 反向代理** (`/etc/nginx/sites-available/records-app`)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # 替换为你的域名或IP
       
       location / {
           proxy_pass http://127.0.0.1:5002;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. **启用 Nginx 配置**
   ```bash
   sudo ln -s /etc/nginx/sites-available/records-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

#### 使用 systemd 管理服务（可选）

创建服务文件 `/etc/systemd/system/records-app.service`:
```ini
[Unit]
Description=Records App Gunicorn daemon
After=network.target

[Service]
User=your_username
Group=your_group
WorkingDirectory=/path/to/records-master
Environment="PATH=/path/to/records-master/.venv/bin"
ExecStart=/path/to/records-master/.venv/bin/gunicorn -c gunicorn_config.py app:app

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl start records-app
sudo systemctl enable records-app
```

---

## 方案三：使用云平台服务

### 3.1 Railway（推荐）

1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 创建新项目，连接 GitHub 仓库
4. Railway 会自动检测 Flask 应用并部署

### 3.2 Render

1. 访问 https://render.com
2. 连接 GitHub 仓库
3. 选择 Web Service
4. 配置：
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

### 3.3 Heroku

1. 安装 Heroku CLI
2. 创建 `Procfile`:
   ```
   web: gunicorn app:app
   ```
3. 部署：
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

---

## 方案四：使用 Docker（推荐用于容器化部署）

### 创建 Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5002

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5002", "app:app"]
```

### 构建和运行

```bash
docker build -t records-app .
docker run -d -p 5002:5002 --name records-app records-app
```

---

## 安全建议

1. **生产环境关闭 Debug 模式**
   ```python
   app.run(debug=False, host='0.0.0.0', port=5002)
   ```

2. **使用 HTTPS**
   - 使用 Let's Encrypt 免费 SSL 证书
   - 配置 Nginx SSL

3. **设置防火墙**
   - 只开放必要的端口
   - 限制访问来源（如需要）

4. **环境变量管理**
   - 使用 `.env` 文件管理敏感信息
   - 不要将密钥提交到代码仓库

5. **数据库备份**
   - 定期备份 SQLite 数据库
   - 考虑迁移到 PostgreSQL 或 MySQL（生产环境）

---

## 快速开始（ngrok）

如果你想快速测试，推荐使用 ngrok：

```bash
# 1. 启动应用
cd /Users/zsw/Desktop/records-master
source .venv/bin/activate
python app.py

# 2. 在另一个终端运行
ngrok http 5002
```

然后使用 ngrok 提供的公网地址访问应用。

