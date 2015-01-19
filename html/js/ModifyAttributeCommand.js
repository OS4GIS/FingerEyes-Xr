ModifyAttributeCommand = Xr.Class({
    name: "ModifyAttributeCommand",
    extend: Xr.edit.Command,
    requires: [Xr.edit.ICommand],

    construct: function (/* int */ id, /* Object */ oldAttributeObj, /* Object */ newAttributeObj) {
        Xr.edit.Command.call(this, undefined, id);

        this._newAttributesObj = newAttributeObj;
        this._oldAttributesObj = oldAttributeObj;
    },

    methods: {
        /* boolean */ run: function () {
            txt_buld_nm.value = this._newAttributesObj.buld_nm;
            txt_buld_nm_dc.value = this._newAttributesObj.buld_nm_dc;
            txt_zip.value = this._newAttributesObj.zip;
            txt_lnbr_mnnm.value = this._newAttributesObj.lnbr_mnnm;
            txt_lnbr_slno.value = this._newAttributesObj.lnbr_slno;
            txt_gro_flo_co.value = this._newAttributesObj.gro_flo_co;
            txt_und_flo_co.value = this._newAttributesObj.und_flo_co;

            return true;
        },

        /* boolean */ undo: function () {
            txt_buld_nm.value = this._oldAttributesObj.buld_nm;
            txt_buld_nm_dc.value = this._oldAttributesObj.buld_nm_dc;
            txt_zip.value = this._oldAttributesObj.zip;
            txt_lnbr_mnnm.value = this._oldAttributesObj.lnbr_mnnm;
            txt_lnbr_slno.value = this._oldAttributesObj.lnbr_slno;
            txt_gro_flo_co.value = this._oldAttributesObj.gro_flo_co;
            txt_und_flo_co.value = this._oldAttributesObj.und_flo_co;

            return true;
        },

        /* String */ type: function () {
            return ModifyAttributeCommand.TYPE;
        }
    },

    statics: {
        TYPE: "CUSTOM"
    }
});