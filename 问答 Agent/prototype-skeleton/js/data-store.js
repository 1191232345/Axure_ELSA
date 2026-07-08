/** 数据层 — 支持 file:// 内嵌 mockData + localStorage */
(function (global) {
  'use strict';

  function storageKey(pageId) {
    return 'skel_prototype_' + pageId;
  }

  function loadLocal(pageId) {
    try {
      var raw = localStorage.getItem(storageKey(pageId));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocal(pageId, rows) {
    try {
      localStorage.setItem(storageKey(pageId), JSON.stringify(rows));
    } catch (e) {
      console.warn('[SkelStore] localStorage 保存失败', e);
    }
  }

  var store = {
    rows: [],
    spec: null,

    init: function (spec) {
      store.spec = spec;
      var embedded = Array.isArray(spec.mockData) ? spec.mockData.slice() : [];
      var cached = loadLocal(spec.pageId);

      if (SkelUtils.isFileProtocol()) {
        store.rows = cached.length ? cached : embedded;
        return Promise.resolve(store.rows);
      }

      if (typeof APIDataManager !== 'undefined' && SkelUtils.canFetchLocalFiles()) {
        APIDataManager.init({
          pageId: spec.pageId,
          dataFile: spec.dataFile,
          version: spec.version || '1.0.0',
        });
        return APIDataManager.loadData().then(function (result) {
          var rows = Array.isArray(result.data) ? result.data : [];
          if (!rows.length && embedded.length) {
            store.rows = embedded;
            return APIDataManager.saveData(embedded).then(function () { return store.rows; });
          }
          store.rows = rows.length ? rows : embedded;
          return store.rows;
        }).catch(function () {
          store.rows = cached.length ? cached : embedded;
          return store.rows;
        });
      }

      if (!SkelUtils.canFetchLocalFiles()) {
        store.rows = cached.length ? cached : embedded;
        return Promise.resolve(store.rows);
      }

      return fetch(spec.dataFile)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          store.rows = Array.isArray(data) ? data : (data.items || embedded);
          return store.rows;
        })
        .catch(function () {
          store.rows = cached.length ? cached : embedded;
          return store.rows;
        });
    },

    all: function () {
      return store.rows.slice();
    },

    saveAll: function (rows) {
      store.rows = rows;
      saveLocal(store.spec.pageId, rows);
      if (!SkelUtils.isFileProtocol() && typeof APIDataManager !== 'undefined') {
        return APIDataManager.saveData(rows);
      }
      return Promise.resolve({ success: true });
    },

    add: function (row) {
      var rows = store.all();
      row.id = row.id || ('id_' + Date.now());
      row.createdAt = row.createdAt || new Date().toISOString();
      rows.unshift(row);
      return store.saveAll(rows).then(function () { return row; });
    },

    update: function (id, patch) {
      var rows = store.all().map(function (r) {
        return r.id === id
          ? Object.assign({}, r, patch, { updatedAt: new Date().toISOString() })
          : r;
      });
      return store.saveAll(rows).then(function () {
        return rows.find(function (r) { return r.id === id; });
      });
    },

    remove: function (id) {
      var rows = store.all().filter(function (r) { return r.id !== id; });
      return store.saveAll(rows);
    },

    find: function (id) {
      return store.all().find(function (r) { return r.id === id; });
    },
  };

  global.SkelStore = store;
})(window);
