// =============================================================================
// Slate.js | Media Elements
// (c) 2015 Mathigon
// =============================================================================



import { isOneOf } from 'utilities';
import { $, $C, $N, customElement, $body } from 'elements';
import Browser from 'browser';


// -----------------------------------------------------------------------------
// Initialise Lightbox

let isOpen = false;
let transform = {};
let $activeImg = null;

const $lightbox        = $N('div', {'class': 'lightbox-overlay' }, $body);
const $lightboxImg     = $N('div', {'class': 'lightbox-img' }, $lightbox);
const $lightboxCaption = $N('div', {'class': 'lightbox-caption' }, $lightbox);

function openLightbox($img, srcSmall, srcLarge) {
    isOpen = true;
    $activeImg = $img;
    $lightbox.show();
    $lightboxImg.show();

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
        let src = $el.attr('src');
        let type = src.slice(-3);

        $el.css('padding-bottom', (+$el.attr('height')) / (+$el.attr('width')) * 100 + '%');

        let $media;
        let $credit = $C('credit', $el);
        let $play   = $C('play', $el);
        let $zoom   = $C('zoom', $el);


        // Create Elements

        if (isOneOf(type, 'mp4', 'ogg')) {
            $media = $N('video', { poster: src.replace(/mp4$/, 'jpg'), src: src }, $el);

            $media._el.preload = true;
            $media._el.loop = true;
            $media.on('mouseover touchdown', function() { $media._el.play(); });
            $media.on('mouseout touchup', function() { $media._el.pause(); });

            $el.addClass('interactive');

        } else {
            $media = $N('img', { src: src }, $el);
            $play.remove();
        }

        $el.prepend($media);


        // Captions

        let credit = $el.attr('credit');
        if (credit) {
            $credit.text = credit;
        } else {
            $credit.remove();
        }


        // Lightboxes

        if ($el._el.hasAttribute('lightbox')) {
            $el.addClass('interactive');
            let large = src.replace(/\.(?=[^.]*$)/, '-large.');
            $el.on('fastClick', function() { openLightbox($el, src, large); });
        } else {
            $zoom.remove();
        }

    },

    templateId: '#media'
});
