import sqlite3
import os
from config import DATABASE_PATH

def migrate_intent_tables():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS intent_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            confidence_threshold REAL DEFAULT 0.7,
            priority INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS intent_samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            sample_text TEXT NOT NULL,
            embedding_vector BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES intent_categories(id) ON DELETE CASCADE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS intent_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_key TEXT NOT NULL UNIQUE,
            config_value TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS intent_recognition_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_text TEXT NOT NULL,
            recognized_intent_id INTEGER,
            confidence_score REAL,
            all_intents_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (recognized_intent_id) REFERENCES intent_categories(id)
        )
    ''')
    
    default_configs = [
        ('global_confidence_threshold', '0.7', '全局置信度阈值'),
        ('embedding_model', 'BAAI/bge-m3', 'Embedding 模型名称'),
        ('max_intent_results', '5', '返回的最大意图数量')
    ]
    
    for config_key, config_value, description in default_configs:
        cursor.execute('''
            INSERT OR IGNORE INTO intent_config (config_key, config_value, description)
            VALUES (?, ?, ?)
        ''', (config_key, config_value, description))
    
    conn.commit()
    conn.close()
    print("意图识别数据库表创建成功")

if __name__ == '__main__':
    migrate_intent_tables()