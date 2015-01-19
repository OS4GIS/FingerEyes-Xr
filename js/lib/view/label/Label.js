Xr.Label = Xr.Class({
	name: "Label",
	
	construct: function(layer) {
		this._layer = layer;
		this._enable = false;

		this._theme = new Xr.theme.SimpleLabelDrawTheme(this);
		this._formatter = new Xr.label.SingleValueLabelFormatter(this);

		this._visibility = new Xr.Visibility();
	},
 	
	methods: {
	    /* ILabelFormatter */ formatter: function (/* optional ILabelFormatter */ v) {
	        if (arguments.length == 0) {
	            return this._formatter;
	        } else {
	            this._formatter = v;
	        }
	    },

	    /* ILabelDrawTheme */ theme: function (/* optional ILabelDrawTheme */ v) {
	        if (arguments.length == 0) {
	            return this._theme;
	        } else {
	            this._theme = v;
	        }
	    },

	    /* boolean */ enable: function (/* boolean */ enable) {
	        if (arguments.length == 0) {
	            return this._enable;
	        } else {
	            this._enable = enable;
	        }
		},

	    /* Visibility */ visibility: function() {
	        return this._visibility;
	    },

		toString: function() {
			return "Label: " + this._layer.getName + ", " + this._fieldName;
		}
	}
});