// =============================================================================
// Slate.js | Parallax
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';
import Browser from 'browser';


export default customElement('x-parallax', {

    created: function($el, $shadow) {
        // TODO allow animation of multiple properties
        this.$bg   = $shadow.find('.parallax-img');
        this.$blur = $shadow.find('.parallax-shadow');
    },

    attached: function($el, $shadow) {
        let _this = this;
        let start, end;

        this.$bg.css('background-image', 'url("' + this.getAttribute('background') + '")');

        function resize([{ height }]) {
            let top = $el.positionTop;
            start = Math.max(0, top - height);
            end = top + $el.height;
        }

        function scroll(e) {
            if (e.top >= start && e.top <= end) {
                let scale = (e.top - start) / (end - start);
                let prop = Math.pow(1.5, scale);
                _this.$bg.transform = 'scale(' + Math.max(1, prop) + ')';
                // _this.$blur.css('opacity', scale * 0.5);
            }
        }

        Browser.resize(resize);
        $body.on('scroll', scroll);
    },

    detached: function($el, $shadow) {
        // TODO remove body event listener
    },

    attributes: {
        background: function(newBg) {
            this.$bg.css('background-image', 'url("' + newBg + '")');
        }
    },

    template: require('./parallax.jade'),
    styles: require('./parallax.less')

});
