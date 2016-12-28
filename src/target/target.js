// =============================================================================
// Slate.js | Targets
// (c) 2017 Mathigon
// =============================================================================



import { delay } from 'utilities';
import { projectPointOnRect } from 'geometry';
import { $, $N, $$, customElement, $body } from 'elements';
import Browser from 'browser';


const $fixed = $$('x-toolbox, header, .toast-panel');  // TODO make this mathigon-independent

const $targets = $N('svg', {
  'class': 'target-body',
  'style': `position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            display: none; pointer-events: none; z-index: 900; opacity: 0;
            transform: translateZ(0); will-change: opacity; transition: opacity .3s;`,
  'html': `<defs>
      <mask id="masking"><rect width="100%" height="100%" fill="white"/></mask>
    </defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z"/>
    </marker>
    <rect x="0" y="0" width="100%" height="100%" mask="url(#masking)" fill="white" opacity="0.9"/>
    <path id="target-arrow" stroke="black" stroke-width="5" marker-end="url(#arrow)" opacity="0.3" stroke-linecap="round"/>`
}, $body);

function connect(from, to, fromShift, toShift) {
  let fromRect = { x: from.left - 15, y: from.top + fromShift - 15, w: from.width + 30, h: from.height + 30 };
  let start = projectPointOnRect({ x: to.left + to.width/2, y: to.top + to.height/2 + toShift }, fromRect);

  let toRect = { x: to.left - 15, y: to.top + toShift - 15, w: to.width + 30, h: to.height + 30 };
  let end = projectPointOnRect({ x: from.left + from.width/2, y: from.top + from.height/2 + fromShift }, toRect);

  return [start, end];
}

function distance(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]); }

const $mask = $targets.find('mask');
const $arrow = $targets.find('#target-arrow');
let active = false;
let $bounds = [];


export default customElement('x-target', {

  created($el) {
    let query = $el.attr('to');
    let noMargins = $el.hasAttribute('no-margins');
    let sourceFixed;

    let start = null;
    let scroll = null;
    let showTimeout = null;

    function enter() {
      active = true;

      let $targets = $$(query);
      if (!$targets.length) return;

      let targetFixed = $targets[0].hasParent(...$fixed);
      if (sourceFixed == null) sourceFixed = $el.hasParent(...$fixed);

      let sourceBounds = $el.bounds;
      let bounds = $targets.map(x => x.bounds).filter(x => x.width && x.height);
      scroll = 0;

      if (!targetFixed) {
        let top = Math.min(...bounds.map(x => x.top));
        let bottom = Math.max(...bounds.map(x => x.top + x.height));

        let scrollUp = Browser.height - 20 - bottom;
        let scrollDown = 20 + 40 - top;  // additional 40 for top navigation bar
        scroll = scrollUp < 0 ? scrollUp : scrollDown > 0 ? scrollDown : 0;
      }

      $bounds.forEach($b => { $b.remove(); });
      $bounds = [sourceBounds].concat(bounds).map(function(b, i) {
        let margin = (i && !noMargins) ? 10 : 4;
        return $N('rect', {
          x: b.left - margin,
          y: b.top - margin + (i || !sourceFixed ? scroll : 0),
          width: b.width + 2 * margin,
          height: b.height + 2 * margin,
          rx: 4, ry: 4
        }, $mask);
      });

      $arrow.points = connect(sourceBounds, bounds[0],
        sourceFixed ? 0 : scroll, targetFixed ? 0 : scroll);
    }

    function show() {
      if (scroll) $body.scrollBy(-scroll, 300);
      $targets.css('display', 'block');
      Browser.redraw();
      delay(function() { $targets.css('opacity', 1); }, scroll ? 300 : 0);
    }

    function exit(e) {
      if (!active) return;
      if (e.type == 'mousemove' && distance(start, [e.clientX, e.clientY ]) < 40) return;

      clearTimeout(showTimeout);
      active = false;

      $targets.css('opacity', 0);
      setTimeout(function() { if (!active) $targets.css('display', 'none'); }, 300);

      $body.off('mousewheel mousemove touchend touchmove', exit);
      $el.off('mouseleave', exit);
    }

    $el.on('mouseenter touchstart', function(e) {
      start = [e.clientX, e.clientY];
      enter();
      showTimeout = setTimeout(show, scroll ? 50 : 30);

      if (scroll && !sourceFixed) {
        $body.on('mousemove', exit);
      } else {
        $el.on('mouseleave', exit);
      }
      $body.on('mousewheel touchend touchmove', exit);
    });

    $el.on('click', function(e) {
      if (active) {
        $(query).trigger('click mousedown');
        e.handled = true;
        exit({});
      } else {
        active = true;
        scroll = 0;
        show();
      }
    });

  }
});
