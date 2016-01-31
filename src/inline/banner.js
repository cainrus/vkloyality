function Banner() {

    this.bannerId = "srm_banner";
    this.bannerTextId = "srm_text";
    this.bannerCloseId = "srm_close";
    this.bannerIconId = "srm_icon";
    this.bannerInnerId = "srm_inner";
    
    this.banner = elFactory.createElement({tag: 'div', id: this.bannerId});
    this.inner = elFactory.createElement({tag: 'div', id: this.bannerInnerId});
    this.icon = elFactory.createElement({tag: 'span', id: this.bannerIconId});
    this.text = elFactory.createElement({tag: 'span', id: this.bannerTextId});
    this.close = elFactory.createElement({tag: 'div', id: this.bannerCloseId});

    this.inner.appendChild(this.icon);
    this.inner.appendChild(this.text);
    this.banner.appendChild(this.inner);
    this.banner.appendChild(this.close);

    this.onCloseClick = this.onCloseClick.bind(this);
}

Banner.prototype.hide = function () {
    if (this.banner.parentNode) {
        this.banner.parentNode.removeChild(this.banner);
        this.banner.removeEventListener('click', this.onCloseClick);
    }
};

Banner.prototype.onCloseClick = function() {
    this.hide();
};

Banner.prototype.show = function (mode, text) {
    this.banner.setAttribute('class', mode);
    this.banner.addEventListener('click', this.onCloseClick);

    this.text.innerText = text;

    // Append banner into dom.
    if (!this.banner.parentNode) {
        var profile = document.getElementById('profile');
        if (profile) {
            profile.parentNode.insertBefore(this.banner, profile);
        }
    }
};