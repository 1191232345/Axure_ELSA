# 按钮组件

## 组件信息
- **名称**: 按钮组件
- **类型**: 基础组件
- **适用场景**: 表单提交、操作触发、导航等
- **版本**: 1.0

## 设计规范

### 色彩规范
- **主按钮**: 背景色 #2a3b7d，文字色 #ffffff
- **次要按钮**: 背景色 #ffffff，文字色 #2a3b7d，边框色 #E5E7EB
- **警告按钮**: 背景色 #FF7D00，文字色 #ffffff
- **危险按钮**: 背景色 #F53F3F，文字色 #ffffff

### 尺寸规范
- **大按钮**: 高度 40px，padding 12px 24px
- **中按钮**: 高度 32px，padding 8px 16px
- **小按钮**: 高度 24px，padding 4px 12px

### 圆角规范
- 所有按钮圆角为 8px

### 阴影规范
- 常规状态: 无阴影
- 悬停状态: 轻微阴影
- 点击状态: 内阴影效果

## 代码实现

### HTML 结构
```html
<button class="erp-btn erp-btn-primary">
  <i class="fa fa-plus mr-1.5"></i> 新建
</button>
```

### CSS 样式
```css
.erp-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
}

.erp-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.erp-btn:active {
  transform: translateY(0);
}

.erp-btn-primary {
  background-color: #2a3b7d;
  color: white;
  border-color: #2a3b7d;
}

.erp-btn-primary:hover {
  background-color: #3a4ca7;
  border-color: #3a4ca7;
}

.erp-btn-secondary {
  background-color: white;
  color: #525252;
  border-color: #d4d4d4;
}

.erp-btn-secondary:hover {
  border-color: #a3a3a3;
  color: #262626;
}

.erp-btn-warning {
  background-color: #FF7D00;
  color: white;
  border-color: #FF7D00;
}

.erp-btn-warning:hover {
  background-color: #ff952e;
  border-color: #ff952e;
}

.erp-btn-danger {
  background-color: #F53F3F;
  color: white;
  border-color: #F53F3F;
}

.erp-btn-danger:hover {
  background-color: #ff5c5c;
  border-color: #ff5c5c;
}
```

## 使用示例

### 主按钮
```html
<button class="erp-btn erp-btn-primary">提交</button>
```

### 次要按钮
```html
<button class="erp-btn erp-btn-secondary">取消</button>
```

### 警告按钮
```html
<button class="erp-btn erp-btn-warning">警告操作</button>
```

### 危险按钮
```html
<button class="erp-btn erp-btn-danger">删除</button>
```

## 最佳实践
- 按钮文本应简洁明了，通常不超过4个字符
- 主操作使用主按钮，次要操作使用次要按钮
- 危险操作必须使用危险按钮以警示用户
- 按钮应根据功能重要性合理使用不同尺寸
- 表单中提交按钮通常使用大按钮，行内操作使用小按钮