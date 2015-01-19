Xr.edit = Xr.edit || {};

Xr.edit.UpdateControlPointCommand = Xr.Class({
    name: "UpdateControlPointCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id,
            /* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._newPt = new Xr.PointD(newPt.x, newPt.y);
	    this._oldPt = new Xr.PointD();
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().updateControlPoint(this._partIndex, this._controlPointIndex, this._newPt, this._oldPt);
	        if (newIdx != undefined) {
	            this._controlPointIndex = newIdx;
	        }

	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().updateControlPoint(this._partIndex, this._controlPointIndex, this._oldPt);
	        if (newIdx != undefined) {
	            this._controlPointIndex = newIdx;
	        }

	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.MoveControlPointCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "MOVE_CONTROL_POINT"
	}
});