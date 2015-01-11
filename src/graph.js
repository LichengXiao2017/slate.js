// =================================================================================================
// Slate.js | Graph
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


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
