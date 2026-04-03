# Technical Design: 试卷图片识别复刻系统

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (HTML5/CSS3/JS)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  图片上传模块  │  │  结果编辑模块  │  │  文档下载模块  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                    后端 (Python Flask)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  路由控制器   │  │  业务逻辑层   │  │  数据处理层   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓ API调用
┌─────────────────────────────────────────────────────────┐
│                    外部服务                              │
│  ┌──────────────┐                                       │
│  │  百度OCR API  │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

**前端:**
- HTML5: 页面结构
- CSS3: 样式设计
- JavaScript (ES6+): 交互逻辑
- Fetch API: HTTP请求
- FileReader API: 文件读取
- Drag & Drop API: 拖拽上传

**后端:**
- Python 3.8+: 编程语言
- Flask 2.0+: Web框架
- python-docx: Word文档生成
- baidu-aip: 百度OCR SDK
- Pillow: 图片处理

**外部服务:**
- 百度OCR通用文字识别API

## 2. 模块设计

### 2.1 后端模块

#### 2.1.1 应用入口 (exam_recognition_app.py)

```python
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# 配置
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
```

#### 2.1.2 OCR识别模块 (ocr_service.py)

```python
from aip import AipOcr
import base64

class OCRService:
    def __init__(self, app_id, api_key, secret_key):
        self.client = AipOcr(app_id, api_key, secret_key)
    
    def recognize_image(self, image_path):
        """识别图片中的文字"""
        with open(image_path, 'rb') as f:
            image = f.read()
        
        # 调用通用文字识别API
        result = self.client.basicGeneral(image)
        
        # 提取文字内容
        words_result = result.get('words_result', [])
        text = '\n'.join([item['words'] for item in words_result])
        
        return text
```

#### 2.1.3 试题解析模块 (question_parser.py)

```python
import re

class QuestionParser:
    def parse(self, text):
        """解析试题结构"""
        questions = []
        lines = text.split('\n')
        
        current_section = None
        current_question = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 识别大题标题 (如: 一、选择题)
            if re.match(r'^[一二三四五六七八九十]+、', line):
                current_section = {
                    'type': 'section',
                    'title': line,
                    'questions': []
                }
                questions.append(current_section)
            
            # 识别小题题号 (如: 1. 或 1、)
            elif re.match(r'^\d+[.、]', line):
                current_question = {
                    'type': 'question',
                    'number': re.match(r'^\d+', line).group(),
                    'content': line,
                    'options': []
                }
                if current_section:
                    current_section['questions'].append(current_question)
            
            # 识别选项 (如: A. 或 A、)
            elif re.match(r'^[A-D][.、]', line):
                if current_question:
                    current_question['options'].append(line)
        
        return questions
```

#### 2.1.4 Word生成模块 (word_generator.py)

```python
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

class WordGenerator:
    def __init__(self):
        self.doc = Document()
    
    def add_section(self, title):
        """添加大题标题"""
        heading = self.doc.add_heading(title, level=1)
        heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    def add_question(self, number, content, options=None):
        """添加题目"""
        # 添加题号和内容
        paragraph = self.doc.add_paragraph()
        run = paragraph.add_run(f"{number}. {content}")
        run.font.size = Pt(12)
        
        # 添加选项
        if options:
            for option in options:
                paragraph = self.doc.add_paragraph()
                run = paragraph.add_run(option)
                run.font.size = Pt(11)
                paragraph.paragraph_format.left_indent = Inches(0.5)
    
    def save(self, filename):
        """保存文档"""
        self.doc.save(filename)
```

### 2.2 前端模块

#### 2.2.1 页面结构 (index.html)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>试卷图片识别复刻系统</title>
    <link rel="stylesheet" href="static/css/style.css">
</head>
<body>
    <div class="container">
        <!-- 上传区域 -->
        <div class="upload-section">
            <div class="upload-area" id="uploadArea">
                <p>拖拽图片到此处或点击上传</p>
                <input type="file" id="fileInput" multiple accept="image/*">
            </div>
            <div class="preview-area" id="previewArea"></div>
        </div>
        
        <!-- 识别结果区域 -->
        <div class="result-section">
            <div class="editor-area" id="editorArea">
                <textarea id="resultEditor"></textarea>
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-section">
            <button id="recognizeBtn">开始识别</button>
            <button id="downloadBtn" disabled>下载Word文档</button>
        </div>
    </div>
    
    <script src="static/js/main.js"></script>
</body>
</html>
```

#### 2.2.2 样式设计 (style.css)

```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.upload-area {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}

.upload-area:hover {
    border-color: #4CAF50;
    background-color: #f9f9f9;
}

.upload-area.dragover {
    border-color: #4CAF50;
    background-color: #e8f5e9;
}

.preview-area {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

.preview-item {
    width: 150px;
    height: 150px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.result-section {
    margin-top: 30px;
}

#resultEditor {
    width: 100%;
    min-height: 400px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.6;
}

.action-section {
    margin-top: 20px;
    text-align: center;
}

button {
    padding: 12px 30px;
    margin: 0 10px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
}

#recognizeBtn {
    background-color: #4CAF50;
    color: white;
}

#recognizeBtn:hover {
    background-color: #45a049;
}

#downloadBtn {
    background-color: #2196F3;
    color: white;
}

#downloadBtn:hover {
    background-color: #0b7dda;
}

#downloadBtn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
```

#### 2.2.3 交互逻辑 (main.js)

```javascript
class ExamRecognitionApp {
    constructor() {
        this.files = [];
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewArea = document.getElementById('previewArea');
        this.resultEditor = document.getElementById('resultEditor');
        this.recognizeBtn = document.getElementById('recognizeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
    }
    
    bindEvents() {
        // 点击上传
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // 文件选择
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        // 拖拽上传
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
        
        // 识别按钮
        this.recognizeBtn.addEventListener('click', () => {
            this.recognizeImages();
        });
        
        // 下载按钮
        this.downloadBtn.addEventListener('click', () => {
            this.downloadDocument();
        });
    }
    
    handleFiles(files) {
        this.files = Array.from(files);
        this.previewArea.innerHTML = '';
        
        this.files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `<img src="${e.target.result}" alt="预览">`;
                    this.previewArea.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    async recognizeImages() {
        if (this.files.length === 0) {
            alert('请先上传图片');
            return;
        }
        
        this.recognizeBtn.disabled = true;
        this.recognizeBtn.textContent = '识别中...';
        
        const formData = new FormData();
        this.files.forEach(file => {
            formData.append('images', file);
        });
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.resultEditor.value = result.text;
                this.downloadBtn.disabled = false;
            } else {
                alert('识别失败: ' + result.error);
            }
        } catch (error) {
            alert('请求失败: ' + error.message);
        } finally {
            this.recognizeBtn.disabled = false;
            this.recognizeBtn.textContent = '开始识别';
        }
    }
    
    async downloadDocument() {
        const text = this.resultEditor.value;
        
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '试卷.docx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('下载失败: ' + error.message);
        }
    }
}

// 初始化应用
const app = new ExamRecognitionApp();
```

## 3. API设计

### 3.1 图片上传API

**接口:** `POST /api/upload`

**请求:**
- Content-Type: `multipart/form-data`
- 参数: `images` (文件数组)

**响应:**
```json
{
    "success": true,
    "text": "识别出的文字内容",
    "questions": [
        {
            "type": "section",
            "title": "一、选择题",
            "questions": [...]
        }
    ]
}
```

### 3.2 文档下载API

**接口:** `POST /api/download`

**请求:**
- Content-Type: `application/json`
- 参数:
```json
{
    "text": "识别结果文本",
    "questions": [...]
}
```

**响应:**
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- 文件流

## 4. 数据流程

```
1. 用户上传图片
   ↓
2. 前端验证图片格式和大小
   ↓
3. 发送到后端/api/upload接口
   ↓
4. 后端保存图片到uploads目录
   ↓
5. 调用OCR服务识别图片
   ↓
6. 解析试题结构
   ↓
7. 返回识别结果给前端
   ↓
8. 用户编辑识别结果
   ↓
9. 点击下载按钮
   ↓
10. 发送编辑后的内容到/api/download接口
   ↓
11. 后端生成Word文档
   ↓
12. 返回文档文件流
   ↓
13. 前端触发下载
```

## 5. 安全考虑

1. **文件上传安全:**
   - 限制文件类型(仅允许jpg/png/jpeg)
   - 限制文件大小(最大10MB)
   - 使用secure_filename处理文件名
   - 定期清理uploads目录

2. **API安全:**
   - 添加请求频率限制
   - 验证请求参数
   - 错误信息不暴露敏感信息

3. **OCR密钥安全:**
   - 使用环境变量存储API密钥
   - 不在代码中硬编码密钥

## 6. 性能优化

1. **图片处理优化:**
   - 压缩大图片
   - 异步处理OCR请求
   - 实现请求队列

2. **缓存策略:**
   - 缓存OCR识别结果
   - 使用图片hash作为缓存key

3. **前端优化:**
   - 图片预览使用缩略图
   - 实现懒加载
   - 压缩静态资源

## 7. 部署方案

### 7.1 开发环境

```bash
# 安装依赖
pip install -r requirements.txt

# 配置环境变量
export BAIDU_OCR_APP_ID="your_app_id"
export BAIDU_OCR_API_KEY="your_api_key"
export BAIDU_OCR_SECRET_KEY="your_secret_key"

# 启动应用
python exam_recognition_app.py
```

### 7.2 生产环境

使用Gunicorn + Nginx部署:

```bash
# 安装Gunicorn
pip install gunicorn

# 启动Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 exam_recognition_app:app
```

Nginx配置:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static {
        alias /path/to/your/app/static;
    }
}
```

## 8. 测试计划

### 8.1 单元测试

- OCR识别模块测试
- 试题解析模块测试
- Word生成模块测试

### 8.2 集成测试

- API接口测试
- 文件上传测试
- 文档下载测试

### 8.3 性能测试

- 并发请求测试
- 大文件上传测试
- OCR识别速度测试

## 9. 扩展性考虑

1. **支持更多OCR服务:**
   - 设计OCR服务接口
   - 支持腾讯OCR、阿里OCR等

2. **支持更多题型:**
   - 数学公式识别
   - 图表识别
   - 表格识别

3. **批量处理:**
   - 支持批量上传
   - 支持PDF文件

4. **试题库管理:**
   - 数据库存储
   - 试题分类管理
