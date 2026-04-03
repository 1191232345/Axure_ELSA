from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from io import BytesIO
from datetime import datetime

from config import Config
from ocr_service import OCRService
from question_parser import QuestionParser
from word_generator import WordGenerator

app = Flask(__name__)
app.config.from_object(Config)
Config.init_app()
CORS(app)

ocr_service = None

def init_ocr_service():
    global ocr_service
    try:
        ocr_service = OCRService(
            app_id=Config.BAIDU_OCR_APP_ID,
            api_key=Config.BAIDU_OCR_API_KEY,
            secret_key=Config.BAIDU_OCR_SECRET_KEY
        )
        return True
    except ValueError as e:
        print(f"OCR Service initialization failed: {e}")
        print("Please set environment variables: BAIDU_OCR_APP_ID, BAIDU_OCR_API_KEY, BAIDU_OCR_SECRET_KEY")
        return False

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_images():
    if 'images' not in request.files:
        return jsonify({'success': False, 'error': '没有上传文件'})
    
    files = request.files.getlist('images')
    
    if not files or all(file.filename == '' for file in files):
        return jsonify({'success': False, 'error': '没有选择文件'})
    
    uploaded_files = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"{timestamp}_{filename}"
            filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
            file.save(filepath)
            uploaded_files.append(filepath)
    
    if not uploaded_files:
        return jsonify({'success': False, 'error': '没有有效的图片文件'})
    
    if not ocr_service:
        return jsonify({'success': False, 'error': 'OCR服务未初始化,请检查API配置'})
    
    try:
        result = ocr_service.recognize_multiple_images(uploaded_files)
        
        if result['success']:
            parser = QuestionParser()
            parsed_data = parser.parse(result['text'])
            
            return jsonify({
                'success': True,
                'text': result['text'],
                'parsed_data': parsed_data,
                'files_count': len(uploaded_files)
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'OCR识别失败')
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'处理失败: {str(e)}'
        })
    finally:
        for filepath in uploaded_files:
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception as e:
                print(f"Error removing file {filepath}: {e}")

@app.route('/api/download', methods=['POST'])
def download_document():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'success': False, 'error': '缺少文本内容'})
        
        text = data['text']
        title = data.get('title', '试卷')
        
        generator = WordGenerator()
        generator.generate_from_text(text, title)
        
        doc_bytes = generator.get_document_bytes()
        
        file_stream = BytesIO(doc_bytes)
        file_stream.seek(0)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{title}_{timestamp}.docx"
        
        return send_file(
            file_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'生成文档失败: {str(e)}'
        })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': '服务运行正常',
        'ocr_initialized': ocr_service is not None
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'error': '文件太大,最大支持10MB'
    }), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'error': '服务器内部错误'
    }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("试卷图片识别复刻系统")
    print("=" * 60)
    
    ocr_initialized = init_ocr_service()
    
    if not ocr_initialized:
        print("\n⚠️  警告: OCR服务未初始化")
        print("请设置以下环境变量:")
        print("  export BAIDU_OCR_APP_ID='your_app_id'")
        print("  export BAIDU_OCR_API_KEY='your_api_key'")
        print("  export BAIDU_OCR_SECRET_KEY='your_secret_key'")
        print("\n系统将以演示模式运行,OCR功能不可用\n")
    
    print("启动服务器...")
    print("访问地址: http://127.0.0.1:5000")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
