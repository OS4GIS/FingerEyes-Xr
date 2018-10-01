Xr.symbol = Xr.symbol || {};

Xr.symbol.ShapeDrawSymbol = Xr.Class({
    name: "ShapeDrawSymbol",

    construct: function () {
        this._brushSymbol = new Xr.symbol.BrushSymbol();
        this._penSymbol = new Xr.symbol.PenSymbol();
        this._markerSymbol = new Xr.symbol.RectangleMarkerSymbol(this._penSymbol, this._brushSymbol);
    },

    methods: {
        /* BrushSymbol */ brushSymbol: function (/* optional BrushSymbol */ sym) {
            if (arguments.length == 0) {
                return this._brushSymbol;
            } else {
                this._brushSymbol = sym;
                return this;
            }
        },

        /* PenSymbol */ penSymbol: function (/* optional PenSymbol */ sym) {
            if (arguments.length == 0) {
                return this._penSymbol;
            } else {
                this._penSymbol = sym;
                return this;
            }            
        },

        /* IMarkerSymbol */ markerSymbol: function (/* optional IMarkerSymbol */ markerSym) {
            if (arguments.length == 0) {
                return this._markerSymbol;
            } else {
                this._markerSymbol = markerSym;
                return this;
            }
        },

        attribute: function (/* SVG Element */ SVG) {
            this._penSymbol.attribute(SVG);
            this._brushSymbol.attribute(SVG);
        }
    }
});