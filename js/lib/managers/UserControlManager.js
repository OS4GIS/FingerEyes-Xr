Xr.managers = Xr.managers || {};

Xr.managers.UserControlManager = Xr.Class({
    name: "UserControlManager",
    requires: [Xr.IMouseInteraction],

	construct: function(/* Map */ map) {
		this._controls = new Array();
		this._map = map;

		this._div = document.createElement("div");
		this._div.style.position = "absolute";
		this._div.style.top = "0px";
		this._div.style.left = "0px";
		this._div.style.width = "100%";
		this._div.style.height = "100%";
		this._div.style.overflow = "hidden";
		//this._div.style.setProperty("pointer-events", "none");
	},
 	
	methods: {
	    /* DIV Element */ container: function() {
	        return this._div;
	    },

	    /* int */ count: function() {
	        return this._controls.length;
	    },

		/* boolean */ exist: function(/* String */ name) {
		    var cntCtrls = this._controls.length;
			
		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        if (this._controls[iCtrl].name() == name) return true;
			}
			
			return false;
		},
	
	    /* IUserControl */ index: function (/* String */ name) {
		    var cntCtrls = this._controls.length;
			
		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        if (this._controls[iCtrl].name() == name) return iCtrl;
			}
			
			return -1;		
		},

	    /* ZoomLevelControl */ zoomScaleControl: function() {
	        var cntCtrls = this._controls.length;

	        for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
	            var ctrl = this._controls[iCtrl];
	            if (ctrl instanceof Xr.ui.ZoomLevelControl) return ctrl;
	        }

	        return null;
	    },

	    /* IUserControl */ control: function (/* String */ name) {
		    var cntCtrls = this._controls.length;
			
		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        if (this._controls[iCtrl].name() == name) return this._controls[iCtrl];
			}
			
			return null;
		},

	    /* IUserControl */ controlByIndex: function (/* int */ index) {
		    var cntCtrls = this._controls.length;
		    if (index < 0 || index >= cntCtrls) return null;

		    return this._controls[index];
		},

		/* boolean */ add: function (/* IUserControl */ control) {
		    if (this.exist(control.name())) return false;
			
		    this._controls.push(control);
			
		    this._div.appendChild(control.container());

		    control.prepare();
		    control.update();
             
		    return true;
		},

		remove: function (name) {
			var index = this.index(name);
			if (index != -1) {
			    var control = this._controls[index];
			    control.release();

			    var container = control.container();
			    this._div.removeChild(container);

			    this._controls.splice(index, 1);
			}
		},

		update: function () {
		    var cntCtrls = this._controls.length;

		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        this._controls[iCtrl].update(this._map);
		    }
		},

		mouseDown: function (e) {
		    var cntCtrls = this._controls.length;

		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        this._controls[iCtrl].mouseDown(e);
		    }
		},

		mouseMove: function (e) {
		    var cntCtrls = this._controls.length;

		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        this._controls[iCtrl].mouseMove(e);
		    }
		},

		mouseUp: function (e) {
		    var cntCtrls = this._controls.length;

		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        this._controls[iCtrl].mouseUp(e);
		    }
		},

		click: function (e) {
		    var cntCtrls = this._controls.length;

		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        this._controls[iCtrl].click(e);
		    }
		},

		dblClick: function (e) {
		    var cntCtrls = this._controls.length;

		    for (var iCtrl = 0; iCtrl < cntCtrls; iCtrl++) {
		        this._controls[iCtrl].update(this._map);
		    }
		}
	}
});