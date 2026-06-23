from flask import Flask
from flask_wtf.csrf import CSRFProtect
from models import init_db
from routes import register_routes
import subprocess
import sys
import time
import os
import logging
from logging.handlers import RotatingFileHandler
from config import config

# 初始化 CSRF 保护
csrf = CSRFProtect()

def setup_logging(app):
    """配置日志系统"""
    if not app.debug:
        # 生产环境日志配置
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = RotatingFileHandler(
            app.config['LOG_FILE'],
            maxBytes=10240000,
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(getattr(logging, app.config['LOG_LEVEL']))
        app.logger.addHandler(file_handler)
        app.logger.setLevel(getattr(logging, app.config['LOG_LEVEL']))
        app.logger.info('应用启动')

def create_app(config_name='default'):
    """应用工厂函数"""
    app = Flask(__name__)
    
    # 加载配置
    app.config.from_object(config[config_name])
    
    # 初始化 CSRF 保护
    csrf.init_app(app)
    
    # 配置日志
    setup_logging(app)
    
    # 初始化数据库
    init_db()
    
    # 注册路由
    register_routes(app)
    
    return app

def kill_port_process(port):
    """安全地停止占用端口的进程"""
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        return
    
    current_pid = os.getpid()
    try:
        result = subprocess.run(
            ['lsof', '-ti', f':{port}'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                pid_int = int(pid)
                if pid_int != current_pid:
                    try:
                        # 使用 SIGTERM 而不是 SIGKILL，更安全
                        subprocess.run(['kill', '-15', pid], timeout=5)
                        print(f'已停止占用端口 {port} 的进程 (PID: {pid})')
                        time.sleep(1)
                    except subprocess.TimeoutExpired:
                        print(f'停止进程 {pid} 超时')
                    except Exception as e:
                        print(f'停止进程 {pid} 失败: {e}')
    except subprocess.TimeoutExpired:
        print('查找端口占用进程超时')
    except FileNotFoundError:
        print('lsof 命令不可用，跳过端口检查')
    except Exception as e:
        print(f'检查端口时出错: {e}')

# 创建应用实例
app = create_app(os.environ.get('FLASK_ENV', 'default'))

if __name__ == '__main__':
    port = 5002
    # 开放局域网访问，使用 0.0.0.0 作为 host
    host = '0.0.0.0'
    
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        print(f'检查端口 {port} 是否被占用...')
        kill_port_process(port)
        print(f'启动 Flask 应用，端口: {port}')
        print(f'局域网访问地址: http://<你的IP地址>:5002/')
    app.run(debug=app.config['DEBUG'], host=host, port=port)