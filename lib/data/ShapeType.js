Xr.data = Xr.data || {};

/**  
 * @classdesc 공간 데이터의 도형에 대한 타입을 나타내는 열거형 클래스입니다. 
 * @class
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.data.ShapeType = Xr.Class({
	name: "ShapeType",
	statics: {
		POINT: 0,
		POLYLINE: 1,
		POLYGON: 2,
		CIRCLE: 3,
		ELLIPSE: 4,
		RECTANGLE: 5,
		TEXT: 6,
        LIVE_TEXT_OBJECT: 7,
        DECORATION_TEXTS_OBJECT: 8,
        PIE_CHART_ITEM_OBJECT: 9
	}
});