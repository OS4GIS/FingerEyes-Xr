Xr.symbol = Xr.symbol || {};

Xr.symbol.BrushSymbol = Xr.Class({
    name: "BrushSymbol",

    construct: function (/* Object */ propertyObj) {
        var attributes = propertyObj || {};

        this._color = attributes['color'] || undefined;
        this._opacity = attributes['opacity'] || undefined;
    },

    methods: {
        /* String, #ffffff or rgb(255,255,255) */ color: function (/* optional String, #ffffff or rgb(255,255,255) */ v) {
            if (arguments.length == 0) {
                return this._color;
            } else {
                this._color = v;
            }
        },

        /* number, 0~1 */ opacity: function (/* optional number, 0~1 */ v) {
            if (arguments.length == 0) {
                return this._opacity;
            } else {
                this._opacity = v;
            }
        },

        attribute: function (/* SVG Element */ svg) {
            if (this._opacity != undefined && this._opacity == 0.0) {
                if (this._color) svg.setAttribute("fill", "none");
            } else {
                if (this._color) svg.setAttribute("fill", this._color);
                if (this._opacity) svg.setAttribute("fill-opacity", this._opacity);
            }
        }
    }
});