// =================================================================================================
// Slate.js | Frames
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


M.Frame = M.Class.extend({
    init: function($el) {
        var width = $el.width('border');
        var height = $el.height('border');
        var ratio = height/width;

        var $wrap = $N('div', { class: 'frame-wrap'});
        $el.wrap($wrap);

        function resize() {
            var w = $wrap.width('border');
            var h = w * ratio;
            $wrap.css('height', h+'px');
            $el.transform('scale(' + w/width + ') translateZ(0)');
        }

        M.resize(resize);
    }
});
