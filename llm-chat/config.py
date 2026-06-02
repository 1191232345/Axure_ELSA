import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'data', 'llm_chat.db')

SUPPORTED_MODELS = {
    'ollama': {
        'name': 'Ollama (本地)',
        'type': 'local',
        'base_url': 'http://localhost:11434/v1',
        'models': ['llama2', 'llama3', 'mistral', 'codellama', 'qwen2', 'deepseek-coder'],
        'default_model': 'llama3',
        'requires_api_key': False,
        'description': '本地运行的开源大模型，无需 API Key'
    },
    'localai': {
        'name': 'LocalAI (本地)',
        'type': 'local',
        'base_url': 'http://localhost:8080/v1',
        'models': ['gpt-3.5-turbo', 'llama', 'mistral', 'codellama'],
        'default_model': 'gpt-3.5-turbo',
        'requires_api_key': False,
        'description': '本地 AI 服务，兼容 OpenAI API'
    },
    'deepseek': {
        'name': 'DeepSeek (云端)',
        'type': 'cloud',
        'base_url': 'https://api.deepseek.com',
        'models': ['deepseek-chat', 'deepseek-coder'],
        'default_model': 'deepseek-chat',
        'requires_api_key': True,
        'description': 'DeepSeek 云端 API，需要 API Key'
    },
    'openai': {
        'name': 'OpenAI (云端)',
        'type': 'cloud',
        'base_url': 'https://api.openai.com/v1',
        'models': ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
        'default_model': 'gpt-3.5-turbo',
        'requires_api_key': True,
        'description': 'OpenAI 官方 API，需要 API Key'
    },
    'anthropic': {
        'name': 'Anthropic (云端)',
        'type': 'cloud',
        'base_url': 'https://api.anthropic.com/v1',
        'models': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        'default_model': 'claude-3-sonnet',
        'requires_api_key': True,
        'description': 'Anthropic Claude API，需要 API Key'
    },
    'zhipu': {
        'name': '智谱AI (云端)',
        'type': 'cloud',
        'base_url': 'https://open.bigmodel.cn/api/paas/v4',
        'models': ['glm-4', 'glm-4-flash', 'glm-3-turbo'],
        'default_model': 'glm-4-flash',
        'requires_api_key': True,
        'description': '智谱 AI 云端 API，需要 API Key'
    }
}

DEFAULT_LOCAL_CONFIGS = {
    'ollama': {
        'name': 'Ollama 快速配置',
        'provider': 'ollama',
        'base_url': 'http://localhost:11434/v1',
        'api_key': 'ollama',
        'model_name': 'llama3',
        'temperature': 0.7,
        'max_tokens': 2000
    },
    'localai': {
        'name': 'LocalAI 快速配置',
        'provider': 'localai',
        'base_url': 'http://localhost:8080/v1',
        'api_key': 'localai',
        'model_name': 'gpt-3.5-turbo',
        'temperature': 0.7,
        'max_tokens': 2000
    }
}