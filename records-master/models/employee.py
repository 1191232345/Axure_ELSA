from models.db import get_db_cursor, transaction
import logging

logger = logging.getLogger(__name__)

def get_all_employees():
    """获取所有员工（优化查询，避免 N+1 问题）"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT e.*, d.name as department_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
        '''
        
        rows = cursor.execute(query).fetchall()
        
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
    """根据 ID 获取员工"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT e.*, d.name as department_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.id = ?
        '''
        
        row = cursor.execute(query, (id,)).fetchone()
        
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
    """添加员工（使用事务）"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 生成新 ID
        max_id_row = cursor.execute('SELECT MAX(CAST(id AS INTEGER)) FROM employees').fetchone()
        current_max_id = max_id_row[0] if max_id_row[0] is not None else 0
        new_id = str(current_max_id + 1)
        
        # 插入员工
        cursor.execute(
            'INSERT INTO employees (id, name, department, department_id) VALUES (?, ?, ?, ?)',
            (new_id, name, department, department_id)
        )
        
        # 批量插入评分项关系
        if rating_items:
            cursor.executemany(
                'INSERT INTO employee_rating_relations (employee_id, rating_item_id) VALUES (?, ?)',
                [(new_id, item_id) for item_id in rating_items]
            )
        
        logger.info(f"员工添加成功: {new_id}")
        return new_id

def update_employee(id, name, department, rating_items, department_id=None):
    """更新员工（使用事务）"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 更新员工信息
        cursor.execute(
            'UPDATE employees SET name = ?, department = ?, department_id = ? WHERE id = ?',
            (name, department, department_id, id)
        )
        
        # 删除旧的评分项关系
        cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (id,))
        
        # 批量插入新的评分项关系
        if rating_items:
            cursor.executemany(
                'INSERT INTO employee_rating_relations (employee_id, rating_item_id) VALUES (?, ?)',
                [(id, item_id) for item_id in rating_items]
            )
        
        logger.info(f"员工更新成功: {id}")
        return True

def delete_employee(id):
    """删除员工"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 删除评分项关系
        cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (id,))
        
        # 删除员工
        cursor.execute('DELETE FROM employees WHERE id = ?', (id,))
        
        logger.info(f"员工删除成功: {id}")
        return True

def batch_delete_employees(ids):
    """批量删除员工（使用事务）"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        deleted_count = 0
        total_unlinked = 0
        for emp_id in ids:
            # 统计受影响的关联数量
            relation_count = cursor.execute(
                'SELECT COUNT(*) as count FROM employee_rating_relations WHERE employee_id = ?',
                (emp_id,)
            ).fetchone()['count']
            total_unlinked += relation_count

            # 删除评分项关系
            cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (emp_id,))
            
            # 删除员工
            cursor.execute('DELETE FROM employees WHERE id = ?', (emp_id,))
            deleted_count += 1
        
        logger.info(f"批量删除员工成功: {deleted_count} 个，清除评分关联 {total_unlinked} 条")
        return deleted_count, total_unlinked

def delete_employees_by_filter(search=None, department=None):
    """根据筛选条件删除员工
    
    Args:
        search: 搜索关键词（员工姓名）
        department: 部门名称
        
    Returns:
        int: 删除的员工数量
    """
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 构建查询条件
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append('e.name LIKE ?')
            params.append(f'%{search}%')
        
        if department:
            where_clauses.append('(e.department = ? OR d.name = ?)')
            params.extend([department, department])
        
        where_sql = ' AND ' + ' AND '.join(where_clauses) if where_clauses else ''
        
        # 获取要删除的员工ID
        query = f'''
            SELECT e.id 
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            WHERE 1=1{where_sql}
        '''
        rows = cursor.execute(query, params).fetchall()
        ids = [row['id'] for row in rows]
        
        if not ids:
            return 0, 0
        
        # 统计受影响的关联数量
        placeholders = ','.join(['?' for _ in ids])
        unlinked_count = cursor.execute(
            f'SELECT COUNT(*) as count FROM employee_rating_relations WHERE employee_id IN ({placeholders})', ids
        ).fetchone()['count']
        
        # 删除评分项关系
        cursor.execute(f'DELETE FROM employee_rating_relations WHERE employee_id IN ({placeholders})', ids)
        
        # 删除员工
        cursor.execute(f'DELETE FROM employees WHERE id IN ({placeholders})', ids)
        
        deleted_count = len(ids)
        logger.info(f"条件删除员工成功: {deleted_count} 个，清除评分关联 {unlinked_count} 条")
        return deleted_count, unlinked_count

def get_all_departments():
    """获取所有部门"""
    with get_db_cursor() as cursor:
        rows = cursor.execute('SELECT * FROM departments ORDER BY sort_order, name').fetchall()
        return [{'id': row['id'], 'name': row['name']} for row in rows]

def get_employees_paginated(page=1, page_size=10, search=None, department=None):
    """分页获取员工（优化查询）"""
    with get_db_cursor() as cursor:
        offset = (page - 1) * page_size
        
        # 构建查询条件
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append('e.name LIKE ?')
            params.append(f'%{search}%')
        
        if department:
            where_clauses.append('(e.department = ? OR d.name = ?)')
            params.extend([department, department])
        
        where_sql = ' AND ' + ' AND '.join(where_clauses) if where_clauses else ''
        
        # 查询总数
        count_query = f'''
            SELECT COUNT(*) as total 
            FROM employees e 
            LEFT JOIN departments d ON e.department_id = d.id 
            WHERE 1=1{where_sql}
        '''
        total_row = cursor.execute(count_query, params).fetchone()
        total = total_row['total'] if total_row else 0
        
        # 查询数据
        data_query = f'''
            SELECT e.*, d.name as department_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE 1=1{where_sql}
            ORDER BY e.id
            LIMIT ? OFFSET ?
        '''
        params.extend([page_size, offset])
        rows = cursor.execute(data_query, params).fetchall()
        
        employees = {}
        for row in rows:
            employees[row['id']] = {
                'id': row['id'],
                'name': row['name'],
                'department': row['department'],
                'department_id': row['department_id'],
                'department_name': row['department_name'] or row['department']
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