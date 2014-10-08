// =================================================================================================
// Slate.js | SVG Functions
// (c) 2014 Mathigon / Philipp Legner
// =================================================================================================


M.svg = {};

M.svg.el = function(type, attributes, parent) {
    var _this = this;
    var svgns = 'http://www.w3.org/2000/svg';
    this.$el = document.createElementNS(svgns, type);
    this.data = {};
    M.each(attributes, function(val, key){ _this.$el.setAttribute(key, val); });
    if (parent) parent.append(this);
};

M.inherit(M.svg.el, M.$);

M.svg.el.prototype.setPoints = function(p) {
    this.attr('d', p.length ? 'M' + p.each(function(x){ return x.join(','); }).join('L') : '' );
    this.points = p;
};

M.svg.el.prototype.addPoint = function(p) {
    this.attr('d', this.attr('d') + ' L '+p.join(',') );
    this.points.push(p);
};

M.svg.el.prototype.getPoints = function() {
    var points = this.$el.attr('d').replace('M','').split('L');
    return points.each(function(x){ return x.split(',').toNumbers(); });
};

M.piechart = function(percentage, radius, colour) {
    var str;

    if (percentage >= 1) {

        str = [
            '<svg width="',2*radius,'" height="',2*radius,'">',
            '<path fill="',colour,'" stroke="none" d="M',
            radius,',0C',radius*0.5,',0,0,',radius*0.5,',0,',radius,'s',
            radius*0.5,',',radius,',',radius,',',radius,'s',
            radius,'-',radius*0.5,',',radius,'-',radius,'S',radius*1.5,',0,',radius,',0',
            'z M',radius*44.6/50,',',radius*76.1/50,'L',radius*19.2/50,',',radius*48.8/50,
            'l',radius*4/50,'-',radius*4.2/50,'l',radius*19.8/50,',',radius*11.9/50,'l',
            radius*34.2/50,'-',radius*32.6/50,'l',radius*3.5/50,',',radius*3.5/50,'L',
            radius*44.6/50,',',radius*76.1/50,'z"/>','</svg>'
        ].join('');

    } else {

        var x = radius + radius * Math.sin(percentage * 2 * Math.PI);
        var y = radius - radius * Math.cos(percentage * 2 * Math.PI);

        str = [
            '<svg width="',2*radius,'" height="',2*radius,'">',
            '<circle cx="',radius,'" cy="',radius,'" r="',radius-0.5,'" stroke="',colour,
            '" stroke-width="1" fill="transparent"/>','<path d="M ',radius,' ',radius,' L ',radius,
            ' 0 A ',radius,' ',radius,' 0 '+(percentage>0.5?'1':'0')+' 1 '+x+' '+y+' Z" fill="',
            colour,'"/>','</svg>'
        ].join('');

    }

    return str;
};
