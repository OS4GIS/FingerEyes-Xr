Xr.edit = Xr.edit || {};

Xr.edit.MoveCommand = Xr.Class({
    name: "MoveCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* number */ deltaX, /* number */ deltaY) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._deltaX = deltaX;
	    this._deltaY = deltaY;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        row.graphicData().moveByOffset(this._deltaX, this._deltaY);

	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        row.graphicData().moveByOffset(-this._deltaX, -this._deltaY);

	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.MoveCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "MOVE"
	}
});