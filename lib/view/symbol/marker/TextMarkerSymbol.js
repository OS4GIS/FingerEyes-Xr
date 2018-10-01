/**  
 * @desc marker 네임스페이스입니다. 포인트 형태의 도형에 대해 어떤 형태 또는 심벌(Symbol)로 표현할지에 대한 클래스들로 구성됩니다.
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 포인트 형태의 데이터를 텍스트 심벌(Symbol)로 표현하는 클래스입니다. 포인트 형태의 데이터를 마커(Marker)라고도 합니다.
 * @class
 * @param {Xr.symbol.FontSymbol} fontSymbol - 텍스트를 표현하기 위한 폰트(Font) 객체
 * @param {Object} attributes - 심벌 정의를 위한 속성 객체로써 표현할 텍스트를 지정할 수 있습니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.symbol.TextMarkerSymbol = Xr.Class({
    name: "TextMarkerSymbol",
    requires: [Xr.symbol.IMarkerSymbol],

    construct: function (/* FontSymbol */ fontSymbol, /* object */ attributes) {
        attributes = attributes || {};

        this._fontSymbol = fontSymbol || new Xr.symbol.FontSymbol();

        this._text = attributes['text'] || "T";
    },

    methods: {
        /* SVG Element */ create: function (/* PointD */ point, /* AttributeRow */ attrRow, /* CoordMapper */ coordMapper) { 
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var sym = this._fontSymbol;
            var g = document.createElementNS(xmlns, "g");
            var stroke = undefined;
            var vp = coordMapper.W2V(point);
            var vx = vp.x;
            var vy = vp.y;
            var t = this._text;

            if (sym.needStroke()) {
                stroke = document.createElementNS(xmlns, "text");
                stroke.setAttribute("x", vx);
                stroke.setAttribute("y", vy);
                stroke.setAttribute("text-anchor", "middle");

                sym.attributeForStroke(stroke);
                stroke.textContent = t;
            }

            var text = document.createElementNS(xmlns, "text");

            text.setAttribute("x", vx);
            text.setAttribute("y", vy);
            text.setAttribute("text-anchor", "middle");

            sym.attribute(text);
            text.textContent = t;

            if (stroke != undefined) {
                g.appendChild(stroke);
            }

            g.appendChild(text);

            return g;
        },

        /* FontSymbol */ fontSymbol: function () {
            return this._fontSymbol;
        },

        text: function (/* optional string */ t) {
            if (arguments.length == 0) {
                return this._text;
            } else {
                this._text = t;
                return this;
            }

        },

        /* number */ wSize: function () { return this._fontSymbol.size(); },
        /* number */ hSize: function () { return this._fontSymbol.size(); }
    }
});