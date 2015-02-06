Xr.edit = Xr.edit || {};

/**  
 * @classdesc 편집에 대한 명령 클래스의 부모 클래스입니다.
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.Command = Xr.Class({
    name: "Command",

    construct: function (/* GraphicLayer */ graphicLayer, /* int */ id) {
        this._graphicLayer = graphicLayer;
        this._id = id;
	},
 	
	methods: {
	    graphicLayer: function() {
	        return this._graphicLayer;
	    },

	    id: function () {
		    return this._id;
		}
	}
});