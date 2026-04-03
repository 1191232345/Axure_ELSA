@echo off
chcp 65001 >nul
echo ========================================
echo    绩效评价系统 - Windows打包脚本
echo ========================================
echo.

echo [1/4] 检查Python环境...
python --version
if errorlevel 1 (
    echo 错误: 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

echo.
echo [2/4] 安装依赖包...
pip install -r requirements.txt
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [3/4] 开始打包...
pyinstaller --clean records.spec
if errorlevel 1 (
    echo 错误: 打包失败
    pause
    exit /b 1
)

echo.
echo [4/4] 打包完成!
echo.
echo 输出文件位置: dist\绩效评价系统.exe
echo.
echo ========================================
pause
