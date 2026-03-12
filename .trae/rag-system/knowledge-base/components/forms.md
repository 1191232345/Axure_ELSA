# 表单组件

## 组件信息
- **名称**: 表单组件
- **类型**: 复合组件
- **适用场景**: 数据输入、信息收集、配置设置等
- **版本**: 1.0

## 设计规范

### 布局规范
- 表单项之间的垂直间距为 16px
- 标签与输入框之间的间距为 6px
- 表单整体内边距为 20px

### 输入框规范
- 高度: 32px
- 边框: 1px solid #E5E7EB
- 圆角: 6px
- 字体大小: 14px
- 输入文字颜色: #1D2129
- 占位符颜色: #9CA3AF

### 标签规范
- 字体大小: 14px
- 字体重量: 500
- 颜色: #374151
- 必要字段标记: 红色星号 (*)

### 验证状态
- **正常状态**: 边框 #E5E7EB
- **聚焦状态**: 边框 #2a3b7d，阴影 0 0 0 2px rgba(42, 59, 125, 0.1)
- **错误状态**: 边框 #F53F3F，错误信息红色
- **成功状态**: 边框 #00B42A

## 代码实现

### HTML 结构
```html
<div class="form-group">
  <label for="username">
    用户名 <span class="required">*</span>
  </label>
  <input 
    type="text" 
    id="username" 
    class="form-input"
    placeholder="请输入用户名"
    required
  >
</div>
```

### CSS 样式
```css
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group .required {
  color: #F53F3F;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
  color: #1D2129;
  background-color: white;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2a3b7d;
  box-shadow: 0 0 0 2px rgba(42, 59, 125, 0.1);
}

.form-input.error {
  border-color: #F53F3F;
}

.form-input.success {
  border-color: #00B42A;
}

.form-error {
  font-size: 12px;
  color: #F53F3F;
  margin-top: 4px;
}
```

## 表单类型

### 文本输入框
```html
<div class="form-group">
  <label for="name">姓名 <span class="required">*</span></label>
  <input type="text" id="name" class="form-input" placeholder="请输入姓名">
</div>
```

### 下拉选择框
```html
<div class="form-group">
  <label for="department">部门 <span class="required">*</span></label>
  <select id="department" class="form-select">
    <option value="">请选择部门</option>
    <option value="1">运营部</option>
    <option value="2">技术部</option>
    <option value="3">市场部</option>
  </select>
</div>
```

### 复选框
```html
<div class="form-group">
  <label class="flex items-center">
    <input type="checkbox" class="checkbox-primary mr-2">
    同意服务条款
  </label>
</div>
```

### 日期选择器
```html
<div class="form-group">
  <label for="date">日期 <span class="required">*</span></label>
  <input type="date" id="date" class="form-input">
</div>
```

## 最佳实践
- 必要字段必须标记红色星号
- 输入框应提供清晰的占位符提示
- 表单验证应实时反馈错误信息
- 长表单应分组显示，提高用户体验
- 提交按钮应位于表单底部，与表单宽度一致
- 表单应支持键盘导航和回车提交