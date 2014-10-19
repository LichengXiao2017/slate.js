// Boost Browser and DOM Tools
// (c) 2014, Mathigon / Philipp Legner
// MIT License (https://github.com/Mathigon/slate.js/blob/master/LICENSE)

 (function() {
M.audio = {
    files: {},
    playing: null,
    load: function(src, id) {
        M.Audio.files[id] = new Audio(src);
        M.Audio.files[id].load();
        M.Audio.files[id].addEventListener('timeupdate', function() {
            if (M.Audio.playing) M.Audio.playing.update();
        });
        return M.Audio.files[id];
    }
};

M.audio.Chunk = M.Class.extend({

    init: function(file, times) {
        if (M.isString(times)) times = times.split('|').toNumbers();
        this.times = times;
        this.currentTime = times[0];
        this.duration = times[1] - times[0];
        this.player = M.Audio.files[file] || M.Audio.load(file, Math.floor(Math.random()*10000));
        this.ended = false;
    },

    play: function() {
        var _this = this;

        if (this.player.readyState < 2) {
            $(this.player).one('canplay seeked', function() { _this.play(); });
            return;
        }

        if (M.Audio.playing) M.Audio.playing.pause();
        M.Audio.playing = this;

        this.ended = false;
        this.player.currentTime = this.currentTime;
        this.player.play();
        this.trigger('play', { p: (this.currentTime - this.times[0]) / this.duration, t: this.currentTime });
    },

    pause: function() {
        if (M.Audio.playing === this) this.player.pause();
        this.trigger('pause');
    },

    setTime: function(time) {
        if (this.player.readyState) this.player.currentTime = time;
        this.trigger('timeupdate', { p: (time - this.times[0]) / this.duration, t: time });
    },

    reset: function() {
        if (M.Audio.playing === this) this.player.pause();
        if (this.player.readyState) this.currentTime = this.times[0];
        this.ended = true;
        this.trigger('reset');
    },

    update: function() {
        if (this.ended) return;

        if (M.Audio.playing === this)
            this.currentTime = this.player.currentTime;

        if (this.currentTime >= this.times[1]) {
            this.ended = true;
            this.pause();
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

M.Bubble = function($popup, chapter) {

    // TODO onopen(), onclose() functions

    var _this = this;

    var $bubble = $C('popup-bubble',$popup)[0];
    if (!$bubble) return;

    var $bubbleBox = $C('bubble-box',$bubble)[0];
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
            $bubbleBox.transformX(pageLeft + 10 - left);

        if (right > pageRight - 54)
            $bubbleBox.transformX(pageRight - 54 - right);

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

M.Gallery = function($panel, options) {
    if (!options) options = {};

    var $wrapper = $N('div', { class: 'gallery-wrapper' });
    var $box = $N('div', { class: 'gallery-box' });
    $panel.wrap($wrapper);
    $wrapper.wrap($box);
    var $slides = $panel.children();

    var slidesCount = $slides.length;
    var staticSlideWidth = $panel.attr('data-slide-width') || null;

    var width, slidesPerPage, slideWidth;
    var activeIndex = 0;
    var transformX = 0;

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
        transformX = offset;
        $panel.transformX(offset);
        /*if (options.opacity) $slides.each(function($s, i) {
            var x = ((i+1)*slideWidth + offset) / slideWidth;
            $s.css('opacity', M.easing('quad', 0.4 + 0.6 * x.bound(0,1) ));
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
        animStart = transformX;
        animDistance = -newIndex * slideWidth - transformX;
        animStartTime = M.now();
        makeActive(newIndex);
        animRender();
    };

    var next = function() {
        animTiming = 'quad';
        if (activeIndex < slidesCount - slidesPerPage) {
            $next.pulse();
            startAnimationTo(activeIndex+1);
        }
    };

    var back = function() {
        animTiming = 'quad';
        if (activeIndex > 0) {
            $back.pulse();
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
        motionStartPosn = transformX;
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
        startAnimationTo(Math.round(-transformX/slideWidth-shift).bound(0, slidesCount - slidesPerPage));
    };

    $wrapper.on('mousedown touchstart', motionStart);

    // ---------------------------------------------------------------------------------------------

    resize();
    M.resize(resize);

    return {
        next: next,
        back: back
    };
};

M.Lightbox = function($container, chapter) {

    var $lightbox        = $N('div', {'class': 'lightbox-overlay' }, $container);
    var $lightboxImg     = $N('div', {'class': 'lightbox-img' }, $lightbox);
    var $lightboxCaption = $N('div', {'class': 'lightbox-caption' }, $lightbox);
    var transform = {};

    function add($img) {
        var src = $img.attr('src');
        var $wrap = $N('div', { class: 'lightbox' });
        $img.wrap($wrap);
        $N('div', {'class': 'lightbox-zoom' }, $wrap);
        $wrap.click(function() { open($wrap, src); });
    }

    var activeImg;

    function open($img, src) {
        activeImg = $img;
        $lightbox.css('display', 'block');

        var newX = $img.$el.getBoundingClientRect();
        var oldX = $lightboxImg.$el.getBoundingClientRect();

        var X = newX.left + newX.width /2 - oldX.left - oldX.width /2;
        var Y = newX.top  + newX.height/2 - oldX.top  - oldX.height/2;
        var S = Math.max(newX.width/oldX.width, newX.height/oldX.height);
        transform = {X: X, Y: Y, S: S};

        $lightboxImg.css('background-image', 'url('+src.replace(/\.(?=[^.]*$)/, '-large.')+'), url('+src+')');
        $lightboxImg.transform('translate('+X+'px,'+Y+'px) scale('+S+')');
        // TODO caption text

        M.redraw();
        $lightboxImg.addClass('transitions');
        M.redraw();

        $img.css('visibility', 'hidden');
        chapter.$toolbar.addClass('off');
        $lightbox.addClass('on');
        $lightboxImg.transform('scale(1) translate(0,0)');
    }

    function close() {
        $lightbox.removeClass('on');
        $lightboxImg.transform('translate('+transform.X+'px,'+transform.Y+'px) scale('+transform.S+')');
        chapter.$toolbar.removeClass('off');

        setTimeout( function() {
            activeImg.css('visibility', 'visible');
            $lightbox.css('display', 'none');
            $lightboxImg.transform('none');
            $lightboxImg.transform('none');
            $lightboxImg.removeClass('transitions');
        }, 400);
    }

    $lightbox.click(function(){ close(); });

    return {
        add: add,
        open: open,
        close: close
    };
};

(function() {

    // M.scrollReveal($$('[scroll-reveal]'));

    M.scrollReveal = function($els, $parent) {

        // Scroll parent
        var isWindow = !$parent;
        var parentEl =  isWindow ? window.document.documentElement : $parent.$el;
        if (isWindow) $parent = M.$window;

        // Viewport height reference
        var viewportHeight;
        function getHeight() { viewportHeight = isWindow ? window.innerHeight : parentEl.clientHeight; }
        M.resize(getHeight);
        getHeight();

        // Scroll position reference;
        var viewportScroll;
        function getScroll() { viewportScroll = isWindow ? window.pageYOffset : parentEl.scrollTop; }

        // Check if an element is visible
        function isInViewport($el, factor) {
            var elTop = $el.$el.offsetTop;
            var elHeight = $el.$el.offsetHeight;
            return (elTop + elHeight) >= viewportScroll +    factor  * viewportHeight &&
                    elTop             <= viewportScroll + (1-factor) * viewportHeight;
        }

        // Initialise element and
        function makeElement($el) {
            var isShown = false;
            var options = ($el.attr('data-scroll') || '').split('|');

            var axis      = M.isOneOf(options[0], 'left', 'right') ? 'X' : 'Y';
            var direction = M.isOneOf(options[0], 'top', 'left') ? '-' : '';
            var distance  = options[1] || '24px';
            var duration  = options[2] || '.5s';
            var delay     = options[3] || '0s';
            var factor    = M.isNaN(+options[4]) ? 0.25 : +options[4];

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

            hide();
            M.redraw();

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
        $parent.scroll(updatePage);
        M.resize(updatePage);
        updatePage();

    };

})();

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
            var x = (position[0] + newPosition[0] - dragStart[0]).bound(0, width);
            var y = (position[1] + newPosition[1] - dragStart[1]).bound(0, height);
            draw(x, y);
        };

        var motionEnd = function(e) {
            M.$body.off('mousemove touchmove', motionMove);
            M.$body.off('mouseup mouseleave touchend touchcancel', motionEnd);
            var newPosition = getPosn(e);
            if (newPosition[0] === dragStart[0] && newPosition[1] === dragStart[1]) {
                _this.trigger('click');
            } else {
                var x = (position[0] + newPosition[0] - dragStart[0]).bound(0, width);
                var y = (position[1] + newPosition[1] - dragStart[1]).bound(0, height);
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
            $knob.pulse();
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

M.makeVariable = function($i, section) {
    /*jshint evil: true */

    var vars = section.varValues;

    var fn = new Function('_vars', 'with(_vars){ return '+$i.html()+'; }');
    var v = { $el: $i, fn: fn};

    var callbackAttr = $i.attr('data-fn');
    var callback = callbackAttr ? new Function('_vars','with(_vars){ ' + callbackAttr + ' }') : null;

    section.varEvals.push(v);
    if( !$i.attr('data-var') ) return;

    $i.addClass('var');
    var t = $i.attr('data-var').split('|');
    var name = t[0], init = t[1], type = t[2];
    var info = t[3] ? t[3].split(',') : [];
    $i.html('');

    if( type === 'slider' ) {     // info = [min,max,step]

        vars[name] = Number(init);
        $i.addClass('var-slider');
        info[0] = Number(info[0]);
        info[1] = Number(info[1]);
        info[2] = Number(info[2]);

        v.$el = $N('span', {'class': 'var-slider-text'}, $i);
        $N('span', {'class': 'left'}, $i);
        $N('span', {'class': 'right'}, $i);
        var $bubble   = $N('span', {'class': 'var-slider-bubble'}, $i);
        var $box      = $N('span', {'class': 'var-slider-bubble-box '}, $bubble);
        var $progress = $N('span', {'class': 'var-slider-progress'}, $box);
        $N('span', {'class': 'var-slider-bubble-arrow'}, $bubble);
        $progress.css('width', 116 * (vars[name]-info[0]) / (info[1]-info[0]) + 'px');

        var startPosition = 0;
        var startValue = 0;
        var distance = 0;
        var sense = Math.sqrt( info[2] / (info[1] - info[0] ) * 1000 ) + (M.browser.isTouch?10:2);

        var slideStart = function(event){
            event.stopPropagation();
            event.preventDefault();
            startPosition = event.pageX || event.originalEvent.touches[0].pageX;
            startValue = vars[name];
            $bubble.css('display', 'block');
            M.redraw();
            $bubble.addClass('on');
            M.$body.on('touchmove mousemove', slideMove);
            M.$body.on('touchend touchcancel mouseup', slideEnd);
        };

        var slideMove = function(event){
            event.stopPropagation();
            event.preventDefault();
            distance = (event.pageX || event.originalEvent.touches[0].pageX) - startPosition;
            var old = vars[name];
            vars[name] = Math.round(Math.max(info[0],
                Math.min(info[1], startValue + distance/sense))/info[2] ) * info[2];
            $progress.css('width', 116 * (vars[name]-info[0]) / (info[1]-info[0]) + 'px');
            if (old !== vars[name]) {
                section.evalVariables();
                if (callback) callback(section.varValues);
            }
        };

        var slideEnd = function(event){
            $bubble.removeClass('on');
            setTimeout( function() { $bubble.css('display', 'none'); }, 200);
            M.$body.off('touchmove mousemove', slideMove);
            M.$body.off('touchend touchcancel mouseup', slideEnd);
        };

        $i.on('touchstart mousedown', slideStart);

    } else if( type === 'bolean' ) {     // info = []

        vars[name] = !!Number(init);
        $i.click(function(){
            vars[name] = !!vars[name];
            section.evalVariables();
            if (callback) callback(section.varValues);
        });

    } else if( type === 'switch' ) {     // info = [val1,val2,val3,...]

        vars[name] = init;
        var activeSwitch = 0;
        var maxSwitch = info.length-1;
        $i.click(function(){
            if (activeSwitch<maxSwitch) { ++activeSwitch; } else { activeSwitch = 0; }
            vars[name] = info[activeSwitch];
            section.evalVariables();
            if (callback) callback(section.varValues);
        });

    }

    return callback || null;
};

M.svg = {};

M.svg.el = function(type, attributes, parent) {
    var _this = this;
    var svgns = 'http://www.w3.org/2000/svg';
    this.$el = document.createElementNS(svgns, type);
    this.data = {};
    M.each(attributes, function(val, key){ _this.$el.setAttribute(key, val); });
    if (parent) parent.append(this);
};

M.inherit(M.svg.el, M.$);

M.svg.el.prototype.setPoints = function(p) {
    this.attr('d', p.length ? 'M' + p.each(function(x){ return x.join(','); }).join('L') : '' );
    this.points = p;
};

M.svg.el.prototype.addPoint = function(p) {
    this.attr('d', this.attr('d') + ' L '+p.join(',') );
    this.points.push(p);
};

M.svg.el.prototype.getPoints = function() {
    var points = this.$el.attr('d').replace('M','').split('L');
    return points.each(function(x){ return x.split(',').toNumbers(); });
};

M.piechart = function(percentage, radius, colour) {
    var str;

    if (percentage >= 1) {

        str = [
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

    } else {

        var x = radius + radius * Math.sin(percentage * 2 * Math.PI);
        var y = radius - radius * Math.cos(percentage * 2 * Math.PI);

        str = [
            '<svg width="',2*radius,'" height="',2*radius,'">',
            '<circle cx="',radius,'" cy="',radius,'" r="',radius-0.5,'" stroke="',colour,
            '" stroke-width="1" fill="transparent"/>','<path d="M ',radius,' ',radius,' L ',radius,
            ' 0 A ',radius,' ',radius,' 0 '+(percentage>0.5?'1':'0')+' 1 '+x+' '+y+' Z" fill="',
            colour,'"/>','</svg>'
        ].join('');

    }

    return str;
};

M.draw = function($svg, options) {

    var _this = this;

    $svg.addClass('m-draw-pointer');
    _this.options = options;
    _this.drawing = false;
    _this.paths = [];
    _this.p = null;
    var activePath = null;

    _this.start = function(p) {
        if (_this.p && M.geo.distance(_this.p, p) < 20) {
            activePath.addPoint(p);

        } else {
            if (options.onStart) options.onStart(p);
            activePath = new M.svg.el('path', {
                'class': 'm-draw-path',
                'd': 'M '+p.join(',')
            }, options.paths || $svg);
            activePath.points = [p];
            _this.paths.push(activePath);
        }

        _this.drawing = true;
        _this.p = p;
    };

    _this.addPoint = function(p) {
        if (M.geo.manhatten(_this.p, p) > 4) {
            activePath.addPoint(p);
            _this.p = p;
            if (options.onIntersect) _this.checkForIntersects();
        }
    };

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
        _this.drawing = false;
    });
};

M.draw.prototype.checkForIntersects = function() {

    if (this.paths.length <= 1) return;
    var path = this.paths.last();
    var a1 = path.points[path.points.length-2];
    var a2 = path.points[path.points.length-1];

    for (var i=0; i<this.paths.length-1; ++i) {
        var l = this.paths[i].points.length;
        for (var j=1; j<l-2; ++j) {
            var t = M.geo.intersect(a1, a2, this.paths[i].points[j], this.paths[i].points[j+1]);
            if (t) {
                this.options.onIntersect(t, path, this.paths[i]);
                return;
            }
        }
    }
};

M.draw.prototype.stop = function() {
    this.drawing = false;
    this.p = null;
};

M.draw.prototype.clear = function() {
    this.paths.each(function(path) { path.remove(); });
    this.paths = [];
};


})();