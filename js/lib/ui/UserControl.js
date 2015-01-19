Xr.ui = Xr.ui || {};

Xr.ui.UserControl = Xr.Class({
    name: "UserControl",

    construct: function (/* String */ name, /* Map */ map) {
        this._name = name;
        this._map = map;

        this._baseDiv = document.createElement("div");
        this._baseDiv.style.position = "absolute";
        //this._baseDiv.style.setProperty("pointer-events", "none");
    },
 	
    methods: {
        map: function() {
            return this._map;
        },

		container: function() { 
		    return this._baseDiv;
		},

		name: function() {
		    return this._name;
		}
	}
});