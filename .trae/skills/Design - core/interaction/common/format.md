# 格式化工具

日期格式化和 HTML 转义工具函数。

## 方法

```javascript
function formatDate(date, format)
function escapeHtml(text)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `date` | `string/Date` | 日期值 |
| `format` | `string` | 格式模板，默认 `YYYY-MM-DD` |
| `text` | `string` | 需要转义的文本 |

## 完整代码

```javascript
function formatDate(date, format) {
    if (!date) return '';
    const d = new Date(date);
    format = format || 'YYYY-MM-DD';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

## 使用示例

```javascript
formatDate('2024-01-15', 'YYYY-MM-DD');           // "2024-01-15"
formatDate('2024-01-15T10:30:00', 'YYYY-MM-DD HH:mm'); // "2024-01-15 10:30"
formatDate(new Date(), 'MM/DD');                  // "01/15"

escapeHtml('<script>alert("xss")</script>');      // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
```

## 格式占位符

| 占位符 | 说明 |
|--------|------|
| `YYYY` | 年份 |
| `MM` | 月份（01-12） |
| `DD` | 日期（01-31） |
| `HH` | 小时（00-23） |
| `mm` | 分钟（00-59） |
| `ss` | 秒数（00-59） |