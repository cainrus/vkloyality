/* global Promise */
var el = document.createElement('script');
el.src = 'https://code.jquery.com/jquery-3.3.1.min.js';
document.body.appendChild(el);
var storage = new Storage({namespace: "x44g8LoO3gK1"});
function User(id) {
    this.id = id;
    this.state = null;
    this.group_id = 110194464;
}

var LOYALITY_API_VERSION = 3.0;

User.prototype.NOLIST = 0;
User.prototype.BLACKLIST = 1;
User.prototype.WHITELIST = 2;

User.prototype.load = function () {

    return new Promise(function(resolve, reject) {
        try {
            if (this.state === null) {
                this.state = this.loadState(this.id);
            }

            if (this.state === this.BLACKLIST || this.state === this.WHITELIST || this.state === this.NOLIST) {
                return resolve(this.state);
            }
            
            if (/^(id)?\d+$/.test(this.id)) {
                return this.checkLists().then(resolve).catch(reject);
            } else {
                // Find by nickname.
                return this.getUID(this.id)
                    .then(function (result) {
                        return this.checkLists().then(resolve).catch(reject);
                    }.bind(this))
                    .catch(reject);
            }

        } catch (e) {
            reject(e);
        }
    }.bind(this));


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
    return new Promise(function(resolve, reject){
        Promise.all([
            this.checkBlacklist(),
            this.checkWhitelist()
        ]).then(function(result){
            var inBlacklist = !!result[0];
            var inWhitelist = !!result[1];
            var state = this.NOLIST;
            if (inWhitelist) {
                state = this.WHITELIST;
            } else if (inBlacklist) {
                state = this.BLACKLIST;
            }
            storage.setItem('user.' + getid(), {state: state, updated: +new Date().getTime()});
            resolve(state);
        }.bind(this), reject);
    }.bind(this));
};

User.prototype.getUID = function (id) {
    var isMulti = id instanceof Array,
        ids = Array.isArray(id) ? id : [id],
        key, uid, prefix = 'usermap.';
    if (!isMulti) {
        key = prefix + getid();
        uid = storage.getItem(key, key);
        if (uid) {
            return Promise.resolve([{uid: +uid}]);
        }
    }

    var perIteration = 100;
    var response = [];

    function rutine(ids) {

            return new JSONP({
                url: 'https://api.vk.com/method/users.get',
                data: {
    				v: LOYALITY_API_VERSION,
                    fields: 'screen_name',
                    user_ids: ids.splice(0, perIteration).join(','),
                    access_token: '1cfa80d61cfa80d61cfa80d6c81c9cdbdf11cfa1cfa80d6474b50746e0e4c2f9f42741f'
                }
            })
            .then(function (result) {
                if (result.response) {
                    if (!isMulti) {
                        storage.setItem(key, result.response[0].uid);
                    }
                    response = response.concat(result.response);
                    if (ids.length) {
                        return rutine(ids);
                    } else {
                        return response;
                    }
                }
                return Promise.reject();
            });
    }

    return rutine(ids);


};

User.prototype.checkBlacklist = function () {

    var topic_id = 32651912;
    var board_id = 104169151;
    var uid = getid();

    if(!isNaN(uid.split('id')[1]))
        uid = uid.split('id')[1];

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
                        new JSONP({
                            url: 'https://api.vk.com/method/' + options.method,
                            data: {
                                v: LOYALITY_API_VERSION,
                                extended: 1,
                                count: options.count,
                                topic_id: topic_id,
                                group_id: board_id,
                                offset: options.offset,
                                access_token: '1cfa80d61cfa80d61cfa80d6c81c9cdbdf11cfa1cfa80d6474b50746e0e4c2f9f42741f'
                            }
                        }).then(function (result) {

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
                        }, function(){
                            if (options.attempt < 3) {
                                options.attempt++;
                                doRoutine(options);
                            } else {
                                reject();
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
                                .match(/(\bid\d+)|vk\.com\/([\w\.]+)\b/g) || [])
                                .map(function (a) {
                                    return a.split('/').pop();
                                }))
                                .filter(function(name){
                                    return ['wall', 'doc', 'srm_whitelist', 'topic', 's'].indexOf(name) === -1;
                                });
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
            url:'https://api.vk.com/method/users.get',
            type: "POST",
            dataType: 'jsonp',
            data: {
                v: LOYALITY_API_VERSION,
                fields: 'screen_name',
                user_ids: getid(),
                access_token: '1cfa80d61cfa80d61cfa80d6c81c9cdbdf11cfa1cfa80d6474b50746e0e4c2f9f42741f'
            },
            success: function (result) {
                console.log(result);
                if (result) {
                        new JSONP({
                        url: 'https://api.vk.com/method/groups.isMember',
                        data: {
                            v: LOYALITY_API_VERSION,
                            group_id: 110194464,
                            user_id: result.response[0]['uid'],
                            access_token: '1cfa80d61cfa80d61cfa80d6c81c9cdbdf11cfa1cfa80d6474b50746e0e4c2f9f42741f'
                        }
                        }).then(function (result) {
                            console.log(result);
                            resolve(typeof result.response === 'number' ? result.response : result.response[0].member);
                        }, reject);
                }
            }
        });
        
    }.bind(this));
};

function getid()
{
    var userid = '';
    for (var i = 0; i < document.location['pathname'].length; i++)
    if (i != 0)
        userid += document.location['pathname'][i];
    return userid;
    //return userid;
}