/**  
 * @desc label 네임스페이스입니다. Label과 관련된 클래스를 담고 있습니다.
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.label = Xr.label || {};

/**  
 * @classdesc 라벨로써 표현될 문자열에 대한 정의를 위한 형식자(Formatter) 클래스가 구현해야 할 인터페이스입니다. 
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.label.ILabelFormatter = Xr.Class({
    name: "ILabelFormatter",

    methods: {
        /* ShapeDrawSymbol */ value: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) { return null; },
    }
});