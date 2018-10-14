function injectScript() {
    var callback = function(){};
    var routine = function() {
        var srcs = Array.prototype.slice.call(arguments);
        var src = srcs.shift();
        var s = document.createElement('script');
        // TODO: add "inline.js" to web_accessible_resources in manifest.json
        s.src = chrome.extension.getURL(src);
        s.id  = 'cpm_inject';
        s.onload = function () {
            this.parentNode.removeChild(this);
            if (srcs.length) {
                routine.apply(null, srcs);
            } else {
                callback();
            }
        };
        (document.head || document.documentElement).appendChild(s);
    };

    routine.apply(null, arguments);

    return {
        done: function(clientCb){
            callback = clientCb;
        }
    };
}