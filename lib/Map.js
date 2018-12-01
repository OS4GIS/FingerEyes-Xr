/**  
 * @classdesc 지도 클래스입니다. 
 * @class
 * @param {DIV} div - 지도가 표현될 HTML의 DIV 요소 또는 DIV의 id 값
 * @param {Object} options - 지도를 생성할 때 필요한 옵션값
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.Map = Xr.Class({
	name: "Map",

	construct: function (div, options) {
        if (typeof div === 'object') {
            this._div = div;
        } else {
             this._div = document.getElementById(div);
        }

		this._options = options;
			
		var mapWidth = this._div.clientWidth;
		var mapHeight = this._div.clientHeight;

        // Map에 대한 div가 숨김일때 그 크기가 0으로 인식됨에 따라 추가한 코드
        if (isNaN(mapWidth) || mapWidth <= 0) {
            mapWidth = 1;
        }
        
        if (isNaN(mapHeight) || mapHeight <= 0) {
            mapHeight = 1;
        }
        // ---------------------------------------------------------------

        this._div.style.overflow = "hidden";
        this._div.style.userSelect = "none";

        this._div.style.backgroundImage = "url('" + __fingerEyes_Xr_background_image_url + "')";
        this._div.style.backgroundSize = "220px 220px";

		this._coordMapper = new Xr.CoordMapper(mapWidth, mapHeight);
		this._coordMapper.DPI(72);
		
		this._labelDrawer = new Xr.label.LabelDrawer();
		this._editManager = new Xr.managers.EditManager(this);
		this._userControlManager = new Xr.managers.UserControlManager(this);
		this._layerManager = new Xr.managers.LayerManager(this._div, this._coordMapper,
            this._labelDrawer, this._editManager, this._userControlManager);
		
		//this._mouseMovedTime = 0;

		this._div.map = this;

		this._div.tabIndex = "0"; // Key Input Event for Chrome, Is need ?

        this._userMode = Xr.UserModeEnum.VIEW;
        this._bMapPanning = false;

		//window.addEventListener("resize", this._resize);

        this._div.addEventListener("mousedown", this._mouseDownEvent);
        this._div.addEventListener("mousemove", this._mouseMoveEvent);
        document.addEventListener("mousemove", this._mouseMoveEventOnDocument(this));

        //this._div.addEventListener("mouseup", this._mouseUpEvent);
        document.addEventListener("mouseup", this._mouseUpEventOnDocument(this));

		this._div.addEventListener("touchstart", this._touchStartEvent);
		this._div.addEventListener("touchmove", this._touchMoveEvent);
        this._div.addEventListener("touchend", this._touchEndEvent);

		this._div.addEventListener("click", this._mouseClickEvent);
		this._div.addEventListener("dblclick", this._mouseDblClickEvent);
		this._div.addEventListener("keydown", this._keyDownEvent);
		this._div.addEventListener("keypress", this._keyPressEvent);
		this._div.addEventListener("keyup", this._keyUpEvent);

		this._div.addEventListener('mousewheel', this._mouseWheel);
        this._div.addEventListener('DOMMouseScroll', this._mouseWheel);
	},

	methods: {
	    EPSG: function (/* optional int */ epsgCode) {
	        var lm = this.layers();
	        var cntLayers = lm.count();

	        if (arguments.length == 0) {
	            for (var iLyr = 0; iLyr < cntLayers; iLyr++) {
	                lyr = lm.layerByIndex(iLyr);

	                if (lyr instanceof Xr.layers.ShapeMapLayer) {
	                    return lyr.EPSG();
	                }
	            }
	        } else {
	            for (var iLyr = 0; iLyr < cntLayers; iLyr++) {
	                lyr = lm.layerByIndex(iLyr);

	                if (lyr instanceof Xr.layers.ShapeMapLayer) {
	                    lyr.reset();
	                    lyr.EPSG(epsgCode);
	                }
	            }
	        }
	    },

	    userMode: function (/* optional Xr.UserModeEnum */ v) {
	        if (arguments.length == 0) {
	            return this._userMode;
	        } else {
	            this._userMode = v;

	            if (v == Xr.UserModeEnum.VIEW || v == Xr.UserModeEnum.NONE) {
	                this.edit().cancelSketch();
	            }

	            return this;
	        }
	    },

        /*
	    _resize: function (e) {
	        if (!this.map) return;

	        var newWidth = this.map.container().clientWidth;
	        var newHeight = this.map.container().clientHeight;

	        this.map.resize(newWidth, newHeight);
	        this.map.update();
	    },
        */

	    _mouseWheel: function (e) {
	        if (this.map._userMode == Xr.UserModeEnum.NONE) {
	            return;
	        }

	        var delta = 0;

	        /* For IE */
	        if (!e) e = window.event;
            
	        if (e.wheelDelta) delta = e.wheelDelta / 120; /* IE/Chrome/Opera */
            else if (e.detail) delta = -e.detail / 3; /* Mozilla case */

	        var ctl = this.map.userControls().zoomScaleControl();
	        if (ctl) {
	            var lvl = ctl.scaleLevel();
	            if (delta > 0) { // Zoom In
	                this.map.userControls("zlc").scaleLevel(--lvl);
	            } else { // Zoom Out
	                this.map.userControls("zlc").scaleLevel(++lvl);
	            }
	        }

	        e.preventDefault();
        },

	    _keyDownEvent: function (e) {
	        var map = this.map;
	        var um = map._userMode; 
	        if (um == Xr.UserModeEnum.NONE) {
	            return;
	        }

            /*
	        var keyCode = e.keyCode;
	        var coordMapper = this.map.coordMapper();

	        if (keyCode == 39) { // Left
	            coordMapper.translate(-256, 0);
	            map.update();
	        } else if (keyCode == 37) { // Right
	            coordMapper.translate(256, 0);
	            map.update();
	        } else if (keyCode == 40) { // Down
	            coordMapper.translate(0, -256);
	            map.update();
	        } else if (keyCode == 38) { // Up
	            coordMapper.translate(0, 256);
	            map.update();
	        }
            */

            if (um == Xr.UserModeEnum.EDIT) {
	            map._editManager.keyDown(e);
	        }
	    },

	    _keyPressEvent: function (e) {
	        var map = this.map;
	        var um = map._userMode;

	        if (um == Xr.UserModeEnum.NONE) {
	            return;
	        }

	        if (um == Xr.UserModeEnum.EDIT) {
	            map._editManager.keyPress(e);
            }
	    }, 

	    _keyUpEvent: function (e) {
	        var map = this.map;
	        var um = map._userMode;

	        if (um == Xr.UserModeEnum.NONE) {
	            return;
	        }

	        if (um == Xr.UserModeEnum.EDIT) {
	            map._editManager.keyUp(e);
	        }
	    },

        _mouseDownEvent: function (e) {
            var map = this.map;
            var um = map._userMode;

            if (um === Xr.UserModeEnum.NONE) {
                return;
            }

            var coordMapper = map.coordMapper();
            var mouseState = coordMapper.mouseState;

            mouseState.bDown = true;
            mouseState.bDrag = false;

            var offsetXY = Xr.OperationHelper.offsetXY(e);
            var screenXY = Xr.OperationHelper.screenXY(e);

            // Event ->
            var mapCoord = coordMapper.V2W(offsetXY.x, offsetXY.y);
            var newEvt = Xr.Events.create(Xr.Events.MapMouseDown,
                {
                    map: map,
                    mapX: mapCoord.x,
                    mapY: mapCoord.y,
                    viewX: offsetXY.x,
                    viewY: offsetXY.y,
                    ctrlKey: e.ctrlKey
                }
            );

            Xr.Events.fire(map.container(), newEvt);
            // <-

            mouseState.downPt.x = offsetXY.x;
            mouseState.downPt.y = offsetXY.y;

            mouseState.downScreenPt.x = screenXY.x;
            mouseState.downScreenPt.y = screenXY.y;

            mouseState.downAndMovePt.x = offsetXY.x;
            mouseState.downAndMovePt.y = offsetXY.y;

            mouseState.downAndMoveScreenPt.x = screenXY.x;
            mouseState.downAndMoveScreenPt.y = screenXY.y;

            var mapDiv = map._div;

            mapDiv.focus(); // for keyboard events

			map._bMapPanning = true;
			if (um === Xr.UserModeEnum.EDIT) {
                var sketch = map._editManager.currentSketch();
                if (sketch && sketch.isNew() || e.ctrlKey) {
                    map._editManager.mouseDown(e);
                    map._bMapPanning = false;
                } else {
                    map._bMapPanning = !map._editManager.mouseDown(e);
                }
			} else if (um === Xr.UserModeEnum.VIEW) {
                map.layers().update(Xr.MouseActionEnum.MOUSE_DOWN, 0 ,0);
			}

            map._userControlManager.mouseDown(e);
		},
		
        _mouseMoveEvent: function (e) {
            var map = this.map;
            var um = map._userMode;
            
            if (map.coordMapper().mouseState.bDown) {
                map._userControlManager.enableMouse(false);
            }

            if (um === Xr.UserModeEnum.EDIT) {
                if (!map._bMapPanning) {
                    map._editManager.mouseMove(e);
                }
            }
        },

        _mouseMoveEventOnDocument: function (map) {
            return function (e) {
                var um = map._userMode;

                if (um === Xr.UserModeEnum.NONE) {
                    return;
                }

                //var offsetXY = Xr.OperationHelper.offsetXY(e);
                var screenXY = Xr.OperationHelper.screenXY(e);
                var mouseState = map.coordMapper().mouseState;

                if (mouseState.bDown) {
                    mouseState.bDrag = true;

                    var deltaX = screenXY.x - mouseState.downAndMoveScreenPt.x;
                    var deltaY = screenXY.y - mouseState.downAndMoveScreenPt.y;

                    if (map._bMapPanning || um === Xr.UserModeEnum.VIEW) {
                        map.coordMapper().translate(deltaX, deltaY);
                        map.layers().update(Xr.MouseActionEnum.MOUSE_DRAG,
                            screenXY.x - mouseState.downScreenPt.x, screenXY.y - mouseState.downScreenPt.y);

                        map._userControlManager.mouseMove(e);
                    }
                }

                if (um === Xr.UserModeEnum.EDIT) {
                    if (map._bMapPanning) {
                        map._editManager.mouseMoveOnPanningMode(e);
                    }
                }

                if (mouseState.bDown) {
                    mouseState.downAndMoveScreenPt.x = screenXY.x;
                    mouseState.downAndMoveScreenPt.y = screenXY.y;
                }
            };
        },

        isMapPanning: function () {
            return this._bMapPanning;
        },

        _mouseUpEvent: function (e) { },

        _mouseUpEventOnDocument: function (map) {
            return function (e) {
                var um = map._userMode;

                if (um === Xr.UserModeEnum.NONE) {
                    return;
                }

                var mouseState = map.coordMapper().mouseState;

                if (mouseState.bDown) {
                    var offsetXY = Xr.OperationHelper.offsetXY(e);
                    var screenXY = Xr.OperationHelper.screenXY(e);

                    mouseState.bDown = false;

                    if (!map._bMapPanning && map._userMode === Xr.UserModeEnum.EDIT) {
                        map._editManager.mouseUp(e);
                    } else {
                        if (mouseState.downScreenPt.x !== screenXY.x || mouseState.downScreenPt.y !== screenXY.y) {
                            map.update(mouseState.bDrag ? Xr.MouseActionEnum.MOUSE_DRAG_END : Xr.MouseActionEnum.MOUSE_UP,
                                screenXY.x - mouseState.downScreenPt.x, screenXY.y - mouseState.downScreenPt.y);
                        } else {
                            //console.log("Not Update");
                        }
                    }

                    map._userControlManager.mouseUp(e);
                    map._bMapPanning = false;
                    //Xr.UserState.mouseDrag = false;
                    mouseState.bDrag = false;

                    map._userControlManager.enableMouse(true);
                }
            };
        },

        _mouseClickEvent: function (e) {
            var map = this.map;
            var um = map._userMode;
            var coordMapper = map.coordMapper();
            var mouseState = coordMapper.mouseState;

            if (um === Xr.UserModeEnum.NONE) {
                return;
            }

            var offsetXY = Xr.OperationHelper.offsetXY(e);
            //if (Xr.UserState.mouseDownPt.x == offsetXY.x && Xr.UserState.mouseDownPt.y == offsetXY.y) {
            if (mouseState.downPt.x === offsetXY.x && mouseState.downPt.y === offsetXY.y) {
                var mapCoord = this.map.coordMapper().V2W(offsetXY.x, offsetXY.y);
                var newEvt = Xr.Events.create(Xr.Events.MapClick,
                    {
                        map: map,
                        mapX: mapCoord.x,
                        mapY: mapCoord.y,
                        viewX: offsetXY.x,
                        viewY: offsetXY.y,
                        ctrlKey: e.ctrlKey
                    }
                );

                Xr.Events.fire(this.map.container(), newEvt);
            }

            if (map._userMode === Xr.UserModeEnum.EDIT) {
                map._editManager.click(e);
            }

            map._userControlManager.click(e);
		},

        _mouseDblClickEvent: function (e) {
            var map = this.map;
             var um = map._userMode;

            if (um === Xr.UserModeEnum.NONE) {
                return;
            } 

            if (um === Xr.UserModeEnum.EDIT) {
                map._editManager.dblClick(e);
            } else if(um === Xr.UserModeEnum.VIEW) {
                /*
                var cm = this.map.coordMapper();
		        var offsetXY = Xr.OperationHelper.offsetXY(e);
		        var mapCoord = cm.V2W(offsetXY.x, offsetXY.y);
		        
		        cm.moveTo(mapCoord.x, mapCoord.y);
		        map.update();
                */
            }

            map._userControlManager.dblClick(e);
		},

        _touchStartEvent: function (e) {
	        var map = this.map;
            var um = map._userMode;
            var mouseState = map.coordMapper().mouseState;

	        if (um == Xr.UserModeEnum.NONE) {
	            return;
	        }

		    e.preventDefault();

		    if (e.touches.length > 0) {
		        //this._mouseMovedTime = (new Date()).getTime();

                var touchobj = e.touches[0];

		        //Xr.UserState.mouseDown = true;
                mouseState.bDown = true;

                var offsetXY = Xr.OperationHelper.offsetXY(touchobj);

                //Xr.UserState.mouseDownPt.x = offsetXY.x;
                mouseState.downPt.x = offsetXY.x;
                //Xr.UserState.mouseDownPt.y = offsetXY.y;
                mouseState.downPt.y = offsetXY.y;

                //Xr.UserState.mouseDownAndMovePt.x = offsetXY.x;
                mouseDownAndMovePt.x = offsetXY.x;
                //Xr.UserState.mouseDownAndMovePt.y = offsetXY.y;
                mouseDownAndMovePt.y = offsetXY.y;
		    }
		},

        _touchMoveEvent: function (e) {
            var map = this.map;
            var um = map._userMode;
            var mouseState = map.coordMapper().mouseState;

            if (um === Xr.UserModeEnum.NONE) {
                return;
            }

            e.preventDefault();

            //if (e.changedTouches.length > 0 && Xr.UserState.mouseDown) {
            if (e.changedTouches.length > 0 && mouseState.bDown) {
                var touchobj = e.touches[0];

                var offsetXY = Xr.OperationHelper.offsetXY(touchobj);

                var deltaX = offsetXY.x - mouseState.downAndMovePt.x;
                var deltaY = offsetXY.y - mouseState.downAndMovePt.y;

                map.coordMapper().translate(deltaX, deltaY);
                //map.layers().update(Xr.MouseActionEnum.MOUSE_DRAG,
                //    offsetXY.x - Xr.UserState.mouseDownPt.x, offsetXY.y - Xr.UserState.mouseDownPt.y);
                map.layers().update(Xr.MouseActionEnum.MOUSE_DRAG,
                    offsetXY.x - mouseState.downPt.x, offsetXY.y - mouseState.downPt.y);

                map._userControlManager.mouseMove(e);

                //Xr.UserState.mouseDownAndMovePt.x = offsetXY.x;
                mouseState.downAndMovePt.x = offsetXY.x;
                //Xr.UserState.mouseDownAndMovePt.y = offsetXY.y;
                mouseState.downAndMovePt.y = offsetXY.y;
            }
		},

        _touchEndEvent: function (e) {
            var map = this.map;
            var um = map._userMode;
            var mouseState = map.coordMapper().mouseState;

            if (um === Xr.UserModeEnum.NONE) {
                return;
            }

            e.preventDefault();

            //if (Xr.UserState.mouseDown) {
            if (mouseState.bDown) {
                //Xr.UserState.mouseDown = false;
                mouseState.bDown = false;
                map.layers().update(Xr.MouseActionEnum.MOUSE_UP);
            }
		},

		container: function() {
            return this._div;
		},

		layers: function (/* optional string */ layerName) {
            if (arguments.length === 0) {
                return this._layerManager;
            } else {
                return this._layerManager.layer(layerName);
            }
		},

		edit: function() {
            return this._editManager;
		},

		userControls: function (/* optional string */ controlName) {
            if (arguments.length === 0) {
                return this._userControlManager;
            } else {
                return this._userControlManager.control(controlName);
            }
		},

		coordMapper: function() {
			return this._coordMapper;
		},

        updateLayer: function (/* String */ layerId) {
            var lyr = this.layers(layerId);

            if (lyr) {
                var cm = this.coordMapper();
                this._labelDrawer.clean(layerId, true);

                if (lyr.needRendering(cm.mapScale())) {
                    lyr.container().style.visibility = 'visible';
                }

                lyr.update(cm);
            }
        },

        mapUpdatedTime: function () {
            return this._mapUpdatedTime;
        },

        update: function (/*optinal MouseActionEnum */ mouseAction, /* option int */ offsetX, /* option int */ offsetY) {
            this._mapUpdatedTime = (new Date()).getTime();

            var mapScale = this.coordMapper().mapScale();
            if (this._oldMapScale == undefined || this._oldMapScale != mapScale) {
                var e = Xr.Events.create(Xr.Events.MapScaleChanged, { mapScale: mapScale });
                Xr.Events.fire(this.container(), e);
            }

            var viewportMBR = this.coordMapper().viewportMBR().clone();
            if (this._oldViewportMBR == undefined || !this._oldViewportMBR.same(viewportMBR)) {
                var e = Xr.Events.create(Xr.Events.MapViewChanged, { viewport: viewportMBR });
                Xr.Events.fire(this.container(), e);
            }

            //console.log("[Map::update] mouseAction=" + mouseAction + " offsetX=" + offsetX + " offsetY=" + offsetY);

            this.layers().update(mouseAction, offsetX, offsetY);
            this.edit().update();

            this._oldMapScale = mapScale;
           this._oldViewportMBR = viewportMBR;
		},
		
		onLayersAllReady: function (callback) {
			this._allLayersReadyCallback = callback;
			this._allLayersReadyTimerId = setTimeout(this._allLayersReadyEvent, 500, this);
		},
		
		resize: function (newWidth, newHeight) {
            this._coordMapper.resize(newWidth, newHeight);
		},

		_allLayersReadyEvent: function(that) {
			clearTimeout(that._allLayersReadyTimerId);

			if(that.layers().allLayersConnectionCompleted()) {
				that._allLayersReadyCallback();	
				delete that._allLayersReadyCallback;
                delete that._allLayersReadyTimerId;

                //that.userControls().update();
			} else {
				that._allLayersReadyTimerId = setTimeout(that._allLayersReadyEvent, 200, that);
			}
		},

		addEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
            this._div.addEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
		},

		removeEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
            this._div.removeEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
        },

        drawOnCanvas: function (/* canvas DOM */ canvas) {
            var layers = this.layers();
            var cntLayers = layers.count();

            for (var i = 0; i < cntLayers; i++) {
                layers.layerByIndex(i).drawOnCanvas(canvas);
            }

            this._labelDrawer.drawOnCanvas(canvas);
        }
	}
});


