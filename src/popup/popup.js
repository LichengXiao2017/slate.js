// =============================================================================
// Slate.js | Popups
// (c) 2017 Mathigon
// =============================================================================



import { $, $body, customElement } from 'elements';
import Browser from 'browser';


const MARGIN = 15;
const MARGINTOP = 50;
const $container = $body;

export default customElement('x-popup', {

  created($el) {
    let _this = this;
    let isOpen = false;

    let $target = $el.find('.target');
    let $box = $el.find('.popup');
    let $bubble = $el.find('.body');

    this.open = function() {
      if (isOpen) return;
      isOpen = true;

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
      if (top < MARGINTOP ) { $body.scrollBy(top - MARGINTOP); }

      $el.addClass('on');
      $box.addClass('on');
    };

    this.close = function() {
      if (!isOpen) return;
      isOpen = false;

      $el.removeClass('on');
      $box.removeClass('on');
      setTimeout( function(){ $box.hide(); }, 200);
    };

    function click() { _this[isOpen ? 'close' : 'open'](); }
    function clickOutside() { _this.close(); }

    $target.on('click', click);
    $el.on('clickOutside', clickOutside);

    this.clear = function() {
      $target.off('click', click);
      $el.off('clickOutside', clickOutside);
    };
  },

  detached() {
    this.close();
  },

  templateId: '#popup'
});
