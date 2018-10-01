Xr.data = Xr.data || {};

/**  
 * @classdesc 필드의 타입을 나타내는 열거형 클래스입니다. 
 * @class
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.data.FieldType = Xr.Class({
	name: "FieldTypeType",
	statics: {
		INTEGER: 0,
		SHORT: 1,
		VERYSHORT: 2,
		FLOAT: 3,
		DOUBLE: 4,
		STRING: 5
	}
});