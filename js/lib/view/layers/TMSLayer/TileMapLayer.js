Xr.layers = Xr.layers || {};

Xr.layers.TileMapLayer = Xr.Class({
	name: "TileMapLayer",
	extend: Xr.layers.XYZLayer,
	requires: [Xr.layers.ILayer],
		
	construct: function(name, opt) {
		if(!opt.url) throw new Error("TileMapLayer requires url option.");
		if(!opt.ext) throw new Error("TileMapLayer requires ext option.");
		
		//this.superclass(name, connectionString);
		Xr.layers.XYZLayer.call(this, name, opt.url);
	
		this._urls = [opt.url + "/${z}/${y}/${x}." + opt.ext];
		this._bReversedRows = false;

		if (opt.proxy) {
		    this._proxy = opt.proxy;
		}
	},

	methods: {
		connect: function(coordMapper) { 
		    var url = this.connectionString() + "/metadata.xml";
		    var bProxy = (this._proxy != undefined); 
		    if (bProxy) {
		        url = this._proxy + "?reqPrx|" + url + "|GEOSERVICE";
		    }

		    var reqTile = new Xr.layers.TMSConnectionRequest(url, this._levelDataList, bProxy, onConnectionCompleted);
			reqTile.request();

			var caller = this;
			function onConnectionCompleted() {
				var cntLevels = caller._levelDataList.length;
				var minX, minY, maxX, maxY;
				
				for(var iLvl=0; iLvl<cntLevels; iLvl++) {
					var level = caller._levelDataList[iLvl];
					
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
				
				caller._mbr.set(minX, minY, maxX, maxY);
				caller._connected = true;
			}
		}
	}
});