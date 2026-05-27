# Tab 切换

主内容区域的 Tab 切换控制，支持原型/PRD/测试用例三个区域。

## 方法

```javascript
function switchMainTab(tab)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `tab` | `string` | Tab标识：prototype/prd/testcases |

## 完整代码

```javascript
function switchMainTab(tab) {
    document.querySelectorAll('.main-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    
    document.getElementById('main-' + tab).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
    
    if (tab === 'prd') {
        loadPRD();
    } else if (tab === 'testcases') {
        loadTestCases();
    }
}
```

## 使用示例

```html
<div class="tabs">
    <button class="tab active" id="tab-prototype" onclick="switchMainTab('prototype')">原型</button>
    <button class="tab" id="tab-prd" onclick="switchMainTab('prd')">PRD</button>
    <button class="tab" id="tab-testcases" onclick="switchMainTab('testcases')">测试用例</button>
</div>

<div class="main-content active" id="main-prototype">...</div>
<div class="main-content" id="main-prd">...</div>
<div class="main-content" id="main-testcases">...</div>
```

## 依赖

切换到 PRD/测试用例 时会调用 [content-loader](content-loader.md) 加载内容。