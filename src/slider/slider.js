// =============================================================================
// Slate.js | Slider Component
// (c) Mathigon
// =============================================================================



import { $C, customElement } from '@mathigon/boost';
import { Draggable } from '../draggable/draggable';


export const Slider = customElement('x-slider', {

  created($track) {
    let $knob = $C('knob', $track);

    let slider = new Draggable($knob, $track, 'x', 4);
    let cancelPlay = false;
    this.steps = +$track.attr('steps');

    slider.on('start', function() {
      cancelPlay = true;
    });

    slider.on('move', e => {
      let n = Math.floor(e.x / slider.width * this.steps);
      if (n !== this.current) {
        this.$el.trigger('move', n);
      }
      this.current = n;
    });

    slider.on('click', () => { this.play(); });

    function animRender() {
      let x = slider.position.x;
      if (!cancelPlay && x < slider.width) window.requestAnimationFrame(animRender);
      slider.position = { x: x + 2, y: 0 };
    }

    this.play = function() {
      cancelPlay = false;
      animRender();
    };

    this.current = 0;
    slider.position = { x: 0, y: 0 };
  },

  attributes: {
    steps(s) { this.steps = +s; }
  },

  templateId: '#slider'
});
