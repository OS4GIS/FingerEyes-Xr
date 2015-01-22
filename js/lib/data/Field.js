Xr.data = Xr.data || {};

Xr.data.Field = Xr.Class({
	name: "Field",
	
	construct: function(fieldName, fieldType) {
		this._fieldName = fieldName;
		this._fieldType = fieldType;
	},
 	
	methods: {
		name: function() {
			return this._fieldName;
		},

		type: function() {
			return this._fieldType;
		}
	}
});