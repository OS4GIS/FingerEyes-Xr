Xr.layers = Xr.layers || {};

Xr.layers.Layer = Xr.Class({
	name: "Layer",

	construct: function(name, connectionString) {
		this._name = name;
		this._connectionString = connectionString;

		this._visibility = new Xr.Visibility();
		this._labelDrawer = undefined;
	},
 	
	methods: {
		name: function() {
			return this._name;
		},

		connectionString: function() {
			return this._connectionString;		
		},

		toString: function() {
			return this._name + "(" + this.connectionString() + ")";
		},

	    /* optional LabelDrawer */ labelDrawer: function(/* optional LabelDrawer */ v) {
		    if(arguments.length == 0) {
		        return this._labelDrawer;
		    } else {
		        this._labelDrawer = v;
		    }
		},

	    visibility: function() {
	        return this._visibility;
	    },

	    /* Array */ IdByMousePoint: function (/* number*/ mouseX, /* number */ mouseY, /* boolean */ bOnlyOne) {
	        return -1;
	    }
	}
});