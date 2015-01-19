Xr.symbol = Xr.symbol || {};

Xr.symbol.ShapeDrawSymbol = Xr.Class({
    name: "ShapeDrawSymbol",

    construct: function () {
        this._brushSymbol = new Xr.symbol.BrushSymbol();
        this._penSymbol = new Xr.symbol.PenSymbol();
        this._markerSymbol = new Xr.symbol.RectangleMarkerSymbol(this._penSymbol, this._brushSymbol);
    },

    methods: {
        /* BrushSymbol */ brushSymbol: function () {
            return this._brushSymbol;
        },

        /* PenSymbol */ penSymbol: function () {
            return this._penSymbol;
        },

        /* IMarkerSymbol */ markerSymbol: function () {
            return this._markerSymbol;
        },

        attribute: function (/* SVG Element */ SVG) {
            this._brushSymbol.attribute(SVG);
            this._penSymbol.attribute(SVG);
        }
    }
});