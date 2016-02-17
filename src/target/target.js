// =============================================================================
// Slate.js | Targets
// (c) 2015 Mathigon
// =============================================================================



import { $, $N, $$, customElement, $body } from 'elements';
import Browser from 'browser';


const $targets = $N('svg', {
    'class': 'target-body',
    'style': `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        display: none;
        pointer-events: none;
        z-index: 900;
        opacity: 0;
        transition: opacity .3s;`,
    'html': `<defs><mask id="masking">
            <rect width="100%" height="100%" fill="white"/>
        </mask> </defs>
        <rect x="0" y="0" width="100%" height="100%" mask="url(#masking)" fill="white" opacity="0.9"/>`
}, $body);

const $mask = $targets.find('mask');
let active = null;
let $bounds = [];


export default customElement('x-target', {

    created: function($el) {
        let query = $el.attr('to');
        let noMargins = $el.hasAttribute('no-margins');

        function enter() {
            active = true;

            let bounds = $$(query).map(x => x.bounds).filter(x => x.width && x.height);
            if (!bounds.length) return;

            let top = Math.min(...bounds.map(x => x.top));
            let bottom = Math.max(...bounds.map(x => x.top + x.height));

            let scrollUp = Browser.height - 20 - bottom;
            let scrollDown = 20 + 40 - top;  // additional 40 for top navigation bar

            let scroll = scrollUp < 0 ? scrollUp : scrollDown > 0 ? scrollDown : 0;
            if (scroll) $body.scrollBy(-scroll, 300);

            $bounds.forEach($b => { $b.remove(); });
            $bounds = [$el.bounds].concat(bounds).map(function(b, i) {
                let margin = (i && !noMargins) ? 10 : 4;  // the target element itself gets no margin
                return $N('rect', {
                    x: b.left - margin,
                    y: b.top - margin + scroll,
                    width: b.width + 2 * margin,
                    height: b.height + 2 * margin,
                    rx: 4, ry: 4
                }, $mask);
            });

            $targets.css('display', 'block');
            Browser.redraw();
            setTimeout(function() { $targets.css('opacity', 1); }, scroll ? 300 : 0);

            /* TODO target arrows
             var targetBounds = $el.offset();
             var dx = bounds[0].left + bounds[0].width/2  - targetBounds.left - 17;
             var dy = bounds[0].top  + bounds[0].height/2 - targetBounds.top  - 17 - scroll;
             var angle = 45 + Math.atan2(dy, dx) * 180 / Math.PI;
             $arrow.transform('rotate(' + Math.round(angle) + 'deg)');
             */

            return scroll;
        }

        function exit() {
            if (!active) return;
            active = false;
            $targets.css('opacity', 0);

            setTimeout(function() {
                if (!active) $targets.css('display', 'none');
            }, 300);
        }

        $el.on('mouseenter', function() {
            let didScroll = enter();
            if (didScroll) {
                setTimeout(function() {
                    $body.one('scroll mousemove', exit);
                }, 400);
            } else {
                $body.one('mousewheel', exit);
                $el.one('mouseleave', exit);
            }
        });

        $el.on('touchstart', function() {
            enter();
            $body.one('touchend touchmove', exit);
        });

        $el.on('click', function() {
            $(query).trigger('click mousedown');
            exit();
        });

    }
});
