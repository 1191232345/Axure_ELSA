(function() {
    'use strict';

    var currentDepartmentId = '';
    var Api = window.VirtualWarehouseApi;
    var Renderer = window.VirtualWarehouseRenderer;
    var Utils = window.VirtualWarehouseUtils;

    var DATA_CONFIG = {
        pageId: 'virtual-warehouse',
        dataFile: 'data/virtual-warehouse-data.json',
        version: '1.0.0'
    };

    function init() {
        bindUserSelectEvents();
        bindModalEvents();
        Renderer.initMermaid();
        loadDefaultPage();
        initSplitView();
    }

    function loadDefaultPage() {
        var container = document.getElementById('page-container');
        if (container && container.children.length === 0) {
            switchPage('organization');
        }
    }

    function initSplitView() {
        var STORAGE_KEY = 'elsa-virtual-warehouse-split-state';
        var currentRatio = 0.55;
        var isCollapsed = false;
        var isDragging = false;

        var splitContainer = document.getElementById('splitContainer');
        var splitLeft = document.getElementById('splitLeft');
        var splitRight = document.getElementById('splitRight');
        var splitDivider = document.getElementById('splitDivider');
        var expandBtn = document.getElementById('expandBtn');

        if (!splitContainer || !splitLeft || !splitRight || !splitDivider) return;

        function loadState() {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    var state = JSON.parse(saved);
                    currentRatio = state.ratio || 0.55;
                    isCollapsed = state.collapsed || false;
                } catch (e) {
                    currentRatio = 0.55;
                    isCollapsed = false;
                }
            }
        }

        function saveState() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ratio: currentRatio,
                collapsed: isCollapsed
            }));
        }

        function applyLayout() {
            if (isCollapsed) {
                splitLeft.style.flex = '1 1 100%';
                splitRight.classList.add('collapsed');
                if (expandBtn) expandBtn.classList.add('show');
            } else {
                splitLeft.style.flex = '0 0 ' + (currentRatio * 100) + '%';
                splitRight.classList.remove('collapsed');
                splitRight.style.flex = '0 0 ' + ((1 - currentRatio) * 100) + '%';
                if (expandBtn) expandBtn.classList.remove('show');
            }
        }

        loadState();
        applyLayout();

        splitDivider.addEventListener('mousedown', function(e) {
            if (isCollapsed) return;
            isDragging = true;
            splitDivider.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            splitRight.style.transition = 'none';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var containerRect = splitContainer.getBoundingClientRect();
            var availableWidth = containerRect.width;
            var ratio = (e.clientX - containerRect.left) / availableWidth;
            currentRatio = Math.max(0.35, Math.min(0.75, ratio));
            splitLeft.style.flex = '0 0 ' + (currentRatio * 100) + '%';
            splitRight.style.flex = '0 0 ' + ((1 - currentRatio) * 100) + '%';
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                splitDivider.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                splitRight.style.transition = '';
                saveState();
            }
        });

        splitDivider.addEventListener('dblclick', function() {
            if (isCollapsed) return;
            currentRatio = 0.55;
            applyLayout();
            saveState();
        });

        window.toggleLogicPanel = function() {
            isCollapsed = !isCollapsed;
            applyLayout();
            saveState();
        };

        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                window.toggleLogicPanel();
            }
        });
    }

    function switchPage(pageName) {
        var container = document.getElementById('page-container');
        if (!container) return;

        Api.fetchPage(pageName)
            .then(function(html) {
                Renderer.renderPage(container, html);
                Renderer.initMermaid();
            })
            .catch(function(error) {
                console.error('Error loading page:', error);
                container.innerHTML = '<div class="p-8 text-center text-red-500">加载页面失败: ' + pageName + '</div>';
            });
    }

    function bindUserSelectEvents() {
        var selectAllLeftUsers = document.getElementById('select-all-left-users');
        if (selectAllLeftUsers) {
            selectAllLeftUsers.addEventListener('change', function() {
                var checkboxes = document.querySelectorAll('.left-user-checkbox');
                checkboxes.forEach(function(cb) {
                    cb.checked = this.checked;
                }.bind(this));
                Renderer.updateSelectedCount();
            });
        }

        var selectAllRightUsers = document.getElementById('select-all-right-users');
        if (selectAllRightUsers) {
            selectAllRightUsers.addEventListener('change', function() {
                var checkboxes = document.querySelectorAll('.right-user-checkbox');
                checkboxes.forEach(function(cb) {
                    cb.checked = this.checked;
                }.bind(this));
                Renderer.updateSelectedCount();
            });
        }

        var leftUserList = document.getElementById('left-user-list');
        if (leftUserList) {
            leftUserList.addEventListener('change', function(e) {
                if (e.target.classList.contains('left-user-checkbox')) {
                    Renderer.updateSelectedCount();
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
                    Renderer.updateSelectedCount();
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

    window.openModal = Renderer.openModal;
    window.closeModal = Renderer.closeModal;
    window.switchPage = switchPage;

    window.openNewDepartmentModal = function() {
        Renderer.openModal('new-department-modal');
        var nameInput = document.getElementById('new-department-name');
        var parentInput = document.getElementById('new-department-parent');
        if (nameInput) nameInput.value = '';
        if (parentInput) parentInput.value = '';
    };

    window.saveNewDepartment = function() {
        var name = document.getElementById('new-department-name').value;
        if (!name) {
            Utils.showAlert('请输入部门名称');
            return;
        }
        Utils.showAlert('部门创建成功');
        Renderer.closeModal('new-department-modal');
    };

    window.editDepartment = function(id, name, parentId) {
        Renderer.openModal('edit-department-modal');
        var idInput = document.getElementById('edit-department-id');
        var nameInput = document.getElementById('edit-department-name');
        var parentInput = document.getElementById('edit-department-parent');
        if (idInput) idInput.value = id;
        if (nameInput) nameInput.value = name;
        if (parentInput) parentInput.value = parentId;
    };

    window.saveEditDepartment = function() {
        var name = document.getElementById('edit-department-name').value;
        if (!name) {
            Utils.showAlert('请输入部门名称');
            return;
        }
        Utils.showAlert('部门编辑成功');
        Renderer.closeModal('edit-department-modal');
    };

    window.deleteDepartment = function(id, name) {
        if (Utils.showConfirm('确定要删除部门 ' + name + ' 吗？')) {
            Utils.showAlert('部门删除成功');
        }
    };

    window.toggleDepartment = Renderer.toggleDepartment;

    window.viewWarehouses = function(departmentId, departmentName) {
        var nameEl = document.getElementById('view-warehouses-department-name');
        if (nameEl) nameEl.textContent = departmentName;
        Renderer.openModal('view-warehouses-modal');
    };

    window.viewUsers = function(departmentId, departmentName) {
        var nameEl = document.getElementById('view-users-department-name');
        if (nameEl) nameEl.textContent = departmentName;
        Renderer.openModal('view-users-modal');
    };

    window.manageUsers = function(departmentId, departmentName) {
        currentDepartmentId = departmentId;
        var nameEl = document.getElementById('add-user-department-name');
        if (nameEl) nameEl.textContent = departmentName;

        var leftSearch = document.getElementById('left-user-search');
        var rightSearch = document.getElementById('right-user-search');
        if (leftSearch) leftSearch.value = '';
        if (rightSearch) rightSearch.value = '';

        document.querySelectorAll('.left-user-checkbox, .right-user-checkbox').forEach(function(cb) {
            cb.checked = false;
        });

        var selectAllLeft = document.getElementById('select-all-left-users');
        var selectAllRight = document.getElementById('select-all-right-users');
        if (selectAllLeft) selectAllLeft.checked = false;
        if (selectAllRight) selectAllRight.checked = false;

        Renderer.updateSelectedCount();
        Renderer.openModal('add-user-modal');
    };

    window.addSelectedToLeft = function() {
        var selectedItems = document.querySelectorAll('.left-user-checkbox:checked');
        if (selectedItems.length === 0) {
            Utils.showAlert('请选择要添加的用户');
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

        var selectAllLeft = document.getElementById('select-all-left-users');
        if (selectAllLeft) selectAllLeft.checked = false;
        Renderer.updateSelectedCount();
    };

    window.removeSelectedFromRight = function() {
        var selectedItems = document.querySelectorAll('.right-user-checkbox:checked');
        if (selectedItems.length === 0) {
            Utils.showAlert('请选择要移除的用户');
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

        var selectAllRight = document.getElementById('select-all-right-users');
        if (selectAllRight) selectAllRight.checked = false;
        Renderer.updateSelectedCount();
    };

    window.saveUserRelations = function() {
        var rightUsers = document.querySelectorAll('#right-user-list .user-item');
        var userNames = Array.from(rightUsers).map(function(item) {
            return item.dataset.userName;
        }).join('、');

        if (Utils.showConfirm('确定保存当前的用户关联关系吗？\n已关联用户：' + userNames)) {
            Utils.showAlert('保存成功');
            Renderer.closeModal('add-user-modal');
        }
    };

    window.openNewWarehouseModal = function() {
        Renderer.openModal('new-warehouse-modal');
        var nameInput = document.getElementById('new-warehouse-name');
        var typeInput = document.getElementById('new-warehouse-type');
        var deptInput = document.getElementById('new-warehouse-department');
        var entityInput = document.getElementById('new-warehouse-entity');
        if (nameInput) nameInput.value = '';
        if (typeInput) typeInput.value = 'department';
        if (deptInput) deptInput.value = '1';
        if (entityInput) entityInput.value = 'DE001';
        Renderer.updateWarehouseFields('department');
    };

    window.updateWarehouseFields = function() {
        var typeInput = document.getElementById('new-warehouse-type');
        if (typeInput) {
            Renderer.updateWarehouseFields(typeInput.value);
        }
    };

    window.saveNewWarehouse = function() {
        var name = document.getElementById('new-warehouse-name').value;
        if (!name) {
            Utils.showAlert('请输入虚拟仓名称');
            return;
        }
        Utils.showAlert('虚拟仓名称创建成功');
        Renderer.closeModal('new-warehouse-modal');
    };

    window.updateEditWarehouseFields = function() {
        var typeInput = document.getElementById('edit-warehouse-type');
        if (typeInput) {
            Renderer.updateWarehouseFields(typeInput.value);
        }
    };

    window.editWarehouse = function(id, name, type, departmentId, entityWarehouse) {
        Renderer.openModal('edit-warehouse-modal');
        var idInput = document.getElementById('edit-warehouse-id');
        var nameInput = document.getElementById('edit-warehouse-name');
        var typeInput = document.getElementById('edit-warehouse-type');
        var deptInput = document.getElementById('edit-warehouse-department');
        var entityInput = document.getElementById('edit-warehouse-entity');
        if (idInput) idInput.value = id;
        if (nameInput) nameInput.value = name;
        if (typeInput) typeInput.value = type;
        if (deptInput) deptInput.value = departmentId;
        if (entityInput) entityInput.value = entityWarehouse;
        Renderer.updateWarehouseFields(type);
    };

    window.saveEditWarehouse = function() {
        var name = document.getElementById('edit-warehouse-name').value;
        if (!name) {
            Utils.showAlert('请输入虚拟仓名称');
            return;
        }
        Utils.showAlert('虚拟仓名称编辑成功');
        Renderer.closeModal('edit-warehouse-modal');
    };

    window.deleteWarehouse = function(id, name) {
        if (Utils.showConfirm('确定要删除虚拟仓名称 ' + name + ' 吗？')) {
            Utils.showAlert('虚拟仓名称删除成功');
        }
    };

    window.updateInventoryWarehouseList = function() {
        var typeInput = document.getElementById('inventory-warehouse-type');
        if (typeInput) {
            Renderer.updateInventoryWarehouseList(typeInput.value);
        }
    };

    window.saveInventory = function() {
        var sku = document.getElementById('inventory-sku').value;
        var name = document.getElementById('inventory-name').value;
        var warehouseType = document.getElementById('inventory-warehouse-type').value;
        var warehouse = document.getElementById('inventory-warehouse').value;
        var quantity = document.getElementById('inventory-quantity').value;

        if (!sku || !name || !warehouseType || !warehouse || !quantity) {
            Utils.showAlert('请填写所有必填字段');
            return;
        }
        Utils.showAlert('库存新增成功');
        Renderer.closeModal('inventory-modal');
    };

    window.switchLogicTab = function(tabName) {
        document.querySelectorAll('.logic-tab').forEach(function(t) {
            t.classList.remove('active');
        });
        document.querySelectorAll('.logic-section-panel').forEach(function(p) {
            p.classList.remove('active');
        });

        var tab = document.querySelector('.logic-tab[data-tab="' + tabName + '"]');
        var panel = document.getElementById('panel-' + tabName);

        if (tab) tab.classList.add('active');
        if (panel) panel.classList.add('active');
    };

    window.switchMainTab = function(tabName) {
        document.querySelectorAll('.tab').forEach(function(t) {
            t.classList.remove('active');
        });
        document.querySelectorAll('.main-content').forEach(function(m) {
            m.classList.remove('active');
            m.style.display = 'none';
        });

        var tabBtn = document.getElementById('tab-' + tabName);
        var mainContent = document.getElementById('main-' + tabName);

        if (tabBtn) tabBtn.classList.add('active');
        if (mainContent) {
            mainContent.classList.add('active');
            mainContent.style.display = 'block';
        }

        if (tabName === 'prd') {
            loadPRD();
        } else if (tabName === 'testcases') {
            loadTestCases();
        }
    };

    function loadPRD() {
        fetch('prd.md')
            .then(function(response) {
                return response.text();
            })
            .then(function(text) {
                var contentEl = document.getElementById('prd-content');
                if (contentEl) {
                    contentEl.innerHTML = marked.parse(text);
                    Renderer.initMermaid();
                }
            })
            .catch(function(error) {
                console.error('Error loading PRD:', error);
            });
    }

    function loadTestCases() {
        fetch('test-cases.md')
            .then(function(response) {
                return response.text();
            })
            .then(function(text) {
                var contentEl = document.getElementById('testcases-content');
                if (contentEl) {
                    contentEl.innerHTML = marked.parse(text);
                }
            })
            .catch(function(error) {
                console.error('Error loading test cases:', error);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();