Xr.data = Xr.data || {};

Xr.data.PointGraphicRow = Xr.Class({
	name: "PointGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function(id, /* PointShapeData */ graphicData) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());

	    var penSymbol = new Xr.symbol.PenSymbol();
	    var brushSymbol = new Xr.symbol.BrushSymbol();
	    this._markerSymbol = new Xr.symbol.RectangleMarkerSymbol(penSymbol, brushSymbol);
	},
 	
	methods: {
	    /* IMarkerSymbol */ markerSymbol: function (/* optional IMarkerSymbol */ markerSymbol) {
	        if (arguments.length == 1) {
	            this._markerSymbol = markerSymbol;
	        } else {
	            return this._markerSymbol;
	        }
	    },

	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var point = this.graphicData().data();
	        return this._markerSymbol.create(point, coordMapper);
	    },

	    ///* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	    //    var point = this.graphicData().data();
	    //    var coord = cm.V2W(x, y);
	    //    var tol = cm.pickingTolerance();
	    //    var dist = Math.sqrt(Math.pow(point.x - coord.x, 2.0) + Math.pow(point.y - coord.y, 2.0));
        //
	    //    return (dist <= tol);
	    //}
	}
});