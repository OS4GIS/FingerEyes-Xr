Xr.edit = Xr.edit || {};

Xr.edit.RemoveVertexCommand = Xr.Class({
    name: "RemoveVertexCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* int */ partIndex, /* int */ controlPointIndex) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._vertexTobeRemoved = undefined;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        this._vertexTobeRemoved = row.graphicData().removeVertex(this._partIndex, this._controlPointIndex);
	        return this._vertexTobeRemoved != undefined;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        if (!this._vertexTobeRemoved) return false;

	        row.graphicData().insertVertex(this._partIndex, this._controlPointIndex, this._vertexTobeRemoved);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.RemoveVertexCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "REMOVE_VERTEX"
	}
});