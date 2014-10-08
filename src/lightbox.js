// =================================================================================================
// Slate.js | Lightbox
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


M.Lightbox = function($container, chapter) {

    var $lightbox        = $N('div', {'class': 'lightbox-overlay' }, $container);
    var $lightboxImg     = $N('div', {'class': 'lightbox-img' }, $lightbox);
    var $lightboxCaption = $N('div', {'class': 'lightbox-caption' }, $lightbox);
    var transform = {};

    function add($img) {
        var src = $img.attr('src');
        var $wrap = $N('div', { class: 'lightbox' });
        $img.wrap($wrap);
        $N('div', {'class': 'lightbox-zoom' }, $wrap);
        $wrap.click(function() { open($wrap, src); });
    }

    var activeImg;

    function open($img, src) {
        activeImg = $img;
        $lightbox.css('display', 'block');

        var newX = $img.$el.getBoundingClientRect();
        var oldX = $lightboxImg.$el.getBoundingClientRect();

        var X = newX.left + newX.width /2 - oldX.left - oldX.width /2;
        var Y = newX.top  + newX.height/2 - oldX.top  - oldX.height/2;
        var S = Math.max(newX.width/oldX.width, newX.height/oldX.height);
        transform = {X: X, Y: Y, S: S};

        $lightboxImg.css('background-image', 'url('+src.replace(/\.(?=[^.]*$)/, '-large.')+'), url('+src+')');
        $lightboxImg.transform('translate('+X+'px,'+Y+'px) scale('+S+')');
        // TODO caption text

        M.redraw();
        $lightboxImg.addClass('transitions');
        M.redraw();

        $img.css('visibility', 'hidden');
        chapter.$toolbar.addClass('off');
        $lightbox.addClass('on');
        $lightboxImg.transform('scale(1) translate(0,0)');
    }

    function close() {
        $lightbox.removeClass('on');
        $lightboxImg.transform('translate('+transform.X+'px,'+transform.Y+'px) scale('+transform.S+')');
        chapter.$toolbar.removeClass('off');

        setTimeout( function() {
            activeImg.css('visibility', 'visible');
            $lightbox.css('display', 'none');
            $lightboxImg.transform('none');
            $lightboxImg.transform('none');
            $lightboxImg.removeClass('transitions');
        }, 400);
    }

    $lightbox.click(function(){ close(); });

    return {
        add: add,
        open: open,
        close: close
    };
};
