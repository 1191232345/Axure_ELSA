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
from utils.validator import validate_source_data, ValidationError
import logging

logger = logging.getLogger(__name__)

source_bp = Blueprint('source', __name__)

@source_bp.route('/api/sources')
def list_sources():
    try:
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
    except Exception as e:
        logger.error(f"获取来源列表失败: {e}", exc_info=True)
        return error('获取来源列表失败')

@source_bp.route('/api/sources/enabled')
def list_enabled_sources():
    try:
        sources = get_enabled_sources()
        return jsonify(sources)
    except Exception as e:
        logger.error(f"获取启用来源列表失败: {e}", exc_info=True)
        return error('获取启用来源列表失败')

@source_bp.route('/api/sources/<int:id>')
def get_source(id):
    try:
        source = get_source_by_id(id)
        if not source:
            return error('来源不存在', 404)
        return jsonify(source)
    except Exception as e:
        logger.error(f"获取来源详情失败: {e}", exc_info=True)
        return error('获取来源详情失败')

@source_bp.route('/api/sources', methods=['POST'])
def create_source():
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_source_data(data)
        
        if check_source_name_exists(validated_data['name']):
            return error('来源名称已存在')
        
        source_id = add_source(
            validated_data['name'], 
            validated_data['description'], 
            validated_data['enabled'], 
            validated_data['sort_order']
        )
        
        logger.info(f"来源添加成功: {source_id} - {validated_data['name']}")
        return success({'id': source_id}, '来源添加成功')
    except ValidationError as e:
        logger.warning(f"来源数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"添加来源失败: {e}", exc_info=True)
        return error('添加来源失败')

@source_bp.route('/api/sources/<int:id>', methods=['PUT'])
def update_source_route(id):
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_source_data(data)
        
        existing = get_source_by_id(id)
        if not existing:
            return error('来源不存在', 404)
        
        if check_source_name_exists(validated_data['name'], exclude_id=id):
            return error('来源名称已存在')
        
        update_source(
            id, 
            validated_data['name'], 
            validated_data['description'], 
            validated_data['enabled'], 
            validated_data['sort_order']
        )
        
        logger.info(f"来源更新成功: {id} - {validated_data['name']}")
        return success(message='来源更新成功')
    except ValidationError as e:
        logger.warning(f"来源数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"更新来源失败: {e}", exc_info=True)
        return error('更新来源失败')

@source_bp.route('/api/sources/<int:id>', methods=['DELETE'])
def delete_source_route(id):
    try:
        existing = get_source_by_id(id)
        if not existing:
            return error('来源不存在', 404)
        
        result, message = delete_source(id)
        if not result:
            return error(message)
        
        logger.info(f"来源删除成功: {id}")
        return success(message=message)
    except Exception as e:
        logger.error(f"删除来源失败: {e}", exc_info=True)
        return error('删除来源失败')