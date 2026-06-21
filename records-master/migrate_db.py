#!/usr/bin/env python3
"""
数据库迁移脚本：将 performance_data.db 的数据迁移到 evaluation.db
"""
import sqlite3
import os
from datetime import datetime

def migrate_database(source_db, target_db):
    """
    迁移数据库

    Args:
        source_db: 源数据库路径 (performance_data.db)
        target_db: 目标数据库路径 (evaluation.db)
    """
    print(f"开始迁移数据库...")
    print(f"源数据库: {source_db}")
    print(f"目标数据库: {target_db}")

    # 连接数据库
    source_conn = sqlite3.connect(source_db)
    source_conn.row_factory = sqlite3.Row

    target_conn = sqlite3.connect(target_db)
    target_conn.row_factory = sqlite3.Row

    source_cursor = source_conn.cursor()
    target_cursor = target_conn.cursor()

    try:
        # 1. 迁移员工数据
        print("\n1. 迁移员工数据...")
        source_cursor.execute('SELECT * FROM employees')
        employees = source_cursor.fetchall()

        # 获取所有唯一的部门名称
        departments = set()
        for emp in employees:
            departments.add(emp['department'])

        # 创建部门映射
        dept_mapping = {}
        for i, dept_name in enumerate(sorted(departments), start=1):
            # 检查部门是否已存在
            target_cursor.execute('SELECT id FROM departments WHERE name = ?', (dept_name,))
            existing = target_cursor.fetchone()

            if existing:
                dept_mapping[dept_name] = existing['id']
            else:
                # 插入新部门
                target_cursor.execute('''
                    INSERT INTO departments (id, name, description, enabled, sort_order, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (i, dept_name, '', 1, i, datetime.now().isoformat(), datetime.now().isoformat()))
                dept_mapping[dept_name] = i

        print(f"   创建了 {len(dept_mapping)} 个部门")

        # 插入员工数据
        employee_mapping = {}
        for emp in employees:
            # 检查员工是否已存在
            target_cursor.execute('SELECT id FROM employees WHERE id = ?', (emp['id'],))
            existing = target_cursor.fetchone()

            if not existing:
                dept_id = dept_mapping.get(emp['department'])
                target_cursor.execute('''
                    INSERT INTO employees (id, name, department, department_id)
                    VALUES (?, ?, ?, ?)
                ''', (emp['id'], emp['name'], emp['department'], dept_id))

            employee_mapping[emp['id']] = emp['id']

        print(f"   迁移了 {len(employees)} 名员工")

        # 2. 迁移评分项数据
        print("\n2. 迁移评分项数据...")
        source_cursor.execute('SELECT * FROM rating_items')
        rating_items = source_cursor.fetchall()

        rating_item_mapping = {}
        for item in rating_items:
            # 检查评分项是否已存在
            target_cursor.execute('SELECT id FROM rating_items WHERE id = ?', (item['id'],))
            existing = target_cursor.fetchone()

            if not existing:
                target_cursor.execute('''
                    INSERT INTO rating_items (id, name, description, enabled)
                    VALUES (?, ?, ?, ?)
                ''', (item['id'], item['name'], item['description'], item['enabled']))

            rating_item_mapping[item['id']] = item['id']

        print(f"   迁移了 {len(rating_items)} 个评分项")

        # 3. 迁移员工-评分项关系
        print("\n3. 迁移员工-评分项关系...")
        source_cursor.execute('SELECT * FROM employee_rating_relations')
        relations = source_cursor.fetchall()

        for rel in relations:
            # 检查关系是否已存在
            target_cursor.execute('''
                SELECT 1 FROM employee_rating_relations
                WHERE employee_id = ? AND rating_item_id = ?
            ''', (rel['employee_id'], rel['rating_item_id']))
            existing = target_cursor.fetchone()

            if not existing:
                target_cursor.execute('''
                    INSERT INTO employee_rating_relations (employee_id, rating_item_id)
                    VALUES (?, ?)
                ''', (rel['employee_id'], rel['rating_item_id']))

        print(f"   迁移了 {len(relations)} 个员工-评分项关系")

        # 4. 迁移评价结果数据
        print("\n4. 迁移评价结果数据...")
        source_cursor.execute('''
            SELECT er.*, e.name as employee_name, e.department as employee_department
            FROM evaluation_results er
            LEFT JOIN employees e ON er.employee_id = e.id
        ''')
        evaluation_results = source_cursor.fetchall()

        for eval in evaluation_results:
            # 检查评价结果是否已存在（使用 employee_id 和 date 作为唯一标识）
            target_cursor.execute('''
                SELECT id FROM evaluation_results
                WHERE employee_id = ? AND created_at = ?
            ''', (eval['employee_id'], eval['date']))
            existing = target_cursor.fetchone()

            if not existing:
                # 获取评价评分详情
                source_cursor.execute('''
                    SELECT er.item_id, ri.name as item_name, er.score, er.comment
                    FROM evaluation_ratings er
                    LEFT JOIN rating_items ri ON er.item_id = ri.id
                    WHERE er.evaluation_id = ?
                ''', (eval['id'],))
                ratings = source_cursor.fetchall()

                # 构建评分详情 JSON
                import json
                rating_details = []
                for rating in ratings:
                    rating_details.append({
                        'item_id': rating['item_id'],
                        'item_name': rating['item_name'],
                        'score': rating['score'],
                        'comment': rating['comment']
                    })

                target_cursor.execute('''
                    INSERT INTO evaluation_results
                    (employee_id, employee_name, employee_department, evaluator_name,
                     rating_details, created_at, status, source_id, source_name)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    eval['employee_id'],
                    eval['employee_name'],
                    eval['employee_department'],
                    eval['evaluator'],
                    json.dumps(rating_details, ensure_ascii=False),
                    eval['date'],
                    'completed',
                    1,
                    '系统导入'
                ))

        print(f"   迁移了 {len(evaluation_results)} 条评价结果")

        # 提交事务
        target_conn.commit()
        print("\n✅ 数据库迁移成功！")

        # 显示统计信息
        print("\n📊 迁移统计:")
        print(f"   部门: {len(dept_mapping)} 个")
        print(f"   员工: {len(employees)} 名")
        print(f"   评分项: {len(rating_items)} 个")
        print(f"   员工-评分项关系: {len(relations)} 个")
        print(f"   评价结果: {len(evaluation_results)} 条")

    except Exception as e:
        print(f"\n❌ 迁移失败: {e}")
        target_conn.rollback()
        raise
    finally:
        source_conn.close()
        target_conn.close()

if __name__ == '__main__':
    # 数据库路径
    source_db = '/Users/zsw/Desktop/Axure_ELSA/records-master/data/performance_data.db'
    target_db = '/Users/zsw/Desktop/Axure_ELSA/records-master/data/evaluation.db'

    # 检查源数据库是否存在
    if not os.path.exists(source_db):
        print(f"错误: 源数据库不存在: {source_db}")
        exit(1)

    # 检查目标数据库是否存在
    if not os.path.exists(target_db):
        print(f"错误: 目标数据库不存在: {target_db}")
        print("请先运行应用以创建数据库")
        exit(1)

    # 执行迁移
    migrate_database(source_db, target_db)
