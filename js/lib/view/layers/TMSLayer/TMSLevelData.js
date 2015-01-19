Xr.layers = Xr.layers || {};

Xr.layers.TMSLevelData = Xr.Class({
	name: "TMSLevelData",
	
	construct: function(scale, unitsPerPixel, tileMapWidth, tileMapHeight, minX, minY, rows, columns) {
		this._scale = parseFloat(scale);
		this._unitsPerPixel = parseFloat(unitsPerPixel);
		this._tileMapWidth = parseFloat(tileMapWidth);
		this._tileMapHeight = parseFloat(tileMapHeight);
		this._minX = parseFloat(minX);
		this._minY = parseFloat(minY);
		this._rows = parseFloat(rows);
		this._columns = parseFloat(columns);
	},
 	
	methods: {
		toString: function() {
			return "scale: " + this.scale() + "\n" +
				"unitsPerPixel: " + this.unitsPerPixel() + "\n" +
				"tileMapWidth: " + this.tileMapWidth() + "\n" +
				"tileMapHeight: " + this.tileMapHeight() + "\n" +
				"minX: " + this.minX() + "\n" +
				"minY: " + this.minY() + "\n" +
				"rows: " + this.rows() + "\n" +
				"columns: " + this.columns();
		},

		scale: function() {
			return this._scale;
		},
	
		unitsPerPixel: function() {
			return this._unitsPerPixel;
		},
	
		tileMapWidth: function() {
			return this._tileMapWidth;
		},
	
		tileMapHeight: function() {
			return this._tileMapHeight;
		},

		minX: function() {
			return this._minX;
		},
	
		minY: function() {
			return this._minY;
		},
	
		maxX: function() {
			return this._minX + this._tileMapWidth * this._columns;
		},
	
		maxY: function() {
			return this._minY + this._tileMapHeight * this._rows;
		},
	
		rows: function() {
			return this._rows;
		},
	
		columns: function() {
			return this._columns;
		}
	}
});