Xr.edit = Xr.edit || {};

Xr.edit.MoveControlPointCommand = Xr.Class({
    name: "MoveControlPointCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id,
            /* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._deltaX = deltaX;
	    this._deltaY = deltaY;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().moveControlPointByOffset(this._partIndex, this._controlPointIndex, this._deltaX, this._deltaY);
	        if (newIdx != undefined) {
	            this._controlPointIndex = newIdx;
	        }

	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().moveControlPointByOffset(this._partIndex, this._controlPointIndex, -this._deltaX, -this._deltaY);
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