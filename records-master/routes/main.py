from flask import Blueprint, render_template, jsonify, request, session, redirect, url_for, flash
from models import get_all_relations
from functools import wraps
import os

main_bp = Blueprint('main', __name__)

# 登录验证装饰器
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('main.login'))
        return f(*args, **kwargs)
    return decorated_function

@main_bp.route('/')
def index():
    return render_template('editor.html')

@main_bp.route('/admin')
@login_required
def admin():
    return render_template('index.html')

@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # 从环境变量获取管理员账号，如果没有设置则使用默认值
        admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        
        if username == admin_username and password == admin_password:
            session['logged_in'] = True
            session['username'] = username
            return redirect(url_for('main.admin'))
        else:
            flash('用户名或密码错误')
    
    return render_template('login.html')

@main_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.login'))

@main_bp.route('/mobile-editor')
def mobile_editor():
    return render_template('mobile-editor.html')

@main_bp.route('/mobile-test')
def mobile_test():
    return render_template('mobile-test.html')

@main_bp.route('/api/employee-rating-relations')
def list_relations():
    relations = get_all_relations()
    return jsonify(relations)