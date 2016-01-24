/* global chrome, Bridge,  */
var bridge = new Bridge({namespace: "x44g8LoO3gK1"});

/**
 * @param {[String, String[]]} data
 *  key and placeholders.
 * @param {Function} callback
 * }
 */
function i18n(data, callback) {
    var mainKey = data[0], placeholders = data[1], placeholder, i18nRegEx = /^\$(.+)\$$/;
    if (placeholders && placeholders.length) {
        for (var i = 0; i < placeholders.length; i++) {
            placeholder = placeholders[i];
            if (i18nRegEx.test(placeholder)) {
                placeholders[i] = chrome.i18n.getMessage(placeholder.replace(i18nRegEx, '$1'));
            }
        }

    }

    callback(chrome.i18n.getMessage(mainKey, placeholders));
}

bridge.on('i18n', i18n);

setTimeout(function(){
    injectScript("build/inline.js").done(function(){
        console.log('injection is complete.');
    })
}, 0);