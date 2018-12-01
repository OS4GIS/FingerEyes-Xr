Xr.layers = Xr.layers || {};

/**  
 * @classdesc 구체적인 레이어들의 부모 클래스입니다.
 * @class
 * @param {String} name - 레이어에 대한 이름으로 고유한 ID 값이여야 함
 * @param {String} connectionString - 데이터 소스 연결 문자열
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.Layer = Xr.Class({
	name: "Layer",

    construct: function (name, connectionString) {
        if (arguments[0] === __XR_CLASS_LOADING_TIME__) return; // for preventing Error in Xr.Class

		this._name = name;
		this._connectionString = connectionString;

		this._visibility = new Xr.Visibility();
        this._labelDrawer = undefined;

        this._bTopMost = false;
	},

    methods: {
        topMost: function (/* optional boolean */ v) {
            if (arguments.length === 0) {
                return this._bTopMost;
            } else {
                this._bTopMost = v;
            }
        },

		name: function() {
			return this._name;
		},

		connectionString: function() {
			return this._connectionString;		
		},

		toString: function() {
			return this._name + "(" + this.connectionString() + ")";
		},

	    /* optional LabelDrawer */ labelDrawer: function(/* optional LabelDrawer */ v) {
		    if(arguments.length === 0) {
		        return this._labelDrawer;
		    } else {
		        this._labelDrawer = v;
		        return this;
		    }
		},

	    visibility: function() {
	        return this._visibility;
	    },

	    /* Array */ IdByMousePoint: function (/* number*/ mouseX, /* number */ mouseY, /* boolean */ bOnlyOne) {
	        return -1;
        },

        coordMapper: function () {
            return this._coordMapper;
        }
	}
});