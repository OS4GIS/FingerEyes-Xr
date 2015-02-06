Xr.edit = Xr.edit || {};

/**  
 * @classdesc 편집에 대한 구체적인 명령 클래스가 구현해야 하는 인터페이스입니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.ICommand = Xr.Class({
	name: "ICommand",
	
	methods: {
	    /* boolean */ run: function () {},
	    /* boolean */ undo: function () {},
	    /* String */ type: function () {}
	}
});