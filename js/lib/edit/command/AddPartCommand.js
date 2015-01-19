Xr.edit = Xr.edit || {};

Xr.edit.AddPartCommand = Xr.Class({
    name: "AddPartCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* Array of PointD */ pointList) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._pointList = Xr.OperationHelper.copyArrayOfPointD(pointList);
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().insertPart(-1, this._pointList);
	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().removePart(-1);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.AddPartCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "ADD_PART"
	}
});