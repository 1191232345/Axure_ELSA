# Excel图片提取转PDF工具 - Windows打包指南

## 打包前准备

### 环境要求
- Windows 10/11 操作系统
- Python 3.8 或更高版本
- pip 包管理器

### 安装Python
1. 访问 https://www.python.org/downloads/
2. 下载 Python 3.8+ 安装包
3. 安装时勾选 "Add Python to PATH"

## 打包方法

### 方法一：一键打包（推荐）

双击运行 `build_simple.bat`，脚本会自动完成：
- 安装所有依赖
- 打包生成 exe 文件

### 方法二：完整打包

双击运行 `build_windows.bat`，使用 spec 配置文件打包。

### 方法三：手动打包

```bash
# 1. 安装依赖
pip install pyinstaller
pip install -r requirements.txt

# 2. 打包（简易模式）
pyinstaller --onefile --windowed --name "Excel图片提取转PDF工具" --add-data "app.py;." desktop_app.py

# 或使用spec文件打包
pyinstaller excel_to_pdf.spec
```

## 打包参数说明

| 参数 | 说明 |
|------|------|
| `--onefile` | 打包成单个exe文件 |
| `--windowed` | 隐藏控制台窗口 |
| `--name` | 设置exe文件名 |
| `--add-data` | 添加数据文件 |
| `--icon` | 设置图标（可选） |

## 添加自定义图标

1. 准备一个 `.ico` 格式的图标文件
2. 将图标文件放到项目目录
3. 修改打包命令添加 `--icon=图标文件名.ico`

## 输出文件

打包完成后，在 `dist` 目录下会生成：
- `Excel图片提取转PDF工具.exe` - 可执行文件

## 使用方法

1. 将生成的 exe 文件复制到任意目录
2. 双击运行
3. 点击"启动服务"按钮
4. 在浏览器中访问显示的地址

## 常见问题

### 1. 打包失败
- 检查Python版本是否正确
- 确保所有依赖都已安装
- 尝试以管理员身份运行打包脚本

### 2. exe运行报错
- 检查杀毒软件是否拦截
- 尝试以管理员身份运行
- 检查端口5004是否被占用

### 3. 文件体积过大
PyInstaller会将Python解释器和所有依赖打包，文件较大是正常的。可以使用UPX压缩减小体积。

### 4. 缺少模块
如果运行时报错缺少模块，在spec文件的 `hiddenimports` 列表中添加缺失的模块名。

## 文件结构

```
Excel图片提取转PDF/
├── app.py              # Flask主程序
├── desktop_app.py      # 桌面应用启动器
├── requirements.txt    # Python依赖
├── excel_to_pdf.spec   # PyInstaller配置
├── build_simple.bat    # 简易打包脚本
├── build_windows.bat   # 完整打包脚本
└── BUILD_README.txt    # 本说明文件
```
