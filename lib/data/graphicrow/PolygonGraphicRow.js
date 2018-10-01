Xr.data = Xr.data || {};

/**  
 * @classdesc 폴리곤 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.PolygonShapeData} graphicData - 폴리곤 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.PolygonGraphicRow = Xr.Class({
	name: "PolygoneGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function(id, /* PolygonShapeData */ graphicData, /* boolean */ bMeasured) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());

	    this._penSymbol = new Xr.symbol.PenSymbol();
	    this._brushSymbol = new Xr.symbol.BrushSymbol();

	    this._bMeasured = bMeasured;
	},
 	
    methods: {
        /* string */ toString: function () {
            var strJSON = JSON.stringify(this);
            var objJSON = JSON.parse(strJSON);

            delete objJSON._id;
            objJSON.metadata = {
                type: "Polygon"
            };

            return JSON.stringify(objJSON);
        },

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

	    /* SVG Element */ appendSVG: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
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

	        var groupSVG = document.createElementNS(xmlns, "g");

	        var pathSVG = document.createElementNS(xmlns, "path");
	        pathSVG.setAttribute("d", d);
	        pathSVG.setAttribute("fill-rule", "evenodd");

            this._penSymbol.attribute(pathSVG);
	        this._brushSymbol.attribute(pathSVG);
	        
	        groupSVG.appendChild(pathSVG);

	        if (this._bMeasured) {
	            var g_measured = document.createElementNS(xmlns, "g");
	            for (var iRing = 0; iRing < ringCount; ++iRing) {
	                var polygon = polygons[iRing];
	                var vertexCount = polygon.length;

	                if (vertexCount < 3) continue;

	                var wp = Xr.GeometryHelper.centroidOfPolygon(polygon);

	                var vp = coordMapper.W2V(wp);
	                var area = Math.abs(Xr.GeometryHelper.signedArea(polygon));

	                var txtSvg = Xr.OperationHelper.strokeTextSvg(vp.x, vp.y, area.toFixed(2) + "㎡", 24, "#ffffff", "#313131", 6);
	                g_measured.appendChild(txtSvg);
	            }

	            groupSVG.appendChild(g_measured);
	        }

	        container.appendChild(groupSVG);
	        return groupSVG;
	    },
	}
});