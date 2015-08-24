// =============================================================================
// Slate.js | Dropdown
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';
import Browser from 'browser';


export default customElement('x-dropdown', {

    created: function($el, $shadow) {
        let _this = this;

        this.$title = $shadow.find('.dropdown-title');
        this.$body = $shadow.find('.dropdown-body');
        this.isOpen = false;

        this.$title.on('click', function(e) {
            _this.toggle();
            e.stopPropagation();
        });

        this.$body.on('click', function(e) {
            e.stopPropagation();
        });
    },

    attached: function($el, $shadow) {
        var _this = this;
        $body.on('click', function(e) {
            _this.hide();
        });
    },

    detached: function($el, $shadow) {
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
    },

    template: require('./dropdown.jade')

});
