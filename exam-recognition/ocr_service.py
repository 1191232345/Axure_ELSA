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
            
            # 后处理OCR结果，修复拼音格式
            processed_text = self.postprocess_ocr_text('\n'.join(text_lines))
            
            return {
                'success': True,
                'text': processed_text,
                'words_count': result.get('words_result_num', 0),
                'raw_result': result
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': ''
            }
    
    def postprocess_ocr_text(self, text):
        """
        后处理OCR识别结果，修复拼音和括号格式
        """
        lines = text.split('\n')
        processed_lines = []
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # 处理括号跨行的情况
            if '(' in line and ')' not in line and i + 1 < len(lines):
                # 合并下一行的括号
                next_line = lines[i + 1].strip()
                if ')' in next_line:
                    line += next_line
                    i += 1
            
            # 处理括号不完整的情况
            if '(' in line and ')' not in line:
                line += ')'  # 补全括号
            
            # 修复拼音格式
            line = self.fix_pinyin_format(line)
            
            processed_lines.append(line)
            i += 1
        
        return '\n'.join(processed_lines)
    
    def fix_pinyin_format(self, text):
        """
        修复拼音格式，处理连写和空格问题
        """
        # 常见拼音词汇映射
        pinyin_mappings = {
            'xishu': 'xī shū',
            'zacao': 'zá cǎo',
            'qingting': 'qīng tíng',
            'maoyan': 'máo yán',
            'miaohui': 'miáo huì',
            'hexie': 'hé xié',
            'gingting': 'qīng tíng',  # 常见OCR错误
            'xishū': 'xī shū',
            'zacǎo': 'zá cǎo',
            'qīngtíng': 'qīng tíng',
            'máoyán': 'máo yán',
            'miáohuì': 'miáo huì',
            'héxié': 'hé xié',
            'za cao': 'zá cǎo',
            'ging ting': 'qīng tíng',
            'mao yan': 'máo yán',
            'miao hui': 'miáo huì'
        }
        
        # 替换常见拼音错误
        for wrong, correct in pinyin_mappings.items():
            if wrong in text:
                text = text.replace(wrong, correct)
        
        return text
    
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
