Xr.layers = Xr.layers || {};

/**  
 * @classdesc OSGeo 스펙인 TMS를 통해 타일맵을 구성하는 레이어에 대한 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @param {Object} opt - 레이어를 구성하기 위한 파라메터를 지정하기 위한 객체입니다.
 * @example 
 * var lyrBase = new Xr.layers.TMSLayer(
 *     "baseMap", 
 *     {
 *         urls: ["http://xdworld.vworld.kr:8080/2d/Base/201310/${z}/${x}/${y}.png"],
 *         upps: [ 
 *             78000, 39000, 19600, 9800, 4900, 2400, //Dummy
 *             1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613,
 *             38.218514137268066, 19.109257068634033, 9.554628534317017,
 *             4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135
 *         ], 
 *         mbr: new Xr.MBR(-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244), 
 *         imageSize: 256,
 *         reversedRows: true
 *     }
 * );
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
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

				console.log(iLevel, mapScale, this._upps[iLevel], tileMapWidth, tileMapHeight, minX, minY, rows, columns);
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