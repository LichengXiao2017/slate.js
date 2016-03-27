// =============================================================================
// Slate.js | Draggable
// (c) 2015 Mathigon
// =============================================================================



import { $body } from 'elements';
import Evented from 'evented';
import Browser from 'browser';
import { clamp } from 'utilities';
import { slide } from 'events';


export default class Draggable extends Evented {

    constructor($el, $parent, direction = '', margin = 0) {
        super();
        let _this = this;
        let lastPosn, noMove;

        this.$el = $el;
        this._posn = { x: null, y: null };
        this.move = { x: direction !== 'y', y: direction !== 'x' };

        slide($el, {
            start: function(posn) {
                lastPosn = posn;
                noMove = true;
                _this.trigger('start');
            },
            move: function(posn) {
                noMove = false;

                let x = clamp(_this._posn.x + posn.x - lastPosn.x, 0, _this.width);
                let y = clamp(_this._posn.y + posn.y - lastPosn.y, 0, _this.height);

                lastPosn = posn;
                _this.position = { x, y };
            },
            end: function() {
                _this.trigger(noMove ? 'click' : 'end');
            }
        });

        Browser.resize(function () {
            let oldWidth = _this.width;
            let oldHeight = _this.height;

            _this.width  = $parent.width  - margin * 2;
            _this.height = $parent.height - margin * 2;

            let x = _this.width  / oldWidth  * _this._posn.x;
            let y = _this.height / oldHeight * _this._posn.y;
            _this.draw(x, y);
        });
    }

    get position() {
        return this._posn;
    }

    set position(posn) {
        this.draw(posn);
        this._posn = posn;
        this.trigger('move', posn);
    }

    draw({ x, y }) {
        if (this.move.x) this.$el.css('left', Math.round(x) + 'px');
        if (this.move.y) this.$el.css('top',  Math.round(y) + 'px');
    }

}
