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
        // TODO animate show
        if (this.isOpen) return;
        this.$body.show();
        this.isOpen = true;
    },

    hide: function() {
        // TODO animate hide
        if (!this.isOpen) return;
        this.$body.hide();
        this.isOpen = false;
    },

    toggle: function() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

});
