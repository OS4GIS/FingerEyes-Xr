Xr.data = Xr.data || {};

Xr.data.GraphicRow = Xr.Class({
	name: "GraphicRow",

	construct: function (/* int */ id, /* IShapeData */ graphicData) {
		this._id = id;
		this._graphicData = graphicData;
	},
 	
	methods: {
		id: function() {
			return this._id;
		},
		
	    /* IShapeData */ graphicData: function () {
			return this._graphicData; 
		},

		MBR: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
		    return this._graphicData.MBR();
		},

	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	        return this.graphicData().hitTest(x, y, cm);
	    }
	}
});