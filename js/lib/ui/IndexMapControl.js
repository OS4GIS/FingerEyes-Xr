/**  
 * @desc ui 네임스페이스입니다. 축척바, 인덱스맵, 줌레벨컨트롤 또는 사용자 정의 UI에 대한 클래스를 담고 있습니다.
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.ui = Xr.ui || {};

/**  
 * @classdesc 인덱스(Index Map) UI 컨트롤에 대한 클래스입니다.
 * @class
 * @param {String} name - UI 컨트롤에 대한 식별자로써 고유해야 합니다.
 * @param {Xr.Map} map - UI 컨트롤과 상호작용을 하는 지도 객체
 * @param {String} indexMapUrl - 인덱스맵에 표시되는 지도에 대한 연결 문자열에 대한 URL 입니다.
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
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
	    this._indexMapDiv.style.setProperty("pointer-events", "none");

	    this.container().appendChild(this._indexMapDiv);
	    this.container().style.bottom = 20;
	    this.container().style.right = 20;

	    this.container().style.width = 250;
	    this.container().style.height = 250;

	    //this.container().style.border = "1px solid green";

	    this._indexMap = new Xr.Map(this._indexMapDiv, {});
	    this._indexMapDiv.style.backgroundImage = "";

	    this._markerDiv = this.createMarkerDiv();
	    this.container().appendChild(this._markerDiv);

	    this._mouseDown = false;
	    this._mouseDownPt = new Xr.PointD();
	    this._bReadyLayer = false;

	    this.__onContainerMouseDown = function (e) {
	        e.stopPropagation();
	        e.preventDefault();
	    };

	    this.container().addEventListener("mousedown", this.__onContainerMouseDown);
	},
 	
	methods: {
	    /* DIV */ createMarkerDiv: function() {
	        var div = document.createElement("div");

	        div.style.position = "absolute";
	        div.style.top = 0;
	        div.style.left = 0;
	        div.style.width = 10;
	        div.style.height = 10;
	        div.style.opacity = 0.5;

	        var that = this;
	        
	        this.__onMarkerMouseDown = function (e) {
	            if (!that._mouseDown) {
	                e.stopPropagation();

	                if (div.setCapture) div.setCapture();

	                that._mouseDownPt.set(e.clientX, e.clientY);
	                that._mouseDown = true;
	            }
	        };

	        this.__onMarkerMouseMove = function (e) {
	            e.stopPropagation();

	            if (that._mouseDown) {
	                var offsetX = e.clientX - that._mouseDownPt.x;
	                var offsetY = e.clientY - that._mouseDownPt.y;

	                div.style.left = Xr.OperationHelper.valueFromPx(div.style.left) + offsetX;
	                div.style.top = Xr.OperationHelper.valueFromPx(div.style.top) + offsetY;

	                that._mouseDownPt.set(e.clientX, e.clientY);
	            }
	        };

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

	        div.addEventListener("mousedown", this.__onMarkerMouseDown);
	        div.addEventListener("mousemove", this.__onMarkerMouseMove);
	        div.addEventListener("mouseup", this.__onMarkerMouseUp);

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
	        var childNodes = div.childNodes;
	        var cntChildNodes = childNodes.length;
	        for (var i = 0; i < cntChildNodes; i++) {
	            div.removeChild(childNodes[0]);
	        }
	        // .

	        if (w < 4 || h < 4) {
	            div.style.left = ltv.x - 5;
	            div.style.top = ltv.y - 5;
	            div.style.width = w + 10;
	            div.style.height = h + 10;

	            div.style.border = "1px solid gray";
	            div.style.backgroundColor = "#ffffff"

	            var svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
	            svg.style.position = "absolute";
	            svg.style.top = "0px";
	            svg.style.left = "0px";
	            svg.style.overflow = "visible";
	            svg.style.setProperty("pointer-events", "none");
	            div.appendChild(svg);

	            var cx = w / 2.0 + 5;
	            var cy = h / 2.0 + 5;

	            var line1 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	            line1.setAttribute("x1", cx - 20);
	            line1.setAttribute("y1", cy);
	            line1.setAttribute("x2", cx + 20);
	            line1.setAttribute("y2", cy);
	            line1.setAttribute("stroke", "#ff0000");
	            line1.setAttribute("stroke-width", 1);
	            svg.appendChild(line1);

	            var line2 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	            line2.setAttribute("x1", cx);
	            line2.setAttribute("y1", cy - 20);
	            line2.setAttribute("x2", cx);
	            line2.setAttribute("y2", cy + 20);
	            line2.setAttribute("stroke", "#ff0000");
	            line2.setAttribute("stroke-width", 1);
	            svg.appendChild(line2);
	        } else {
	            div.style.left = ltv.x;
	            div.style.top = ltv.y;
	            div.style.width = w;
	            div.style.height = h;

	            div.style.border = "1px solid black";
	            div.style.backgroundColor = "#ffff00";
	        }
	    },

	    size: function(/* int */ w, /* int */ h) {
	        this.container().style.width = w;
	        this.container().style.height = h;
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
	        penForStroke.width(7);

	        brushForStroke.color('#ffffff');
	        brushForStroke.opacity(0.0);

	        lm.add(indexLyrForStroke);
            
            // This Layer
	        var indexLyr = new Xr.layers.ShapeMapLayer("layer", { url: this._indexMapUrl });
	        var theme = indexLyr.theme();
	        var pen = theme.penSymbol();
	        var brush = theme.brushSymbol();

	        this._indexMap.resize(this._indexMapDiv.clientWidth, this._indexMapDiv.clientHeight);

	        pen.color('#777777');
	        pen.width(2);

	        brush.color('#eeeeee');
	        brush.opacity(1);

	        lm.add(indexLyr);

	        this._indexMap.onLayersAllReady(function () {
	            var mbr = indexLyr.MBR();
	            var cm = that._indexMap.coordMapper();

	            cm.zoomByMBR(mbr);
	            cm.mapScale(cm.mapScale() * 1.2);
	            that._indexMap.update();

	            that._bReadyLayer = true;
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
        dblClick: function (e) {}
	}
});