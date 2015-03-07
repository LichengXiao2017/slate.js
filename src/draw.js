// =================================================================================================
// Slate.js | Draw
// (c) 2015 Mathigon / Philipp Legner
// =================================================================================================


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
