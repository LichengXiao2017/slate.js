// =================================================================================================
// Slate.js | Scrollreveal
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


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
