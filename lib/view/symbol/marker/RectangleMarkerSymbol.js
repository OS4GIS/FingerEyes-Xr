Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 포인트 형태의 데이터를 사각형 심벌(Symbol)로 표현하는 클래스입니다. 포인트 형태의 데이터를 마커(Marker)라고도 합니다.
 * @class
 * @param {Xr.symbol.PenSymbol} penSymbol - 사각형에 대한 외곽선을 표현하기 위한 펜(Pen) 객체
 * @param {Xr.symbol.BrushSymbol} brushSymbol - 사각형에 대한 채움색을 표현하기 위한 브러쉬(Brush) 객체
 * @param {Object} attributes - 심벌 정의를 위한 속성 객체로써 width와 height를 지정하여 사각형의 가로와 세로의 크기를 픽셀(Pixel) 단위로 정할 수 있습니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.symbol.RectangleMarkerSymbol = Xr.Class({
    name: "RectangleMarkerSymbol",
    requires: [Xr.symbol.IMarkerSymbol],

    construct: function (/* PenSymbol */ penSymbol, /* BrushSymbol */ brushSymbol, /* object */ attributes) {
        attributes = attributes || {};

        this._penSymbol = penSymbol || new Xr.symbol.PenSymbol();
        this._brushSymbol = brushSymbol || new Xr.symbol.BrushSymbol();

        this._width = attributes['width'] || 12;
        this._height = attributes['height'] || 12;
    },

    methods: {
        /* SVG Element */ create: function (/* PointD */ point, /* AttributeRow */ attrRow, /* CoordMapper */ coordMapper) { 
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            //var point = shapeRow.shapeData().data();
            var rectSVG = document.createElementNS(xmlns, "rect");
            var vp = coordMapper.W2V(point);

            rectSVG.setAttribute("x", vp.x - this._width / 2);
            rectSVG.setAttribute("y", vp.y - this._height / 2);
            rectSVG.setAttribute("width", this._width);
            rectSVG.setAttribute("height", this._height);

            this.penSymbol().attribute(rectSVG);
            this.brushSymbol().attribute(rectSVG);

            return rectSVG;
        },

        /* PenSymbol */ penSymbol: function () {
            return this._penSymbol;
        },

        /* BrushSymbol */ brushSymbol: function () {
            return this._brushSymbol;
        },

        width: function (/* optional int */ v) {
            if (arguments.length == 0) {
                return this._width;
            } else {
                this._width = v;
                return this;
            }
        },

        height: function (/* optional int */ v) {
            if (arguments.length == 0) {
                return this._height;
            } else {
                this._height = v;
                return this;
            }
        },

        /* number */ wSize: function () { return this.width(); },
        /* number */ hSize: function () { return this.height(); },
    }
});