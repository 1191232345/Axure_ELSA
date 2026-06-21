from flask import Blueprint, request, jsonify
from models import (
    get_all_evaluation_results,
    get_evaluation_result_by_id,
    batch_add_evaluation_results,
    delete_evaluation_result,
    clear_all_evaluation_results,
    clear_evaluation_results_by_filter,
    get_evaluation_results_paginated,
)
from utils.response import success, error

evaluation_bp = Blueprint('evaluation', __name__)

@evaluation_bp.route('/api/evaluation-results')
def list_evaluation_results():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 15, type=int)
        employee_id = request.args.get('employee_id', '').strip()
        evaluator = request.args.get('evaluator', '').strip()
        department = request.args.get('department', '').strip()

        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 15

        result = get_evaluation_results_paginated(
            page, page_size,
            employee_id if employee_id else None,
            evaluator if evaluator else None,
            department if department else None
        )
        return jsonify(result)
    except Exception as e:
        return error('获取评价结果列表失败')

@evaluation_bp.route('/api/evaluation-results/<id>', methods=['DELETE'])
def delete_evaluation_result_route(id):
    existing = get_evaluation_result_by_id(id)
    if not existing:
        return error('评价结果不存在', 404)
    
    delete_evaluation_result(id)
    return success(message='评价结果删除成功')

@evaluation_bp.route('/api/evaluation-results/batch', methods=['POST'])
def batch_submit_evaluation_results():
    try:
        results = request.json
        
        if not results:
            return error('请提供评价数据')
        
        added_count = batch_add_evaluation_results(results)
        return success({'added_count': added_count}, f'已提交 {added_count} 条评价')
    except Exception as e:
        return error('批量提交评价失败')

@evaluation_bp.route('/api/evaluation-results/clear', methods=['POST'])
def clear_evaluation_results_route():
    try:
        data = request.json
        clear_type = data.get('type', 'all')
        
        if clear_type == 'all':
            deleted_count = clear_all_evaluation_results()
            return success({'deleted_count': deleted_count}, f'已清除 {deleted_count} 条记录')
        
        filter_value = data.get('value')
        deleted_count = clear_evaluation_results_by_filter(clear_type, filter_value)
        return success({'deleted_count': deleted_count}, f'已清除 {deleted_count} 条记录')
    except Exception as e:
        return error('清除评价结果失败')