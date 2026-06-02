from models.db import get_db_connection
from datetime import datetime

def get_all_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT d.*, COUNT(e.id) as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        GROUP BY d.id
        ORDER BY d.sort_order, d.name
    '''
    
    rows = cursor.execute(query).fetchall()
    conn.close()
    
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
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT d.*, COUNT(e.id) as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        WHERE d.id = ?
        GROUP BY d.id
    '''
    
    row = cursor.execute(query, (id)).fetchone()
    conn.close()
    
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
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT d.*, COUNT(e.id) as employee_count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        WHERE d.enabled = 1
        GROUP BY d.id
        ORDER BY d.sort_order, d.name
    '''
    
    rows = cursor.execute(query).fetchall()
    conn.close()
    
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
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * page_size
    
    count_query = '''
        SELECT COUNT(*) as total FROM departments WHERE 1=1
    '''
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
    params.append(page_size)
    params.append(offset)
    
    rows = cursor.execute(data_query, params).fetchall()
    conn.close()
    
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
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    
    cursor.execute(
        'INSERT INTO departments (name, description, enabled, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        (name, description, enabled, sort_order, now, now)
    )
    
    dept_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return dept_id

def update_department(id, name, description='', enabled=1, sort_order=0):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    
    cursor.execute(
        'UPDATE departments SET name = ?, description = ?, enabled = ?, sort_order = ?, updated_at = ? WHERE id = ?',
        (name, description, enabled, sort_order, now, id)
    )
    
    conn.commit()
    conn.close()
    
    return True

def delete_department(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    employee_count = cursor.execute(
        'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
        (id)
    ).fetchone()['count']
    
    if employee_count > 0:
        conn.close()
        return False, '该部门下有{}名员工，无法删除'.format(employee_count)
    
    cursor.execute('DELETE FROM departments WHERE id = ?', (id))
    conn.commit()
    conn.close()
    
    return True, '部门删除成功'

def check_department_name_exists(name, exclude_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'SELECT COUNT(*) as count FROM departments WHERE name = ?'
    params = [name]
    
    if exclude_id:
        query += ' AND id != ?'
        params.append(exclude_id)
    
    count = cursor.execute(query, params).fetchone()['count']
    conn.close()
    
    return count > 0

def count_employees_in_department(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    count = cursor.execute(
        'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
        (id)
    ).fetchone()['count']
    conn.close()
    
    return count