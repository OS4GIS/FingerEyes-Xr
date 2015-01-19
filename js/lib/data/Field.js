Xr.data = Xr.data || {};

Xr.data.Field = Xr.Class({
	name: "Field",
	
	construct: function(fieldName, fieldType) {
		this._fieldName = fieldName;
		this._fieldType = fieldType;
	},
 	
	methods: {
		fieldName: function() {
			return this._fieldName;
		},

		fieldType: function() {
			return this._fieldType;
		}
	}
});