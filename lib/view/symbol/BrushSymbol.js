Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 도형의 채움에 대한 심벌(Symbol)을 지정하기 위한 클래스입니다. 
 * @class
 * @param {Object} propertyObj - 채움 심벌 정의를 위한 속성 객체로써 색상값 지정을 위한 color와 투명도 지정을 위한 opacity를 지정할 수 있습니다.
 * color(색상값)는 #ffffff 또는 rgb(255,255,255)와 같은 문자열 값이 가능하며 opacity(투명도)는 0과 1사이가 가능합니다. 투명도가 0일때 완전히 투명한 상태로 표현됩니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.symbol.BrushSymbol = Xr.Class({
    name: "BrushSymbol",

    construct: function (/* Object */ propertyObj) {
        var attributes = propertyObj || {};

        this._color = attributes.color || undefined;
        this._opacity = attributes.opacity /* || undefined */;
    },

    methods: {
        /* String, #ffffff or rgb(255,255,255) */ color: function (/* optional String, #ffffff or rgb(255,255,255) */ v) {
            if (arguments.length == 0) {
                return this._color;
            } else {
                this._color = v;
                return this;
            }
        },

        /* number, 0~1 */ opacity: function (/* optional number, 0~1 */ v) {
            if (arguments.length == 0) {
                return this._opacity;
            } else {
                this._opacity = v;
                return this;
            }
        },

        attribute: function (/* SVG Element */ svg) {
            if (this._opacity == 0.0) {
                //svg.style.fill = "none";
                svg.setAttribute("fill", "none");
                //svg.setAttribute("fill-opacity", 0.0);
            } else {
                if (this._color != undefined) {
                    //svg.style.fill = this._color;
                    svg.setAttribute("fill", this._color);
                }

                if (this._opacity != undefined) svg.setAttribute("fill-opacity", this._opacity);
            }
        }
    }
});;