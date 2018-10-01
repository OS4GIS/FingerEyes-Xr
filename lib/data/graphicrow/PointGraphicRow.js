Xr.data = Xr.data || {};

/**  
 * @classdesc 포인트 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.PointShapeData} graphicData - 포인트 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.PointGraphicRow = Xr.Class({
	name: "PointGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function(id, /* PointShapeData */ graphicData) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());

	    var penSymbol = new Xr.symbol.PenSymbol();
	    var brushSymbol = new Xr.symbol.BrushSymbol();
	    //this._markerSymbol = new Xr.symbol.RectangleMarkerSymbol(penSymbol, brushSymbol);
        this._markerSymbol = new Xr.symbol.CircleMarkerSymbol(penSymbol, brushSymbol);
	},
 	
    methods: {
        /* string */ toString: function () {
            var strJSON = JSON.stringify(this);
            var objJSON = JSON.parse(strJSON);

            delete objJSON._id;

            var subtype = "Unknown";
            var markerSym = this._markerSymbol;

            if (markerSym instanceof Xr.symbol.CircleMarkerSymbol) subtype = "Circle";
            else if (markerSym instanceof Xr.symbol.RectangleMarkerSymbol) subtype = "Rectangle";
            else if (markerSym instanceof Xr.symbol.ImageMarkerSymbol) subtype = "Image";

            objJSON.metadata = {
                type: "Point",
                subtype: subtype
            };

            return JSON.stringify(objJSON);
        },

	    /* IMarkerSymbol */ markerSymbol: function (/* optional IMarkerSymbol */ markerSymbol) {
	        if (arguments.length == 1) {
	            this._markerSymbol = markerSymbol;
	        } else {
	            return this._markerSymbol;
	        }
	    },

	    /* SVG Element */ appendSVG: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
	        var point = this.graphicData().data();
	        var svg = this._markerSymbol.create(point, null, coordMapper);

            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var groupSVG = document.createElementNS(xmlns, "g");
            groupSVG.appendChild(svg);

            container.appendChild(groupSVG);

            return groupSVG;
	    },
	}
});