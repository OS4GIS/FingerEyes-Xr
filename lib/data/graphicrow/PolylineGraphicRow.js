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

	construct: function (id, /* PolylineShapeData */ graphicData, /* boolean */ bMeasured) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());

	    this._penSymbol = new Xr.symbol.PenSymbol();
	    this._bMeasured = bMeasured;
	},
 	
    methods: {
        /* string */ toString: function () {
            var strJSON = JSON.stringify(this);
            var objJSON = JSON.parse(strJSON);

            delete objJSON._id;
            objJSON.metadata = {
                type: "Polyline"
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

	    /* SVG Element */ appendSVG: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
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

                var cn = this.cssClassName();
                if (cn) {
                    linesSVG.setAttribute("class", cn);
                }               

	            this._penSymbol.attribute(linesSVG);

                groupSVG.appendChild(linesSVG);
	        }

	        groupSVG.style.fill = "none";

	        if (this._bMeasured) {
	            var g_measured = document.createElementNS(xmlns, "g");
	            for (var iRing = 0; iRing < ringCount; ++iRing) {
	                var polyline = polylines[iRing];
	                var vertexCount = polyline.length;
	                var totalDistance = 0;

	                if (vertexCount < 2) continue;

	                for (var iVtx = 1; iVtx < vertexCount; ++iVtx) {
	                    var wp1 = polyline[iVtx - 1];
	                    var wp2 = polyline[iVtx];
	                    var wp = new Xr.PointD((wp1.x + wp2.x) / 2, (wp1.y + wp2.y) / 2);
	                    var vp = coordMapper.W2V(wp);
	                    var distance = Math.sqrt(Math.pow(wp1.x - wp2.x, 2) + Math.pow(wp1.y - wp2.y, 2));

	                    totalDistance += distance;

	                    var txtSvg = Xr.OperationHelper.strokeTextSvg(vp.x, vp.y, distance.toFixed(2) + "m", 18, "#ffffff", "#000000", 4);
	                    g_measured.appendChild(txtSvg);
	                }

	                if (vertexCount > 2) {
	                    var wp = polyline[vertexCount - 1];
	                    var vp = coordMapper.W2V(wp);
	                    var totalTxtSvg = Xr.OperationHelper.strokeTextSvg(vp.x, vp.y, totalDistance.toFixed(2) + "m", 24, "#ffffff", "#000000", 6);
	                    g_measured.appendChild(totalTxtSvg);
	                }
	            }

	            groupSVG.appendChild(g_measured);
	        }

	        container.appendChild(groupSVG);

	        return groupSVG;
	    },
	}
});