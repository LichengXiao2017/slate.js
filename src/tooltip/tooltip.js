// =============================================================================
// Slate.js | Tooltip Element
// (c) 2017 Mathigon
// =============================================================================



import { $, $N, customElement, $body } from 'elements';

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

function makeTooltip($target, value, posn) {
  $target.on('mouseover', function() {
    if (show || $target.hasClass('active')) return;
    show = $target;

    setTimeout(function() {
      if (show === $target) showTooltip($target, value, posn);
    }, 300);
  });

  $target.on('mouseout', function() {
    show = null;
    setTimeout(function() { if (show != $target) hideTooltip(); }, 10);
  });

  $target.on('click', hideTooltip);
}

$body.on('scroll', hideTooltip);

// -----------------------------------------------------------------------------

export default customElement('x-tooltip', {
  created($el) {

    let _for = $el.attr('for');
    let posn = $el.attr('class') || 'top';

    let $target = _for ? $(_for) : $el.prev;
    if ($target) makeTooltip($target, $el.text, posn);

    $el.remove();
  }
});
