#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
人员导入脚本
功能：从CSV文件导入被评人名称和部门信息到绩效评估系统
"""

import os
import sys
import sqlite3
import csv
import argparse
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

# 获取当前最大员工ID
def get_max_employee_id(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT MAX(CAST(id AS INTEGER)) FROM employees')
    max_id = cursor.fetchone()[0]
    return max_id if max_id is not None else 0

# 获取所有启用的评分项ID
def get_enabled_rating_items(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM rating_items WHERE enabled = 1')
    return [row['id'] for row in cursor.fetchall()]

# 检查员工是否已存在
def check_employee_exists(conn, name, department):
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM employees WHERE name = ? AND department = ?', (name, department))
    return cursor.fetchone() is not None

# 从CSV文件导入员工数据
def import_employees_from_csv(csv_file, auto_associate=True):
    check_db_file()
    
    # 检查CSV文件是否存在
    if not os.path.exists(csv_file):
        print(f"错误: CSV文件 '{csv_file}' 不存在")
        sys.exit(1)
    
    # 连接数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 获取当前最大员工ID
        current_max_id = get_max_employee_id(conn)
        print(f"当前最大员工ID: {current_max_id}")
        
        # 获取所有启用的评分项ID（如果需要自动关联）
        enabled_rating_items = []
        if auto_associate:
            enabled_rating_items = get_enabled_rating_items(conn)
            print(f"将自动关联的启用评分项ID: {enabled_rating_items}")
        
        # 导入员工数据
        imported_count = 0
        skipped_count = 0
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # 验证CSV文件格式
            # 检查CSV文件是否有表头
            has_header = True
            if reader.fieldnames == ['姓名', '部门']:
                # 有表头的情况
                pass
            else:
                # 没有表头的情况，使用第一列作为姓名，第二列作为部门
                has_header = False
                
            # 处理每一行数据
            for i, row in enumerate(reader):
                if has_header:
                    name = row['姓名'].strip()
                    department = row['部门'].strip()
                else:
                    # 没有表头的情况
                    values = list(row.values())
                    if len(values) >= 2:
                        name = values[0].strip()
                        department = values[1].strip()
                    else:
                        print(f"跳过: 第{i+1}行数据不完整")
                        skipped_count += 1
                        continue
                
                # 检查数据是否为空
                if not name or not department:
                    print(f"跳过: 姓名或部门为空的记录")
                    skipped_count += 1
                    continue
                
                # 检查员工是否已存在
                if check_employee_exists(conn, name, department):
                    print(f"跳过: 员工 '{name}' (部门: {department}) 已存在")
                    skipped_count += 1
                    continue
                
                # 生成新的员工ID
                current_max_id += 1
                new_id = str(current_max_id)
                
                # 插入员工信息
                cursor.execute('''
                    INSERT INTO employees (id, name, department)
                    VALUES (?, ?, ?)
                ''', (new_id, name, department))
                
                # 自动关联评分项
                if auto_associate and enabled_rating_items:
                    for item_id in enabled_rating_items:
                        cursor.execute('''
                            INSERT INTO employee_rating_relations (employee_id, rating_item_id)
                            VALUES (?, ?)
                        ''', (new_id, item_id))
                    
                imported_count += 1
                print(f"导入成功: 员工ID {new_id} - {name} (部门: {department})")
                
        # 提交更改
        conn.commit()
        
        # 显示导入结果
        print(f"\n导入完成!\n成功导入: {imported_count} 人\n跳过: {skipped_count} 人")
        
    except Exception as e:
        conn.rollback()
        print(f"导入失败: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

# 创建示例CSV文件
def create_example_csv():
    example_file = 'employees_example.csv'
    
    # 检查文件是否已存在
    if os.path.exists(example_file):
        if not input(f"示例文件 '{example_file}' 已存在，是否覆盖？(y/n): ").lower() == 'y':
            print("取消创建示例文件")
            return
    
    # 创建示例CSV文件
    try:
        with open(example_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['姓名', '部门'])
            writer.writeheader()
            writer.writerow({'姓名': '张三', '部门': '技术部'})
            writer.writerow({'姓名': '李四', '部门': '市场部'})
            writer.writerow({'姓名': '王五', '部门': '人力资源部'})
        
        print(f"示例CSV文件 '{example_file}' 已创建成功！")
        print("请按照示例格式编辑CSV文件，然后使用此脚本导入数据。")
    except Exception as e:
        print(f"创建示例CSV文件失败: {str(e)}")

# 主函数
def main():
    parser = argparse.ArgumentParser(description='从CSV文件导入员工数据到绩效评估系统')
    parser.add_argument('csv_file', nargs='?', help='CSV文件路径')
    parser.add_argument('--no-associate', action='store_true', help='不自动关联评分项')
    parser.add_argument('--create-example', action='store_true', help='创建示例CSV文件')
    
    args = parser.parse_args()
    
    # 创建示例CSV文件
    if args.create_example:
        create_example_csv()
        return
    
    # 检查是否提供了CSV文件路径
    if not args.csv_file:
        parser.print_help()
        print("\n用法示例:")
        print("  python3 import_employees.py employees.csv              # 导入员工数据并自动关联评分项")
        print("  python3 import_employees.py employees.csv --no-associate  # 导入员工数据但不关联评分项")
        print("  python3 import_employees.py --create-example           # 创建示例CSV文件")
        return
    
    # 导入员工数据
    auto_associate = not args.no_associate
    import_employees_from_csv(args.csv_file, auto_associate)

if __name__ == '__main__':
    main()