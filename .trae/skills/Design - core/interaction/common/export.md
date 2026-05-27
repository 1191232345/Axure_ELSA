# 数据导出

将 localStorage 中的数据导出为 JSON 文件下载。

## 方法

```javascript
function exportData(data, filename)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | `Array/Object` | 要导出的数据 |
| `filename` | `string` | 文件名，默认 `export.json` |

## 完整代码

```javascript
function exportData(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.json';
    link.click();
    URL.revokeObjectURL(url);
}
```

## 使用示例

```javascript
// 导出当前数据
function exportCurrentData() {
    const result = APIDataManager.loadFromLocalStorage();
    if (result.success && result.data.length > 0) {
        exportData(result.data, DATA_CONFIG.pageId + '-data.json');
        showToast('数据已导出', 'success');
    } else {
        showToast('暂无数据可导出', 'warning');
    }
}
```

## 按钮样式

```html
<button class="erp-btn erp-btn-warning" onclick="exportCurrentData()">
    <i class="fas fa-download mr-1.5"></i>导出数据
</button>
```