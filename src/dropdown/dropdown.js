
let XDropdownProto = Object.create(HTMLElement.prototype);

XDropdownProto.createdCallback = function() {
	this.createShadowRoot().innerHTML = require('./dropdown.jade')();

    var _this = this;

    window.x = this.shadowRoot;
    this._title = this.shadowRoot.children[1].children[0];
    this._body = this.shadowRoot.children[1].children[1];
    this._isOpen = false;

    this._title.addEventListener('click', function(e) {
        _this.toggle();
        e.stopPropagation();
    });

    this._body.addEventListener('click', function(e) {
        e.stopPropagation();
    });
};

XDropdownProto.attachedCallback = function() {
    var _this = this;

    document.body.addEventListener('click', function(e) {
        _this.hide();
    });
};

XDropdownProto.detachedCallback = function() {
	// TODO remove body event listener
};

XDropdownProto.show = function() {
    if (this._isOpen) return;
    this.classList.add('open');
    this._body.style.display = 'block';
    this._isOpen = true;
};

XDropdownProto.hide = function() {
    if (!this._isOpen) return;
    this.classList.remove('open');
    this._body.style.display = 'none';
    this._isOpen = false;
};

XDropdownProto.toggle = function() {
    if (this._isOpen) {
        this.hide();
    } else {
        this.show();
    }
};

let XDropdown = document.registerElement('x-dropdown', { prototype: XDropdownProto });
export default XDropdown;
