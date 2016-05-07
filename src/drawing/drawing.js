// =============================================================================
// Slate.js | Drawing
// (c) 2015 Mathigon
// =============================================================================



import Evented from 'evented';
import { last } from 'arrays';
import { $N } from 'elements';
import { Point, Line, lineLineIntersect } from 'geometry';
import { svgPointerPosn, stopEvent } from 'events';


export default class Drawing extends Evented {

    constructor($svg, options = {}) {
        super();
        $svg.addClass('drawing-pointer');

        this.$svg = $svg;
        this.options = options;
        this.drawing = false;
        this.paths = [];
        this.p = null;
        this.activePath = null;

        if (!options.noStart) {
            $svg.on('pointerStart', e => {
                stopEvent(e);
                this.start(svgPointerPosn(event, $svg));
            });
        }

        $svg.on('pointerMove', e => {
            if (!this.drawing) return;
            stopEvent(e);
            this.addPoint(svgPointerPosn(event, $svg));
        });

        $svg.on('pointerEnd', () => {
            this.trigger('end');
            this.drawing = false;
        });
    }

    start(p) {
        if (this.p && Point.distance(this.p, p) < 20) {
            this.activePath.addPoint(p);

        } else {
            this.trigger('start');
            this.activePath = $N('path', {
                class: 'drawing-path',
                d: 'M ' + p.x + ',' + p.y
            }, this.options.paths || this.$svg);
            this.activePath.points = [p];
            this.paths.push(this.activePath);
        }

        this.drawing = true;
        this.p = p;
    }

    addPoint(p) {
        if (Point.distance(this.p, p) > 4) {
            this.activePath.addPoint(p);
            this.p = p;
            this.checkForIntersects();
        }
    }

    stop() {
        this.drawing = false;
        this.p = null;
    }

    clear() {
        this.paths.forEach(path => { path.remove(); });
        this.paths = [];
        this.trigger('clear');
    }

    clearPaths(paths) {
        paths.forEach(p => { p.exit('draw', 200); });
        this.paths = this.paths.filter(p => paths.indexOf(p) < 0);
    }

    checkForIntersects() {
        if (!this.options.intersect || this.paths.length <= 1) return;

        var path1 = last(this.paths);
        var points1 = path1.points;
        var line1 = new Line(points1[points1.length-2], points1[points1.length-1]);

        for (var i = 0; i < this.paths.length - 1; ++i) {
            var path2 = this.paths[i];
            var points2 = path2.points;
            for (var j = 1; j < points2.length - 2; ++j) {
                var line2 = new Line(points2[j], points2[j + 1]);
                var t = lineLineIntersect(line1, line2);
                if (t) {
                    this.trigger('intersect', { point: t, paths: [path1, path2] });
                    return;
                }
            }
        }
    }

}
