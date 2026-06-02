from flask import Blueprint, render_template, jsonify
from models import get_all_relations

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return render_template('editor.html')

@main_bp.route('/admin')
def admin():
    return render_template('index.html')

@main_bp.route('/login')
def login():
    return render_template('login.html')

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