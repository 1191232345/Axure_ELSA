from flask import Blueprint, request, jsonify
from models import (
    get_all_rating_items,
    get_rating_item_by_id,
    add_rating_item,
    update_rating_item,
    delete_rating_item,
    batch_delete_rating_items,
)
from utils.response import success, error

rating_item_bp = Blueprint('rating_item', __name__)

@rating_item_bp.route('/api/rating-items')
def list_rating_items():
    items = get_all_rating_items()
    return jsonify(items)

@rating_item_bp.route('/api/rating-items', methods=['POST'])
def create_rating_item():
    data = request.json
    
    name = data.get('name')
    description = data.get('description', '')
    enabled = data.get('enabled', 1)
    
    if not name:
        return error('请输入评分项名称')
    
    new_id = add_rating_item(name, description, enabled)
    return success({'id': new_id}, '评分项添加成功')

@rating_item_bp.route('/api/rating-items/<id>', methods=['PUT'])
def update_rating_item_route(id):
    data = request.json
    
    name = data.get('name')
    description = data.get('description', '')
    enabled = data.get('enabled', 1)
    
    if not name:
        return error('请输入评分项名称')
    
    existing = get_rating_item_by_id(id)
    if not existing:
        return error('评分项不存在', 404)
    
    update_rating_item(id, name, description, enabled)
    return success(message='评分项更新成功')

@rating_item_bp.route('/api/rating-items/<id>', methods=['DELETE'])
def delete_rating_item_route(id):
    existing = get_rating_item_by_id(id)
    if not existing:
        return error('评分项不存在', 404)
    
    delete_rating_item(id)
    return success(message='评分项删除成功')

@rating_item_bp.route('/api/rating-items/batch-delete', methods=['POST'])
def batch_delete_rating_items_route():
    ids = request.json.get('ids', [])
    
    if not ids:
        return error('请至少选择一个评分项')
    
    deleted_count = batch_delete_rating_items(ids)
    return success({'deleted_count': deleted_count}, f'已删除 {deleted_count} 个评分项')