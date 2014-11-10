// =================================================================================================
// Slate.js | Draw
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


M.Draw = function($svg, options) {

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

M.Draw.prototype.checkForIntersects = function() {

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

M.Draw.prototype.stop = function() {
    this.drawing = false;
    this.p = null;
};

M.Draw.prototype.clear = function() {
    this.paths.each(function(path) { path.remove(); });
    this.paths = [];
};
