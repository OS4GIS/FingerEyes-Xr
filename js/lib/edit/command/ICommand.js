Xr.edit = Xr.edit || {};

Xr.edit.ICommand = Xr.Class({
	name: "ICommand",
	
	methods: {
	    /* boolean */ run: function () {},
	    /* boolean */ undo: function () {},
	    /* String */ type: function () {}
	}
});