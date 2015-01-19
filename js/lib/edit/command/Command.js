Xr.edit = Xr.edit || {};

Xr.edit.Command = Xr.Class({
    name: "Command",

    construct: function (/* GraphicLayer */ graphicLayer, /* int */ id) {
        this._graphicLayer = graphicLayer;
        this._id = id;
	},
 	
	methods: {
	    graphicLayer: function() {
	        return this._graphicLayer;
	    },

	    id: function () {
		    return this._id;
		}
	}
});