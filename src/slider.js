// =================================================================================================
// Slate.js | Slider
// (c) 2015 Mathigon / Philipp Legner
// =================================================================================================


M.Draggable = M.Class.extend({

    init: function($el, $parent, direction, margin) {

        var _this = this;
        var moveX = (direction !== 'y');
        var moveY = (direction !== 'x');

        var position = [0, 0];
        var dragStart = [null, null];
        var width, height;

        var getPosn = function(e) {
            return [ event.touches ? e.touches[0].clientX : e.clientX,
                     event.touches ? e.touches[0].clientY : e.clientY ];
        };

        var draw = function(x, y) {
            if (moveX) $el.css('left', Math.round(x) + 'px');
            if (moveY) $el.css('top', Math.round(y) + 'px');
            _this.trigger('change', { x: x, y: y, width: width, height: height });
        };

        this.set = function(x, y) {
            draw(x, y);
            position = [x, y];
        };

        this.get = function() {
            return { x: position[0], y: position[1], width: width, height: height };
        };

        var motionStart = function(e) {
            M.$body.on('mousemove touchmove', motionMove);
            M.$body.on('mouseup mouseleave touchend touchcancel', motionEnd);
            dragStart = getPosn(e);
            _this.trigger('start');
        };

        var motionMove = function(e) {
            e.preventDefault();
            var newPosition = getPosn(e);
            var x = M.bound(position[0] + newPosition[0] - dragStart[0], 0, width);
            var y = M.bound(position[1] + newPosition[1] - dragStart[1], 0, height);
            draw(x, y);
        };

        var motionEnd = function(e) {
            M.$body.off('mousemove touchmove', motionMove);
            M.$body.off('mouseup mouseleave touchend touchcancel', motionEnd);
            var newPosition = getPosn(e);
            if (newPosition[0] === dragStart[0] && newPosition[1] === dragStart[1]) {
                _this.trigger('click');
            } else {
                var x = M.bound(position[0] + newPosition[0] - dragStart[0], 0, width);
                var y = M.bound(position[1] + newPosition[1] - dragStart[1], 0, height);
                position = [x, y];
                _this.trigger('end');
            }
        };

        $el.on('mousedown touchstart', motionStart);

        var resize = function() {
            var oldWidth = width;
            var oldHeight = height;
            width = $parent.width('border') - margin * 2;
            height = $parent.height('border') - margin * 2;
            _this.set(width/(oldWidth||width)*position[0], height/(oldHeight||height)*position[1]);
        };

        resize();
        M.resize(resize);
    }
});

// =================================================================================================

M.Slider = M.Class.extend({

    init: function($track, steps) {

        var _this = this;

        $track.addClass('slider-track');
        var $knob = $N('div', { class: 'slider-knob' }, $track);
        $N('div', { class: 'icon' }, $knob);

        var slider = new M.Draggable($knob, $track, 'x', 4);
        var active;

        slider.on('start', function() {
            cancelPlay = true;
        });

        slider.on('change', function(e) {
            var n = Math.floor(e.x / e.width * steps);
            if (n !== active) {
                _this.trigger('move', n);
            }
            active = n;
        });

        var cancelPlay = false;
        slider.on('click', function(){ _this.play(); });

        var animRender = function() {
            var dim = slider.get();
            if (!cancelPlay && dim.x < dim.width) M.animationFrame(animRender);
            slider.set( dim.x + 2 );
        };

        this.play = function() {
            cancelPlay = false;
            $knob.pulseDown();
            animRender();
        };

        slider.set(0,0);
    }

});

// =================================================================================================

M.ImageSequence = M.Class.extend({

    init: function($el) {

        var _this = this;
        var $wrap = $N('div');
        $el.wrap($wrap);

        var url = $el.attr('data-src');
        var pages = Number($el.attr('data-pages')) - 1;

        var $track = $N('div', {}, $wrap);
        var slider = new M.Slider($track, pages);

        var images = [];
        for (var i=1; i<pages; ++i) {
            images[i] = new Image();
            images[i].src = url.replace('#', i);
        }

        slider.on('move', function(n) {
            $el.attr('src', url.replace('#', n));
            //if (n === pages-1) _this.trigger('last', {});
            //if (n === 0) _this.trigger('first', {});
        });
        slider.trigger('move', 0);
    }

});
