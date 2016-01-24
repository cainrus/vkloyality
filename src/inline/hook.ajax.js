// Hook ajax
var open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, uri, async, user, pass) {
    this.addEventListener("readystatechange", function(event) {
        if(this.readyState === 4){
            setTimeout(function(){
                notify({page: cur.module, id: cur.oid});
            }, 0);
        }
    }, false);
    open.call(this, method, uri, async, user, pass);
};