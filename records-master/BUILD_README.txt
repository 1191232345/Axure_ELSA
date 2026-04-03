# 绩效评价系统 - Windows桌面应用打包说明

## 环境要求

- Windows 10/11
- Python 3.8 或更高版本

## 打包步骤

### 方法一：使用打包脚本（推荐）

1. 在Windows上打开命令提示符(CMD)或PowerShell
2. 进入项目目录：
   ```
   cd records-master
   ```
3. 双击运行 `build_windows.bat` 或在命令行执行：
   ```
   build_windows.bat
   ```

### 方法二：手动打包

1. 安装依赖：
   ```
   pip install -r requirements.txt
   ```

2. 执行打包命令：
   ```
   pyinstaller --clean records.spec
   ```

## 输出结果

打包完成后，可执行文件位于：
```
dist/绩效评价系统.exe
```

## 分发说明

将 `dist/绩效评价系统.exe` 文件复制到目标电脑即可运行，无需安装Python环境。

## 注意事项

1. 首次运行可能需要几秒钟启动时间
2. 数据库文件会自动创建在程序同目录下
3. 如需自定义图标，请替换 `records.spec` 文件中的 `icon=None` 为图标文件路径

## 默认登录账号

- 用户名：admin
- 密码：admin123

## 故障排除

### 打包失败
- 确保已安装所有依赖：`pip install -r requirements.txt`
- 尝试清理缓存：`pyinstaller --clean records.spec`

### 运行失败
- 检查是否被杀毒软件拦截
- 右键以管理员身份运行
