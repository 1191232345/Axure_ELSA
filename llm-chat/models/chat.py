import sqlite3
from config import DATABASE_PATH
from datetime import datetime

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_conversations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, mc.provider, mc.model_name 
        FROM conversations c 
        LEFT JOIN model_configs mc ON c.model_config_id = mc.id
        ORDER BY c.updated_at DESC
    ''')
    conversations = cursor.fetchall()
    conn.close()
    return [dict(conv) for conv in conversations]

def get_conversation_by_id(conversation_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, mc.provider, mc.model_name 
        FROM conversations c 
        LEFT JOIN model_configs mc ON c.model_config_id = mc.id
        WHERE c.id = ?
    ''', (conversation_id,))
    conversation = cursor.fetchone()
    conn.close()
    return dict(conversation) if conversation else None

def create_conversation(title, model_config_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO conversations (title, model_config_id)
        VALUES (?, ?)
    ''', (title, model_config_id))
    conversation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return conversation_id

def update_conversation_title(conversation_id, title):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?
    ''', (title, datetime.now(), conversation_id))
    conn.commit()
    conn.close()

def delete_conversation(conversation_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM messages WHERE conversation_id = ?', (conversation_id,))
    cursor.execute('DELETE FROM conversations WHERE id = ?', (conversation_id,))
    conn.commit()
    conn.close()

def get_messages_by_conversation(conversation_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC
    ''', (conversation_id,))
    messages = cursor.fetchall()
    conn.close()
    return [dict(msg) for msg in messages]

def add_message(conversation_id, role, content):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (conversation_id, role, content)
        VALUES (?, ?, ?)
    ''', (conversation_id, role, content))
    message_id = cursor.lastrowid
    
    cursor.execute('''
        UPDATE conversations SET updated_at = ? WHERE id = ?
    ''', (datetime.now(), conversation_id))
    
    conn.commit()
    conn.close()
    return message_id

def delete_messages(conversation_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM messages WHERE conversation_id = ?', (conversation_id,))
    conn.commit()
    conn.close()