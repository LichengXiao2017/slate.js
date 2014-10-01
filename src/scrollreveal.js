// =================================================================================================
// Slate.js | Scrollreveal
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


(function() {

    // M.scrollReveal($$('[scroll-reveal]'));

    M.scrollReveal = function($els, $parent) {

        // Scroll parent
        var isWindow = !!$parent;
        var parentEl =  $parent ? $parent.$el : window.document.documentElement;
        if (!$parent) $parent = M.$window

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
            var elTop = $el.offsetTop;
            var elHeight = $el.$el.offsetHeight;
            return (elTop +    factor  * elHeight) <= viewportScroll + viewportHeight &&
                   (elTop + (1-factor) * elHeight) >= viewportScroll;
        };

        // Initialise element and
        function makeElement($el) {
            var isShown = false;
            var options = $el.attr('data').split('|');

            var axis      = M.isOneOf(options[0], 'left', 'right') ? 'X' : 'Y';
            var direction = M.isOneOf(options[0], 'top', 'left') ? -1 : 1;
            var distance  = options[1] || '24px';
            var duration  = options[2] || '.66s';
            var delay     = options[3] || '0s';
            var factor    = M.isNaN(+options[4]) ? 0.33 : +options[4];

            function show() {
                isShown = true;
                $el.css('opacity', '1');
                $el.transform('translate' + axis + '(0)');
            }

            function hide() {
                isShown = false;
                $el.css('opacity', '0');
                $el.transform('translate' + axis + '(' + (direction * distance) + ')');
            }

            hide();

            $el.transition(['opacity' + duration + delay + ',' + M.cssTransform + duration + delay].join(' '));

            return function() {
                var isVisible = isInViewport($el, factor);
                if (isVisible && !isShown) show();
                if (!isVisible && isShown) hide();
            }
        };

        // Initialise Elements
        var updateFns = $els.each(function($el){ return makeElement($el); });
        var n = updateFns.length;

        // Trigger Updates
        function updatePage() { getScroll(); for (var i=0; i<n; ++i) updateFns[i](); };
        $parent.onScroll(updatePage);
        M.resize(updatePage);
        updatePage();

    };

})();
