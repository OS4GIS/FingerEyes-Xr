Xr.symbol = Xr.symbol || {};

Xr.symbol.IMarkerSymbol = Xr.Class({
    name: "IMarkerSymbol",

    methods: {
        //* SVG Element */ create: function (/* ShapeRow */ shapeRow, /* AttributeRow */ attributeRow, /* CoordMapper */ coordMapper) { return null; }
        /* SVG Element */ create: function (/* PointD */ point, /* CoordMapper */ coordMapper) { return null; },
        width: function () { return 0; },
        height: function () { return 0; }
    }
});