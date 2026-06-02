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
)
from utils.response import success, error

department_bp = Blueprint('department', __name__)

@department_bp.route('/api/departments')
def list_departments():
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

@department_bp.route('/api/departments/enabled')
def list_enabled_departments():
    departments = get_enabled_departments()
    return jsonify(departments)

@department_bp.route('/api/departments/<int:id>')
def get_department(id):
    department = get_department_by_id(id)
    if not department:
        return error('部门不存在', 404)
    return jsonify(department)

@department_bp.route('/api/departments', methods=['POST'])
def create_department():
    data = request.json
    
    name = data.get('name')
    description = data.get('description', '')
    enabled = data.get('enabled', 1)
    sort_order = data.get('sort_order', 0)
    
    if not name:
        return error('请输入部门名称')
    
    if len(name) > 50:
        return error('部门名称不能超过50个字符')
    
    if check_department_name_exists(name):
        return error('部门名称已存在')
    
    dept_id = add_department(name, description, enabled, sort_order)
    return success({'id': dept_id}, '部门添加成功')

@department_bp.route('/api/departments/<int:id>', methods=['PUT'])
def update_department_route(id):
    data = request.json
    
    name = data.get('name')
    description = data.get('description', '')
    enabled = data.get('enabled', 1)
    sort_order = data.get('sort_order', 0)
    
    if not name:
        return error('请输入部门名称')
    
    if len(name) > 50:
        return error('部门名称不能超过50个字符')
    
    existing = get_department_by_id(id)
    if not existing:
        return error('部门不存在', 404)
    
    if check_department_name_exists(name, exclude_id=id):
        return error('部门名称已存在')
    
    update_department(id, name, description, enabled, sort_order)
    return success(message='部门更新成功')

@department_bp.route('/api/departments/<int:id>', methods=['DELETE'])
def delete_department_route(id):
    existing = get_department_by_id(id)
    if not existing:
        return error('部门不存在', 404)
    
    result, message = delete_department(id)
    if not result:
        return error(message)
    
    return success(message=message)