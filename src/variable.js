// =============================================================================
// Slate.js | Variables
// (c) 2015 Mathigon
// =============================================================================



import { $, customElement, $body } from 'elements';


export default customElement('x-var', {

    created: function() {
        // TODO
    },

    attached: function() {
        // TODO
    },

    detached: function() {
        // TODO
    },

    attributes: {

    }

});




/*
    constructor($i, section) {
        var _this = this;

        var values = section.varValues;
        var $el = $i;

        // jshint evil: true
        var fn = new Function('_vars', 'with(_vars){ return ' + $i.text() + '; }');

        this.on('change', function() {
            try { $el.html(fn(values)); } catch (e) { console.debug(fn, e); }
        });

        section.on('ready', function() {
            _this.trigger('change', values[name]);
        });

        if (!$i.attr('data-var')) return;

        // ---------------------------------------------------------------------

        $i.addClass('var');
        var t = $i.attr('data-var').split('|');
        var name = t[0], init = t[1], type = t[2];
        var info = t[3] ? t[3].split(',') : [];
        $i.html('');
        
        var update = function() {
            section.vars.each(function(v) { v.trigger('change', values[name]); });
        };

        if (type === 'slider') {     // info = [min,max,step]

            values[name] = Number(init);
            $i.addClass('var-slider');
            info[0] = Number(info[0]);
            info[1] = Number(info[1]);
            info[2] = Number(info[2]);

            $el = $N('span', {'class': 'var-slider-text'}, $i);
            $N('span', {'class': 'left'}, $i);
            $N('span', {'class': 'right'}, $i);
            var $bubble   = $N('span', {'class': 'var-slider-bubble'}, $i);
            var $box      = $N('span', {'class': 'var-slider-bubble-box '}, $bubble);
            var $progress = $N('span', {'class': 'var-slider-progress'}, $box);
            $N('span', {'class': 'var-slider-bubble-arrow'}, $bubble);
            $progress.css('width', 116 * (values[name]-info[0]) / (info[1]-info[0]) + 'px');

            var startPosition = 0;
            var startValue = 0;
            var distance = 0;
            var sense = Math.sqrt( info[2] / (info[1] - info[0] ) * 1000 ) + (M.browser.isTouch?10:2);

            var slideStart = function(e){
                e.stopPropagation();
                e.preventDefault();
                startPosition = e.pageX || e.originalEvent.touches[0].pageX;
                startValue = values[name];
                $bubble.css('display', 'block');
                M.redraw();
                $bubble.addClass('on');
                M.$body.on('touchmove mousemove', slideMove);
                M.$body.on('touchend touchcancel mousecancel mouseup', slideEnd);
            };

            var slideMove = function(e){
                e.stopPropagation();
                e.preventDefault();
                distance = (e.pageX || e.originalEvent.touches[0].pageX) - startPosition;
                var old = values[name];
                values[name] = Math.round(Math.max(info[0],
                    Math.min(info[1], startValue + distance/sense))/info[2] ) * info[2];
                $progress.css('width', 116 * (values[name]-info[0]) / (info[1]-info[0]) + 'px');
                if (old !== values[name]) update();
            };

            var slideEnd = function(event){
                $bubble.removeClass('on');
                setTimeout( function() { $bubble.css('display', 'none'); }, 200);
                M.$body.off('touchmove mousemove', slideMove);
                M.$body.off('touchend touchcancel mousecancel mouseup', slideEnd);
            };

            $i.on('touchstart mousedown', slideStart);

        } else if( type === 'bolean' ) {     // info = []

            values[name] = !!Number(init);
            $i.click(function(){
                values[name] = !!values[name];
                update();
            });

        } else if( type === 'switch' ) {     // info = [val1,val2,val3,...]

            values[name] = init;
            var activeSwitch = 0;
            var maxSwitch = info.length-1;
            $i.click(function(){
                if (activeSwitch<maxSwitch) { ++activeSwitch; } else { activeSwitch = 0; }
                values[name] = info[activeSwitch];
                update();
            });

        }
    }
*/






