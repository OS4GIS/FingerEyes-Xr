Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 도형의 외곽선 또는 선에 대한 심벌(Symbol)을 지정하기 위한 클래스입니다. 
 * @class
 * @param {Object} propertyObj - 심벌 정의를 위한 속성 객체로써 색상값 지정을 위한 color와 투명도 지정을 위한 opacity, 굵기를 지정할 수 있는 width가 있습니다.
 * 이외에 선의 끝 모양을 지정하기 위한 cap, 선이 꺾이는 곳의 모양을 지정하는 lineJoin과 miterLimit, dash, dashOffset이 가능합니다. 
 * color(색상값)는 #ffffff 또는 rgb(255,255,255)와 같은 문자열 값이 가능하며 opacity(투명도)는 0과 1사이가 가능합니다. 투명도가 0일때 완전히 투명한 상태로 표현됩니다.
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */

Xr.symbol.PenSymbol = Xr.Class({
    name: "PenSymbol",

    construct: function (propertyObj) {
        var attributes = propertyObj || {};

        this._color = attributes['color'] || '#ffffff';
        this._width = attributes['width'] || undefined;
        this._cap = attributes['cap'] || undefined;
        this._lineJoin = attributes['lineJoin'] || undefined;
        this._miterLimit = attributes['miterLimit'] || undefined; 
        this._dash = attributes['dash'] || undefined;
        this._dashOffset = attributes['dashOffset'] || undefined;
        this._opacity = attributes['opacity'] || undefined;
    },

    methods: {
        /* string, #ffffff or red */ color: function (/* optional string, #ffffff or red */ v) {
            if (arguments.length == 0) {
                return this._color;
            } else {
                this._color = v;
                return this;
            }
        },

        /* number */ width: function (/* optional number */ v) {
            if (arguments.length == 0) {
                return this._width;
            } else {
                this._width = v;
                return this;
            }
        },

        /* string */ cap: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._cap;
            } else {
                this._cap = v;
                return this;
            }
        },

        /* string */ lineJoin: function(/* optional string */ v) {
            if (arguments.length == 0) {
                return this._lineJoin;
            } else {
                this._lineJoin = v;
                return this;
            }
        },

        /* string */ miterLimit: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._miterLimit;
            } else {
                this._miterLimit = v;
                return this;
            }
        },

        /* string */ dash: function (/* optional string */ v) {
            if (arguments.length == 0) {
                return this._dash;
            } else {
                this._dash = v;
                return this;
            }
        },

        /* int */ 
        dashOffset: function (/* optinal int */ v) {
            if (arguments.length == 0) {
                return this._dashOffset;
            } else {
                this._dashOffset = v;
                return this;
            }
        },

        /* number, 0 ~ 1 */ getOpacity: function (/* number, 0 ~ 1 */v) {
            if (arguments.length == 0) {
                return this._opacity;
            } else {
                this._opacity = v;
                return this;
            }
        },

        attribute: function (/* SVG Element */ svg) {
            if(this._color != undefined) svg.setAttribute("stroke", this._color);
            if (this._width != undefined) svg.setAttribute("stroke-width", this._width);
            if (this._cap != undefined) svg.setAttribute("stroke-linecap", this._cap);
            if (this._lineJoin != undefined) svg.setAttribute("stroke-linejoin", this._lineJoin);
            if (this._miterLimit != undefined) svg.setAttribute("stroke-miterlimit", this._miterLimit);
            if (this._dash != undefined) svg.setAttribute("stroke-dasharray", this._dash);
            if (this._dashOffset != undefined) svg.setAttribute("stroke-dashoffset", this._dashOffset);
            if (this._opacity != undefined) svg.setAttribute("stroke-opacity", this._opacity);
        }
    }
});