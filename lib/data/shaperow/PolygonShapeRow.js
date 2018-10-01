Xr.data = Xr.data || {};

/**  
 * @classdesc 폴리곤(Polygon) 타입에 대한 공간 데이터의 Row
 * @class
 * @param {int} fid - Row의 고유 식별자
 * @param {Xr.data.PolygonShapeData} shapeData - 폴리곤 공간 데이터의 좌표를 담고 있는 클래스
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.data.PolygonShapeRow = Xr.Class({
    name: "PolygonShapeRow",
    extend: Xr.data.ShapeRow,
    requires: [Xr.data.IShapeRow],

    construct: function(fid, shapeData) {
        Xr.data.ShapeRow.call(this, fid, shapeData);
    },
 	
    methods: {
        createSVG: function (/* CoordMapper */ coordMapper, /* AttributeRow */ attrRow, /* ShapeDrawSymbol */ sym) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
			var polygons = this.shapeData().data();	
			var ringCount = polygons.length;
			
			var d = "";

			for (var iRing = 0; iRing < ringCount; ++iRing) {
				var polygon = polygons[iRing];
				var vertexCount = polygon.length;
				for(var iVtx=0; iVtx<vertexCount; ++iVtx) {
					var wp = polygon[iVtx];	
					var vp = coordMapper.W2V(wp);

					if(iVtx == 0) {
					    d += " M " + (vp.x) + " " + (vp.y);
					} else {
					    d += " L " + (vp.x) + " " + (vp.y);
					}
				}

				d += " Z";
			}

			var pathSVG = document.createElementNS(xmlns, "path");
			pathSVG.setAttribute("d", d);
			pathSVG.setAttribute("fill-rule", "evenodd");

			sym.attribute(pathSVG);

			return pathSVG;
		}
	}
});