Xr.data = Xr.data || {};

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