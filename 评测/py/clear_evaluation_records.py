#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清除评分记录脚本
功能：提供多种选项清除绩效评估系统中的评分记录
"""

import os
import sys
import sqlite3
import argparse
import datetime
import shutil

# 数据库文件路径（使用绝对路径）
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
    return True

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

# 获取评价记录统计信息
def get_evaluation_stats(conn):
    cursor = conn.cursor()
    
    # 获取评价结果总数
    cursor.execute('SELECT COUNT(*) FROM evaluation_results')
    total_results = cursor.fetchone()[0]
    
    # 获取评分项总数
    cursor.execute('SELECT COUNT(*) FROM evaluation_ratings')
    total_ratings = cursor.fetchone()[0]
    
    # 获取最早和最新的评价日期
    cursor.execute('SELECT MIN(date), MAX(date) FROM evaluation_results')
    date_range = cursor.fetchone()
    earliest_date = date_range[0] if date_range[0] else '无'
    latest_date = date_range[1] if date_range[1] else '无'
    
    # 获取评价人列表
    cursor.execute('SELECT DISTINCT evaluator FROM evaluation_results ORDER BY evaluator')
    evaluators = [row['evaluator'] for row in cursor.fetchall()]
    
    return {
        'total_results': total_results,
        'total_ratings': total_ratings,
        'earliest_date': earliest_date,
        'latest_date': latest_date,
        'evaluators': evaluators
    }

# 显示评价记录统计信息
def show_evaluation_stats(conn):
    stats = get_evaluation_stats(conn)
    
    print("\n=== 评价记录统计信息 ===")
    print(f"评价结果总数: {stats['total_results']}")
    print(f"评分项总数: {stats['total_ratings']}")
    print(f"评价日期范围: {stats['earliest_date']} 至 {stats['latest_date']}")
    print(f"评价人数量: {len(stats['evaluators'])}")
    if len(stats['evaluators']) <= 10:
        print(f"评价人列表: {', '.join(stats['evaluators'])}")
    print("======================\n")

# 确认操作
def confirm_operation(message):
    while True:
        response = input(f"{message} (y/n): ").strip().lower()
        if response == 'y':
            return True
        elif response == 'n':
            return False
        print("请输入 'y' 确认或 'n' 取消。")

# 清除所有评价记录
def clear_all_evaluation_records(conn):
    cursor = conn.cursor()
    
    # 获取当前记录数量
    cursor.execute('SELECT COUNT(*) FROM evaluation_results')
    total_results = cursor.fetchone()[0]
    
    if total_results == 0:
        print("没有需要清除的评价记录。")
        return 0
    
    # 显示确认信息
    if not confirm_operation(f"确定要清除所有 {total_results} 条评价记录吗？此操作不可恢复！"):
        print("操作已取消。")
        return 0
    
    # 执行删除操作
    try:
        # 由于外键约束设置了 ON DELETE CASCADE，删除 evaluation_results 表中的记录会自动删除 evaluation_ratings 表中的相关记录
        cursor.execute('DELETE FROM evaluation_results')
        conn.commit()
        print(f"成功清除了所有 {total_results} 条评价记录。")
        return total_results
    except Exception as e:
        conn.rollback()
        print(f"清除评价记录失败: {str(e)}")
        return 0

# 按日期范围清除评价记录
def clear_evaluation_records_by_date(conn, start_date, end_date):
    cursor = conn.cursor()
    
    # 验证日期格式
    try:
        datetime.datetime.strptime(start_date, '%Y-%m-%d')
        datetime.datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        print("错误: 日期格式不正确，请使用 'YYYY-MM-DD' 格式。")
        return 0
    
    # 获取指定日期范围内的记录数量
    cursor.execute('''
        SELECT COUNT(*) FROM evaluation_results 
        WHERE date BETWEEN ? AND ?
    ''', (start_date, end_date))
    total_results = cursor.fetchone()[0]
    
    if total_results == 0:
        print(f"在 {start_date} 至 {end_date} 期间没有评价记录。")
        return 0
    
    # 显示确认信息
    if not confirm_operation(f"确定要清除 {start_date} 至 {end_date} 期间的 {total_results} 条评价记录吗？此操作不可恢复！"):
        print("操作已取消。")
        return 0
    
    # 执行删除操作
    try:
        cursor.execute('''
            DELETE FROM evaluation_results 
            WHERE date BETWEEN ? AND ?
        ''', (start_date, end_date))
        conn.commit()
        print(f"成功清除了 {start_date} 至 {end_date} 期间的 {total_results} 条评价记录。")
        return total_results
    except Exception as e:
        conn.rollback()
        print(f"清除评价记录失败: {str(e)}")
        return 0

# 按评价人清除评价记录
def clear_evaluation_records_by_evaluator(conn, evaluator):
    cursor = conn.cursor()
    
    # 获取指定评价人的记录数量
    cursor.execute('''
        SELECT COUNT(*) FROM evaluation_results 
        WHERE evaluator = ?
    ''', (evaluator,))
    total_results = cursor.fetchone()[0]
    
    if total_results == 0:
        print(f"评价人 '{evaluator}' 没有任何评价记录。")
        return 0
    
    # 显示确认信息
    if not confirm_operation(f"确定要清除评价人 '{evaluator}' 的所有 {total_results} 条评价记录吗？此操作不可恢复！"):
        print("操作已取消。")
        return 0
    
    # 执行删除操作
    try:
        cursor.execute('''
            DELETE FROM evaluation_results 
            WHERE evaluator = ?
        ''', (evaluator,))
        conn.commit()
        print(f"成功清除了评价人 '{evaluator}' 的所有 {total_results} 条评价记录。")
        return total_results
    except Exception as e:
        conn.rollback()
        print(f"清除评价记录失败: {str(e)}")
        return 0

# 按员工ID清除评价记录
def clear_evaluation_records_by_employee(conn, employee_id):
    cursor = conn.cursor()
    
    # 检查员工是否存在
    cursor.execute('SELECT name FROM employees WHERE id = ?', (employee_id,))
    employee = cursor.fetchone()
    
    if not employee:
        print(f"错误: ID为 '{employee_id}' 的员工不存在。")
        return 0
    
    # 获取指定员工的记录数量
    cursor.execute('''
        SELECT COUNT(*) FROM evaluation_results 
        WHERE employee_id = ?
    ''', (employee_id,))
    total_results = cursor.fetchone()[0]
    
    if total_results == 0:
        print(f"员工 '{employee['name']}' 没有任何评价记录。")
        return 0
    
    # 显示确认信息
    if not confirm_operation(f"确定要清除员工 '{employee['name']}' 的所有 {total_results} 条评价记录吗？此操作不可恢复！"):
        print("操作已取消。")
        return 0
    
    # 执行删除操作
    try:
        cursor.execute('''
            DELETE FROM evaluation_results 
            WHERE employee_id = ?
        ''', (employee_id,))
        conn.commit()
        print(f"成功清除了员工 '{employee['name']}' 的所有 {total_results} 条评价记录。")
        return total_results
    except Exception as e:
        conn.rollback()
        print(f"清除评价记录失败: {str(e)}")
        return 0

# 清除所有被评人数据
def clear_all_employees(conn):
    cursor = conn.cursor()
    
    # 获取当前员工数量
    cursor.execute('SELECT COUNT(*) FROM employees')
    total_employees = cursor.fetchone()[0]
    
    if total_employees == 0:
        print("没有需要清除的被评人数据。")
        return 0
    
    # 获取相关记录数量
    cursor.execute('SELECT COUNT(*) FROM evaluation_results')
    total_results = cursor.fetchone()[0]
    
    # 显示确认信息
    confirm_msg = f"确定要清除所有 {total_employees} 条被评人数据吗？\n"
    confirm_msg += f"此操作还将自动清除 {total_results} 条相关的评价记录和关系数据。\n"
    confirm_msg += "此操作不可恢复！"
    
    if not confirm_operation(confirm_msg):
        print("操作已取消。")
        return 0
    
    # 执行删除操作
    try:
        # 由于外键约束设置了 ON DELETE CASCADE，删除 employees 表中的记录会自动删除其他表中的相关记录
        cursor.execute('DELETE FROM employees')
        conn.commit()
        print(f"成功清除了所有 {total_employees} 条被评人数据和相关记录。")
        return total_employees
    except Exception as e:
        conn.rollback()
        print(f"清除被评人数据失败: {str(e)}")
        return 0

# 主函数
def main():
    parser = argparse.ArgumentParser(description='清除绩效评估系统中的评分记录')
    parser.add_argument('--all', action='store_true', help='清除所有评价记录')
    parser.add_argument('--date-range', nargs=2, metavar=('START_DATE', 'END_DATE'), help='按日期范围清除评价记录，格式: YYYY-MM-DD YYYY-MM-DD')
    parser.add_argument('--evaluator', metavar='NAME', help='按评价人清除评价记录')
    parser.add_argument('--employee-id', metavar='ID', help='按员工ID清除评价记录')
    parser.add_argument('--clear-employees', action='store_true', help='清除所有被评人数据')
    parser.add_argument('--no-backup', action='store_true', help='不创建数据库备份')
    parser.add_argument('--show-stats', action='store_true', help='显示评价记录统计信息')
    
    args = parser.parse_args()
    
    # 检查数据库文件
    check_db_file()
    
    # 连接数据库
    conn = None
    try:
        conn = get_db_connection()
        
        # 显示统计信息
        show_evaluation_stats(conn)
        
        # 如果只显示统计信息，则退出
        if args.show_stats:
            return
        
        # 确定操作类型
        operation_count = 0
        if args.all: operation_count += 1
        if args.date_range: operation_count += 1
        if args.evaluator: operation_count += 1
        if args.employee_id: operation_count += 1
        if args.clear_employees: operation_count += 1
        
        if operation_count == 0:
            parser.print_help()
            print("\n用法示例:")
            print("  python clear_evaluation_records.py --show-stats       # 显示评价记录统计信息")
            print("  python clear_evaluation_records.py --all              # 清除所有评价记录")
            print("  python clear_evaluation_records.py --date-range 2024-01-01 2024-12-31  # 按日期范围清除")
            print("  python clear_evaluation_records.py --evaluator '张三'  # 按评价人清除")
            print("  python clear_evaluation_records.py --employee-id 1     # 按员工ID清除")
            print("  python3 clear_evaluation_records.py --clear-employees  # 清除所有被评人数据")
            return
        
        if operation_count > 1:
            print("错误: 只能指定一种清除方式。")
            parser.print_help()
            return
        
        # 创建数据库备份（除非用户明确要求不备份）
        if not args.no_backup:
            backup_file = backup_database()
            if backup_file:
                print(f"提示: 如需恢复数据，请使用备份文件: {backup_file}")
        
        # 执行清除操作
        deleted_count = 0
        if args.all:
            deleted_count = clear_all_evaluation_records(conn)
        elif args.date_range:
            start_date, end_date = args.date_range
            deleted_count = clear_evaluation_records_by_date(conn, start_date, end_date)
        elif args.evaluator:
            deleted_count = clear_evaluation_records_by_evaluator(conn, args.evaluator)
        elif args.employee_id:
            deleted_count = clear_evaluation_records_by_employee(conn, args.employee_id)
        elif args.clear_employees:
            deleted_count = clear_all_employees(conn)
        
        # 显示操作结果
        if deleted_count > 0:
            print(f"\n操作完成！共清除了 {deleted_count} 条评价记录。")
            # 显示清除后的统计信息
            show_evaluation_stats(conn)
        
    except Exception as e:
        print(f"操作失败: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    main()