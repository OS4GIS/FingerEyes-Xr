Xr.theme = Xr.theme || {};

Xr.theme.ProgrammableShapeDrawTheme = Xr.Class({
    name: "ProgrammableShapeDrawTheme",

    construct: function (/* ShapeMapLayer */ shapeMapLayer) {
        this._shapeMapLayer = shapeMapLayer;
    },

    methods: {
        /* ShapeMapLayer */ layer: function () {
            return this._shapeMapLayer;
        }
    }
});