/**  
 * @classdesc 레이어의 라벨을 구성하기 위한 정보를 관리하는 클래스입니다.
 * 해당 정보에는 대상 레이어, 라벨 표시 여부, 라벨의 스타일 지정을 위한 심(Theme) 정보, 라벨 문자열 구성을 위한 구성자(Formatter)입니다.
 * @class
 * @param {Xr.layers.ShapeMapLayer} layer - 해당 라벨과 직접적인 연관이 있는 레이어 객체입니다.
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.Label = Xr.Class({
	name: "Label",
	
	construct: function(layer) {
		this._layer = layer;
		this._enable = false;

		this._theme = new Xr.theme.SimpleLabelDrawTheme(this);
		this._formatter = new Xr.label.SingleValueLabelFormatter(this);

		this._visibility = new Xr.Visibility();
	},
 	
	methods: {
	    /* ILabelFormatter */ formatter: function (/* optional ILabelFormatter */ v) {
	        if (arguments.length == 0) {
	            return this._formatter;
	        } else {
	            this._formatter = v;
	            return this;
	        }
	    },

	    /* ILabelDrawTheme */ theme: function (/* optional ILabelDrawTheme */ v) {
	        if (arguments.length == 0) {
	            return this._theme;
	        } else {
	            this._theme = v;
	            return this;
	        }
	    },

	    /* boolean */ enable: function (/* boolean */ enable) {
	        if (arguments.length == 0) {
	            return this._enable;
	        } else {
	            this._enable = enable;
	            return this;
	        }
		},

	    /* Visibility */ visibility: function() {
	        return this._visibility;
	    },

		toString: function() {
		    return "Label: " + this._layer.getName;
		}
	}
});