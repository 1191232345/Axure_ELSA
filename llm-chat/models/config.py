import sqlite3
from config import DATABASE_PATH
from datetime import datetime

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_configs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM model_configs ORDER BY created_at DESC')
    configs = cursor.fetchall()
    conn.close()
    return [dict(config) for config in configs]

def get_config_by_id(config_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM model_configs WHERE id = ?', (config_id,))
    config = cursor.fetchone()
    conn.close()
    return dict(config) if config else None

def get_default_config():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM model_configs WHERE is_default = 1 LIMIT 1')
    config = cursor.fetchone()
    conn.close()
    return dict(config) if config else None

def create_config(provider, api_key, base_url, model_name, temperature=0.7, max_tokens=2000, is_default=False):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if is_default:
        cursor.execute('UPDATE model_configs SET is_default = 0')
    
    cursor.execute('''
        INSERT INTO model_configs (provider, api_key, base_url, model_name, temperature, max_tokens, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (provider, api_key, base_url, model_name, temperature, max_tokens, is_default))
    
    config_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return config_id

def update_config(config_id, provider, api_key, base_url, model_name, temperature, max_tokens, is_default):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if is_default:
        cursor.execute('UPDATE model_configs SET is_default = 0')
    
    cursor.execute('''
        UPDATE model_configs 
        SET provider = ?, api_key = ?, base_url = ?, model_name = ?, 
            temperature = ?, max_tokens = ?, is_default = ?, updated_at = ?
        WHERE id = ?
    ''', (provider, api_key, base_url, model_name, temperature, max_tokens, is_default, datetime.now(), config_id))
    
    conn.commit()
    conn.close()

def delete_config(config_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM model_configs WHERE id = ?', (config_id,))
    conn.commit()
    conn.close()