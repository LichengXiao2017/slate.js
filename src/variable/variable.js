// =============================================================================
// Slate.js | Variables
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';
import Browser from 'browser';


const varCache = {};
const valueCache = {};

export default customElement('x-var', {
    created: function($el) {

        // ---------------------------------------------------------------------
        // All Variable Elements

        let scope = $el.attr('scope');

        if (!varCache[scope]) varCache[scope] = {};
        let values = varCache[scope];

        // FIXME use expressions
        // jshint evil: true
        let fn = new Function('_vars', 'with(_vars){ return ' + $el.text() + '; }');

        function render() {
            try { $el.html(fn(values)); } catch (e) { console.debug(fn, e); }
        }

        // TODO initial render


        // ---------------------------------------------------------------------
        // Variable Declarations

        let attr = $el.attr('value');
        if (!attr) return;
        let details = attr.split('|');

        let name = t[0];
        let init = t[1];
        let type = t[2];
        let info = t[3] ? t[3].split(',') : [];

        function update(v) {
            if (values[value] === v) return;
            values[name] = v;
            // TODO update all variables
            $el.trigger('change', v);
        }

        $el.addClass('var');
        $el.text('');


        // ---------------------------------------------------------------------
        // Variable Types

        if (type === 'slider') {     // info = [min, max, step]

            values[name] = Number(init);
            $el.addClass('var-slider');
            info = info.map(x => +x);

            $el = $N('span', {'class': 'var-slider-text'}, $el);
            $N('span', {'class': 'left'}, $el);
            $N('span', {'class': 'right'}, $el);
            var $bubble   = $N('span', {'class': 'var-slider-bubble'}, $el);
            var $box      = $N('span', {'class': 'var-slider-bubble-box '}, $bubble);
            var $progress = $N('span', {'class': 'var-slider-progress'}, $box);
            $N('span', {'class': 'var-slider-bubble-arrow'}, $bubble);
            $progress.css('width', 116 * (values[name]-info[0]) / (info[1]-info[0]) + 'px');

            var startPosition = 0;
            var startValue = 0;
            var distance = 0;
            var sense = Math.sqrt( info[2] / (info[1] - info[0] ) * 1000 ) + (Browser.isTouch?10:2);

            var slideStart = function(e){
                e.stopPropagation();
                e.preventDefault();
                startPosition = e.pageX || e.originalEvent.touches[0].pageX;
                startValue = values[name];
                $bubble.css('display', 'block');
                Browser.redraw();
                $bubble.addClass('on');
                $body.on('pointerMove', slideMove);
                $body.on('pointerEnd', slideEnd);
            };

            var slideMove = function(e){
                e.stopPropagation();
                e.preventDefault();
                distance = (e.pageX || e.originalEvent.touches[0].pageX) - startPosition;
                var old = values[name];
                values[name] = Math.round(Math.max(info[0],
                    Math.min(info[1], startValue + distance/sense))/info[2] ) * info[2];
                if (old !== values[name]) update();
                $progress.css('width', 116 * (values[name]-info[0]) / (info[1]-info[0]) + 'px');
            };

            var slideEnd = function(event){
                $bubble.removeClass('on');
                setTimeout(function() { $bubble.css('display', 'none'); }, 200);
                $body.off('pointerMove', slideMove);
                $body.off('pointerEnd', slideEnd);
            };

            $i.on('pointerStart', slideStart);

        } else if( type === 'bolean' ) {     // info = []

            values[name] = Boolean(init);
            $i.on('click', function(){
                values[name] = !!values[name];
                update();
            });

        } else if( type === 'switch' ) {     // info = [val1,val2,val3,...]

            values[name] = init;
            var activeSwitch = 0;
            var maxSwitch = info.length-1;
            $i.on('click', function(){
                if (activeSwitch<maxSwitch) { activeSwitch += 1; } else { activeSwitch = 0; }
                values[name] = info[activeSwitch];
                update();
            });

        }


    }

});
