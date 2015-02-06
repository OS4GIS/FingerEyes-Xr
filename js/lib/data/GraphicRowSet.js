Xr.data = Xr.data || {};

/**  
 * @classdesc 그래픽 데이터에 대한 Row의 집합(Set)
 * @class
 * @param {Xr.layers.GraphicLayer} layer - 관계되는 그래픽 레이어
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.data.GraphicRowSet = Xr.Class({
	name: "GraphicRowSet",

	construct: function(/* GraphicLayer */ layer) {
	    this._rows = new Object();
	    this._layer = layer;
	},
 	
	methods: {
		add: function(/* GraphicRow */ row) {
			var id = row.id();
			
			if(this._rows[id] != undefined) return false; 

			this._rows[id] = row;

			return true;
		},

		remove: function(id) {
			if(this._rows[id] == undefined) return;
			
			delete this._rows[id];

			return true;
		},
		
		row: function (id) {
		    var rows = this._rows;
			return this._rows[id]; 
		},
		
		reset: function () {
			for(var id in this._rows) {
				delete this._rows[id];
			}
		},
		
		rows: function() {
			return this._rows;
		}
	}
});