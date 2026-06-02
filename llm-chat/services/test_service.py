import requests
from openai import OpenAI
from config import SUPPORTED_MODELS

def test_config_connection(provider, api_key, base_url, model_name):
    result = {
        'success': False,
        'message': '',
        'details': {}
    }
    
    try:
        provider_config = SUPPORTED_MODELS.get(provider)
        if not provider_config:
            result['message'] = f'未知的提供商: {provider}'
            return result
        
        if provider_config['type'] == 'local':
            result['details']['type'] = 'local'
            result['details']['requires_api_key'] = False
            
            test_url = base_url.rstrip('/') + '/models'
            try:
                response = requests.get(test_url, timeout=5)
                if response.status_code == 200:
                    result['success'] = True
                    result['message'] = '本地服务连接成功'
                    result['details']['connection'] = 'OK'
                    
                    try:
                        models_data = response.json()
                        if 'data' in models_data:
                            available_models = [m.get('id', m.get('name', '')) for m in models_data['data']]
                            result['details']['available_models'] = available_models
                            
                            if model_name in available_models or any(model_name in m for m in available_models):
                                result['details']['model_available'] = True
                                result['message'] = f'本地服务连接成功，模型 {model_name} 可用'
                            else:
                                result['details']['model_available'] = False
                                result['message'] = f'本地服务连接成功，但模型 {model_name} 未找到'
                        else:
                            result['details']['model_available'] = 'unknown'
                    except Exception as e:
                        result['details']['model_check_error'] = str(e)
                else:
                    result['message'] = f'本地服务响应异常: HTTP {response.status_code}'
                    result['details']['connection'] = 'FAILED'
            except requests.exceptions.ConnectionError:
                result['message'] = '无法连接到本地服务，请检查服务是否启动'
                result['details']['connection'] = 'FAILED'
            except requests.exceptions.Timeout:
                result['message'] = '连接超时，请检查本地服务状态'
                result['details']['connection'] = 'TIMEOUT'
        
        else:
            result['details']['type'] = 'cloud'
            result['details']['requires_api_key'] = True
            
            if not api_key or api_key.strip() == '':
                result['message'] = '云端服务需要 API Key'
                return result
            
            try:
                client = OpenAI(
                    api_key=api_key,
                    base_url=base_url if base_url else None
                )
                
                models_response = client.models.list()
                result['success'] = True
                result['message'] = 'API Key 验证成功'
                result['details']['connection'] = 'OK'
                
                available_models = [m.id for m in models_response.data]
                result['details']['available_models'] = available_models
                
                if model_name in available_models:
                    result['details']['model_available'] = True
                    result['message'] = f'API Key 验证成功，模型 {model_name} 可用'
                else:
                    result['details']['model_available'] = False
                    result['message'] = f'API Key 验证成功，但模型 {model_name} 未找到'
                
            except Exception as e:
                error_msg = str(e)
                result['message'] = f'API Key 验证失败: {error_msg}'
                result['details']['connection'] = 'FAILED'
                result['details']['error'] = error_msg
        
    except Exception as e:
        result['message'] = f'测试过程出错: {str(e)}'
        result['details']['error'] = str(e)
    
    return result

def test_simple_chat(provider, api_key, base_url, model_name, temperature=0.7, max_tokens=100):
    result = {
        'success': False,
        'message': '',
        'response': ''
    }
    
    try:
        client = OpenAI(
            api_key=api_key,
            base_url=base_url if base_url else None
        )
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[{'role': 'user', 'content': '你好，请回复"测试成功"'}],
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        result['success'] = True
        result['message'] = '对话测试成功'
        result['response'] = response.choices[0].message.content
        
    except Exception as e:
        result['message'] = f'对话测试失败: {str(e)}'
        result['details'] = {'error': str(e)}
    
    return result