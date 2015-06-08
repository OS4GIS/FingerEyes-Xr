Xr.label = Xr.label || {};

/**  
 * @classdesc 라벨 표시를 위한 문자열을 구성하기 클래스에 대한 부모 클래스입니다. 
 * 이 클래스의 이름이 Programmable이 붙은 이유는 이 클래스를 개발자가 직접 상속받아 자신이 원하는 형태의 라벨을 구성할 수 있도록 유도하기 위함입니다.
 * @class
 * @param {Xr.layers.ShapeMapLayer} layer - 라벨과 직접적으로 연관된 레이어 객체. 이 레이어의 속성 데이터에 접근하여 라벨 표시를 위한 문자열 값을 얻습니다.
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.label.ProgrammableLabelFormatter = Xr.Class({
    name: "ProgrammableLabelFormatter",

    construct: function (/* ShapeMapLayer */ shapeMapLayer) {
        this._shapeMapLayer = shapeMapLayer;
    },

    methods: {
        /* ShapeMapLayer */ layer: function () {
            return this._shapeMapLayer;
        }
    }
});