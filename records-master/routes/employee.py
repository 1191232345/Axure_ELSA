from flask import Blueprint, request, jsonify
from models import (
    get_all_employees,
    get_employee_by_id,
    add_employee,
    update_employee,
    delete_employee,
    batch_delete_employees,
    get_all_departments,
    get_employees_paginated,
    batch_add_employees,
    delete_employees_by_filter,
)
from utils.response import success, error
from utils.validator import validate_employee_data, ValidationError
import logging
import re

logger = logging.getLogger(__name__)

employee_bp = Blueprint('employee', __name__)

@employee_bp.route('/api/employees')
def list_employees():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 10, type=int)
        search = request.args.get('search', '').strip()
        department = request.args.get('department', '').strip()
        
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10
        
        result = get_employees_paginated(page, page_size, search if search else None, department if department else None)
        return jsonify(result)
    except Exception as e:
        logger.error(f"获取员工列表失败: {e}", exc_info=True)
        return error('获取员工列表失败')

@employee_bp.route('/api/employees', methods=['POST'])
def create_employee():
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_employee_data(data)
        
        new_id = add_employee(
            validated_data['name'], 
            validated_data['department'], 
            validated_data['rating_items'], 
            validated_data.get('department_id')
        )
        
        logger.info(f"员工添加成功: {new_id} - {validated_data['name']}")
        return success({'id': new_id}, '员工添加成功')
    except ValidationError as e:
        logger.warning(f"员工数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"添加员工失败: {e}", exc_info=True)
        return error('添加员工失败')

@employee_bp.route('/api/employees/<id>', methods=['PUT'])
def update_employee_route(id):
    try:
        data = request.json
        
        # 验证输入数据
        validated_data = validate_employee_data(data)
        
        existing = get_employee_by_id(id)
        if not existing:
            return error('员工不存在', 404)
        
        update_employee(
            id, 
            validated_data['name'], 
            validated_data['department'], 
            validated_data['rating_items'], 
            validated_data.get('department_id')
        )
        
        logger.info(f"员工更新成功: {id} - {validated_data['name']}")
        return success(message='员工更新成功')
    except ValidationError as e:
        logger.warning(f"员工数据验证失败: {e}")
        return error(str(e))
    except Exception as e:
        logger.error(f"更新员工失败: {e}", exc_info=True)
        return error('更新员工失败')

@employee_bp.route('/api/employees/<id>', methods=['DELETE'])
def delete_employee_route(id):
    try:
        existing = get_employee_by_id(id)
        if not existing:
            return error('员工不存在', 404)
        
        delete_employee(id)
        logger.info(f"员工删除成功: {id}")
        return success(message='员工删除成功')
    except Exception as e:
        logger.error(f"删除员工失败: {e}", exc_info=True)
        return error('删除员工失败')

@employee_bp.route('/api/employees/batch-delete', methods=['POST'])
def batch_delete_employees_route():
    try:
        ids = request.json.get('ids', [])
        
        if not ids:
            return error('请至少选择一个员工')
        
        deleted_count, unlinked_count = batch_delete_employees(ids)
        msg = f'已删除 {deleted_count} 个员工'
        if unlinked_count > 0:
            msg += f'，{unlinked_count}条评分关联已清除'
        logger.info(f'批量删除员工成功: {msg}')
        return success({'deleted_count': deleted_count, 'unlinked_count': unlinked_count}, msg)
    except Exception as e:
        logger.error(f'批量删除员工失败: {e}', exc_info=True)
        return error('批量删除员工失败')

@employee_bp.route('/api/employees/delete-by-filter', methods=['POST'])
def delete_employees_by_filter_route():
    """根据筛选条件删除员工"""
    try:
        data = request.json
        search = data.get('search', '').strip()
        department = data.get('department', '').strip()
        
        deleted_count, unlinked_count = delete_employees_by_filter(
            search if search else None,
            department if department else None
        )
        
        msg = f'已删除 {deleted_count} 个员工'
        if unlinked_count > 0:
            msg += f'，{unlinked_count}条评分关联已清除'
        logger.info(f'条件删除员工成功: {msg}')
        return success({'deleted_count': deleted_count, 'unlinked_count': unlinked_count}, msg)
    except Exception as e:
        logger.error(f'条件删除员工失败: {e}', exc_info=True)
        return error('条件删除员工失败')

@employee_bp.route('/api/employees/batch-import', methods=['POST'])
def batch_import_employees():
    """批量导入员工"""
    try:
        data = request.json
        text_data = data.get('data', '').strip()
        
        if not text_data:
            return error('请输入要导入的数据')
        
        # 解析文本数据
        employees_data = parse_import_text(text_data)
        
        if not employees_data:
            return error('未能解析出有效的员工数据')
        
        # 批量添加员工
        success_count, failed_list = batch_add_employees(employees_data)
        
        result = {
            'success_count': success_count,
            'failed_count': len(failed_list),
            'failed_list': failed_list
        }
        
        if success_count > 0:
            logger.info(f"批量导入员工成功: {success_count} 个")
            return success(result, f'成功导入 {success_count} 个员工' + (f'，{len(failed_list)} 个失败' if failed_list else ''))
        else:
            return error('导入失败，所有数据均未通过验证', data=result)
    
    except Exception as e:
        logger.error(f"批量导入员工失败: {e}", exc_info=True)
        return error('批量导入员工失败')

def parse_import_text(text):
    """解析导入的文本数据
    
    支持格式：
    1. 制表符分隔（Excel粘贴）：员工姓名\t部门名称
    2. 逗号分隔（CSV）：员工姓名,部门名称
    3. 每行一个员工姓名（部门需要手动选择）
    """
    employees = []
    lines = text.strip().split('\n')
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue
        
        # 跳过表头行
        if line_num == 1 and ('员工' in line or '姓名' in line or 'name' in line.lower()):
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
            # 只有一个字段，作为员工姓名
            parts = [line]
        
        # 清理数据
        parts = [p.strip() for p in parts if p.strip()]
        
        if not parts:
            continue
        
        emp_data = {
            'name': parts[0],
            'department': parts[1] if len(parts) > 1 else '',
            'rating_items': []
        }
        
        employees.append(emp_data)
    
    return employees