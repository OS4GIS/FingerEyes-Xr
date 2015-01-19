Xr.data = Xr.data || {};

Xr.data.ShapeRow = Xr.Class({
	name: "ShapeRow",

	construct: function(/* int */ fid, /* IShapeData */ shapeData) {
		this._fid = fid;
		this._shapeData = shapeData;
	},
 	
	methods: {
		/* int */ fid: function() {
			return this._fid;
		},
		
	    /* IShapeData */ shapeData: function () {
			return this._shapeData; 
		}
	}
});