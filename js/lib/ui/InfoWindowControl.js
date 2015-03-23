Xr.ui = Xr.ui || {};

/**  
 * @classdesc 정보를 지도 위에 표시하기 위한 윈도우 UI 컨트롤에 대한 클래스입니다. 표시되는 정보는 유연하게 HTML로 구성됩니다.
 * @class
 * @param {String} name - UI 컨트롤에 대한 식별자로써 고유해야 합니다.
 * @param {Xr.Map} map - UI 컨트롤과 상호작용을 하는 지도 객체
 * @param {Xr.PointD} position - 정보 윈도우가 표시될 지도 좌표입니다.
 * @param {String} innerHtml - 표시될 정보에 대한 HTML
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
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
	    //this._infoDiv.style.width = 365;
	    this._infoDiv.style.padding = "16px";
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

	    //this._closeBtnSvg.style.setProperty("border", "1px solid blue");
	    //this.container().style.setProperty("border", "1px solid red");
	    //this._infoDiv.style.setProperty("border", "1px solid yellow");
	    //this._skinSvg.style.setProperty("border", "1px solid green");

	},
 	
	methods: {
	    topMost: function () {
	        this.map().userControls().container().appendChild(this.container());
	    },

	    addEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
	        this.container().addEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
	    },

	    _createSkin: function() {
	        var infoW = this._infoDiv.clientWidth;// + parseFloat(this._infoDiv.style.padding)/2;
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
	        shape.setAttribute("fill", "#efefef");

	        svg.appendChild(shape);

	        var closeBtnPart1 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "circle");
	        var r = 12;
	        var cx = r;
	        var cy = r;

	        this._closeBtnSvg.style.top = 8;
	        this._closeBtnSvg.style.left = infoW - (r*2) - 8;
	        this._closeBtnSvg.style.width = r * 2;
	        this._closeBtnSvg.style.height = r * 2;

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

	        this.container().addEventListener("click", function (e) {
	            var lastChild = that.map().userControls().container().lastChild;
	            var thatChild = that.container();

	            if (thatChild != lastChild) that.topMost();

	            e.stopPropagation();
	        });

	        this._closeBtnSvg.addEventListener("mousedown", function (e) {
	            e.stopPropagation();
	        });

	        this._closeBtnSvg.addEventListener("click", function (e) {
	            e.stopPropagation();

	            var e = Xr.Events.create(Xr.Events.InfoWindowClosed, { name: that.name() });
	            Xr.Events.fire(that.container(), e);

	            that.map().userControls().remove(that.name());
	        });
	    },

	    infoDiv: function () {
	        return this._infoDiv;
	    },

	    update: function () {
	        var bSkinReady = this._skinSvg.childNodes.length > 0;
	        if(!bSkinReady) this._createSkin();

	        var infoDiv = this._infoDiv;
	        var coordMapper = this.map().coordMapper();
	        var vp = coordMapper.W2V(this._position);

	        var infoW = infoDiv.clientWidth;// + parseFloat(infoDiv.style.padding) * 2;
	        var infoH = infoDiv.clientHeight;

	        var offsetW = infoW / 2;
	        var offsetH = infoH + 30;
	        
	        var container = this.container();

	        container.style.left = vp.x - offsetW;
	        container.style.top = vp.y - offsetH;

	        container.style.visibility = "visible";
	        container.style.animationDuration = "0.6s";
	        container.style.animationName = "kf_tileMapShowing";

	        if (!container.style.height || container.style.height === "") {
	            container.style.width = infoDiv.clientWidth;
	            container.style.height = infoDiv.clientHeight + 30;
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