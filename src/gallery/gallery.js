// =============================================================================
// Slate.js | Gallery
// (c) 2015 Mathigon
// =============================================================================



import { clamp } from 'utilities';
import { $, $N, customElement, $body } from 'elements';
import { animationFrame, animate, ease } from 'animate';
import Browser from 'browser';


export default customElement('x-gallery', {

    created: function($el) {

        let $wrapper = $el.find('.wrapper');
        let $panel = $el.find('.panel');
        let $slides = $panel.children();

        var $next = $el.find('.next');
        var $back = $el.find('.back');

        var $dotsBox = $el.find('.dots');
        var $dots = $slides.map(x => $N('div', { class: 'dot' }, $dotsBox));


        // ---------------------------------------------------------------------
        // Rendering

        let slidesCount = $slides.length;
        let staticSlideWidth = $el.attr('slide-width') || null;
        var width, slidesPerPage, slideWidth;

        var activeIndex = 0;
        var translateX = 0;

        function setPosition(offset) {
            translateX = offset;
            $panel.translateX(offset);
            $el.trigger('move', offset);
            /*if (doOpacity) $slides.each(function($s, i) {
                var x = ((i+1)*slideWidth + offset) / slideWidth;
                $s.css('opacity', M.easing('quad', 0.4 + 0.6 * M.bound(x, 0,1) ));
            });*/
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

        var animTiming = 'quad';
        var animDuration = 500;
        var animT, animStart, animDistance, animStartTime;
        var animCancel = false;

        function animSetPosition() {
            animT = Date.now() - animStartTime;
            setPosition(animStart + animDistance * ease(animTiming, animT / animDuration));
        }

        function animRender() {
            if (!animCancel && animT < animDuration) animationFrame(animRender);
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
            if (activeIndex < slidesCount - slidesPerPage) {
                $next.effect('pulse-down');
                startAnimationTo(activeIndex+1);
            }
        }

        function back() {
            animTiming = 'quad';
            if (activeIndex > 0) {
                $back.effect('pulse-down');
                startAnimationTo(activeIndex-1);
            }
        }

        $next.on('click', next);
        $back.on('click', back);


        // ---------------------------------------------------------------------
        // Touch and Mouse Events

        var motionStartPosn = null;
        var pointerStart = null;
        var previousMotionX = null;
        var lastMotionX = null;

        function motionStart(e) {
            $body.on('pointerMove', motionMove);
            $body.on('pointerEnd', motionEnd);
            animCancel = true;
            motionStartPosn = translateX;
            pointerStart = event.touches ? event.touches[0].clientX : event.clientX;
            lastMotionX = previousMotionX = pointerStart;
        }

        function motionMove(e) {
            e.preventDefault();

            var x = event.touches ? event.touches[0].clientX : event.clientX;
            previousMotionX = lastMotionX;
            lastMotionX = x;
            var newPosition = motionStartPosn - pointerStart + x;
            var maxScroll = -(slidesCount - slidesPerPage) * slideWidth;

            // Add resistance at ends of slider
            if (newPosition > 0) {
                setPosition(newPosition/4);
            } else if (newPosition < maxScroll) {
                setPosition(maxScroll + (newPosition - maxScroll)/4);
            } else {
                setPosition(newPosition);
            }
        }

        function motionEnd(e) {
            $body.off('pointerMove', motionMove);
            $body.off('pointerEnd', motionEnd);

            var x = event.touches ? event.touches[0].clientX : event.clientX;
            var lastDiff = lastMotionX - previousMotionX;
            var shift = lastDiff > 12 ? 1 : lastDiff < -12 ? -1 : 0;

            animTiming = 'quad-out';
            startAnimationTo(clamp(Math.round(-translateX/slideWidth - shift), 0, slidesCount - slidesPerPage));
        }

        $wrapper.on('pointerStart', motionStart);

        // ---------------------------------------------------------------------

        Browser.resize(resize);

        this.next = next;
        this.back = back;
    },

    attached: function($el) {
        // TODO add event listener
    },

    detached: function($el) {
        // TODO remove body event listener
    },

    template: require('./gallery.jade'),
    styles: require('./gallery.less')

});
