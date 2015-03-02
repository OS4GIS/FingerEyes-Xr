Xr.theme = Xr.theme || {};

/**  
 * @classdesc 공간 데이터에 도형을 한가지 심벌(Symbol)로 표현하기 위한 클래스입니다.
 * @class
 * @param {Xr.layers.ShapeMapDrawer} layer - 그려질 공간 데이터에 대한 레이어 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.theme.SimpleShapeDrawTheme = Xr.Class({
    name: "SimpleShapeDrawTheme",
    extend: Xr.theme.ProgrammableShapeDrawTheme,
    requires: [Xr.theme.IShapeDrawTheme],

    construct: function (/* ShapeMapLayer */ layer) {
        this.superclass(layer);

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

        /* IMarkerSymbol */ makerSymbol: function (/* optional IMarkerSymbol */ markerSym) {
            if (arguments.length == 0) {
                return this._symbol.markerSymbol();
            } else {
                this._symbol.markerSymbol(markerSym);
                return this;
            }
        },

        /* boolean */ needAttribute: function () {
            return false;
        }
    }
});