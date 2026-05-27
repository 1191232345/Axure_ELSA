# 通知提醒组件

内联提示框（Alert）模板，用于页面内重要信息提示。

## 成功提示

```html
<div class="alert alert-success mb-4" role="alert">
    <div class="flex items-start gap-3">
        <div class="alert-icon flex-shrink-0 mt-0.5">
            <i class="fas fa-circle-check text-lg"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm mb-1">操作成功</h4>
            <p class="text-sm opacity-90">数据已成功保存到系统。</p>
        </div>
        <button class="alert-close" onclick="this.closest('.alert').remove()">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

## 警告提示

```html
<div class="alert alert-warning mb-4" role="alert">
    <div class="flex items-start gap-3">
        <div class="alert-icon flex-shrink-0 mt-0.5">
            <i class="fas fa-triangle-exclamation text-lg"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm mb-1">请注意</h4>
            <p class="text-sm opacity-90">该操作将影响已关联的数据。</p>
        </div>
        <button class="alert-close" onclick="this.closest('.alert').remove()">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

## 错误提示

```html
<div class="alert alert-danger mb-4" role="alert">
    <div class="flex items-start gap-3">
        <div class="alert-icon flex-shrink-0 mt-0.5">
            <i class="fas fa-circle-exclamation text-lg"></i>
        </div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm mb-1">操作失败</h4>
            <p class="text-sm opacity-90 mb-2">保存时发生错误：网络连接超时。</p>
            <a href="#" class="text-sm font-medium underline">查看错误详情 →</a>
        </div>
        <button class="alert-close" onclick="this.closest('.alert').remove()">
            <i class="fas fa-xmark"></i>
        </button>
    </div>
</div>
```

## CSS样式

```css
.alert {
    display: flex;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    border-left-width: 4px;
    border-left-style: solid;
    animation: slideInRight 0.3s ease-out;
}

.alert-success { background-color: #E8FFEC; border-left-color: #00B42A; color: #006B19; }
.alert-warning { background-color: #FFF7E8; border-left-color: #FF7D00; color: #994D00; }
.alert-danger { background-color: #FFECE8; border-left-color: #F53F3F; color: #B3261E; }
.alert-info { background-color: #E8F3FF; border-left-color: #1677FF; color: #094D8C; }

.alert-close { background: none; border: none; cursor: pointer; opacity: 0.6; }
```