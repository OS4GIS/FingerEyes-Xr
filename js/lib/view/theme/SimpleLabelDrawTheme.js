Xr.theme = Xr.theme || {};

Xr.theme.SimpleLabelDrawTheme = Xr.Class({
    name: "SimpleLabelDrawTheme",
    extend: Xr.theme.ProgrammableLabelDrawTheme,
    requires: [Xr.theme.ILabelDrawTheme],

    construct: function (/* ShapeMapLayer */ layer) {
        this.superclass(layer);
        //Xr.theme.ProgrammableLabelDrawTheme.call(this, lyer);

        this._symbol = new Xr.symbol.FontSymbol();
    },

    methods: {
        /* FontSymbol */ symbol: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) {
            return this._symbol;
        }
    }
});