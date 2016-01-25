function Banner(settings) {
    this.bannerId = "srm_banner";
    this.bannerTextId = "srm_text";
    this.bannerCloseId = "srm_close";
    this.bannerIconId = "srm_icon";
    this.bannerInnerId = "srm_inner";

    this.$banner = $('<div>').attr('id', this.bannerId);
    this.$inner = $('<div>').attr('id', this.bannerInnerId).appendTo(this.$banner);
    this.$icon = $('<span>').attr('id', this.bannerIconId).appendTo(this.$inner);
    this.$text = $('<span>').attr('id', this.bannerTextId).appendTo(this.$inner);
    this.$close = $('<div>').attr('id', this.bannerCloseId).appendTo(this.$banner);
}

Banner.prototype.hide = function () {
    this.$banner.detach().off().remove();;
};

Banner.prototype.show = function (mode, text) {

    this.$banner.attr('class', mode);

    this.$close.on('click', function () {
        this.hide();
    }.bind(this));

    this.$text.html(text);
    if (!this.$banner.parent().length) {
        $('#profile').before(this.$banner);
    }
};