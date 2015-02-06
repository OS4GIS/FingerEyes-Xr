/**  
 * @desc theme 네임스페이스입니다. 공간 데이터에 대한 도형과 라벨(Label)을 어떠한 심벌(Symbol)로 표현할지에 대한 클래스들로 구성됩니다.
 * @interface
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.theme = Xr.theme || {};

/**  
 * @classdesc 라벨을 어떤 심벌(Symbol)로 표현할지를 결정하는 클래스들이 구현해야할 인터페이스입니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.theme.ILabelDrawTheme = Xr.Class({
    name: "ILabelDrawTheme",

    methods: {
        /* ShapeDrawSymbol */ symbol: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) { return null; },
    }
});
