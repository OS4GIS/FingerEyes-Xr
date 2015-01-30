Xr.ui = Xr.ui || {};

Xr.ui.InfoWindowControl = Xr.Class({
    name: "InfoWindowControl",
	extend: Xr.ui.UserControl,
	requires: [Xr.ui.IUserControl, Xr.IMouseInteraction],

	construct: function (/* String */ name, /* Map */ map, /* PointD */ position, /* string */ innerHtml) {
	    Xr.ui.UserControl.call(this, name, map);

	    this._innerHtml = innerHtml;
	    this._position = position;

	    this._skinSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
	    this._skinSvg.style.position = "absolute";
	    this._skinSvg.style.top = 0;
	    this._skinSvg.style.left = 0;
	    this._skinSvg.style.overflow = "visible";
        this._skinSvg.style.setProperty("pointer-events", "none");

	    this.container().appendChild(this._skinSvg);

	    this._infoDiv = document.createElement("div");
	    this._infoDiv.style.position = "absolute";
	    this._infoDiv.style.top = 0;
	    this._infoDiv.style.left = 0;
	    this._infoDiv.style.width = 365;
	    this._infoDiv.style.padding = "17px";
	    //this._infoDiv.style.setProperty("pointer-events", "none");

	    this._infoDiv.addEventListener("mousedown", function (e) {
	        e.stopPropagation();
	    });

	    this._infoDiv.addEventListener("mousemove", function (e) {
	        e.stopPropagation();
	    });

	    this._infoDiv.addEventListener("mouseup", function (e) {
	        e.stopPropagation();
	    });

	    this._infoDiv.innerHTML = this._innerHtml;

	    this.container().appendChild(this._infoDiv);

	    this._closeBtnSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
	    this._closeBtnSvg.style.position = "absolute";
	    this._closeBtnSvg.style.overflow = "visible";
	    this.container().appendChild(this._closeBtnSvg);

	    this.container().style.visibility = "hidden";

	    //
	    //this._closeBtnSvg.style.setProperty("border", "1px solid blue");
	    //this.container().style.setProperty("border", "1px solid red");
	    //this._infoDiv.style.setProperty("border", "1px solid yellow");
	    //this._skinSvg.style.setProperty("border", "1px solid green");

	},
 	
	methods: {
	    _createSkin: function() {
	        var infoW = this._infoDiv.clientWidth;
	        var infoH = this._infoDiv.clientHeight;
	        var svg = this._skinSvg;

	        // Draw Skin
	        var shape = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "path");
	        var d = "M0 0 L" + infoW + " 0 L" + infoW + " " + infoH +
                " L" + (infoW / 2 + 10) + " " + infoH + " L" + (infoW / 2) + " " + (infoH + 30) +
                " L" + (infoW / 2 - 10) + " " + infoH + " L0 " + infoH + " Z";

	        shape.setAttribute("d", d);
	        shape.setAttribute("stroke", "#454545");
	        shape.setAttribute("stroke-width", "1");
	        shape.setAttribute("fill", "#fefefe");

	        svg.appendChild(shape);

	        this._closeBtnSvg.style.top = 0;
	        this._closeBtnSvg.style.left = 0;

	        var closeBtnPart1 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "circle");
	        var r = 12;
	        var cx = infoW - r - 8;
	        var cy = r + 8;
	        closeBtnPart1.setAttribute("cx", cx);
	        closeBtnPart1.setAttribute("cy", cy);
	        closeBtnPart1.setAttribute("r", r);
	        closeBtnPart1.setAttribute("stroke", "#989898");
	        closeBtnPart1.setAttribute("stroke-width", 3);
	        closeBtnPart1.setAttribute("fill", "#efefef");
	        this._closeBtnSvg.appendChild(closeBtnPart1);

	        var closeButtonPart2 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        closeButtonPart2.setAttribute("x1", cx - 5);
	        closeButtonPart2.setAttribute("y1", cy - 5);
	        closeButtonPart2.setAttribute("x2", cx + 5);
	        closeButtonPart2.setAttribute("y2", cy + 5);
	        closeButtonPart2.setAttribute("stroke", "#989898");
	        closeButtonPart2.setAttribute("stroke-width", 3);
	        this._closeBtnSvg.appendChild(closeButtonPart2);

	        var closeButtonPart3 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
	        closeButtonPart3.setAttribute("x1", cx + 5);
	        closeButtonPart3.setAttribute("y1", cy - 5);
	        closeButtonPart3.setAttribute("x2", cx - 5);
	        closeButtonPart3.setAttribute("y2", cy + 5);
	        closeButtonPart3.setAttribute("stroke", "#989898");
	        closeButtonPart3.setAttribute("stroke-width", 3);
	        this._closeBtnSvg.appendChild(closeButtonPart3);
            
	        var that = this;
	        this._closeBtnSvg.addEventListener("mousedown", function (e) {
	            e.stopPropagation();
	        });

	        this._closeBtnSvg.addEventListener("click", function (e) {
	            e.stopPropagation();
	            that.map().userControls().remove(that.name());
	        });
	    },

	    update: function () {
	        var bSkinReady = this._skinSvg.childNodes.length > 0;
	        if(!bSkinReady) this._createSkin();

	        var coordMapper = this.map().coordMapper();
	        var vp = coordMapper.W2V(this._position);

	        var infoW = this._infoDiv.clientWidth;
	        var infoH = this._infoDiv.clientHeight;

	        var offsetW = infoW / 2;
	        var offsetH = infoH + 30;
	        
	        var container = this.container();

	        container.style.left = vp.x - offsetW;
	        container.style.top = vp.y - offsetH;

	        container.style.visibility = "visible";
	        container.style.animationDuration = "0.6s";
	        container.style.animationName = "kf_tileMapShowing";

	        if (!this.container().style.height || this.container().style.height === "") {
	            this.container().style.width = this._infoDiv.clientWidth;
	            this.container().style.height = this._infoDiv.clientHeight + 30;
	        }
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
	    },

	    mouseDown: function (e) { },

	    mouseMove: function (e) {
	        if (Xr.UserState.mouseDown) {
	            var offsetXY = Xr.OperationHelper.offsetXY(e);
	            var offsetX = offsetXY.x - Xr.UserState.mouseDownAndMovePt.x;
	            var offsetY = offsetXY.y - Xr.UserState.mouseDownAndMovePt.y;

	            this.container().style.left = Xr.OperationHelper.valueFromPx(this.container().style.left) + offsetX;
	            this.container().style.top = Xr.OperationHelper.valueFromPx(this.container().style.top) + offsetY;
	        }
	    },

	    mouseUp: function (e) { },
	    click: function (e) { },
	    dblClick: function (e) { }
	}
});