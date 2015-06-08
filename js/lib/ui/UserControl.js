Xr.ui = Xr.ui || {};

/**  
 * @classdesc 사용자 정의 UI 클래스의 부모 클래스입니다.
 * @class
 * @param {String} name - UI 컨트롤에 대한 식별자로써 고유해야 합니다.
 * @param {Xr.Map} map - UI 컨트롤과 상호작용을 하는 지도 객체
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.ui.UserControl = Xr.Class({
    name: "UserControl",

    construct: function (/* String */ name, /* Map */ map) {
        this._name = name;
        this._map = map;

        this._baseDiv = document.createElement("div");
        this._baseDiv.style.position = "absolute";
        //this._baseDiv.style.setProperty("pointer-events", "none");
    },
 	
    methods: {
        map: function() {
            return this._map;
        },

		container: function() { 
		    return this._baseDiv;
		},

		name: function() {
		    return this._name;
		}
	}
});