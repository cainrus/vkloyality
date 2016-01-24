var lastHref = location.pathname;
function checkUrl() {
    if (lastHref !== location.pathname) {
        notify({page: location.pathname});
    }
    lastHref = location.pathname;

}

var pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    checkUrl();
};

window.addEventListener('popstate', function () {
    checkUrl();
}, false);