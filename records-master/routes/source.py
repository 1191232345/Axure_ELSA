from flask import Blueprint, request, jsonify
from models import (
    get_all_sources,
    get_source_by_id,
    get_enabled_sources,
    get_sources_paginated,
    add_source,
    update_source,
    delete_source,
    check_source_name_exists,
)
from utils.response import success, error

source_bp = Blueprint('source', __name__)

@source_bp.route('/api/sources')
def list_sources():
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 10, type=int)
    search = request.args.get('search', '').strip()
    enabled = request.args.get('enabled', type=int)
    
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 10
    
    result = get_sources_paginated(page, page_size, search if search else None, enabled)
    return jsonify(result)

@source_bp.route('/api/sources/enabled')
def list_enabled_sources():
    sources = get_enabled_sources()
    return jsonify(sources)

@source_bp.route('/api/sources/<int:id>')
def get_source(id):
    source = get_source_by_id(id)
    if not source:
        return error('来源不存在', 404)
    return jsonify(source)

@source_bp.route('/api/sources', methods=['POST'])
def create_source():
    data = request.json
    
    name = data.get('name')
    description = data.get('description', '')
    enabled = data.get('enabled', 1)
    sort_order = data.get('sort_order', 0)
    
    if not name:
        return error('请输入来源名称')
    
    if len(name) > 50:
        return error('来源名称不能超过50个字符')
    
    if check_source_name_exists(name):
        return error('来源名称已存在')
    
    source_id = add_source(name, description, enabled, sort_order)
    return success({'id': source_id}, '来源添加成功')

@source_bp.route('/api/sources/<int:id>', methods=['PUT'])
def update_source_route(id):
    data = request.json
    
    name = data.get('name')
    description = data.get('description', '')
    enabled = data.get('enabled', 1)
    sort_order = data.get('sort_order', 0)
    
    if not name:
        return error('请输入来源名称')
    
    if len(name) > 50:
        return error('来源名称不能超过50个字符')
    
    existing = get_source_by_id(id)
    if not existing:
        return error('来源不存在', 404)
    
    if check_source_name_exists(name, exclude_id=id):
        return error('来源名称已存在')
    
    update_source(id, name, description, enabled, sort_order)
    return success(message='来源更新成功')

@source_bp.route('/api/sources/<int:id>', methods=['DELETE'])
def delete_source_route(id):
    existing = get_source_by_id(id)
    if not existing:
        return error('来源不存在', 404)
    
    result, message = delete_source(id)
    if not result:
        return error(message)
    
    return success(message=message)