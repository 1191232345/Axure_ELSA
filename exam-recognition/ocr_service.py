from aip import AipOcr
import base64
from PIL import Image
import io
import os

class OCRService:
    def __init__(self, app_id, api_key, secret_key):
        if not app_id or not api_key or not secret_key:
            raise ValueError("OCR API credentials are required")
        self.client = AipOcr(app_id, api_key, secret_key)
    
    def preprocess_image(self, image_path):
        try:
            img = Image.open(image_path)
            max_size = 2000
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            output = io.BytesIO()
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            img.save(output, format='JPEG', quality=85)
            output.seek(0)
            
            return output.getvalue()
        except Exception as e:
            raise Exception(f"Image preprocessing failed: {str(e)}")
    
    def recognize_image(self, image_path):
        try:
            image_data = self.preprocess_image(image_path)
            
            options = {
                'language_type': 'CHN_ENG',
                'detect_direction': 'true',
                'detect_language': 'true',
                'probability': 'true'
            }
            
            result = self.client.basicGeneral(image_data, options)
            
            if 'error_code' in result:
                raise Exception(f"OCR API error: {result.get('error_msg', 'Unknown error')}")
            
            words_result = result.get('words_result', [])
            text_lines = [item['words'] for item in words_result]
            
            return {
                'success': True,
                'text': '\n'.join(text_lines),
                'words_count': result.get('words_result_num', 0),
                'raw_result': result
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': ''
            }
    
    def recognize_multiple_images(self, image_paths):
        results = []
        all_text = []
        
        for image_path in image_paths:
            result = self.recognize_image(image_path)
            results.append(result)
            if result['success']:
                all_text.append(result['text'])
        
        return {
            'success': all(result['success'] for result in results),
            'text': '\n\n'.join(all_text),
            'individual_results': results
        }
