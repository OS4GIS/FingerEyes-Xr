Xr.ui = Xr.ui || {};

Xr.ui.IUserControl = Xr.Class({
    name: "IUserControl",
	
	methods: {
	    /* DIV Element */ container: function () { },
	    /* String */ name: function () { },
	    update: function () { },

	    prepare: function () { },
	    release: function () { }
	}
});