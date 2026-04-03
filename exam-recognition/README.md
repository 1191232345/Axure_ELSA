# 试卷图片识别复刻系统

基于 Flask + 百度OCR 的试卷图片识别系统，自动识别试卷图片中的试题内容并生成可编辑的Word文档。

## 功能特性

- 📷 **图片上传**: 支持拖拽上传或点击上传多张试卷图片
- 🔍 **OCR识别**: 使用百度OCR API准确识别印刷体和手写体文字
- 📝 **智能解析**: 自动识别题号、题型、选项等试题结构
- 📄 **Word生成**: 生成格式规范的Word文档，保持原试卷排版
- ✏️ **在线编辑**: 提供在线编辑功能，可修改识别结果
- 🎨 **现代界面**: 简洁美观的用户界面，响应式设计

## 技术栈

**后端:**
- Python 3.8+
- Flask 2.0+
- python-docx (Word文档生成)
- baidu-aip (百度OCR SDK)
- Pillow (图片处理)

**前端:**
- HTML5 + CSS3 + JavaScript (ES6+)
- 响应式设计
- 拖拽上传
- 异步请求

## 快速开始

### 1. 克隆项目

```bash
cd exam-recognition
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置百度OCR API

#### 3.1 注册百度智能云账号

1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 注册并登录账号

#### 3.2 创建OCR应用

1. 进入 [文字识别控制台](https://console.bce.baidu.com/ai/#/ai/ocr/overview/index)
2. 创建应用，选择"通用文字识别"
3. 获取 `APP_ID`、`API_KEY`、`SECRET_KEY`

#### 3.3 配置环境变量

**macOS/Linux:**
```bash
export BAIDU_OCR_APP_ID="your_app_id"
export BAIDU_OCR_API_KEY="your_api_key"
export BAIDU_OCR_SECRET_KEY="your_secret_key"
```

**Windows:**
```cmd
set BAIDU_OCR_APP_ID=your_app_id
set BAIDU_OCR_API_KEY=your_api_key
set BAIDU_OCR_SECRET_KEY=your_secret_key
```

### 4. 运行应用

```bash
python app.py
```

访问 http://127.0.0.1:5000 即可使用。

## 使用说明

### 1. 上传图片

- 点击上传区域选择图片文件
- 或直接拖拽图片到上传区域
- 支持多张图片同时上传
- 支持格式: JPG、PNG、JPEG
- 单张图片最大: 10MB

### 2. 开始识别

- 上传图片后，点击"开始识别"按钮
- 系统会自动调用OCR服务识别图片内容
- 识别结果会显示在编辑器中

### 3. 编辑结果

- 在编辑器中可以修改识别结果
- 可以调整题目格式、修正识别错误等

### 4. 下载文档

- 输入文档标题（可选）
- 点击"下载Word文档"按钮
- 系统会生成并下载Word文档

## 项目结构

```
exam-recognition/
├── app.py                  # Flask应用主文件
├── config.py               # 配置文件
├── ocr_service.py          # OCR识别服务
├── question_parser.py      # 试题解析模块
├── word_generator.py       # Word文档生成模块
├── requirements.txt        # Python依赖
├── README.md              # 使用说明
├── uploads/               # 临时上传目录
├── static/
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       └── main.js        # 前端交互逻辑
└── templates/
    └── index.html         # 主页面模板
```

## API文档

### 1. 健康检查

**GET** `/api/health`

检查服务状态和OCR初始化状态。

**响应示例:**
```json
{
    "success": true,
    "message": "服务运行正常",
    "ocr_initialized": true
}
```

### 2. 图片上传识别

**POST** `/api/upload`

上传图片并进行OCR识别。

**请求:**
- Content-Type: `multipart/form-data`
- 参数: `images` (文件数组)

**响应示例:**
```json
{
    "success": true,
    "text": "识别出的文字内容",
    "parsed_data": {
        "sections": [...]
    },
    "files_count": 1
}
```

### 3. 文档下载

**POST** `/api/download`

生成并下载Word文档。

**请求:**
- Content-Type: `application/json`
- 参数:
```json
{
    "text": "识别结果文本",
    "title": "试卷标题"
}
```

**响应:**
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- 文件流

## 注意事项

1. **OCR API配额**: 百度OCR有免费额度限制，请注意使用量
2. **图片质量**: 图片清晰度会影响识别准确率，建议使用高清图片
3. **手写识别**: 手写体识别准确率低于印刷体，建议手动校对
4. **复杂公式**: 暂不支持复杂数学公式识别
5. **数据安全**: 上传的图片会在识别后自动删除

## 常见问题

### Q1: OCR服务未初始化怎么办？

**A:** 请确保已正确设置环境变量：
```bash
export BAIDU_OCR_APP_ID="your_app_id"
export BAIDU_OCR_API_KEY="your_api_key"
export BAIDU_OCR_SECRET_KEY="your_secret_key"
```

### Q2: 识别准确率不高怎么办？

**A:** 
- 确保图片清晰、光线充足
- 避免图片倾斜或模糊
- 可以手动编辑修正识别结果

### Q3: 支持哪些题型？

**A:** 目前支持：
- 选择题
- 填空题
- 判断题
- 简答题
- 计算题

### Q4: 可以批量处理多张图片吗？

**A:** 可以。上传多张图片后，系统会按顺序识别并合并到一个Word文档中。

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交Issue。

## 更新日志

### v1.0.0 (2026-04-03)
- ✨ 初始版本发布
- ✨ 支持图片上传和OCR识别
- ✨ 支持试题结构解析
- ✨ 支持Word文档生成
- ✨ 支持在线编辑
