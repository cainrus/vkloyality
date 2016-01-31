var elFactory = {
    createElement: function(options){
        var el = document.createElement(options.tag);
        if (options.id) {
            el.setAttribute('id', options.id);
        }
        if (options.src) {
            el.setAttribute('src', options.src);
        }
        return el;
    }
};