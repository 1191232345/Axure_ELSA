from models.db import transaction
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def batch_add_departments(departments_data):
    """批量添加部门

    Args:
        departments_data: 部门数据列表，每项包含 name, description, enabled, sort_order

    Returns:
        tuple: (成功数量, 失败列表)
    """
    from models.department import check_department_name_exists
    
    success_count = 0
    failed_list = []

    with transaction() as conn:
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        for i, dept_data in enumerate(departments_data, 1):
            try:
                name = dept_data.get('name', '').strip()
                description = dept_data.get('description', '').strip()
                enabled = dept_data.get('enabled', 1)
                sort_order = dept_data.get('sort_order', 0)

                # 验证必填字段
                if not name:
                    failed_list.append({
                        'row': i,
                        'name': name,
                        'error': '部门名称不能为空'
                    })
                    continue

                # 检查部门名称是否已存在
                if check_department_name_exists(name):
                    failed_list.append({
                        'row': i,
                        'name': name,
                        'error': '部门名称已存在'
                    })
                    continue

                # 插入部门
                cursor.execute(
                    'INSERT INTO departments (name, description, enabled, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                    (name, description, enabled, sort_order, now, now)
                )

                success_count += 1
                logger.info(f"批量导入部门成功: {name}")

            except Exception as e:
                failed_list.append({
                    'row': i,
                    'name': dept_data.get('name', ''),
                    'error': str(e)
                })
                logger.error(f"批量导入部门失败: {dept_data.get('name', '')} - {e}")

    return success_count, failed_list

def batch_delete_departments(ids):
    """批量删除指定部门（单事务，自动解绑员工）

    Args:
        ids: 部门 ID 列表

    Returns:
        tuple: (删除数量, 解除关联的员工总数)
    """
    with transaction() as conn:
        cursor = conn.cursor()
        deleted_count = 0
        total_unlinked = 0

        for dept_id in ids:
            # 解除员工关联
            emp_count = cursor.execute(
                'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
                (dept_id,)
            ).fetchone()['count']

            if emp_count > 0:
                cursor.execute(
                    'UPDATE employees SET department_id = NULL WHERE department_id = ?',
                    (dept_id,)
                )
                total_unlinked += emp_count

            cursor.execute('DELETE FROM departments WHERE id = ?', (dept_id,))
            deleted_count += 1

        logger.info(f"批量删除部门成功: {deleted_count} 个，解除关联 {total_unlinked} 人")
        return deleted_count, total_unlinked

def delete_departments_by_filter(search=None, enabled=None):
    """根据筛选条件删除部门
    
    Args:
        search: 搜索关键词（部门名称）
        enabled: 启用状态
        
    Returns:
        tuple: (删除数量, 解除关联员工数)
    """
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 构建查询条件
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append('name LIKE ?')
            params.append(f'%{search}%')
        
        if enabled is not None:
            where_clauses.append('enabled = ?')
            params.append(enabled)
        
        where_sql = ' AND ' + ' AND '.join(where_clauses) if where_clauses else ''
        
        # 获取要删除的部门
        query = f'SELECT id, name FROM departments WHERE 1=1{where_sql}'
        rows = cursor.execute(query, params).fetchall()
        
        deleted_count = 0
        total_unlinked = 0
        
        for row in rows:
            dept_id = row['id']
            
            # 解除部门下员工的关联
            employee_count = cursor.execute(
                'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
                (dept_id,)
            ).fetchone()['count']
            
            if employee_count > 0:
                cursor.execute(
                    'UPDATE employees SET department_id = NULL WHERE department_id = ?',
                    (dept_id,)
                )
                total_unlinked += employee_count
                logger.info(f'已将部门 {dept_id} 下的 {employee_count} 名员工解除关联')
            
            cursor.execute('DELETE FROM departments WHERE id = ?', (dept_id,))
            deleted_count += 1
        
        logger.info(f"条件删除部门成功: {deleted_count} 个，解除关联 {total_unlinked} 人")
        return deleted_count, total_unlinked
