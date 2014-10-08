// =================================================================================================
// Slate.js | Variables
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


M.makeVariable = function($i, section) {
    /*jshint evil: true */

    var vars = section.varValues;

    var fn = new Function('_vars', 'with(_vars){ return '+$i.html()+'; }');
    var v = { $el: $i, fn: fn};

    var callbackAttr = $i.attr('data-fn');
    var callback = callbackAttr ? new Function('_vars','with(_vars){ ' + callbackAttr + ' }') : null;

    section.varEvals.push(v);
    if( !$i.attr('data-var') ) return;

    $i.addClass('var');
    var t = $i.attr('data-var').split('|');
    var name = t[0], init = t[1], type = t[2];
    var info = t[3] ? t[3].split(',') : [];
    $i.html('');

    if( type === 'slider' ) {     // info = [min,max,step]

        vars[name] = Number(init);
        $i.addClass('var-slider');
        info[0] = Number(info[0]);
        info[1] = Number(info[1]);
        info[2] = Number(info[2]);

        v.$el = $N('span', {'class': 'var-slider-text'}, $i);
        $N('span', {'class': 'left'}, $i);
        $N('span', {'class': 'right'}, $i);
        var $bubble   = $N('span', {'class': 'var-slider-bubble'}, $i);
        var $box      = $N('span', {'class': 'var-slider-bubble-box '}, $bubble);
        var $progress = $N('span', {'class': 'var-slider-progress'}, $box);
        $N('span', {'class': 'var-slider-bubble-arrow'}, $bubble);
        $progress.css('width', 116 * (vars[name]-info[0]) / (info[1]-info[0]) + 'px');

        var startPosition = 0;
        var startValue = 0;
        var distance = 0;
        var sense = Math.sqrt( info[2] / (info[1] - info[0] ) * 1000 ) + (M.browser.isTouch?10:2);

        var slideStart = function(event){
            event.stopPropagation();
            event.preventDefault();
            startPosition = event.pageX || event.originalEvent.touches[0].pageX;
            startValue = vars[name];
            $bubble.css('display', 'block');
            M.redraw();
            $bubble.addClass('on');
            M.$body.on('touchmove mousemove', slideMove);
            M.$body.on('touchend touchcancel mouseup', slideEnd);
        };

        var slideMove = function(event){
            event.stopPropagation();
            event.preventDefault();
            distance = (event.pageX || event.originalEvent.touches[0].pageX) - startPosition;
            var old = vars[name];
            vars[name] = Math.round(Math.max(info[0],
                Math.min(info[1], startValue + distance/sense))/info[2] ) * info[2];
            $progress.css('width', 116 * (vars[name]-info[0]) / (info[1]-info[0]) + 'px');
            if (old !== vars[name]) {
                section.evalVariables();
                if (callback) callback(section.varValues);
            }
        };

        var slideEnd = function(event){
            $bubble.removeClass('on');
            setTimeout( function() { $bubble.css('display', 'none'); }, 200);
            M.$body.off('touchmove mousemove', slideMove);
            M.$body.off('touchend touchcancel mouseup', slideEnd);
        };

        $i.on('touchstart mousedown', slideStart);

    } else if( type === 'bolean' ) {     // info = []

        vars[name] = !!Number(init);
        $i.click(function(){
            vars[name] = !!vars[name];
            section.evalVariables();
            if (callback) callback(section.varValues);
        });

    } else if( type === 'switch' ) {     // info = [val1,val2,val3,...]

        vars[name] = init;
        var activeSwitch = 0;
        var maxSwitch = info.length-1;
        $i.click(function(){
            if (activeSwitch<maxSwitch) { ++activeSwitch; } else { activeSwitch = 0; }
            vars[name] = info[activeSwitch];
            section.evalVariables();
            if (callback) callback(section.varValues);
        });

    }

    return callback || null;
};
