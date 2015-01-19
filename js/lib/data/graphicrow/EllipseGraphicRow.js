Xr.data = Xr.data || {};

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