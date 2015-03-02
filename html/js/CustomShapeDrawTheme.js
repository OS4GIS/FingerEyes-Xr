CustomShapeDrawTheme = Xr.Class({
    name: "CustomShapeDrawTheme",
    extend: Xr.theme.ProgrammableShapeDrawTheme,
    requires: [Xr.theme.IShapeDrawTheme],

    construct: function (/* ShapeMapLayer */ layer) {
        this.superclass(layer);

        this._fieldIndex = -1;

        this._symDAB = new Xr.symbol.ShapeDrawSymbol();
        this._symDAB.penSymbol().color('#000000').width(2);
        this._symDAB.brushSymbol().color('#EEB500').opacity(0.8);

        this._symDO = new Xr.symbol.ShapeDrawSymbol();
        this._symDO.penSymbol().color('#000000').width(2);
        this._symDO.brushSymbol().color('#4F81BD').opacity(0.8);

        this._symGONG = new Xr.symbol.ShapeDrawSymbol();
        this._symGONG.penSymbol().color('#000000').width(2);
        this._symGONG.brushSymbol().color('#7F7F7F').opacity(0.8);

        this._symDAI = new Xr.symbol.ShapeDrawSymbol();
        this._symDAI.penSymbol().color('#000000');
        this._symDAI.penSymbol().width(2);
        this._symDAI.brushSymbol().color('#C4BD97');
        this._symDAI.brushSymbol().opacity(0.8);

        this._symJEON = new Xr.symbol.ShapeDrawSymbol();
        this._symJEON.penSymbol().color('#000000').width(2);
        this._symJEON.brushSymbol().color('#F8F200').opacity(0.8);

        this._symIM = new Xr.symbol.ShapeDrawSymbol();
        this._symIM.penSymbol().color('#000000').width(2);
        this._symIM.brushSymbol().color('#81F21A').opacity(0.8);

        this._symJAB = new Xr.symbol.ShapeDrawSymbol();
        this._symJAB.penSymbol().color('#000000').width(2);
        this._symJAB.brushSymbol().color('#7C9B3F').opacity(0.8);

        this._symCHEON = new Xr.symbol.ShapeDrawSymbol();
        this._symCHEON.penSymbol().color('#000000').width(2);
        this._symCHEON.brushSymbol().color('#98C8E0').opacity(0.8);

        this._symDefault = new Xr.symbol.ShapeDrawSymbol();
        this._symDefault.penSymbol().color('#000000').width(2);
        this._symDefault.brushSymbol().color('#000000').opacity(0.7);
    },

    methods: {
        /* ShapeDrawSymbol */ symbol: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) {
            if (this._fieldIndex == -1) {
                this._fieldIndex = fieldSet.fieldIndex("PAR_LBL");
            }

            var value = attributeRow.valueAsString(this._fieldIndex);
            if (value.indexOf("답") != -1) return this._symDAB;
            if (value.indexOf("도") != -1) return this._symDO;
            if (value.indexOf("공") != -1) return this._symGONG;
            if (value.indexOf("대") != -1) return this._symDAI;
            if (value.indexOf("잡") != -1) return this._symJAB;
            if (value.indexOf("천") != -1) return this._symCHEON;
            if (value.indexOf("전") != -1) return this._symJEON;
            if (value.indexOf("임") != -1) return this._symIM;
            return this._symDefault;
        },

        /* boolean */ needAttribute: function () {
            return true;
        }
    }
});