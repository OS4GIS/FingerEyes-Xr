Xr.ui = Xr.ui || {};

/**  
 * @classdesc 사용자 정의 UI 클래스의 부모 클래스입니다.
 * @class
 * @param {String} name - UI 컨트롤에 대한 식별자로써 고유해야 합니다.
 * @param {Xr.Map} map - UI 컨트롤과 상호작용을 하는 지도 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.ui.UserControl = Xr.Class({
    name: "UserControl",

    construct: function (/* String */ name, /* Map */ map) {
        if (arguments[0] === __XR_CLASS_LOADING_TIME__) return; // for preventing Error in Xr.Class

        this._name = name;
        this._map = map;

        var baseDiv = document.createElement("div");
        this._baseDiv = baseDiv;
        
        baseDiv.style.position = "absolute";
        baseDiv.style.display = "block";
    },

    methods: {
        map: function() {
            return this._map;
        },

		container: function() { 
            return this._baseDiv;
		},

        name: function () {
            return this._name;
		},

		/* optional boolean */ show: function (/* optional boolean */ bShow) {
            var container = this.container();

            if (arguments.length === 0) {
                return container.style.display == 'block';
            } else {
                if (bShow) {
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            }
		},
	}
});