Xr.symbol = Xr.symbol || {};

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
        /* SVG Element */ create: function (/* PointD */ point, /* CoordMapper */ coordMapper) { 
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

        width: function () {
            return this._width;
        },

        height: function () {
            return this._height;
        }
    }
});