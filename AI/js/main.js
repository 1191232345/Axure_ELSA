let customerGroups = [];
let accountRelations = [];
let qaRecords = [];
let customerList = []; // 客户列表数据源
let elsaUserList = []; // ELSA用户列表数据源
let currentContentTab = 'tab1';
let editingId = null;
let editingType = null;
let currentGroupId = null;
let selectedUserIds = [];

const pageSize = 10;

document.addEventListener('DOMContentLoaded', function () {
    loadAllData();
    initContentTabSwitch();
});

async function loadAllData() {
    try {
        const result = await APIDataManager.loadData();
        
        if (result.success && result.data) {
            customerGroups = result.data.customerGroups || [];
            accountRelations = result.data.accountRelations || [];
            qaRecords = result.data.qaRecords || [];
            customerList = result.data.customerList || [];
            elsaUserList = result.data.elsaUserList || [];
        } else {
            const defaultData = getDefaultData();
            customerGroups = defaultData.customerGroups;
            accountRelations = defaultData.accountRelations;
            qaRecords = defaultData.qaRecords;
            customerList = defaultData.customerList;
            elsaUserList = defaultData.elsaUserList;
            await saveAllData();
        }
    } catch (e) {
        console.error('加载数据失败:', e);
        const defaultData = getDefaultData();
        customerGroups = defaultData.customerGroups;
        accountRelations = defaultData.accountRelations;
        qaRecords = defaultData.qaRecords;
        customerList = defaultData.customerList;
        elsaUserList = defaultData.elsaUserList;
    }
    
    renderCustomerGroupTable();
    renderQARecordTable();
}

function getDefaultData() {
    return {
        customerList: [
            { id: 1, customerCode: 'CUST001', customerName: '阿里巴巴集团' },
            { id: 2, customerCode: 'CUST002', customerName: '腾讯科技' },
            { id: 3, customerCode: 'CUST003', customerName: '京东商城' },
            { id: 4, customerCode: 'CUST004', customerName: '美团点评' },
            { id: 5, customerCode: 'CUST005', customerName: '字节跳动' }
        ],
        elsaUserList: [
            { id: 1, nickname: '张三', username: 'zhangsan', accountId: 'user_001' },
            { id: 2, nickname: '李四', username: 'lisi', accountId: 'user_002' },
            { id: 3, nickname: '王五', username: 'wangwu', accountId: 'user_003' },
            { id: 4, nickname: '赵六', username: 'zhaoliu', accountId: 'user_004' },
            { id: 5, nickname: '钱七', username: 'qianqi', accountId: 'user_005' },
            { id: 6, nickname: '孙八', username: 'sunba', accountId: 'user_006' },
            { id: 7, nickname: '周九', username: 'zhoujiu', accountId: 'user_007' },
            { id: 8, nickname: '吴十', username: 'wushi', accountId: 'user_008' }
        ],
        customerGroups: [
            { id: 1, customerCode: 'CUST001', groupName: '大客户VIP群', groupId: 'wxg_123456789', createTime: '2024-01-15 10:30' },
            { id: 2, customerCode: 'CUST002', groupName: '合作伙伴交流群', groupId: 'wxg_987654321', createTime: '2024-01-20 14:45' },
            { id: 3, customerCode: 'CUST003', groupName: '技术支持群', groupId: 'wxg_112233445', createTime: '2024-02-01 09:00' }
        ],
        accountRelations: [
            { id: 1, groupId: 1, accountId: 'user_001', elsaNickname: '张三', elsaUsername: 'zhangsan', bindTime: '2024-01-15 11:00', role: '客户' },
            { id: 2, groupId: 1, accountId: 'user_002', elsaNickname: '李四', elsaUsername: 'lisi', bindTime: '2024-01-15 11:05', role: '非客户' },
            { id: 3, groupId: 1, accountId: 'user_003', elsaNickname: '王五', elsaUsername: 'wangwu', bindTime: '2024-01-15 11:10', role: '客户' },
            { id: 4, groupId: 2, accountId: 'user_004', elsaNickname: '赵六', elsaUsername: 'zhaoliu', bindTime: '2024-01-20 15:00', role: '客户' },
            { id: 5, groupId: 2, accountId: 'user_005', elsaNickname: '钱七', elsaUsername: 'qianqi', bindTime: '2024-01-20 15:05', role: '非客户' },
            { id: 6, groupId: 3, accountId: 'user_006', elsaNickname: '孙八', elsaUsername: 'sunba', bindTime: '2024-02-01 09:30', role: '客户' }
        ],
        qaRecords: [
            { id: 1, groupName: '大客户VIP群', questioner: '张三', question: '请问如何查询订单状态？', answer: '您可以通过官网的订单查询页面，输入订单号即可查询订单状态。', qaTime: '2024-01-15 11:30', rating: 4 },
            { id: 2, groupName: '合作伙伴交流群', questioner: '李四', question: '关于API接口的使用文档在哪里？', answer: 'API文档可以在开发者中心下载。', qaTime: '2024-01-20 16:45', rating: 5 },
            { id: 3, groupName: '技术支持群', questioner: '王五', question: '系统登录失败怎么办？', answer: '请检查用户名和密码是否正确，如忘记密码可点击忘记密码进行找回。', qaTime: '2024-02-01 10:20', rating: 2 }
        ]
    };
}

async function saveAllData() {
    try {
        await APIDataManager.saveData({
            customerList: customerList,
            elsaUserList: elsaUserList,
            customerGroups: customerGroups,
            accountRelations: accountRelations,
            qaRecords: qaRecords
        });
        return true;
    } catch (e) {
        console.error('保存数据失败:', e);
        return false;
    }
}

function initContentTabSwitch() {
    const tabButtons = document.querySelectorAll('.tab-content-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');
            switchContentTab(tab);
        });
    });
}

function switchContentTab(tab) {
    currentContentTab = tab;
    goBackToGroupList();
    
    document.querySelectorAll('.tab-content-btn').forEach(btn => {
        btn.classList.remove('erp-btn-primary');
        btn.classList.add('erp-btn-secondary');
    });
    
    const activeBtn = document.querySelector(`.tab-content-btn[data-tab="${tab}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('erp-btn-secondary');
        activeBtn.classList.add('erp-btn-primary');
    }
    
    document.querySelectorAll('.content-tab').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    const activeContent = document.getElementById('content-' + tab);
    if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
    }
}

function renderCustomerGroupTable(data = null) {
    const tbody = document.getElementById('customerGroupTableBody');
    const countSpan = document.getElementById('totalCount1');
    const emptyState = document.getElementById('emptyState1');
    
    if (!tbody) return;
    
    const displayData = data || customerGroups;
    
    tbody.innerHTML = '';
    
    if (countSpan) countSpan.textContent = displayData.length;
    
    if (displayData.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    displayData.forEach((item, index) => {
        const userCount = accountRelations.filter(a => a.groupId === item.id).length;
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors cursor-pointer';
        tr.innerHTML = `
            <td class="px-4 py-3 text-gray-600">${index + 1}</td>
            <td class="px-4 py-3 font-medium text-gray-800">${item.customerCode}</td>
            <td class="px-4 py-3 text-primary hover:underline" onclick="viewGroupUsers(${item.id})">${item.groupName}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">${item.groupId}</td>
            <td class="px-4 py-3 text-gray-600">${userCount}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">${item.createTime}</td>
            <td class="px-4 py-3">
                <div class="flex gap-2">
                    <button class="text-info hover:text-blue-400 transition-colors" onclick="event.stopPropagation(); viewGroupUsers(${item.id})" title="查看用户">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="text-primary hover:text-primary-light transition-colors" onclick="event.stopPropagation(); editCustomerGroup(${item.id})" title="编辑">
                        <i class="fas fa-pen-to-square"></i>
                    </button>
                    <button class="text-danger hover:text-red-400 transition-colors" onclick="event.stopPropagation(); deleteCustomerGroup(${item.id})" title="删除">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewGroupUsers(groupId) {
    const group = customerGroups.find(g => g.id === groupId);
    if (!group) return;
    
    currentGroupId = groupId;
    selectedUserIds = [];
    
    const groupListView = document.getElementById('groupListView');
    const userListView = document.getElementById('userListView');
    const breadcrumb = document.getElementById('breadcrumb');
    const currentGroupName = document.getElementById('currentGroupName');
    
    if (groupListView) groupListView.classList.add('hidden');
    if (userListView) userListView.classList.remove('hidden');
    if (breadcrumb) breadcrumb.classList.remove('hidden');
    if (currentGroupName) currentGroupName.textContent = group.groupName;
    
    renderUserTable();
}

function goBackToGroupList() {
    currentGroupId = null;
    selectedUserIds = [];
    
    const groupListView = document.getElementById('groupListView');
    const userListView = document.getElementById('userListView');
    const breadcrumb = document.getElementById('breadcrumb');
    
    if (groupListView) groupListView.classList.remove('hidden');
    if (userListView) userListView.classList.add('hidden');
    if (breadcrumb) breadcrumb.classList.add('hidden');
}

function renderUserTable(data = null) {
    const tbody = document.getElementById('userTableBody');
    const countSpan = document.getElementById('totalCountUser');
    const emptyState = document.getElementById('emptyStateUser');
    const selectedCountSpan = document.getElementById('selectedCount');
    
    if (!tbody) return;
    
    let displayData = accountRelations.filter(a => a.groupId === currentGroupId);
    
    const nameFilter = document.getElementById('filterUserName')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('filterUserRole')?.value || '';
    
    if (nameFilter) {
        displayData = displayData.filter(item => 
            (item.elsaNickname && item.elsaNickname.toLowerCase().includes(nameFilter)) ||
            (item.elsaUsername && item.elsaUsername.toLowerCase().includes(nameFilter))
        );
    }
    
    if (roleFilter) {
        displayData = displayData.filter(item => item.role === roleFilter);
    }
    
    if (data) displayData = data;
    
    tbody.innerHTML = '';
    
    if (countSpan) countSpan.textContent = displayData.length;
    if (selectedCountSpan) selectedCountSpan.textContent = selectedUserIds.length;
    
    if (displayData.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    displayData.forEach((item, index) => {
        const isSelected = selectedUserIds.includes(item.id);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="px-4 py-3">
                <input type="checkbox" class="user-checkbox w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
                       data-id="${item.id}" ${isSelected ? 'checked' : ''} onchange="toggleUserSelect(${item.id})">
            </td>
            <td class="px-4 py-3 text-gray-600">${index + 1}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">${item.accountId}</td>
            <td class="px-4 py-3 font-medium text-gray-800">${item.elsaNickname || '-'}</td>
            <td class="px-4 py-3 text-gray-600">${item.elsaUsername || '-'}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded ${item.role === '客户' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${item.role}</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">${item.bindTime}</td>
            <td class="px-4 py-3">
                <div class="flex gap-2">
                    <button class="text-primary hover:text-primary-light transition-colors" onclick="editUser(${item.id})" title="编辑">
                        <i class="fas fa-pen-to-square"></i>
                    </button>
                    <button class="text-danger hover:text-red-400 transition-colors" onclick="deleteUser(${item.id})" title="删除">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    updateSelectAllCheckbox();
}

function toggleUserSelect(userId) {
    const index = selectedUserIds.indexOf(userId);
    if (index > -1) {
        selectedUserIds.splice(index, 1);
    } else {
        selectedUserIds.push(userId);
    }
    
    const selectedCountSpan = document.getElementById('selectedCount');
    if (selectedCountSpan) selectedCountSpan.textContent = selectedUserIds.length;
    
    updateSelectAllCheckbox();
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const isChecked = selectAllCheckbox?.checked;
    
    const users = accountRelations.filter(a => a.groupId === currentGroupId);
    
    if (isChecked) {
        selectedUserIds = users.map(u => u.id);
    } else {
        selectedUserIds = [];
    }
    
    renderUserTable();
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const users = accountRelations.filter(a => a.groupId === currentGroupId);
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = users.length > 0 && selectedUserIds.length === users.length;
    }
}

function handleSearchUserFilter() {
    renderUserTable();
}

function handleResetUserFilter() {
    const nameInput = document.getElementById('filterUserName');
    const roleSelect = document.getElementById('filterUserRole');
    
    if (nameInput) nameInput.value = '';
    if (roleSelect) roleSelect.value = '';
    
    renderUserTable();
}

function openAddUserModal() {
    editingType = 'user';
    editingId = null;
    
    const modal = document.getElementById('formModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    // 生成ELSA昵称下拉选项
    const elsaOptions = elsaUserList.map(u => 
        `<option value="${u.nickname}" data-username="${u.username}" data-accountid="${u.accountId}">${u.nickname}</option>`
    ).join('');
    
    title.textContent = '添加用户';
    body.innerHTML = `
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">ELSA昵称 <span class="text-danger">*</span></label>
            <select id="formElsaNickname" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" onchange="handleNicknameChange()">
                <option value="">请选择ELSA昵称</option>
                ${elsaOptions}
            </select>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">ELSA用户名</label>
            <input type="text" id="formElsaUsername" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="选择昵称后自动带出" readonly>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">客户账号ID <span class="text-danger">*</span></label>
            <input type="text" id="formAccountId" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="选择昵称后自动带出" readonly>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">角色 <span class="text-danger">*</span></label>
            <select id="formRole" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="客户">客户</option>
                <option value="非客户">非客户</option>
            </select>
        </div>
    `;
    
    modal.classList.add('show');
}

// 处理昵称选择变化，自动带出用户名和账号ID
function handleNicknameChange() {
    const nicknameSelect = document.getElementById('formElsaNickname');
    const usernameInput = document.getElementById('formElsaUsername');
    const accountIdInput = document.getElementById('formAccountId');
    
    if (!nicknameSelect) return;
    
    const selectedOption = nicknameSelect.options[nicknameSelect.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        const username = selectedOption.getAttribute('data-username');
        const accountId = selectedOption.getAttribute('data-accountid');
        
        if (usernameInput) usernameInput.value = username || '';
        if (accountIdInput) accountIdInput.value = accountId || '';
    } else {
        if (usernameInput) usernameInput.value = '';
        if (accountIdInput) accountIdInput.value = '';
    }
}

function editUser(id) {
    const item = accountRelations.find(a => a.id === id);
    if (!item) return;
    
    editingType = 'user';
    editingId = id;
    
    const modal = document.getElementById('formModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    // 生成ELSA昵称下拉选项
    const elsaOptions = elsaUserList.map(u => 
        `<option value="${u.nickname}" data-username="${u.username}" data-accountid="${u.accountId}" ${u.nickname === item.elsaNickname ? 'selected' : ''}>${u.nickname}</option>`
    ).join('');
    
    title.textContent = '编辑用户';
    body.innerHTML = `
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">ELSA昵称 <span class="text-danger">*</span></label>
            <select id="formElsaNickname" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" onchange="handleNicknameChange()">
                <option value="">请选择ELSA昵称</option>
                ${elsaOptions}
            </select>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">ELSA用户名</label>
            <input type="text" id="formElsaUsername" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="${item.elsaUsername || ''}" readonly>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">客户账号ID <span class="text-danger">*</span></label>
            <input type="text" id="formAccountId" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="${item.accountId}" readonly>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">角色 <span class="text-danger">*</span></label>
            <select id="formRole" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="客户" ${item.role === '客户' ? 'selected' : ''}>客户</option>
                <option value="非客户" ${item.role === '非客户' ? 'selected' : ''}>非客户</option>
            </select>
        </div>
    `;
    
    modal.classList.add('show');
}

async function deleteUser(id) {
    if (!confirm('确定要删除此用户吗？')) return;
    
    accountRelations = accountRelations.filter(a => a.id !== id);
    await saveAllData();
    renderUserTable();
    renderCustomerGroupTable();
    showToast('删除成功', 'success');
}

function openBatchRoleModal() {
    if (selectedUserIds.length === 0) {
        showToast('请先选择要标注的用户', 'error');
        return;
    }
    
    const modal = document.getElementById('formModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = '批量标注角色';
    body.innerHTML = `
        <div class="mb-4 p-3 bg-blue-50 rounded">
            <p class="text-sm text-blue-700">
                <i class="fas fa-info-circle mr-1"></i>
                已选择 <span class="font-bold">${selectedUserIds.length}</span> 个用户
            </p>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">选择角色 <span class="text-danger">*</span></label>
            <select id="batchRole" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="客户">客户</option>
                <option value="非客户">非客户</option>
            </select>
        </div>
    `;
    
    editingType = 'batchRole';
    modal.classList.add('show');
}

function renderQARecordTable(data = null) {
    const tbody = document.getElementById('qaRecordTableBody');
    const countSpan = document.getElementById('totalCountQA');
    const emptyState = document.getElementById('emptyStateQA');
    
    if (!tbody) return;
    
    const displayData = data || qaRecords;
    
    tbody.innerHTML = '';
    
    if (countSpan) countSpan.textContent = displayData.length;
    
    if (displayData.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    displayData.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="px-4 py-3 text-gray-600">${index + 1}</td>
            <td class="px-4 py-3 text-gray-600">${item.groupName}</td>
            <td class="px-4 py-3 font-medium text-gray-800">${item.questioner}</td>
            <td class="px-4 py-3 text-gray-600 max-w-xs truncate" title="${item.question}">${item.question}</td>
            <td class="px-4 py-3 text-gray-600 max-w-xs truncate" title="${item.answer}">${item.answer}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">${item.qaTime}</td>
            <td class="px-4 py-3">${generateStars(item.rating)}</td>
            <td class="px-4 py-3">
                <div class="flex gap-2">
                    <button class="text-info hover:text-blue-400 transition-colors" onclick="viewQADetail(${item.id})" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function generateStars(rating) {
    let stars = '<div class="flex gap-0.5 text-yellow-400">';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star text-xs"></i>';
        } else {
            stars += '<i class="far fa-star text-xs text-gray-300"></i>';
        }
    }
    stars += '</div>';
    return stars;
}

function handleSearchFilter(tab) {
    if (tab === 'tab1') {
        const code = document.getElementById('filterCustomerCode')?.value.toLowerCase() || '';
        const name = document.getElementById('filterGroupName')?.value.toLowerCase() || '';
        
        const filtered = customerGroups.filter(item => {
            const matchCode = !code || item.customerCode.toLowerCase().includes(code);
            const matchName = !name || item.groupName.toLowerCase().includes(name);
            return matchCode && matchName;
        });
        
        renderCustomerGroupTable(filtered);
    } else if (tab === 'tab2') {
        const group = document.getElementById('filterQAGroup')?.value.toLowerCase() || '';
        const keyword = document.getElementById('filterQAKeyword')?.value.toLowerCase() || '';
        
        const filtered = qaRecords.filter(item => {
            const matchGroup = !group || item.groupName.toLowerCase().includes(group);
            const matchKeyword = !keyword || item.question.toLowerCase().includes(keyword) || item.answer.toLowerCase().includes(keyword);
            return matchGroup && matchKeyword;
        });
        
        renderQARecordTable(filtered);
    }
}

function handleResetFilter(tab) {
    if (tab === 'tab1') {
        const codeInput = document.getElementById('filterCustomerCode');
        const nameInput = document.getElementById('filterGroupName');
        if (codeInput) codeInput.value = '';
        if (nameInput) nameInput.value = '';
        renderCustomerGroupTable();
    } else if (tab === 'tab2') {
        const groupInput = document.getElementById('filterQAGroup');
        const keywordInput = document.getElementById('filterQAKeyword');
        if (groupInput) groupInput.value = '';
        if (keywordInput) keywordInput.value = '';
        renderQARecordTable();
    }
}

function openAddModal(type) {
    editingType = type;
    editingId = null;
    
    const modal = document.getElementById('formModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    if (type === 'customerGroup') {
        // 生成客户代码下拉选项
        const customerOptions = customerList.map(c => 
            `<option value="${c.customerCode}">${c.customerCode} - ${c.customerName}</option>`
        ).join('');
        
        title.textContent = '添加客户群';
        body.innerHTML = `
            <div class="form-group mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">客户代码 <span class="text-danger">*</span></label>
                <select id="formCustomerCode" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option value="">请选择客户代码</option>
                    ${customerOptions}
                </select>
            </div>
            <div class="form-group mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">客户群名称 <span class="text-danger">*</span></label>
                <input type="text" id="formGroupName" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="请输入客户群名称">
            </div>
            <div class="form-group mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">群ID <span class="text-danger">*</span></label>
                <input type="text" id="formGroupId" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="请输入微信群ID">
            </div>
        `;
        modal.classList.add('show');
    }
}

function editCustomerGroup(id) {
    const item = customerGroups.find(g => g.id === id);
    if (!item) return;
    
    editingType = 'customerGroup';
    editingId = id;
    
    const modal = document.getElementById('formModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    // 生成客户代码下拉选项
    const customerOptions = customerList.map(c => 
        `<option value="${c.customerCode}" ${c.customerCode === item.customerCode ? 'selected' : ''}>${c.customerCode} - ${c.customerName}</option>`
    ).join('');
    
    title.textContent = '编辑客户群';
    body.innerHTML = `
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">客户代码 <span class="text-danger">*</span></label>
            <select id="formCustomerCode" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="">请选择客户代码</option>
                ${customerOptions}
            </select>
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">客户群名称 <span class="text-danger">*</span></label>
            <input type="text" id="formGroupName" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="${item.groupName}">
        </div>
        <div class="form-group mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">群ID <span class="text-danger">*</span></label>
            <input type="text" id="formGroupId" class="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="${item.groupId}">
        </div>
    `;
    
    modal.classList.add('show');
}

async function deleteCustomerGroup(id) {
    if (!confirm('确定要删除此客户群吗？删除后该群下的用户也将被删除。')) return;
    
    customerGroups = customerGroups.filter(g => g.id !== id);
    accountRelations = accountRelations.filter(a => a.groupId !== id);
    
    await saveAllData();
    renderCustomerGroupTable();
    showToast('删除成功', 'success');
}

function closeModal() {
    const modal = document.getElementById('formModal');
    modal.classList.remove('show');
    editingId = null;
    editingType = null;
}

async function submitModal() {
    if (editingType === 'customerGroup') {
        const customerCode = document.getElementById('formCustomerCode')?.value.trim();
        const groupName = document.getElementById('formGroupName')?.value.trim();
        const groupId = document.getElementById('formGroupId')?.value.trim();
        
        if (!customerCode || !groupName || !groupId) {
            showToast('请填写必填项', 'error');
            return;
        }
        
        if (editingId) {
            const index = customerGroups.findIndex(g => g.id === editingId);
            if (index > -1) {
                customerGroups[index] = {
                    ...customerGroups[index],
                    customerCode,
                    groupName,
                    groupId
                };
            }
        } else {
            const newId = customerGroups.length > 0 ? Math.max(...customerGroups.map(g => g.id)) + 1 : 1;
            customerGroups.push({
                id: newId,
                customerCode,
                groupName,
                groupId,
                createTime: formatDate(new Date())
            });
        }
        
        await saveAllData();
        renderCustomerGroupTable();
        showToast(editingId ? '编辑成功' : '添加成功', 'success');
    } else if (editingType === 'user') {
        const elsaNickname = document.getElementById('formElsaNickname')?.value.trim();
        const elsaUsername = document.getElementById('formElsaUsername')?.value.trim();
        const accountId = document.getElementById('formAccountId')?.value.trim();
        const role = document.getElementById('formRole')?.value || '客户';
        
        if (!elsaNickname) {
            showToast('请选择ELSA昵称', 'error');
            return;
        }
        
        if (editingId) {
            const index = accountRelations.findIndex(a => a.id === editingId);
            if (index > -1) {
                accountRelations[index] = {
                    ...accountRelations[index],
                    accountId,
                    elsaNickname,
                    elsaUsername,
                    role
                };
            }
        } else {
            const newId = accountRelations.length > 0 ? Math.max(...accountRelations.map(a => a.id)) + 1 : 1;
            accountRelations.push({
                id: newId,
                groupId: currentGroupId,
                accountId,
                elsaNickname,
                elsaUsername,
                bindTime: formatDate(new Date()),
                role
            });
        }
        
        await saveAllData();
        renderUserTable();
        renderCustomerGroupTable();
        showToast(editingId ? '编辑成功' : '添加成功', 'success');
    } else if (editingType === 'batchRole') {
        const role = document.getElementById('batchRole')?.value;
        
        if (!role) {
            showToast('请选择角色', 'error');
            return;
        }
        
        selectedUserIds.forEach(userId => {
            const index = accountRelations.findIndex(a => a.id === userId);
            if (index > -1) {
                accountRelations[index].role = role;
            }
        });
        
        await saveAllData();
        renderUserTable();
        selectedUserIds = [];
        showToast('批量标注成功', 'success');
    }
    
    closeModal();
}

function viewQADetail(id) {
    const item = qaRecords.find(q => q.id === id);
    if (!item) return;
    
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('detailModalBody');
    
    body.innerHTML = `
        <div class="space-y-4">
            <div>
                <label class="text-xs text-gray-500">客户群</label>
                <p class="text-gray-800">${item.groupName}</p>
            </div>
            <div>
                <label class="text-xs text-gray-500">提问者</label>
                <p class="text-gray-800">${item.questioner}</p>
            </div>
            <div>
                <label class="text-xs text-gray-500">问题</label>
                <p class="text-gray-800">${item.question}</p>
            </div>
            <div>
                <label class="text-xs text-gray-500">AI回复</label>
                <p class="text-gray-800">${item.answer}</p>
            </div>
            <div>
                <label class="text-xs text-gray-500">问答时间</label>
                <p class="text-gray-800">${item.qaTime}</p>
            </div>
            <div>
                <label class="text-xs text-gray-500">评分</label>
                <p>${generateStars(item.rating)}</p>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('show');
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function exportData(type) {
    let data, filename;
    
    if (type === 'customerGroup') {
        data = customerGroups;
        filename = 'customer_groups.json';
    } else if (type === 'qaRecord') {
        data = qaRecords;
        filename = 'qa_records.json';
    } else {
        return;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('导出成功', 'success');
}
