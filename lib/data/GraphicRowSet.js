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
	    this._count = 0;
	},
 	
	methods: {
	    /* int */ count: function() {
	        return this._count;
	    },

		add: function(/* GraphicRow */ row) {
			var id = row.id();
			
			if(this._rows[id] != undefined) return false; 

			this._rows[id] = row;
			this._count++;

			return true;
		},

		remove: function(id) {
            var row = this._rows[id];
            if (row == undefined) return;
            
            if (row.stop) { // for only LiveTextObjectGraphicRow
                row.stop();
            }

			delete this._rows[id];
			this._count--;

			return true;
		},
		
		row: function (id) {
		    var rows = this._rows;
			return this._rows[id]; 
		},
		
		reset: function () {
		    var rows = this._rows;

		    for (var id in rows) {
		        var row = rows[id];

		        if (row.stop) { // for only LiveTextObjectGraphicRow
		            row.stop();
		        }

		        delete rows[id];
			}

			this._count = 0;
		},
		
		rows: function() {
			return this._rows;
		}
	}
});