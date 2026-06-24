"""公告模型 - 仅提供获取启用公告的功能"""
from models.db import get_db_cursor
import logging

logger = logging.getLogger(__name__)


def get_enabled_announcements():
    """获取启用的公告（用于前端展示）"""
    with get_db_cursor() as cursor:
        rows = cursor.execute(
            '''SELECT * FROM announcements 
               WHERE enabled = 1 
               ORDER BY created_at DESC'''
        ).fetchall()
        
        announcements = []
        for row in rows:
            announcements.append({
                'id': row['id'],
                'title': row['title'],
                'content': row['content'],
                'type': row['type'],
                'created_at': row['created_at']
            })
        
        return announcements