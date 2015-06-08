Xr.data = Xr.data || {};

/**  
 * @classdesc 폴리곤 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.PolygonShapeData} graphicData - 폴리곤 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.data.PolygonGraphicRow = Xr.Class({
	name: "PolygoneGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function(id, /* PolygonShapeData */ graphicData) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());

	    this._penSymbol = new Xr.symbol.PenSymbol();
	    this._brushSymbol = new Xr.symbol.BrushSymbol();
	},
 	
	methods: {
	    /* PenSymbol */ penSymbol: function (/* optional PenSymbol */ penSymbol) {
	        if (arguments.length == 1) {
	            this._penSymbol = penSymbol;
	        } else {
	            return this._penSymbol;
	        }
	    },

	    /* BrushSymbol */ brushSymbol: function(/* optional BrushSymbol */ brushSymbol) {
	        if (arguments.length == 1) {
	            this._brushSymbol = brushSymbol;
	        } else {
	            return this._brushSymbol;
	        }
	    },

	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var polygons = this.graphicData().data();
	        var ringCount = polygons.length;

	        var d = "";

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polygon = polygons[iRing];
	            var vertexCount = polygon.length;
	            for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                var wp = polygon[iVtx];
	                var vp = coordMapper.W2V(wp);

	                if (iVtx == 0) {
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

	        this._brushSymbol.attribute(pathSVG);
	        this._penSymbol.attribute(pathSVG);

	        return pathSVG;
	    },

	    ///* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	    //    var coord = cm.V2W(x, y);
	    //    var polygons = this.graphicData().data();
	    //    var ringCount = polygons.length;
        //
	    //    for (var iRing = 0; iRing < ringCount; ++iRing) {
	    //        var polygon = polygons[iRing];
	    //        if(Xr.GeometryHelper.pointInPolygon(polygon, coord)) return true;
	    //    }
        //
	    //    return false;
	    //}
	}
});