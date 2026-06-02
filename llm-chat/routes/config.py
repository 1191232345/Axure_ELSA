from flask import Blueprint, request, jsonify, Response
from models.config import *
from models.chat import *
from config import SUPPORTED_MODELS, DEFAULT_LOCAL_CONFIGS
from services.test_service import test_config_connection, test_simple_chat
import json
import requests
from openai import OpenAI

config_bp = Blueprint('config', __name__, url_prefix='/api/configs')

@config_bp.route('/providers', methods=['GET'])
def get_providers():
    return jsonify(SUPPORTED_MODELS)

@config_bp.route('/default-local', methods=['GET'])
def get_default_local_configs():
    return jsonify(DEFAULT_LOCAL_CONFIGS)

@config_bp.route('/quick-setup/<provider>', methods=['POST'])
def quick_setup_local(provider):
    if provider not in DEFAULT_LOCAL_CONFIGS:
        return jsonify({'error': f'不支持的快速配置: {provider}'}), 400
    
    default_config = DEFAULT_LOCAL_CONFIGS[provider]
    
    existing_configs = get_all_configs()
    for config in existing_configs:
        if config['provider'] == provider and config['base_url'] == default_config['base_url']:
            return jsonify({'error': '该配置已存在', 'config_id': config['id']}), 400
    
    config_id = create_config(
        provider=default_config['provider'],
        api_key=default_config['api_key'],
        base_url=default_config['base_url'],
        model_name=default_config['model_name'],
        temperature=default_config['temperature'],
        max_tokens=default_config['max_tokens'],
        is_default=False
    )
    
    return jsonify({'id': config_id, 'message': '快速配置创建成功', 'config': default_config}), 201

@config_bp.route('/', methods=['GET'])
def list_configs():
    configs = get_all_configs()
    for config in configs:
        config['api_key'] = config['api_key'][:8] + '***' if config['api_key'] else ''
    return jsonify(configs)

@config_bp.route('/<int:config_id>', methods=['GET'])
def get_config(config_id):
    config = get_config_by_id(config_id)
    if not config:
        return jsonify({'error': '配置不存在'}), 404
    config['api_key'] = config['api_key'][:8] + '***' if config['api_key'] else ''
    return jsonify(config)

@config_bp.route('/default', methods=['GET'])
def get_default():
    config = get_default_config()
    if not config:
        return jsonify({'error': '没有默认配置'}), 404
    config['api_key'] = config['api_key'][:8] + '***' if config['api_key'] else ''
    return jsonify(config)

@config_bp.route('/', methods=['POST'])
def create_config_route():
    data = request.json
    config_id = create_config(
        provider=data['provider'],
        api_key=data['api_key'],
        base_url=data.get('base_url'),
        model_name=data['model_name'],
        temperature=data.get('temperature', 0.7),
        max_tokens=data.get('max_tokens', 2000),
        is_default=data.get('is_default', False)
    )
    return jsonify({'id': config_id, 'message': '配置创建成功'}), 201

@config_bp.route('/<int:config_id>', methods=['PUT'])
def update_config_route(config_id):
    data = request.json
    update_config(
        config_id=config_id,
        provider=data['provider'],
        api_key=data['api_key'],
        base_url=data.get('base_url'),
        model_name=data['model_name'],
        temperature=data.get('temperature', 0.7),
        max_tokens=data.get('max_tokens', 2000),
        is_default=data.get('is_default', False)
    )
    return jsonify({'message': '配置更新成功'})

@config_bp.route('/<int:config_id>', methods=['DELETE'])
def delete_config_route(config_id):
    delete_config(config_id)
    return jsonify({'message': '配置删除成功'})

@config_bp.route('/test', methods=['POST'])
def test_config():
    data = request.json
    provider = data.get('provider')
    api_key = data.get('api_key')
    base_url = data.get('base_url')
    model_name = data.get('model_name')
    
    if not provider or not model_name:
        return jsonify({'error': '缺少必要参数'}), 400
    
    result = test_config_connection(provider, api_key, base_url, model_name)
    return jsonify(result)

@config_bp.route('/<int:config_id>/test', methods=['POST'])
def test_config_by_id(config_id):
    config = get_config_by_id(config_id)
    if not config:
        return jsonify({'error': '配置不存在'}), 404
    
    result = test_config_connection(
        config['provider'],
        config['api_key'],
        config['base_url'],
        config['model_name']
    )
    return jsonify(result)

@config_bp.route('/test-chat', methods=['POST'])
def test_chat():
    data = request.json
    provider = data.get('provider')
    api_key = data.get('api_key')
    base_url = data.get('base_url')
    model_name = data.get('model_name')
    temperature = data.get('temperature', 0.7)
    max_tokens = data.get('max_tokens', 100)
    
    if not provider or not model_name:
        return jsonify({'error': '缺少必要参数'}), 400
    
    result = test_simple_chat(provider, api_key, base_url, model_name, temperature, max_tokens)
    return jsonify(result)

@config_bp.route('/<int:config_id>/test-chat', methods=['POST'])
def test_chat_by_id(config_id):
    config = get_config_by_id(config_id)
    if not config:
        return jsonify({'error': '配置不存在'}), 404
    
    result = test_simple_chat(
        config['provider'],
        config['api_key'],
        config['base_url'],
        config['model_name'],
        config['temperature'],
        config['max_tokens']
    )
    return jsonify(result)