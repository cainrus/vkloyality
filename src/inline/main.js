/* global cur, Storage, Banner */

var $ = jQuery.noConflict();
var prevEventData = null;
var banner, storage;
var bridge = new Bridge({namespace: "x44g8LoO3gK1"});

setTimeout(function () {

    banner = new Banner({});
    banner.show = function (mode) {
        bridge.request('i18n', ['notification', ['$blacklist$', '$groupName$']], function (text) {
            Banner.prototype.show.call(banner, mode, text);
        });
    };

    storage = new Storage({namespace: "x44g8LoO3gK1"});

    if (cur.module.toLowerCase() === 'profile') {
        notify();
    }
}, 0);


function notify(options) {
    options = options || {};
    var eventData = {page: options.page || cur.module, id: options.id || cur.oid};
    if (JSON.stringify(prevEventData) !== JSON.stringify(eventData)) {
        prevEventData = eventData;
        updateState(eventData);
    } else {
        prevEventData = eventData;
    }
}

function updateState(eventData) {
    if (eventData.page === "profile") {

        var user = new User(eventData.id);
        user.load()
            .then(function (state) {

                if (state === this.BLACKLIST) {
                    banner.show('blacklist');
                } else if (state === this.WHITELIST) {
                    banner.show('whitelist');
                }
            });
    } else {
        banner.hide();
    }
}
