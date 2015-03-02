Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 문자를 표현하기 위한 심벌(Symbol)을 지정하기 위한 클래스입니다. 
 * @class
 * @param {Object} propertyObj - 문자에 대한 표현 심벌을 정의하기 위한 속성 객체로써 폰트를 지정하기 위한 fontFamily와 크기 지정을 위한 size를 지정할 수 있습니다.
 * 또한 폰트의 색상을 color로 지정할 수 있으며 #ffffff 또는 rgb(255,255,255)와 같은 문자열 값이 가능하고 weight를 지정하여 글자의 굵기를 조정할 수 있습니다.
 * 문자에 대한 외곽선 지정을 위해 strokeColor, strokeWidth, strokeLineCap, strokeLineJoin, strokeOpacity가 가능합니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */

Xr.symbol.FontSymbol = Xr.Class({
    name: "FontSymbol",

    construct: function (/* Object */ propertyObj) {
        var attributes = propertyObj || {};

        this._fontFamily = attributes['fontFamily'] || undefined;
        this._size = attributes['size'] || 12;
        this._color = attributes['color'] || 0xffffff;
        this._weight = attributes['weight'] || undefined;

        this._strokeColor = attributes['strokeColor'] || undefined;
        this._strokeWidth = attributes['strokeWidth'] || 3;
        this._strokeLineCap = attributes['strokeLineCap'] || undefined;
        this._strokeLineJoin = attributes['strokeLineJoin'] || undefined;
        this._strokeOpacity = attributes['strokeOpacity'] || 1;
    },

    methods: {
        /* string */ fontFamily: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._fontFamily;
            } else {
                this._fontFamily = v;
                return this;
            }
        },

        /* number */ size: function (/* number */ v) {
            if (arguments.length == 0) {
                return this._size;
            } else {
                this._size = v;
                return this;
            }
        },

        /* String, #ffffff or rgb(255,255,255) */ color: function (/* optional String */ v) {
            if (arguments.length == 0) {
                return this._color;
            } else {
                this._color = v;
                return this;
            }
        },

        /* string, bold or 100, 200, 400, 600, ... */ weight: function (/* optional string, bold or 100, 600, ... */ v) {
            if (arguments.length == 0) {
                return this._weight;
            } else {
                this._weight = v;
                return this;
            }
        },

        /* String, #ffffff or rgb(255,255,255) */ strokeColor: function (/* optional String, #ffffff or rgb(255,255,255) */ v) {
            if (arguments.length == 0) {
                return this._strokeColor;
            } else {
                this._strokeColor = v;
                return this;
            }
        },

        /* number, 0~1 */ strokeOpacity: function (/* optional number, 0~1 */ v) {
            if (arguments.length == 0) {
                return this._strokeOpacity;
            } else {
                this._strokeOpacity = v;
                return this;
            }
        },

        /* number */ strokeWidth: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._strokeWidth;
            } else {
                this._strokeWidth = v;
                return this;
            }
        },

        /* string */ strokeLineJoin: function (/* optional string */ v) {
            if (arguments.length == 0) {
                this._strokeLineJoin;
            } else {
                this._strokeLineJoin = v;
                return this;
            }
        },

        /* number */ strokeOpacity: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._strokeOpacity;
            } else {
                this._strokeOpacity = v;
                return this;
            }
        },

        attributeForStroke: function (/* SVG Element */ svg) {
            /*
			svg.setAttribute("font-size", 12);
			svg.setAttribute("stroke", "#000000");
			svg.setAttribute("stroke-width", "3px");
			svg.setAttribute("stroke-linecap", "butt");
			svg.setAttribute("stroke-linejoin", "round");
			svg.setAttribute("stroke-opacity", "1");
            */

            if(this._fontFamily) svg.setAttribute('font-family', this._fontFamily);            
            svg.setAttribute("font-size", this._size);
            if(this._weight) svg.setAttribute("font-weight", this._weight);
            if(this._strokeColor) svg.setAttribute('stroke', this._strokeColor);
            if (this._strokeWidth) svg.setAttribute('stroke-width', this._strokeWidth);
            if(this._strokeLineCap) svg.setAttribute('stroke-linecap', this._strokeLineCap);
            if(this._strokeLineJoin) svg.setAttribute('stroke-linejoin', this._strokeLineJoin);
            svg.setAttribute('stroke-opacity', this._strokeOpacity);
        },

        attribute: function (/* SVG Element */ svg) {
            /*
			text.setAttribute("font-size", 12);
			text.setAttribute("fill", "#ffffff");
			*/

            if (this._fontFamily) svg.setAttribute('font-family', this._fontFamily);
            svg.setAttribute('font-size', this._size);
            if (this._weight) svg.setAttribute('font-weight', this._weight);
            svg.setAttribute("fill", this._color);
        },

        needStroke: function () {
            return (this._strokeColor != undefined);
        }
    }
});