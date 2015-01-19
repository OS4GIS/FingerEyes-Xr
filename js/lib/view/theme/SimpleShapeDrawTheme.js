Xr.theme = Xr.theme || {};

Xr.theme.SimpleShapeDrawTheme = Xr.Class({
    name: "SimpleShapeDrawTheme",
    extend: Xr.theme.ProgrammableShapeDrawTheme,
    requires: [Xr.theme.IShapeDrawTheme],

    construct: function (/* ShapeMapLayer */ layer) {
        this.superclass(layer);
        //Xr.theme.ProgrammableShapeDrawTheme.call(this, lyer);

        this._symbol = new Xr.symbol.ShapeDrawSymbol();
    },

    methods: {
        /* ShapeDrawSymbol */ symbol: function(/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) {
            return this._symbol;
        },

        /* PenSymbol */ penSymbol: function() {
            return this._symbol.penSymbol();
        },

        /* BrushSymbol */ brushSymbol: function() {
            return this._symbol.brushSymbol();
        },

        /* IMarkerSymbol */ makerSymbol: function () {
            return this._symbol.markerSymbol();
        },

        /* boolean */ needAttribute: function () {
            return false;
        }
    }
});