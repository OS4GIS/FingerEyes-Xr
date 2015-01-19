Xr.data = Xr.data || {};

Xr.data.PolylineShapeRow = Xr.Class({
	name: "PolylineShapeRow",
	extend: Xr.data.ShapeRow,
	requires: [Xr.data.IShapeRow],

	construct: function(fid, shapeData) {
		Xr.data.ShapeRow.call(this, fid, shapeData);		
	},
 	
	methods: {
	    createSVG: function (/* CoordMapper */ coordMapper, /* AttributeRow */ attrRow, /* ShapeDrawSymbol */ sym) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
			var polylines = this.shapeData().data();	
			var ringCount = polylines.length;
			var groupSVG = document.createElementNS(xmlns, "g");

			for(var iRing=0; iRing<ringCount; ++iRing) {
				var linesSVG = document.createElementNS(xmlns, "polyline");
				var points = "";

				var polyline = polylines[iRing];
				var vertexCount = polyline.length;
				for(var iVtx=0; iVtx<vertexCount; ++iVtx) {
					var wp = polyline[iVtx];	
					var vp = coordMapper.W2V(wp);

					points += vp.x + "," + vp.y + " ";
				}
				
				linesSVG.setAttribute("points", points);
				groupSVG.appendChild(linesSVG);
			}

			groupSVG.style.fill = "none";
			sym.penSymbol().attribute(groupSVG);

			return groupSVG;
		}
	}
});