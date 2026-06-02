(function() {
    'use strict';

    var pageCache = {};

    var Api = {
        fetchPage: function(pageName) {
            if (pageCache[pageName]) {
                return Promise.resolve(pageCache[pageName]);
            }
            return fetch('pages/' + pageName + '.html')
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('HTTP error! status: ' + response.status);
                    }
                    return response.text();
                })
                .then(function(html) {
                    pageCache[pageName] = html;
                    return html;
                });
        },

        clearCache: function() {
            pageCache = {};
        },

        getCache: function() {
            return pageCache;
        }
    };

    window.VirtualWarehouseApi = Api;
})();