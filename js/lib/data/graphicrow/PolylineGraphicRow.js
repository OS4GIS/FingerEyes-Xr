Xr.data = Xr.data || {};

/**  
 * @classdesc 폴리라인 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.PolylineShapeData} graphicData - 폴리라인 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.PolylineGraphicRow = Xr.Class({
	name: "PolylineGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function(id, /* PolylineShapeData */ graphicData) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());

	    this._penSymbol = new Xr.symbol.PenSymbol();
	},
 	
	methods: {
	    /* PenSymbol */ penSymbol: function (/* optional PenSymbol */ penSymbol) {
	        if (arguments.length == 1) {
	            this._penSymbol = penSymbol;
	        } else {
	            return this._penSymbol;
	        }
	    },

	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var polylines = this.graphicData().data();
	        var ringCount = polylines.length;
	        var groupSVG = document.createElementNS(xmlns, "g");

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var linesSVG = document.createElementNS(xmlns, "polyline");
	            var points = "";

	            var polyline = polylines[iRing];
	            var vertexCount = polyline.length;
	            for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                var wp = polyline[iVtx];
	                var vp = coordMapper.W2V(wp);

	                points += vp.x + "," + vp.y + " ";
	            }

	            linesSVG.setAttribute("points", points);
	            groupSVG.appendChild(linesSVG);
	        }

	        groupSVG.style.fill = "none";
	        this._penSymbol.attribute(groupSVG);

	        return groupSVG;
	    },

	    ///* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	    //    var coord = cm.V2W(x, y);
	    //    var polylines = this.graphicData().data();
	    //    var ringCount = polylines.length;
	    //    var tol = cm.pickingTolerance();
        //
	    //    for (var iRing = 0; iRing < ringCount; ++iRing) {
	    //        var polyline = polylines[iRing];
	    //        if (Xr.GeometryHelper.pointInPolyline(polyline, coord, tol)) return true;
	    //    }
        //
	    //    return false;
	    //}
	}
});