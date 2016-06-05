// =============================================================================
// Slate.js | Parallax
// (c) 2015 Mathigon
// =============================================================================



import { customElement, $body } from 'elements';
import Browser from 'browser';


export default customElement('x-fixed', {

    created: function($el) {
        this.$bg = $el.find('.background');
        this.$bg.css('background', $el.css('background'));
        $el.css('background', 'none');
    },

    attached: function($el) {
        let $bg = this.$bg;
        let start, end;
        let wasVisible = false;

        Browser.on('resize', function({ height }) {
            let top = $el.positionTop;
            start = Math.max(0, top - height) - 100;
            end = top + $el.height + 100;
        });

        $body.on('scroll', function({ top }) {
            let isVisible = (top >= start && top <= end);
            if (isVisible && !wasVisible) $bg.css('visibility', 'visible');
            if (!isVisible && wasVisible) $bg.css('visibility', 'hidden');
            wasVisible = isVisible;
        });
    },

    detached: function($el) {
        // TODO remove body event listener
    },

    template: '<div class="background"></div><content></content>'
});
