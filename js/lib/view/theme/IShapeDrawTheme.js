Xr.theme = Xr.theme || {};

Xr.theme.IShapeDrawTheme = Xr.Class({
    name: "IShapeDrawTheme",

    methods: {
        /* ShapeDrawSymbol */ symbol: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) { return null; },
        /* boolean */ needAttribute: function () {}
    }
});
