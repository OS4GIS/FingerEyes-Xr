Xr.data = Xr.data || {};

/**  
 * @classdesc 공간 데이터에 대한 Row의 집합(Set)
 * @class
 * @param {Xr.data.ShapeType} shapeType - 공간 데이터 도형의 타입
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.data.ShapeRowSet = Xr.Class({
	name: "ShapeRowSet",

	construct: function(shapeType) {
		this._rows = new Object();
		this._shapeType = shapeType;
	},
 	
	methods: {
		add: function(row) {
			var fid = row.fid();
			
			if(this._rows[fid] != undefined) return false; 

			this._rows[fid] = row;
			
			return true;
		},

		remove: function(fid) {
			if(this._rows[fid] == undefined) return;
			
			delete this._rows[fid];
		},
		
		row: function(fid) {
			return this._rows[fid]; 
		},
		
		reset: function () {
			for(var fid in this._rows) {
				delete this._rows[fid];
			}
		},
		
		rows: function() {
			return this._rows;
		},
		
		shapeType: function() {
			return this._shapeType;
		}
	}
});