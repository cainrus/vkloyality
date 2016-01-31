var JSONP = function (options) {
    var url = options.url;
    var params = [];
    options.data = options.data || {};
    options.data.callback = this.generateUniqueCbName();
    if (options.data) {
        for (var key in options.data) {
            params.push(key + '=' + options.data[key]);
        }
        if (params.length) {
            url += url.indexOf('?') !== -1 ? '&' : '?';
            url += params.join('&');
        }
    }

    return new Promise(function (resolve, reject) {
        this.callback(options.data.callback, resolve, reject);
        this.addScript(this.makeUrl(url, options.data));
    }.bind(this));
};

JSONP.prototype.makeUrl = function (url, data) {
    var params = [];
    for (var key in data) {
        params.push(key + '=' + data[key]);
    }
    if (params.length) {
        url += url.indexOf('?') !== -1 ? '&' : '?';
        url += params.join('&');
    }
    return url;
};


JSONP.prototype.generateUniqueCbName = function () {
    return 'JSONPCallback' + Math.floor(Math.random() * 1000000);
};

JSONP.prototype.callback = function (fnName, resolve, reject) {

    var timeout = setTimeout(function () {

        delete window[fnName];
        this.script.parentNode.removeChild(this.script);
        delete this.script;

        reject('timeout');
    }.bind(this), 3000);

    window[fnName] = function (data) {
        clearTimeout(timeout);
        delete window[fnName];
        this.script.parentNode.removeChild(this.script);
        delete this.script;

        resolve(data);
    }.bind(this);

};

JSONP.prototype.addScript = function (src) {
    this.script = elFactory.createElement({tag: 'script', src: src});

    document.head.appendChild(this.script);
};
