import sys
import os
import threading
import webview
import socket

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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

def start_flask():
    init_data()
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

def main():
    local_ip = get_local_ip()
    print(f"=" * 50)
    print(f"绩效评价系统已启动")
    print(f"本机访问: http://127.0.0.1:5000/editor")
    print(f"局域网访问: http://{local_ip}:5000/editor")
    print(f"=" * 50)
    
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()
    
    import time
    time.sleep(1)
    
    window = webview.create_window(
        title='绩效评价系统',
        url='http://127.0.0.1:5000/editor',
        width=1200,
        height=800,
        resizable=True,
        min_size=(800, 600)
    )
    
    webview.start()

if __name__ == '__main__':
    main()
