Xr.data = Xr.data || {};

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
			this._fieldTypes[cntFields] = field.fieldType();
		},

		/* Field */ field: function(/* int */ index) {
			return this._fields[index]; 
		},

		/* int */ count: function() {
			return this._fields.length;
		},

	    /* String */ fieldName: function(/* int */ index) {
	        return this._fields[index].fieldName();
	    },

		/* int */ fieldIndex: function(/* String */ fieldName) {
			var cntFields = this._fields.length;
			for(var iField=0; iField<cntFields; iField++) {
				var field = this.field(iField);
				var thatFieldName = field.fieldName();

				if(thatFieldName == fieldName) {
					return iField;
				}
			}
			
			return -1;
		},
		
		/* Array */ fieldTypes: function() {
			return this._fieldTypes;
		}
	}
});