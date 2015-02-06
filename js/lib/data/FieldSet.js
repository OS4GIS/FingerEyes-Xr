Xr.data = Xr.data || {};

/**  
 * @classdesc 필드(Field)의 집합(Set)을 나타내는 클래스입니다.
 * @class
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.data.FieldSet = Xr.Class({
	name: "FieldSet",

	construct: function() {
		this._fields = new Array();
		this._fieldTypes = new Array();
	},
 	
	methods: {
		add: function(/* Field */ field) {
			var cntFields = this._fields.length;
			this._fields[cntFields] = field;
			this._fieldTypes[cntFields] = field.type();
		},

		/* Field */ field: function(/* int */ index) {
			return this._fields[index]; 
		},

		/* int */ count: function() {
			return this._fields.length;
		},

	    /* int */ size: function () {
	        return this._fields.length;
	    },

	    /* int */ length: function () {
	        return this._fields.length;
	    },

	    /* String */ fieldName: function(/* int */ index) {
	        return this._fields[index].name();
	    },

		/* int */ fieldIndex: function(/* String */ fieldName) {
			var cntFields = this._fields.length;
			for(var iField=0; iField<cntFields; iField++) {
				var field = this.field(iField);
				var thatFieldName = field.name();

				if(thatFieldName == fieldName) {
					return iField;
				}
			}
			
			return -1;
		},
		
		fieldType: function(/* String */ fieldName) {
		    var cntFields = this._fields.length;
		    for (var iField = 0; iField < cntFields; iField++) {
		        var field = this.field(iField);
		        var fieldType = field.type();
		        var thatFieldName = field.name();

		        if (thatFieldName == fieldName) {
		            return fieldType;
		        }
		    }

		    return undefined;
		},

		/* Array */ fieldTypes: function() {
			return this._fieldTypes;
		}
	}
});