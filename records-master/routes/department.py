from flask import Blueprint, request, jsonify
from models import (
    get_all_departments,
    get_department_by_id,
    get_enabled_departments,
    get_departments_paginated,
    add_department,
    update_department,
    delete_department,
    check_department_name_exists,
    batch_add_departments,
    batch_delete_departments,
    delete_departments_by_filter,
)
from utils.response import success, error
from utils.validator import validate_department_data, ValidationError
import logging
import re

logger = logging.getLogger(__name__)

department_bp = Blueprint('department', __name__)

@department_bp.route('/api/departments')
def list_departments():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 10, type=int)
        search = request.args.get('search', '').strip()
        enabled = request.args.get('enabled', type=int)
        
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10
        
        result = get_departments_paginated(page, page_size, search if search else None, enabled)
        return jsonify(result)
    except Exception as e:
        logger.error(f"获取部门列表失败: {e}", exc_info=True)
        return error('获取部门列表失败')

@department_bp.route('/api/departments/enabled')
def list_enabled_departments():
    try:
        departments = get_enabled_departments()
        return jsonify(departments)
    except Exception as e:
        logger.error(f"获取启用部门列表失败: {e}", exc_info=True)
        return error('获取启用部门列表失败')

@department_bp.route('/api/departments/<int:id>')
def get_department(id):
    try:
        department = get_department_by_id(id)
        if not department:
            return error('部门不存在', 404)
        return jsonify(department)
    except Exception as e:
        logger.error(f"获取部门详情失败: {e}", exc_info=True)
        return error('获取部门详情失败')

@department_bp.route('/api/departments', methods=['POST'])
def create_department():
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_department_data(data)
        
        if check_department_name_exists(validated_data['name']):
            return error('部门名称已存在')
        
        dept_id = add_department(
            validated_data['name'], 
            validated_data['description'], 
            validated_data['enabled'], 
            validated_data['sort_order']
        )
        
        logger.info(f"部门添加成功: {dept_id} - {validated_data['name']}")
        return success({'id': dept_id}, '部门添加成功')
    except ValidationError as e:
        logger.warning(f"部门数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"添加部门失败: {e}", exc_info=True)
        return error('添加部门失败')

@department_bp.route('/api/departments/<int:id>', methods=['PUT'])
def update_department_route(id):
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_department_data(data)
        
        existing = get_department_by_id(id)
        if not existing:
            return error('部门不存在', 404)
        
        if check_department_name_exists(validated_data['name'], exclude_id=id):
            return error('部门名称已存在')
        
        update_department(
            id, 
            validated_data['name'], 
            validated_data['description'], 
            validated_data['enabled'], 
            validated_data['sort_order']
        )
        
        logger.info(f"部门更新成功: {id} - {validated_data['name']}")
        return success(message='部门更新成功')
    except ValidationError as e:
        logger.warning(f"部门数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"更新部门失败: {e}", exc_info=True)
        return error('更新部门失败')

@department_bp.route('/api/departments/<int:id>', methods=['DELETE'])
def delete_department_route(id):
    try:
        existing = get_department_by_id(id)
        if not existing:
            return error('部门不存在', 404)

        result, message = delete_department(id)
        if not result:
            return error(message)

        logger.info(f"部门删除成功: {id}")
        return success(message=message)
    except Exception as e:
        logger.error(f"删除部门失败: {e}", exc_info=True)
        return error('删除部门失败')

@department_bp.route('/api/departments/batch-delete', methods=['POST'])
def batch_delete_departments_route():
    """批量删除指定部门"""
    try:
        ids = request.json.get('ids', [])
        if not ids:
            return error('请至少选择一个部门')

        deleted_count, unlinked_count = batch_delete_departments(ids)
        msg = f'已删除 {deleted_count} 个部门'
        if unlinked_count > 0:
            msg += f'，{unlinked_count}名员工已解除关联'
        logger.info(f'批量删除部门成功: {msg}')
        return success({'deleted_count': deleted_count, 'unlinked_count': unlinked_count}, msg)
    except Exception as e:
        logger.error(f'批量删除部门失败: {e}', exc_info=True)
        return error('批量删除部门失败')

@department_bp.route('/api/departments/delete-by-filter', methods=['POST'])
def delete_departments_by_filter_route():
    """根据筛选条件删除部门"""
    try:
        data = request.json
        search = data.get('search', '').strip()
        enabled = data.get('enabled')
        
        deleted_count, unlinked_count = delete_departments_by_filter(
            search if search else None,
            enabled if enabled is not None else None
        )
        
        msg = f'已删除 {deleted_count} 个部门'
        if unlinked_count > 0:
            msg += f'，{unlinked_count}名员工已解除关联'
        logger.info(f'条件删除部门成功: {msg}')
        return success({'deleted_count': deleted_count, 'unlinked_count': unlinked_count}, msg)
    except Exception as e:
        logger.error(f'条件删除部门失败: {e}', exc_info=True)
        return error('条件删除部门失败')

@department_bp.route('/api/departments/batch-import', methods=['POST'])
def batch_import_departments():
    """批量导入部门"""
    try:
        data = request.json
        text_data = data.get('data', '').strip()

        if not text_data:
            return error('请输入要导入的数据')

        # 解析文本数据
        departments_data = parse_import_text(text_data)

        if not departments_data:
            return error('未能解析出有效的部门数据')

        # 批量添加部门
        success_count, failed_list = batch_add_departments(departments_data)

        result = {
            'success_count': success_count,
            'failed_count': len(failed_list),
            'failed_list': failed_list
        }

        if success_count > 0:
            logger.info(f"批量导入部门成功: {success_count} 个")
            return success(result, f'成功导入 {success_count} 个部门' + (f'，{len(failed_list)} 个失败' if failed_list else ''))
        else:
            return error('导入失败，所有数据均未通过验证', data=result)

    except Exception as e:
        logger.error(f"批量导入部门失败: {e}", exc_info=True)
        return error('批量导入部门失败')

def parse_import_text(text):
    """解析导入的文本数据

    支持格式：
    1. 制表符分隔（Excel粘贴）：部门名称\t描述
    2. 逗号分隔（CSV）：部门名称,描述
    3. 每行一个部门名称
    """
    departments = []
    lines = text.strip().split('\n')

    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue

        # 跳过表头行（如果包含"部门"或"名称"等关键词）
        if line_num == 1 and ('部门' in line or '名称' in line or 'name' in line.lower()):
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
            # 只有一个字段，作为部门名称
            parts = [line]

        # 清理数据
        parts = [p.strip() for p in parts if p.strip()]

        if not parts:
            continue

        dept_data = {
            'name': parts[0],
            'description': parts[1] if len(parts) > 1 else '',
            'enabled': 1,
            'sort_order': 0
        }

        departments.append(dept_data)

    return departments