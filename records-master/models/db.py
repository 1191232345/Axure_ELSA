import sqlite3
from config import DATABASE_PATH

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            enabled INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            enabled INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            department TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rating_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            enabled INTEGER DEFAULT 1
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employee_rating_relations (
            employee_id TEXT,
            rating_item_id INTEGER,
            PRIMARY KEY (employee_id, rating_item_id),
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            FOREIGN KEY (rating_item_id) REFERENCES rating_items(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS evaluation_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT,
            employee_name TEXT,
            employee_department TEXT,
            evaluator_name TEXT,
            rating_details TEXT,
            created_at TEXT,
            status TEXT,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )
    ''')
    
    try:
        cursor.execute('ALTER TABLE employees ADD COLUMN department_id INTEGER')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE evaluation_results ADD COLUMN source_id INTEGER')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE evaluation_results ADD COLUMN source_name TEXT')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_departments_enabled ON departments(enabled)')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_departments_sort ON departments(sort_order)')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sources_enabled ON sources(enabled)')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sources_sort ON sources(sort_order)')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id)')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_evaluation_source ON evaluation_results(source_id)')
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()