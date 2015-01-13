(function () {
    'use strict';

    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function Exception(options) {
        options = options || {};
        this.id = guid();
        this.type = 'exception';
        this.domain = options.domain || '';
        this.changeDomain = options.changeDomain || '';
        this.append = options.append || '';
    }

    Exception.prototype = {
        constructor: Exception,

        save: function save(callback) {
            var ob = {};
            ob[this.id] = JSON.stringify(this);
            chrome.storage.sync.set(ob, callback);
        }
    };

    Exception.retreive = function retreive(id, callback) {
        chrome.storage.sync.get(id, function (items) {
            callback(Object.keys(items).map(function (key) {
                var options = JSON.parse(items[key]),
                    exception = items[key] = Object.create(Password.prototype);
                Object.keys(options).forEach(function (key) {
                    exception[key] = options[key];
                });
                return exception;
            }).filter(function (p){
                return p.type === 'exception';
            }));
        });
    };

    window.Exception = Exception;
})();
