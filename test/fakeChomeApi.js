(function () {
    'use strict';
    var storage = {};
    window.chrome = window.chrome || {};


    window.chrome.extension = {
        onRequest: {
            addListener: function () {},
        },

        getURL: function () {},
        getBackgroundPage: function () {},
        sendRequest: function () {},
    };

    window.chrome.tabs = {
        getSelected: function () {},
        sendRequest: function () {},
    };

    window.chrome.storage = {
        sync: {
            set: function (object, callback) {
                Object.keys(object).forEach(function (key, value) {
                    storage[key] = value;
                });
                callback();
            },
            get: function (ids, callback) {
                if (ids === null) {
                    callback(storage);
                    return;
                }
                ids = typeof ids === 'string' ? [ids] : ids;
                callback(ids.map(function () {
                    return storage[ids];
                }));
            },
            remove: function (ids, callback) {
                ids = typeof ids === 'string' ? [ids] : ids;
                ids.forEach(function (id) {
                    delete storage[id];
                });
                callback();
            },
        },
    };

    window.chrome.sendResponse = function () {};
})();
