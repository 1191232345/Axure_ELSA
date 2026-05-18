#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安全删除脚本
功能：删除人员或评分项时保留评价记录，避免级联删除
"""

import os
import sys
import sqlite3
import argparse
import datetime
import shutil

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

# 创建数据库备份
def backup_database():
    backup_dir = 'db_backups'
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    # 创建带时间戳的备份文件名
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = os.path.join(backup_dir, f'performance_data_{timestamp}.db')
    
    try:
        shutil.copy2(DB_FILE, backup_file)
        print(f"已创建数据库备份: {backup_file}")
        return backup_file
    except Exception as e:
        print(f"创建数据库备份失败: {str(e)}")
        # 继续执行，因为备份失败不应该阻止用户操作
        return None

# 安全删除员工（保留评价记录）
def safe_delete_employee(employee_id):
    check_db_file()
    
    # 连接数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 检查员工是否存在
        cursor.execute('SELECT id, name, department FROM employees WHERE id = ?', (employee_id,))
        employee = cursor.fetchone()
        
        if not employee:
            print(f"错误: ID为 '{employee_id}' 的员工不存在")
            return False
        
        # 获取该员工的评价记录数量
        cursor.execute('SELECT COUNT(*) FROM evaluation_results WHERE employee_id = ?', (employee_id,))
        evaluation_count = cursor.fetchone()[0]
        
        # 显示员工信息和相关评价记录数量
        print(f"\n员工信息:")
        print(f"ID: {employee['id']}")
        print(f"姓名: {employee['name']}")
        print(f"部门: {employee['department']}")
        print(f"关联的评价记录数量: {evaluation_count}")
        
        # 确认操作
        if not confirm_operation(f"确定要安全删除员工 '{employee['name']}' 吗？这将保留所有相关的评价记录。"):
            print("操作已取消")
            return False
        
        # 创建数据库备份
        backup_file = backup_database()
        
        # 禁用外键约束，避免级联删除
        cursor.execute('PRAGMA foreign_keys = OFF')
        
        # 删除员工评分关联关系
        cursor.execute('DELETE FROM employee_rating_relations WHERE employee_id = ?', (employee_id,))
        print(f"已删除 {cursor.rowcount} 条员工评分关联关系")
        
        # 删除员工
        cursor.execute('DELETE FROM employees WHERE id = ?', (employee_id,))
        print(f"已安全删除员工 '{employee['name']}'")
        
        # 重新启用外键约束
        cursor.execute('PRAGMA foreign_keys = ON')
        
        # 提交更改
        conn.commit()
        
        # 显示结果
        print(f"\n操作完成！")
        if evaluation_count > 0:
            print(f"提示: 已保留该员工的 {evaluation_count} 条评价记录")
        if backup_file:
            print(f"提示: 如需恢复数据，请使用备份文件: {backup_file}")
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"删除员工失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # 确保重新启用外键约束
        cursor.execute('PRAGMA foreign_keys = ON')
        conn.close()

# 安全删除评分项（保留评价记录）
def safe_delete_rating_item(item_id):
    check_db_file()
    
    # 连接数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 检查评分项是否存在
        cursor.execute('SELECT id, name, description, enabled FROM rating_items WHERE id = ?', (item_id,))
        rating_item = cursor.fetchone()
        
        if not rating_item:
            print(f"错误: ID为 '{item_id}' 的评分项不存在")
            return False
        
        # 获取该评分项的评价评分数量
        cursor.execute('SELECT COUNT(*) FROM evaluation_ratings WHERE item_id = ?', (item_id,))
        rating_count = cursor.fetchone()[0]
        
        # 获取使用该评分项的员工数量
        cursor.execute('SELECT COUNT(*) FROM employee_rating_relations WHERE rating_item_id = ?', (item_id,))
        employee_count = cursor.fetchone()[0]
        
        # 显示评分项信息和相关记录数量
        print(f"\n评分项信息:")
        print(f"ID: {rating_item['id']}")
        print(f"名称: {rating_item['name']}")
        print(f"描述: {rating_item['description']}")
        print(f"状态: {'启用' if rating_item['enabled'] else '禁用'}")
        print(f"关联的员工数量: {employee_count}")
        print(f"关联的评价评分数量: {rating_count}")
        
        # 确认操作
        if not confirm_operation(f"确定要安全删除评分项 '{rating_item['name']}' 吗？这将保留所有相关的评价记录。"):
            print("操作已取消")
            return False
        
        # 创建数据库备份
        backup_file = backup_database()
        
        # 禁用外键约束，避免级联删除
        cursor.execute('PRAGMA foreign_keys = OFF')
        
        # 删除员工评分关联关系
        cursor.execute('DELETE FROM employee_rating_relations WHERE rating_item_id = ?', (item_id,))
        print(f"已删除 {cursor.rowcount} 条员工评分关联关系")
        
        # 删除评分项
        cursor.execute('DELETE FROM rating_items WHERE id = ?', (item_id,))
        print(f"已安全删除评分项 '{rating_item['name']}'")
        
        # 重新启用外键约束
        cursor.execute('PRAGMA foreign_keys = ON')
        
        # 提交更改
        conn.commit()
        
        # 显示结果
        print(f"\n操作完成！")
        if rating_count > 0:
            print(f"提示: 已保留该评分项的 {rating_count} 条评价评分记录")
        if backup_file:
            print(f"提示: 如需恢复数据，请使用备份文件: {backup_file}")
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"删除评分项失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        # 确保重新启用外键约束
        cursor.execute('PRAGMA foreign_keys = ON')
        conn.close()

# 确认操作
def confirm_operation(message):
    while True:
        response = input(f"{message} (y/n): ").strip().lower()
        if response == 'y':
            return True
        elif response == 'n':
            return False
        print("请输入 'y' 确认或 'n' 取消。")

# 列出所有员工
def list_employees():
    check_db_file()
    
    # 连接数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 获取所有员工
        cursor.execute('SELECT id, name, department FROM employees ORDER BY id')
        employees = cursor.fetchall()
        
        if not employees:
            print("数据库中没有员工记录")
            return
        
        print("\n=== 员工列表 ===")
        print(f"{'ID':<5}{'姓名':<10}{'部门':<20}")
        print("=" * 35)
        
        for employee in employees:
            print(f"{employee['id']:<5}{employee['name']:<10}{employee['department']:<20}")
        
        print("==================")
        print(f"共 {len(employees)} 名员工")
        
    finally:
        conn.close()

# 列出所有评分项
def list_rating_items():
    check_db_file()
    
    # 连接数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 获取所有评分项
        cursor.execute('SELECT id, name, description, enabled FROM rating_items ORDER BY id')
        rating_items = cursor.fetchall()
        
        if not rating_items:
            print("数据库中没有评分项记录")
            return
        
        print("\n=== 评分项列表 ===")
        print(f"{'ID':<5}{'名称':<15}{'状态':<10}")
        print("=" * 30)
        
        for item in rating_items:
            status = '启用' if item['enabled'] else '禁用'
            print(f"{item['id']:<5}{item['name']:<15}{status:<10}")
        
        print("====================")
        print(f"共 {len(rating_items)} 个评分项")
        
    finally:
        conn.close()

# 主函数
def main():
    parser = argparse.ArgumentParser(description='安全删除员工或评分项（保留评价记录）')
    parser.add_argument('--list-employees', action='store_true', help='列出所有员工')
    parser.add_argument('--list-items', action='store_true', help='列出所有评分项')
    parser.add_argument('--delete-employee', metavar='ID', help='安全删除指定ID的员工')
    parser.add_argument('--delete-item', metavar='ID', help='安全删除指定ID的评分项')
    parser.add_argument('--no-backup', action='store_true', help='不创建数据库备份')
    
    args = parser.parse_args()
    
    # 确定操作类型
    operation_count = 0
    if args.list_employees: operation_count += 1
    if args.list_items: operation_count += 1
    if args.delete_employee: operation_count += 1
    if args.delete_item: operation_count += 1
    
    if operation_count == 0:
        parser.print_help()
        print("\n用法示例:")
        print("  python safe_delete.py --list-employees           # 列出所有员工")
        print("  python safe_delete.py --list-items              # 列出所有评分项")
        print("  python safe_delete.py --delete-employee 1       # 安全删除ID为1的员工")
        print("  python safe_delete.py --delete-item 2           # 安全删除ID为2的评分项")
        return
    
    if operation_count > 1:
        print("错误: 只能指定一种操作")
        parser.print_help()
        return
    
    # 执行操作
    if args.list_employees:
        list_employees()
    elif args.list_items:
        list_rating_items()
    elif args.delete_employee:
        safe_delete_employee(args.delete_employee)
    elif args.delete_item:
        safe_delete_rating_item(args.delete_item)

if __name__ == '__main__':
    main()