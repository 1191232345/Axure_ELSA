# 页面逻辑说明指南

完整的页面逻辑说明规范，包含初始化页面、检索条件、按钮逻辑、属性取值、完整示例等所有逻辑说明模板。

## 初始化页面逻辑

### 页面加载流程

1. **页面初始化**
   - 加载页面基础数据
   - 初始化搜索条件默认值
   - 加载表格数据
   - 初始化事件监听

2. **数据加载顺序**
   ```
   页面加载 → 初始化搜索条件 → 加载下拉选项 → 加载表格数据 → 绑定事件
   ```

3. **初始化代码示例**

```javascript
// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化搜索条件
    initSearchConditions();

    // 加载下拉选项
    loadSelectOptions();

    // 加载表格数据
    loadTableData();

    // 绑定事件
    bindEvents();
});

/**
 * 初始化搜索条件
 */
function initSearchConditions() {
    // 设置默认日期范围（最近30天）
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    document.getElementById('startDate').value = formatDate(thirtyDaysAgo);
    document.getElementById('endDate').value = formatDate(today);

    // 设置默认状态
    document.getElementById('statusFilter').value = '';
}

/**
 * 加载下拉选项
 */
function loadSelectOptions() {
    // 加载状态下拉
    fetch('/api/options/status')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('statusFilter');
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.value;
                option.textContent = item.label;
                select.appendChild(option);
            });
        });
}
```

## 检索条件逻辑

### 搜索条件说明

| 字段名 | 字段类型 | 是否必填 | 默认值 | 取值范围 | 说明 |
|--------|---------|---------|--------|---------|------|
| 关键字 | 文本框 | 否 | 空 | 1-50字符 | 支持模糊搜索 |
| 状态 | 下拉框 | 否 | 全部 | 启用/禁用 | 精确匹配 |
| 日期范围 | 日期范围 | 否 | 最近30天 | - | 开始日期≤结束日期 |
| 类型 | 下拉框 | 否 | 全部 | 多选 | 支持多选 |

### 搜索逻辑

```javascript
/**
 * 执行搜索
 */
function handleSearch() {
    // 获取搜索条件
    const searchParams = getSearchParams();

    // 验证搜索条件
    if (!validateSearchParams(searchParams)) {
        return;
    }

    // 重置页码
    currentPage = 1;

    // 发送搜索请求
    searchTableData(searchParams);
}

/**
 * 获取搜索参数
 */
function getSearchParams() {
    return {
        keyword: document.getElementById('keyword').value.trim(),
        status: document.getElementById('statusFilter').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        types: getMultiSelectValues('typeFilter')
    };
}

/**
 * 验证搜索参数
 */
function validateSearchParams(params) {
    // 验证日期范围
    if (params.startDate && params.endDate) {
        if (new Date(params.startDate) > new Date(params.endDate)) {
            showToast('开始日期不能大于结束日期', 'warning');
            return false;
        }
    }

    return true;
}

/**
 * 重置搜索条件
 */
function handleReset() {
    document.getElementById('searchForm').reset();
    initSearchConditions();
    currentPage = 1;
    loadTableData();
}
```

## 按钮逻辑

### 按钮权限与状态

| 按钮名称 | 权限标识 | 显示条件 | 启用条件 | 点击行为 |
|---------|---------|---------|---------|---------|
| 新增 | `data:add` | 始终显示 | 始终启用 | 打开新增模态框 |
| 编辑 | `data:edit` | 单选时显示 | 选中1条数据 | 打开编辑模态框 |
| 删除 | `data:delete` | 多选时显示 | 选中≥1条数据 | 确认后删除 |
| 导出 | `data:export` | 始终显示 | 有数据时启用 | 导出Excel |
| 审批 | `data:approve` | 待审批状态 | 选中待审批数据 | 打开审批模态框 |

### 按钮逻辑代码

```javascript
/**
 * 绑定按钮事件
 */
function bindButtonEvents() {
    // 新增按钮
    document.getElementById('addBtn').addEventListener('click', function() {
        openAddModal();
    });

    // 编辑按钮
    document.getElementById('editBtn').addEventListener('click', function() {
        const selectedIds = getSelectedIds();
        if (selectedIds.length !== 1) {
            showToast('请选择一条数据进行编辑', 'warning');
            return;
        }
        openEditModal(selectedIds[0]);
    });

    // 删除按钮
    document.getElementById('deleteBtn').addEventListener('click', function() {
        const selectedIds = getSelectedIds();
        if (selectedIds.length === 0) {
            showToast('请选择要删除的数据', 'warning');
            return;
        }
        batchDelete(selectedIds);
    });

    // 导出按钮
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportData();
    });
}

/**
 * 更新按钮状态
 */
function updateButtonState() {
    const selectedIds = getSelectedIds();
    const selectedCount = selectedIds.length;

    // 编辑按钮：只有选中1条时启用
    document.getElementById('editBtn').disabled = selectedCount !== 1;

    // 删除按钮：选中≥1条时启用
    document.getElementById('deleteBtn').disabled = selectedCount === 0;

    // 批量操作按钮
    document.querySelectorAll('.batch-btn').forEach(btn => {
        btn.disabled = selectedCount === 0;
    });
}
```

## 属性取值逻辑

### 字段取值规则

| 字段名 | 数据来源 | 取值逻辑 | 显示格式 | 说明 |
|--------|---------|---------|---------|------|
| ID | 后端生成 | 自增 | - | 主键 |
| 名称 | 用户输入 | 必填，1-50字符 | - | 唯一 |
| 状态 | 后端计算 | 根据条件判断 | 徽章 | 启用/禁用 |
| 创建时间 | 后端生成 | 系统时间 | YYYY-MM-DD HH:mm:ss | 只读 |
| 更新时间 | 后端更新 | 修改时间 | YYYY-MM-DD HH:mm:ss | 只读 |

### 数据转换逻辑

```javascript
/**
 * 格式化表格数据
 */
function formatTableData(data) {
    return data.map(item => ({
        ...item,
        status: formatStatus(item.status),
        createTime: formatDateTime(item.createTime),
        updateTime: formatDateTime(item.updateTime)
    }));
}

/**
 * 格式化状态
 */
function formatStatus(status) {
    const statusMap = {
        'active': { text: '启用', class: 'status-badge-success' },
        'inactive': { text: '禁用', class: 'status-badge-danger' },
        'pending': { text: '待审批', class: 'status-badge-warning' }
    };

    return statusMap[status] || { text: '未知', class: 'status-badge-info' };
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateTime) {
    if (!dateTime) return '-';

    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
```

## 完整示例

### 列表页面完整逻辑

```javascript
// 全局变量
let currentPage = 1;
let currentPageSize = 10;
let currentSearchParams = {};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initPage();
});

/**
 * 初始化页面
 */
function initPage() {
    // 初始化搜索条件
    initSearchConditions();

    // 加载下拉选项
    loadSelectOptions();

    // 加载表格数据
    loadTableData();

    // 绑定事件
    bindEvents();
}

/**
 * 加载表格数据
 */
function loadTableData() {
    const params = {
        page: currentPage,
        pageSize: currentPageSize,
        ...currentSearchParams
    };

    fetch('/api/data/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            renderTable(data.data);
            renderPagination(data.total, data.pageSize);
        } else {
            showToast(data.message || '加载数据失败', 'error');
        }
    })
    .catch(error => {
        console.error('加载数据失败:', error);
        showToast('加载数据失败，请重试', 'error');
    });
}

/**
 * 渲染表格
 */
function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center py-8 text-gray-500">暂无数据</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" name="id" value="${item.id}" onchange="updateButtonState()"></td>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td><span class="status-badge ${item.status.class}">${item.status.text}</span></td>
            <td>${item.createTime}</td>
            <td>
                <button class="table-btn table-btn-primary" onclick="openEditModal(${item.id})">编辑</button>
                <button class="table-btn table-btn-danger" onclick="deleteData(${item.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 搜索按钮
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', handleReset);

    // 新增按钮
    document.getElementById('addBtn').addEventListener('click', openAddModal);

    // 批量删除按钮
    document.getElementById('batchDeleteBtn').addEventListener('click', batchDelete);

    // 导出按钮
    document.getElementById('exportBtn').addEventListener('click', exportData);
}
```

## 使用规范

1. **命名规范**：函数名使用动词+名词形式，如 `loadTableData`
2. **错误处理**：所有请求必须有错误处理和用户提示
3. **代码注释**：关键逻辑必须添加注释说明
4. **性能优化**：避免重复请求，使用防抖/节流
5. **用户体验**：操作成功/失败都有明确反馈
