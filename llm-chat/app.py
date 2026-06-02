from flask import Flask, render_template
from flask_cors import CORS
from models import init_db
from routes import register_routes
import subprocess
import sys
import time
import os

app = Flask(__name__)
app.secret_key = 'llm-chat-secret-key-2024'
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/config')
def config():
    return render_template('config.html')

@app.route('/intents')
def intent_config():
    return render_template('intent-config.html')

def kill_port_process(port):
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
                        subprocess.run(['kill', '-9', pid], timeout=5)
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

init_db()
register_routes(app)

if __name__ == '__main__':
    port = 5002
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        print(f'检查端口 {port} 是否被占用...')
        kill_port_process(port)
        print(f'启动 Flask 应用，端口: {port}')
    app.run(debug=True, port=port, threaded=True)