
var Parallax = M.Class.extend({
    init: function($el, chapter, isAtTop) {
        this.$el = $el;
        this.$bg = $C('parallax-bg', $el);
        this.isAtTop = isAtTop;
        this.chapter = chapter;

        this.$bg.wrap($N('div', {class: 'parallax-bg-wrap'}));
    },

    show: function() {
        var _this = this;
        var top, bottom;

        function apply(e) {
            if (e.top > top && e.top < bottom && window.innerWidth > 680) {
                _this.$bg.transform('scale(' + Math.max(1, 1 + (e.top - top) / (bottom - top) / 2) + ')');
            }
        }

        function setup() {
            var offsetTop = _this.$el.offsetTop();
            top = (_this.isAtTop ? 0 : offsetTop - _this.chapter.dimensions.containerHeight);
            bottom = offsetTop + _this.$el.height();
        }

        this.chapter.on('resize', setup, 5);
        this.chapter.on('scroll', apply);

        setup();
     }
});
