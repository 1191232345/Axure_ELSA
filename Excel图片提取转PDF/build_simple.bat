@echo off
chcp 65001 >nul
echo ============================================
echo   Excel图片提取转PDF工具 - Windows打包脚本
echo ============================================
echo.

echo [1/3] 安装依赖...
pip install pyinstaller flask openpyxl pillow reportlab werkzeug -q
echo ✅ 依赖安装完成

echo.
echo [2/3] 开始打包...
echo 这可能需要几分钟时间，请耐心等待...
echo.

pyinstaller --clean --noconfirm --onefile --windowed --name "Excel图片提取转PDF工具" desktop_app.py

if errorlevel 1 (
    echo.
    echo ❌ 打包失败
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✅ 打包完成！
echo ============================================
echo.
echo 输出文件: dist\Excel图片提取转PDF工具.exe
echo.
echo 使用方法:
echo   1. 将 dist\Excel图片提取转PDF工具.exe 复制到任意目录
echo   2. 双击运行即可使用
echo   3. uploads 和 processed 文件夹会自动创建在exe同级目录
echo.
pause
