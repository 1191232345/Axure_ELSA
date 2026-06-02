import requests
import json
import time

BASE_URL = 'http://127.0.0.1:5002'

def test_api_connection():
    try:
        response = requests.get(f'{BASE_URL}/api/intents/categories', timeout=5)
        print(f'✅ API 连接成功: {response.status_code}')
        return True
    except Exception as e:
        print(f'❌ API 连接失败: {e}')
        return False

def test_create_category():
    try:
        data = {
            'name': '测试意图类别',
            'description': '这是一个测试意图类别',
            'confidence_threshold': 0.7,
            'priority': 1,
            'is_active': True
        }
        
        response = requests.post(
            f'{BASE_URL}/api/intents/categories',
            json=data,
            timeout=10
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f'✅ 创建意图类别成功: ID={result["id"]}')
            return result['id']
        else:
            print(f'❌ 创建意图类别失败: {response.json()}')
            return None
    except Exception as e:
        print(f'❌ 创建意图类别异常: {e}')
        return None

def test_create_sample(category_id):
    try:
        data = {
            'sample_text': '这是一个测试样本文本'
        }
        
        response = requests.post(
            f'{BASE_URL}/api/intents/categories/{category_id}/samples',
            json=data,
            timeout=10
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f'✅ 创建意图样本成功: ID={result["id"]}')
            return result['id']
        else:
            print(f'❌ 创建意图样本失败: {response.json()}')
            return None
    except Exception as e:
        print(f'❌ 创建意图样本异常: {e}')
        return None

def test_intent_recognition():
    try:
        data = {
            'text': '这是一个测试文本',
            'top_k': 5,
            'min_confidence': 0.0
        }
        
        start_time = time.time()
        response = requests.post(
            f'{BASE_URL}/api/intents/recognize',
            json=data,
            timeout=10
        )
        processing_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f'✅ 意图识别成功')
            print(f'  处理时间: {result["processing_time"]:.2f}秒')
            print(f'  API响应时间: {processing_time:.2f}秒')
            print(f'  匹配意图数: {len(result["recognized_intents"])}')
            
            if result['recognized_intents']:
                top_intent = result['recognized_intents'][0]
                print(f'  最高置信度意图: {top_intent["category_name"]} ({top_intent["confidence"]:.2f})')
            
            return True
        else:
            print(f'❌ 意图识别失败: {response.json()}')
            return False
    except Exception as e:
        print(f'❌ 意图识别异常: {e}')
        return False

def test_get_config():
    try:
        response = requests.get(f'{BASE_URL}/api/intents/config', timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f'✅ 获取配置成功')
            print(f'  全局置信度阈值: {result.get("global_confidence_threshold", "N/A")}')
            print(f'  最大返回意图数: {result.get("max_intent_results", "N/A")}')
            return True
        else:
            print(f'❌ 获取配置失败: {response.json()}')
            return False
    except Exception as e:
        print(f'❌ 获取配置异常: {e}')
        return False

def test_system_status():
    try:
        response = requests.post(
            f'{BASE_URL}/api/intents/test',
            json={'text': '系统状态测试'},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f'✅ 系统状态检查成功')
            print(f'  Embedding服务: {result["embedding_available"]}')
            print(f'  缓存大小: {result["cache_size"]}')
            return True
        else:
            print(f'❌ 系统状态检查失败: {response.json()}')
            return False
    except Exception as e:
        print(f'❌ 系统状态检查异常: {e}')
        return False

def cleanup_test_data(category_id):
    try:
        response = requests.delete(
            f'{BASE_URL}/api/intents/categories/{category_id}',
            timeout=5
        )
        
        if response.status_code == 200:
            print(f'✅ 清理测试数据成功')
            return True
        else:
            print(f'❌ 清理测试数据失败: {response.json()}')
            return False
    except Exception as e:
        print(f'❌ 清理测试数据异常: {e}')
        return False

def run_tests():
    print('\n' + '='*50)
    print('开始意图识别功能测试')
    print('='*50 + '\n')
    
    if not test_api_connection():
        print('\n❌ 基础API连接失败，停止测试')
        return
    
    print('\n--- 测试意图类别管理 ---')
    category_id = test_create_category()
    
    if category_id:
        print('\n--- 测试意图样本管理 ---')
        test_create_sample(category_id)
    
    print('\n--- 测试意图识别功能 ---')
    test_intent_recognition()
    
    print('\n--- 测试配置管理 ---')
    test_get_config()
    
    print('\n--- 测试系统状态 ---')
    test_system_status()
    
    if category_id:
        print('\n--- 清理测试数据 ---')
        cleanup_test_data(category_id)
    
    print('\n' + '='*50)
    print('测试完成')
    print('='*50 + '\n')

if __name__ == '__main__':
    run_tests()