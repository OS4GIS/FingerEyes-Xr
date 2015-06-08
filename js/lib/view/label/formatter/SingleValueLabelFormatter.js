Xr.label = Xr.label || {};

/**  
 * @classdesc 라벨 표시를 위한 문자열을 하나의 필드값으로 구성하는 클래스입니다.
 * @class
 * @param {Xr.layers.ShapeMapLayer} layer - 라벨과 직접적으로 연관된 레이어 객체. 이 레이어의 속성 데이터에 접근하여 라벨 표시를 위한 문자열 값을 얻습니다.
 * @param {String} fieldName - 라벨의 문자열 값을 얻기 위핸 필드명으로 생략될 수 있습니다. 필드명이 생략될 경우 반드시 fieldName 매서드를 이용하여 옳바른 필드명을 지정해야만 합니다.
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.label.SingleValueLabelFormatter = Xr.Class({
    name: "SingleValueLabelFormatter",
    extend: Xr.label.ProgrammableLabelFormatter,
    requires: [Xr.label.ILabelFormatter],

    construct: function (/* ShapeMapLayer */ layer, /* optional String */ fieldName) {
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
                this._fieldIndex = -1;
                return this;
            }
        }
    }
});