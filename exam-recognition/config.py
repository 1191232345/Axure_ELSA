import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    BAIDU_OCR_APP_ID = os.environ.get('BAIDU_OCR_APP_ID', '7598882')
    BAIDU_OCR_API_KEY = os.environ.get('BAIDU_OCR_API_KEY', 'A7inBpPRhNaDaOX1ubIe6mOx')
    BAIDU_OCR_SECRET_KEY = os.environ.get('BAIDU_OCR_SECRET_KEY', 'Z30rnAnp5kYGw550KvjHELo1fR0y37LK')
    
    @staticmethod
    def init_app():
        if not os.path.exists(Config.UPLOAD_FOLDER):
            os.makedirs(Config.UPLOAD_FOLDER)
