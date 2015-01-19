Xr.symbol = Xr.symbol || {};

Xr.symbol.PenSymbol = Xr.Class({
    name: "PenSymbol",

    construct: function (propertyObj) {
        var attributes = propertyObj || {};

        this._color = attributes['color'] || '#ffffff';
        this._width = attributes['width'] || undefined;
        this._cap = attributes['cap'] || undefined;
        this._lineJoin = attributes['lineJoin'] || undefined;
        this._miterLimit = attributes['miterLimit'] || undefined; 
        this._dash = attributes['dash'] || undefined;
        this._dashOffset = attributes['dashOffset'] || undefined;
        this._opacity = attributes['opacity'] || undefined;
    },

    methods: {
        /* string, #ffffff or red */ color: function (/* optional string, #ffffff or red */ v) {
            if (arguments.length == 0) {
                return this._color;
            } else {
                this._color = v;
            }
        },

        /* number */ width: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._width;
            } else {
                this._width = v;
            }
        },

        /* string */ cap: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._cap;
            } else {
                this._cap = v;
            }
        },

        /* string */ lineJoin: function(/* optional string */ v) {
            if (arguments.length == 0) {
                return this._lineJoin;
            } else {
                this._lineJoin = v;
            }
        },

        /* string */ miterLimit: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._miterLimit;
            } else {
                this._miterLimit = v;
            }
        },

        /* string */ dash: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._dash;
            } else {
                this._dash = v;
            }
        },

        /* int */ 
        dashOffset: function (/* optinal int */ v) {
            if (arguments.length == 0) {
                return this._dashOffset;
            } else {
                this._dashOffset = v;
            }
        },

        /* number, 0 ~ 1 */ getOpacity: function (/* number, 0 ~ 1 */v) {
            if (arguments.length == 0) {
                return this._opacity;
            } else {
                this._opacity = v;
            }
        },

        attribute: function (/* SVG Element */ svg) {
            if(this._color != undefined) svg.setAttribute("stroke", this._color);
            if (this._width != undefined) svg.setAttribute("stroke-width", this._width);
            if (this._cap != undefined) svg.setAttribute("stroke-linecap", this._cap);
            if (this._lineJoin != undefined) svg.setAttribute("stroke-linejoin", this._lineJoin);
            if (this._miterLimit != undefined) svg.setAttribute("stroke-miterlimit", this._miterLimit);
            if (this._dash != undefined) svg.setAttribute("stroke-dasharray", this._dash);
            if (this._dashOffset != undefined) svg.setAttribute("stroke-dashoffset", this._dashOffset);
            if (this._opacity != undefined) svg.setAttribute("stroke-opacity", this._opacity);
        }
    }
});