/* global cur, Storage, Banner */

var prevEventData = null;
var banner, storage;
var bridge = new Bridge({namespace: "x44g8LoO3gK1"});
function getId()
{
    var userid = '';
    for (var i = 0; i < document.location['pathname'].length; i++)
    if (i != 0)
        userid += document.location['pathname'][i];
    return userid;
}

setTimeout(function () {


    storage = new Storage({namespace: "x44g8LoO3gK1"});
    

    //var req = 'https://api.vk.com/method/users.get?&user_ids=&fields=&name_case=&extended=0&v=5.68';
    var isUser = false;
    new JSONP({
        url: 'https://api.vk.com/method/users.get',
        data: {
            v: LOYALITY_API_VERSION,
            fields: 'screen_name',
            user_ids: getId(),
            access_token: 'd2643dc24fe677a31308b52518728f5aedf69b4ffb3e7788b9d2b64df4e860e11f9aa1171dacedd036827'
        }
    })
    .then(function (result) {
        if (result.response) {
            isUser = true;
        }
    });
    if (isUser) {
        updateState(getId());
    }
}, 1000);


function notify(id) {
    updateState(id);
}

function updateState(id) {
        var user = new User(id);
        user.load()
            .then(function (state) {
                if (state === user.BLACKLIST) {
                    showBanner('blacklist', "0JLQvdC40LzQsNC90LjQtSwg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINC30LDQvdC10YHQtdC9INCyINGH0LXRgNC90YvQuSDRgdC/0LjRgdC+0Log0LPRgNGD0L/Qv9GLINCh0LLQvtCx0L7QtNC90YvQuSDRgNGL0L3QvtC6INC80LjQvdC40LDRgtGO0YA=");
                } else if (state === user.WHITELIST) {
                    showBanner('whitelist', "0JLQvdC40LzQsNC90LjQtSwg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINC30LDQvdC10YHQtdC9INCyINCx0LXQu9GL0Lkg0YHQv9C40YHQvtC6INCz0YDRg9C/0L/RiyDQodCy0L7QsdC+0LTQvdGL0Lkg0YDRi9C90L7QuiDQvNC40L3QuNCw0YLRjtGA");
                }
            });
}
