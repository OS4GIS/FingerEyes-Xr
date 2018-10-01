/**  
 * @desc ui 네임스페이스입니다. 축척바, 인덱스맵, 줌레벨컨트롤 또는 사용자 정의 UI에 대한 클래스를 담고 있습니다.
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.ui = Xr.ui || {};

/**  
 * @classdesc 인덱스(Index Map) UI 컨트롤에 대한 클래스입니다.
 * @class
 * @param {String} name - UI 컨트롤에 대한 식별자로써 고유해야 합니다.
 * @param {Xr.Map} map - UI 컨트롤과 상호작용을 하는 지도 객체
 * @param {String} indexMapUrl - 인덱스맵에 표시되는 지도에 대한 연결 문자열에 대한 URL 입니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.ui.IndexMapControl = Xr.Class({
    name: "IndexMapControl",
	extend: Xr.ui.UserControl,
	requires: [Xr.ui.IUserControl, Xr.IMouseInteraction],

	construct: function (/* String */ name, /* Map */ map, /* string */ indexMapUrl) {
	    Xr.ui.UserControl.call(this, name, map);

	    this._indexMapUrl = indexMapUrl;

	    this._indexMapDiv = document.createElement("div");
	    this._indexMapDiv.style.position = "absolute";
	    this._indexMapDiv.style.top = "0px";
	    this._indexMapDiv.style.left = "0px";
	    this._indexMapDiv.style.border = "none";
	    this._indexMapDiv.style.width = "100%";
	    this._indexMapDiv.style.height = "100%";
	    //this._indexMapDiv.style.overflow = "visible";
	    //this._indexMapDiv.style.border = "1px solid red";
	    //this._indexMapDiv.style.setProperty("pointer-events", "none");

	    this.container().appendChild(this._indexMapDiv);
	    this.container().style.bottom = 10 + "px";
	    this.container().style.right = 10 + "px";

	    this.container().style.width = 250 + "px";
	    this.container().style.height = 250 + "px";

	    //this.container().style.border = "1px solid green";

        this._indexMap = new Xr.Map(this._indexMapDiv, {});
        this._indexMap.userControls().enableMouse(false);
	    this._indexMapDiv.style.backgroundImage = "";
	    this._indexMap.userMode(Xr.UserModeEnum.NONE);

	    this._markerDiv = this.createMarkerDiv();
	    this.container().appendChild(this._markerDiv);

        this._mouseDown = false;
        this._deltaX = 0;
        this._deltaY = 0;
	    //this._mouseDownPt = new Xr.PointD();
	    this._bReadyLayer = false;

        /*
	    this.__onContainerMouseDown = function (e) {
	        e.stopPropagation();
	        e.preventDefault();
	    };

	    this.container().addEventListener("mousedown", this.__onContainerMouseDown);
        */
	},
 	
    methods: {
	    /* DIV */ createMarkerDiv: function() {
	        var div = document.createElement("div");
	        var sty = div.style;
            sty.position = "absolute";

	        sty.top = 0;
	        sty.left = 0;
	        sty.width = 10 + "px";
	        sty.height = 10 + "px";
	        sty.opacity = 0.5;

	        var that = this;

            /*
	        this.__onMarkerMouseDown = function (e) {
	            if (!that._mouseDown) {
	                e.stopPropagation();

	                if (div.setCapture) div.setCapture();

	                that._mouseDownPt.set(e.clientX, e.clientY);
	                that._mouseDown = true;
	            }
	        };
            */

            this.__onMarkerMouseDown = function (e) {
                if (!that._mouseDown) {
                    e.stopPropagation();

                    var style = window.getComputedStyle(div, null);
                    that._deltaX = e.clientX - parseFloat(style.getPropertyValue("left"));
                    that._deltaY = e.clientY - parseFloat(style.getPropertyValue("top"));

                    that._mouseDown = true;

                    document.addEventListener("mousemove", that.__onMarkerMouseMove);
                    document.addEventListener("mouseup", that.__onMarkerMouseUp);
                }
            };

            /*
	        this.__onMarkerMouseMove = function (e) {
	            e.stopPropagation();

	            if (that._mouseDown) {
	                var offsetX = e.clientX - that._mouseDownPt.x;
	                var offsetY = e.clientY - that._mouseDownPt.y;

	                div.style.left = (Xr.OperationHelper.valueFromPx(div.style.left) + offsetX) + "px";
	                div.style.top = (Xr.OperationHelper.valueFromPx(div.style.top) + offsetY) + "px";

	                that._mouseDownPt.set(e.clientX, e.clientY);
	            }
	        };
            */

            this.__onMarkerMouseMove = function (e) {
                e.stopPropagation();

                if (that._mouseDown) {
                    div.style.left = (e.clientX - that._deltaX) + "px";
                    div.style.top = (e.clientY - that._deltaY) + "px";
                }
            };

            /*
	        this.__onMarkerMouseUp = function (e) {
	            if (that._mouseDown) {
	                e.stopPropagation();

	                that._mouseDown = false;
	                if (div.releaseCapture) div.releaseCapture();

	                var left = Xr.OperationHelper.valueFromPx(div.style.left);
	                var top = Xr.OperationHelper.valueFromPx(div.style.top);
	                var width = Xr.OperationHelper.valueFromPx(div.style.width);
	                var height = Xr.OperationHelper.valueFromPx(div.style.height);
	                var cx = left + width / 2.0;
	                var cy = top + height / 2.0;
	                var cm = that._indexMap.coordMapper();
	                var cp = cm.V2W(cx, cy);

	                that.map().coordMapper().moveTo(cp.x, cp.y);
	                that.map().update();
	            }
	        };
            */

            this.__onMarkerMouseUp = function (e) {
                if (that._mouseDown) {
                    e.stopPropagation();

                    that._mouseDown = false;

                    var left = Xr.OperationHelper.valueFromPx(div.style.left);
                    var top = Xr.OperationHelper.valueFromPx(div.style.top);
                    var width = Xr.OperationHelper.valueFromPx(div.style.width);
                    var height = Xr.OperationHelper.valueFromPx(div.style.height);
                    var cx = left + width / 2.0;
                    var cy = top + height / 2.0;
                    var cm = that._indexMap.coordMapper();
                    var cp = cm.V2W(cx, cy);

                    that.map().coordMapper().moveTo(cp.x, cp.y);
                    that.map().update();

                    document.removeEventListener("mousemove", that.__onMarkerMouseMove);
                    document.removeEventListener("mouseup", that.__onMarkerMouseUp);
                }
            };

	        div.addEventListener("mousedown", this.__onMarkerMouseDown);
	        //div.addEventListener("mousemove", this.__onMarkerMouseMove);
	        //div.addEventListener("mouseup", this.__onMarkerMouseUp);

	        return div;
	    },

	    update: function () {
	        if (!this._bReadyLayer) return;

	        var div = this._markerDiv;
	        var mbr = this.map().coordMapper().viewportMBR();
	        var cm = this._indexMap.coordMapper();
	        var ltw = new Xr.PointD(mbr.minX, mbr.maxY);
	        var rbw = new Xr.PointD(mbr.maxX, mbr.minY);
	        var ltv = cm.W2V(ltw);
	        var rbv = cm.W2V(rbw);
	        var w = rbv.x - ltv.x;
	        var h = rbv.y - ltv.y;

	        // Remove all of child
            /*
	        var childNodes = div.childNodes;
	        var cntChildNodes = childNodes.length;
	        for (var i = 0; i < cntChildNodes; i++) {
	            div.removeChild(childNodes  [0]);
	        }
            */
	        while (div.lastChild) {
	            div.removeChild(div.lastChild);
	        }
	        // .

	        if (w < 4 || h < 4) {
	            div.style.left = (ltv.x - 5) + "px";
                div.style.top = (ltv.y - 5) + "px";
                div.style.width = (w + 10) + "px";
                div.style.height = (h + 10) + "px";

                div.style.border = "1px solid #e74c3c";
                //div.style.backgroundColor = "#e74c3c"

	            var svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
	            svg.style.position = "absolute";
	            svg.style.top = "0";
	            svg.style.left = "0";
	            svg.style.overflow = "visible";
                svg.style.setProperty("pointer-events", "none");
                svg.style.setProperty("shape-rendering", "crispEdges");
	            div.appendChild(svg);

	            var cx = w / 2.0 + 5;
	            var cy = h / 2.0 + 5;

	            var line1 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	            line1.setAttribute("x1", cx - 30);
	            line1.setAttribute("y1", cy);
	            line1.setAttribute("x2", cx + 30);
	            line1.setAttribute("y2", cy);
                line1.setAttribute("stroke", "#e74c3c");
	            line1.setAttribute("stroke-width", "1px");
	            svg.appendChild(line1);

	            var line2 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	            line2.setAttribute("x1", cx);
	            line2.setAttribute("y1", cy - 30);
	            line2.setAttribute("x2", cx);
	            line2.setAttribute("y2", cy + 30);
                line2.setAttribute("stroke", "#e74c3c");
	            line2.setAttribute("stroke-width", "1px");
	            svg.appendChild(line2);
	        } else {
                div.style.left = ltv.x + "px";
                div.style.top = ltv.y + "px";
                div.style.width = w + "px";
                div.style.height = h + "px";

                div.style.border = "1px solid #2980b9";
                div.style.backgroundColor = "#3498db";
            }
	    },

	    size: function(/* int */ w, /* int */ h) {
	        this.container().style.width = w + "px";
	        this.container().style.height = h + "px";
	    },

	    /* int */ width: function() {
	        var s = this.container().style.width;
	        var idx = s.indexOf("px");

	        if (idx > -1) {
	            s = s.substring(0, idx);
	            return parseInt(s);
	        }

	        return -1;
	    },

	    /* int */ height: function() {
	        var s = this.container().style.height;
	        var idx = s.indexOf("px");

	        if (idx > -1) {
	            s = s.substring(0, idx);
	            return parseInt(s);
	        }

	        return -1;
	    },

	    prepare: function () {
	        var that = this;
	        that.__onMapScaleChanged = function (e) {
	            that.update();
	        };

	        that.__onMapViewChanged = function (e) {
	            that.update();
	        },

	        this._map.addEventListener(Xr.Events.MapScaleChanged, that.__onMapScaleChanged);
	        this._map.addEventListener(Xr.Events.MapViewChanged, that.__onMapViewChanged);

	        var lm = this._indexMap.layers();
	        lm.removeAll();

	        // Stroke Layer
	        var indexLyrForStroke = new Xr.layers.ShapeMapLayer("stroke", { url: this._indexMapUrl });
	        var themeForStroke = indexLyrForStroke.theme();
	        var penForStroke = themeForStroke.penSymbol();
	        var brushForStroke = themeForStroke.brushSymbol();

            penForStroke.color('#ffffff');
	        penForStroke.width(6);

            brushForStroke.color('#ffffff');
	        brushForStroke.opacity(0.0);

	        lm.add(indexLyrForStroke);
            
            // This Layer
	        var indexLyr = new Xr.layers.ShapeMapLayer("layer", { url: this._indexMapUrl });
	        var theme = indexLyr.theme();
	        var pen = theme.penSymbol();
	        var brush = theme.brushSymbol();

	        this._indexMap.resize(this._indexMapDiv.clientWidth, this._indexMapDiv.clientHeight);

            pen.color('#95a5a6');
	        pen.width(1);
            brush.color('#ecf0f1');
	        brush.opacity(1);

	        lm.add(indexLyr);

            this._indexMap.onLayersAllReady(function () {
	            var mbr = indexLyr.MBR();
	            var cm = that._indexMap.coordMapper();

                cm.zoomByMBR(mbr);

                var mapScale = cm.mapScale();

	            cm.mapScale(mapScale * 1.2);
	            that._indexMap.update();

                that._bReadyLayer = true;

                that.update();
	        });
	    },

	    release: function () {
	        if (this.__onMapScaleChanged) {
	            this._map.removeEventListener(Xr.Events.MapScaleChanged, this.__onMapScaleChanged);
	            delete this.__onMapScaleChanged;
	        }

	        if (this.__onMapViewChanged) {
	            this._map.removeEventListener(Xr.Events.MapViewChanged, this.__onMapViewChanged);
	            delete this.__onMapViewChanged;
	        }

	        if (this._markerDiv.__onMarkerMouseDown) {
	            this._markerG.addEventListener("mousedown", this._markerDiv.__onMarkerMouseDown);
	            delete this._markerDiv.__onMarkerMouseDown;
	        }

	        if (this._markerDiv.__onMarkerMouseMove) {
	            this._markerG.addEventListener("mousemove", this._markerDiv.__onMarkerMouseMove);
	            delete this._markerDiv.__onMarkerMouseMove;
	        }

	        if (this._markerDiv.__onMarkerMouseUp) {
	            this._markerG.addEventListener("mouseup", this._markerDiv.__onMarkerMouseUp);
	            delete this._markerDiv.__onMarkerMouseUp;
	        }

	        if (this.__onContainerMouseDown) {
	            this.container().addEventListener("mousedown", this.__onContainerMouseDown);
	            delete this.__onContainerMouseDown;
	        }
	    },

	    mouseDown: function(e) {},
        mouseMove: function(e) {},
        mouseUp: function(e) {},
        click: function(e) {},
        dblClick: function (e) { },

        enableMouse: function (/* bool */ bEnable) { }
	}
});