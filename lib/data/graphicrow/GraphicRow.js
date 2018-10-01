Xr.data = Xr.data || {};

/**  
 * @classdesc 그래픽 Row에 대한 부모 클래스입니다.
 * @class
 * @param {int} id - 그래픽 Row에 대한 고유 ID
 * @param {Xr.data.IShapeData} graphicData - 그래픽 Row의 실제 구체적인 데이터에 대한 클래스
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.GraphicRow = Xr.Class({
	name: "GraphicRow",

    construct: function (/* int */ id, /* IShapeData */ graphicData) {
        if (arguments[0] === __XR_CLASS_LOADING_TIME__) return; // for preventing Error in Xr.Class

		this._id = id;
		this._graphicData = graphicData;
        this._tag = "";

        this._titleText = null;
        this._titleOffsetX = 0;
        this._titleOffsetX = 0;
        this._titleFontSymbol = null;

        this._cssClassName = undefined;
	},
 	
	methods: {
	    /* Xr.data.ShapeType */ shapeType: function () {
	        return this._graphicData.type();
	    },

        /* string */ toString: function () {
            return null;
        },

        /* string */ cssClassName: function (/* optional string */ className) {
            if (arguments.length == 1) {
                this._cssClassName = className;
            } else {
                return this._cssClassName;
            }
        },

        /* string */ titleText: function (/* optiional string */ text) {
            if (arguments.length == 1) {
                if (!this._titleFontSymbol) {
                    this._titleFontSymbol = new Xr.symbol.FontSymbol();
                }
                
                this._titleText = text;
            } else {
                return this._titleText;
            }
        },

        /* int */ titleOffsetX: function (/* optiional int */ v) {
            if (arguments.length == 1) {
                this._titleOffsetX = v;
            } else {
                return this._titleOffsetX;
            }
        },

        /* int */ titleOffsetY: function (/* optiional int */ v) {
            if (arguments.length == 1) {
                this._titleOffsetY = v;
            } else {
                return this._titleOffsetY;
            }
        },

        /* FontSymbol */ titleFontSymbol: function (/* optional FontSymbol */ fontSymbol) {
            if (arguments.length == 1) {
                this._titleFontSymbol = fontSymbol;
            } else {
                return this._titleFontSymbol;
            }
        },

        /* SVG Element(g) */ titleSVG: function (/* CoordMaper */ cm, /* PointD */ mapPt) {
            var text = this._titleText;
            if (!text) return null;

            var fontSymbol = this._titleFontSymbol;
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var g = document.createElementNS(xmlns, "g");
            var strokeSvg = undefined;
            var vp = cm.W2V(mapPt);
            var offsetX = this._titleOffsetX;
            var offsetY = this._titleOffsetY;

            if (fontSymbol.needStroke()) {
                strokeSvg = document.createElementNS(xmlns, "text");
                strokeSvg.setAttribute("x", vp.x + offsetX);
                strokeSvg.setAttribute("y", vp.y + offsetY);
                strokeSvg.setAttribute("text-anchor", "middle");
                fontSymbol.attributeForStroke(strokeSvg);
                strokeSvg.textContent = text;
            }

            var textSvg = document.createElementNS(xmlns, "text");
            textSvg.setAttribute("x", vp.x + offsetX);
            textSvg.setAttribute("y", vp.y + offsetY);
            textSvg.setAttribute("text-anchor", "middle");
            fontSymbol.attribute(textSvg);
            textSvg.textContent = text;

            if (strokeSvg != undefined) {
                var filter = document.createElementNS(xmlns, "filter");
                filter.setAttribute("id", "_fe_labelBlur");

                var blur = document.createElementNS(xmlns, "feGaussianBlur");
                blur.setAttribute("stdDeviation", "1.5");

                filter.appendChild(blur);
                g.appendChild(filter);

                strokeSvg.setAttribute("filter", "url(#_fe_labelBlur)");
                g.appendChild(strokeSvg);
            }

            g.appendChild(textSvg);

            return g;
        },

	    tag: function(/* String */ value) {
	        if (arguments.length == 1) {
	            this._tag = value;
	        } else {
	            return this._tag;
	        }
	    },

		id: function() {
			return this._id;
		},
		
	    /* IShapeData */ graphicData: function () {
			return this._graphicData; 
		},

		MBR: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
		    return this._graphicData.MBR();
		},

	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	        // 이 클래스의 파생 클래스의 _markerSymbol를 전달함(PointGraphicRow에서만 의미가 있음)
	        return this.graphicData().hitTest(x, y, cm, this._markerSymbol);
	    }
	}
});