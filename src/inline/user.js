/* global Promise */
function User(id) {
    this.id = id;
    this.state = null;
    this.group_id = 110194464;
}

User.prototype.NOLIST = 0;
User.prototype.BLACKLIST = 1;
User.prototype.WHITELIST = 2;

User.prototype.load = function () {

    if (this.state === null) {
        this.state = this.loadState(this.id);
    }

    if (this.state === this.BLACKLIST || this.state === this.WHITELIST || this.state === this.NOLIST) {
        return $.Deferred().resolveWith(this, [this.state]);
    }

    var uidRegExp = /id\d+/;
    if (typeof this.id === 'number') {
        this.uid = this.id;
        return this.checkLists();
    }
    else if (this.id.match(uidRegExp)) {
        this.uid = +this.id.replace(/^id/, '');
        return this.checkLists();
    } else {
        return this.getUID(this.id).then(function (result) {
            this.uid = result[0].uid;
            return this.checkLists();
        }.bind(this));
    }
};

User.prototype.loadState = function(uid) {
    var userData = storage.getItem('user.' + uid);
    if (userData instanceof Object) {
        var ttl = 60 * 60 * 8 * 1000; // 8 hours
        if (userData.updated + ttl < +new Date().getTime()) {
            storage.removeItem('user.' + uid);
        }
        return userData.state;
    }
};



User.prototype.checkLists = function () {

    var d = $.Deferred(), promises = [], cache;

    var resolve = function (state) {

        if (cache === void 0) {
            this.state = cache = state;
            storage.setItem('user.' + this.uid, {state: state, updated: +new Date().getTime()});
            d.resolveWith(this, [this.state]);
        }
    }.bind(this);

    Promise.all([
        this.checkBlacklist().then(function (inBlacklist) {
            if (inBlacklist) {
                resolve(this.BLACKLIST);
            }
        }.bind(this)),
        this.checkWhitelist().then(function (inWhitelist) {
            if (inWhitelist) {
                resolve(this.WHITELIST);
            }
        }.bind(this))
    ]).then(function(){
        resolve(this.NOLIST);
    }.bind(this), function(){
        // research behaviour with null.
        resolve(null);
    });

    return d;
};

User.prototype.getUID = function (id) {
    var isMulti = id instanceof Array,
        key, uid;
    if (!isMulti) {
        key = 'usermap.' + this.uid
        uid = storage.getItem(key, key);
        if (uid) {
            return $.Deferred().resolve([{uid: +uid}]);
        }
    }

    return $.ajax({
        url: 'https://api.vk.com/method/users.get?fields=screen_name&user_ids=' + id,
        dataType: 'jsonp'
    })
        .then(function (result) {
            if (result.response) {
                if (!isMulti) {
                    storage.setItem(key, result.response[0].uid);
                }
                return result.response;
            }
            return $.Deferred().reject();
        });
};

User.prototype.checkBlacklist = function () {

    var topic_id = 32651912;
    var board_id = 104169151;
    var uid = this.uid;

    return new Promise(function(resolve, reject){

        var readAllComments = function() {
            return new Promise(function(resolve, reject) {
                try {
                    (function doRoutine(options) {
                        options = options || {};
                        options.offset = options.offset || 0;
                        options.attempt = options.attempt || 0;
                        options.comments = options.comments || [];
                        options.count = options.count || 100;
                        options.method = 'board.getComments';

                        $.ajax({
                            url: 'https://api.vkontakte.ru/method/' + options.method,
                            dataType: 'jsonp',
                            data: {
                                extended: 1,
                                count: options.count,
                                topic_id: topic_id,
                                group_id: board_id,
                                offset: options.offset
                            }
                        }).fail(function () {
                            if (options.attempt < 3) {
                                options.attempt++;
                                doRoutine(options);
                            } else {
                                reject();
                            }
                        }).done(function (result) {
                            var comments = result.response.comments;
                            var count = comments[0];
                            options.comments = options.comments.concat(comments.slice(1));
                            if (options.offset < count) {
                                options.attempt = 0;
                                options.offset += options.count;
                                doRoutine(options);
                            } else {
                                resolve(options.comments);
                            }
                        });

                    }());
                } catch(e) {
                    reject();
                }

            });
        };

        return readAllComments()
            .then(function (comments) {
                var comment,
                    ids = [],
                    allowed_authors = [101, 9894756];

                for (var c in comments) {
                    if (comments.hasOwnProperty(c)) {
                        comment = comments[c];
                        if (comment.text && allowed_authors.indexOf(comment.from_id) !== -1) {
                            ids = ids.concat((comment.text
                                .match(/(\bid\d+)|vk\.com\/(.+?\b)/g) || [])
                                .map(function (a) {
                                    return a.split('/').pop();
                                }));
                        }
                    }
                }
                return ids;
            }, reject)
            .then(this.getUID.bind(this), reject)
            .then(function (users) {
                return resolve(users.some(function (user) {
                    return user.uid == uid;
                }));
            }.bind(this), reject);
    }.bind(this));

};

User.prototype.checkWhitelist = function () {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'https://api.vk.com/method/groups.isMember',
            dataType: 'jsonp',
            data: {
                group_id: this.group_id,
                user_id: this.uid
            }
        }).then(function (result) {
            resolve(typeof result.response === 'number' ? result.response : result.response[0].member);
        }, reject);
    }.bind(this));
};
