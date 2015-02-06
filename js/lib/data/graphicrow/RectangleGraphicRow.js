Xr.data = Xr.data || {};

/**  
 * @classdesc 사각형 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.RectangleShapeData} graphicData - 사각형 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.RectangleGraphicRow = Xr.Class({
	name: "RectangleGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function(id, /* RectangleShapeData */ graphicData) {
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
	        var mbr = this.graphicData().data();

	        var lt = coordMapper.W2V(new Xr.PointD(mbr.minX, mbr.maxY));
	        var rb = coordMapper.W2V(new Xr.PointD(mbr.maxX, mbr.minY));

	        var svg = document.createElementNS(xmlns, "rect");
	        svg.setAttribute("x", lt.x);
	        svg.setAttribute("y", lt.y);
	        svg.setAttribute("width", rb.x - lt.x);
	        svg.setAttribute("height", rb.y - lt.y);

	        this._brushSymbol.attribute(svg);
	        this._penSymbol.attribute(svg);

	        return svg;
	    },

	    ///* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	    //    var mbr = this.graphicData().data();
	    //    var coord = cm.V2W(x, y);
        //
	    //    return Xr.GeometryHelper.pointInMBR(mbr, coord, 0);
	    //}
	}
});