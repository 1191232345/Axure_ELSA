from models.db import get_db_connection
from datetime import datetime

def get_all_sources():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT s.*, COUNT(e.id) as evaluation_count
        FROM sources s
        LEFT JOIN evaluation_results e ON s.id = e.source_id
        GROUP BY s.id
        ORDER BY s.sort_order, s.name
    '''
    
    rows = cursor.execute(query).fetchall()
    conn.close()
    
    sources = {}
    for row in rows:
        sources[row['id']] = {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'enabled': row['enabled'],
            'sort_order': row['sort_order'],
            'evaluation_count': row['evaluation_count'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        }
    
    return sources

def get_source_by_id(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT s.*, COUNT(e.id) as evaluation_count
        FROM sources s
        LEFT JOIN evaluation_results e ON s.id = e.source_id
        WHERE s.id = ?
        GROUP BY s.id
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
            'evaluation_count': row['evaluation_count'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        }
    
    return None

def get_enabled_sources():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT s.*, COUNT(e.id) as evaluation_count
        FROM sources s
        LEFT JOIN evaluation_results e ON s.id = e.source_id
        WHERE s.enabled = 1
        GROUP BY s.id
        ORDER BY s.sort_order, s.name
    '''
    
    rows = cursor.execute(query).fetchall()
    conn.close()
    
    sources = []
    for row in rows:
        sources.append({
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'enabled': row['enabled'],
            'sort_order': row['sort_order'],
            'evaluation_count': row['evaluation_count'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        })
    
    return sources

def get_sources_paginated(page=1, page_size=10, search=None, enabled=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    offset = (page - 1) * page_size
    
    count_query = 'SELECT COUNT(*) as total FROM sources WHERE 1=1'
    data_query = '''
        SELECT s.*, COUNT(e.id) as evaluation_count
        FROM sources s
        LEFT JOIN evaluation_results e ON s.id = e.source_id
        WHERE 1=1
    '''
    params = []
    
    if search:
        count_query += ' AND name LIKE ?'
        data_query += ' AND s.name LIKE ?'
        params.append(f'%{search}%')
    
    if enabled is not None:
        count_query += ' AND enabled = ?'
        data_query += ' AND s.enabled = ?'
        params.append(enabled)
    
    count_params = params.copy()
    total_row = cursor.execute(count_query, count_params).fetchone()
    total = total_row['total'] if total_row else 0
    
    data_query += ' GROUP BY s.id ORDER BY s.sort_order, s.name LIMIT ? OFFSET ?'
    params.append(page_size)
    params.append(offset)
    
    rows = cursor.execute(data_query, params).fetchall()
    conn.close()
    
    sources = {}
    for row in rows:
        sources[row['id']] = {
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'enabled': row['enabled'],
            'sort_order': row['sort_order'],
            'evaluation_count': row['evaluation_count'],
            'created_at': row['created_at'],
            'updated_at': row['updated_at']
        }
    
    total_pages = max(1, (total + page_size - 1) // page_size)
    
    return {
        'sources': sources,
        'pagination': {
            'page': page,
            'pageSize': page_size,
            'total': total,
            'totalPages': total_pages
        }
    }

def add_source(name, description='', enabled=1, sort_order=0):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    
    cursor.execute(
        'INSERT INTO sources (name, description, enabled, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        (name, description, enabled, sort_order, now, now)
    )
    
    source_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return source_id

def update_source(id, name, description='', enabled=1, sort_order=0):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    
    cursor.execute(
        'UPDATE sources SET name = ?, description = ?, enabled = ?, sort_order = ?, updated_at = ? WHERE id = ?',
        (name, description, enabled, sort_order, now, id)
    )
    
    conn.commit()
    conn.close()
    
    return True

def delete_source(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    evaluation_count = cursor.execute(
        'SELECT COUNT(*) as count FROM evaluation_results WHERE source_id = ?',
        (id)
    ).fetchone()['count']
    
    if evaluation_count > 0:
        conn.close()
        return False, '该来源下有{}条评价记录，无法删除'.format(evaluation_count)
    
    cursor.execute('DELETE FROM sources WHERE id = ?', (id))
    conn.commit()
    conn.close()
    
    return True, '来源删除成功'

def check_source_name_exists(name, exclude_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'SELECT COUNT(*) as count FROM sources WHERE name = ?'
    params = [name]
    
    if exclude_id:
        query += ' AND id != ?'
        params.append(exclude_id)
    
    count = cursor.execute(query, params).fetchone()['count']
    conn.close()
    
    return count > 0

def count_evaluations_for_source(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    count = cursor.execute(
        'SELECT COUNT(*) as count FROM evaluation_results WHERE source_id = ?',
        (id)
    ).fetchone()['count']
    conn.close()
    
    return count