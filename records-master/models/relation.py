from models.db import get_db_connection

def get_all_relations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM employee_rating_relations')
    rows = cursor.fetchall()
    conn.close()
    
    relations = {}
    for row in rows:
        emp_id = row['employee_id']
        if emp_id not in relations:
            relations[emp_id] = []
        # 确保不重复添加同一个评分项
        rating_item_id = row['rating_item_id']
        if rating_item_id not in relations[emp_id]:
            relations[emp_id].append(rating_item_id)
    return relations

def get_relations_for_employee(employee_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT DISTINCT rating_item_id FROM employee_rating_relations WHERE employee_id = ?',
        (employee_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [row['rating_item_id'] for row in rows]

def get_employees_for_rating_item(rating_item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT DISTINCT employee_id FROM employee_rating_relations WHERE rating_item_id = ?',
        (rating_item_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [row['employee_id'] for row in rows]

def set_relations_for_employee(employee_id, rating_item_ids):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (employee_id,))
    
    # 去重后再插入
    unique_rating_items = list(set(rating_item_ids))
    for rating_item_id in unique_rating_items:
        cursor.execute(
            'INSERT INTO employee_rating_relations (employee_id, rating_item_id) VALUES (?, ?)',
            (employee_id, rating_item_id)
        )
    
    conn.commit()
    conn.close()
    return True