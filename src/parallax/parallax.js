
let XParallaxProto = Object.create(HTMLElement.prototype);

XParallaxProto.createdCallback = function() {
	this.createShadowRoot().innerHTML = require('./parallax.jade')();
    this._background = this.shadowRoot.children[1];
    this._shadow = this.shadowRoot.children[2];

    this._background.style.backgroundImage = 'url("' + this.getAttribute('background') + '")';
};

XParallaxProto.attachedCallback = function() {
    var _this = this;

    var start = Math.max(0, _this.offsetTop - window.innerHeight);
    var end = _this.offsetTop + _this.offsetHeight;

    window.addEventListener('mousewheel', function(e) {  // resize, better scroll
        var scroll = window.pageYOffset;

        if (scroll >= start && scroll <= end) {
            var scale = (scroll - start) / (end - start);
            var prop = Math.pow(1.5, scale);
            _this._background.style.transform = 'scale(' + Math.max(1, prop) + ')';
            //_this._shadow.style.opacity = scale * 0.5;
        }
    });
};

XParallaxProto.detachedCallback = function() {
    // TODO remove body event listener
};

XParallaxProto.attributeChangedCallback = function(attrName, oldVal, newVal) {
    if (attrName === 'background') {
        this._background.style.backgroundImage = 'url("' + newVal + '")';
    }
};

let XParallax = document.registerElement('x-parallax', { prototype: XParallaxProto });
export default XParallax;
