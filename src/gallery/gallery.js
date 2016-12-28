// =============================================================================
// Slate.js | Gallery
// (c) 2015 Mathigon
// =============================================================================



import { clamp } from 'utilities';
import { $N, customElement, $body } from 'elements';
import { ease } from 'animate';
import Browser from 'browser';
import { slide } from 'events';


export default customElement('x-gallery', {

  created($el) {

    let $wrapper = $el.find('.wrapper');
    let $panel = $el.find('.panel');
    let $slides = $panel.children();

    let $next = $el.find('.next');
    let $back = $el.find('.back');

    let $dotsBox = $el.find('.dots');
    let $dots = $slides.map(x => $N('div', { class: 'dot' }, $dotsBox));


    // ---------------------------------------------------------------------
    // Rendering

    let slidesCount = $slides.length;
    let staticSlideWidth = $el.attr('slide-width') || null;
    let width, slidesPerPage, slideWidth;

    let activeIndex = 0;
    let translateX = 0;

    function setPosition(offset) {
      translateX = offset;
      $panel.translateX(offset);
      $el.trigger('move', offset);
      /* if (doOpacity) $slides.each(function($s, i) {
        var x = ((i+1)*slideWidth + offset) / slideWidth;
        $s.css('opacity', M.easing('quad', 0.4 + 0.6 * M.bound(x, 0,1) ));
      }); */
    }

    function makeActive(newIndex) {
      activeIndex = newIndex;
      $dots.forEach(function($d, i) {
        $d.setClass('on', i >= newIndex && i < newIndex + slidesPerPage);
      });
      $next.setClass('disabled', newIndex === slidesCount - slidesPerPage);
      $back.setClass('disabled', newIndex === 0);
      $el.trigger('change', newIndex);
    }

    function resize() {
      width = $wrapper.width;
      slidesPerPage = staticSlideWidth ? Math.ceil(width/staticSlideWidth) : 1;
      slideWidth = width / slidesPerPage;

      $slides.forEach(function($slide) { $slide.css('width', slideWidth + 'px'); });
      $panel.css('width', slidesCount * slideWidth + 'px');
      setPosition(-activeIndex * slideWidth);
      makeActive(activeIndex);
    }


    // ---------------------------------------------------------------------
    // Automatic Scrolling

    let animTiming = 'quad';
    let animDuration = 500;
    let animT, animStart, animDistance, animStartTime;
    let animCancel = false;

    function animSetPosition() {
      animT = Date.now() - animStartTime;
      setPosition(animStart + animDistance * ease(animTiming, animT / animDuration));
    }

    function animRender() {
      if (!animCancel && animT < animDuration) requestAnimationFrame(animRender);
      animSetPosition();
    }

    function startAnimationTo(newIndex) {
      animCancel = false;
      animT = 0;
      animStart = translateX;
      animDistance = -newIndex * slideWidth - translateX;
      animStartTime = Date.now();
      makeActive(newIndex);
      animRender();
    }

    function next() {
      animTiming = 'quad';
      if (activeIndex < slidesCount - slidesPerPage) startAnimationTo(activeIndex+1);
    }

    function back() {
      animTiming = 'quad';
      if (activeIndex > 0) startAnimationTo(activeIndex-1);
    }

    $next.on('click', next);
    $back.on('click', back);


    // ---------------------------------------------------------------------
    // Touch and Mouse Events

    let motionStartPosn = null;
    let pointerStart = null;
    let previousMotionX = null;
    let lastMotionX = null;

    slide($wrapper, {
      start: function(posn) {
        animCancel = true;
        motionStartPosn = translateX;
        pointerStart = posn.x;
        lastMotionX = previousMotionX = pointerStart;
      },
      move: function(posn) {
        previousMotionX = lastMotionX;
        lastMotionX = posn.x;
        let newPosition = motionStartPosn - pointerStart + posn.x;
        let maxScroll = -(slidesCount - slidesPerPage) * slideWidth;

        // Add resistance at ends of slider
        let x = newPosition > 0 ? newPosition/4 :
          newPosition < maxScroll ? maxScroll + (newPosition - maxScroll)/4 :
            newPosition;

        setPosition(x);
      },
      end: function() {
        let lastDiff = lastMotionX - previousMotionX;
        let shift = lastDiff > 12 ? 1 : lastDiff < -12 ? -1 : 0;

        animTiming = 'quad-out';
        startAnimationTo(clamp(Math.round(-translateX/slideWidth - shift), 0,
          slidesCount - slidesPerPage));
      }
    });

    // ---------------------------------------------------------------------

    Browser.resize(resize);

    this.next = next;
    this.back = back;
  },

  attached($el) {
    // TODO add event listener
  },

  detached($el) {
    // TODO remove body event listener
  },

  templateId: '#gallery'
});
