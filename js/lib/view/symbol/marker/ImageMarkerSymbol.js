Xr.symbol = Xr.symbol || {};

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