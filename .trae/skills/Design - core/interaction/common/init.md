# 初始化

页面加载时的自动初始化逻辑。

## 完整代码

```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (typeof DATA_CONFIG !== 'undefined') {
        APIDataManager.init(DATA_CONFIG);
        StateManager.init(DATA_CONFIG.pageId);
    }
});
```

## DATA_CONFIG 配置

```javascript
const DATA_CONFIG = {
    pageId: '[page_id]',
    dataFile: 'data/[page_id]-data.json',
    version: '1.0.0'
};
```

## 初始化流程

```
DOMContentLoaded
    ↓
检测 DATA_CONFIG 是否存在
    ↓
初始化 APIDataManager（数据管理）
    ↓
初始化 StateManager（状态管理）
```

## 注意事项

- `DATA_CONFIG` 必须在 common.js 加载前定义
- `pageId` 用于 localStorage 键名隔离
- `dataFile` 是相对路径，指向 JSON 数据文件