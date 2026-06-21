from models.db import get_db_cursor, transaction
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def get_all_sources():
    """获取所有来源（优化查询）"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT s.*, COUNT(e.id) as evaluation_count
            FROM sources s
            LEFT JOIN evaluation_results e ON s.id = e.source_id
            GROUP BY s.id
            ORDER BY s.sort_order, s.name
        '''
        
        rows = cursor.execute(query).fetchall()
        
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
    """根据 ID 获取来源"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT s.*, COUNT(e.id) as evaluation_count
            FROM sources s
            LEFT JOIN evaluation_results e ON s.id = e.source_id
            WHERE s.id = ?
            GROUP BY s.id
        '''
        
        row = cursor.execute(query, (id,)).fetchone()
        
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
    """获取启用的来源"""
    with get_db_cursor() as cursor:
        query = '''
            SELECT s.*, COUNT(e.id) as evaluation_count
            FROM sources s
            LEFT JOIN evaluation_results e ON s.id = e.source_id
            WHERE s.enabled = 1
            GROUP BY s.id
            ORDER BY s.sort_order, s.name
        '''
        
        rows = cursor.execute(query).fetchall()
        
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
    """分页获取来源"""
    with get_db_cursor() as cursor:
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
        params.extend([page_size, offset])
        
        rows = cursor.execute(data_query, params).fetchall()
        
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
    """添加来源"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute(
            'INSERT INTO sources (name, description, enabled, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            (name, description, enabled, sort_order, now, now)
        )
        
        source_id = cursor.lastrowid
        logger.info(f"来源添加成功: {source_id} - {name}")
        return source_id

def update_source(id, name, description='', enabled=1, sort_order=0):
    """更新来源"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute(
            'UPDATE sources SET name = ?, description = ?, enabled = ?, sort_order = ?, updated_at = ? WHERE id = ?',
            (name, description, enabled, sort_order, now, id)
        )
        
        logger.info(f"来源更新成功: {id} - {name}")
        return True

def delete_source(id):
    """删除来源"""
    with transaction() as conn:
        cursor = conn.cursor()
        
        # 检查来源下是否有评价记录
        evaluation_count = cursor.execute(
            'SELECT COUNT(*) as count FROM evaluation_results WHERE source_id = ?',
            (id,)
        ).fetchone()['count']
        
        if evaluation_count > 0:
            return False, f'该来源下有{evaluation_count}条评价记录，无法删除'
        
        cursor.execute('DELETE FROM sources WHERE id = ?', (id,))
        
        logger.info(f"来源删除成功: {id}")
        return True, '来源删除成功'

def check_source_name_exists(name, exclude_id=None):
    """检查来源名称是否存在"""
    with get_db_cursor() as cursor:
        query = 'SELECT COUNT(*) as count FROM sources WHERE name = ?'
        params = [name]
        
        if exclude_id:
            query += ' AND id != ?'
            params.append(exclude_id)
        
        count = cursor.execute(query, params).fetchone()['count']
        return count > 0

def count_evaluations_for_source(id):
    """统计来源下的评价数量"""
    with get_db_cursor() as cursor:
        count = cursor.execute(
            'SELECT COUNT(*) as count FROM evaluation_results WHERE source_id = ?',
            (id,)
        ).fetchone()['count']
        return count