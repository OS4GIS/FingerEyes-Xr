Xr.label = Xr.label || {};

Xr.label.ProgrammableLabelFormatter = Xr.Class({
    name: "ProgrammableLabelFormatter",

    construct: function (/* ShapeMapLayer */ shapeMapLayer) {
        this._shapeMapLayer = shapeMapLayer;
    },

    methods: {
        /* ShapeMapLayer */ layer: function () {
            return this._shapeMapLayer;
        }
    }
});