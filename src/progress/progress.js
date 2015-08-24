// =============================================================================
// Slate.js | Progress
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';
import Browser from 'browser';


function draw() {
    let r = this.$el.attr('r');
    let p = this.$el.attr('p');
    let colour = this.$el.attr('colour');
    let html;

    this.$shadow.attr('width', 2*r);
    this.$shadow.attr('height', 2*r);

    if (p >= 0.999) {
        // Checkmark when completed
        html = `<path fill="${colour}" stroke="none" d="M ${r},0
            C ${r/2},0,0,${r/2},0,${r}  s ${r/2},${r},${r},${r}
            s ${r}-${r/2},${r}-${r}     S ${r*1.5},0,${r},0 z
            M ${r*44.6/50},${r*76.1/50} L ${r*19.2/50},${r*48.8/50}
            l ${r*4/50}-${r*4.2/50}     l ${r*19.8/50},${r*11.9/50}
            l ${r*34.2/50}-${r*32.6/50} l ${r*3.5/50},${r*3.5/50}
            L ${r*44.6/50},${r*76.1/50} z"/>`;

    } else {
        // Piechart when in progress
        let x = r + r * Math.sin(percentage * 2 * Math.PI);
        let y = r - r * Math.cos(percentage * 2 * Math.PI);
        let q = percentage > 0.5 ? 1 : 0;

        html = `<circle cx="${r}" cy="${r}" r="${r/2}"
            stroke="${colour}" stroke-width="1" fill="transparent"/>
            <path d="M ${r} ${r} L ${r} 0 A ${r} ${r} 0
            ${q} 1 ${x} ${y} Z" fill="${colour}"/>`;
    }

    this.$shadow.html(html);
}


export default customElement('x-progress', {

    attached: draw,
    draw: draw,

    attributes: {
        p: draw,
        r: draw,
        colour: draw
    },

    template: '<svg></svg>'
 
});
