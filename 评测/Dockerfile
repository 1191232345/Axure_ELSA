FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p db templates

# 暴露端口
EXPOSE 5002

# 启动命令
CMD ["gunicorn", "-c", "gunicorn_config.py", "app:app"]

