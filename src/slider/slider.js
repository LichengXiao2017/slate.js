// =============================================================================
// Slate.js | Slider
// (c) 2015 Mathigon
// =============================================================================



import { $N, customElement } from 'elements';
import Draggable from 'draggable/draggable';


export default customElement('x-slider', {

    created: function($track) {

        $track.addClass('slider-track');
        let $knob = $N('div', { class: 'slider-knob' }, $track);
        $N('div', { class: 'icon' }, $knob);

        let slider = new Draggable($knob, $track, 'x', 4);
        let steps = +$track.attr('steps');
        let cancelPlay = false;

        slider.on('start', function() {
            cancelPlay = true;
        });

        slider.on('move', e => {
            let n = Math.floor(e.x / e.width * steps);
            if (n !== this.current) {
                this.$el.trigger('move', n);
            }
            this.current = n;
        });

        slider.on('click', () => { this.play(); });

        function animRender() {
            var dim = slider.get();
            if (!cancelPlay && dim.x < dim.width) M.animationFrame(animRender);
            slider.set( dim.x + 2 );
        }

        this.play = function() {
            cancelPlay = false;
            $knob.effect('pulse-down');
            animRender();
        };

        this.current = 0;
        slider.position = { x: 0, y: 0 };
    }

});
