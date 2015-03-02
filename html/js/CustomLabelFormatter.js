CustomLabelFormatter = Xr.Class({
    name: "CustomLabelFormatter",
    extend: Xr.label.ProgrammableLabelFormatter,
    requires: [Xr.label.ILabelFormatter],

    construct: function (/* ShapeMapLayer */ layer) {
        this.superclass(layer);
        this._fieldIndex = -1;
    },

    methods: {
        /* string */ value: function (/* ShapeRow */ shapeRow, /* FieldSet */ fieldSet, /* AttributeRow */ attributeRow) {
            if (this._fieldIndex == -1) {
                this._fieldIndex = fieldSet.fieldIndex("PAR_LBL");
            }

            var value = attributeRow.valueAsString(this._fieldIndex);

            return value.substring(value.length-1);
        }
    }
});