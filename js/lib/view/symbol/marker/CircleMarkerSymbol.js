Xr.symbol = Xr.symbol || {};

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

        width: function () {
            return this._radius * 2;
        },

        height: function () {
            return this._radius * 2;
        }
    }
});