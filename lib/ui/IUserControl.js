Xr.ui = Xr.ui || {};

/**  
 * @classdesc 사용자 정의 UI가 구현해야 할 인터페이스입니다. 
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.ui.IUserControl = Xr.Class({
    name: "IUserControl",
	
	methods: {
	    /* DIV Element */ container: function () { },
	    /* String */ name: function () { },
	    update: function () { },

	    prepare: function () { },
	    release: function () { },

	    /* optional boolean */ show: function (/* optional boolean */ bShow) { },

        enableMouse: function (/* bool */ bEnable) { },
	}
});