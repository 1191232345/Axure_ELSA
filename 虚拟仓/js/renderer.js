(function() {
    'use strict';

    var Renderer = {
        renderPage: function(container, html) {
            container.innerHTML = html;
            var pageDiv = container.querySelector('.page');
            if (pageDiv) {
                pageDiv.classList.add('active');
            }
        },

        openModal: function(modalId) {
            var modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        },

        closeModal: function(modalId) {
            var modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        },

        updateSelectedCount: function() {
            var leftChecked = document.querySelectorAll('.left-user-checkbox:checked').length;
            var rightChecked = document.querySelectorAll('.right-user-checkbox:checked').length;
            var leftCountEl = document.getElementById('left-selected-count');
            var rightCountEl = document.getElementById('right-selected-count');
            if (leftCountEl) leftCountEl.textContent = leftChecked;
            if (rightCountEl) rightCountEl.textContent = rightChecked;
        },

        toggleDepartment: function(id) {
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
        },

        updateWarehouseFields: function(type) {
            var departmentField = document.getElementById('department-field');
            var channelField = document.getElementById('channel-field');
            
            if (!departmentField || !channelField) return;

            if (type === 'department') {
                departmentField.style.display = 'block';
                channelField.style.display = 'none';
            } else if (type === 'channel') {
                departmentField.style.display = 'none';
                channelField.style.display = 'block';
            } else if (type === 'stock') {
                departmentField.style.display = 'none';
                channelField.style.display = 'none';
            }
        },

        updateInventoryWarehouseList: function(warehouseType) {
            var warehouseSelect = document.getElementById('inventory-warehouse');
            if (!warehouseSelect) return;

            warehouseSelect.innerHTML = '';

            if (!warehouseType) {
                var option = document.createElement('option');
                option.value = '';
                option.textContent = '请先选择仓库类型';
                warehouseSelect.appendChild(option);
                return;
            }

            var warehouses = {
                'main': [{ value: 'NBFX', text: 'NBFX主仓' }],
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
        },

        initMermaid: function() {
            if (window.mermaid) {
                setTimeout(function() {
                    mermaid.run();
                }, 100);
            }
        }
    };

    window.VirtualWarehouseRenderer = Renderer;
})();