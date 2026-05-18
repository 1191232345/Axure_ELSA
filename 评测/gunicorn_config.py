# Gunicorn 配置文件
bind = "0.0.0.0:5002"
workers = 4
worker_class = "sync"
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50

