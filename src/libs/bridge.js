var Bridge = (function () {

    function Bridge(options) {
        if (!options.namespace) {
            throw new Error('namespace is required');
        }
        this.namespace = options.namespace;
        this.id = Math.random();
        this.callbacks = {};
        this.listeners = {};

        commonListener.call(this);
    }

    function commonListener() {
        // Common listener for events.
        document.addEventListener(this.namespace, function (event) {
            var data = event.detail;
            var bridgeId = data && data.id;
            var eventName = data && data.name;
            var eventData = data && data.data;
            var callbackId = data && data.callbackId;
            var callbacks = this.callbacks[eventName];

            // do not process own events.
            if (bridgeId === this.id) {
                return;
            }

            if (callbacks) {
                for (var i = 0; i < callbacks.length; i++) {
                    if (callbackId) {
                        callbacks[i](eventData, function(data) {
                            dispatchResponse(callbackId, data);
                        }.bind(this));
                    } else {
                        this.callbacks[name][i].c(eventData);
                    }
                }
                delete this.callbacks[name];
            }
        }.bind(this));
    }

    function setupCallbackListener(callbackId, callback) {

        var requestCallback = function (event) {
            document.removeEventListener(callbackId, requestCallback, true);
            callback(event.detail || void 0);
        }.bind(this);

        document.addEventListener(callbackId, requestCallback, true);
    }

    function dispatchRequest(data) {
        document.dispatchEvent(new CustomEvent(this.namespace, {
            detail: data
        }));
    }

    function dispatchResponse(callbackId, data) {
        document.dispatchEvent(new CustomEvent(callbackId, {
            detail: data
        }));
    }

    Bridge.prototype.request = function (eventName, data, clientCallback) {
        var callbackId = [this.namespace, eventName, Math.random()].join(':');
        setupCallbackListener.call(this, callbackId, clientCallback);
        this.emit(eventName, data, callbackId);
    };

    Bridge.prototype.emit = function (eventName, data, callbackId) {
        dispatchRequest.call(this, {
            name: eventName,
            data: data,
            callbackId: callbackId || void 0,
            id: this.id
        });
    };

    Bridge.prototype._on = function (uniqId, callback) {
        this.callbacks[uniqId] = this.callbacks[uniqId] || [];
        this.callbacks[uniqId].push(callback);
    };

    Bridge.prototype.on = function (name, callback) {
        var self = this;
        // Setup listener for event name.
        if (!this.listeners[name]) {
            this.listeners[name] = function (data) {
                if (self.callbacks[name]) {
                    for (var i = 0; i < self.callbacks[name].length; i++) {
                        self.callbacks[name][i].call(data.details);
                    }
                }
            };
            document.addEventListener(name, this.listeners[name], true);
        }

        // Setup callback for event name listener.
        self.callbacks[name] = self.callbacks[name] || [];
        self.callbacks[name].push(callback);
    };

    Bridge.prototype.off = function (name, callback) {
        var listener = this.listeners[name];
        var callbacks = this.callbacks[name];

        // remove concrete callback for event name.
        if (callback) {
            for (var i = this.callbacks[name].length - 1; i >= 0; i--) {
                if (this.callbacks[name][i] === callback) {
                    this.callbacks[name].splice(i, 1);
                }
            }
        }

        // remove listener and all callbacks for event name
        if (!callback || callbacks.length === 0) {
            document.removeEventListener(name, listener, true);
            delete this.callbacks[name];
        }
    };

    return Bridge;
}());


