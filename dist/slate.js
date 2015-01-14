// Boost Browser and DOM Tools
// (c) 2014, Mathigon / Philipp Legner
// MIT License (https://github.com/Mathigon/slate.js/blob/master/LICENSE)

 (function() {
M.audio = {
    files: {},
    playing: null,
    load: function(src, id) {
        M.audio.files[id] = new Audio(src);
        M.audio.files[id].load();
        M.audio.files[id].addEventListener('timeupdate', function() {
            if (M.audio.playing) M.audio.playing.update();
        });
        return M.audio.files[id];
    }
};

M.audio.Chunk = M.Class.extend({

    init: function(file, times) {
        if (M.isString(times)) times = M.map(parseFloat, times.split('|'));
        this.times = times;
        this.currentTime = times[0];
        this.duration = times[1] - times[0];
        this.player = M.audio.files[file] || M.audio.load(file, Math.floor(Math.random()*10000));
        this.status = 'paused';
    },

    play: function() {
        var _this = this;

        if (this.player.readyState < 2) {
            $(this.player).one('canplay seeked', function() { _this.play(); });
            return;
        }

        if (M.audio.playing) M.audio.playing.pause();
        M.audio.playing = this;

        this.status = 'playing';
        this.player.currentTime = this.currentTime;
        this.player.play();
        this.trigger('play', { p: (this.currentTime - this.times[0]) / this.duration, t: this.currentTime });
    },

    pause: function() {
        this.status = 'paused';
        if (M.audio.playing === this) this.player.pause();
        this.trigger('pause');
    },

    setTime: function(time) {
        if (this.player.readyState) this.player.currentTime = time;
        this.trigger('timeupdate', { p: (time - this.times[0]) / this.duration, t: time });
    },

    reset: function() {
        if (M.audio.playing === this) this.player.pause();
        if (this.player.readyState) this.currentTime = this.times[0];
        this.status = 'paused';
        this.trigger('reset');
    },

    update: function() {
        if (this.status === 'ended') return;

        if (M.audio.playing === this)
            this.currentTime = this.player.currentTime;

        if (this.currentTime >= this.times[1]) {
            this.pause();
            this.status = 'ended';
            this.trigger('end');
            return;
        }

        this.trigger('timeupdate', { p: (this.currentTime - this.times[0]) / this.duration, t: this.currentTime });
    }

});

// =================================================================================================

M.speechRecognition = function() {

    if (!M.browser.speechRecognition) {
        return {
            start: function() { rec.start(); },
            stop: function() { rec.stop(); },
            addCommand: function(){},
            removeCommand: function(){},
            available: false
        };
    }

    var rec = new window.webkitSpeechRecognition();
    rec.continuous = true;
    rec.language = 'en-US';
    //rec.interimResults = true;

    var commands = {};

    var processCommand = function(name) {
        name = name.toLowerCase().trim();
        if (commands[name]) commands[name]();
    };

    rec.onresult = function(event) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            console.debug('Voice Input: ', event.results[i][0].transcript);
            processCommand(event.results[i][0].transcript);
        }
    };

    //rec.onstart = function() { ... }
    //rec.onerror = function(event) { ... }
    //rec.onend = function() { ... }

    var addCommand = function(name, fn) {
        if (!(name instanceof Array)) name = [name];
        for (var i=0; i<name.length; ++i) commands[name[i].toLowerCase()] = fn;
    };

    var removeCommand = function(name) {
        if (!(name instanceof Array)) name = [name];
        for (var i=0; i<name.length; ++i) commands[name[i].toLowerCase()] = undefined;
    };

    return {
        start: function() { rec.start(); },
        stop: function() { rec.stop(); },
        addCommand: addCommand,
        removeCommand: removeCommand,
        available: true
    };
};

M.Popup = function($popup, chapter) {

    // TODO onopen(), onclose() functions

    var _this = this;

    var $bubble = $C('popup-bubble',$popup);
    if (!$bubble) return;

    var $bubbleBox = $C('bubble-box',$bubble);
    $N('span', {'class': 'bubble-arrow'}, $bubble);

    _this.open = function() {

        if (chapter.activePopup) chapter.activePopup.close();
        $bubble.css('display', 'block');

        // In off state, $bubble is scaled to 0.5 of the size. We have to adjust the top offset:
        var bounds = $bubble.$el.getBoundingClientRect();
        var top = bounds.top - bounds.height;
        var left = bounds.left - bounds.width/2;
        var right = bounds.right + bounds.width/2;

        var pageLeft = chapter.$container.offset().left;
        var pageRight = M.browser.width;

        if (left < pageLeft + 10)
            $bubbleBox.translateX(pageLeft + 10 - left);

        if (right > pageRight - 54)
            $bubbleBox.translateX(pageRight - 54 - right);

        M.redraw();
        if (top < 27 ) { chapter.scrollBy(top - 27); }

        $popup.addClass('on');
        chapter.activePopup = _this;
    };

    _this.close = function() {
        $popup.removeClass('on');
        chapter.activePopup = null;
        setTimeout( function(){ $bubble.css('display', 'none'); }, 200);
    };

    _this.delete = function() { $popup.off('click', click); };

    var click = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if ($popup.hasClass('on')) {
            _this.close();
        } else {
            _this.open();
        }
    };

    $bubble.click(function(e){ e.stopPropagation(); });
    $popup.click(click);
};

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

M.Frame = M.Class.extend({
    init: function($el) {
        var width = $el.width('border');
        var height = $el.height('border');
        var ratio = height/width;

        var $wrap = $N('div', { class: 'frame-wrap'});
        $el.wrap($wrap);

        function resize() {
            var w = $wrap.width('border');
            var h = w * ratio;
            $wrap.css('height', h+'px');
            $el.transform('scale(' + w/width + ') translateZ(0)');
        }

        M.resize(resize);
    }
});

// M.scrollReveal($$('[scroll-reveal]'));

M.scrollReveal = function($els) {

    if (M.browser.isMobile && M.browser.width < 800 && M.browser.height < 800) return;

    // Viewport height reference
    var viewportHeight;
    function getHeight() { viewportHeight = window.innerHeight; }
    M.resize(getHeight);
    getHeight();

    // Scroll position reference;
    var viewportScroll;
    function getScroll() { viewportScroll = window.pageYOffset; }

    // Check if an element is visible
    function isInViewport($el, factor) {
        var elTop = $el.$el.offsetTop;
        var elHeight = $el.$el.offsetHeight;
        return (elTop + elHeight) >= viewportScroll +    factor  * viewportHeight &&
                elTop             <= viewportScroll + (1-factor) * viewportHeight;
    }

    // Initialise element and
    function makeElement($el) {
        var isShown = true;
        var options = ($el.attr('data-scroll') || '').split('|');

        var axis      = M.isOneOf(options[0], 'left', 'right') ? 'X' : 'Y';
        var direction = M.isOneOf(options[0], 'top', 'left') ? '-' : '';
        var factor    = M.isNaN(+options[1]) ? 0.2 : +options[1];
        var distance  = options[2] || '40px';
        var duration  = options[3] || '.5s';
        var delay     = options[4] || '0s';

        function show() {
            isShown = true;
            $el.css('opacity', '1');
            $el.transform('translate' + axis + '(0)');
        }

        function hide() {
            isShown = false;
            $el.css('opacity', '0');
            $el.transform('translate' + axis + '(' + direction + distance + ')');
        }

        $el.transition(['opacity', duration, delay, ',', M.prefix('transform'), duration, delay].join(' '));

        return function() {
            if (!isShown && isInViewport($el, factor)) show();
            if ( isShown && !isInViewport($el, 0)) hide();
        };
    }

    // Initialise Elements
    var updateFns = $els.each(function($el){ return makeElement($el); });
    var n = updateFns.length;

    // Trigger Updates
    function updatePage() { getScroll(); for (var i=0; i<n; ++i) updateFns[i](); }
    M.$body.scroll(updatePage);
    M.resize(updatePage);
    updatePage();
    setTimeout(function() { updatePage(); }, 500);

};

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

/*jshint evil: true */


M.Variable = M.Class.extend({

    init: function($i, section) {
        var _this = this;

        var values = section.varValues;
        var $el = $i;
        var fn = new Function('_vars', 'with(_vars){ return ' + $i.html() + '; }');

        this.on('change', function() {
            try { $el.html(fn(values)); } catch (e) { console.debug(fn, e); }
        });

        section.on('ready', function() {
            _this.trigger('change', values[name]);
        });

        if (!$i.attr('data-var')) return;

        // ----------------------------------------------------------------------------------------

        $i.addClass('var');
        var t = $i.attr('data-var').split('|');
        var name = t[0], init = t[1], type = t[2];
        var info = t[3] ? t[3].split(',') : [];
        $i.html('');
        
        var update = function() {
            section.vars.each(function(v) { v.trigger('change', values[name]); });
        };

        if (type === 'slider') {     // info = [min,max,step]

            values[name] = Number(init);
            $i.addClass('var-slider');
            info[0] = Number(info[0]);
            info[1] = Number(info[1]);
            info[2] = Number(info[2]);

            $el = $N('span', {'class': 'var-slider-text'}, $i);
            $N('span', {'class': 'left'}, $i);
            $N('span', {'class': 'right'}, $i);
            var $bubble   = $N('span', {'class': 'var-slider-bubble'}, $i);
            var $box      = $N('span', {'class': 'var-slider-bubble-box '}, $bubble);
            var $progress = $N('span', {'class': 'var-slider-progress'}, $box);
            $N('span', {'class': 'var-slider-bubble-arrow'}, $bubble);
            $progress.css('width', 116 * (values[name]-info[0]) / (info[1]-info[0]) + 'px');

            var startPosition = 0;
            var startValue = 0;
            var distance = 0;
            var sense = Math.sqrt( info[2] / (info[1] - info[0] ) * 1000 ) + (M.browser.isTouch?10:2);

            var slideStart = function(e){
                e.stopPropagation();
                e.preventDefault();
                startPosition = e.pageX || e.originalEvent.touches[0].pageX;
                startValue = values[name];
                $bubble.css('display', 'block');
                M.redraw();
                $bubble.addClass('on');
                M.$body.on('touchmove mousemove', slideMove);
                M.$body.on('touchend touchcancel mousecancel mouseup', slideEnd);
            };

            var slideMove = function(e){
                e.stopPropagation();
                e.preventDefault();
                distance = (e.pageX || e.originalEvent.touches[0].pageX) - startPosition;
                var old = values[name];
                values[name] = Math.round(Math.max(info[0],
                    Math.min(info[1], startValue + distance/sense))/info[2] ) * info[2];
                $progress.css('width', 116 * (values[name]-info[0]) / (info[1]-info[0]) + 'px');
                if (old !== values[name]) update();
            };

            var slideEnd = function(event){
                $bubble.removeClass('on');
                setTimeout( function() { $bubble.css('display', 'none'); }, 200);
                M.$body.off('touchmove mousemove', slideMove);
                M.$body.off('touchend touchcancel mousecancel mouseup', slideEnd);
            };

            $i.on('touchstart mousedown', slideStart);

        } else if( type === 'bolean' ) {     // info = []

            values[name] = !!Number(init);
            $i.click(function(){
                values[name] = !!values[name];
                update();
            });

        } else if( type === 'switch' ) {     // info = [val1,val2,val3,...]

            values[name] = init;
            var activeSwitch = 0;
            var maxSwitch = info.length-1;
            $i.click(function(){
                if (activeSwitch<maxSwitch) { ++activeSwitch; } else { activeSwitch = 0; }
                values[name] = info[activeSwitch];
                update();
            });

        }
    }

});








M.$.prototype.setPoints = function(p) {
    this.attr('d', p.length ? 'M' + p.each(function(x){ return x.x + ',' + x.y; }).join('L') : '' );
    this.points = p;
};

M.$.prototype.addPoint = function(p) {
    this.getPoints();
    this.attr('d', this.attr('d') + ' L ' + p.x + ',' + p.y);
    this.points.push(p);
};

M.$.prototype.getPoints = function() {
    if (!this.points) {
        var points = this.$el.attr('d').replace('M','').split('L');
        this.points = points.each(function(x){
            p = x.split(',');
            return new M.geo.Point(p[0], p[1]);
        });
    }
    return this.points;
};

// =================================================================================================

M.piechart = function(percentage, radius, colour) {

    // Checkmark when completed
    if (percentage >= 1) {
        return [
            '<svg width="',2*radius,'" height="',2*radius,'">',
            '<path fill="',colour,'" stroke="none" d="M',
            radius,',0C',radius*0.5,',0,0,',radius*0.5,',0,',radius,'s',
            radius*0.5,',',radius,',',radius,',',radius,'s',
            radius,'-',radius*0.5,',',radius,'-',radius,'S',radius*1.5,',0,',radius,',0',
            'z M',radius*44.6/50,',',radius*76.1/50,'L',radius*19.2/50,',',radius*48.8/50,
            'l',radius*4/50,'-',radius*4.2/50,'l',radius*19.8/50,',',radius*11.9/50,'l',
            radius*34.2/50,'-',radius*32.6/50,'l',radius*3.5/50,',',radius*3.5/50,'L',
            radius*44.6/50,',',radius*76.1/50,'z"/>','</svg>'
        ].join('');
    }

    var x = radius + radius * Math.sin(percentage * 2 * Math.PI);
    var y = radius - radius * Math.cos(percentage * 2 * Math.PI);

    return [
        '<svg width="',2*radius,'" height="',2*radius,'">',
        '<circle cx="',radius,'" cy="',radius,'" r="',radius-0.5,'" stroke="',colour,
        '" stroke-width="1" fill="transparent"/>','<path d="M ',radius,' ',radius,' L ',radius,
        ' 0 A ',radius,' ',radius,' 0 '+(percentage>0.5?'1':'0')+' 1 '+x+' '+y+' Z" fill="',
        colour,'"/>','</svg>'
    ].join('');
};

M.Draw = M.Class.extend({

    init: function($svg, options) {
        var _this = this;

        $svg.addClass('m-draw-pointer');

        this.$svg = $svg;
        this.options = options = (options || {});
        this.drawing = false;
        this.paths = [];
        this.p = null;
        this.activePath = null;

        if (!options.noStart) {
            $svg.on('mousedown touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var p = M.events.pointerOffset(event, $svg);
                _this.start(p);
            });
        }

        $svg.on('mousemove touchmove', function(e) {
            if (!_this.drawing) return;
            e.preventDefault();
            e.stopPropagation();
            var p = M.events.pointerOffset(event, $svg);
            _this.addPoint(p);
        });

        $svg.on('mouseup touchend mouseleave touchleave', function() {
            _this.trigger('end');
            _this.drawing = false;
        });
    },

    start: function(p) {
        if (this.p && M.geo.distance(this.p, p) < 20) {
            this.activePath.addPoint(p);

        } else {
            this.trigger('start');
            this.activePath = $N('path', {
                class: 'm-draw-path',
                d: 'M ' + p.x + ',' + p.y
            }, this.options.paths || this.$svg);
            this.activePath.points = [p];
            this.paths.push(this.activePath);
        }

        this.drawing = true;
        this.p = p;
    },

    addPoint: function(p) {
        if (M.geo.distance(this.p, p) > 4) {
            this.activePath.addPoint(p);
            this.p = p;
            this.checkForIntersects();
        }
    },

    stop: function() {
        this.drawing = false;
        this.p = null;
    },

    clear: function() {
        this.paths.each(function(path) { path.remove(); });
        this.paths = [];
        this.trigger('clear');
    },

    checkForIntersects: function() {
        if (!this.options.intersect || this.paths.length <= 1) return;
        
        var path1 = this.paths.last();
        var points1 = path1.getPoints();
        var line1 = new M.geo.Line(points1[points1.length-2], points1[points1.length-1]);

        for (var i=0; i<this.paths.length-1; ++i) {
            var path2 = this.paths[i];
            var points2 = path2.getPoints();
            for (var j=1; j<points2.length-2; ++j) {
                var line2 = new M.geo.Line(points2[j], points2[j+1]);
                var t = M.geo.intersect(line1, line2);
                if (t) {
                    this.trigger('intersect', { point: t, paths: [path1, path2] });
                    return;
                }
            }
        }
    },

});

M.Graph = M.Class.extend({

    init: function($svg, vertices, edges, options) {
        var _this = this;
        this.options = options = options || {};

        this.$edges = $N('g', {}, $svg);
        this.$vertices = $N('g', {}, $svg);

        this.vertices = [];
        this.edges = [];

        var resize = function() {
            _this.width = $svg.width();
            _this.height = $svg.height();
        };
        M.resize(resize);
        resize();

        this.stable = false;
        this.dragging = null;

        if (this.options.directed) {
            var $defs = $N('defs', {}, $svg);
            var $marker = $N('marker', {
                id: 'arrow-head',
                viewBox: '0 -5 10 10',
                refX: '14',
                refY: '0',
                markerWidth: '6',
                markerHeight: '6',
                orient: 'auto'
            }, $defs);
            $N('path', { d: 'M0,-5L10,0L0,5', class: 'arrow' }, $marker);
        }

        function onStart(e) {
            var u = M.events.pointerOffset(e, $svg);

            for (var i=0; i<_this.vertices.length; ++i) {
                var v = _this.vertices[i];
                if (M.geo.distance(u, v.posn) < 18) {
                    _this.dragging = v;
                    _this.dragging.posn = u;
                    _this.stable = false;
                    _this.redraw();
                    break;
                }
            }

            M.$body.on('mousemove touchmove', onMove);
            M.$body.on('mouseup touchend touchcancel mouseleave', onEnd);
        }

        function onMove(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!_this.dragging) return;
            _this.dragging.posn = M.events.pointerOffset(e, $svg);
            _this.redraw();
            _this.stable = false;
        }

        function onEnd(e) {
            _this.dragging = null;
            M.$body.off('mousemove touchmove', onMove);
            M.$body.off('mouseup touchend touchcancel mouseleave', onEnd);
        }

        $svg.on('mousedown touchstart', onStart);

        this.load(vertices, edges, options.posn);
    },

    load: function(vertices, edges, posn) {
        var _this = this;

        this.repulsion  = 50 / Math.sqrt(vertices);
        this.attraction = 0.1 * Math.sqrt(vertices) / edges.length * 200 /(this.width + this.height);
        this.gravity    = vertices/4;
        this.damping    = 0.9;

        this.$vertices.clear();
        this.$edges.clear();

        this.vertices = M.list(vertices).each(function(v) {
            var x = posn ? (posn[v][0] || posn[v].x) : _this.width * (0.3 + 0.4 * Math.random());
            var y = posn ? (posn[v][1] || posn[v].y) : _this.height* (0.3 + 0.4 * Math.random());

            var $el = _this.options.icon ? $N('path', { 'class': 'node', d: _this.options.icon, }, _this.$vertices) :
                          $N('circle', { 'class': 'node', r: _this.options.r || 5 }, _this.$vertices);
            if (_this.options.vertex) $el.css('fill', M.run(_this.options.vertex, [v]));
            return { $el: $el, posn: { x: x, y: y }, neighbours: [], v: { x: 0, y: 0 } };
        });

        this.edges = edges.each(function(e) {
            var v1 = _this.vertices[e[0]];
            var v2 = _this.vertices[e[1]];

            var type = (v1 === v2) || _this.options.arc ? 'path' : 'line';
            var $el = $N(type, { 'class': 'link' }, _this.$edges);
            if (_this.options.directed) $el.attr('marker-end', 'url(#arrow-head)');
            if (_this.options.edge) $el.css('stroke', M.run(_this.options.edge, [e[0], e[1]]));

            var edge = { $el: $el, vertices: [v1, v2] };

            v1.neighbours.push(v2);
            v2.neighbours.push(v1);
            return edge;
        });

        this.redraw();
    },

    redraw: function() {
        var _this = this;

        if (this.options.static) {
            this.arrange();
            return;
        }

        if (this.animating) return;
        this.animating = true;
        this.stable = false;

        function tick() {
            // TODO Time intervals, trigger next before previous finished
            if(_this.stable) {
                _this.animating = false;
            } else {
                M.animationFrame(tick);
                _this.physics();
            }
        }
        tick();
    },

    physics: function() {
        var _this = this;

        var positions = [];
        var totalMoved = 0;

        this.vertices.each(function(v, i) {
            if (_this.options.static || v === _this.dragging) return;
            var force = { x: 0, y: 0 };

            _this.vertices.each(function(u) {
                if (u === v) return;

                // Coulomb's Repulsion between Vertices
                var d = M.square(v.posn.x - u.posn.x) + M.square(v.posn.y - u.posn.y);
                if (M.nearlyEquals(d, 0, 0.001)) d = 0.001;
                var coul = _this.repulsion / d;
                force.x += coul * (v.posn.x - u.posn.x);
                force.y += coul * (v.posn.y - u.posn.y);
            });

            v.neighbours.each(function(u) {
                // Hook's attraction between Neighbours
                force.x += _this.attraction * (u.posn.x - v.posn.x);
                force.y += _this.attraction * (u.posn.y - v.posn.y);
            });

            // Additional Force towards center of svg
            force.x += _this.gravity * (0.5 - v.posn.x/_this.width);
            force.y += _this.gravity * (0.5 - v.posn.y/_this.height);

            v.v.x = (v.v.x + force.x) * _this.damping;
            v.v.y = (v.v.y + force.y) * _this.damping;
            totalMoved += Math.abs(v.v.x) + Math.abs(v.v.y);
            positions[i] = { x: v.posn.x + v.v.x, y: v.posn.y + v.v.y };
        });

        this.stable = (totalMoved < 0.5 && !this.dragging);
        this.arrange(positions);
    },

    arrange: function(positions) {

        var _this = this;
        if (!positions) positions = [];
        var center = null;

        this.vertices.each(function(v, i) {
            v.posn = positions[i] || v.posn;

            if (_this.options.bound) {
                var distance = _this.options.r || 5;
                v.posn.x = M.bound(v.posn.x, distance, _this.width  - distance);
                v.posn.y = M.bound(v.posn.y, distance, _this.height - distance);
            }

            if (_this.options.icon) {
                v.$el.translate(v.posn.x, v.posn.y);
            } else {
                v.$el.attr('cx', v.posn.x);
                v.$el.attr('cy', v.posn.y);
            }
        });

        this.edges.each(function(e) {

            // connected to self
            if (e.vertices[0] === e.vertices[1]) {
                if (!center) center = M.geo.average(_this.vertices.each(function(v) { return v.posn; }));

                var v = M.Vector([e.vertices[0].posn.x - center.x, e.vertices[0].posn.y - center.y]).normalise();
                var v0 = M.vector.mult([v[0] + v[1], v[1] - v[0]], 40);
                var v1 = M.vector.mult([v[0] - v[1], v[1] + v[0]], 40);

                e.$el.attr('d', 'M'+e.vertices[0].posn.x+','+e.vertices[0].posn.y+
                    'c'+v0[0]+','+v0[1]+','+v1[0]+','+v1[1]+',0,0');
            
            // arcs
            } else if (_this.options.arc) {
                var dx = e.vertices[1].posn.x - e.vertices[0].posn.x;
                var dy = e.vertices[1].posn.y - e.vertices[0].posn.y;
                var dr = Math.sqrt(dx * dx + dy * dy);

                e.$el.attr('d', 'M'+e.vertices[0].posn.x+','+e.vertices[0].posn.y+'A'+dr+','+
                    dr+' 0 0,1 '+e.vertices[1].posn.x+','+e.vertices[1].posn.y);

            } else {
                e.$el.attr('x1', e.vertices[0].posn.x);
                e.$el.attr('y1', e.vertices[0].posn.y);
                e.$el.attr('x2', e.vertices[1].posn.x);
                e.$el.attr('y2', e.vertices[1].posn.y);
            }
        });

        this.trigger('update');
    }
});


})();