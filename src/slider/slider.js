// =============================================================================
// Slate.js | Slider
// (c) 2015 Mathigon
// =============================================================================



import { $C, customElement } from 'elements';
import Draggable from 'draggable';


export default customElement('x-slider', {

    created: function($track) {

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
            $knob.effect('pulse-down');
            animRender();
        };

        this.current = 0;
        slider.position = { x: 0, y: 0 };
    },

    attributes: {
        steps: function(s) { this.steps = +s; }
    },

    templateId: '#slider'
});
