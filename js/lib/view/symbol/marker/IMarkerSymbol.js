Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 포인트 형태의 도형에 대해 어떤 형태 또는 심벌(Symbol)로 표현할지에 대한 클래스들이 구현해야할 인터페이스입니다. 포인트 형태의 데이터를 마커(Marker)라고도 합니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.symbol.IMarkerSymbol = Xr.Class({
    name: "IMarkerSymbol",

    methods: {
        /* SVG Element */ create: function (/* PointD */ point, /* CoordMapper */ coordMapper) { return null; },
    }
});