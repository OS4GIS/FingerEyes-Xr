Xr.edit = Xr.edit || {};

Xr.edit.NewCommand = Xr.Class({
    name: "NewCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* IGraphicRow */ graphicRow) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._graphicRow = graphicRow;
	},

	methods: {
	    /* boolean */ run: function () {
	        return this.graphicLayer().rowSet().add(this._graphicRow);
	    },

	    /* boolean */ undo: function () {
	        var id = this.id();
	        return this.graphicLayer().rowSet().remove(id);
	    },

	    /* String */ type: function () {
	        return Xr.edit.NewCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "NEW"
	}
});