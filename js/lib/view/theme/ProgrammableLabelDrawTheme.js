Xr.theme = Xr.theme || {};

/**  
 * @classdesc 공간 데이터에 대한 라벨을 어떤 심벌(Symbol)로 표현할지를 결정하는 클래스들이 상속받는 부모 클래스입니다.
 * 이 클래스의 이름을 Programmable이라고 한 이유는 직접 개발자가 이 클래스를 상속받아 라벨에 대해 원하는 심벌로 표현할 수 있도록 하기 위함입니다.
 * @class
 * @param {Xr.layers.ShapeMapDrawer} layer - 그려질 공간 데이터에 대한 레이어 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.theme.ProgrammableLabelDrawTheme = Xr.Class({
    name: "ProgrammableLabelDrawTheme",

    construct: function (/* ShapeMapLayer */ shapeMapLayer) {
        this._shapeMapLayer = shapeMapLayer;
    },

    methods: {
        /* ShapeMapLayer */ layer: function () {
            return this._shapeMapLayer;
        }
    }
});