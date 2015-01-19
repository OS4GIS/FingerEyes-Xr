Xr.managers = Xr.managers || {};

Xr.managers.LayerManager = Xr.Class({
	name: "LayerManager",

	construct: function(mapDiv, coordMapper, /* LabelDrawer */ labelDrawer, /* EditManager */ editManager, /* UserControlManager */ userControls) {
		this._layers = new Array();
		this._mapDiv = mapDiv;
		this._coordMapper = coordMapper;
		this._labelDrawer = labelDrawer;
		this._editManager = editManager;
		this._userControls = userControls;
	},
 	
	methods: {
	    count: function() {
	        return this._layers.length;
	    },

		exist: function(name) {
			var cntLayers = this._layers.length;
			
			for(var iLyr=0; iLyr<cntLayers; iLyr++) {
				if(this._layers[iLyr].name() == name) return true;
			}
			
			return false;
		},
	
		index: function(name) {
			var cntLayers = this._layers.length;
			
			for(var iLyr=0; iLyr<cntLayers; iLyr++) {
				if(this._layers[iLyr].name() == name) return iLyr;
			}
			
			return -1;		
		},

		layer: function(name) {
			var cntLayers = this._layers.length;
			
			for(var iLyr=0; iLyr<cntLayers; iLyr++) {
				if(this._layers[iLyr].name() == name) return this._layers[iLyr];
			}
			
			return null;
		},

		layerByIndex: function (index) {
		    var cntLayers = this._layers.length;
		    if (index < 0 || index >= cntLayers) return null;

		    return this._layers[index];
		},

		add: function(layer) {
			if(this.exist(layer.name())) return false;
			
			this._layers.push(layer);
			
			this._mapDiv.appendChild(layer.container());

		    // 'SVG for LabelDrawer' is top.
			this._mapDiv.appendChild(this._labelDrawer.container());

		    // 'SVG for EditManager' is top.
			this._mapDiv.appendChild(this._editManager.container());

            // 'DIV for UserControlManager' is top most.
			this._mapDiv.appendChild(this._userControls.container());

			layer.labelDrawer(this._labelDrawer);
			layer.connect(this._coordMapper);

			return true;
		},

		removeAll: function() {
		    var cntLayers = this.count();
		    for (var i = (cntLayers-1); i >= 0; i--) {
		        var layer = this.layerByIndex(i);
		        var container = layer.container();

		        this._mapDiv.removeChild(container);
		        this._layers.splice(i, 1);
		    }
		},

		remove: function(name) {
			var index = this.index(name);
			if(index != -1) {
				this._layers.splice(index, 1);

				var container = this.layer(name).container();
				this._mapDiv.removeChild(container);
			}
		},
		
		update: function (/*optinal MouseActionEnum */ mouseAction, /* option int */ offsetX, /* option int */ offsetY) {
		    if (mouseAction == undefined) mouseAction = Xr.MouseActionEnum.NO_MOUSE;
		    if (offsetX == undefined) offsetX = 0;
		    if (offsetY == undefined) offsetY = 0;

		    //if (mouseAction == Xr.MouseActionEnum.MOUSE_UP || mouseAction == Xr.MouseActionEnum.NO_MOUSE) {
		    //    this._labelDrawer.reset();
		    //}

			var cntLayers = this._layers.length;
			for(var iLyr=0; iLyr<cntLayers; iLyr++) {
				this._layers[iLyr].update(this._coordMapper, mouseAction, offsetX, offsetY);
			}

			this._labelDrawer.update(this._coordMapper, mouseAction, offsetX, offsetY);
		},
		
		allLayersConnectionCompleted: function() {
			var cntLayers = this._layers.length;
			
			for(var iLyr=0; iLyr<cntLayers; iLyr++) {
				if(!this._layers[iLyr].conneted()) return false;
			}		
			
			return true;
		}
	}
});