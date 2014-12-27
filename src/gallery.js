// =================================================================================================
// Slate.js | Gallery
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


M.Gallery = M.Class.extend({

    init: function($panel, options) {
        if (!options) options = {};
        var _this = this;

        var $wrapper = $N('div', { class: 'gallery-wrapper' });
        var $box = $N('div', { class: 'gallery-box' });
        $panel.wrap($wrapper);
        $wrapper.wrap($box);
        var $slides = $panel.children();

        var slidesCount = $slides.length;
        var staticSlideWidth = $panel.attr('data-slide-width') || null;

        var width, slidesPerPage, slideWidth;
        var activeIndex = 0;
        var translateX = 0;

        //$N('div', { class: 'gallery-shadow-left' }, $box);
        //$N('div', { class: 'gallery-shadow-right' }, $box);

        var $next = $N('div', { class: 'gallery-next' }, $box);
        var $back = $N('div', { class: 'gallery-back' }, $box);
        $N('div', { class: 'icon' }, $next);
        $N('div', { class: 'icon' }, $back);

        var $dotsBox = $N('div', { class: 'gallery-dots' }, $box);
        var $dots = [];

        $slides.each(function($s) {
            $s.addClass('gallery-slide');
            $dots.push($N('div', { class: 'gallery-dot' }, $dotsBox));
        });

        // RESIZE EVENTS -------------------------------------------------------------------------------

        var setPosition = function(offset) {
            translateX = offset;
            $panel.translateX(offset);
            _this.trigger('move', offset);
            /*if (options.opacity) $slides.each(function($s, i) {
                var x = ((i+1)*slideWidth + offset) / slideWidth;
                $s.css('opacity', M.easing('quad', 0.4 + 0.6 * M.bound(x, 0,1) ));
            });*/
        };

        var makeActive = function(newIndex) {
            activeIndex = newIndex;
            $dots.each(function($d, i) {
                $d.setClass('on', i >= newIndex && i < newIndex + slidesPerPage);
            });
            if (options.callback) options.callback(newIndex);
            $next.setClass('disabled', newIndex === slidesCount - slidesPerPage);
            $back.setClass('disabled', newIndex === 0);
            _this.trigger('change', newIndex);
        };

        var resize = function() {
            width = $wrapper.width('border');
            slidesPerPage = staticSlideWidth ? Math.ceil(width/staticSlideWidth) : 1;
            slideWidth = width / slidesPerPage;

            $slides.each(function($slide) { $slide.css('width', slideWidth+'px'); });
            $panel.css('width', slidesCount*slideWidth+'px');
            setPosition(-activeIndex * slideWidth);
            makeActive(activeIndex);
        };

        // AUTOMATIC SCROLLING -------------------------------------------------------------------------

        var animTiming = 'quad';
        var animDuration = 500;
        var animT, animStart, animDistance, animStartTime;
        var animCancel = false;

        var animSetPosition = function() {
            animT = M.now() - animStartTime;
            setPosition(animStart + animDistance * M.easing(animTiming, animT / animDuration));
        };

        var animRender = function() {
            if (!animCancel && animT < animDuration) M.animationFrame(animRender);
            animSetPosition();
        };

        var startAnimationTo = function(newIndex) {
            animCancel = false;
            animT = 0;
            animStart = translateX;
            animDistance = -newIndex * slideWidth - translateX;
            animStartTime = M.now();
            makeActive(newIndex);
            animRender();
        };

        var next = function() {
            animTiming = 'quad';
            if (activeIndex < slidesCount - slidesPerPage) {
                $next.pulseDown();
                startAnimationTo(activeIndex+1);
            }
        };

        var back = function() {
            animTiming = 'quad';
            if (activeIndex > 0) {
                $back.pulseDown();
                startAnimationTo(activeIndex-1);
            }
        };

        $next.click(next);
        $back.click(back);

        // TOUCH AND MOUSE EVENTS ----------------------------------------------------------------------

        var motionStartPosn = null;
        var pointerStart = null;
        var previousMotionX = null;
        var lastMotionX = null;

        var motionStart = function(e) {
            M.$body.on('mousemove touchmove', motionMove);
            M.$body.on('mouseup mouseleave touchend touchcancel', motionEnd);
            animCancel = true;
            motionStartPosn = translateX;
            pointerStart = event.touches ? event.touches[0].clientX : event.clientX;
            lastMotionX = previousMotionX = pointerStart;
        };

        var motionMove = function(e) {
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
        };

        var motionEnd = function(e) {
            M.$body.off('mousemove touchmove', motionMove);
            M.$body.off('mouseup mouseleave touchend touchcancel', motionEnd);

            var x = event.touches ? event.touches[0].clientX : event.clientX;
            var lastDiff = lastMotionX - previousMotionX;
            var shift = lastDiff > 12 ? 1 : lastDiff < -12 ? -1 : 0;

            animTiming = 'quad-out';
            startAnimationTo(M.bound(Math.round(-translateX/slideWidth - shift), 0, slidesCount - slidesPerPage));
        };

        $wrapper.on('mousedown touchstart', motionStart);

        // ---------------------------------------------------------------------------------------------

        resize();
        M.resize(resize);

        this.next = next;
        this.back = back;
    }
});
