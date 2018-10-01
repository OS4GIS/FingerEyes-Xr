Xr.data = Xr.data || {};

/**  
 * @classdesc 공간 데이터에 대한 Row의 집합(Set)
 * @class
 * @param {Xr.data.ShapeType} shapeType - 공간 데이터 도형의 타입
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
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

        remove: function (fid) {
            var rows = this._rows;
			if(rows[fid] == undefined) return;
			
			delete rows[fid];
		},
		
		row: function(fid) {
			return this._rows[fid]; 
		},
		
        reset: function () {
            var rows = this._rows;
            for (var fid in rows) {
                delete rows[fid];
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