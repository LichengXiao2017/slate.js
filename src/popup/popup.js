// =============================================================================
// Slate.js | Popups
// (c) 2017 Mathigon
// =============================================================================



// TODO allow custom containers

import { $, $body, customElement } from 'elements';
import Browser from 'browser';


const MARGIN = 15;
const MARGINTOP = 50;

export default customElement('x-popup', {

  created($el) {
    let _this = this;
    let isOpen = false;

    let $target = $el.find('.target');
    let $box = $el.find('.popup');
    let $bubble = $el.find('.body');

    let $container = $($el.attr('container')) || $body;

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

      let pageLeft = $container.offsetLeft;
      if (left < pageLeft + MARGIN)
        $bubble.translateX(pageLeft + MARGIN - left);

      let pageRight = pageLeft + $container.width;
      if (right > pageRight - MARGIN)
        $bubble.translateX(pageRight - MARGIN - right);

      Browser.redraw();
      if (top < MARGINTOP ) { $body.scrollBy(top - MARGINTOP); }

      $target.addClass('on');
      $box.addClass('on');
    };

    this.close = function() {
      if (!isOpen) return;
      isOpen = false;

      $target.removeClass('on');
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
