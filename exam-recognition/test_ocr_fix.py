#!/usr/bin/env python3
"""
测试OCR服务的拼音识别修复
"""

from ocr_service import OCRService
import os
from config import Config

# 初始化OCR服务
try:
    ocr_service = OCRService(
        app_id=Config.BAIDU_OCR_APP_ID,
        api_key=Config.BAIDU_OCR_API_KEY,
        secret_key=Config.BAIDU_OCR_SECRET_KEY
    )
    print("OCR服务初始化成功")
except Exception as e:
    print(f"OCR服务初始化失败: {e}")
    exit(1)

# 测试图片路径
image_path = "uploads/20260403_104451_e42cdbab544e150d6d34f58568524950.jpg"

if os.path.exists(image_path):
    print(f"测试图片: {image_path}")
    
    # 识别图片
    result = ocr_service.recognize_image(image_path)
    
    if result['success']:
        print("\n识别结果:")
        print("=" * 60)
        print(result['text'])
        print("=" * 60)
        print(f"识别到的单词数: {result['words_count']}")
        
        # 检查拼音识别
        print("\n拼音识别检查:")
        lines = result['text'].split('\n')
        for i, line in enumerate(lines):
            if any(char.isalpha() for char in line) and '(' in line:
                print(f"第{i+1}行可能包含拼音: {line}")
    else:
        print(f"识别失败: {result['error']}")
else:
    print(f"测试图片不存在: {image_path}")
