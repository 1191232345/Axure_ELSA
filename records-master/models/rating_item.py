from models.db import get_db_connection, transaction

def get_all_rating_items():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM rating_items')
    rows = cursor.fetchall()
    conn.close()
    
    items = {}
    for row in rows:
        items[row['id']] = {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'enabled': row['enabled']
        }
    return items

def get_rating_item_by_id(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM rating_items WHERE id = ?', (id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'enabled': row['enabled']
        }
    return None

def add_rating_item(name, description, enabled):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO rating_items (name, description, enabled) VALUES (?, ?, ?)',
        (name, description, enabled)
    )
    
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def update_rating_item(id, name, description, enabled):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE rating_items SET name = ?, description = ?, enabled = ? WHERE id = ?',
        (name, description, enabled, id)
    )
    
    conn.commit()
    conn.close()
    return True

def delete_rating_item(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 统计受影响的关联数量
    relation_count = cursor.execute(
        'SELECT COUNT(*) as count FROM employee_rating_relations WHERE rating_item_id = ?',
        (id,)
    ).fetchone()['count']
    
    cursor.execute('DELETE FROM employee_rating_relations WHERE rating_item_id = ?', (id,))
    cursor.execute('DELETE FROM rating_items WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    msg = '评分项删除成功' + (f'，{relation_count}条员工关联已清除' if relation_count > 0 else '')
    return True, msg

def batch_delete_rating_items(ids):
    with transaction() as conn:
        cursor = conn.cursor()
        deleted_count = 0
        total_unlinked = 0

        for item_id in ids:
            # 统计受影响的关联数量
            relation_count = cursor.execute(
                'SELECT COUNT(*) as count FROM employee_rating_relations WHERE rating_item_id = ?',
                (item_id,)
            ).fetchone()['count']
            total_unlinked += relation_count

            cursor.execute('DELETE FROM employee_rating_relations WHERE rating_item_id = ?', (item_id,))
            cursor.execute('DELETE FROM rating_items WHERE id = ?', (item_id,))
            deleted_count += 1

        return deleted_count, total_unlinked

def get_rating_items_paginated(page=1, page_size=10, search=None, enabled=None):
    """分页获取评分项"""
    conn = get_db_connection()
    offset = (page - 1) * page_size

    # 构建查询条件
    where_clauses = []
    params = []

    if search:
        where_clauses.append('name LIKE ?')
        params.append(f'%{search}%')

    if enabled is not None:
        where_clauses.append('enabled = ?')
        params.append(enabled)

    where_sql = ' AND '.join(where_clauses) if where_clauses else '1=1'

    # 查询总数
    count_query = f'SELECT COUNT(*) as total FROM rating_items WHERE {where_sql}'
    total_row = conn.execute(count_query, params).fetchone()
    total = total_row['total'] if total_row else 0

    # 查询数据
    data_query = f'''
        SELECT * FROM rating_items
        WHERE {where_sql}
        ORDER BY id
        LIMIT ? OFFSET ?
    '''
    params.extend([page_size, offset])
    rows = conn.execute(data_query, params).fetchall()

    items = {}
    for row in rows:
        items[row['id']] = {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'enabled': row['enabled']
        }

    conn.close()
    total_pages = max(1, (total + page_size - 1) // page_size)

    return {
        'ratingItems': items,
        'pagination': {
            'page': page,
            'pageSize': page_size,
            'total': total,
            'totalPages': total_pages
        }
    }

def get_enabled_rating_items():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM rating_items WHERE enabled = 1')
    rows = cursor.fetchall()
    conn.close()

    items = {}
    for row in rows:
        items[row['id']] = {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'enabled': row['enabled']
        }
    return items

def batch_add_rating_items(rating_items_data):
    """批量添加评分项
    
    Args:
        rating_items_data: 评分项数据列表，每项包含 name, description, enabled
        
    Returns:
        tuple: (成功数量, 失败列表)
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    success_count = 0
    failed_list = []
    
    for i, item_data in enumerate(rating_items_data, 1):
        try:
            name = item_data.get('name', '').strip()
            description = item_data.get('description', '').strip()
            enabled = item_data.get('enabled', 1)
            
            # 验证必填字段
            if not name:
                failed_list.append({
                    'row': i,
                    'name': name,
                    'error': '评分项名称不能为空'
                })
                continue
            
            # 检查评分项名称是否已存在
            existing = cursor.execute('SELECT id FROM rating_items WHERE name = ?', (name,)).fetchone()
            if existing:
                failed_list.append({
                    'row': i,
                    'name': name,
                    'error': '评分项名称已存在'
                })
                continue
            
            # 插入评分项
            cursor.execute(
                'INSERT INTO rating_items (name, description, enabled) VALUES (?, ?, ?)',
                (name, description, enabled)
            )
            
            success_count += 1
            
        except Exception as e:
            failed_list.append({
                'row': i,
                'name': item_data.get('name', ''),
                'error': str(e)
            })
    
    conn.commit()
    conn.close()
    
    return success_count, failed_list

def delete_rating_items_by_filter(search=None, enabled=None):
    """根据筛选条件删除评分项
    
    Args:
        search: 搜索关键词（评分项名称）
        enabled: 启用状态
        
    Returns:
        tuple: (删除数量, 解除关联数量)
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
        
        # 获取要删除的评分项ID
        query = f'SELECT id FROM rating_items WHERE 1=1{where_sql}'
        rows = cursor.execute(query, params).fetchall()
        ids = [row['id'] for row in rows]
        
        if not ids:
            return 0, 0
        
        # 统计受影响的关联数量
        placeholders = ','.join(['?' for _ in ids])
        unlinked_count = cursor.execute(
            f'SELECT COUNT(*) as count FROM employee_rating_relations WHERE rating_item_id IN ({placeholders})', ids
        ).fetchone()['count']
        
        # 删除评分项关系
        cursor.execute(f'DELETE FROM employee_rating_relations WHERE rating_item_id IN ({placeholders})', ids)
        
        # 删除评分项
        cursor.execute(f'DELETE FROM rating_items WHERE id IN ({placeholders})', ids)
        
        deleted_count = len(ids)
        return deleted_count, unlinked_count