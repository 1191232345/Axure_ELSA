from flask import Blueprint, request, jsonify
from models.intent import (
    get_all_intent_categories,
    get_intent_category_by_id,
    create_intent_category,
    update_intent_category,
    delete_intent_category,
    get_samples_by_category,
    create_intent_sample,
    update_intent_sample,
    delete_intent_sample,
    get_all_intent_configs,
    update_intent_config,
    get_recognition_logs
)
from services.intent_recognition_service import intent_recognition_service
from services.embedding_service import embedding_service

intent_bp = Blueprint('intent', __name__, url_prefix='/api/intents')

@intent_bp.route('/categories', methods=['GET'])
def list_categories():
    categories = get_all_intent_categories()
    return jsonify({'categories': categories})

@intent_bp.route('/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = get_intent_category_by_id(category_id)
    if not category:
        return jsonify({'error': '意图类别不存在'}), 404
    return jsonify(category)

@intent_bp.route('/categories', methods=['POST'])
def create_category():
    data = request.json
    
    if not data.get('name'):
        return jsonify({'error': '意图类别名称不能为空'}), 400
    
    try:
        category_id = create_intent_category(
            name=data['name'],
            description=data.get('description'),
            confidence_threshold=data.get('confidence_threshold', 0.7),
            priority=data.get('priority', 0),
            is_active=data.get('is_active', True)
        )
        return jsonify({'id': category_id, 'message': '意图类别创建成功'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    data = request.json
    
    if not data.get('name'):
        return jsonify({'error': '意图类别名称不能为空'}), 400
    
    try:
        update_intent_category(
            category_id=category_id,
            name=data['name'],
            description=data.get('description'),
            confidence_threshold=data.get('confidence_threshold', 0.7),
            priority=data.get('priority', 0),
            is_active=data.get('is_active', True)
        )
        intent_recognition_service.refresh_cache()
        return jsonify({'message': '意图类别更新成功'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        delete_intent_category(category_id)
        intent_recognition_service.refresh_cache()
        return jsonify({'message': '意图类别删除成功'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/categories/<int:category_id>/samples', methods=['GET'])
def list_samples(category_id):
    samples = get_samples_by_category(category_id)
    return jsonify({'samples': samples})

@intent_bp.route('/categories/<int:category_id>/samples', methods=['POST'])
def create_sample(category_id):
    data = request.json
    
    if not data.get('sample_text'):
        return jsonify({'error': '样本文本不能为空'}), 400
    
    sample_text = data['sample_text']
    if len(sample_text) > 500:
        return jsonify({'error': '样本文本长度不能超过500字符'}), 400
    
    try:
        embedding_vector = None
        if embedding_service.is_available():
            embedding_vector = embedding_service.get_embedding(sample_text)
        
        sample_id = create_intent_sample(
            category_id=category_id,
            sample_text=sample_text,
            embedding_vector=embedding_vector
        )
        
        intent_recognition_service.refresh_cache()
        
        return jsonify({'id': sample_id, 'message': '意图样本创建成功'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/samples/<int:sample_id>', methods=['PUT'])
def update_sample(sample_id):
    data = request.json
    
    if not data.get('sample_text'):
        return jsonify({'error': '样本文本不能为空'}), 400
    
    sample_text = data['sample_text']
    if len(sample_text) > 500:
        return jsonify({'error': '样本文本长度不能超过500字符'}), 400
    
    try:
        embedding_vector = None
        if embedding_service.is_available():
            embedding_vector = embedding_service.get_embedding(sample_text)
        
        update_intent_sample(
            sample_id=sample_id,
            sample_text=sample_text,
            embedding_vector=embedding_vector
        )
        
        intent_recognition_service.refresh_cache()
        
        return jsonify({'message': '意图样本更新成功'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/samples/<int:sample_id>', methods=['DELETE'])
def delete_sample(sample_id):
    try:
        delete_intent_sample(sample_id)
        intent_recognition_service.refresh_cache()
        return jsonify({'message': '意图样本删除成功'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/samples/batch', methods=['POST'])
def batch_create_samples():
    data = request.json
    
    category_id = data.get('category_id')
    samples = data.get('samples', [])
    
    if not category_id:
        return jsonify({'error': '意图类别ID不能为空'}), 400
    
    if not samples:
        return jsonify({'error': '样本列表不能为空'}), 400
    
    created_ids = []
    errors = []
    
    for sample_text in samples:
        if len(sample_text) > 500:
            errors.append(f'样本文本过长: {sample_text[:50]}...')
            continue
        
        try:
            embedding_vector = None
            if embedding_service.is_available():
                embedding_vector = embedding_service.get_embedding(sample_text)
            
            sample_id = create_intent_sample(
                category_id=category_id,
                sample_text=sample_text,
                embedding_vector=embedding_vector
            )
            created_ids.append(sample_id)
        except Exception as e:
            errors.append(str(e))
    
    intent_recognition_service.refresh_cache()
    
    return jsonify({
        'created_count': len(created_ids),
        'created_ids': created_ids,
        'errors': errors,
        'message': f'成功创建 {len(created_ids)} 个样本'
    }), 201

@intent_bp.route('/recognize', methods=['POST'])
def recognize_intent():
    data = request.json
    
    text = data.get('text')
    if not text:
        return jsonify({'error': '输入文本不能为空'}), 400
    
    top_k = data.get('top_k', 5)
    min_confidence = data.get('min_confidence', 0.0)
    
    try:
        result = intent_recognition_service.recognize_intent(
            query_text=text,
            top_k=top_k,
            min_confidence=min_confidence
        )
        
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/recognize/batch', methods=['POST'])
def recognize_intent_batch():
    data = request.json
    
    texts = data.get('texts', [])
    if not texts:
        return jsonify({'error': '文本列表不能为空'}), 400
    
    top_k = data.get('top_k', 5)
    min_confidence = data.get('min_confidence', 0.0)
    
    try:
        results = intent_recognition_service.recognize_intent_batch(
            query_texts=texts,
            top_k=top_k,
            min_confidence=min_confidence
        )
        
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/config', methods=['GET'])
def get_config():
    configs = get_all_intent_configs()
    return jsonify(configs)

@intent_bp.route('/config', methods=['PUT'])
def update_config():
    data = request.json
    
    updated_keys = []
    errors = []
    
    for key, value in data.items():
        try:
            update_intent_config(key, value)
            updated_keys.append(key)
        except Exception as e:
            errors.append(f'{key}: {str(e)}')
    
    return jsonify({
        'updated_keys': updated_keys,
        'errors': errors,
        'message': f'成功更新 {len(updated_keys)} 个配置项'
    })

@intent_bp.route('/test', methods=['POST'])
def test_intent_recognition():
    data = request.json
    
    text = data.get('text', '这是一个测试文本')
    
    try:
        result = intent_recognition_service.recognize_intent(text)
        
        return jsonify({
            'test_text': text,
            'result': result,
            'embedding_available': embedding_service.is_available(),
            'cache_size': embedding_service.get_cache_size()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@intent_bp.route('/logs', methods=['GET'])
def get_logs():
    limit = request.args.get('limit', 100, type=int)
    logs = get_recognition_logs(limit)
    return jsonify({'logs': logs})

@intent_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    embedding_service.clear_cache()
    intent_recognition_service.refresh_cache()
    return jsonify({'message': '缓存已清除'})

@intent_bp.route('/cache/refresh', methods=['POST'])
def refresh_cache():
    intent_recognition_service.refresh_cache()
    return jsonify({'message': '意图识别缓存已刷新'})