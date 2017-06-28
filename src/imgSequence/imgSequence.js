// =============================================================================
// Slate.js | Image Sequence Component
// (c) Mathigon
// =============================================================================



import { tabulate } from '@mathigon/core';
import { $N, customElement } from '@mathigon/boost';


export const ImgSequence = customElement('x-img-sequence', {

  created: function($el) {
    let url = $el.attr('src');
    let pages = +$el.attr('pages') - 1;
    let size = { width: $el.attr('width'), height: $el.attr('height') };

    let $img = $N('img', size, $el);
    let $slider = $N('x-slider', { steps: pages }, $el);

    // preload images
    let images = tabulate(i => new Image(), pages);
    images.forEach((img, i) => { img.src = url.replace('#', i); });

    function draw(n) {
      $img.attr('src', url.replace('#', n));
      // TODO Trigger 'last' and 'first' events.
    }

    $slider.on('move', draw);
    draw(0);
  }
});
