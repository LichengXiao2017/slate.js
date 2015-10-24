// =============================================================================
// Slate.js | Draggable
// (c) 2015 Mathigon
// =============================================================================



import { $body } from 'elements';
import Evented from 'evented';
import Browser from 'browser';
import { clamp } from 'utilities';


function getPosn(e) {
    let x = event.touches ? e.touches[0].clientX : e.clientX;
    let y = event.touches ? e.touches[0].clientY : e.clientY;
    return { x, y };
}

export default class Draggable extends Evented {

    constructor($el, $parent, direction = '', margin = 0) {
        super();
        let _this = this;
        let lastPosn, noMove;

        this.$el = $el;
        this._posn = { x: null, y: null };
        this.move = { x: direction !== 'y', y: direction !== 'x' };

        function motionStart(e) {
            $body.on('pointerMove', motionMove);
            $body.on('pointerEnd', motionEnd);
            lastPosn = getPosn(e);
            noMove = true;
            _this.trigger('start');
        }

        function motionMove(e) {
            e.preventDefault();

            let newPosn = getPosn(e);
            noMove = false;

            let x = clamp(_this._posn.x + newPosn.x - lastPosn.x, 0, _this.width);
            let y = clamp(_this._posn.y + newPosn.y - lastPosn.y, 0, _this.height);

            lastPosn = newPosn;
            _this.position = { x, y };
        }

        function motionEnd() {
            $body.off('pointerMove', motionMove);
            $body.off('pointerEnd', motionEnd);
            _this.trigger(noMove ? 'click' : 'end');
        }

        function resize() {
            let oldWidth = _this.width;
            let oldHeight = _this.height;

            _this.width  = $parent.width  - margin * 2;
            _this.height = $parent.height - margin * 2;

            let x = _this.width  / oldWidth  * _this._posn.x;
            let y = _this.height / oldHeight * _this._posn.y;
            _this.draw(x, y);
        }

        $el.on('pointerStart', motionStart);

        Browser.resize(resize);
        resize();
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
