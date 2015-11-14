// =============================================================================
// Slate.js | Dropdown
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';
import Browser from 'browser';


export default customElement('x-dropdown', {

    created: function($el) {
        this.$title = $el.find('.dropdown-title');
        this.$body = $el.find('.dropdown-body');

        this.$body.hide();
        this.isOpen = false;
        this.$title.on('click', () => { this.toggle(); });
    },

    attached: function($el) {
        $el.on('clickOutside', () => { this.hide(); });
    },

    detached: function($el) {
        // TODO remove body event listener
    },

    show: function() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.$el.addClass('open');
        this.$body.enter(200, 'fade');
    },

    hide: function() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.$el.removeClass('open');
        this.$body.exit(200, 'fade');
    },

    toggle: function() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

});
