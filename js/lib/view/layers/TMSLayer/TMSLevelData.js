Xr.layers = Xr.layers || {};

/**  
 * @classdesc 타일맵의 각 피라미드(Piramid)를 구성하는 정보를 담고 있는 클래스입니다.
 * @class
 * @param {number} scale - 지도 축척에 대한 분모값입니다. 지도 축척 값을 1/N으로 했을 때 N에 해당하는 값입니다.
 * @param {number} unitsPerPixel - 1 픽셀 당 지도 단위 길이값
 * @param {number} tileMapWidth - 타일맵 이미지의 지도 단위에 대한 가로 길이
 * @param {number} tileMapHeight - 타일맵 이미지의 지도 단위에 대한 세로 길이
 * @param {number} tileMapWidth - 타일맵 이미지의 지도 단위에 대한 가로 길이
 * @param {number} minX - 전체 MBR에 대한 최소 X축 값
 * @param {number} minY - 전체 MBR에 대한 최소 Y축 값
 * @param {int} rows - 타일맵의 전체 행(Row) 수
 * @param {int} columns - 타일맵의 전체 컬럼(Column) 수
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.layers.TMSLevelData = Xr.Class({
	name: "TMSLevelData",
	
	construct: function(scale, unitsPerPixel, tileMapWidth, tileMapHeight, minX, minY, rows, columns) {
		this._scale = (scale);
		this._unitsPerPixel = (unitsPerPixel);
		this._tileMapWidth = (tileMapWidth);
		this._tileMapHeight = (tileMapHeight);
		this._minX = (minX);
		this._minY = (minY);
		this._rows = (rows);
		this._columns = (columns);
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