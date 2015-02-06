Xr.symbol = Xr.symbol || {};

/**  
 * @classdesc 포인트 형태의 데이터를 이미지로 표현하는 클래스입니다. 포인트 형태의 데이터를 마커(Marker)라고도 합니다.
 * @class
 * @param {Object} attributes - 심벌 정의를 위한 속성 객체로써 이미지에 대한 url을 지정하여 이미지를 정할 수 있습니다. 
 * 그 외에 width와 height를 지정하여 표현되는 이미지 심벌의 가로와 세로의 크기를 정할 수 있습니다.
 * attributes에 width와 height를 지정하지 않으면 기본적으로 64x64 픽셀 크기로 표현됩니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.symbol.ImageMarkerSymbol = Xr.Class({
    name: "ImageMarkerSymbol",
    requires: [Xr.symbol.IMarkerSymbol],

    construct: function (/* object */ attributes) {        
        attributes = attributes || {};
        if (!attributes.url) throw new Error("ImageMarkerSymbol requires url option.");
        else this._url = attributes['url'];

        this._width = attributes['width'] || 64;
        this._height = attributes['height'] || 64;
    },

    methods: {
        /* SVG Element */ create: function (/* PointD */ point, /* CoordMapper */ coordMapper) { 
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            //var point = shapeRow.shapeData().data();
            var svg = document.createElementNS(xmlns, "image");
            var vp = coordMapper.W2V(point);

            svg.setAttribute("x", vp.x - (this._width / 2));
            svg.setAttribute("y", vp.y - (this._height / 2));
            svg.setAttribute("width", this._width);
            svg.setAttribute("height", this._height);
            svg.setAttributeNS("http://www.w3.org/1999/xlink", "href", this._url);

            return svg;
        },

        width: function () {
            return this._width;
        },

        height: function () {
            return this._height;
        }
    }
});