// =================================================================================================
// Slate.js | SVG Functions
// (c) 2015 Mathigon / Philipp Legner
// =================================================================================================


M.$.prototype.setPoints = function(p) {
    this.attr('d', p.length ? 'M' + p.each(function(x){ return x.x + ',' + x.y; }).join('L') : '' );
    this.points = p;
};

M.$.prototype.addPoint = function(p) {
    this.getPoints();
    this.attr('d', this.attr('d') + ' L ' + p.x + ',' + p.y);
    this.points.push(p);
};

M.$.prototype.getPoints = function() {
    if (!this.points) {
        var points = this.$el.attr('d').replace('M','').split('L');
        this.points = points.each(function(x){
            p = x.split(',');
            return new M.geo.Point(p[0], p[1]);
        });
    }
    return this.points;
};

// =================================================================================================

M.piechart = function(percentage, radius, colour) {

    // Checkmark when completed
    if (percentage >= 1) {
        return [
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
    }

    var x = radius + radius * Math.sin(percentage * 2 * Math.PI);
    var y = radius - radius * Math.cos(percentage * 2 * Math.PI);

    return [
        '<svg width="',2*radius,'" height="',2*radius,'">',
        '<circle cx="',radius,'" cy="',radius,'" r="',radius-0.5,'" stroke="',colour,
        '" stroke-width="1" fill="transparent"/>','<path d="M ',radius,' ',radius,' L ',radius,
        ' 0 A ',radius,' ',radius,' 0 '+(percentage>0.5?'1':'0')+' 1 '+x+' '+y+' Z" fill="',
        colour,'"/>','</svg>'
    ].join('');
};
