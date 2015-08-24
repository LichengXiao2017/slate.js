// =============================================================================
// Slate.js | Frame
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';
import Browser from 'browser';


export default customElement('x-frame', {

    attached: function($el, $shadow) {

        let width = $el.width('border');
        let height = $el.height('border');
        let ratio = height/width;

        Browser.resize(function() {
            let w = $shadow.width('border');
            let h = w * ratio;
            $shadow.css('height', h+'px');
            $el.transform('scale(' + w/width + ') translateZ(0)');
        });
    },

    detached: function($el, $shadow) {
        // TODO remove Browser resize event listener
    },

    template: '<div class="frame"><content></content></div>',
    style: '.frame { position: relative; transform-origin: top left; }'

});
