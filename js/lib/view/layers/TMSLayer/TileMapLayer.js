Xr.layers = Xr.layers || {};

/**  
 * @classdesc Custom 형태의 타일맵 레이어입니다. 이 타일맵 레이어는 TMS와는 다르게 각 피라미트(Piramid)에 대해 서로 다른 MBR을 가질 수 있습니다.
 * @class
 * @param {String} name - 레이어에 대한 이름으로 고유한 ID 값이여야 함
 * @param {Object} opt - 타일맵 레이어를 구성하기 위한 옵션 객체입니다.
 * @example 
 * var lyr = new Xr.layers.TileMapLayer("basemap",
 *     {
 *         proxy: "http://222.237.78.208:8080/Xr",
 *         url: "http://www.geoservice.co.kr/tilemap1",
 *         ext: "png"
 *     }
 * );
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
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