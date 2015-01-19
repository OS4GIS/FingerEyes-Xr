Xr.edit = Xr.edit || {};

Xr.edit.RemoveCommand = Xr.Class({
    name: "RemoveCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* IGraphicRow */ graphicRow) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._graphicRow = graphicRow;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var id = this.id();
	        var rowSet = this.graphicLayer().rowSet();
	        if (rowSet.row(id)) {
	            rowSet.remove(id);
	            return true;
	        } else {
	            return false;
	        }
	    },

	    /* boolean */ undo: function () {
	        return this.graphicLayer().rowSet().add(this._graphicRow);
	    },

	    /* String */ type: function () {
	        return Xr.edit.RemoveCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "REMOVE"
	}
});