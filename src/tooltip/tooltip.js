// =============================================================================
// Slate.js | Tooltip Component
// (c) Mathigon
// =============================================================================



import { $, $N, customElement, $body } from '@mathigon/boost';

const $tooltip = $N('div', { class: 'tooltip'}, $body);
let show = null;


function hideTooltip() {
  show = null;
  $tooltip.removeClass('active');
}

function showTooltip($target, value, posn) {
  $tooltip.text = value;
  $tooltip.attr('class', 'tooltip ' + posn);

  // TODO fit to window dimensions, maybe scroll?
  // TODO this sometimes doesn't work...
  let bounds = $target.bounds;

  let x = (posn == 'left') ? bounds.left - $tooltip.width - 8 :
    (posn == 'right') ? bounds.right + 8 :
    bounds.left + bounds.width/2 - $tooltip.width/2;

  let y = (posn == 'top') ? bounds.top - $tooltip.height - 8 :
    (posn == 'bottom') ? bounds.bottom + 8 :
    bounds.top + bounds.height/2 - $tooltip.height/2;

  $tooltip.css({ left: x + 'px', top: y + 'px '});
  $tooltip.addClass('active');
}

$body.on('scroll', hideTooltip);

// -----------------------------------------------------------------------------

export const Tooltip = customElement('x-tooltip', {
  created($el) {

    let _for = $el.attr('for');
    let $target = _for ? $(_for) : $el.prev;

    let posn = $el.attr('class') || 'top';
    let touch = $el.hasAttribute('touch');
    let value = $el.text;

    let delay = $el.attr('delay');
    if (delay === null) delay = 300;

    $el.remove();
    if (!$target) return;

    $target.on('mouseover' + (touch ? ' touchstart' : ''), function() {
      if (show || $target.hasClass('active')) return;
      show = $target;

      setTimeout(function() {
        if (show === $target) showTooltip($target, value, posn);
      }, +delay);
    });

    $target.on('mouseout' + (touch ? ' touchend' : ''), function() {
      if (!show) return;
      show = null;
      setTimeout(function() { if (show != $target) hideTooltip(); }, 10);
    });

    $target.on('setTooltip', msg => { value = msg; });
    if (!touch) $target.on('mouseup', hideTooltip);
  }
});
