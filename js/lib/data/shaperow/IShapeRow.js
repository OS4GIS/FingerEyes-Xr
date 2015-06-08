Xr.data = Xr.data || {};

/**  
 * @classdesc 공간 데이터에 대한 Row가 구현해야 할 인터페이스
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.data.IShapeRow = Xr.Class({
	name: "IShapeRow",
	
	methods: {
	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper, /* AttributeRow */ attrRow, /* ShapeDrawSymbol */ sym) { return null; },
	    /* IShapeData */ shapeData: function () { return null; }
	}
});