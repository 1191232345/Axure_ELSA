import sys
import os
import socket
import webbrowser
from app import app, init_data

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "127.0.0.1"

if __name__ == '__main__':
    init_data()
    local_ip = get_local_ip()
    
    print("=" * 50)
    print("绩效评价系统已启动")
    print(f"本机访问: http://127.0.0.1:5000/editor")
    print(f"局域网访问: http://{local_ip}:5000/editor")
    print("=" * 50)
    print("按 Ctrl+C 停止服务")
    
    webbrowser.open('http://127.0.0.1:5000/editor')
    
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
