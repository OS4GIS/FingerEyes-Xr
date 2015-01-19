Xr.layers = Xr.layers || {};

Xr.layers.TMSLayer = Xr.Class({
	name: "TMSLayer",
	extend: Xr.layers.XYZLayer,
	requires: [Xr.layers.ILayer],
		
	construct: function(name, opt) {
		if(!opt.mbr) throw new Error("TileMapLayer requires mbr option.");
		if(!opt.urls) throw new Error("TileMapLayer requires urls option.");
		if(!opt.upps) throw new Error("TileMapLayer requires upps option.");
		opt.imageSize = opt.imageSize || 256;
		opt.reversedRows = opt.reversedRows || false;

		//this.superclass(name);
		Xr.layers.XYZLayer.call(this, name);

		this._mbr = new Xr.MBR(opt.mbr.minX, opt.mbr.minY, opt.mbr.maxX, opt.mbr.maxY);
		this._urls = opt.urls;
		this._upps = opt.upps;
		this._tileImageSize = opt.imageSize;
		this._bReversedRows = opt.reversedRows;
	},
 	
	methods: {
		_buildLevelData: function(coordMapper) {
			var cntLevels = this._upps.length;
			
			for(var iLevel=0; iLevel<cntLevels; ++iLevel) {
			    var mapScale = coordMapper.mapScaleFromMetersPerOnePixel(this._upps[iLevel]);
			    console.log(mapScale);
				var tileMapWidth = this._tileImageSize * this._upps[iLevel];
				var tileMapHeight = this._tileImageSize * this._upps[iLevel];
				var minX = this._mbr.minX;
				var minY = this._mbr.minY;
				var rows = (this._mbr.maxY - this._mbr.minY) / tileMapHeight;
				var columns = (this._mbr.maxX - this._mbr.minX) / tileMapWidth;
				
				var levelData = new Xr.layers.TMSLevelData(mapScale, this._upps[iLevel], tileMapWidth, tileMapHeight, minX, minY, rows, columns);
				this._levelDataList[iLevel] = levelData;  
			}
		},
	
		connect: function(coordMapper) { 
			this._buildLevelData(coordMapper);

			var cntLevels = this._levelDataList.length;
			var minX, minY, maxX, maxY;
				
			for(var iLvl=0; iLvl<cntLevels; iLvl++) {
				var level = this._levelDataList[iLvl];
					
				if(iLvl == 0) {
					minX = level.minX();
					minY = level.minY();
					maxX = level.maxX();
					maxY = level.maxY();
				} else {
					if(minX > level.minX()) minX = level.minX();
					if(minY > level.minY()) minY = level.minY();
					if(maxX < level.maxX()) maxX = level.maxX();
					if(maxY < level.maxY()) maxY = level.maxY();					
				}
			}
				
			this._mbr.set(minX, minY, maxX, maxY);
			this._connected = true;
		}
	}
});