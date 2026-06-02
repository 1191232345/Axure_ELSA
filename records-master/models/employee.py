from models.db import get_db_connection

def get_all_employees():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT e.*, d.name as department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
    '''
    
    rows = cursor.execute(query).fetchall()
    conn.close()
    
    employees = {}
    for row in rows:
        employees[row['id']] = {
            'id': row['id'],
            'name': row['name'],
            'department': row['department'],
            'department_id': row['department_id'],
            'department_name': row['department_name'] or row['department']
        }
    return employees

def get_employee_by_id(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT e.*, d.name as department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.id = ?
    '''
    
    row = cursor.execute(query, (id)).fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'name': row['name'],
            'department': row['department'],
            'department_id': row['department_id'],
            'department_name': row['department_name'] or row['department']
        }
    return None

def add_employee(name, department, rating_items, department_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    max_id_row = cursor.execute('SELECT MAX(CAST(id AS INTEGER)) FROM employees').fetchone()
    current_max_id = max_id_row[0] if max_id_row[0] is not None else 0
    new_id = str(current_max_id + 1)
    
    cursor.execute(
        'INSERT INTO employees (id, name, department, department_id) VALUES (?, ?, ?, ?)',
        (new_id, name, department, department_id)
    )
    
    for rating_item_id in rating_items:
        cursor.execute(
            'INSERT INTO employee_rating_relations (employee_id, rating_item_id) VALUES (?, ?)',
            (new_id, rating_item_id)
        )
    
    conn.commit()
    conn.close()
    return new_id

def update_employee(id, name, department, rating_items, department_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE employees SET name = ?, department = ?, department_id = ? WHERE id = ?',
        (name, department, department_id, id)
    )
    
    cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (id,))
    
    for rating_item_id in rating_items:
        cursor.execute(
            'INSERT INTO employee_rating_relations (employee_id, rating_item_id) VALUES (?, ?)',
            (id, rating_item_id)
        )
    
    conn.commit()
    conn.close()
    return True

def delete_employee(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (id,))
    cursor.execute('DELETE FROM employees WHERE id = ?', (id))
    
    conn.commit()
    conn.close()
    return True

def batch_delete_employees(ids):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    deleted_count = 0
    for id in ids:
        cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (id,))
        cursor.execute('DELETE FROM employees WHERE id = ?', (id))
        deleted_count += 1
    
    conn.commit()
    conn.close()
    return deleted_count

def get_all_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT department FROM employees ORDER BY department')
    rows = cursor.fetchall()
    conn.close()
    return [row['department'] for row in rows]

def get_employees_paginated(page=1, page_size=10, search=None, department=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * page_size
    
    count_query = 'SELECT COUNT(*) as total FROM employees WHERE 1=1'
    data_query = 'SELECT * FROM employees WHERE 1=1'
    params = []
    
    if search:
        count_query += ' AND name LIKE ?'
        data_query += ' AND name LIKE ?'
        params.append(f'%{search}%')
    
    if department:
        count_query += ' AND department = ?'
        data_query += ' AND department = ?'
        params.append(department)
    
    count_params = params.copy()
    total_row = cursor.execute(count_query, count_params).fetchone()
    total = total_row['total'] if total_row else 0
    
    data_query += ' ORDER BY id LIMIT ? OFFSET ?'
    params.append(page_size)
    params.append(offset)
    
    rows = cursor.execute(data_query, params).fetchall()
    conn.close()
    
    employees = {}
    for row in rows:
        employees[row['id']] = {
            'id': row['id'],
            'name': row['name'],
            'department': row['department']
        }
    
    total_pages = max(1, (total + page_size - 1) // page_size)
    
    return {
        'employees': employees,
        'pagination': {
            'page': page,
            'pageSize': page_size,
            'total': total,
            'totalPages': total_pages
        }
    }