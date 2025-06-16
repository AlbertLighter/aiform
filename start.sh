#!/bin/bash

echo "🚀 启动 AIForm 开发服务器..."

# 检查是否安装了python3
if command -v python3 &> /dev/null; then
    echo "使用 Python3 启动服务器..."
    echo "📂 服务器地址: http://localhost:8000"
    echo "📄 测试页面: http://localhost:8000/test.html"
    echo "📄 示例页面: http://localhost:8000/example/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "使用 Python2 启动服务器..."
    echo "📂 服务器地址: http://localhost:8000"
    echo "📄 测试页面: http://localhost:8000/test.html"
    echo "📄 示例页面: http://localhost:8000/example/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "使用 Node.js 启动服务器..."
    npx serve -p 8000
else
    echo "❌ 没有找到 Python 或 Node.js"
    echo "请安装以下任一工具："
    echo "  - Python 3: https://www.python.org/"
    echo "  - Node.js: https://nodejs.org/"
    echo ""
    echo "或者直接用浏览器打开 test.html 文件"
fi 