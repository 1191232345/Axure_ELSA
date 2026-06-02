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
)
from utils.response import success, error

employee_bp = Blueprint('employee', __name__)

@employee_bp.route('/api/employees')
def list_employees():
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

@employee_bp.route('/api/departments')
def list_departments():
    departments = get_all_departments()
    return jsonify(departments)

@employee_bp.route('/api/employees', methods=['POST'])
def create_employee():
    data = request.json
    
    name = data.get('name')
    department = data.get('department')
    rating_items = data.get('rating_items', [])
    department_id = data.get('department_id')
    
    if not name:
        return error('请输入姓名')
    if not department:
        return error('请选择部门')
    if not rating_items:
        return error('请至少选择一项评分项')
    
    new_id = add_employee(name, department, rating_items, department_id)
    return success({'id': new_id}, '员工添加成功')

@employee_bp.route('/api/employees/<id>', methods=['PUT'])
def update_employee_route(id):
    data = request.json
    
    name = data.get('name')
    department = data.get('department')
    rating_items = data.get('rating_items', [])
    department_id = data.get('department_id')
    
    if not name:
        return error('请输入姓名')
    if not department:
        return error('请选择部门')
    if not rating_items:
        return error('请至少选择一项评分项')
    
    existing = get_employee_by_id(id)
    if not existing:
        return error('员工不存在', 404)
    
    update_employee(id, name, department, rating_items, department_id)
    return success(message='员工更新成功')

@employee_bp.route('/api/employees/<id>', methods=['DELETE'])
def delete_employee_route(id):
    existing = get_employee_by_id(id)
    if not existing:
        return error('员工不存在', 404)
    
    delete_employee(id)
    return success(message='员工删除成功')

@employee_bp.route('/api/employees/batch-delete', methods=['POST'])
def batch_delete_employees_route():
    ids = request.json.get('ids', [])
    
    if not ids:
        return error('请至少选择一个员工')
    
    deleted_count = batch_delete_employees(ids)
    return success({'deleted_count': deleted_count}, f'已删除 {deleted_count} 个员工')