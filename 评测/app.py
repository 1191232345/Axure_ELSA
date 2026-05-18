from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from functools import wraps
from flask_cors import CORS
import os
import sqlite3
import json
from datetime import datetime
import hashlib
import uuid

app = Flask(__name__)
# 启用CORS支持所有路由
CORS(app)

# SQLite数据库文件（使用绝对路径）
import os
# 修改为正确的路径，数据库文件在当前目录的db子文件夹中
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'db', 'performance_data.db')

# 设置Flask应用的密钥，用于session加密
app.secret_key = os.urandom(24)

# 数据库连接函数
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    # 启用外键约束
    conn.execute('PRAGMA foreign_keys = ON;')
    return conn

# 确保templates文件夹存在
if not os.path.exists('templates'):
    os.makedirs('templates')

# 初始化数据库
def init_data():
    # 首先检查数据库文件是否存在
    db_exists = os.path.exists(DB_FILE)
    print(f"数据库文件检查: {DB_FILE} - {'存在' if db_exists else '不存在'}")
    
    # 如果数据库文件不存在，创建数据库和表
    if not db_exists:
        print("数据库文件不存在，开始创建数据库...")
        # 确保db目录存在
        db_dir = os.path.dirname(DB_FILE)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
            print(f"创建数据库目录: {db_dir}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 创建employees表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS employees (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                department TEXT NOT NULL
            )
        ''')
        
        # 创建rating_items表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rating_items (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                enabled INTEGER NOT NULL DEFAULT 1
            )
        ''')
        
        # 创建employee_rating_relations表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS employee_rating_relations (
                employee_id TEXT,
                rating_item_id TEXT,
                PRIMARY KEY (employee_id, rating_item_id),
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                FOREIGN KEY (rating_item_id) REFERENCES rating_items(id) ON DELETE CASCADE
            )
        ''')
        
        # 创建evaluation_results表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS evaluation_results (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                evaluator TEXT NOT NULL,
                date TEXT NOT NULL,
                overall_comment TEXT DEFAULT '',
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
            )
        ''')
        
        # 创建evaluation_ratings表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS evaluation_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evaluation_id TEXT NOT NULL,
                item_id TEXT NOT NULL,
                score REAL NOT NULL,
                comment TEXT DEFAULT '',
                FOREIGN KEY (evaluation_id) REFERENCES evaluation_results(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES rating_items(id) ON DELETE CASCADE
            )
        ''')
        
        # 创建users表（用于登录系统）
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        
        # 插入默认管理员用户（用户名：admin，密码：admin123）
        # 注意：在实际生产环境中，应该使用更安全的密码策略
        cursor.execute('SELECT COUNT(*) FROM users')
        if cursor.fetchone()[0] == 0:
            hashed_password = hashlib.sha256('admin123'.encode()).hexdigest()
            cursor.execute(
                'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)',
                ('admin', hashed_password, datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            )
        
        # 如果存在JSON数据文件，导入数据
        DATA_FILE = 'performance_data.json'
        if os.path.exists(DATA_FILE):
            print("正在从JSON文件导入数据到SQLite数据库...")
            try:
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    json_data = json.load(f)
                    
                    # 打印JSON数据的结构信息，用于调试
                    print(f"JSON数据结构: {json_data.keys()}")
                    print(f"员工数量: {len(json_data.get('employees', {}))}")
                    print(f"评分项数量: {len(json_data.get('rating_items', {}))}")
                    print(f"评价结果数量: {len(json_data.get('evaluation_results', {}))}")
                    
                    # 禁用外键约束以避免导入顺序问题
                    cursor.execute('PRAGMA foreign_keys = OFF')
                    
                    # 导入员工数据
                    print("开始导入员工数据...")
                    for emp_id, emp_data in json_data.get('employees', {}).items():
                        print(f"插入员工: {emp_id} - {emp_data['name']}")
                        cursor.execute('''
                            INSERT INTO employees (id, name, department)
                            VALUES (?, ?, ?)
                        ''', (emp_id, emp_data['name'], emp_data['department']))
                    
                    # 导入评分项数据
                    print("开始导入评分项数据...")
                    for item_id, item_data in json_data.get('rating_items', {}).items():
                        print(f"插入评分项: {item_id} - {item_data['name']}")
                        cursor.execute('''
                            INSERT INTO rating_items (id, name, description, enabled)
                            VALUES (?, ?, ?, ?)
                        ''', (item_id, item_data['name'], item_data['description'], 
                              1 if item_data['enabled'] else 0))
                    
                    # 导入员工评分关联关系
                    print("开始导入员工评分关联关系...")
                    for emp_id, item_ids in json_data.get('employee_rating_relations', {}).items():
                        for item_id in item_ids:
                            print(f"插入关联关系: 员工{emp_id} - 评分项{item_id}")
                            cursor.execute('''
                                INSERT INTO employee_rating_relations (employee_id, rating_item_id)
                                VALUES (?, ?)
                            ''', (emp_id, item_id))
                    
                    # 导入评价结果数据
                    print("开始导入评价结果数据...")
                    for result_id, result_data in json_data.get('evaluation_results', {}).items():
                        print(f"插入评价结果: {result_id} - 员工{result_data['employee_id']}")
                        # 插入评价结果
                        cursor.execute('''
                            INSERT INTO evaluation_results (id, employee_id, evaluator, date, overall_comment)
                            VALUES (?, ?, ?, ?, ?)
                        ''', (result_id, result_data['employee_id'], result_data['evaluator'], 
                              result_data['date'], result_data.get('overall_comment', '')))
                        
                        # 插入评分项
                        for rating in result_data.get('ratings', []):
                            print(f"  插入评分: {rating['item_id']} - {rating['score']}")
                            cursor.execute('''
                                INSERT INTO evaluation_ratings (evaluation_id, item_id, score, comment)
                                VALUES (?, ?, ?, ?)
                            ''', (result_id, rating['item_id'], rating['score'], rating.get('comment', '')))
                    
                    # 重新启用外键约束
                    cursor.execute('PRAGMA foreign_keys = ON')
                    
                    # 提交更改
                    conn.commit()
                    print("数据导入完成！")
                    
                    # 验证数据导入结果
                    cursor.execute('SELECT COUNT(*) FROM employees')
                    emp_count = cursor.fetchone()[0]
                    cursor.execute('SELECT COUNT(*) FROM rating_items')
                    item_count = cursor.fetchone()[0]
                    cursor.execute('SELECT COUNT(*) FROM evaluation_results')
                    result_count = cursor.fetchone()[0]
                    print(f"导入结果统计: 员工{emp_count}人, 评分项{item_count}个, 评价结果{result_count}条")
            except Exception as e:
                print(f"数据导入失败: {e}")
                import traceback
                traceback.print_exc()
                conn.rollback()
            finally:
                # 确保重新启用外键约束
                cursor.execute('PRAGMA foreign_keys = ON')
        
            # 关闭连接
        conn.close()
        print("数据库创建和初始化完成")
    else:
        print("数据库文件已存在，跳过初始化步骤")

# 加载员工数据
def load_employees():
    conn = get_db_connection()
    employees = {}
    for row in conn.execute('SELECT id, name, department FROM employees'):
        employees[row['id']] = {
            'name': row['name'],
            'department': row['department']
        }
    conn.close()
    return employees

# 加载评分项数据
def load_rating_items():
    conn = get_db_connection()
    rating_items = {}
    for row in conn.execute('SELECT id, name, description, enabled FROM rating_items'):
        rating_items[row['id']] = {
            'name': row['name'],
            'description': row['description'],
            'enabled': bool(row['enabled'])
        }
    conn.close()
    return rating_items

# 加载员工评分关联关系
def load_employee_rating_relations():
    conn = get_db_connection()
    relations = {}
    for row in conn.execute('SELECT employee_id, rating_item_id FROM employee_rating_relations'):
        if row['employee_id'] not in relations:
            relations[row['employee_id']] = []
        relations[row['employee_id']].append(row['rating_item_id'])
    conn.close()
    return relations

# 加载评价结果数据
def load_evaluation_results():
    conn = get_db_connection()
    results = {}
    
    # 先获取所有评价结果
    result_rows = conn.execute('SELECT id, employee_id, evaluator, date, overall_comment FROM evaluation_results').fetchall()
    
    for row in result_rows:
        result_id = row['id']
        # 获取该评价结果的所有评分项
        ratings = []
        for rating_row in conn.execute('''
            SELECT item_id, score, comment FROM evaluation_ratings WHERE evaluation_id = ?
        ''', (result_id,)):
            ratings.append({
                'item_id': rating_row['item_id'],
                'score': rating_row['score'],
                'comment': rating_row['comment']
            })
        
        results[result_id] = {
            'employee_id': row['employee_id'],
            'evaluator': row['evaluator'],
            'date': row['date'],
            'ratings': ratings,
            'overall_comment': row['overall_comment']
        }
    
    conn.close()
    return results

# 认证装饰器：检查用户是否已登录
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # 如果用户未登录，重定向到登录页面
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

# 登录页面路由
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # 连接数据库验证用户
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, password FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()
        
        # 验证密码
        if user and hashlib.sha256(password.encode()).hexdigest() == user['password']:
            # 登录成功，设置session
            session['user_id'] = user['id']
            session['username'] = username
            
            # 如果有next参数，重定向到next指定的URL，否则重定向到首页
            next_url = request.args.get('next')
            return redirect(next_url or url_for('index'))
        else:
            # 登录失败，显示错误消息
            return render_template('login.html', error='用户名或密码错误')
    
    # GET请求，显示登录页面
    return render_template('login.html')

# 登出路由
@app.route('/logout')
def logout():
    # 清除session
    session.clear()
    return redirect(url_for('login'))

# 首页 - 重定向到编辑器页面
@app.route('/')
def home():
    # 首页直接重定向到编辑器页面
    return redirect(url_for('editor'))

# 首页 - 需要登录才能访问
@app.route('/index')
@login_required
def index():
    employees = load_employees()
    rating_items = load_rating_items()
    relations = load_employee_rating_relations()
    return render_template('index.html', 
                          employees=employees,
                          rating_items=rating_items,
                          relations=relations)

# 编辑器页面 - 无需登录即可访问
@app.route('/editor')
def editor():
    employees = load_employees()
    rating_items = load_rating_items()
    relations = load_employee_rating_relations()
    return render_template('editor.html', 
                          employees=employees,
                          rating_items=rating_items,
                          relations=relations)

# 获取员工列表 - 无需登录即可访问
@app.route('/api/employees')
def get_employees():
    employees = load_employees()
    return jsonify(employees)

# 获取评分项列表 - 无需登录即可访问
@app.route('/api/rating-items')
def get_rating_items():
    rating_items = load_rating_items()
    return jsonify(rating_items)

# 获取评价结果 - 无需登录即可访问
@app.route('/api/evaluation-results')
def get_evaluation_results():
    evaluation_results = load_evaluation_results()
    return jsonify(evaluation_results)

# 获取员工-评分项关联关系 - 无需登录即可访问
@app.route('/api/employee-rating-relations')
def get_employee_rating_relations():
    relations = load_employee_rating_relations()
    return jsonify(relations)

# 删除单条评价结果 - 无需登录即可访问
@app.route('/api/evaluation-results/<id>', methods=['DELETE'])
def delete_evaluation_result(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查评价结果是否存在
    cursor.execute('SELECT id FROM evaluation_results WHERE id = ?', (id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'success': False, 'error': '评价结果不存在'}), 404
    
    # 删除评价结果（关联的评分项会通过外键约束自动删除）
    cursor.execute('DELETE FROM evaluation_results WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# 批量提交评价结果 - 无需登录即可访问
@app.route('/api/evaluation-results/batch', methods=['POST'])
def create_evaluation_results_batch():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 获取请求数据
        evaluations = request.get_json()
        
        # 检查数据是否为空
        if not evaluations or not isinstance(evaluations, list):
            return jsonify({'success': False, 'error': '无效的请求数据'}), 400
        
        # 处理每个评价结果
        for eval_data in evaluations:
            # 生成唯一ID
            eval_id = str(uuid.uuid4())
            
            # 插入evaluation_results表
            cursor.execute('''
                INSERT INTO evaluation_results (id, employee_id, evaluator, date, overall_comment)
                VALUES (?, ?, ?, ?, ?)
            ''', (eval_id, eval_data['employee_id'], eval_data['evaluator_name'], eval_data['created_at'], ''))
            
            # 插入evaluation_ratings表
            for rating_id, rating_info in eval_data['rating_details'].items():
                cursor.execute('''
                    INSERT INTO evaluation_ratings (evaluation_id, item_id, score, comment)
                    VALUES (?, ?, ?, ?)
                ''', (eval_id, rating_id, rating_info['score'], rating_info['comment']))
        
        # 提交事务
        conn.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        # 回滚事务
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# 清除评价结果 - 无需登录即可访问
@app.route('/api/evaluation-results/clear', methods=['POST'])
def clear_evaluation_results():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': '无效的请求数据'}), 400
        
        clear_type = data.get('type', 'all')
        deleted_count = 0
        
        if clear_type == 'date_range':
            # 按日期范围清除
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            
            if not start_date or not end_date:
                conn.close()
                return jsonify({'success': False, 'error': '请提供日期范围'}), 400
            
            # 查找符合日期范围的所有评价结果ID并删除（关联的评分项会通过外键约束自动删除）
            cursor.execute('''
                DELETE FROM evaluation_results 
                WHERE date >= ? AND date <= ?
            ''', (start_date, end_date))
            deleted_count = cursor.rowcount
            
        elif clear_type == 'evaluator':
            # 按评价人清除
            evaluator = data.get('evaluator')
            
            if not evaluator:
                conn.close()
                return jsonify({'success': False, 'error': '请提供评价人姓名'}), 400
            
            # 删除符合评价人的所有评价结果（关联的评分项会通过外键约束自动删除）
            cursor.execute('''
                DELETE FROM evaluation_results 
                WHERE evaluator = ?
            ''', (evaluator,))
            deleted_count = cursor.rowcount
                
        elif clear_type == 'employee_id':
            # 按员工ID清除
            employee_id = data.get('employee_id')
            
            if not employee_id:
                conn.close()
                return jsonify({'success': False, 'error': '请提供员工ID'}), 400
            
            # 删除符合员工ID的所有评价结果（关联的评分项会通过外键约束自动删除）
            cursor.execute('''
                DELETE FROM evaluation_results 
                WHERE employee_id = ?
            ''', (employee_id,))
            deleted_count = cursor.rowcount
                
        else:
            # 清除所有评价结果
            cursor.execute('SELECT COUNT(*) FROM evaluation_results')
            deleted_count = cursor.fetchone()[0]
            
            # 删除所有评价结果（关联的评分项会通过外键约束自动删除）
            cursor.execute('DELETE FROM evaluation_results')
        
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'deleted_count': deleted_count})
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

# 添加员工
@app.route('/api/employees', methods=['POST'])
def add_employee():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 获取当前最大的员工ID
    max_id_row = cursor.execute('SELECT MAX(CAST(id AS INTEGER)) FROM employees').fetchone()
    current_max_id = max_id_row[0] if max_id_row[0] is not None else 0
    new_id = str(current_max_id + 1)
    
    # 插入员工信息
    cursor.execute('''
        INSERT INTO employees (id, name, department)
        VALUES (?, ?, ?)
    ''', (new_id, request.json['name'], request.json['department']))
    
    # 插入员工评分项关联
    for rating_item_id in request.json['rating_items']:
        cursor.execute('''
            INSERT INTO employee_rating_relations (employee_id, rating_item_id)
            VALUES (?, ?)
        ''', (new_id, rating_item_id))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': new_id})

# 更新员工
@app.route('/api/employees/<id>', methods=['PUT'])
def update_employee(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查员工是否存在
    cursor.execute('SELECT id FROM employees WHERE id = ?', (id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'success': False, 'error': '员工不存在'}), 404
    
    # 更新员工信息
    cursor.execute('''
        UPDATE employees
        SET name = ?, department = ?
        WHERE id = ?
    ''', (request.json['name'], request.json['department'], id))
    
    # 删除旧的关联关系
    cursor.execute('''
        DELETE FROM employee_rating_relations
        WHERE employee_id = ?
    ''', (id,))
    
    # 插入新的关联关系
    for rating_item_id in request.json['rating_items']:
        cursor.execute('''
            INSERT INTO employee_rating_relations (employee_id, rating_item_id)
            VALUES (?, ?)
        ''', (id, rating_item_id))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# 删除员工
@app.route('/api/employees/<id>', methods=['DELETE'])
def delete_employee(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查员工是否存在
    cursor.execute('SELECT id FROM employees WHERE id = ?', (id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'success': False, 'error': '员工不存在'}), 404
    
    # 删除员工信息（关联的评价结果、评分关联会通过外键约束自动删除）
    cursor.execute('DELETE FROM employees WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# 批量删除员工 - 无需登录即可访问
@app.route('/api/employees/batch-delete', methods=['POST'])
def batch_delete_employees():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        if not data or 'ids' not in data:
            conn.close()
            return jsonify({'success': False, 'error': '无效的请求数据'}), 400
        
        ids = data.get('ids', [])
        if not isinstance(ids, list) or len(ids) == 0:
            conn.close()
            return jsonify({'success': False, 'error': '请提供要删除的员工ID列表'}), 400
        
        deleted_count = 0
        errors = []
        
        # 逐个删除员工
        for employee_id in ids:
            try:
                # 检查员工是否存在
                cursor.execute('SELECT id FROM employees WHERE id = ?', (employee_id,))
                if cursor.fetchone() is None:
                    errors.append({'id': employee_id, 'error': '员工不存在'})
                    continue
                
                # 删除员工信息（关联的评价结果、评分关联会通过外键约束自动删除）
                cursor.execute('DELETE FROM employees WHERE id = ?', (employee_id,))
                deleted_count += 1
            except Exception as e:
                errors.append({'id': employee_id, 'error': str(e)})
        
        conn.commit()
        conn.close()
        
        result = {'success': True, 'deleted_count': deleted_count}
        if errors:
            result['errors'] = errors
        
        return jsonify(result)
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

# 添加评分项
@app.route('/api/rating-items', methods=['POST'])
def add_rating_item():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 获取当前最大的评分项ID
    max_id_row = cursor.execute('SELECT MAX(CAST(id AS INTEGER)) FROM rating_items').fetchone()
    current_max_id = max_id_row[0] if max_id_row[0] is not None else 0
    new_id = str(current_max_id + 1)
    
    # 插入评分项
    cursor.execute('''
        INSERT INTO rating_items (id, name, description, enabled)
        VALUES (?, ?, ?, ?)
    ''', (new_id, request.json['name'], request.json['description'], 
          1 if request.json['enabled'] else 0))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': new_id})

# 更新评分项
@app.route('/api/rating-items/<id>', methods=['PUT'])
def update_rating_item(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查评分项是否存在
    cursor.execute('SELECT id FROM rating_items WHERE id = ?', (id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'success': False, 'error': '评分项不存在'}), 404
    
    # 更新评分项
    cursor.execute('''
        UPDATE rating_items
        SET name = ?, description = ?, enabled = ?
        WHERE id = ?
    ''', (request.json['name'], request.json['description'], 
          1 if request.json['enabled'] else 0, id))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# 删除评分项
@app.route('/api/rating-items/<id>', methods=['DELETE'])
def delete_rating_item(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查评分项是否存在
    cursor.execute('SELECT id FROM rating_items WHERE id = ?', (id,))
    if cursor.fetchone() is None:
        conn.close()
        return jsonify({'success': False, 'error': '评分项不存在'}), 404
    
    # 删除评分项（关联的数据会通过外键约束自动删除）
    cursor.execute('DELETE FROM rating_items WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# 批量删除评分项 - 无需登录即可访问
@app.route('/api/rating-items/batch-delete', methods=['POST'])
def batch_delete_rating_items():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        if not data or 'ids' not in data:
            conn.close()
            return jsonify({'success': False, 'error': '无效的请求数据'}), 400
        
        ids = data.get('ids', [])
        if not isinstance(ids, list) or len(ids) == 0:
            conn.close()
            return jsonify({'success': False, 'error': '请提供要删除的评分项ID列表'}), 400
        
        deleted_count = 0
        errors = []
        
        # 逐个删除评分项
        for item_id in ids:
            try:
                # 检查评分项是否存在
                cursor.execute('SELECT id FROM rating_items WHERE id = ?', (item_id,))
                if cursor.fetchone() is None:
                    errors.append({'id': item_id, 'error': '评分项不存在'})
                    continue
                
                # 删除评分项（关联的数据会通过外键约束自动删除）
                cursor.execute('DELETE FROM rating_items WHERE id = ?', (item_id,))
                deleted_count += 1
            except Exception as e:
                errors.append({'id': item_id, 'error': str(e)})
        
        conn.commit()
        conn.close()
        
        result = {'success': True, 'deleted_count': deleted_count}
        if errors:
            result['errors'] = errors
        
        return jsonify(result)
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

# 处理/@vite/client请求的路由，解决404错误
@app.route('/@vite/client')
def vite_client():
    return '', 204



if __name__ == '__main__':
    init_data()
    # 创建templates文件夹
    if not os.path.exists('templates'):
        os.makedirs('templates')

    # 使用0.0.0.0允许从任何地址访问
    app.run(debug=True, host='0.0.0.0', port=5002)