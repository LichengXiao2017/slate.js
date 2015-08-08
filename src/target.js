
var Target = M.Class.extend({
    init: function($el, chapter) {
        var $borders;

        $el.on('mouseenter touchstart', function() {

            $borders = [];
            var bounds = [];

            $$($el.attr('data-target')).each(function($target) {
                var b = $target.offset();
                if (!b.height || !b.width) return;

                if ($target.hasParent(chapter.$body)) {
                    var p = b.top - 14;
                    var q = b.top + b.height - M.browser.height + 14;
                    bounds.push({ geo: b, scroll: true, ds: p < 0 ? p - 10 : q > 0 ? q + 10 : 0 });
                } else {
                    bounds.push({ geo: b, ds: 0 });
                }
            });

            var scroll = bounds.extract('ds').maxAbs();
            chapter.scrollBy(scroll, 400);

            bounds.each(function(b) {
                var $border = $N('div', { class: 'target-bounds' }, chapter.$targetWrap);

                $border.css({
                    top:    b.geo.top - 14 - (b.scroll ? scroll : 0) + 'px',
                    left:   b.geo.left - 14 + 'px',
                    width:  b.geo.width + 20 + 'px',
                    height: b.geo.height + 20 + 'px'
                });

                if (scroll && b.scroll) {
                    setTimeout(function() { $border.fadeIn(200); }, 300);
                } else {
                    $border.fadeIn(200);
                }

                $borders.push($border);
            });

            if (!bounds.length) return;
            var targetBounds = $el.offset();

            var dx = bounds[0].geo.left + bounds[0].geo.width/2  - targetBounds.left - 17;
            var dy = bounds[0].geo.top  + bounds[0].geo.height/2 - targetBounds.top  - 17 - scroll;
            var angle = 45 + Math.atan2(dy, dx) * 180 / Math.PI;

            $el.transform('rotate(' + Math.round(angle) + 'deg)');
        });

        $el.on('mouseleave touchend', function() {
            $borders.each(function($b) {
                $b.fadeOut(200);
                setTimeout(function() { $b.delete(); }, 200);
            });
            $el.transform('none');
        });

    }
});

