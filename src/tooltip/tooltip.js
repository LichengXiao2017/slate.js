// =============================================================================
// Slate.js | Tooltip Element
// (c) 2016 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';


export default customElement('x-tooltip', {

    created: function($el) {

        $el.text = $el.attr('value');
        $el.addClass($el.attr('posn') || 'top');

        let _for = $el.attr('for');
        let $target = _for ? $(_for) : $el.prev;
        $el.moveTo($body);

        $target.on('mouseover', function() {
            let bounds = $target.bounds;
            let x = bounds.left + bounds.width/2 - $el.width/2;
            let y = bounds.top - 30;

            $el.css({ left: x + 'px', top: y + 'px '});
            $el.addClass('active');
        });

        $target.on('mouseout', function() {
            $el.removeClass('active');
        });

        $body.on('scroll', function() {
            $el.removeClass('active');
        });

    },

    detached: function($el) {
        // TODO remove body event listener
    }

});
