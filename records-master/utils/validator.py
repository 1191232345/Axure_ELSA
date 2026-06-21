"""
输入验证和清理工具
"""
import re
import html
from typing import Any, Dict, List, Optional

class ValidationError(Exception):
    """验证错误异常"""
    pass

class Validator:
    """输入验证器"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = None) -> str:
        """
        清理字符串输入，防止 XSS 攻击
        
        Args:
            value: 输入字符串
            max_length: 最大长度限制
            
        Returns:
            清理后的字符串
        """
        if not isinstance(value, str):
            raise ValidationError(f"输入必须是字符串类型，实际类型: {type(value)}")
        
        # 去除首尾空白
        value = value.strip()
        
        # HTML 转义
        value = html.escape(value)
        
        # 长度限制
        if max_length and len(value) > max_length:
            raise ValidationError(f"输入长度超过限制: {len(value)} > {max_length}")
        
        return value
    
    @staticmethod
    def validate_required(value: Any, field_name: str) -> Any:
        """
        验证必填字段
        
        Args:
            value: 输入值
            field_name: 字段名称
            
        Returns:
            验证后的值
        """
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValidationError(f"{field_name} 不能为空")
        return value
    
    @staticmethod
    def validate_name(value: str, field_name: str = "名称", max_length: int = 50) -> str:
        """
        验证名称字段
        
        Args:
            value: 名称值
            field_name: 字段名称
            max_length: 最大长度
            
        Returns:
            验证后的名称
        """
        value = Validator.validate_required(value, field_name)
        
        # 去除首尾空白
        value = value.strip()
        
        # 长度限制
        if max_length and len(value) > max_length:
            raise ValidationError(f"输入长度超过限制: {len(value)} > {max_length}")
        
        # 检查是否包含特殊字符（在 HTML 转义之前）
        if not re.match(r'^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$', value):
            raise ValidationError(f"{field_name} 只能包含中文、英文、数字、下划线、连字符和空格")
        
        # HTML 转义（最后执行）
        value = html.escape(value)
        
        return value
    
    @staticmethod
    def validate_id(value: Any, field_name: str = "ID") -> Any:
        """
        验证 ID 字段
        
        Args:
            value: ID 值
            field_name: 字段名称
            
        Returns:
            验证后的 ID
        """
        value = Validator.validate_required(value, field_name)
        
        # 转换为整数
        try:
            id_value = int(value)
            if id_value <= 0:
                raise ValidationError(f"{field_name} 必须是正整数")
            return id_value
        except (ValueError, TypeError):
            # 如果不是整数，返回原始值（用于字符串 ID）
            return str(value)
    
    @staticmethod
    def validate_integer(value: Any, field_name: str, min_value: int = None, max_value: int = None) -> int:
        """
        验证整数字段
        
        Args:
            value: 整数值
            field_name: 字段名称
            min_value: 最小值
            max_value: 最大值
            
        Returns:
            验证后的整数
        """
        try:
            int_value = int(value)
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} 必须是整数")
        
        if min_value is not None and int_value < min_value:
            raise ValidationError(f"{field_name} 不能小于 {min_value}")
        
        if max_value is not None and int_value > max_value:
            raise ValidationError(f"{field_name} 不能大于 {max_value}")
        
        return int_value
    
    @staticmethod
    def validate_list(value: Any, field_name: str, item_validator: callable = None) -> List:
        """
        验证列表字段
        
        Args:
            value: 列表值
            field_name: 字段名称
            item_validator: 列表项验证函数
            
        Returns:
            验证后的列表
        """
        if not isinstance(value, list):
            raise ValidationError(f"{field_name} 必须是列表类型")
        
        if item_validator:
            validated_items = []
            for i, item in enumerate(value):
                try:
                    validated_items.append(item_validator(item))
                except ValidationError as e:
                    raise ValidationError(f"{field_name}[{i}]: {str(e)}")
            return validated_items
        
        return value
    
    @staticmethod
    def validate_dict(value: Any, field_name: str) -> Dict:
        """
        验证字典字段
        
        Args:
            value: 字典值
            field_name: 字段名称
            
        Returns:
            验证后的字典
        """
        if not isinstance(value, dict):
            raise ValidationError(f"{field_name} 必须是字典类型")
        return value
    
    @staticmethod
    def validate_enabled(value: Any) -> int:
        """
        验证启用状态字段
        
        Args:
            value: 启用状态值
            
        Returns:
            验证后的启用状态 (0 或 1)
        """
        if value is None:
            return 1  # 默认启用
        
        try:
            enabled = int(value)
            if enabled not in [0, 1]:
                raise ValidationError("启用状态必须是 0 或 1")
            return enabled
        except (ValueError, TypeError):
            raise ValidationError("启用状态必须是整数")

def validate_employee_data(data: Dict) -> Dict:
    """
    验证员工数据
    
    Args:
        data: 员工数据字典
        
    Returns:
        验证后的数据
    """
    validated = {}
    
    # 验证姓名
    validated['name'] = Validator.validate_name(data.get('name'), '姓名', 50)
    
    # 验证部门
    validated['department'] = Validator.validate_name(data.get('department'), '部门', 50)
    
    # 验证评分项列表
    rating_items = data.get('rating_items', [])
    validated['rating_items'] = Validator.validate_list(
        rating_items, 
        '评分项',
        lambda x: Validator.validate_id(x, '评分项ID')
    )
    
    # 验证部门 ID（可选）
    if data.get('department_id'):
        validated['department_id'] = Validator.validate_id(data.get('department_id'), '部门ID')
    
    return validated

def validate_department_data(data: Dict) -> Dict:
    """
    验证部门数据
    
    Args:
        data: 部门数据字典
        
    Returns:
        验证后的数据
    """
    validated = {}
    
    # 验证部门名称
    validated['name'] = Validator.validate_name(data.get('name'), '部门名称', 50)
    
    # 验证描述（可选）
    if data.get('description'):
        validated['description'] = Validator.sanitize_string(data.get('description'), 200)
    else:
        validated['description'] = ''
    
    # 验证启用状态
    validated['enabled'] = Validator.validate_enabled(data.get('enabled'))
    
    # 验证排序
    validated['sort_order'] = Validator.validate_integer(
        data.get('sort_order', 0), 
        '排序', 
        min_value=0
    )
    
    return validated

def validate_source_data(data: Dict) -> Dict:
    """
    验证来源数据
    
    Args:
        data: 来源数据字典
        
    Returns:
        验证后的数据
    """
    validated = {}
    
    # 验证来源名称
    validated['name'] = Validator.validate_name(data.get('name'), '来源名称', 50)
    
    # 验证描述（可选）
    if data.get('description'):
        validated['description'] = Validator.sanitize_string(data.get('description'), 200)
    else:
        validated['description'] = ''
    
    # 验证启用状态
    validated['enabled'] = Validator.validate_enabled(data.get('enabled'))
    
    # 验证排序
    validated['sort_order'] = Validator.validate_integer(
        data.get('sort_order', 0), 
        '排序', 
        min_value=0
    )
    
    return validated

def validate_rating_item_data(data: Dict) -> Dict:
    """
    验证评分项数据
    
    Args:
        data: 评分项数据字典
        
    Returns:
        验证后的数据
    """
    validated = {}
    
    # 验证评分项名称
    validated['name'] = Validator.validate_name(data.get('name'), '评分项名称', 50)
    
    # 验证描述（可选）
    if data.get('description'):
        validated['description'] = Validator.sanitize_string(data.get('description'), 200)
    else:
        validated['description'] = ''
    
    # 验证启用状态
    validated['enabled'] = Validator.validate_enabled(data.get('enabled'))
    
    return validated
