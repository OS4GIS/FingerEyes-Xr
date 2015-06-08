Xr.edit = Xr.edit || {};
/**  
 * @classdesc 스케치 편집에 대한 구체적인 클래스가 구현해야 하는 인터페이스입니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */

Xr.edit.ISketch = Xr.Class({
	name: "ISketch",
	
	methods: {
	    createSVG: function (/* CoordMapper */ coordMapper) { }
	}
});