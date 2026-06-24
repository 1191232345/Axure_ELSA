"""公告路由 - 仅提供获取启用公告的API"""
from flask import Blueprint, jsonify
from models.announcement import get_enabled_announcements
import logging

logger = logging.getLogger(__name__)

announcement_bp = Blueprint('announcement', __name__)


@announcement_bp.route('/api/announcements/enabled')
def list_enabled_announcements():
    """获取启用的公告（前端展示用）"""
    try:
        announcements = get_enabled_announcements()
        return jsonify(announcements)
    except Exception as e:
        logger.error(f"获取启用公告失败: {e}", exc_info=True)
        return jsonify([])  # 返回空数组，避免前端报错