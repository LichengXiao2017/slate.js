
var Lightbox = M.Class.extend({

    init: function($container, chapter) {
        var _this = this;

        this.chapter = chapter;
        this.activeImg = null;
        this.transform = {};

        this.$lightbox        = $N('div', {'class': 'lightbox-overlay' }, $container);
        this.$lightboxImg     = $N('div', {'class': 'lightbox-img' }, this.$lightbox);
        this.$lightboxCaption = $N('div', {'class': 'lightbox-caption' }, this.$lightbox);

        this.$lightbox.click(function(){ _this.close(); });
    },

    add: function($img) {
        var _this = this;
        var src = $img.attr('src');
        var $wrap = $N('div', { class: 'lightbox' });
        $img.wrap($wrap);
        $N('div', {'class': 'lightbox-zoom' }, $wrap);
        $wrap.click(function() { _this.open($wrap, src); });
    },

    open: function($img, src) {
        this.isOpen = true;
        this.activeImg = $img;
        this.$lightbox.css('display', 'block');
        this.chapter.$progressbar.addClass('off');

        var newX = $img.$el.getBoundingClientRect();
        var oldX = this.$lightboxImg.$el.getBoundingClientRect();

        var X = newX.left + newX.width /2 - oldX.left - oldX.width /2;
        var Y = newX.top  + newX.height/2 - oldX.top  - oldX.height/2;
        var S = Math.max(newX.width/oldX.width, newX.height/oldX.height);
        this.transform = { X: X, Y: Y, S: S };

        this.$lightboxImg.css('background-image',
            'url('+src.replace(/\.(?=[^.]*$)/, '-large.')+'), url('+src+')');
        this.$lightboxImg.transform('translate('+X+'px,'+Y+'px) scale('+S+')');
        // FUTURE caption text

        M.redraw();
        this.$lightboxImg.addClass('transitions');
        M.redraw();

        $img.css('visibility', 'hidden');
        this.$lightbox.addClass('on');
        this.$lightboxImg.transform('scale(1) translate(0,0)');
    },

    close: function() {
        var _this = this;
        this.isOpen = false;

        this.$lightbox.removeClass('on');
        this.$lightboxImg.transform('translate(' + this.transform.X + 'px,' +
            this.transform.Y + 'px) scale(' + this.transform.S + ')');
        this.chapter.$progressbar.removeClass('off');

        setTimeout( function() {
            _this.activeImg.css('visibility', 'visible');
            _this.$lightbox.css('display', 'none');
            _this.$lightboxImg.transform('none');
            _this.$lightboxImg.transform('none');
            _this.$lightboxImg.removeClass('transitions');
        }, 400);
    }
});

