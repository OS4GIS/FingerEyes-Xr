Xr.theme = Xr.theme || {};

/**  
 * @classdesc 공간 데이터에 도형을 어떤 심벌(Symbol)로 표현할지를 결정하는 클래스들이 구현해야할 인터페이스입니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.theme.IShapeDrawTheme = Xr.Class({
    name: "IShapeDrawTheme",

    methods: {
        /* ShapeDrawSymbol */ symbol: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) { return null; },
        /* boolean */ needAttribute: function () {}
    }
});
