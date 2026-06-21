from flask import Blueprint, request, jsonify
from models import (
    get_all_rating_items,
    get_rating_item_by_id,
    add_rating_item,
    update_rating_item,
    delete_rating_item,
    batch_delete_rating_items,
    get_rating_items_paginated,
    batch_add_rating_items,
    delete_rating_items_by_filter,
)
from utils.response import success, error
from utils.validator import validate_rating_item_data, ValidationError
import logging
import re

logger = logging.getLogger(__name__)

rating_item_bp = Blueprint('rating_item', __name__)

@rating_item_bp.route('/api/rating-items')
def list_rating_items():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 10, type=int)
        search = request.args.get('search', '').strip()
        enabled = request.args.get('enabled', type=int)

        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10

        result = get_rating_items_paginated(page, page_size, search if search else None, enabled)
        return jsonify(result)
    except Exception as e:
        logger.error(f"获取评分项列表失败: {e}", exc_info=True)
        return error('获取评分项列表失败')

@rating_item_bp.route('/api/rating-items', methods=['POST'])
def create_rating_item():
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_rating_item_data(data)
        
        new_id = add_rating_item(
            validated_data['name'], 
            validated_data['description'], 
            validated_data['enabled']
        )
        
        logger.info(f"评分项添加成功: {new_id} - {validated_data['name']}")
        return success({'id': new_id}, '评分项添加成功')
    except ValidationError as e:
        logger.warning(f"评分项数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"添加评分项失败: {e}", exc_info=True)
        return error('添加评分项失败')

@rating_item_bp.route('/api/rating-items/<id>', methods=['PUT'])
def update_rating_item_route(id):
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_rating_item_data(data)
        
        existing = get_rating_item_by_id(id)
        if not existing:
            return error('评分项不存在', 404)
        
        update_rating_item(
            id, 
            validated_data['name'], 
            validated_data['description'], 
            validated_data['enabled']
        )
        
        logger.info(f"评分项更新成功: {id} - {validated_data['name']}")
        return success(message='评分项更新成功')
    except ValidationError as e:
        logger.warning(f"评分项数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"更新评分项失败: {e}", exc_info=True)
        return error('更新评分项失败')

@rating_item_bp.route('/api/rating-items/<id>', methods=['DELETE'])
def delete_rating_item_route(id):
    try:
        existing = get_rating_item_by_id(id)
        if not existing:
            return error('评分项不存在', 404)
        
        result, message = delete_rating_item(id)
        logger.info(f'评分项删除成功: {id}')
        return success(message=message)
    except Exception as e:
        logger.error(f'删除评分项失败: {e}', exc_info=True)
        return error('删除评分项失败')

@rating_item_bp.route('/api/rating-items/batch-delete', methods=['POST'])
def batch_delete_rating_items_route():
    try:
        ids = request.json.get('ids', [])
        
        if not ids:
            return error('请至少选择一个评分项')
        
        deleted_count, unlinked_count = batch_delete_rating_items(ids)
        msg = f'已删除 {deleted_count} 个评分项'
        if unlinked_count > 0:
            msg += f'，{unlinked_count}条员工关联已清除'
        logger.info(f'批量删除评分项成功: {msg}')
        return success({'deleted_count': deleted_count, 'unlinked_count': unlinked_count}, msg)
    except Exception as e:
        logger.error(f'批量删除评分项失败: {e}', exc_info=True)
        return error('批量删除评分项失败')

@rating_item_bp.route('/api/rating-items/delete-by-filter', methods=['POST'])
def delete_rating_items_by_filter_route():
    """根据筛选条件删除评分项"""
    try:
        data = request.json
        search = data.get('search', '').strip()
        enabled = data.get('enabled')
        
        deleted_count, unlinked_count = delete_rating_items_by_filter(
            search if search else None,
            enabled if enabled is not None else None
        )
        
        msg = f'已删除 {deleted_count} 个评分项'
        if unlinked_count > 0:
            msg += f'，{unlinked_count}条员工关联已清除'
        logger.info(f'条件删除评分项成功: {msg}')
        return success({'deleted_count': deleted_count, 'unlinked_count': unlinked_count}, msg)
    except Exception as e:
        logger.error(f'条件删除评分项失败: {e}', exc_info=True)
        return error('条件删除评分项失败')

@rating_item_bp.route('/api/rating-items/batch-import', methods=['POST'])
def batch_import_rating_items():
    """批量导入评分项"""
    try:
        data = request.json
        text_data = data.get('data', '').strip()
        
        if not text_data:
            return error('请输入要导入的数据')
        
        # 解析文本数据
        rating_items_data = parse_import_text(text_data)
        
        if not rating_items_data:
            return error('未能解析出有效的评分项数据')
        
        # 批量添加评分项
        success_count, failed_list = batch_add_rating_items(rating_items_data)
        
        result = {
            'success_count': success_count,
            'failed_count': len(failed_list),
            'failed_list': failed_list
        }
        
        if success_count > 0:
            logger.info(f"批量导入评分项成功: {success_count} 个")
            return success(result, f'成功导入 {success_count} 个评分项' + (f'，{len(failed_list)} 个失败' if failed_list else ''))
        else:
            return error('导入失败，所有数据均未通过验证', data=result)
    
    except Exception as e:
        logger.error(f"批量导入评分项失败: {e}", exc_info=True)
        return error('批量导入评分项失败')

def parse_import_text(text):
    """解析导入的文本数据
    
    支持格式：
    1. 制表符分隔（Excel粘贴）：评分项名称\t描述
    2. 逗号分隔（CSV）：评分项名称,描述
    3. 每行一个评分项名称
    """
    rating_items = []
    lines = text.strip().split('\n')
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue
        
        # 跳过表头行
        if line_num == 1 and ('评分项' in line or '名称' in line or 'name' in line.lower()):
            continue
        
        # 尝试不同的分隔符
        parts = None
        
        # 制表符分隔
        if '\t' in line:
            parts = line.split('\t')
        # 逗号分隔
        elif ',' in line:
            parts = line.split(',')
        # 空格分隔（多个空格视为一个分隔符）
        elif '  ' in line:
            parts = re.split(r'\s{2,}', line)
        else:
            # 只有一个字段，作为评分项名称
            parts = [line]
        
        # 清理数据
        parts = [p.strip() for p in parts if p.strip()]
        
        if not parts:
            continue
        
        item_data = {
            'name': parts[0],
            'description': parts[1] if len(parts) > 1 else '',
            'enabled': 1
        }
        
        rating_items.append(item_data)
    
    return rating_items