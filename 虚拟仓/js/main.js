/**
 * 虚拟仓管理系统 - 模块交互逻辑
 */

(function() {
    'use strict';
    
    var currentDepartmentId = '';
    var pageCache = {};
    
    var DATA_CONFIG = {
        pageId: 'virtual-warehouse',
        dataFile: 'data/virtual-warehouse-data.json',
        apiBase: 'http://localhost:3100/api/data',
        version: '1.0.0'
    };

    function init() {
        bindUserSelectEvents();
        bindModalEvents();
        initMermaid();
        loadDefaultPage();
    }

    function loadDefaultPage() {
        var container = document.getElementById('page-container');
        if (container && container.children.length === 0) {
            switchPage('organization');
        }
    }

    function bindUserSelectEvents() {
        var selectAllLeftUsers = document.getElementById('select-all-left-users');
        if (selectAllLeftUsers) {
            selectAllLeftUsers.addEventListener('change', function() {
                var checkboxes = document.querySelectorAll('.left-user-checkbox');
                checkboxes.forEach(function(cb) {
                    cb.checked = this.checked;
                }.bind(this));
                updateSelectedCount();
            });
        }
        
        var selectAllRightUsers = document.getElementById('select-all-right-users');
        if (selectAllRightUsers) {
            selectAllRightUsers.addEventListener('change', function() {
                var checkboxes = document.querySelectorAll('.right-user-checkbox');
                checkboxes.forEach(function(cb) {
                    cb.checked = this.checked;
                }.bind(this));
                updateSelectedCount();
            });
        }
        
        var leftUserList = document.getElementById('left-user-list');
        if (leftUserList) {
            leftUserList.addEventListener('change', function(e) {
                if (e.target.classList.contains('left-user-checkbox')) {
                    updateSelectedCount();
                    var allCheckboxes = document.querySelectorAll('.left-user-checkbox');
                    var checkedCheckboxes = document.querySelectorAll('.left-user-checkbox:checked');
                    var selectAllLeft = document.getElementById('select-all-left-users');
                    if (selectAllLeft) {
                        selectAllLeft.checked = allCheckboxes.length === checkedCheckboxes.length;
                    }
                }
            });
        }
        
        var rightUserList = document.getElementById('right-user-list');
        if (rightUserList) {
            rightUserList.addEventListener('change', function(e) {
                if (e.target.classList.contains('right-user-checkbox')) {
                    updateSelectedCount();
                    var allCheckboxes = document.querySelectorAll('.right-user-checkbox');
                    var checkedCheckboxes = document.querySelectorAll('.right-user-checkbox:checked');
                    var selectAllRight = document.getElementById('select-all-right-users');
                    if (selectAllRight) {
                        selectAllRight.checked = allCheckboxes.length === checkedCheckboxes.length;
                    }
                }
            });
        }
    }

    function bindModalEvents() {
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    function initMermaid() {
        if (window.mermaid) {
            setTimeout(function() {
                mermaid.run();
            }, 100);
        }
    }

    function openModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    function openNewDepartmentModal() {
        openModal('new-department-modal');
        document.getElementById('new-department-name').value = '';
        document.getElementById('new-department-parent').value = '';
    }

    function saveNewDepartment() {
        var name = document.getElementById('new-department-name').value;
        var parentId = document.getElementById('new-department-parent').value;
        
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
        var id = document.getElementById('edit-department-id').value;
        var name = document.getElementById('edit-department-name').value;
        var parentId = document.getElementById('edit-department-parent').value;
        
        if (!name) {
            alert('请输入部门名称');
            return;
        }
        
        alert('部门编辑成功');
        closeModal('edit-department-modal');
    }

    function deleteDepartment(id, name) {
        if (confirm('确定要删除部门 ' + name + ' 吗？')) {
            alert('部门删除成功');
        }
    }

    function toggleDepartment(id) {
        var children = document.querySelectorAll('.department-child.department-' + id);
        var button = document.querySelector('button[onclick="toggleDepartment(' + id + ')"] i');
        
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
        document.querySelectorAll('.left-user-checkbox, .right-user-checkbox').forEach(function(cb) {
            cb.checked = false;
        });
        document.getElementById('select-all-left-users').checked = false;
        document.getElementById('select-all-right-users').checked = false;
        updateSelectedCount();
        openModal('add-user-modal');
    }
    
    function updateSelectedCount() {
        var leftChecked = document.querySelectorAll('.left-user-checkbox:checked').length;
        var rightChecked = document.querySelectorAll('.right-user-checkbox:checked').length;
        document.getElementById('left-selected-count').textContent = leftChecked;
        document.getElementById('right-selected-count').textContent = rightChecked;
    }
    
    function addSelectedToLeft() {
        var selectedItems = document.querySelectorAll('.left-user-checkbox:checked');
        if (selectedItems.length === 0) {
            alert('请选择要添加的用户');
            return;
        }
        
        var rightList = document.getElementById('right-user-list');
        selectedItems.forEach(function(checkbox) {
            var userItem = checkbox.closest('.user-item');
            checkbox.classList.remove('left-user-checkbox');
            checkbox.classList.add('right-user-checkbox');
            checkbox.checked = false;
            rightList.appendChild(userItem);
        });
        
        document.getElementById('select-all-left-users').checked = false;
        updateSelectedCount();
    }
    
    function removeSelectedFromRight() {
        var selectedItems = document.querySelectorAll('.right-user-checkbox:checked');
        if (selectedItems.length === 0) {
            alert('请选择要移除的用户');
            return;
        }
        
        var leftList = document.getElementById('left-user-list');
        selectedItems.forEach(function(checkbox) {
            var userItem = checkbox.closest('.user-item');
            checkbox.classList.remove('right-user-checkbox');
            checkbox.classList.add('left-user-checkbox');
            checkbox.checked = false;
            leftList.appendChild(userItem);
        });
        
        document.getElementById('select-all-right-users').checked = false;
        updateSelectedCount();
    }
    
    function saveUserRelations() {
        var rightUsers = document.querySelectorAll('#right-user-list .user-item');
        var userNames = Array.from(rightUsers).map(function(item) {
            return item.dataset.userName;
        }).join('、');
        
        if (confirm('确定保存当前的用户关联关系吗？\n已关联用户：' + userNames)) {
            alert('保存成功');
            closeModal('add-user-modal');
        }
    }
    
    function togglePrdLogic(module) {
        var content = document.getElementById(module + '-logic-content');
        var icon = document.getElementById(module + '-logic-icon');
        
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
            content.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    }

    function togglePrdFlow(module) {
        var content = document.getElementById(module + '-flow-content');
        var icon = document.getElementById(module + '-flow-icon');
        
        if (content) {
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(180deg)';
                
                setTimeout(function() {
                    var mermaidElements = content.querySelectorAll('.mermaid');
                    if (mermaidElements.length > 0 && window.mermaid) {
                        mermaid.run();
                    }
                }, 50);
            } else {
                content.classList.add('hidden');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        }
    }

    function openNewWarehouseModal() {
        openModal('new-warehouse-modal');
        document.getElementById('new-warehouse-name').value = '';
        document.getElementById('new-warehouse-type').value = 'department';
        document.getElementById('new-warehouse-department').value = '1';
        document.getElementById('new-warehouse-entity').value = 'DE001';
        updateWarehouseFields();
    }

    function updateWarehouseFields() {
        var warehouseType = document.getElementById('new-warehouse-type').value;
        var departmentField = document.getElementById('department-field');
        var channelField = document.getElementById('channel-field');
        
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
        var name = document.getElementById('new-warehouse-name').value;
        var type = document.getElementById('new-warehouse-type').value;
        var departmentId = '';
        var channelId = '';
        var entityWarehouse = document.getElementById('new-warehouse-entity').value;
        
        if (type === 'department') {
            departmentId = document.getElementById('new-warehouse-department').value;
        } else if (type === 'channel') {
            channelId = document.getElementById('new-warehouse-channel').value;
        }
        
        if (!name) {
            alert('请输入虚拟仓名称');
            return;
        }
        
        alert('虚拟仓名称创建成功');
        closeModal('new-warehouse-modal');
    }

    function updateEditWarehouseFields() {
        var warehouseType = document.getElementById('edit-warehouse-type').value;
        var departmentField = document.getElementById('edit-department-field');
        var channelField = document.getElementById('edit-channel-field');
        
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
        updateEditWarehouseFields();
    }

    function saveEditWarehouse() {
        var id = document.getElementById('edit-warehouse-id').value;
        var name = document.getElementById('edit-warehouse-name').value;
        var type = document.getElementById('edit-warehouse-type').value;
        var departmentId = '';
        var channelId = '';
        var entityWarehouse = document.getElementById('edit-warehouse-entity').value;
        
        if (type === 'main' || type === 'department') {
            departmentId = document.getElementById('edit-warehouse-department').value;
        } else if (type === 'channel') {
            channelId = document.getElementById('edit-warehouse-channel').value;
        }
        
        if (!name) {
            alert('请输入虚拟仓名称');
            return;
        }
        
        alert('虚拟仓名称编辑成功');
        closeModal('edit-warehouse-modal');
    }

    function moveSelectedUsers(from, to) {
        var fromCheckboxes = document.querySelectorAll('.' + from + '-user-checkbox:checked');
        var toContainer = document.querySelector('.' + to + '-user-checkbox').parentElement.parentElement.parentElement;
        
        fromCheckboxes.forEach(function(checkbox) {
            var userItem = checkbox.parentElement.parentElement;
            var newUserItem = userItem.cloneNode(true);
            newUserItem.querySelector('input').classList.remove(from + '-user-checkbox');
            newUserItem.querySelector('input').classList.add(to + '-user-checkbox');
            toContainer.appendChild(newUserItem);
            userItem.remove();
        });
        
        updateSelectedCount();
    }

    function saveUsers() {
        alert('用户关联成功');
        closeModal('add-user-modal');
    }

    function deleteWarehouse(id, name) {
        if (confirm('确定要删除虚拟仓名称 ' + name + ' 吗？')) {
            alert('虚拟仓名称删除成功');
        }
    }

    function updateInventoryWarehouseList() {
        var warehouseType = document.getElementById('inventory-warehouse-type').value;
        var warehouseSelect = document.getElementById('inventory-warehouse');
        
        warehouseSelect.innerHTML = '';
        
        if (!warehouseType) {
            var option = document.createElement('option');
            option.value = '';
            option.textContent = '请先选择仓库类型';
            warehouseSelect.appendChild(option);
            return;
        }
        
        var warehouses = {
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
        
        var warehouseList = warehouses[warehouseType] || [];
        warehouseList.forEach(function(warehouse) {
            var option = document.createElement('option');
            option.value = warehouse.value;
            option.textContent = warehouse.text;
            warehouseSelect.appendChild(option);
        });
    }

    function saveInventory() {
        var sku = document.getElementById('inventory-sku').value;
        var name = document.getElementById('inventory-name').value;
        var warehouseType = document.getElementById('inventory-warehouse-type').value;
        var warehouse = document.getElementById('inventory-warehouse').value;
        var quantity = document.getElementById('inventory-quantity').value;
        
        if (!sku || !name || !warehouseType || !warehouse || !quantity) {
            alert('请填写所有必填字段');
            return;
        }
        
        alert('库存新增成功');
        closeModal('inventory-modal');
    }

    function getWarehouseType(warehouseCode) {
        var mainWarehouses = ['NBFX'];
        var channelWarehouses = ['NBFX002', 'NBFX003', 'NBFX004'];
        var stockWarehouses = ['STOCK001', 'STOCK002'];
        
        if (mainWarehouses.indexOf(warehouseCode) !== -1) return 'main';
        if (channelWarehouses.indexOf(warehouseCode) !== -1) return 'channel';
        if (stockWarehouses.indexOf(warehouseCode) !== -1) return 'stock';
        
        return 'department';
    }

    function switchPage(pageName) {
        var container = document.getElementById('page-container');
        
        if (pageCache[pageName]) {
            container.innerHTML = pageCache[pageName];
            var pageDiv = container.querySelector('.page');
            if (pageDiv) pageDiv.classList.add('active');
            return;
        }
        
        fetch('pages/' + pageName + '.html')
            .then(function(response) {
                if (!response.ok) throw new Error('HTTP error! status: ' + response.status);
                return response.text();
            })
            .then(function(html) {
                pageCache[pageName] = html;
                container.innerHTML = html;
                var pageDiv = container.querySelector('.page');
                if (pageDiv) pageDiv.classList.add('active');
            })
            .catch(function(error) {
                console.error('Error loading page:', error);
                container.innerHTML = '<div class="bg-white rounded shadow-card p-8 text-center"><i class="fa fa-exclamation-triangle text-5xl text-warning mb-4"></i><p class="text-lg text-gray-600">页面加载失败</p><p class="text-sm text-gray-500 mt-2">' + error.message + '</p><button onclick="switchPage(\'' + pageName + '\')" class="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-light"><i class="fa fa-refresh mr-2"></i>重试</button></div>';
            });
    }

    function openMermaidModal(container) {
        var mermaidDiv = container.querySelector('.mermaid');
        if (!mermaidDiv) return;
        
        var modal = document.getElementById('mermaid-modal');
        var content = document.getElementById('mermaidModalContent');
        
        if (!modal || !content) return;
        
        content.innerHTML = '<div class="mermaid">' + mermaidDiv.textContent + '</div>';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (window.mermaid) {
            try {
                mermaid.init(undefined, content.querySelector('.mermaid'));
            } catch (e) {
                console.warn('mermaid init', e);
            }
        }
    }

    function closeMermaidModal(event) {
        if (event && event.target !== event.currentTarget) return;
        var modal = document.getElementById('mermaid-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openNewDepartmentModal = openNewDepartmentModal;
    window.saveNewDepartment = saveNewDepartment;
    window.editDepartment = editDepartment;
    window.saveEditDepartment = saveEditDepartment;
    window.deleteDepartment = deleteDepartment;
    window.toggleDepartment = toggleDepartment;
    window.viewWarehouses = viewWarehouses;
    window.viewUsers = viewUsers;
    window.manageUsers = manageUsers;
    window.updateSelectedCount = updateSelectedCount;
    window.addSelectedToLeft = addSelectedToLeft;
    window.removeSelectedFromRight = removeSelectedFromRight;
    window.saveUserRelations = saveUserRelations;
    window.togglePrdLogic = togglePrdLogic;
    window.togglePrdFlow = togglePrdFlow;
    window.openNewWarehouseModal = openNewWarehouseModal;
    window.updateWarehouseFields = updateWarehouseFields;
    window.saveNewWarehouse = saveNewWarehouse;
    window.updateEditWarehouseFields = updateEditWarehouseFields;
    window.editWarehouse = editWarehouse;
    window.saveEditWarehouse = saveEditWarehouse;
    window.moveSelectedUsers = moveSelectedUsers;
    window.saveUsers = saveUsers;
    window.deleteWarehouse = deleteWarehouse;
    window.updateInventoryWarehouseList = updateInventoryWarehouseList;
    window.saveInventory = saveInventory;
    window.getWarehouseType = getWarehouseType;
    window.switchPage = switchPage;
    window.openMermaidModal = openMermaidModal;
    window.closeMermaidModal = closeMermaidModal;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
