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
        z-index: 900;`,
    'html': `
        <defs><mask id="masking">
            <rect width="100%" height="100%" fill="white"/>
        </mask> </defs>
        <rect x="0" y="0" width="100%" height="100%" mask="url(#masking)" fill="white" opacity="0.9"/>`
}, $body);

const $mask = $targets.find('mask');


export default customElement('x-target', {

    created: function($el) {

        let $bounds;
        let query = $el.attr('to');

        $el.on('mouseenter touchstart', function() {

            let bounds = $$(query).map(x => x.bounds)
                                  .filter(x => x.width && x.height);
            if (!bounds.length) return;

            let top = Math.min(...bounds.map(x => x.top));
            let bottom = Math.max(...bounds.map(x => x.top + x.height));

            let scrollUp = Browser.height - 20 - bottom;
            let scrollDown = 20 - top;

            let scroll = scrollUp < 0 ? scrollUp : scrollDown > 0 ? scrollDown : 0;
            if (scroll) $body.scrollBy(-scroll, 300);

            $bounds = [$el.bounds].concat(bounds).map(function(b, i) {
                let margin = i ? 10 : 4;  // the target element itself gets no margin
                return $N('rect', {
                    x: b.left - margin - scroll,
                    y: b.top - margin - scroll,
                    width: b.width + 2 * margin,
                    height: b.height + 2 * margin,
                    rx: 4, ry: 4
                }, $mask);
            });

            Browser.redraw();
            $targets.enter(300, 'fade', scroll ? 300 : 0);

            /* TODO target arrows
            var targetBounds = $el.offset();
            var dx = bounds[0].geo.left + bounds[0].geo.width/2  - targetBounds.left - 17;
            var dy = bounds[0].geo.top  + bounds[0].geo.height/2 - targetBounds.top  - 17 - scroll;
            var angle = 45 + Math.atan2(dy, dx) * 180 / Math.PI;
            $arrow.transform('rotate(' + Math.round(angle) + 'deg)');
            */
        });

        $el.on('mouseleave touchend', function() {
            if (!$bounds) return;
            let $oldBounds = $bounds;

            $el.transform = 'none';
            $targets.fadeOut(300);
            setTimeout(function() {
                $oldBounds.forEach(function($b) { $b.remove(); });
            }, 300);
        });

    }
});
