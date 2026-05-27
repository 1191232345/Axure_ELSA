# 表单组件

表单元素模板，包含文本输入框、下拉选择框、多行文本框、日期选择器、复选框、单选按钮组。

## 文本输入框

```html
<div class="form-group">
    <label>字段名称 <span class="required">*</span></label>
    <input type="text" class="form-input" placeholder="请输入...">
</div>
```

## 下拉选择框

```html
<div class="form-group">
    <label>选择项 <span class="required">*</span></label>
    <select class="form-select">
        <option value="">请选择</option>
        <option value="1">选项1</option>
        <option value="2">选项2</option>
    </select>
</div>
```

## 多行文本框

```html
<div class="form-group">
    <label>备注</label>
    <textarea class="form-textarea" rows="3" placeholder="请输入备注..."></textarea>
</div>
```

## 日期选择器

```html
<div class="form-group">
    <label>日期</label>
    <input type="date" class="form-input">
</div>
```

## 复选框

```html
<div class="form-group">
    <label class="flex items-center">
        <input type="checkbox" class="checkbox-primary mr-2">
        <span class="text-sm text-gray-700">选项说明</span>
    </label>
</div>
```

## 单选按钮组

```html
<div class="form-group">
    <label>选项</label>
    <div class="flex gap-4 mt-2">
        <label class="flex items-center">
            <input type="radio" name="option" class="mr-2">
            <span class="text-sm text-gray-700">选项A</span>
        </label>
        <label class="flex items-center">
            <input type="radio" name="option" class="mr-2">
            <span class="text-sm text-gray-700">选项B</span>
        </label>
    </div>
</div>
```

## CSS样式

```css
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    outline: none;
    transition: border-color 0.15s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
}

.required {
    color: #EF4444;
}
```