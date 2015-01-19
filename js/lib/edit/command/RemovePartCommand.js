Xr.edit = Xr.edit || {};

Xr.edit.RemovePartCommand = Xr.Class({
    name: "RemovePartCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* int */ idxPartRemoved) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._pointList = undefined;
	    this._idxPartRemoved = idxPartRemoved;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        this._pointList = row.graphicData().removePart(this._idxPartRemoved);
	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().insertPart(this._idxPartRemoved, this._pointList);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.RemovePartCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "REMOVE_PART"
	}
});