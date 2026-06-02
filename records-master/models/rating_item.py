from models.db import get_db_connection

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
    
    cursor.execute('DELETE FROM employee_rating_relations WHERE rating_item_id = ?', (id,))
    cursor.execute('DELETE FROM rating_items WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    return True

def batch_delete_rating_items(ids):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    deleted_count = 0
    for id in ids:
        cursor.execute('DELETE FROM employee_rating_relations WHERE rating_item_id = ?', (id,))
        cursor.execute('DELETE FROM rating_items WHERE id = ?', (id,))
        deleted_count += 1
    
    conn.commit()
    conn.close()
    return deleted_count

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