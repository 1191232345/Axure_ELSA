#!/bin/bash

# 公网访问启动脚本（使用 ngrok）

echo "=========================================="
echo "启动 Flask 应用（公网访问模式）"
echo "=========================================="

# 检查是否在虚拟环境中
if [ -z "$VIRTUAL_ENV" ]; then
    echo "激活虚拟环境..."
    source .venv/bin/activate
fi

# 检查 ngrok 是否安装
if ! command -v ngrok &> /dev/null; then
    echo "错误: 未找到 ngrok"
    echo ""
    echo "请先安装 ngrok:"
    echo "  macOS: brew install ngrok"
    echo "  或访问: https://ngrok.com/download"
    echo ""
    echo "安装后，在另一个终端运行:"
    echo "  ngrok http 5002"
    echo ""
    echo "然后使用 ngrok 提供的公网地址访问应用"
    echo ""
    echo "正在启动应用（仅本地访问）..."
    python app.py
    exit 1
fi

echo "正在启动 Flask 应用..."
echo "应用将在 http://localhost:5002 运行"
echo ""
echo "提示: 在另一个终端运行以下命令获取公网地址:"
echo "  ngrok http 5002"
echo ""
echo "=========================================="

# 启动 Flask 应用
python app.py

