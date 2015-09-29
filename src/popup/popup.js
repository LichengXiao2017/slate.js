// =============================================================================
// Slate.js | Popups
// (c) 2015 Mathigon
// =============================================================================



import { $, $body, customElement } from 'elements';
import Browser from 'browser';


const MARGIN = 15;

let activePopup;
let $container;
export function setContainer(el) { $container = el; }


export default customElement('x-popup', {

    created: function($el, $shadow) {
        
        let _this = this;
        let $popup = $shadow.find('.popup');
        let $box = $shadow.find('.popup-box');
        let $bubble = $shadow.find('.popup-body');
        let $target = $shadow.find('.target');

        this.open = function() {
            if (activePopup) activePopup.close();
            $box.show();

            // In off state, $bubble is scaled to 0.5 of the size.
            // We have to body the top offset:
            let bounds = $bubble.bounds;
            let top = bounds.top - bounds.height;
            let left = bounds.left - bounds.width/2;
            let right = bounds.right + bounds.width/2;

            let pageLeft = $container ? $container.offsetLeft : 0;
            let pageRight = $container ? $container.offsetRight : $body.width;

            if (left < pageLeft + MARGIN)
                $bubble.translateX(pageLeft + MARGIN - left);

            if (right > pageRight - MARGIN)
                $bubble.translateX(pageRight - MARGIN - right);

            Browser.redraw();
            if (top < MARGIN ) { $body.scrollBy(top - MARGIN); }

            $popup.addClass('on');
            activePopup = _this;
        };

        this.close = function() {
            $popup.removeClass('on');
            activePopup = null;
            setTimeout( function(){ $box.hide(); }, 200);
        };


        function click(e) {
            e.preventDefault();
            e.stopPropagation();

            if ($popup.hasClass('on')) {
                _this.close();
            } else {
                _this.open();
            }
        }

        this.clear = function() { $popup.off('click', click); };
        $bubble.on('click', function(e){ e.stopPropagation(); });
        $popup.on('click', click);
    },

    detached: function() {
        this.close();
    },

    styles: require('./popup.less'),
    template: require('./popup.jade')
});
