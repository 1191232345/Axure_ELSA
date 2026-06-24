import sqlite3
import logging
from contextlib import contextmanager
from config import Config

logger = logging.getLogger(__name__)

# 简单的连接池实现
_connection_pool = []
_pool_size = 5

def get_db_connection():
    """获取数据库连接（从连接池）"""
    global _connection_pool
    
    if _connection_pool:
        conn = _connection_pool.pop()
        try:
            # 测试连接是否有效
            conn.execute('SELECT 1')
            return conn
        except sqlite3.Error:
            # 连接已失效，创建新连接
            pass
    
    # 创建新连接
    conn = sqlite3.connect(Config.DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # 启用外键约束
    conn.execute('PRAGMA foreign_keys = ON')
    # 设置繁忙超时（5秒），避免并发写入时 database is locked
    conn.execute('PRAGMA busy_timeout = 5000')
    return conn

def return_db_connection(conn):
    """归还数据库连接到连接池"""
    global _connection_pool
    
    if len(_connection_pool) < _pool_size:
        try:
            # 测试连接是否有效
            conn.execute('SELECT 1')
            _connection_pool.append(conn)
        except sqlite3.Error:
            # 连接已失效，关闭它
            try:
                conn.close()
            except:
                pass
    else:
        # 连接池已满，关闭连接
        conn.close()

@contextmanager
def get_db_cursor():
    """数据库游标上下文管理器"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"数据库操作错误: {e}", exc_info=True)
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            return_db_connection(conn)

@contextmanager
def transaction():
    """事务上下文管理器"""
    conn = None
    try:
        conn = get_db_connection()
        conn.execute('BEGIN')
        yield conn
        conn.commit()
        logger.debug("事务提交成功")
    except Exception as e:
        if conn:
            conn.rollback()
            logger.error(f"事务回滚: {e}", exc_info=True)
        raise
    finally:
        if conn:
            return_db_connection(conn)

def clean_duplicate_relations():
    """清理员工-评分项关系表中的重复记录"""
    with get_db_cursor() as cursor:
        # 查找重复记录
        cursor.execute('''
            SELECT employee_id, rating_item_id, COUNT(*) as count
            FROM employee_rating_relations
            GROUP BY employee_id, rating_item_id
            HAVING count > 1
        ''')
        duplicates = cursor.fetchall()
        
        if duplicates:
            logger.info(f"发现 {len(duplicates)} 组重复记录，开始清理...")
            
            # 删除所有重复记录，然后重新插入一条
            for dup in duplicates:
                emp_id = dup['employee_id']
                rating_id = dup['rating_item_id']
                
                # 删除该员工-评分项的所有记录
                cursor.execute(
                    'DELETE FROM employee_rating_relations WHERE employee_id = ? AND rating_item_id = ?',
                    (emp_id, rating_id)
                )
                
                # 重新插入一条记录
                cursor.execute(
                    'INSERT INTO employee_rating_relations (employee_id, rating_item_id) VALUES (?, ?)',
                    (emp_id, rating_id)
                )
            
            logger.info("重复记录清理完成")
        else:
            logger.info("未发现重复记录")

def init_db():
    """初始化数据库"""
    with get_db_cursor() as cursor:
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
        
        # 添加新列（如果不存在）
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
        
        # 创建索引
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
        
        # 创建公告表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                type TEXT DEFAULT 'info',
                enabled INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建公告索引
        try:
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_announcements_enabled ON announcements(enabled)')
        except sqlite3.OperationalError:
            pass
        
        # 添加示例公告（如果表为空）
        try:
            count = cursor.execute('SELECT COUNT(*) FROM announcements').fetchone()[0]
            if count == 0:
                from datetime import datetime
                now = datetime.now().isoformat()
                cursor.execute('''
                    INSERT INTO announcements (title, content, type, enabled, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', ('系统功能更新', '1. 评价结果页面搜索条件布局已优化，与其他页面保持一致\n2. 新增公告弹窗功能，页面加载时自动显示重要通知\n3. 支持手动查看公告及"不再提示"选项', 'info', 1, now, now))
                cursor.execute('''
                    INSERT INTO announcements (title, content, type, enabled, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', ('使用提示', '请在评价完成后及时保存数据，避免数据丢失。如有问题请联系管理员。', 'warning', 1, now, now))
                logger.info("已添加系统公告数据")
        except sqlite3.OperationalError as e:
            logger.warning(f"添加公告失败: {e}")
    
    # 清理重复记录
    clean_duplicate_relations()
    
    logger.info("数据库初始化完成")