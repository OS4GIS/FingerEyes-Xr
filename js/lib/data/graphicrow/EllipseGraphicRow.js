/**  
 * @desc data 네임스페이스입니다. 공간 데이터 및 속성 데이터와 관련된 정보를 관리하는 클래스들을 담고 있습니다. 
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.data = Xr.data || {};

/**  
 * @classdesc 타원 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.EllipseShapeData} graphicData - 타원 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.data.EllipseGraphicRow = Xr.Class({
    name: "EllipseGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function (id, /* EllipseShapeData */ graphicData) {
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
	        var data = this.graphicData().data();

	        var vp = coordMapper.W2V(new Xr.PointD(data.cx, data.cy));
	        var vrx = coordMapper.viewLength(data.rx);
	        var vry = coordMapper.viewLength(data.ry);

	        var svg = document.createElementNS(xmlns, "ellipse");
	        svg.setAttribute("cx", vp.x);
	        svg.setAttribute("cy", vp.y);
	        svg.setAttribute("rx", vrx);
	        svg.setAttribute("ry", vry);

	        this._brushSymbol.attribute(svg);
	        this._penSymbol.attribute(svg);

	        return svg;
	    },

	    ///* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	    //    var coord = cm.V2W(x, y);
	    //    
	    //    var data = this.graphicData().data();
	    //    var cx = data.cx;
	    //    var cy = data.cy;
	    //    var vrx = data.rx;
	    //    var vry = data.ry;
        //
	    //    var v = (Math.pow(coord.x - cx, 2.0) / (vrx * vrx)) + (Math.pow(coord.y - cy, 2.0) / (vry * vry));
	    //    return v <= 1;
	    //}
	}
}); 