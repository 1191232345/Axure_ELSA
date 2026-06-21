from models.db import get_db_cursor, transaction
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def get_all_departments():
    """获取所有部门（优化查询）"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT d.*, COUNT(e.id) as employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            GROUP BY d.id
            ORDER BY d.sort_order, d.name
        '''
        
        rows = cursor.execute(query).fetchall()
        
        departments = {}
        for row in rows:
            departments[row['id']] = {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'enabled': row['enabled'],
                'sort_order': row['sort_order'],
                'employee_count': row['employee_count'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        
        return departments

def get_department_by_id(id):
    """根据 ID 获取部门"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT d.*, COUNT(e.id) as employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            WHERE d.id = ?
            GROUP BY d.id
        '''
        
        row = cursor.execute(query, (id,)).fetchone()
        
        if row:
            return {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'enabled': row['enabled'],
                'sort_order': row['sort_order'],
                'employee_count': row['employee_count'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        
        return None

def get_enabled_departments():
    """获取启用的部门"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT d.*, COUNT(e.id) as employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            WHERE d.enabled = 1
            GROUP BY d.id
            ORDER BY d.sort_order, d.name
        '''
        
        rows = cursor.execute(query).fetchall()
        
        departments = []
        for row in rows:
            departments.append({
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'enabled': row['enabled'],
                'sort_order': row['sort_order'],
                'employee_count': row['employee_count'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            })
        
        return departments

def get_departments_paginated(page=1, page_size=10, search=None, enabled=None):
    """分页获取部门"""
    with get_db_cursor() as cursor:
        offset = (page - 1) * page_size
        
        count_query = 'SELECT COUNT(*) as total FROM departments WHERE 1=1'
        data_query = '''
            SELECT d.*, COUNT(e.id) as employee_count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            WHERE 1=1
        '''
        params = []
        
        if search:
            count_query += ' AND name LIKE ?'
            data_query += ' AND d.name LIKE ?'
            params.append(f'%{search}%')
        
        if enabled is not None:
            count_query += ' AND enabled = ?'
            data_query += ' AND d.enabled = ?'
            params.append(enabled)
        
        count_params = params.copy()
        total_row = cursor.execute(count_query, count_params).fetchone()
        total = total_row['total'] if total_row else 0
        
        data_query += ' GROUP BY d.id ORDER BY d.sort_order, d.name LIMIT ? OFFSET ?'
        params.extend([page_size, offset])
        
        rows = cursor.execute(data_query, params).fetchall()
        
        departments = {}
        for row in rows:
            departments[row['id']] = {
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'enabled': row['enabled'],
                'sort_order': row['sort_order'],
                'employee_count': row['employee_count'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        
        total_pages = max(1, (total + page_size - 1) // page_size)
        
        return {
            'departments': departments,
            'pagination': {
                'page': page,
                'pageSize': page_size,
                'total': total,
                'totalPages': total_pages
            }
        }

def add_department(name, description='', enabled=1, sort_order=0):
    """添加部门"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute(
            'INSERT INTO departments (name, description, enabled, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            (name, description, enabled, sort_order, now, now)
        )
        
        dept_id = cursor.lastrowid
        logger.info(f"部门添加成功: {dept_id} - {name}")
        return dept_id

def update_department(id, name, description='', enabled=1, sort_order=0):
    """更新部门"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute(
            'UPDATE departments SET name = ?, description = ?, enabled = ?, sort_order = ?, updated_at = ? WHERE id = ?',
            (name, description, enabled, sort_order, now, id)
        )
        
        logger.info(f"部门更新成功: {id} - {name}")
        return True

def delete_department(id):
    """删除部门（自动解除员工关联）"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 统计部门下的员工数量
        employee_count = cursor.execute(
            'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
            (id,)
        ).fetchone()['count']
        
        # 解除员工的部门关联
        if employee_count > 0:
            cursor.execute(
                'UPDATE employees SET department_id = NULL WHERE department_id = ?',
                (id,)
            )
            logger.info(f'已将部门 {id} 下的 {employee_count} 名员工解除关联')
        
        cursor.execute('DELETE FROM departments WHERE id = ?', (id,))
        
        msg = '部门删除成功' + (f'，{employee_count}名员工已解除关联' if employee_count > 0 else '')
        logger.info(f'部门删除成功: {id}')
        return True, msg

def check_department_name_exists(name, exclude_id=None):
    """检查部门名称是否存在"""
    with get_db_cursor() as cursor:
        query = 'SELECT COUNT(*) as count FROM departments WHERE name = ?'
        params = [name]
        
        if exclude_id:
            query += ' AND id != ?'
            params.append(exclude_id)
        
        count = cursor.execute(query, params).fetchone()['count']
        return count > 0

def count_employees_in_department(id):
    """统计部门下的员工数量"""
    with get_db_cursor() as cursor:
        count = cursor.execute(
            'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
            (id,)
        ).fetchone()['count']
        return count