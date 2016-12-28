// =============================================================================
// Slate.js | Dropdown
// (c) 2017 Mathigon
// =============================================================================



import { customElement } from 'elements';


export default customElement('x-dropdown', {

  created($el) {
    this.$title = $el.find('.dropdown-title');
    this.$body = $el.find('.dropdown-body');

    this.isOpen = false;
    this.$title.on('click', () => { this.toggle(); });

    $el.findAll('a').forEach($a => { $a.on('click', () => { this.hide(); }); });
  },

  attached($el) {
    $el.on('clickOutside', () => { this.hide(); });
  },

  detached($el) {
    // TODO remove body event listener
  },

  show() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.$el.addClass('open');
    this.$body.enter('fade', 200);
  },

  hide() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.$el.removeClass('open');
    this.$body.exit('fade', 200);
  },

  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

});
