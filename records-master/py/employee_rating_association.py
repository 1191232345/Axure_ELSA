from datetime import datetime
import json
import os
import sqlite3

# 数据库文件路径
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'performance_data.db')

# 数据库连接函数
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# 加载所有员工数据
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

# 加载所有评分项数据
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

# 加载所有员工评分关联关系
def load_employee_rating_relations():
    conn = get_db_connection()
    relations = {}
    for row in conn.execute('SELECT employee_id, rating_item_id FROM employee_rating_relations'):
        if row['employee_id'] not in relations:
            relations[row['employee_id']] = []
        relations[row['employee_id']].append(row['rating_item_id'])
    conn.close()
    return relations

# 查看特定员工的评分项关联
def get_employee_relations(employee_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查员工是否存在
    cursor.execute('SELECT id, name FROM employees WHERE id = ?', (employee_id,))
    employee = cursor.fetchone()
    if not employee:
        print(f"错误：员工ID {employee_id} 不存在")
        conn.close()
        return None, None
    
    # 获取员工关联的评分项
    relations = []
    for row in cursor.execute('''
        SELECT r.id, r.name, r.description 
        FROM employee_rating_relations er 
        JOIN rating_items r ON er.rating_item_id = r.id 
        WHERE er.employee_id = ?
    ''', (employee_id,)):
        relations.append({
            'id': row['id'],
            'name': row['name'],
            'description': row['description']
        })
    
    conn.close()
    return employee, relations

# 添加员工与评分项的关联
def add_employee_rating_relation(employee_id, rating_item_ids):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 检查员工是否存在
        cursor.execute('SELECT id FROM employees WHERE id = ?', (employee_id,))
        if not cursor.fetchone():
            print(f"错误：员工ID {employee_id} 不存在")
            conn.close()
            return False
        
        # 检查所有评分项是否存在
        valid_item_ids = []
        for item_id in rating_item_ids:
            cursor.execute('SELECT id FROM rating_items WHERE id = ?', (item_id,))
            if cursor.fetchone():
                valid_item_ids.append(item_id)
            else:
                print(f"警告：评分项ID {item_id} 不存在，已跳过")
        
        if not valid_item_ids:
            print("错误：没有有效的评分项ID")
            conn.close()
            return False
        
        # 添加关联关系（如果不存在）
        added_count = 0
        for item_id in valid_item_ids:
            # 检查关联是否已存在
            cursor.execute('''
                SELECT 1 FROM employee_rating_relations 
                WHERE employee_id = ? AND rating_item_id = ?
            ''', (employee_id, item_id))
            if not cursor.fetchone():
                cursor.execute('''
                    INSERT INTO employee_rating_relations (employee_id, rating_item_id)
                    VALUES (?, ?)
                ''', (employee_id, item_id))
                added_count += 1
        
        conn.commit()
        print(f"成功添加 {added_count} 个评分项关联")
        return True
    except Exception as e:
        print(f"添加关联关系失败：{e}")
        conn.rollback()
        return False
    finally:
        conn.close()

# 更新员工的评分项关联（先删除旧的，再添加新的）
def update_employee_rating_relations(employee_id, new_rating_item_ids):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 检查员工是否存在
        cursor.execute('SELECT id FROM employees WHERE id = ?', (employee_id,))
        if not cursor.fetchone():
            print(f"错误：员工ID {employee_id} 不存在")
            conn.close()
            return False
        
        # 检查所有新评分项是否存在
        valid_item_ids = []
        for item_id in new_rating_item_ids:
            cursor.execute('SELECT id FROM rating_items WHERE id = ?', (item_id,))
            if cursor.fetchone():
                valid_item_ids.append(item_id)
            else:
                print(f"警告：评分项ID {item_id} 不存在，已跳过")
        
        if not valid_item_ids:
            print("错误：没有有效的评分项ID")
            conn.close()
            return False
        
        # 删除旧的关联关系
        cursor.execute('''
            DELETE FROM employee_rating_relations WHERE employee_id = ?
        ''', (employee_id,))
        
        # 添加新的关联关系
        for item_id in valid_item_ids:
            cursor.execute('''
                INSERT INTO employee_rating_relations (employee_id, rating_item_id)
                VALUES (?, ?)
            ''', (employee_id, item_id))
        
        conn.commit()
        print(f"成功更新员工 {employee_id} 的评分项关联，共关联 {len(valid_item_ids)} 个评分项")
        return True
    except Exception as e:
        print(f"更新关联关系失败：{e}")
        conn.rollback()
        return False
    finally:
        conn.close()

# 从JSON文件导入员工评分关联关系
def import_relations_from_json(json_file_path):
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            relations_data = json.load(f)
            
        # 验证数据结构
        if not isinstance(relations_data, dict):
            print("错误：JSON文件格式不正确，应为字典结构")
            return False
        
        # 处理每个员工的关联关系
        success_count = 0
        for employee_id, item_ids in relations_data.items():
            if isinstance(item_ids, list):
                if update_employee_rating_relations(employee_id, item_ids):
                    success_count += 1
            else:
                print(f"警告：员工 {employee_id} 的评分项应为列表格式，已跳过")
        
        print(f"从JSON文件导入完成，成功更新 {success_count} 个员工的关联关系")
        return True
    except Exception as e:
        print(f"导入JSON文件失败：{e}")
        return False

# 导出员工评分关联关系到JSON文件
def export_relations_to_json(json_file_path):
    relations = load_employee_rating_relations()
    
    try:
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(relations, f, ensure_ascii=False, indent=2)
        
        print(f"成功导出员工评分关联关系到文件：{json_file_path}")
        print(f"共导出 {len(relations)} 个员工的关联关系")
        return True
    except Exception as e:
        print(f"导出关联关系失败：{e}")
        return False

# 从JSON文件导入部门评分项关联关系
def import_department_associations_from_json(json_file_path):
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 验证数据结构
        if not isinstance(data, dict) or 'department_associations' not in data:
            print("错误：JSON文件格式不正确，缺少 'department_associations' 字段")
            return False
        
        department_associations = data['department_associations']
        if not isinstance(department_associations, list):
            print("错误：'department_associations' 应为列表格式")
            return False
        
        # 处理每个部门的关联关系
        success_count = 0
        for association in department_associations:
            if not isinstance(association, dict) or 'department' not in association or 'rating_item_ids' not in association:
                print("警告：部门关联数据格式不正确，已跳过")
                continue
            
            department = association['department']
            rating_item_ids = association['rating_item_ids']
            
            if not isinstance(rating_item_ids, list):
                print(f"警告：部门 '{department}' 的评分项ID应为列表格式，已跳过")
                continue
            
            if batch_associate_by_department(department, rating_item_ids):
                success_count += 1
        
        print(f"从JSON文件导入部门关联完成，成功处理 {success_count} 个部门的关联关系")
        return True
    except Exception as e:
        print(f"导入JSON文件失败：{e}")
        return False

# 批量关联员工和评分项
def batch_associate_employees(association_data):
    """
    批量关联员工和评分项
    association_data 格式：[
        {"employee_id": "1", "rating_item_ids": ["1", "2", "3"]},
        {"employee_id": "2", "rating_item_ids": ["1", "3", "5"]}
    ]
    """
    if not isinstance(association_data, list):
        print("错误：批量关联数据应为列表格式")
        return False
    
    success_count = 0
    for item in association_data:
        if isinstance(item, dict) and 'employee_id' in item and 'rating_item_ids' in item:
            if update_employee_rating_relations(item['employee_id'], item['rating_item_ids']):
                success_count += 1
        else:
            print("警告：批量数据项格式不正确，已跳过")
    
    print(f"批量关联完成，成功更新 {success_count} 个员工的关联关系")
    return True

# 根据部门获取员工列表
def get_employees_by_department(department):
    """
    根据部门名称获取该部门的所有员工
    """
    conn = get_db_connection()
    employees = []
    
    try:
        cursor = conn.cursor()
        # 查询指定部门的所有员工
        cursor.execute('SELECT id, name FROM employees WHERE department = ?', (department,))
        for row in cursor.fetchall():
            employees.append({
                'id': row['id'],
                'name': row['name']
            })
        return employees
    except Exception as e:
        print(f"查询部门员工失败：{e}")
        return []
    finally:
        conn.close()

# 根据部门批量关联评分项目
def batch_associate_by_department(department, rating_item_ids):
    """
    根据部门批量关联评分项目
    为指定部门的所有员工关联相同的评分项
    """
    # 获取指定部门的所有员工
    employees = get_employees_by_department(department)
    
    if not employees:
        print(f"错误：部门 '{department}' 中没有找到员工")
        return False
    
    print(f"找到 {len(employees)} 个 {department} 部门的员工")
    
    # 检查所有评分项是否存在
    conn = get_db_connection()
    cursor = conn.cursor()
    valid_item_ids = []
    
    try:
        for item_id in rating_item_ids:
            cursor.execute('SELECT id FROM rating_items WHERE id = ?', (item_id,))
            if cursor.fetchone():
                valid_item_ids.append(item_id)
            else:
                print(f"警告：评分项ID {item_id} 不存在，已跳过")
    except Exception as e:
        print(f"检查评分项失败：{e}")
    finally:
        conn.close()
    
    if not valid_item_ids:
        print("错误：没有有效的评分项ID")
        return False
    
    # 为每个员工关联评分项
    success_count = 0
    for employee in employees:
        if update_employee_rating_relations(employee['id'], valid_item_ids):
            success_count += 1
    
    print(f"部门批量关联完成，成功为 {success_count} 个员工关联了评分项")
    return True

# 获取所有部门列表
def get_all_departments():
    """
    获取系统中所有的部门列表
    """
    conn = get_db_connection()
    departments = []
    
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT DISTINCT department FROM employees ORDER BY department')
        departments = [row['department'] for row in cursor.fetchall()]
        return departments
    except Exception as e:
        print(f"获取部门列表失败：{e}")
        return []
    finally:
        conn.close()

# 显示员工和评分项列表
def list_employees_and_items():
    employees = load_employees()
    rating_items = load_rating_items()
    
    print("\n===== 员工列表 =====")
    for emp_id, emp_data in employees.items():
        print(f"ID: {emp_id}, 姓名: {emp_data['name']}, 部门: {emp_data['department']}")
    
    print("\n===== 评分项列表 =====")
    for item_id, item_data in rating_items.items():
        status = "启用" if item_data['enabled'] else "禁用"
        print(f"ID: {item_id}, 名称: {item_data['name']}, 状态: {status}")
        print(f"  描述: {item_data['description']}")
    
    return employees, rating_items

# 根据部门批量删除所有人员被评项
def batch_remove_by_department(department):
    """
    根据部门批量删除所有人员被评项
    删除指定部门的所有员工的评分项关联关系
    """
    # 获取指定部门的所有员工
    employees = get_employees_by_department(department)
    
    if not employees:
        print(f"错误：部门 '{department}' 中没有找到员工")
        return False
    
    print(f"找到 {len(employees)} 个 {department} 部门的员工")
    
    # 确认删除操作
    confirm = input(f"确定要删除 {department} 部门所有员工的评分项关联吗？(y/n): ").lower()
    if confirm != 'y':
        print("操作已取消")
        return False
    
    conn = get_db_connection()
    cursor = conn.cursor()
    success_count = 0
    
    try:
        # 开始事务
        conn.execute('BEGIN TRANSACTION')
        
        # 为每个员工删除关联关系
        for employee in employees:
            employee_id = employee['id']
            cursor.execute('''
                DELETE FROM employee_rating_relations WHERE employee_id = ?
            ''', (employee_id,))
            success_count += 1
            print(f"已删除员工 {employee['name']} (ID: {employee_id}) 的所有评分项关联")
        
        # 提交事务
        conn.commit()
        print(f"\n部门批量删除完成，成功删除 {success_count} 个员工的评分项关联")
        return True
    except Exception as e:
        # 发生错误时回滚事务
        conn.rollback()
        print(f"删除关联关系失败：{e}")
        return False
    finally:
        conn.close()

# 交互式命令行工具
def interactive_tool():
    print("\n===== 被评人关联评分项工具 =====")
    
    while True:
        print("\n请选择操作：")
        print("1. 查看所有员工评分项")
        print("2. 查看特定员工的评分项关联")
        print("3. 添加员工评分项关联")
        print("4. 更新员工评分项关联")
        print("5. 批量关联员工和评分项")
        print("6. 从JSON导入员工-评分项直接关联(格式1)")
        print("7. 根据部门批量关联评分项")
        print("8. 根据部门删除所有人员被评项")
        print("9. 从JSON导入部门-评分项关联(格式2)")
        print("10. 导出关联关系到JSON")
        print("11. 退出")
        
        choice = input("请输入选择 (1-11): ")
        
        if choice == '1':
            list_employees_and_items()
            
        elif choice == '2':
            employee_id = input("请输入员工ID: ")
            employee, relations = get_employee_relations(employee_id)
            if employee:
                print(f"\n员工: {employee['name']} (ID: {employee['id']})")
                print("关联的评分项：")
                if relations:
                    for item in relations:
                        print(f"- ID: {item['id']}, 名称: {item['name']}")
                        print(f"  描述: {item['description']}")
                else:
                    print("该员工未关联任何评分项")
            
        elif choice == '3':
            employee_id = input("请输入员工ID: ")
            item_ids_str = input("请输入评分项ID（多个ID用逗号分隔）: ")
            item_ids = [id.strip() for id in item_ids_str.split(',') if id.strip()]
            add_employee_rating_relation(employee_id, item_ids)
            
        elif choice == '4':
            employee_id = input("请输入员工ID: ")
            item_ids_str = input("请输入新的评分项ID列表（多个ID用逗号分隔）: ")
            item_ids = [id.strip() for id in item_ids_str.split(',') if id.strip()]
            update_employee_rating_relations(employee_id, item_ids)
            
        elif choice == '5':
            print("请准备批量关联数据的JSON文件或手动输入数据格式。")
            print("格式示例：[{\"employee_id\": \"1\", \"rating_item_ids\": [\"1\", \"2\"]}, {...}]")
            use_file = input("是否从文件导入？(y/n): ").lower()
            if use_file == 'y':
                file_path = input("请输入文件路径: ")
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        association_data = json.load(f)
                    batch_associate_employees(association_data)
                except Exception as e:
                    print(f"读取文件失败：{e}")
            else:
                print("请输入JSON格式的批量关联数据 (输入完后按Enter键)")
                try:
                    json_str = input()
                    association_data = json.loads(json_str)
                    batch_associate_employees(association_data)
                except Exception as e:
                    print(f"解析JSON失败：{e}")
            
        elif choice == '6':
            print("注意：此功能需要的JSON格式为{员工ID: [评分项ID列表]}")
            print("例如: {\"1\": [\"1\", \"2\", \"3\"], \"2\": [\"1\", \"3\"]}")
            file_path = input("请输入JSON文件路径: ")
            import_relations_from_json(file_path)
            
        elif choice == '7':
            # 根据部门批量关联评分项
            departments = get_all_departments()
            if departments:
                print("\n可用部门列表：")
                for i, dept in enumerate(departments, 1):
                    print(f"{i}. {dept}")
                
                choice = input("请选择部门序号（或直接输入部门名称）: ")
                department = None
                
                # 检查用户输入是序号还是部门名称
                if choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(departments):
                        department = departments[idx]
                    else:
                        print("错误：无效的部门序号")
                else:
                    # 直接输入部门名称
                    if choice in departments:
                        department = choice
                    else:
                        confirm = input(f"警告：部门 '{choice}' 可能不存在，是否继续？(y/n): ").lower()
                        if confirm == 'y':
                            department = choice
                        else:
                            print("操作已取消")
                
                if department:
                    item_ids_str = input("请输入要关联的评分项ID（多个ID用逗号分隔）: ")
                    item_ids = [id.strip() for id in item_ids_str.split(',') if id.strip()]
                    if item_ids:
                        batch_associate_by_department(department, item_ids)
                    else:
                        print("错误：请至少输入一个有效的评分项ID")
            else:
                print("错误：未能获取部门列表，请检查数据库连接")
                
        elif choice == '8':
            # 根据部门批量删除所有人员被评项
            departments = get_all_departments()
            if departments:
                print("\n可用部门列表：")
                for i, dept in enumerate(departments, 1):
                    print(f"{i}. {dept}")
                
                choice = input("请选择部门序号（或直接输入部门名称）: ")
                department = None
                
                # 检查用户输入是序号还是部门名称
                if choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(departments):
                        department = departments[idx]
                    else:
                        print("错误：无效的部门序号")
                else:
                    # 直接输入部门名称
                    if choice in departments:
                        department = choice
                    else:
                        confirm = input(f"警告：部门 '{choice}' 可能不存在，是否继续？(y/n): ").lower()
                        if confirm == 'y':
                            department = choice
                        else:
                            print("操作已取消")
                
                if department:
                    batch_remove_by_department(department)
            else:
                print("错误：未能获取部门列表，请检查数据库连接")
            
        elif choice == '9':
            print("注意：此功能需要的JSON格式为{department_associations: [{department: '部门名称', rating_item_ids: [评分项ID列表]}]}")
            print("例如: {\"department_associations\": [{\"department\": \"头程客服部\", \"rating_item_ids\": [\"1\", \"2\", \"3\"]}]}")
            file_path = input("请输入JSON文件路径: ")
            import_department_associations_from_json(file_path)
            
        elif choice == '10':
            file_path = input("请输入导出文件路径: ")
            export_relations_to_json(file_path)
        elif choice == '11':
            print("感谢使用，再见！")
            break
        
        else:
            print("无效的选择，请重新输入")

if __name__ == '__main__':
    interactive_tool()