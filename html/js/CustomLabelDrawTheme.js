CustomLabelDrawTheme = Xr.Class({
    name: "CustomLabelDrawTheme",
    extend: Xr.theme.ProgrammableLabelDrawTheme,
    requires: [Xr.theme.ILabelDrawTheme],

    construct: function (/* ShapeMapLayer */ layer) {
        this.superclass(layer);

        this._fieldIndex = -1;

        var textSize = 24;

        this._symDAB = new Xr.symbol.FontSymbol();
        this._symDAB.strokeColor("#000000");
        this._symDAB.strokeWidth(2);
        this._symDAB.size(textSize);
        this._symDAB.fontFamily('맑은 고딕');
        this._symDAB.color("#EEB500");

        this._symDO = new Xr.symbol.FontSymbol();
        this._symDO.strokeColor("#000000");
        this._symDO.strokeWidth(2);
        this._symDO.size(textSize);
        this._symDO.fontFamily('맑은 고딕');
        this._symDO.color("#4F81BD");

        this._symGONG = new Xr.symbol.FontSymbol();
        this._symGONG.strokeColor("#000000");
        this._symGONG.strokeWidth(2);
        this._symGONG.size(textSize);
        this._symGONG.fontFamily('맑은 고딕');
        this._symGONG.color("#7F7F7F");

        this._symDAI = new Xr.symbol.FontSymbol();
        this._symDAI.strokeColor("#000000");
        this._symDAI.strokeWidth(2);
        this._symDAI.size(textSize);
        this._symDAI.fontFamily('맑은 고딕');
        this._symDAI.color("#C4BD97");

        this._symJAB = new Xr.symbol.FontSymbol();
        this._symJAB.strokeColor("#000000");
        this._symJAB.strokeWidth(2);
        this._symJAB.size(textSize);
        this._symJAB.fontFamily('맑은 고딕');
        this._symJAB.color("#7C9B3F");

        this._symCHEON = new Xr.symbol.FontSymbol();
        this._symCHEON.strokeColor("#000000");
        this._symCHEON.strokeWidth(2);
        this._symCHEON.size(textSize);
        this._symCHEON.fontFamily('맑은 고딕');
        this._symCHEON.color("#98C8E0");

        this._symJEON = new Xr.symbol.FontSymbol();
        this._symJEON.strokeColor("#000000");
        this._symJEON.strokeWidth(2);
        this._symJEON.size(textSize);
        this._symJEON.fontFamily('맑은 고딕');
        this._symJEON.color("#F8F200");

        this._symIM = new Xr.symbol.FontSymbol();
        this._symIM.strokeColor("#000000");
        this._symIM.strokeWidth(2);
        this._symIM.size(textSize);
        this._symIM.fontFamily('맑은 고딕');
        this._symIM.color("#81F21A");

        this._symDefault = new Xr.symbol.FontSymbol();
        this._symDefault.strokeColor("#000000");
        this._symDefault.strokeWidth(2);
        this._symDefault.size(textSize);
        this._symDefault.fontFamily('맑은 고딕');
        this._symDefault.color("#ffffff");
    },

    methods: {
        /* FontSymbol */ symbol: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) {
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
        }
    }
});