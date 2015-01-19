Xr.edit = Xr.edit || {};

Xr.edit.AddVertexCommand = Xr.Class({
    name: "AddVertexCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtxAdded) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._vetexAdded = vtxAdded;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().insertVertex(this._partIndex, this._controlPointIndex, this._vetexAdded);
	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().removeVertex(this._partIndex, this._controlPointIndex);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.AddVertexCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "ADD_VERTEX"
	}
});