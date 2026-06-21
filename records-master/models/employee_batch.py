from models.db import get_db_cursor, transaction
import logging

logger = logging.getLogger(__name__)

def batch_add_employees(employees_data):
    """批量添加员工
    
    Args:
        employees_data: 员工数据列表，每项包含 name, department, department_id, rating_items
        
    Returns:
        tuple: (成功数量, 失败列表)
    """
    success_count = 0
    failed_list = []
    
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 获取当前最大ID
        max_id_row = cursor.execute('SELECT MAX(CAST(id AS INTEGER)) FROM employees').fetchone()
        current_max_id = max_id_row[0] if max_id_row[0] is not None else 0
        
        for i, emp_data in enumerate(employees_data, 1):
            try:
                name = emp_data.get('name', '').strip()
                department = emp_data.get('department', '').strip()
                department_id = emp_data.get('department_id')
                rating_items = emp_data.get('rating_items', [])
                
                # 验证必填字段
                if not name:
                    failed_list.append({
                        'row': i,
                        'name': name,
                        'error': '员工姓名不能为空'
                    })
                    continue
                
                if not department:
                    failed_list.append({
                        'row': i,
                        'name': name,
                        'error': '部门不能为空'
                    })
                    continue
                
                # 生成新ID
                current_max_id += 1
                new_id = str(current_max_id)
                
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
                
                success_count += 1
                logger.info(f"批量导入员工成功: {name}")
                
            except Exception as e:
                failed_list.append({
                    'row': i,
                    'name': emp_data.get('name', ''),
                    'error': str(e)
                })
                logger.error(f"批量导入员工失败: {emp_data.get('name', '')} - {e}")
    
    return success_count, failed_list

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
            return 0
        
        # 删除评分项关系
        placeholders = ','.join(['?' for _ in ids])
        cursor.execute(f'DELETE FROM employee_rating_relations WHERE employee_id IN ({placeholders})', ids)
        
        # 删除员工
        cursor.execute(f'DELETE FROM employees WHERE id IN ({placeholders})', ids)
        
        deleted_count = len(ids)
        logger.info(f"条件删除员工成功: {deleted_count} 个")
        return deleted_count
