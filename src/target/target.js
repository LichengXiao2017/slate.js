// =============================================================================
// Slate.js | Targets
// (c) 2015 Mathigon
// =============================================================================



import { delay } from 'utilities';
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
        transform: translateZ(0);
        will-change: opacity;
        transition: opacity .3s;`,
    'html': `<defs>
            <mask id="masking"><rect width="100%" height="100%" fill="white"/></mask>
        </defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z"/>
        </marker>
        <rect x="0" y="0" width="100%" height="100%" mask="url(#masking)" fill="white" opacity="0.9"/>
        <path id="target-arrow" stroke="black" stroke-width="5" marker-end="url(#arrow)" opacity="0.3" stroke-linecap="round"/>`
}, $body);

function isFixed($el) {
    while($el && $el._el.style) {
        if ($el.is('x-toolbox') || $el.is('header')) return true;
        $el = $el.parent;
    }
}

function connect(from, to, fromShift, toShift) {
    let width  = (to.left + to.width/2) - (from.left + from.width/2);
    let height = (to.top + to.height/2) - (from.top + from.height/2) + fromShift + toShift;

    return [{
        x: from.left + from.width/2  + width/10,
        y: from.top  + from.height/2 + height/10 + fromShift
    }, {
        x: to.left + to.width/2  - width/10,
        y: to.top  + to.height/2 - height/10 + toShift
    }];
}

const $mask = $targets.find('mask');
const $arrow = $targets.find('#target-arrow');
let active = null;
let $bounds = [];


export default customElement('x-target', {

    created: function($el) {
        let query = $el.attr('to');
        let noMargins = $el.hasAttribute('no-margins');
        let sourceFixed;

        function enter() {
            active = true;

            let $targets = $$(query);
            if (!$targets.length) return null;

            let targetFixed = isFixed($targets[0]);
            if (sourceFixed == null) sourceFixed = isFixed($el);

            let sourceBounds = $el.bounds;
            let bounds = $targets.map(x => x.bounds).filter(x => x.width && x.height);
            let scroll = 0;

            if (!targetFixed) {
                let top = Math.min(...bounds.map(x => x.top));
                let bottom = Math.max(...bounds.map(x => x.top + x.height));

                let scrollUp = Browser.height - 20 - bottom;
                let scrollDown = 20 + 40 - top;  // additional 40 for top navigation bar
                scroll = scrollUp < 0 ? scrollUp : scrollDown > 0 ? scrollDown : 0;
            }

            $bounds.forEach($b => { $b.remove(); });
            $bounds = [sourceBounds].concat(bounds).map(function(b, i) {
                let margin = (i && !noMargins) ? 10 : 4;
                return $N('rect', {
                    x: b.left - margin,
                    y: b.top - margin + (i || !sourceFixed ? scroll : 0),
                    width: b.width + 2 * margin,
                    height: b.height + 2 * margin,
                    rx: 4, ry: 4
                }, $mask);
            });

            $arrow.points = connect(sourceBounds, bounds[0],
                sourceFixed ? 0 : scroll, targetFixed ? 0 : scroll);

            return scroll;
        }

        function show(scroll) {
            if (!active) return;
            if (scroll) $body.scrollBy(-scroll, 300);
            $targets.css('display', 'block');
            Browser.redraw();
            delay(function() { $targets.css('opacity', 1); }, scroll ? 300 : 0);
        }

        function exit(e) {
            if (!active) return;
            active = false;

            $targets.css('opacity', 0);
            setTimeout(function() {
                if (!active) $targets.css('display', 'none');
            }, 300);

            $body.off('mousewheel mousemove touchend touchmove', exit);
            $el.off('mouseleave', exit);
        }

        $el.on('mouseenter touchstart', function() {
            let scroll = enter();
            if (scroll == null) return;

            delay(function() {
                show(scroll);
                if (scroll && !sourceFixed) {
                    setTimeout(function() {
                        $el.off('mouseleave', exit);
                        $body.on('mousemove', exit);
                    }, 300);
                }
            }, scroll ? 30 : 60);

            $body.on('mousewheel touchend touchmove', exit);
            $el.on('mouseleave', exit);
        });

        $el.on('click', function(e) {
            $(query).trigger('click mousedown');
            e.handled = true;
            exit();
        });

    }
});
