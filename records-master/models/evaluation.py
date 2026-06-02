import json
from datetime import datetime
from models.db import get_db_connection

def get_all_evaluation_results():
    conn = get_db_connection()
    results = {}
    
    result_rows = conn.execute(
        'SELECT * FROM evaluation_results ORDER BY created_at DESC'
    ).fetchall()
    
    for row in result_rows:
        result_id = row['id']
        
        rating_details = {}
        if row['rating_details']:
            try:
                rating_details = json.loads(row['rating_details'])
            except json.JSONDecodeError:
                rating_details = {}
        
        results[result_id] = {
            'id': result_id,
            'employee_id': row['employee_id'],
            'employee_name': row['employee_name'] or '未知员工',
            'employee_department': row['employee_department'] or '未知部门',
            'evaluator_name': row['evaluator_name'] or '匿名',
            'rating_details': rating_details,
            'created_at': row['created_at'],
            'status': row['status'],
            'source_id': row['source_id'],
            'source_name': row['source_name']
        }
    
    conn.close()
    return results

def get_evaluation_result_by_id(id):
    conn = get_db_connection()
    
    row = conn.execute(
        'SELECT * FROM evaluation_results WHERE id = ?',
        (id,)
    ).fetchone()
    
    if not row:
        conn.close()
        return None
    
    rating_details = {}
    if row['rating_details']:
        try:
            rating_details = json.loads(row['rating_details'])
        except json.JSONDecodeError:
            rating_details = {}
    
    result = {
        'id': row['id'],
        'employee_id': row['employee_id'],
        'employee_name': row['employee_name'] or '未知员工',
        'employee_department': row['employee_department'] or '未知部门',
        'evaluator_name': row['evaluator_name'] or '匿名',
        'rating_details': rating_details,
        'created_at': row['created_at'],
        'status': row['status'],
        'source_id': row['source_id'],
        'source_name': row['source_name']
    }
    
    conn.close()
    return result

def add_evaluation_result(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    employee_id = data.get('employee_id')
    employee_name = data.get('employee_name', '未知员工')
    employee_department = data.get('employee_department', '未知部门')
    evaluator_name = data.get('evaluator_name', '匿名')
    rating_details = json.dumps(data.get('rating_details', {}))
    created_at = data.get('created_at') or datetime.now().isoformat()
    status = data.get('status', 'completed')
    source_id = data.get('source_id')
    source_name = data.get('source_name')
    
    cursor.execute(
        '''INSERT INTO evaluation_results 
           (employee_id, employee_name, employee_department, evaluator_name, 
            rating_details, created_at, status, source_id, source_name) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (employee_id, employee_name, employee_department, evaluator_name,
         rating_details, created_at, status, source_id, source_name)
    )
    
    result_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return result_id

def batch_add_evaluation_results(results):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    added_count = 0
    for data in results:
        employee_id = data.get('employee_id')
        employee_name = data.get('employee_name', '未知员工')
        employee_department = data.get('employee_department', '未知部门')
        evaluator_name = data.get('evaluator_name', '匿名')
        rating_details = json.dumps(data.get('rating_details', {}))
        created_at = data.get('created_at') or datetime.now().isoformat()
        status = data.get('status', 'completed')
        source_id = data.get('source_id')
        source_name = data.get('source_name')
        
        cursor.execute(
            '''INSERT INTO evaluation_results 
               (employee_id, employee_name, employee_department, evaluator_name, 
                rating_details, created_at, status, source_id, source_name) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (employee_id, employee_name, employee_department, evaluator_name,
             rating_details, created_at, status, source_id, source_name)
        )
        
        added_count += 1
    
    conn.commit()
    conn.close()
    return added_count

def delete_evaluation_result(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM evaluation_results WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    return True

def clear_all_evaluation_results():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM evaluation_results')
    
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted_count

def clear_evaluation_results_by_filter(filter_type, filter_value):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if filter_type == 'date_range':
        start_date = filter_value.get('start_date')
        end_date = filter_value.get('end_date')
        cursor.execute(
            'DELETE FROM evaluation_results WHERE created_at >= ? AND created_at <= ?',
            (start_date, end_date)
        )
    elif filter_type == 'evaluator':
        cursor.execute(
            'DELETE FROM evaluation_results WHERE evaluator_name = ?',
            (filter_value,)
        )
    elif filter_type == 'employee_id':
        cursor.execute(
            'DELETE FROM evaluation_results WHERE employee_id = ?',
            (filter_value,)
        )
    else:
        conn.close()
        return 0
    
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted_count