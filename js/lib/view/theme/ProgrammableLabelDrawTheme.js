Xr.theme = Xr.theme || {};

Xr.theme.ProgrammableLabelDrawTheme = Xr.Class({
    name: "ProgrammableLabelDrawTheme",

    construct: function (/* ShapeMapLayer */ shapeMapLayer) {
        this._shapeMapLayer = shapeMapLayer;
    },

    methods: {
        /* ShapeMapLayer */ layer: function () {
            return this._shapeMapLayer;
        }
    }
});