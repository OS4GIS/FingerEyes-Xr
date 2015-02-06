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
	    if (typeof (div) == 'object') {
	        this._div = div;
	    } else {
	        this._div = document.getElementById(div);
	    }

		this._options = options;
			
		var mapWidth = this._div.clientWidth;
		var mapHeight = this._div.clientHeight;
	
		this._div.style.position = "relative";

		this._div.style.backgroundImage = "url('http://www.geoservice.co.kr/geoservice.png')";

		this._coordMapper = new Xr.CoordMapper(mapWidth, mapHeight);
		this._coordMapper.DPI(72);
		
		this._labelDrawer = new Xr.label.LabelDrawer();
		this._editManager = new Xr.managers.EditManager(this);
		this._userControlManager = new Xr.managers.UserControlManager(this);
		this._layerManager = new Xr.managers.LayerManager(this._div, this._coordMapper,
            this._labelDrawer, this._editManager, this._userControlManager);
		
		//this._mouseMovedTime = 0;

		this._div.map = this;

		this._div.tabIndex = "0"; // Key Input Event for Chrome

		this._userMode = Xr.UserModeEnum.VIEW;

		window.addEventListener("resize", this._resize);
		this._div.addEventListener("mousedown", this._mouseDownEvent);
		this._div.addEventListener("mousemove", this._mouseMoveEvent);
		this._div.addEventListener("mouseup", this._mouseUpEvent);
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
	    userMode: function (/* optional Xr.UserModeEnum */ v) {
	        if (arguments.length == 0) {
	            return this._userMode;
	        } else {
	            this._userMode = v;

	            if (v == Xr.UserModeEnum.VIEW) {
	                this.edit().cancelSketch();
	            }
	        }
	    },

	    _resize: function (e) {
	        var newWidth = this.map.container().clientWidth;
	        var newHeight = this.map.container().clientHeight;

	        this.map.resize(newWidth, newHeight);
	        this.map.update();
	    },

	    _mouseWheel: function(e) {
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

            if (this.map._userMode == Xr.UserModeEnum.EDIT) {
	            this.map._editManager.keyDown(e);
	        }
	    },

	    _keyPressEvent: function (e) {
	        if (this.map._userMode == Xr.UserModeEnum.EDIT) {
	            this.map._editManager.keyPress(e);
	        }
	    }, 

	    _keyUpEvent: function (e) {
	        if (this.map._userMode == Xr.UserModeEnum.EDIT) {
	            this.map._editManager.keyUp(e);
	        }
	    },

	    _mouseDownEvent: function (e) {
		    Xr.UserState.mouseDown = true;

		    var offsetXY = Xr.OperationHelper.offsetXY(e);
		    Xr.UserState.mouseDownPt.x = offsetXY.x; 
		    Xr.UserState.mouseDownPt.y = offsetXY.y;

		    Xr.UserState.mouseDownAndMovePt.x = offsetXY.x;
		    Xr.UserState.mouseDownAndMovePt.y = offsetXY.y;

		    this.map._div.focus(); // for keyboard events

			if (this.map._div.setCapture) this.map._div.setCapture();

			this._bMapPanning = true;
			if (this.map._userMode == Xr.UserModeEnum.EDIT) {
			    var sketch = this.map._editManager.currentSketch();
			    if (sketch && sketch.isNew() || e.ctrlKey) {
			        this.map._editManager.mouseDown(e);
			        this._bMapPanning = false;
			    } else {
			        this._bMapPanning = !this.map._editManager.mouseDown(e);
			    }
			} else if (this.map._userMode == Xr.UserModeEnum.VIEW) {
			    this.map.layers().update(Xr.MouseActionEnum.MOUSE_DOWN, 0 ,0);
			}

			this.map._userControlManager.mouseDown(e);
		},
		
		_mouseMoveEvent: function (e) {
		    if (Xr.UserState.mouseDown) {
		        var offsetXY = Xr.OperationHelper.offsetXY(e);
			    var deltaX = offsetXY.x - Xr.UserState.mouseDownAndMovePt.x;
			    var deltaY = offsetXY.y - Xr.UserState.mouseDownAndMovePt.y;

			    if (this._bMapPanning || this.map._userMode == Xr.UserModeEnum.VIEW) {
				    this.map.coordMapper().translate(deltaX, deltaY);
				    this.map.layers().update(Xr.MouseActionEnum.MOUSE_DRAG,
                        offsetXY.x - Xr.UserState.mouseDownPt.x, offsetXY.y - Xr.UserState.mouseDownPt.y);

				    this.map._userControlManager.mouseMove(e);
				}
			}

		    if (this.map._userMode == Xr.UserModeEnum.EDIT) {
		        if (this._bMapPanning) {
		            this.map._editManager.mouseMoveOnPanningMode(e);
		        } else {
		            this.map._editManager.mouseMove(e);
		        }
			}

			if (Xr.UserState.mouseDown) {
			    var offsetXY = Xr.OperationHelper.offsetXY(e);
			    Xr.UserState.mouseDownAndMovePt.x = offsetXY.x;
			    Xr.UserState.mouseDownAndMovePt.y = offsetXY.y;
			}
		},

		_mouseUpEvent: function(e) {
            if(Xr.UserState.mouseDown) {
                var offsetXY = Xr.OperationHelper.offsetXY(e);

                Xr.UserState.mouseDown = false;
				if (this.map._div.releaseCapture) this.map._div.releaseCapture();

				if (!this._bMapPanning && this.map._userMode == Xr.UserModeEnum.EDIT) {
				    this.map._editManager.mouseUp(e);
				} else {
				    if (Xr.UserState.mouseDownPt.x != offsetXY.x || Xr.UserState.mouseDownPt.y != offsetXY.y) {
				        this.map.update();// layers().update(Xr.MouseActionEnum.MOUSE_UP);
				    } else {
				        //console.log("Not Update");
				    }
				}

				this.map._userControlManager.mouseUp(e);
				this._bMapPanning = false;
            }
		},

		_mouseClickEvent: function (e) {
		    var offsetXY = Xr.OperationHelper.offsetXY(e);
		    if (Xr.UserState.mouseDownPt.x == offsetXY.x && Xr.UserState.mouseDownPt.y == offsetXY.y) {
		        var mapCoord = this.map.coordMapper().V2W(offsetXY.x, offsetXY.y);
		        var newEvt = Xr.Events.create(Xr.Events.MapClick,
                    {
                        mapX: mapCoord.x,
                        mapY: mapCoord.y,
                        viewX: offsetXY.x,
                        viewY: offsetXY.y,
                        ctrlKey: e.ctrlKey
                    }
                );

		        Xr.Events.fire(this.map.container(), newEvt);
		    }

		    if (this.map._userMode == Xr.UserModeEnum.EDIT) {
		        this.map._editManager.click(e);
		    }

		    this.map._userControlManager.click(e);
		},

		_mouseDblClickEvent: function (e) {
		    if (this.map._userMode == Xr.UserModeEnum.EDIT) {
		        this.map._editManager.dblClick(e);
		    }

		    this.map._userControlManager.dblClick(e);
		},

		_touchStartEvent: function (e) {
		    e.preventDefault();

		    if (e.touches.length > 0) {
		        //this._mouseMovedTime = (new Date()).getTime();

		        var touchobj = e.touches[0]

		        Xr.UserState.mouseDown = true;

		        Xr.UserState.mouseDownPt.x = touchobj.offsetX;
		        Xr.UserState.mouseDownPt.y = touchobj.offsetx;

		        Xr.UserState.mouseDownAndMovePt.x = touchobj.offsetX;
		        Xr.UserState.mouseDownAndMovePt.y = touchobj.offsetY;
		    }
		},

		_touchMoveEvent: function (e) {
		    e.preventDefault();

		    if (e.changedTouches.length > 0 && Xr.UserState.mouseDown) {
		        var touchobj = e.touches[0]

		        var deltaX = touchobj.clientX - Xr.UserState.mouseDownAndMovePt.x;
		        var deltaY = touchobj.clientY - Xr.UserState.mouseDownAndMovePt.y;

		        //var thisTime = (new Date()).getTime();
		        this.map.getCoordMapper().translate(deltaX, deltaY);
		        //if ((thisTime - this._mouseMovedTime) > 50) {
		        this.map.getLayerManager().update(Xr.MouseActionEnum.MOUSE_DRAG,
                    touchobj.clientX - Xr.UserState.mouseDownPt.x, touchobj.clientY - Xr.UserState.mouseDownPt.y);
		        //    this._mouseMovedTime = thisTime;
		        //}

		        Xr.UserState.mouseDownAndMovePt.x = touchobj.clientX;
		        Xr.UserState.mouseDownAndMovePt.y = touchobj.clientY;
		    }
		},

		_touchEndEvent: function (e) {
		    e.preventDefault();

		    if (Xr.UserState.mouseDown) {
		        Xr.UserState.mouseDown = false;
		        this.map.layers().update(Xr.MouseActionEnum.MOUSE_UP);
		    }
		},

		container: function() {
		    return this._div;
		},

		layers: function (/* optional string */ layerName) {
		    if (arguments.length == 0) {
		        return this._layerManager;
		    } else {
		        return this._layerManager.layer(layerName);
		    }
		},

		edit: function() {
		    return this._editManager;
		},

		userControls: function (/* optional string */ controlName) {
		    if (arguments.length == 0) {
		        return this._userControlManager;
		    } else {
		        return this._userControlManager.control(controlName);
		    }
		},

		coordMapper: function() {
			return this._coordMapper;
		},
		
		update: function () {
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

		    this.layers().update();
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
			} else {
				that._allLayersReadyTimerId = setTimeout(that._allLayersReadyEvent, 500, that);
			}
		},

		addEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
		    this._div.addEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
		},

		removeEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
		    this._div.removeEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
		}
	}
});


