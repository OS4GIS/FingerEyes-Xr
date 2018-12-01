Xr.managers = Xr.managers || {};

/**  
 * @classdesc 레이어를 관리하는 클래스입니다. 레이어의 추가, 삭제와 같이 레이어에 대한 제어 및 존재 여부 등에 대한 기능을 제공합니다.
 * @class
 * @param {DIV} mapDiv - 맵이 표시될 HTML DIV 요소
 * @param {Xr.label.LabelDrawer} labelDrawer - 라벨을 화면에 표출하기 위한 클래스 객체
 * @param {Xr.managers.EditManager} editManager - 편집 관리자 객체
 * @param {Xr.managers.UserControlManager} userControls - 축척바, 인덱스맵, 줌레벨컨트롤 또는 사용자 정의 UI를 관리하는 클래스 객체입니다. 
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
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
				if(this._layers[iLyr].name() === name) return true;
			}
			
			return false;
		},
	
		index: function(name) {
			var cntLayers = this._layers.length;
			
			for(var iLyr=0; iLyr<cntLayers; iLyr++) {
				if(this._layers[iLyr].name() === name) return iLyr;
			}
			
			return -1;		
		},

		layer: function(name) {
			var cntLayers = this._layers.length;
			
			for (var iLyr = 0; iLyr < cntLayers; iLyr++) {
			    var thatLayerName = this._layers[iLyr].name();
			    if (thatLayerName === name) {
			        return this._layers[iLyr];
			    }
			}
			
			return null;
		},

		layerByIndex: function (index) {
		    var cntLayers = this._layers.length;
		    if (index < 0 || index >= cntLayers) return null;

		    return this._layers[index];
		},

		add: function(layer, /* optional function */ callbackFunction) {
			if(this.exist(layer.name())) return false;

            var mapDiv = this._mapDiv;

			this._layers.push(layer);
			
            mapDiv.appendChild(layer.container());

            // 'SVG for LabelDrawer' is top.
            mapDiv.appendChild(this._labelDrawer.container());

            // Top layers is top.
            var layers = this._layers;
            var cntLayers = layers.length;

            for (var iLyr = 0; iLyr < cntLayers; iLyr++) {
                var lyr = layers[iLyr];
                if (lyr.topMost()) mapDiv.appendChild(lyr.container());
            } 
            
            // 'SVG for EditManager' is top.
            mapDiv.appendChild(this._editManager.container());

            // 'DIV for UserControlManager' is top most.
            mapDiv.appendChild(this._userControls.container());

			layer.labelDrawer(this._labelDrawer);
            layer.connect(this._coordMapper, callbackFunction);

			return true;
		},

        reset: function () {
            var layers = this._layers;
            var cntLayers = layers.length;
            var labelDrawer = this._labelDrawer;

            for (var iLyr = 0; iLyr < cntLayers; iLyr++) {
                var lyr = layers[iLyr];
                if (lyr.reset) lyr.reset();
            }

            labelDrawer.reset();
        },

		removeAll: function() {
		    var cntLayers = this.count();
		    for (var i = (cntLayers-1); i >= 0; i--) {
                var layer = this.layerByIndex(i);
                layer.release();

		        var container = layer.container();

		        this._mapDiv.removeChild(container);
		        this._layers.splice(i, 1);
            }

            var labelDrawer = this._labelDrawer;
            labelDrawer.reset();
		},

		remove: function(name) {
			var index = this.index(name);
			if(index != -1) {
                var lyr = this.layer(name);
                lyr.release();

				var container = lyr.container();
				this._mapDiv.removeChild(container);

                this._layers.splice(index, 1);

                this._labelDrawer.clean(name, true);
			}
		},

		moveToFirst: function(name) {
		    var index = this.index(name);
		    if (index != -1) {
		        var lyr = this.layer(name);
		        var container = lyr.container();

		        this._mapDiv.insertBefore(container, this._mapDiv.firstChild);

		        var oldIdx = index;
		        var newIdx = 0;

		        this._layers.splice(newIdx, 0, this._layers.splice(oldIdx, 1)[0]);
		    }
        },

        moveBefore: function (srcName, tgtName) {
            /*
            function _log(layers, title) {
                var cntLayers = layers.length;

                console.log("LIST A");
                for (var iLyr = 0; iLyr < cntLayers; iLyr++) {
                    var lyr = layers[iLyr];
                    var name = lyr.name();

                    console.log(iLyr + " : " + name);
                }       
            }
            */

            var srcIdx = this.index(srcName);
            var tgtIdx = this.index(tgtName);

            if (srcIdx != -1 && tgtIdx != -1) {
                //_log(this._layers, "BEFORE: ");

                var srcLyr = this.layer(srcName);
                var srcContainer = srcLyr.container();

                var tgtLyr = this.layer(tgtName);
                var tgtContainer = tgtLyr.container();

                this._mapDiv.insertBefore(srcContainer, tgtContainer);

                this._layers.splice(tgtIdx, 0, srcLyr);
                this._layers.splice(srcIdx < tgtIdx ? srcIdx : srcIdx + 1, 1);

                //_log(this._layers, "AFTER: ");
            }
        },

        update: function (/*optinal MouseActionEnum */ mouseAction, /* option int */ offsetX, /* option int */ offsetY) {
		    if (mouseAction == undefined) mouseAction = Xr.MouseActionEnum.NO_MOUSE;
		    if (offsetX == undefined) offsetX = 0;
		    if (offsetY == undefined) offsetY = 0;

		    //if (mouseAction == Xr.MouseActionEnum.MOUSE_UP || mouseAction == Xr.MouseActionEnum.NO_MOUSE) {
		    //    this._labelDrawer.reset();
		    //}

		    var layers = this._layers;
		    var cntLayers = layers.length;
            var cm = this._coordMapper;
            var mapScale = cm.mapScale();
            var labelDrawer = this._labelDrawer;

		    for(var iLyr=0; iLyr<cntLayers; iLyr++) {
		        var lyr = layers[iLyr];
                var style = lyr.container().style;

                if (lyr.needRendering(mapScale)) {
                    if (style.visibility != 'visible') style.visibility = 'visible';
			        lyr.update(cm, mouseAction, offsetX, offsetY);
                } else {
                    if (style.visibility != 'hidden') style.visibility = 'hidden';
                    labelDrawer.clean(lyr.name(), true);
			    }
            }            

            labelDrawer.update(cm, mouseAction, offsetX, offsetY);
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