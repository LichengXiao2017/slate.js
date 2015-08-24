// =============================================================================
// Slate.js | Targets
// (c) 2015 Mathigon
// =============================================================================



import { $, $N, $$, customElement, $body } from 'elements';
import Browser from 'browser';


Browser.addCSS(`
.target-body {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 800;
    pointer-events: none;
}

.target-bounds {
    position: absolute;
    border: 2000px solid rgba(255,255,255,0.8);
    margin: -2000px;
    border-radius: 2006px;
    display: none;
}
`);

const $targets = $N('div', {'class': 'target-body' }, $body);


export default customElement('x-target', {

    created: function($el, $shadow) {
        
        let $bounds;
        let $arrow = $shadow.find('.arrow');
        let query = 'body /deep/ ' + $el.attr('to');

        $el.on('mouseenter touchstart', function() {

            $bounds = [];
            let bounds = [];

            $$(query).forEach(function($target) {
                var b = $target.bounds;
                if (!b.height || !b.width) return;

                // var p = b.top - 14;
                // var q = b.top + b.height - M.browser.height + 14;
                bounds.push({ geo: b/*, scroll: p < 0 ? p - 10 : q > 0 ? q + 10 : 0*/ });
            });

            // var scroll = bounds.extract('ds').maxAbs();
            // chapter.scrollBy(scroll, 400);

            bounds.forEach(function(b) {
                var $border = $N('div', { class: 'target-bounds' }, $targets);

                $border.css({
                    top:    b.geo.top - 10 /* - scroll */ + 'px',
                    left:   b.geo.left - 10 + 'px',
                    width:  b.geo.width + 20 + 'px',
                    height: b.geo.height + 20 + 'px'
                });

                //if (scroll && b.scroll) {
                //    setTimeout(function() { $border.fadeIn(200); }, 300);
                //} else {
                    $border.fadeIn(200);
                //}

                $bounds.push($border);
            });

            /*if (!bounds.length) return;
            var targetBounds = $el.offset();

            var dx = bounds[0].geo.left + bounds[0].geo.width/2  - targetBounds.left - 17;
            var dy = bounds[0].geo.top  + bounds[0].geo.height/2 - targetBounds.top  - 17 - scroll;
            var angle = 45 + Math.atan2(dy, dx) * 180 / Math.PI;

            $el.transform('rotate(' + Math.round(angle) + 'deg)');*/
        });

        $el.on('mouseleave touchend', function() {
            $el.transform = 'none';
            $bounds.forEach(function($b) {
                $b.fadeOut(200);
                setTimeout(function() { $b.remove(); }, 200);
            });
        });

    },

    template: '<div class="target"><content></content><div class="arrow"></div></div>',
    styles: require('./target.less')
});
