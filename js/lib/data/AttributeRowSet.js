Xr.data = Xr.data || {};

/**  
 * @classdesc 속성 데이터에 대한 Row의 집합(Set)
 * @class
 * @param {Xr.data.FieldSet} fieldSet - 속성 데이터 필드 구조를 나타내는 클래스 객체
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.data.AttributeRowSet = Xr.Class({
	name: "AttributeRowSet",

	construct: function(fieldSet) {
		this._rows = new Object();
		this._rowsCount = 0;
		this._fieldSet = fieldSet;
	},
 	
	methods: {
		add: function(row) {
			var fid = row.fid();
			
			if(this._rows[fid] != undefined) return false; 

			this._rows[fid] = row;
			this._rowsCount++;
			
			return true;
		},

		remove: function(fid) {
			if(this._rows[fid] == undefined) return;
			
			delete this._rows[fid];
			this._rowsCount--;
		},
		
		row: function(fid) {
			return this._rows[fid]; 
		},
		
		count: function() {
			return this._rowsCount;
		},
		
		reset: function() {
			for(var fid in this._rows) {
				delete this._rows[fid];
			}
			
			this._rowsCount = 0;
		},
		
		rows: function() {
			return this._rows;
		},
		
		fieldSet: function() {
			return this._fieldSet;
		}
	}
});