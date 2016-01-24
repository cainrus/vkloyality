// Hook profile init.
if ("Profile" in window) {
    hookProfileInit();
} else {
    var appendChild = document.head.appendChild;
    document.head.appendChild = function () {
        var resource = appendChild.apply(document.head, arguments);
        if (/\bprofile\.js\b/i.test(arguments[0])) {
            resource.addEventListener('load', function () {
                hookProfileInit();
                document.head.appendChild = appendChild;
            }, false);
        }
        return resource;
    };
}

function hookProfileInit() {
    var profileInit = Profile.init;
    Profile.init = function (data) {
        var result = profileInit.apply(Profile, arguments);
        notify({page: 'profile', id: data.user_id});
        return result;
    };
}