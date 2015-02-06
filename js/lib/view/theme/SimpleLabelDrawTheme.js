Xr.theme = Xr.theme || {};

/**  
 * @classdesc 공간 데이터에 대한 라벨을 한가지 심벌(Symbol)로 표현하기 위한 클래스입니다.
 * @class
 * @param {Xr.layers.ShapeMapDrawer} layer - 그려질 공간 데이터에 대한 레이어 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
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