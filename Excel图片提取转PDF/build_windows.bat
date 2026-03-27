@echo off
chcp 65001 >nul
echo ============================================
echo   Excel图片提取转PDF工具 - Windows打包脚本
echo ============================================
echo.

echo [1/4] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python环境正常

echo.
echo [2/4] 安装PyInstaller...
pip install pyinstaller -q
if errorlevel 1 (
    echo ❌ PyInstaller安装失败
    pause
    exit /b 1
)
echo ✅ PyInstaller安装完成

echo.
echo [3/4] 安装项目依赖...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [4/4] 开始打包...
echo 这可能需要几分钟时间，请耐心等待...
echo.

pyinstaller --clean --noconfirm excel_to_pdf.spec

if errorlevel 1 (
    echo.
    echo ❌ 打包失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo ============================================
echo ✅ 打包完成！
echo ============================================
echo.
echo 输出文件位置: dist\Excel图片提取转PDF工具.exe
echo.
echo 使用方法:
echo   1. 将 dist\Excel图片提取转PDF工具.exe 复制到任意目录
echo   2. 双击运行即可使用
echo.
pause
