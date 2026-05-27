# 分页选择逻辑

分页组件和表格选择交互函数。

## 分页渲染

```javascript
function renderPagination(total, current, size) {
    var totalPages = Math.ceil(total / size);
    var pagination = document.getElementById('pagination');
    var html = '<div class="pagination-info">共 ' + total + ' 条记录</div>';
    html += '<div class="pagination-buttons">';
    html += '<button class="page-btn" ' + (current === 1 ? 'disabled' : '') + ' onclick="goToPage(' + (current - 1) + ')"><i class="fas fa-chevron-left"></i></button>';
    var startPage = Math.max(1, current - 2);
    var endPage = Math.min(totalPages, current + 2);
    for (var i = startPage; i <= endPage; i++) {
        html += '<button class="page-btn ' + (i === current ? 'active' : '') + '" onclick="goToPage(' + i + ')">' + i + '</button>';
    }
    html += '<button class="page-btn" ' + (current === totalPages ? 'disabled' : '') + ' onclick="goToPage(' + (current + 1) + ')"><i class="fas fa-chevron-right"></i></button>';
    html += '</div>';
    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    handleSearch();
}
```

## 表格选择

```javascript
function handleSelectAll(checkbox) {
    var checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(function(cb) {
        cb.checked = checkbox.checked;
        toggleRowSelection(cb);
    });
    updateBatchActions();
}

function toggleRowSelection(checkbox) {
    var row = checkbox.closest('tr');
    if (row) {
        if (checkbox.checked) row.classList.add('selected');
        else row.classList.remove('selected');
    }
    updateSelectAllState();
}

function updateSelectAllState() {
    var selectAllCheckbox = document.getElementById('selectAll');
    var checkboxes = document.querySelectorAll('.row-checkbox');
    if (selectAllCheckbox) {
        var allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; });
        selectAllCheckbox.checked = allChecked;
    }
}

function updateBatchActions() {
    var selectedCount = getSelectedIds().length;
    var batchActions = document.querySelector('.batch-actions');
    if (batchActions) {
        batchActions.style.display = selectedCount > 0 ? 'block' : 'none';
    }
}
```