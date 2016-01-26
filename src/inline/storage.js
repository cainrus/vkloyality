function Storage(opts){
    opts = opts || {};
    this.ls = window.localStorage;
    this.cache = null;
    if (!opts.namespace) {
        throw new Error("namespace is required");
    }
    this.namespace = opts.namespace;
}

Storage.prototype.setItem = function(key, value) {

    this.reload();

    this.routine(this.cache, key.split('.'), value);

    this.commit();
};

Storage.prototype.getItem = function(key, _default) {
    this.reload();
    return this.routine(this.cache, key.split('.')) || _default;

};

Storage.prototype.removeItem = function(key) {
    this.reload();
    this.routine(this.cache, key.split('.'), null);
    this.commit();
};

Storage.prototype.routine = function(cache, keys, value) {

    var isGetter = typeof value === 'undefined';
    var isSetter = !isGetter;
    var isRemove = value === null;

    var key = keys.shift();

    if (isRemove && keys.length <= 2) {
        return delete cache[key];
    } else if (keys.length) {
        if (isGetter || isRemove) {
            if (cache instanceof Object) {
                if (key in cache) {
                    return this.routine(cache[key], keys);
                } else {
                    return void 0;
                }
            } else {
                return void 0;
            }
        } else if (isSetter) {
            return this.routine(cache[key] || (cache[key] = {}), keys, value);
        }
    } else {
        if (isGetter) {
            return cache[key];
        } else if (isSetter) {
            return (cache[key] = value);
        }
    }
};

Storage.prototype.reload = function(force) {
    if (!this.cache || force) {
        var cache = this.ls.getItem(this.namespace);
        try {
            this.cache = JSON.parse(cache) || {};
        } catch (e) {
            if (cache) {
                console.warn("storage was corrupted.");
            }
            this.cache = {};
        }
    }
};

Storage.prototype.commit = function() {
    if (this.cache instanceof Object) {
        this.ls.setItem(this.namespace, JSON.stringify(this.cache));
    }
};
window.xS=Storage;