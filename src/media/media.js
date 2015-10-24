// =============================================================================
// Slate.js | Media Elements
// (c) 2015 Mathigon
// =============================================================================



import { isOneOf } from 'utilities';
import { $, $N, customElement, $body } from 'elements';
import Browser from 'browser';


// -----------------------------------------------------------------------------
// Initialise Lightbox

let isOpen = false;
let transform = {};
let $activeImg = null;

Browser.addCSS(require('./lightbox.less'));
const $lightbox        = $N('div', {'class': 'lightbox-overlay' }, $body);
const $lightboxImg     = $N('div', {'class': 'lightbox-img' }, $lightbox);
const $lightboxCaption = $N('div', {'class': 'lightbox-caption' }, $lightbox);

function openLightbox($img, srcSmall, srcLarge) {
    isOpen = true;
    $activeImg = $img;
    $lightbox.css('display', 'block');

    let newX = $img.bounds;
    let oldX = $lightboxImg.bounds;

    let x = newX.left + newX.width /2 - oldX.left - oldX.width /2;
    let y = newX.top  + newX.height/2 - oldX.top  - oldX.height/2;
    let s = Math.max(newX.width/oldX.width, newX.height/oldX.height);
    transform = { x, y, s };

    $lightboxImg.css('background-image', `url(${srcLarge}), url(${srcSmall})`);
    $lightboxImg.transform = `translate(${x}px, ${y}px) scale(${s})`;
    // FUTURE caption text

    Browser.redraw();
    $lightboxImg.addClass('transitions');
    Browser.redraw();

    $img.css('visibility', 'hidden');
    $lightbox.addClass('on');
    $lightboxImg.transform = 'scale(1) translate(0,0)';
}

function closeLightbox() {
    if (!isOpen) return;
    isOpen = false;

    $lightbox.removeClass('on');
    $lightboxImg.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.s})`;

    setTimeout( function() {
        $activeImg.css('visibility', 'visible');
        $lightbox.css('display', 'none');
        $lightboxImg.transform = 'none';
        $lightboxImg.removeClass('transitions');
    }, 400);
}

$lightbox.on('click', closeLightbox);
Browser.onKey('escape', closeLightbox);

$lightbox.on('scrollwheel touchmove', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

Browser.onKey('space up down left right pagedown pageup', function(e) {
    if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
    }
});


// -----------------------------------------------------------------------------
// Media Elements

export default customElement('x-media', {

    created: function($el) {
        let $wrap = $el.children(0);
        let src = $el.attr('src');
        let type = src.slice(-3);

        $wrap.css('width', $el.attr('width') + 'px');
        $wrap.css('height', $el.attr('height') + 'px');
        // $wrap.css('display', $el.css('display').replace(/^inline$/, 'inline-block'));

        // Create Elements

        if (isOneOf(type, 'jpg', 'png', 'gif')) {
            $N('img', {
                src: src
            }, $wrap);

        } else if (isOneOf(type, 'mp4', 'ogg')) {
            let $video = $N('video', {
                width: '100%',
                height: '100%',
                poster: src.replace(/mp4$/, 'jpg'),
                src: src
            }, $wrap);

            $video._el.preload = true;
            $video._el.loop = true;
            $video.on('mouseover touchdown', function() { $video._el.play(); });
            $video.on('mouseout touchup', function() { $video._el.pause(); });

            $wrap.addClass('interactive');
            $wrap.append($N('div', { class: 'play' }));
        }

        // Captions

        let credit = $el.attr('credit');
        if (credit) {
            $N('div', { class: 'credit', html: credit }, $wrap);
        }

        // Lightboxes

        if ($el._el.hasAttribute('lightbox')) {
            $wrap.addClass('interactive');
            $wrap.append($N('div', { class: 'zoom' }));
            var large = src.replace(/\.(?=[^.]*$)/, '-large.');
            $wrap.on('click', function() { openLightbox($wrap, src, large); });
        }

    },

    template: '<div class="wrap"></div>',
    styles: require('./media.less')
});
