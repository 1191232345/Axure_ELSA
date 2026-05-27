# 搜索筛选逻辑

搜索和筛选按钮交互函数。

## 搜索按钮

```javascript
function handleSearch() {
    var searchParams = collectSearchParams();
    if (!validateSearchParams(searchParams)) {
        showToast('请输入有效的搜索条件', 'error');
        return;
    }
    showLoading();
    fetchSearchResults(searchParams)
        .then(function(results) {
            renderSearchResults(results);
            updatePagination(results.total);
            showToast('搜索完成，共 ' + results.total + ' 条结果', 'success');
        })
        .catch(function(error) {
            showToast('搜索失败：' + error.message, 'error');
        })
        .finally(function() { hideLoading(); });
}

function collectSearchParams() {
    return {
        keyword: document.getElementById('searchKeyword').value.trim(),
        status: document.getElementById('searchStatus').value,
        dateRange: document.getElementById('searchDateRange').value,
        page: currentPage,
        pageSize: pageSize
    };
}

function validateSearchParams(params) {
    if (params.keyword && params.keyword.length < 2) {
        showToast('搜索关键词至少2个字符', 'warning');
        return false;
    }
    return true;
}
```

## 重置按钮

```javascript
function handleReset() {
    if (confirm('确定要重置所有搜索条件吗？')) {
        resetSearchForm();
        loadDefaultData();
        showToast('搜索条件已重置', 'info');
    }
}

function resetSearchForm() {
    document.querySelectorAll('.search-form input, .search-form select').forEach(function(input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    currentPage = 1;
}
```