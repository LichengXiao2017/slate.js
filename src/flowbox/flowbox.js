// =============================================================================
// FlowBox
// (c) 2015 Mathigon
// =============================================================================



import { $N, customElement } from '../../../boost.js/src/elements';
import Browser from '../../../boost.js/src/browser';

export default customElement('x-flowbox', {

    redraw: function() {
        let width = this.$el.width;
        let rowHeight = 24;
        let currentRow = 0;
        let currentRowWidth = 0;

        this.words.forEach(function($w) {
            let wordWidth = $w.width;

            if (currentRowWidth + wordWidth > width) {
                currentRow += 1;
                currentRowWidth = 0;
            }

            $w.translate(currentRowWidth, currentRow * rowHeight);
            currentRowWidth += wordWidth + 5;
        });

        this.$el.css('height', (currentRow + 1) * rowHeight + 'px');
    },

    attached: function($box) {
        let words = $box.text.split(/\s/);
        $box.clear();
        this.words = words.map(w => $N('div', { html: w }, $box));
        Browser.resize(this.redraw.bind(this));
    },

    detached: function() {
        // TODO remove resize event
    },

    next: function() { return this.go(1); },
    back: function() { return this.go(-1); },

    template: '<div class="wrap"><content></content></div><div class="underline"></div>'
});
