/**  
 * @desc marker 네임스페이스입니다. 포인트 형태의 도형에 대해 어떤 형태 또는 심벌(Symbol)로 표현할지에 대한 클래스들로 구성됩니다.
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 포인트 형태의 데이터를 원 심벌(Symbol)로 표현하는 클래스입니다. 포인트 형태의 데이터를 마커(Marker)라고도 합니다.
 * @class
 * @param {Xr.symbol.PenSymbol} penSymbol - 원에 대한 외곽선을 표현하기 위한 펜(Pen) 객체
 * @param {Xr.symbol.BrushSymbol} brushSymbol - 원에 대한 채움색을 표현하기 위한 브러쉬(Brush) 객체
 * @param {Object} attributes - 심벌 정의를 위한 속성 객체로써 radius를 지정하여 반경 크기를 정할 수 있습니다.
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.symbol.CircleMarkerSymbol = Xr.Class({
    name: "CircleMarkerSymbol",
    requires: [Xr.symbol.IMarkerSymbol],

    construct: function (/* PenSymbol */ penSymbol, /* BrushSymbol */ brushSymbol, /* object */ attributes) {
        attributes = attributes || {};

        this._penSymbol = penSymbol || new Xr.symbol.PenSymbol();
        this._brushSymbol = brushSymbol || new Xr.symbol.BrushSymbol();

        this._radius = attributes['radius'] || 5;
    },

    methods: {
        /* SVG Element */ create: function (/* PointD */ point, /* CoordMapper */ coordMapper) { 
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            //var point = shapeRow.shapeData().data();
            var svg = document.createElementNS(xmlns, "circle");
            var vp = coordMapper.W2V(point);

            svg.setAttribute("cx", vp.x);
            svg.setAttribute("cy", vp.y);
            svg.setAttribute("r", this._radius);

            this.penSymbol().attribute(svg);
            this.brushSymbol().attribute(svg);

            return svg;
        },

        /* PenSymbol */ penSymbol: function () {
            return this._penSymbol;
        },

        /* BrushSymbol */ brushSymbol: function () {
            return this._brushSymbol;
        },

        radius: function (/* optional int */ v) {
            if (arguments.length == 0) {
                return this._radius;
            } else {
                this._radius = v;
                return this;
            }

        }
    }
});