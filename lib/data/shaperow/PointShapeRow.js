Xr.data = Xr.data || {};

/**  
 * @classdesc 포인트(Point) 타입에 대한 공간 데이터의 Row
 * @class
 * @param {int} fid - Row의 고유 식별자
 * @param {Xr.data.PointShapeData} shapeData - 포인트 공간 데이터의 좌표를 담고 있는 클래스
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.data.PointShapeRow = Xr.Class({
	name: "PointShapeRow",
	extend: Xr.data.ShapeRow,
	requires: [Xr.data.IShapeRow],

	construct: function(fid, shapeData) {
		Xr.data.ShapeRow.call(this, fid, shapeData);		
	},
 	
	methods: {
	    createSVG: function (/* CoordMapper */ coordMapper, /* AttributeRow */ attrRow, /* ShapeDrawSymbol */ sym) {
	        var point = this.shapeData().data();
            return sym.markerSymbol().create(point, attrRow, coordMapper);
        }
	}
});