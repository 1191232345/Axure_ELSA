import sqlite3
import json
import numpy as np
from config import DATABASE_PATH
from datetime import datetime

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_intent_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ic.*, 
               (SELECT COUNT(*) FROM intent_samples WHERE category_id = ic.id) as sample_count
        FROM intent_categories ic
        ORDER BY ic.priority DESC, ic.created_at DESC
    ''')
    categories = cursor.fetchall()
    conn.close()
    return [dict(cat) for cat in categories]

def get_intent_category_by_id(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ic.*, 
               (SELECT COUNT(*) FROM intent_samples WHERE category_id = ic.id) as sample_count
        FROM intent_categories ic
        WHERE ic.id = ?
    ''', (category_id,))
    category = cursor.fetchone()
    conn.close()
    return dict(category) if category else None

def create_intent_category(name, description=None, confidence_threshold=0.7, priority=0, is_active=True):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO intent_categories (name, description, confidence_threshold, priority, is_active)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, description, confidence_threshold, priority, is_active))
    category_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return category_id

def update_intent_category(category_id, name, description=None, confidence_threshold=0.7, priority=0, is_active=True):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE intent_categories 
        SET name = ?, description = ?, confidence_threshold = ?, priority = ?, is_active = ?, updated_at = ?
        WHERE id = ?
    ''', (name, description, confidence_threshold, priority, is_active, datetime.now(), category_id))
    conn.commit()
    conn.close()

def delete_intent_category(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM intent_samples WHERE category_id = ?', (category_id,))
    cursor.execute('DELETE FROM intent_categories WHERE id = ?', (category_id,))
    conn.commit()
    conn.close()

def get_samples_by_category(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM intent_samples WHERE category_id = ? ORDER BY created_at DESC
    ''', (category_id,))
    samples = cursor.fetchall()
    conn.close()
    return [dict(sample) for sample in samples]

def get_all_active_samples():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT is.*, ic.name as category_name, ic.confidence_threshold as category_threshold
        FROM intent_samples is
        JOIN intent_categories ic ON is.category_id = ic.id
        WHERE ic.is_active = 1
        ORDER BY ic.priority DESC, is.created_at DESC
    ''')
    samples = cursor.fetchall()
    conn.close()
    return [dict(sample) for sample in samples]

def create_intent_sample(category_id, sample_text, embedding_vector=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    embedding_blob = None
    if embedding_vector is not None:
        embedding_blob = np.array(embedding_vector).tobytes()
    
    cursor.execute('''
        INSERT INTO intent_samples (category_id, sample_text, embedding_vector)
        VALUES (?, ?, ?)
    ''', (category_id, sample_text, embedding_blob))
    sample_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return sample_id

def update_intent_sample(sample_id, sample_text, embedding_vector=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    embedding_blob = None
    if embedding_vector is not None:
        embedding_blob = np.array(embedding_vector).tobytes()
    
    cursor.execute('''
        UPDATE intent_samples 
        SET sample_text = ?, embedding_vector = ?, updated_at = ?
        WHERE id = ?
    ''', (sample_text, embedding_blob, datetime.now(), sample_id))
    conn.commit()
    conn.close()

def delete_intent_sample(sample_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM intent_samples WHERE id = ?', (sample_id,))
    conn.commit()
    conn.close()

def get_sample_embedding(sample_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT embedding_vector FROM intent_samples WHERE id = ?', (sample_id,))
    result = cursor.fetchone()
    conn.close()
    
    if result and result['embedding_vector']:
        return np.frombuffer(result['embedding_vector'], dtype=np.float32)
    return None

def get_intent_config(config_key):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM intent_config WHERE config_key = ?', (config_key,))
    config = cursor.fetchone()
    conn.close()
    return dict(config) if config else None

def get_all_intent_configs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM intent_config')
    configs = cursor.fetchall()
    conn.close()
    return {config['config_key']: config['config_value'] for config in configs}

def update_intent_config(config_key, config_value):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE intent_config 
        SET config_value = ?, updated_at = ?
        WHERE config_key = ?
    ''', (config_value, datetime.now(), config_key))
    conn.commit()
    conn.close()

def create_intent_recognition_log(input_text, recognized_intent_id, confidence_score, all_intents):
    conn = get_db_connection()
    cursor = conn.cursor()
    all_intents_json = json.dumps(all_intents)
    cursor.execute('''
        INSERT INTO intent_recognition_logs 
        (input_text, recognized_intent_id, confidence_score, all_intents_json)
        VALUES (?, ?, ?, ?)
    ''', (input_text, recognized_intent_id, confidence_score, all_intents_json))
    log_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return log_id

def get_recognition_logs(limit=100):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT irl.*, ic.name as intent_name
        FROM intent_recognition_logs irl
        LEFT JOIN intent_categories ic ON irl.recognized_intent_id = ic.id
        ORDER BY irl.created_at DESC
        LIMIT ?
    ''', (limit,))
    logs = cursor.fetchall()
    conn.close()
    return [dict(log) for log in logs]