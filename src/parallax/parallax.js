// =============================================================================
// Slate.js | Parallax Component
// (c) Mathigon
// =============================================================================



// TODO Improve scroll performance on very low-end devices.

import { customElement, $body, Browser } from '@mathigon/boost';


export const Parallax = customElement('x-parallax', {

  created($el) {
    // TODO allow animation of multiple properties
    this.$bg   = $el.find('.image');
  },

  attached($el) {
    let _this = this;
    let start, end;

    let isFirst = $el.positionTop < 50;

    this.$bg.css({
      'background-image': 'url("' + this.getAttribute('background') + '")',
      'height': isFirst ? '100%' : '150%'
    });

    function resize({ height }) {
      let top = $el.positionTop;
      start = Math.max(0, top - height);
      end = top + $el.height;
    }

    function scroll(e) {
      if (e.top >= start && e.top <= end) {
        let scale = (e.top - start) / (end - start);
        // for scale: let prop = Math.pow(1.5, scale);

        _this.$bg._el.style.transform = 'translateY(' + scale*(isFirst ? 50 : 33) + '%)';
        // _this.$bg._el.style.opacity = 1 - scale;
        // _this.$bg.transform = 'scale(' + Math.max(1, prop) + ')';
      }
    }

    Browser.resize(resize);
    $body.on('scroll', scroll);
  },

  detached(_$el) {
    // TODO remove body event listener
  },

  attributes: {
    background(newBg) {
      this.$bg.css('background-image', 'url("' + newBg + '")');
    }
  },

  templateId: '#parallax'
});
