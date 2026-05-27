# 模态框管理

模态框的打开和关闭控制。

## 方法

```javascript
function openModal(modalId)
function closeModal(modalId)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `modalId` | `string` | 模态框元素ID，默认 `formModal` |

## 完整代码

```javascript
function openModal(modalId) {
    modalId = modalId || 'formModal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    modalId = modalId || 'formModal';
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}
```

## 使用示例

```javascript
// 打开添加模态框
openModal('addModal');

// 关闭编辑模态框
closeModal('editModal');
```

## 样式依赖

模态框需要有 `.show` 类控制显示状态，详见 [components](../components.md)。