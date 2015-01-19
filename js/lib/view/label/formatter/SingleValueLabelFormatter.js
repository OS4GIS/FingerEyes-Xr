Xr.label = Xr.label || {};

Xr.label.SingleValueLabelFormatter = Xr.Class({
    name: "SingleValueLabelFormatter",
    extend: Xr.label.ProgrammableLabelFormatter,
    requires: [Xr.label.ILabelFormatter],

    construct: function (/* ShapeMapLayer */ layer, /* uint */ fieldName) {
        this.superclass(layer);
        //Xr.label.ProgrammableLabelFormatter.call(this, lyer);

        this._symbol = new Xr.symbol.FontSymbol();
        this._fieldName = fieldName;
        this._fieldIndex = -1;
    },

    methods: {
        /* string */ value: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) {
            if (this._fieldIndex == -1) {
                this._fieldIndex = fieldSet.fieldIndex(this._fieldName);
            }

            return attributeRow.valueAsString(this._fieldIndex);
        },

        /* string */ fieldName: function (/* optional string */ fieldName) {
            if (arguments.length == 0) {
                return this._fieldName;
            } else {
                this._fieldName = fieldName;
            }
        }
    }
});