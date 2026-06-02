(function() {
    'use strict';

    var Utils = {
        getWarehouseType: function(warehouseCode) {
            var mainWarehouses = ['NBFX'];
            var channelWarehouses = ['NBFX002', 'NBFX003', 'NBFX004'];
            var stockWarehouses = ['STOCK001', 'STOCK002'];

            if (mainWarehouses.indexOf(warehouseCode) !== -1) return 'main';
            if (channelWarehouses.indexOf(warehouseCode) !== -1) return 'channel';
            if (stockWarehouses.indexOf(warehouseCode) !== -1) return 'stock';

            return 'department';
        },

        showAlert: function(message) {
            alert(message);
        },

        showConfirm: function(message) {
            return confirm(message);
        },

        debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },

        throttle: function(func, limit) {
            var inThrottle;
            return function() {
                var context = this;
                var args = arguments;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(function() {
                        inThrottle = false;
                    }, limit);
                }
            };
        },

        formatDateTime: function(date) {
            if (!date) return '';
            var d = new Date(date);
            var year = d.getFullYear();
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            var hours = String(d.getHours()).padStart(2, '0');
            var minutes = String(d.getMinutes()).padStart(2, '0');
            var seconds = String(d.getSeconds()).padStart(2, '0');
            return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
        }
    };

    window.VirtualWarehouseUtils = Utils;
})();