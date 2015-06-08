Xr.data = Xr.data || {};

/**  
 * @classdesc 단일 필드에 대한 정보(필드명, 필드타입)을 나타내는 클래스
 * @class
 * @param {String} fieldName - 필드명
 * @param {Xr.Data.FieldType} fieldType - 필드 타입
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
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