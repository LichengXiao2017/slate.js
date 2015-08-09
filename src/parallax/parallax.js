// =============================================================================
// Slate.js | Parallax
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';
import Browser from 'browser';


export default customElement('x-parallax', {

    created: function($el, $shadow) {
        this.$bg   = $shadow.children(1);
        this.$blur = $shadow.children(2);
    },

    attached: function($el, $shadow) {
        let _this = this;
        let start, end;

        this.$bg.css('background-image', 'url("' + this.getAttribute('background') + '")');

        function resize() {
            start = Math.max(0, $el.offsetTop - window.innerHeight);
            end = $el.offsetTop + _this.offsetHeight;
            scroll({ top: $body.scrollTop });
        }

        function scroll(e) {
            if (e.top >= start && e.top <= end) { // check for window size
                let scale = (e.top - start) / (end - start);
                let prop = Math.pow(1.5, scale);
                _this.$bg.transform = 'scale(' + Math.max(1, prop) + ')';
                // _this.$blur.css('opacity', scale * 0.5);
            }
        }

        Browser.resize(resize);
        $body.on('scroll', scroll);
        resize();
    },

    detached: function($el, $shadow) {
        // TODO remove body event listener
    },

    attributes: {
        background: function(newBg) {
            this.$bg.css('background-image', 'url("' + newBg + '")');
        }
    },

    template: require('./parallax.jade')

});
