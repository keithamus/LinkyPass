(function () {
    'use strict';

    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function SiteProfile(options) {
        options = options || {};
        this.id = guid();
        this.type = 'site_profile';
        this.domain = options.domain || '';
        this.changeDomain = options.changeDomain || '';
        this.append = options.append || '';
    }

    SiteProfile.prototype = {
        constructor: SiteProfile,

        save: function save(callback) {
            var ob = {};
            ob[this.id] = JSON.stringify(this);
            chrome.storage.sync.set(ob, callback);
        }
    };

    SiteProfile.retreive = function retreive(id, callback) {
        chrome.storage.sync.get(id, function (items) {
            callback(Object.keys(items).map(function (key) {
                return new SiteProfile(JSON.parse(items[key]));
            }).filter(function (p){
                return p.type === 'site_profile';
            }));
        });
    };

    window.SiteProfile = SiteProfile;
})();
