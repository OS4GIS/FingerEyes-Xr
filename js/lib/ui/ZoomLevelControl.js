Xr.ui = Xr.ui || {};

Xr.ui.ZoomLevelControl = Xr.Class({
    name: "ZoomLevelControl",
	extend: Xr.ui.UserControl,
	requires: [Xr.ui.IUserControl, Xr.IMouseInteraction],

	construct: function (/* String */ name, /* Map */ map, /* Array */ mapScales) {
	    Xr.ui.UserControl.call(this, name, map);

	    this._mapScales = mapScales;

	    this._svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
	    this._svg.style.position = "absolute";
	    this._svg.style.top = "0px";
	    this._svg.style.left = "0px";
	    this._svg.style.overflow = "visible";
	    //this._svg.style.border = "1px solid red";

	    //this._svg.style.setProperty("pointer-events", "none");

	    this.container().appendChild(this._svg);
	    this.container().style.right = 70;
	    this.container().style.top = 10;

	    this._mouseDown = false;
	    this._mouseDownPt = new Xr.PointD();
	    this._thumbY = 0;

	    this._thumbWidth = 28;
	    this._thumbHeight = 14;

	    this._thumbDiv = this._createThumb();
	    this.container().appendChild(this._thumbDiv);
	},
 	
	methods: {
	    thumbWidth: function(/* int */ v) {
	        if (arguments.length == 0) {
	            return this._thumbWidth;
	        } else {
	            this._thumbWidth = v;
	        }
	    },

	    thumbHeight: function (/* int */ v) {
	        if (arguments.length == 0) {
	            return this._thumbHeight;
	        } else {
	            this._thumbHeight = v;
	        }
	    },

	    mapScales: function(/* optional Array */ mapScales) {
	        if (mapScales.length == 0) return this._mapScales;
	        else {
	            this._mapScales = mapScales;
	            this.update();
	        }
	    },

	    _isThumbInAvailableRange: function(/* int */ v) {
	        return v >= 0 && v <= (10 * (this._mapScales.length-1));
	    },

	    _getScaleLevelByMapScale: function(/* number */ v) {
	        var minGap = Number.MAX_VALUE;;
	        var result = -1;
	        var mapScales = this._mapScales;
	        var cntScales = mapScales.length;

	        for (var i = 0; i < cntScales; i++) {
	            var mapScale = mapScales[i];
	            var gap = Math.abs(v - mapScale);
	            if (gap < minGap) {
	                minGap = gap;
	                result = i;
	            }
	        }

	        return result;
	    },

	    scaleLevel: function(/* option */ v) {
	        if(arguments.length == 0) {
	            return this._getScaleLevel(this._thumbY);
	        } else {
	            var oldLvl = this.scaleLevel();
	            if (oldLvl != v) {
	                this._setScaleLevel(v, true);
	            }
	        }
	    },

	    _getScaleLevel: function(/* int */ v) {
	        return parseInt(Math.round(v / 10));
	    },

	    _setScaleLevel: function (/* int */ v, /* bMapScaleChange */ bChange) {
	        if (v >= 0 && v < this._mapScales.length) {
	            if (this._thumbDiv) {
	                this._thumbY = v * 10;
	                this._thumbDiv.style.top = (this._thumbY + (55 - this.thumbHeight() / 2)) + "px";
	            }

	            if (bChange) {
	                var cm = this._map.coordMapper();
	                var mapScale = this._mapScales[v];
	                cm.zoomByMapScale(mapScale);
	                this._map.update();
	            }
	        }
	    },

	    _getBarHeight: function() {
	        var cntScales = this._mapScales.length;
	        var barHeight = 10 * (cntScales-1) + 25 * 2;
	        return barHeight;
	    },

	    /* DIV */ _createThumb: function () {
	        var div = document.createElement("div");
	        div.style.position = "absolute";
	        
	        div.style.width = "28px";
	        div.style.height = "14px";
	        //div.style.border = "1px solid red";
	        
	        var svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");

	        svg.style.position = "absolute";
	        svg.style.top = "0px";
	        svg.style.left = "0px";
	        svg.style.width = "28px";
	        svg.style.height = "14px";
	        //svg.style.border = "1px solid blue";
	        svg.style.setProperty("pointer-events", "none");

            var thumbWidth = 28;
	        var thumbHeight = 14;
	        var bar = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "rect");
            var that = this;

            div.style.top = (this._thumbY + (55 - thumbHeight / 2)) + "px";
            div.style.left = (30 - thumbWidth / 2) + "px";

            that.__onThumbMouseDown = function (e) {
                //console.log("MouseDown");
                if (!that._mouseDown) {
                    e.stopPropagation();
                    //e.cancelBubble = true;
                    //e.preventDefault();

                    if (div.setCapture) div.setCapture();

                    that._mouseDownPt.set(e.clientX, e.clientY);
                    that._mouseDown = true;
                }
	        };

            that.__onThumbMouseMove = function (e) {
                //console.log("MouseMove");
	            e.stopPropagation();
	            //e.cancelBubble = true;
	            //e.preventDefault();
	            
	            if (that._mouseDown) {
	                var proThumbY = that._thumbY + (e.clientY - that._mouseDownPt.y);
	                if (that._isThumbInAvailableRange(proThumbY)) {
	                    that._thumbY += (e.clientY - that._mouseDownPt.y);
	                    div.style.top = (that._thumbY + (55 - that.thumbHeight() / 2)) + "px";
	                }
	            }

	            that._mouseDownPt.y = e.clientY;
	        };
            
            that.__onThumbMouseUp = function (e) {
                //console.log("MouseUp");
	            if (that._mouseDown) {
	                e.stopPropagation();
	                //e.cancelBubble = true;
	                //e.preventDefault();

	                var lvl = that._getScaleLevel(that._thumbY);
	                that._setScaleLevel(lvl, true);

	                that._mouseDown = false;
	                if (div.releaseCapture) div.releaseCapture();
	            }
	        };

	        div.addEventListener("mousedown", that.__onThumbMouseDown, false);
	        div.addEventListener("mouseup", that.__onThumbMouseUp, false);
	        div.addEventListener("mousemove", that.__onThumbMouseMove, false);

	        bar.setAttribute("x", 0);
	        bar.setAttribute("y", 0);
	        bar.setAttribute("rx", 5);
	        bar.setAttribute("ry", 5);
	        bar.setAttribute("width", thumbWidth);
	        bar.setAttribute("height", thumbHeight);
	        bar.setAttribute("fill", "#efefef");
	        bar.setAttribute("stroke", "#aaaaaa");
	        bar.setAttribute("stroke-width", 2);
	        svg.appendChild(bar);

	        var line1 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        line1.setAttribute("x1", -6+thumbWidth/2);
	        line1.setAttribute("y1", thumbHeight/2);
	        line1.setAttribute("x2", 6+thumbWidth/2);
	        line1.setAttribute("y2", thumbHeight/2);
	        line1.setAttribute("stroke", "#ffffff");
	        line1.setAttribute("stroke-width", 1);
	        svg.appendChild(line1);

	        var line2 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        line2.setAttribute("x1", -6+thumbWidth/2);
	        line2.setAttribute("y1", -1+thumbHeight/2);
	        line2.setAttribute("x2", 6+thumbWidth/2);
	        line2.setAttribute("y2", -1+thumbHeight/2);
	        line2.setAttribute("stroke", "#aaaaaa");
	        line2.setAttribute("stroke-width", 1);
	        svg.appendChild(line2);

	        var line3 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        line3.setAttribute("x1", -6+thumbWidth/2);
	        line3.setAttribute("y1", 1+thumbHeight/2);
	        line3.setAttribute("x2", 6+thumbWidth/2);
	        line3.setAttribute("y2", 1+thumbHeight/2);
	        line3.setAttribute("stroke", "#aaaaaa");
	        line3.setAttribute("stroke-width", 1);

	        svg.appendChild(line3);
	        div.appendChild(svg);

	        return div;
	    },

	    _createBar: function() {
	        var g = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "g");
	        var barHeight = this._getBarHeight();
	        var barWidth = 12;
	        var bar = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "rect");

	        bar.setAttribute("x", 30 - barWidth / 2);
	        bar.setAttribute("y", 30);
	        bar.setAttribute("width", barWidth);
	        bar.setAttribute("height", barHeight);
	        bar.setAttribute("fill", "#efefef");
	        bar.setAttribute("stroke", "#bbbbbb");
	        bar.setAttribute("stroke-width", 2);

	        g.appendChild(bar);

	        var cntScales = this._mapScales.length;
	        for (var i = 0; i < cntScales; i++) {
	            var tick = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	            tick.setAttribute("x1", 30 - 3);
	            tick.setAttribute("y1", 55 + i * 10);
	            tick.setAttribute("x2", 30 + 3);
	            tick.setAttribute("y2", 55 + i * 10);
	            tick.setAttribute("stroke", "#ababab");
	            tick.setAttribute("stroke-width", 1);

	            g.appendChild(tick);
	        }

	        var that = this;
	        that.__onBarMouseDown = function (e) {
	            e.stopPropagation();

	            var lvl = that._getScaleLevel(e.offsetY - 50);
	            if (lvl >= that._mapScales.length) lvl--;
	            else if (lvl < 0) lvl = 0;

	            that._setScaleLevel(lvl, true);
	        };

	        g.addEventListener('mousedown', that.__onBarMouseDown);

	        return g;
	    },

	    _createZoomIn: function() {
	        var g = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "g");

	        var circle = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "circle");
	        circle.setAttribute("cx", 30);
	        circle.setAttribute("cy", 30);
	        circle.setAttribute("r", 15);
	        circle.setAttribute("fill", "#efefef");
	        circle.setAttribute("stroke", "#bbbbbb");
	        circle.setAttribute("stroke-width", 2);

	        var lineV = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        lineV.setAttribute("x1", 30);
	        lineV.setAttribute("y1", 30-8);
	        lineV.setAttribute("x2", 30);
	        lineV.setAttribute("y2", 30+8);
	        lineV.setAttribute("stroke", "#ababab");
	        lineV.setAttribute("stroke-width", 2);

	        var lineH = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        lineH.setAttribute("x1", 30 - 8);
	        lineH.setAttribute("y1", 30);
	        lineH.setAttribute("x2", 30 + 8);
	        lineH.setAttribute("y2", 30);
	        lineH.setAttribute("stroke", "#ababab");
	        lineH.setAttribute("stroke-width", 2);

	        g.appendChild(circle);
	        g.appendChild(lineV);
	        g.appendChild(lineH);

	        var that = this;
	        that.__onZoomInMouseDown = function (e) {
	            e.stopPropagation();

	            var lvl = that._getScaleLevel(that._thumbY);
	            that._setScaleLevel(--lvl, true);
	        };

	        g.addEventListener('mousedown', that.__onZoomInMouseDown);

	        return g;
	    },

	    _createZoomOut: function (/* int */ cy) {
	        var g = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "g");

	        var circle = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "circle");
	        circle.setAttribute("cx", 30);
	        circle.setAttribute("cy", cy);
	        circle.setAttribute("r", 15);
	        circle.setAttribute("fill", "#efefef");
	        circle.setAttribute("stroke", "#bbbbbb");
	        circle.setAttribute("stroke-width", 2);

	        var lineH = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        lineH.setAttribute("x1", 30 - 8);
	        lineH.setAttribute("y1", cy);
	        lineH.setAttribute("x2", 30 + 8);
	        lineH.setAttribute("y2", cy);
	        lineH.setAttribute("stroke", "#ababab");
	        lineH.setAttribute("stroke-width", 2);

	        g.appendChild(circle);
	        g.appendChild(lineH);

	        var that = this;
	        that.__onZoomOutMouseDown = function (e) {
	            e.stopPropagation();

	            var lvl = that._getScaleLevel(that._thumbY);
	            that._setScaleLevel(++lvl, true);
	        };

	        g.addEventListener('mousedown', that.__onZoomOutMouseDown);

	        return g;
	    },

	    update: function () {
	        var svg = this._svg;

            // Remove all of SVG elements
	        var childNodes = svg.childNodes;
	        var cntChildNodes = childNodes.length;
	        var childNode;

	        for (var i = 0; i < cntChildNodes; i++) {
	            childNode = childNodes[0];
	            svg.removeChild(childNode);
	        }
	        // .

	        this._barG = this._createBar();
	        svg.appendChild(this._barG);

	        this._zoomInG = this._createZoomIn();
	        svg.appendChild(this._zoomInG);

	        this._zoomOutG = this._createZoomOut(this._getBarHeight() + 30);
	        svg.appendChild(this._zoomOutG);

	        //this._thumbDiv = this._createThumb();
	        //this.container().appendChild(this._thumbDiv);
	    },

	    prepare: function () {
	        var that = this;
	        that.__onMapScaleChanged = function (e) {
	            var map = that._map;
	            var coordMapper = map.coordMapper();
	            var mapScale = coordMapper.mapScale();
	            var iLevel = that._getScaleLevelByMapScale(mapScale);

	            that._setScaleLevel(iLevel);
	        };

	        this._map.addEventListener(Xr.Events.MapScaleChanged, that.__onMapScaleChanged);
	    },

	    release: function () {
	        if (this.__onMapScaleChanged) {
	            this._map.removeEventListener(Xr.Events.MapScaleChanged, this.__onMapScaleChanged);
	            delete this.__onMapScaleChanged;
	        }

	        if (this.__onThumbMouseDown) {
	            this._thumbDiv.removeEventListener("mousedown", this.__onThumbMouseDown);
	            delete this.__onThumbMouseDown;
	        }

	        if (this.__onThumbMouseMove) {
	            this._thumbDiv.removeEventListener("mousemove", this.__onThumbMouseMove);
	            delete this.__onThumbMouseMove;
	        }

	        if (this.__onThumbMouseUp) {
	            this._thumbDiv.removeEventListener("mouseup", this.__onThumbMouseUp);
	            delete this.__onThumbMouseUp;
	        }

	        if (this.__onZoomInMouseDown) {
	            this._zoomInG.removeEventListener("mousedown", this.__onZoomInMouseDown);
	            delete this.__onZoomInMouseDown;
	        }

	        if (this.__onZoomInMouseDown) {
	            this._zoomOutG.removeEventListener("mousedown", this.__onZoomInMouseDown);
	            delete this.__onZoomInMouseDown;
	        }

	        if (this.__onBarMouseDown) {
	            this._zoomOutG.removeEventListener("click", this.__onBarMouseDown);
	            delete this.__onBarMouseDown;
	        }
	    },

	    mouseDown: function (e) { },
	    mouseMove: function (e) { },
	    mouseUp: function (e) { },
	    click: function (e) { },
	    dblClick: function (e) { }
	}
});