        // 页面切换
        document.addEventListener('DOMContentLoaded', function() {
            // 左侧全选
            const selectAllLeftUsers = document.getElementById('select-all-left-users');
            if (selectAllLeftUsers) {
                selectAllLeftUsers.addEventListener('change', function() {
                    const checkboxes = document.querySelectorAll('.left-user-checkbox');
                    checkboxes.forEach(cb => cb.checked = this.checked);
                    updateSelectedCount();
                });
            }
            
            // 右侧全选
            const selectAllRightUsers = document.getElementById('select-all-right-users');
            if (selectAllRightUsers) {
                selectAllRightUsers.addEventListener('change', function() {
                    const checkboxes = document.querySelectorAll('.right-user-checkbox');
                    checkboxes.forEach(cb => cb.checked = this.checked);
                    updateSelectedCount();
                });
            }
            
            // 左侧用户选择变化
            const leftUserList = document.getElementById('left-user-list');
            if (leftUserList) {
                leftUserList.addEventListener('change', function(e) {
                    if (e.target.classList.contains('left-user-checkbox')) {
                        updateSelectedCount();
                        const allCheckboxes = document.querySelectorAll('.left-user-checkbox');
                        const checkedCheckboxes = document.querySelectorAll('.left-user-checkbox:checked');
                        const selectAllLeft = document.getElementById('select-all-left-users');
                        if (selectAllLeft) {
                            selectAllLeft.checked = allCheckboxes.length === checkedCheckboxes.length;
                        }
                    }
                });
            }
            
            // 右侧用户选择变化
            const rightUserList = document.getElementById('right-user-list');
            if (rightUserList) {
                rightUserList.addEventListener('change', function(e) {
                    if (e.target.classList.contains('right-user-checkbox')) {
                        updateSelectedCount();
                        const allCheckboxes = document.querySelectorAll('.right-user-checkbox');
                        const checkedCheckboxes = document.querySelectorAll('.right-user-checkbox:checked');
                        const selectAllRight = document.getElementById('select-all-right-users');
                        if (selectAllRight) {
                            selectAllRight.checked = allCheckboxes.length === checkedCheckboxes.length;
                        }
                    }
                });
            }
        });

        // 模态框操作
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }

        // 点击模态框外部关闭
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('show');
                document.body.style.overflow = '';
            }
        });

        // 部门管理
        function openNewDepartmentModal() {
            openModal('new-department-modal');
            document.getElementById('new-department-name').value = '';
            document.getElementById('new-department-parent').value = '';
        }

        function saveNewDepartment() {
            const name = document.getElementById('new-department-name').value;
            const parentId = document.getElementById('new-department-parent').value;
            
            if (!name) {
                alert('请输入部门名称');
                return;
            }
            
            alert('部门创建成功');
            closeModal('new-department-modal');
        }

        function editDepartment(id, name, parentId) {
            openModal('edit-department-modal');
            document.getElementById('edit-department-id').value = id;
            document.getElementById('edit-department-name').value = name;
            document.getElementById('edit-department-parent').value = parentId;
        }

        function saveEditDepartment() {
            const id = document.getElementById('edit-department-id').value;
            const name = document.getElementById('edit-department-name').value;
            const parentId = document.getElementById('edit-department-parent').value;
            
            if (!name) {
                alert('请输入部门名称');
                return;
            }
            
            alert('部门编辑成功');
            closeModal('edit-department-modal');
        }

        function deleteDepartment(id, name) {
            if (confirm('确定要删除部门 ' + name + ' 吗？')) {
                // 模拟删除
                alert('部门删除成功');
            }
        }

        function toggleDepartment(id) {
            const children = document.querySelectorAll('.department-child.department-' + id);
            const button = document.querySelector('button[onclick="toggleDepartment(' + id + ')"] i');
            
            children.forEach(function(child) {
                if (child.style.display === 'none') {
                    child.style.display = 'table-row';
                    if (button) button.className = 'fa fa-chevron-down';
                } else {
                    child.style.display = 'none';
                    if (button) button.className = 'fa fa-chevron-right';
                }
            });
        }

        // 用户关联管理
        let currentDepartmentId = '';
        
        function viewWarehouses(departmentId, departmentName) {
            document.getElementById('view-warehouses-department-name').textContent = departmentName;
            openModal('view-warehouses-modal');
        }

        function viewUsers(departmentId, departmentName) {
            document.getElementById('view-users-department-name').textContent = departmentName;
            openModal('view-users-modal');
        }

        function manageUsers(departmentId, departmentName) {
            currentDepartmentId = departmentId;
            document.getElementById('add-user-department-name').textContent = departmentName;
            document.getElementById('left-user-search').value = '';
            document.getElementById('right-user-search').value = '';
            document.querySelectorAll('.left-user-checkbox, .right-user-checkbox').forEach(cb => cb.checked = false);
            document.getElementById('select-all-left-users').checked = false;
            document.getElementById('select-all-right-users').checked = false;
            updateSelectedCount();
            openModal('add-user-modal');
        }
        
        function updateSelectedCount() {
            const leftChecked = document.querySelectorAll('.left-user-checkbox:checked').length;
            const rightChecked = document.querySelectorAll('.right-user-checkbox:checked').length;
            document.getElementById('left-selected-count').textContent = leftChecked;
            document.getElementById('right-selected-count').textContent = rightChecked;
        }
        
        function addSelectedToLeft() {
            const selectedItems = document.querySelectorAll('.left-user-checkbox:checked');
            if (selectedItems.length === 0) {
                alert('请选择要添加的用户');
                return;
            }
            
            const rightList = document.getElementById('right-user-list');
            selectedItems.forEach(checkbox => {
                const userItem = checkbox.closest('.user-item');
                checkbox.classList.remove('left-user-checkbox');
                checkbox.classList.add('right-user-checkbox');
                checkbox.checked = false;
                rightList.appendChild(userItem);
            });
            
            document.getElementById('select-all-left-users').checked = false;
            updateSelectedCount();
        }
        
        function removeSelectedFromRight() {
            const selectedItems = document.querySelectorAll('.right-user-checkbox:checked');
            if (selectedItems.length === 0) {
                alert('请选择要移除的用户');
                return;
            }
            
            const leftList = document.getElementById('left-user-list');
            selectedItems.forEach(checkbox => {
                const userItem = checkbox.closest('.user-item');
                checkbox.classList.remove('right-user-checkbox');
                checkbox.classList.add('left-user-checkbox');
                checkbox.checked = false;
                leftList.appendChild(userItem);
            });
            
            document.getElementById('select-all-right-users').checked = false;
            updateSelectedCount();
        }
        
        function saveUserRelations() {
            const rightUsers = document.querySelectorAll('#right-user-list .user-item');
            const userNames = Array.from(rightUsers).map(item => item.dataset.userName).join('、');
            
            if (confirm('确定保存当前的用户关联关系吗？\n已关联用户：' + userNames)) {
                alert('保存成功');
                closeModal('add-user-modal');
            }
        }
        
        // 切换PRD逻辑说明展开/收起
        function togglePrdLogic(module) {
            const content = document.getElementById(module + '-logic-content');
            const icon = document.getElementById(module + '-logic-icon');
            
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(180deg)';
            } else {
                content.classList.add('hidden');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        }

        // 切换PRD流程图展开/收起
        function togglePrdFlow(module) {
            const content = document.getElementById(module + '-flow-content');
            const icon = document.getElementById(module + '-flow-icon');
            
            if (content) {
                if (content.classList.contains('hidden')) {
                    content.classList.remove('hidden');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                    
                    // 重新渲染Mermaid图表
                    setTimeout(function() {
                        const mermaidElements = content.querySelectorAll('.mermaid');
                        if (mermaidElements.length > 0) {
                            mermaid.run();
                        }
                    }, 50);
                } else {
                    content.classList.add('hidden');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            }
        }

        // 虚拟仓管理
        function openNewWarehouseModal() {
            openModal('new-warehouse-modal');
            // 重置表单
            document.getElementById('new-warehouse-name').value = '';
            document.getElementById('new-warehouse-type').value = 'department';
            document.getElementById('new-warehouse-department').value = '1';
            document.getElementById('new-warehouse-entity').value = 'DE001';
            // 初始化字段显示
            updateWarehouseFields();
        }

        function updateWarehouseFields() {
            const warehouseType = document.getElementById('new-warehouse-type').value;
            const departmentField = document.getElementById('department-field');
            const channelField = document.getElementById('channel-field');
            
            if (warehouseType === 'department') {
                departmentField.style.display = 'block';
                channelField.style.display = 'none';
            } else if (warehouseType === 'channel') {
                departmentField.style.display = 'none';
                channelField.style.display = 'block';
            } else if (warehouseType === 'stock') {
                departmentField.style.display = 'none';
                channelField.style.display = 'none';
            }
        }

        function saveNewWarehouse() {
            const name = document.getElementById('new-warehouse-name').value;
            const type = document.getElementById('new-warehouse-type').value;
            let departmentId = '';
            let channelId = '';
            const entityWarehouse = document.getElementById('new-warehouse-entity').value;
            
            if (type === 'department') {
                departmentId = document.getElementById('new-warehouse-department').value;
            } else if (type === 'channel') {
                channelId = document.getElementById('new-warehouse-channel').value;
            }
            
            if (!name) {
                alert('请输入虚拟仓名称');
                return;
            }
            
            // 模拟保存
            alert('虚拟仓名称创建成功');
            closeModal('new-warehouse-modal');
        }

        function updateEditWarehouseFields() {
            const warehouseType = document.getElementById('edit-warehouse-type').value;
            const departmentField = document.getElementById('edit-department-field');
            const channelField = document.getElementById('edit-channel-field');
            
            if (warehouseType === 'main' || warehouseType === 'department') {
                departmentField.style.display = 'block';
                channelField.style.display = 'none';
            } else if (warehouseType === 'channel') {
                departmentField.style.display = 'none';
                channelField.style.display = 'block';
            } else if (warehouseType === 'stock') {
                departmentField.style.display = 'none';
                channelField.style.display = 'none';
            }
        }

        function editWarehouse(id, name, type, departmentId, entityWarehouse) {
            openModal('edit-warehouse-modal');
            document.getElementById('edit-warehouse-id').value = id;
            document.getElementById('edit-warehouse-name').value = name;
            document.getElementById('edit-warehouse-type').value = type;
            document.getElementById('edit-warehouse-department').value = departmentId;
            document.getElementById('edit-warehouse-entity').value = entityWarehouse;
            // 初始化字段显示
            updateEditWarehouseFields();
        }

        function saveEditWarehouse() {
            const id = document.getElementById('edit-warehouse-id').value;
            const name = document.getElementById('edit-warehouse-name').value;
            const type = document.getElementById('edit-warehouse-type').value;
            let departmentId = '';
            let channelId = '';
            const entityWarehouse = document.getElementById('edit-warehouse-entity').value;
            
            if (type === 'main' || type === 'department') {
                departmentId = document.getElementById('edit-warehouse-department').value;
            } else if (type === 'channel') {
                channelId = document.getElementById('edit-warehouse-channel').value;
            }
            
            if (!name) {
                alert('请输入虚拟仓名称');
                return;
            }
            
            // 模拟保存
            alert('虚拟仓名称编辑成功');
            closeModal('edit-warehouse-modal');
        }

        function moveSelectedUsers(from, to) {
            const fromCheckboxes = document.querySelectorAll(`.${from}-user-checkbox:checked`);
            const toContainer = document.querySelector(`.${to}-user-checkbox`).parentElement.parentElement.parentElement;
            
            fromCheckboxes.forEach(checkbox => {
                const userItem = checkbox.parentElement.parentElement;
                const newUserItem = userItem.cloneNode(true);
                newUserItem.querySelector('input').classList.remove(`${from}-user-checkbox`);
                newUserItem.querySelector('input').classList.add(`${to}-user-checkbox`);
                toContainer.appendChild(newUserItem);
                userItem.remove();
            });
            
            updateSelectedCount();
        }

        function saveUsers() {
            // 模拟保存
            alert('用户关联成功');
            closeModal('add-user-modal');
        }

        function deleteWarehouse(id, name) {
            if (confirm('确定要删除虚拟仓名称 ' + name + ' 吗？')) {
                // 模拟删除
                alert('虚拟仓名称删除成功');
            }
        }

        // 库存管理
        function updateInventoryWarehouseList() {
            const warehouseType = document.getElementById('inventory-warehouse-type').value;
            const warehouseSelect = document.getElementById('inventory-warehouse');
            
            // 清空现有选项
            warehouseSelect.innerHTML = '';
            
            // 根据仓库类型添加对应的虚拟仓
            if (!warehouseType) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = '请先选择仓库类型';
                warehouseSelect.appendChild(option);
                return;
            }
            
            // 定义不同类型的仓库
            const warehouses = {
                'main': [
                    { value: 'NBFX', text: 'NBFX主仓' }
                ],
                'department': [
                    { value: 'DEPT001', text: '运营部1仓' },
                    { value: 'DEPT002', text: '运营部2仓' },
                    { value: 'DEPT003', text: '运营部3仓' }
                ],
                'channel': [
                    { value: 'NBFX002', text: 'NBFX渠道仓A' },
                    { value: 'NBFX003', text: 'NBFX渠道仓B' },
                    { value: 'NBFX004', text: 'NBFX渠道仓C' }
                ],
                'stock': [
                    { value: 'STOCK001', text: '备货仓1' },
                    { value: 'STOCK002', text: '备货仓2' }
                ]
            };
            
            // 添加对应类型的仓库选项
            const warehouseList = warehouses[warehouseType] || [];
            warehouseList.forEach(warehouse => {
                const option = document.createElement('option');
                option.value = warehouse.value;
                option.textContent = warehouse.text;
                warehouseSelect.appendChild(option);
            });
        }

        function saveInventory() {
            const sku = document.getElementById('inventory-sku').value;
            const name = document.getElementById('inventory-name').value;
            const warehouseType = document.getElementById('inventory-warehouse-type').value;
            const warehouse = document.getElementById('inventory-warehouse').value;
            const quantity = document.getElementById('inventory-quantity').value;
            
            if (!sku || !name || !warehouseType || !warehouse || !quantity) {
                alert('请填写所有必填字段');
                return;
            }
            
            // 模拟保存
            alert('库存新增成功');
            closeModal('inventory-modal');
        }

        // 调拨管理
        // 判断仓库类型
        function getWarehouseType(warehouseCode) {
            const mainWarehouses = ['NBFX'];
            const channelWarehouses = ['NBFX002', 'NBFX003', 'NBFX004'];
            const stockWarehouses = ['STOCK001', 'STOCK002'];
            
            if (mainWarehouses.includes(warehouseCode)) {
                return 'main';
            } else if (channelWarehouses.includes(warehouseCode)) {
                return 'channel';
            } else if (stockWarehouses.includes(warehouseCode)) {
                return 'stock';
            }
            return 'unknown';
        }
        
        // 处理调出仓库选择变化
        function handleTransferFromChange() {
            updateTransferStock();
            updateWarehouseOptions('from');
        }
        
        // 处理调入仓库选择变化
        function handleTransferToChange() {
            updateWarehouseOptions('to');
        }
        
        // 更新仓库选项的禁用状态
        function updateWarehouseOptions(changedField) {
            const fromSelect = document.getElementById('transfer-from');
            const toSelect = document.getElementById('transfer-to');
            const fromValue = fromSelect.value;
            const toValue = toSelect.value;
            
            // 主仓代码列表
            const mainWarehouses = ['NBFX'];
            
            if (changedField === 'from') {
                // 如果调出仓库是主仓，禁用调入仓库的主仓选项
                const isFromMain = mainWarehouses.includes(fromValue);
                
                // 遍历调入仓库的所有选项
                Array.from(toSelect.options).forEach(option => {
                    if (option.value === '') return; // 跳过默认选项
                    
                    // 如果调出仓库是主仓，且当前选项也是主仓，则禁用
                    if (isFromMain && mainWarehouses.includes(option.value)) {
                        option.disabled = true;
                        option.textContent = option.textContent.replace(' (不可选)', '') + ' (不可选)';
                    } else {
                        option.disabled = false;
                        option.textContent = option.textContent.replace(' (不可选)', '');
                    }
                });
                
                // 如果调入仓库当前选中的是被禁用的选项，清空选择
                if (toValue && mainWarehouses.includes(toValue) && isFromMain) {
                    toSelect.value = '';
                }
            } else if (changedField === 'to') {
                // 如果调入仓库是主仓，禁用调出仓库的主仓选项
                const isToMain = mainWarehouses.includes(toValue);
                
                // 遍历调出仓库的所有选项
                Array.from(fromSelect.options).forEach(option => {
                    if (option.value === '') return; // 跳过默认选项
                    
                    // 如果调入仓库是主仓，且当前选项也是主仓，则禁用
                    if (isToMain && mainWarehouses.includes(option.value)) {
                        option.disabled = true;
                        option.textContent = option.textContent.replace(' (不可选)', '') + ' (不可选)';
                    } else {
                        option.disabled = false;
                        option.textContent = option.textContent.replace(' (不可选)', '');
                    }
                });
                
                // 如果调出仓库当前选中的是被禁用的选项，清空选择
                if (fromValue && mainWarehouses.includes(fromValue) && isToMain) {
                    fromSelect.value = '';
                    updateTransferStock();
                }
            }
        }
        
        function updateTransferStock() {
            const from = document.getElementById('transfer-from').value;
            const sku = document.getElementById('transfer-sku').value;
            const stockElement = document.getElementById('transfer-stock');
            
            if (!from || !sku) {
                stockElement.textContent = '请先选择调出仓库和SKU';
                stockElement.className = 'form-input bg-gray-50 text-gray-500';
                return;
            }
            
            const stockMap = {
                'NBFX': { 'SKU001': 1000, 'SKU002': 800, 'SKU003': 500, 'SKU004': 1200, 'SKU005': 600 },
                'NBFX002': { 'SKU001': 300, 'SKU002': 200, 'SKU003': 150, 'SKU004': 400, 'SKU005': 250 },
                'NBFX003': { 'SKU001': 250, 'SKU002': 180, 'SKU003': 300, 'SKU004': 350, 'SKU005': 200 },
                'NBFX004': { 'SKU001': 400, 'SKU002': 350, 'SKU003': 280, 'SKU004': 500, 'SKU005': 320 },
                'DEPT001': { 'SKU001': 150, 'SKU002': 120, 'SKU003': 80, 'SKU004': 200, 'SKU005': 100 },
                'DEPT002': { 'SKU001': 120, 'SKU002': 100, 'SKU003': 70, 'SKU004': 180, 'SKU005': 90 },
                'DEPT003': { 'SKU001': 100, 'SKU002': 80, 'SKU003': 60, 'SKU004': 150, 'SKU005': 80 },
                'STOCK001': { 'SKU001': 2000, 'SKU002': 1500, 'SKU003': 1000, 'SKU004': 2500, 'SKU005': 1200 },
                'STOCK002': { 'SKU001': 1800, 'SKU002': 1300, 'SKU003': 900, 'SKU004': 2200, 'SKU005': 1100 }
            };
            
            const stock = stockMap[from]?.[sku] ?? 0;
            stockElement.textContent = stock + ' 件';
            stockElement.className = stock > 0 ? 'form-input bg-green-50 text-green-600 font-medium' : 'form-input bg-red-50 text-red-600 font-medium';
        }
        
        function saveTransfer() {
            const from = document.getElementById('transfer-from').value;
            const to = document.getElementById('transfer-to').value;
            const sku = document.getElementById('transfer-sku').value;
            const quantity = document.getElementById('transfer-quantity').value;
            const migrateStorageFee = document.getElementById('transfer-migrate-storage-fee').checked;
            
            if (!from || !to || !sku || !quantity) {
                alert('请填写所有必填字段');
                return;
            }
            
            if (from === to) {
                alert('调出仓库和调入仓库不能相同');
                return;
            }
            
            // 计算仓储费承担方
            const storageFeePayer = migrateStorageFee ? to : from;
            
            // 模拟保存
            console.log('调拨信息:', {
                from: from,
                to: to,
                sku: sku,
                quantity: quantity,
                migrateStorageFee: migrateStorageFee,
                storageFeePayer: storageFeePayer
            });
            
            alert('调拨单创建成功\n仓储费承担方: ' + (migrateStorageFee ? '转入仓' : '调出仓'));
            closeModal('transfer-modal');
        }

        // 调拨单详情
        function detailTransfer(id) {
            openModal('transfer-detail-modal');
            document.getElementById('detail-transfer-no').textContent = id;
            document.getElementById('detail-transfer-status').textContent = '已完成';
            document.getElementById('detail-transfer-from').textContent = 'NBFX主仓';
            document.getElementById('detail-transfer-to').textContent = 'NBFX渠道仓A';
            document.getElementById('detail-transfer-sku').textContent = 'SKU001';
            document.getElementById('detail-transfer-quantity').textContent = '100';
            document.getElementById('detail-transfer-migrate').textContent = '是';
            document.getElementById('detail-transfer-create-time').textContent = '2026-02-27 10:00:00';
            document.getElementById('detail-transfer-operator').textContent = 'zsw';
            document.getElementById('detail-transfer-note').textContent = '备注信息';
        }

        // 编辑调拨单
        function editTransfer(id) {
            openModal('transfer-edit-modal');
            document.getElementById('edit-transfer-no').value = id;
            document.getElementById('edit-transfer-from').value = 'NBFX渠道仓A';
            document.getElementById('edit-transfer-to').value = 'NBFX渠道仓B';
            document.getElementById('edit-transfer-sku').value = 'SKU002';
            document.getElementById('edit-transfer-quantity').value = '50';
            document.getElementById('edit-transfer-migrate-storage-fee').checked = false;
            document.getElementById('edit-transfer-note').value = '备注信息';
        }

        // 删除调拨单
        function deleteTransfer(id, name) {
            if (confirm('确定要删除调拨单 ' + id + ' 吗？')) {
                alert('调拨单删除成功');
            }
        }

        // 审批调拨单
        function approveTransfer(id) {
            openModal('transfer-approve-modal');
            document.getElementById('approve-transfer-no').textContent = id;
            document.getElementById('approve-transfer-from').textContent = 'NBFX渠道仓A';
            document.getElementById('approve-transfer-to').textContent = 'NBFX渠道仓B';
            document.getElementById('approve-transfer-sku').textContent = 'SKU002';
            document.getElementById('approve-transfer-quantity').textContent = '50';
            document.getElementById('approve-transfer-migrate').textContent = '否';
        }

        // 保存编辑调拨单
        function saveEditTransfer() {
            const id = document.getElementById('edit-transfer-no').value;
            const from = document.getElementById('edit-transfer-from').value;
            const to = document.getElementById('edit-transfer-to').value;
            const sku = document.getElementById('edit-transfer-sku').value;
            const quantity = document.getElementById('edit-transfer-quantity').value;
            const migrateStorageFee = document.getElementById('edit-transfer-migrate-storage-fee').checked;
            const note = document.getElementById('edit-transfer-note').value;
            
            if (!from || !to || !sku || !quantity) {
                alert('请填写所有必填字段');
                return;
            }
            
            console.log('编辑调拨信息:', {
                id, from, to, sku, quantity, migrateStorageFee, note
            });
            
            alert('调拨单编辑成功\n仓储费承担方: ' + (migrateStorageFee ? '转入仓' : '调出仓'));
            closeModal('transfer-edit-modal');
        }

        // 保存审批调拨单
        function saveApproveTransfer() {
            const id = document.getElementById('approve-transfer-no').textContent;
            const result = document.getElementById('approve-transfer-result').value;
            const reason = document.getElementById('approve-transfer-reason').value;
            
            if (!result) {
                alert('请选择审批结果');
                return;
            }
            
            if (result === 'rejected' && !reason) {
                alert('拒绝时必须填写审批意见');
                return;
            }
            
            console.log('审批调拨单:', {
                id, result, reason
            });
            
            const resultText = result === 'approved' ? '通过' : '拒绝';
            alert('调拨单审批' + resultText + '成功');
            closeModal('transfer-approve-modal');
        }

        // 取消调拨单
        function cancelTransfer(id, name) {
            if (confirm('确定要取消调拨单 ' + id + ' 吗？')) {
                alert('调拨单取消成功');
            }
        }

        // 出库管理
        function saveShipment() {
            const warehouse = document.getElementById('shipment-warehouse').value;
            const sku = document.getElementById('shipment-sku').value;
            const quantity = document.getElementById('shipment-quantity').value;
            
            if (!warehouse || !sku || !quantity) {
                alert('请填写所有必填字段');
                return;
            }
            
            // 模拟保存
            alert('出库单创建成功');
            closeModal('shipment-modal');
        }

        // 出库单详情
        function detailShipment(id) {
            alert('查看出库单详情: ' + id);
        }

        // 编辑出库单
        function editShipment(id) {
            alert('编辑出库单: ' + id);
        }

        // 删除出库单
        function deleteShipment(id, name) {
            if (confirm('确定要删除出库单 ' + id + ' 吗？')) {
                alert('出库单删除成功');
            }
        }

        // 新出库页面操作
        function showNewShipmentPage() {
            // 隐藏所有页面
            document.querySelectorAll('.page').forEach(function(pageEl) {
                pageEl.classList.remove('active');
            });
            
            // 显示新出库页面
            const newShipmentPage = document.getElementById('page-new-shipment');
            if (newShipmentPage) {
                newShipmentPage.classList.add('active');
            }
        }

        function showShipmentList() {
            // 使用 switchPage 函数切换回出库列表页面
            if (typeof switchPage === 'function') {
                switchPage('shipment');
            } else if (typeof loadPage === 'function') {
                loadPage('shipment');
            } else {
                console.error('switchPage or loadPage function not found');
            }
        }

        function saveNewShipment() {
            // 获取表单数据
            const platform = document.getElementById('new-shipment-platform').value;
            const amazonStore = document.getElementById('new-shipment-amazon-store').value;
            const deliveryChannel = document.getElementById('new-shipment-delivery-channel').value;
            const recipientName = document.getElementById('new-shipment-recipient-name').value;
            const recipientCountry = document.getElementById('new-shipment-recipient-country').value;
            const recipientState = document.getElementById('new-shipment-recipient-state').value;
            const recipientCity = document.getElementById('new-shipment-recipient-city').value;
            const recipientCompanyName = document.getElementById('new-shipment-recipient-company-name').value;
            const recipientContact = document.getElementById('new-shipment-recipient-contact').value;
            const recipientCompany = document.getElementById('new-shipment-recipient-company').value;
            const recipientAddress = document.getElementById('new-shipment-recipient-address').value;
            const recipientZip = document.getElementById('new-shipment-recipient-zip').value;
            const warehouseType = document.getElementById('new-shipment-warehouse-type').value;
            const warehouseCode = document.getElementById('new-shipment-warehouse-code').value;
            const pickMethod = document.getElementById('new-shipment-pick-method').value;
            
            // 验证必填字段
            if (!platform || !amazonStore || !deliveryChannel || !recipientName || !recipientCountry || 
                !recipientState || !recipientCity || !recipientCompanyName || !recipientContact || 
                !recipientCompany || !recipientAddress || !recipientZip || !warehouseType || 
                !warehouseCode || !pickMethod) {
                alert('请填写所有必填字段');
                return;
            }
            
            // 模拟保存
            alert('出库单创建成功');
            showShipmentList();
        }

        // Mermaid图表放大预览功能
        let currentMermaidCode = '';
        
        function openMermaidModal(container) {
            const mermaidDiv = container.querySelector('.mermaid');
            if (!mermaidDiv) return;
            
            // 获取mermaid代码
            currentMermaidCode = mermaidDiv.getAttribute('data-processed') === 'true' 
                ? mermaidDiv.innerHTML 
                : mermaidDiv.textContent;
            
            const modal = document.getElementById('mermaidModal');
            const modalContent = document.getElementById('mermaidModalContent');
            
            // 复制图表内容到模态框
            modalContent.innerHTML = mermaidDiv.innerHTML;
            
            // 显示模态框
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 重新渲染mermaid图表
            if (window.mermaid) {
                mermaid.run();
            }
        }
        
        function closeMermaidModal(event) {
            // 如果点击的是模态框背景或关闭按钮，则关闭
            if (event && event.target !== event.currentTarget && !event.target.closest('.mermaid-modal-close')) {
                return;
            }
            
            const modal = document.getElementById('mermaidModal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // ESC键关闭模态框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMermaidModal();
            }
        });

        // 加载并渲染 Markdown PRD
        let prdLoaded = false;
        
        // 加载并渲染 Markdown 测试用例
        let testCasesLoaded = false;

        function loadPRD() {
            if (prdLoaded) return;
            
            console.log('开始加载PRD...');
            const prdContentDiv = document.getElementById('prd-content');
            
            // 确保marked已经初始化
            if (typeof marked === 'undefined') {
                console.error('Marked库未加载');
                prdContentDiv.innerHTML = 
                    '<div class="text-center py-8">' +
                    '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                    '<p class="text-red-500 mb-4">错误: Marked库未加载</p>' +
                    '</div>';
                return;
            }
            
            // 使用XMLHttpRequest加载PRD文件
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'prd.md', true);
            xhr.onreadystatechange = function() {
                console.log('Ready state:', xhr.readyState, 'Status:', xhr.status);
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const markdown = xhr.responseText;
                        console.log('PRD内容长度:', markdown.length);
                        
                        try {
                            const html = marked.parse(markdown);
                            console.log('Markdown解析结果类型:', typeof html);
                            console.log('Markdown解析结果预览:', html.substring(0, 100) + '...');
                            prdContentDiv.innerHTML = html;
                            
                            // 生成目录导航
                            generateTOC();
                            
                            // 重新初始化Mermaid图表
                            if (window.mermaid) {
                                setTimeout(function() {
                                    const mermaidElements = prdContentDiv.querySelectorAll('.mermaid');
                                    if (mermaidElements.length > 0) {
                                        console.log('找到Mermaid图表数量:', mermaidElements.length);
                                        mermaid.run();
                                    }
                                }, 100);
                            }
                            
                            prdLoaded = true;
                            console.log('PRD加载完成');
                        } catch (error) {
                            console.error('Markdown解析错误:', error);
                            prdContentDiv.innerHTML = 
                                '<div class="text-center py-8">' +
                                '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                                '<p class="text-red-500 mb-4">解析失败: ' + error.message + '</p>' +
                                '</div>';
                        }
                    } else {
                        // 加载失败，显示错误信息
                        console.error('PRD加载失败:', xhr.status);
                        prdContentDiv.innerHTML = 
                            '<div class="text-center py-8">' +
                            '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                            '<p class="text-red-500 mb-4">加载失败: HTTP ' + xhr.status + '</p>' +
                            '<button onclick="loadPRD()" class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-light">' +
                            '<i class="fa fa-refresh mr-2"></i>重试' +
                            '</button>' +
                            '</div>';
                    }
                }
            };
            xhr.onerror = function() {
                console.error('PRD加载网络错误');
                prdContentDiv.innerHTML = 
                    '<div class="text-center py-8">' +
                    '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                    '<p class="text-red-500 mb-4">加载失败: 网络错误</p>' +
                    '<button onclick="loadPRD()" class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-light">' +
                    '<i class="fa fa-refresh mr-2"></i>重试' +
                    '</button>' +
                    '</div>';
            };
            console.log('发送PRD请求...');
            xhr.send();
        }
        
        function loadTestCases() {
            if (testCasesLoaded) return;
            
            console.log('开始加载测试用例...');
            const testCasesContentDiv = document.getElementById('testcases-content');
            
            // 确保marked已经初始化
            if (typeof marked === 'undefined') {
                console.error('Marked库未加载');
                testCasesContentDiv.innerHTML = 
                    '<div class="text-center py-8">' +
                    '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                    '<p class="text-red-500 mb-4">错误: Marked库未加载</p>' +
                    '</div>';
                return;
            }
            
            // 使用XMLHttpRequest加载测试用例文件
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'test-cases.md', true);
            xhr.onreadystatechange = function() {
                console.log('Ready state:', xhr.readyState, 'Status:', xhr.status);
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const markdown = xhr.responseText;
                        console.log('测试用例内容长度:', markdown.length);
                        
                        try {
                            const html = marked.parse(markdown);
                            console.log('Markdown解析结果类型:', typeof html);
                            console.log('Markdown解析结果预览:', html.substring(0, 100) + '...');
                            testCasesContentDiv.innerHTML = html;
                            
                            // 生成测试用例目录导航
                            generateTestCasesTOC();
                            
                            // 重新初始化Mermaid图表
                            if (window.mermaid) {
                                setTimeout(function() {
                                    const mermaidElements = testCasesContentDiv.querySelectorAll('.mermaid');
                                    if (mermaidElements.length > 0) {
                                        console.log('找到Mermaid图表数量:', mermaidElements.length);
                                        mermaid.run();
                                    }
                                }, 100);
                            }
                            
                            testCasesLoaded = true;
                            console.log('测试用例加载完成');
                        } catch (error) {
                            console.error('Markdown解析错误:', error);
                            testCasesContentDiv.innerHTML = 
                                '<div class="text-center py-8">' +
                                '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                                '<p class="text-red-500 mb-4">解析错误: ' + error.message + '</p>' +
                                '</div>';
                        }
                    } else {
                        console.error('加载失败:', xhr.status);
                        testCasesContentDiv.innerHTML = 
                            '<div class="text-center py-8">' +
                            '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                            '<p class="text-red-500 mb-4">加载失败: HTTP ' + xhr.status + '</p>' +
                            '<button onclick="loadTestCases()" class="mt-4 px-4 py-2 bg-primary text-white rounded">重试</button>' +
                            '</div>';
                    }
                }
            };
            xhr.onerror = function() {
                console.error('网络错误');
                testCasesContentDiv.innerHTML = 
                    '<div class="text-center py-8">' +
                    '<i class="fa fa-exclamation-triangle text-2xl text-red-500 mb-4"></i>' +
                    '<p class="text-red-500 mb-4">网络错误，无法加载测试用例文件</p>' +
                    '<button onclick="loadTestCases()" class="mt-4 px-4 py-2 bg-primary text-white rounded">重试</button>' +
                    '</div>';
            };
            console.log('发送测试用例请求...');
            xhr.send();
        }
        
        function generateTestCasesTOC() {
            const content = document.getElementById('testcases-content');
            const headings = content.querySelectorAll('h2, h3');
            const tocNav = document.getElementById('testcases-toc-nav');
            
            if (!tocNav || headings.length === 0) return;
            
            let tocHTML = '';
            let currentH2 = null;
            let h2Index = 0;
            
            headings.forEach((heading, index) => {
                const id = 'test-heading-' + index;
                heading.id = id;
                const level = heading.tagName.toLowerCase();
                
                if (level === 'h2') {
                    // 关闭之前的h2子项
                    if (currentH2) {
                        tocHTML += '</div></div>';
                    }
                    
                    h2Index++;
                    currentH2 = heading.textContent;
                    tocHTML += `
                        <div class="toc-item">
                            <button class="toc-toggle" onclick="toggleTestCasesTOC(${h2Index})">
                                <i class="fa fa-chevron-right"></i>
                            </button>
                            <a href="#${id}" class="toc-level-2"><i class="fa fa-folder mr-2"></i>${heading.textContent}</a>
                            <div class="toc-children" id="test-toc-children-${h2Index}">
                    `;
                } else if (level === 'h3' && currentH2) {
                    tocHTML += `
                        <a href="#${id}" class="toc-level-3"><i class="fa fa-file-text-o mr-2"></i>${heading.textContent}</a>
                    `;
                }
            });
            
            // 关闭最后一个h2子项
            if (currentH2) {
                tocHTML += '</div></div>';
            }
            
            tocNav.innerHTML = tocHTML;
        }
        
        function toggleTestCasesTOC(index) {
            const children = document.getElementById(`test-toc-children-${index}`);
            const toggle = children.previousElementSibling;
            
            if (children.classList.contains('collapsed')) {
                children.classList.remove('collapsed');
                toggle.classList.remove('collapsed');
            } else {
                children.classList.add('collapsed');
                toggle.classList.add('collapsed');
            }
        }
        
        function generateTOC() {
            const content = document.getElementById('prd-content');
            const headings = content.querySelectorAll('h2, h3');
            const tocNav = document.getElementById('prd-toc-nav');
            
            if (!tocNav || headings.length === 0) return;
            
            let tocHTML = '';
            let currentH2 = null;
            let h2Index = 0;
            
            headings.forEach((heading, index) => {
                const id = 'heading-' + index;
                heading.id = id;
                const level = heading.tagName.toLowerCase();
                
                if (level === 'h2') {
                    // 关闭之前的h2子项
                    if (currentH2) {
                        tocHTML += '</div></div>';
                    }
                    
                    h2Index++;
                    currentH2 = heading.textContent;
                    tocHTML += `
                        <div class="toc-item">
                            <button class="toc-toggle" onclick="toggleTOC(${h2Index})">
                                <i class="fa fa-chevron-right"></i>
                            </button>
                            <a href="#${id}" class="toc-level-2"><i class="fa fa-folder mr-2"></i>${heading.textContent}</a>
                            <div class="toc-children" id="toc-children-${h2Index}">
                    `;
                } else if (level === 'h3' && currentH2) {
                    tocHTML += `
                        <a href="#${id}" class="toc-level-3"><i class="fa fa-file-text-o mr-2"></i>${heading.textContent}</a>
                    `;
                }
            });
            
            // 关闭最后一个h2子项
            if (currentH2) {
                tocHTML += '</div></div>';
            }
            
            tocNav.innerHTML = tocHTML;
        }
        
        function toggleTOC(index) {
            const children = document.getElementById(`toc-children-${index}`);
            const toggle = children.previousElementSibling;
            
            if (children.classList.contains('collapsed')) {
                children.classList.remove('collapsed');
                toggle.classList.remove('collapsed');
            } else {
                children.classList.add('collapsed');
                toggle.classList.add('collapsed');
            }
        }
        
        function switchMainTab(tab) {
            console.log('switchMainTab called with tab:', tab);
            var header = document.querySelector('header');
            var prototypeTabBtn = document.getElementById('tab-prototype');
            var prdTabBtn = document.getElementById('tab-prd');
            var testCasesTabBtn = document.getElementById('tab-testcases');
            var mainPrototype = document.getElementById('main-prototype');
            var mainPrd = document.getElementById('main-prd');
            var mainTestCases = document.getElementById('main-testcases');
            
            // 重置所有标签按钮状态
            prototypeTabBtn.className = 'tab';
            prdTabBtn.className = 'tab';
            testCasesTabBtn.className = 'tab';
            
            // 隐藏所有主内容
            mainPrototype.style.display = 'none';
            mainPrd.style.display = 'none';
            mainTestCases.style.display = 'none';
            
            if (tab === 'prototype') {
                header.style.display = 'block';
                prototypeTabBtn.className = 'tab active';
                mainPrototype.style.display = 'block';
                console.log('Switched to prototype tab');
            } else if (tab === 'prd') {
                header.style.display = 'none';
                prdTabBtn.className = 'tab active';
                mainPrd.style.display = 'block';
                console.log('Switched to PRD tab, calling loadPRD()');
                loadPRD();
            } else if (tab === 'testcases') {
                header.style.display = 'none';
                testCasesTabBtn.className = 'tab active';
                mainTestCases.style.display = 'block';
                console.log('Switched to test cases tab, calling loadTestCases()');
                loadTestCases();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
