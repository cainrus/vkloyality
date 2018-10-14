var Banner = document.createElement('div');

function Banner_Get() {
    Banner.bannerId = "srm_banner";
    Banner.bannerTextId = "srm_text";
    Banner.bannerCloseId = "srm_close";
    Banner.bannerIconId = "srm_icon";
    Banner.bannerInnerId = "srm_inner";
    
    Banner.banner = elFactory.createElement({tag: 'div', id: Banner.bannerId});
    Banner.inner = elFactory.createElement({tag: 'div', id: Banner.bannerInnerId});
    Banner.icon = elFactory.createElement({tag: 'span', id: Banner.bannerIconId});
    Banner.text = elFactory.createElement({tag: 'span', id: Banner.bannerTextId});
    Banner.close = elFactory.createElement({tag: 'div', id: Banner.bannerCloseId});

    Banner.inner.appendChild(Banner.icon);
    Banner.inner.appendChild(Banner.text);
    Banner.banner.appendChild(Banner.inner);
    Banner.banner.appendChild(Banner.close);

    Banner.onCloseClick = $("#srm_banner").remove();
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function showBanner(mode, text) {
    Banner_Get();
    Banner.banner.setAttribute('class', mode);
    //Banner.banner.addEventListener('click', Banner.onCloseClick);
	
    Banner.text.innerText = b64DecodeUnicode(text);

    // Append banner into dom.
    if (!document.getElementById('srm_banner')) {
        var profile = document.getElementById('profile');
        if (profile) {
            profile.parentNode.insertBefore(Banner.banner, profile);
        }
    }
};