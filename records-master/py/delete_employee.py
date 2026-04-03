#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
删除被评人脚本
功能：提供多种选项删除绩效评估系统中的被评人数据
"""

import os
import sys
import sqlite3
import argparse
import shutil
from datetime import datetime

# 数据库文件路径
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'performance_data.db')

# 获取数据库连接
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# 检查数据库文件是否存在
def check_db_file():
    if not os.path.exists(DB_FILE):
        print(f"错误: 数据库文件 '{DB_FILE}' 不存在")
        sys.exit(1)

# 显示员工信息
def show_employee_info(conn, employee_id=None, name=None, department=None):
    cursor = conn.cursor()
    query = 'SELECT * FROM employees WHERE 1=1'
    params = []
    
    if employee_id:
        query += ' AND id = ?'
        params.append(employee_id)
    if name:
        query += ' AND name = ?'
        params.append(name)
    if department:
        query += ' AND department = ?'
        params.append(department)
    
    cursor.execute(query, params)
    employees = cursor.fetchall()
    
    if not employees:
        print("未找到符合条件的员工")
        return []
    
    print("\n找到以下员工:")
    print("+------+--------+------------+")
    print("| ID   | 姓名   | 部门       |")
    print("+------+--------+------------+")
    
    for emp in employees:
        print(f"| {emp['id']:<4} | {emp['name']:<6} | {emp['department']:<10} |")
    
    print("+------+--------+------------+")
    return employees

# 根据ID删除员工
def delete_employee_by_id(conn, employee_id):
    cursor = conn.cursor()
    
    # 检查员工是否存在
    cursor.execute('SELECT * FROM employees WHERE id = ?', (employee_id,))
    employee = cursor.fetchone()
    
    if not employee:
        print(f"错误: 未找到ID为 '{employee_id}' 的员工")
        return 0
    
    # 显示员工信息
    print(f"\n即将删除的员工信息:")
    print(f"ID: {employee['id']}")
    print(f"姓名: {employee['name']}")
    print(f"部门: {employee['department']}")
    
    # 获取相关评价记录数量
    cursor.execute('SELECT COUNT(*) FROM evaluation_results WHERE employee_id = ?', (employee_id,))
    related_results = cursor.fetchone()[0]
    
    if related_results > 0:
        print(f"警告: 该员工有 {related_results} 条相关的评价记录，这些记录也将被删除！")
    
    # 确认删除
    if not input("确认要删除此员工吗？(y/n): ").lower() == 'y':
        print("删除操作已取消")
        return 0
    
    # 执行删除
    try:
        # 由于外键约束设置了 ON DELETE CASCADE，删除员工会自动删除相关记录
        cursor.execute('DELETE FROM employees WHERE id = ?', (employee_id,))
        conn.commit()
        print(f"成功删除员工: {employee['name']} (ID: {employee_id})")
        if related_results > 0:
            print(f"同时删除了 {related_results} 条相关的评价记录")
        return 1
    except Exception as e:
        conn.rollback()
        print(f"删除失败: {str(e)}")
        return 0

# 根据姓名删除员工
def delete_employee_by_name(conn, name):
    # 查找同名员工
    employees = show_employee_info(conn, name=name)
    
    if not employees:
        return 0
    
    if len(employees) > 1:
        print("找到多个同名员工，请使用ID来删除特定员工。")
        return 0
    
    # 删除找到的唯一员工
    return delete_employee_by_id(conn, employees[0]['id'])

# 根据部门删除员工

def delete_employees_by_department(conn, department):
    cursor = conn.cursor()
    
    # 获取部门员工数量
    cursor.execute('SELECT COUNT(*) FROM employees WHERE department = ?', (department,))
    emp_count = cursor.fetchone()[0]
    
    if emp_count == 0:
        print(f"错误: 部门 '{department}' 中没有员工")
        return 0
    
    # 获取相关评价记录数量
    cursor.execute('''
        SELECT COUNT(*) FROM evaluation_results 
        WHERE employee_id IN (SELECT id FROM employees WHERE department = ?)
    ''', (department,))
    related_results = cursor.fetchone()[0]
    
    # 显示确认信息
    print(f"\n即将删除部门 '{department}' 中的所有 {emp_count} 名员工")
    if related_results > 0:
        print(f"警告: 这些员工共有 {related_results} 条相关的评价记录，这些记录也将被删除！")
    
    if not input("确认要删除此部门的所有员工吗？(y/n): ").lower() == 'y':
        print("删除操作已取消")
        return 0
    
    # 执行删除
    try:
        cursor.execute('DELETE FROM employees WHERE department = ?', (department,))
        conn.commit()
        print(f"成功删除部门 '{department}' 中的 {emp_count} 名员工")
        if related_results > 0:
            print(f"同时删除了 {related_results} 条相关的评价记录")
        return emp_count
    except Exception as e:
        conn.rollback()
        print(f"删除失败: {str(e)}")
        return 0

# 删除所有员工
def delete_all_employees(conn):
    cursor = conn.cursor()
    
    # 获取员工总数
    cursor.execute('SELECT COUNT(*) FROM employees')
    emp_count = cursor.fetchone()[0]
    
    if emp_count == 0:
        print("错误: 系统中没有员工数据")
        return 0
    
    # 获取相关评价记录数量
    cursor.execute('SELECT COUNT(*) FROM evaluation_results')
    related_results = cursor.fetchone()[0]
    
    # 显示确认信息
    print(f"\n即将删除系统中的所有 {emp_count} 名员工")
    if related_results > 0:
        print(f"警告: 这些员工共有 {related_results} 条相关的评价记录，这些记录也将被删除！")
    
    # 二次确认，防止误操作
    confirm = input("这是一个危险操作，所有员工数据将被永久删除！确认要继续吗？(输入 'y 确认删除): ")
    if confirm != 'y':
        print("删除操作已取消")
        return 0
    
    # 执行删除
    try:
        cursor.execute('DELETE FROM employees')
        conn.commit()
        print(f"成功删除系统中的所有 {emp_count} 名员工")
        if related_results > 0:
            print(f"同时删除了 {related_results} 条相关的评价记录")
        return emp_count
    except Exception as e:
        conn.rollback()
        print(f"删除失败: {str(e)}")
        return 0

# 创建数据库备份
def backup_database():
    backup_dir = '../db_backups'
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f'{backup_dir}/performance_data_{timestamp}.db'
    
    try:
        shutil.copy2(DB_FILE, backup_file)
        return backup_file
    except Exception as e:
        print(f"创建备份失败: {str(e)}")
        return None

# 主函数
def main():
    parser = argparse.ArgumentParser(description='删除绩效评估系统中的被评人数据')
    parser.add_argument('--id', metavar='ID', help='根据员工ID删除')
    parser.add_argument('--name', metavar='NAME', help='根据员工姓名删除')
    parser.add_argument('--department', metavar='DEPARTMENT', help='删除指定部门的所有员工')
    parser.add_argument('--all', action='store_true', help='删除系统中的所有员工')
    parser.add_argument('--list', action='store_true', help='列出所有员工')
    parser.add_argument('--list-department', metavar='DEPARTMENT', help='列出指定部门的所有员工')
    parser.add_argument('--no-backup', action='store_true', help='不创建数据库备份')
    
    args = parser.parse_args()
    
    # 检查数据库文件
    check_db_file()
    
    # 连接数据库
    conn = None
    try:
        conn = get_db_connection()
        
        # 列出员工
        if args.list:
            show_employee_info(conn)
            return
        elif args.list_department:
            show_employee_info(conn, department=args.list_department)
            return
        
        # 确定操作类型
        operation_count = 0
        if args.id: operation_count += 1
        if args.name: operation_count += 1
        if args.department: operation_count += 1
        if args.all: operation_count += 1
        
        if operation_count == 0:
            parser.print_help()
            print("\n用法示例:")
            print("  python3 delete_employee.py --list                     # 列出所有员工")
            print("  python3 delete_employee.py --list-department '技术部' # 列出指定部门的员工")
            print("  python3 delete_employee.py --id 1                     # 根据ID删除员工")
            print("  python3 delete_employee.py --name '张三'              # 根据姓名删除员工")
            print("  python3 delete_employee.py --department '技术部'      # 删除指定部门的所有员工")
            print("  python3 delete_employee.py --all                      # 删除系统中的所有员工")
            return
        
        if operation_count > 1:
            print("错误: 只能指定一种删除方式")
            parser.print_help()
            return
        
        # 创建数据库备份（除非用户明确要求不备份）
        if not args.no_backup:
            backup_file = backup_database()
            if backup_file:
                print(f"提示: 如需恢复数据，请使用备份文件: {backup_file}")
        
        # 执行删除操作
        deleted_count = 0
        if args.id:
            deleted_count = delete_employee_by_id(conn, args.id)
        elif args.name:
            deleted_count = delete_employee_by_name(conn, args.name)
        elif args.department:
            deleted_count = delete_employees_by_department(conn, args.department)
        elif args.all:
            deleted_count = delete_all_employees(conn)
        
        # 显示操作结果
        if deleted_count > 0:
            print(f"\n操作完成！共删除了 {deleted_count} 名员工")
        
    except Exception as e:
        print(f"操作失败: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    main()