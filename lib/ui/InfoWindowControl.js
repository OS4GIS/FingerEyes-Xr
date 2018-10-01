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

    construct: function (/* String */ name, /* Map */ map, /* PointD */ position, /* string */ innerHtml,
        /* optional object {width: "100px", height: "54px", repeat: false, zoom:0.5, borderColor: "#e74c3c", closeButtonColor: "#e74c3c", backgroundColor: "#ffffff"} */ option) {
	    Xr.ui.UserControl.call(this, name, map);

        this._infoDiv = document.createElement("div");

        //this._opBorderColor = "#e74c3c";
        //this._opCloseButtonColor = "#e74c3c";
        this._opBorderColor = "#000000";
        this._opCloseButtonColor = "#000000";
        this._opBackgroundColor = "#ffffff";
        this._hideCloseButton = false;
        this._animationEnable = true;

        if (option) {
            if (option.width) {
                this._infoDiv.style.width = option.width;
            }

            if (option.height) {
                this._infoDiv.style.height = option.height;
            }

            this._opRepeat = option.repeat ? option.repeat : false;

            this._opZoom = option.zoom ? option.zoom : 1;

            if (option.borderColor != undefined) this._opBorderColor = option.borderColor;
            if (option.closeButtonColor != undefined) this._opCloseButtonColor = option.closeButtonColor;
            if (option.backgroundColor != undefined) this._opBackgroundColor = option.backgroundColor;
            if (option.hideCloseButton != undefined) this._hideCloseButton = option.hideCloseButton;
            if (option.animationEnable != undefined) {
                this._animationEnable = option.animationEnable;
            }
        }

        this._strokeWidth = 3;

	    this._innerHtml = innerHtml;
	    this._position = position;

	    this._skinSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
	    this._skinSvg.style.position = "absolute";
	    this._skinSvg.style.top = 0;
	    this._skinSvg.style.left = 0;
        this._skinSvg.style.overflow = "visible";
        
        //this._skinSvg.style.setProperty("pointer-events", "none");

        this.container().appendChild(this._skinSvg);

        if (this._opZoom && this._opZoom != 1) {
            this.container().style.transform = "scale(" + this._opZoom + ", " + this._opZoom + ")";
            this.container().style.transformOrigin = "center bottom"; 
        }
        
	    this._infoDiv.style.position = "absolute";
	    this._infoDiv.style.top = 0;
        this._infoDiv.style.left = 0;
        
	    this._infoDiv.style.padding = "4px";//"16px";
	    this._infoDiv.style.setProperty("pointer-events", "auto");

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

	    var cont = this.container();

	    this.container().appendChild(this._infoDiv);

        if (!this._hideCloseButton) {
            this._closeBtnSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
            this._closeBtnSvg.style.position = "absolute";
            this._closeBtnSvg.style.overflow = "visible";
            this._closeBtnSvg.style.setProperty("pointer-events", "auto");

            cont.appendChild(this._closeBtnSvg);
        }

	    cont.style.visibility = "hidden";
	    cont.style.setProperty("pointer-events", "none");

	    //this._closeBtnSvg.style.setProperty("border", "1px solid blue");
	    //this.container().style.setProperty("border", "1px solid red");
	    //this._infoDiv.style.setProperty("border", "1px solid yellow");
	    //this._skinSvg.style.setProperty("border", "1px solid green");

	    cont.addEventListener('mousewheel', this._mouseWheel);
	    cont.addEventListener('DOMMouseScroll', this._mouseWheel);

	},
 	
    methods: {
	    _mouseWheel: function (e) {
	        e.stopPropagation();
	    },

	    topMost: function () {
	        this.map().userControls().container().appendChild(this.container());
	    },

	    addEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
	        this.container().addEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
	    },

        _createUpsideDownSkin: function() {
            var infoW = this._infoDiv.clientWidth;// + parseFloat(this._infoDiv.style.padding)/2;
            var infoH = this._infoDiv.clientHeight;
            var svg = this._skinSvg;

            var backgroundColor = this._opBackgroundColor;

            // Draw Skin
            var shape = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "path");

            var d = "M0 0 L" + (infoW/2-10) + " 0 L" + (infoW/2) + " -30" +
                " L" + (infoW / 2 + 10) + " 0 L" + infoW + " 0"+
                " L" + infoW + " " + infoH + " L0 " + infoH + " Z";

            shape.setAttribute("d", d);
            shape.setAttribute("stroke", this._opBorderColor);
            shape.setAttribute("stroke-width", this._strokeWidth);
            //shape.setAttribute("fill", "#efefef");
            shape.setAttribute("fill", backgroundColor);

            svg.appendChild(shape);

            var closeBtnPart1 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "circle");
            var r = 12;
            var cx = r;
            var cy = r;

            var that = this;

            if (!this._hideCloseButton) {
                this._closeBtnSvg.style.top = "8px";
                this._closeBtnSvg.style.left = (infoW - (r * 2) - 8) + "px";
                this._closeBtnSvg.style.width = (r * 2) + "px";
                this._closeBtnSvg.style.height = (r * 2) + "px";

                var closeButtonColor = this._opCloseButtonColor;

                closeBtnPart1.setAttribute("cx", cx);
                closeBtnPart1.setAttribute("cy", cy);
                closeBtnPart1.setAttribute("r", r);
                closeBtnPart1.setAttribute("stroke", closeButtonColor);//"#989898");
                closeBtnPart1.setAttribute("stroke-width", 3);
                closeBtnPart1.setAttribute("fill", backgroundColor);//"#efefef");
                this._closeBtnSvg.appendChild(closeBtnPart1);

                var closeButtonPart2 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
                closeButtonPart2.setAttribute("x1", cx - 5);
                closeButtonPart2.setAttribute("y1", cy - 5);
                closeButtonPart2.setAttribute("x2", cx + 5);
                closeButtonPart2.setAttribute("y2", cy + 5);
                closeButtonPart2.setAttribute("stroke", closeButtonColor);//"#989898");
                closeButtonPart2.setAttribute("stroke-width", 3);
                this._closeBtnSvg.appendChild(closeButtonPart2);

                var closeButtonPart3 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
                closeButtonPart3.setAttribute("x1", cx + 5);
                closeButtonPart3.setAttribute("y1", cy - 5);
                closeButtonPart3.setAttribute("x2", cx - 5);
                closeButtonPart3.setAttribute("y2", cy + 5);
                closeButtonPart3.setAttribute("stroke", closeButtonColor);//"#989898");
                closeButtonPart3.setAttribute("stroke-width", 3);
                this._closeBtnSvg.appendChild(closeButtonPart3);

                this._closeBtnSvg.addEventListener("mousedown", function (e) {
                    e.stopPropagation();
                });

                this._closeBtnSvg.addEventListener("click", function (e) {
                    e.stopPropagation();

                    var e = Xr.Events.create(Xr.Events.InfoWindowClosed, { name: that.name() });
                    Xr.Events.fire(that.container(), e);

                    that.map().userControls().remove(that.name());
                });
            }

            this.container().addEventListener("click", function (e) {
                var lastChild = that.map().userControls().container().lastChild;
                var thatChild = that.container();

                if (thatChild != lastChild) that.topMost();

                e.stopPropagation();
            });
        },

        _createSkin: function () {
	        var infoW = this._infoDiv.clientWidth;// + parseFloat(this._infoDiv.style.padding)/2;
	        var infoH = this._infoDiv.clientHeight;
	        var svg = this._skinSvg;

            var backgroundColor = this._opBackgroundColor;

	        // Draw Skin
            var shape = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "path");

            var d = "M0 0 L" + infoW + " 0 L" + infoW + " " + infoH +
                " L" + (infoW / 2 + 10) + " " + infoH + " L" + (infoW / 2) + " " + (infoH + 30) +
                " L" + (infoW / 2 - 10) + " " + infoH + " L0 " + infoH + " Z";

	        shape.setAttribute("d", d);
            shape.setAttribute("stroke", this._opBorderColor);
            shape.setAttribute("stroke-width", this._strokeWidth);
	        //shape.setAttribute("fill", "#efefef");
            shape.setAttribute("fill", backgroundColor);

	        svg.appendChild(shape);

	        var closeBtnPart1 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "circle");
	        var r = 12;
	        var cx = r;
	        var cy = r;

            var that = this;

            if (!this._hideCloseButton) {
                this._closeBtnSvg.style.top = "8px";
                this._closeBtnSvg.style.left = (infoW - (r * 2) - 8) + "px";
                this._closeBtnSvg.style.width = (r * 2) + "px";
                this._closeBtnSvg.style.height = (r * 2) + "px";

                var closeButtonColor = this._opCloseButtonColor;

                closeBtnPart1.setAttribute("cx", cx);
                closeBtnPart1.setAttribute("cy", cy);
                closeBtnPart1.setAttribute("r", r);
                closeBtnPart1.setAttribute("stroke", closeButtonColor);//"#989898");
                closeBtnPart1.setAttribute("stroke-width", 3);
                closeBtnPart1.setAttribute("fill", backgroundColor);//"#efefef");
                this._closeBtnSvg.appendChild(closeBtnPart1);

                var closeButtonPart2 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
                closeButtonPart2.setAttribute("x1", cx - 5);
                closeButtonPart2.setAttribute("y1", cy - 5);
                closeButtonPart2.setAttribute("x2", cx + 5);
                closeButtonPart2.setAttribute("y2", cy + 5);
                closeButtonPart2.setAttribute("stroke", closeButtonColor);//"#989898");
                closeButtonPart2.setAttribute("stroke-width", 3);
                this._closeBtnSvg.appendChild(closeButtonPart2);

                var closeButtonPart3 = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");
                closeButtonPart3.setAttribute("x1", cx + 5);
                closeButtonPart3.setAttribute("y1", cy - 5);
                closeButtonPart3.setAttribute("x2", cx - 5);
                closeButtonPart3.setAttribute("y2", cy + 5);
                closeButtonPart3.setAttribute("stroke", closeButtonColor);//"#989898");
                closeButtonPart3.setAttribute("stroke-width", 3);
                this._closeBtnSvg.appendChild(closeButtonPart3);

                this._closeBtnSvg.addEventListener("mousedown", function (e) {
                    e.stopPropagation();
                });

                this._closeBtnSvg.addEventListener("click", function (e) {
                    e.stopPropagation();

                    var e = Xr.Events.create(Xr.Events.InfoWindowClosed, { name: that.name() });
                    Xr.Events.fire(that.container(), e);

                    that.map().userControls().remove(that.name());
                });
            }

	        this.container().addEventListener("click", function (e) {
	            var lastChild = that.map().userControls().container().lastChild;
	            var thatChild = that.container();

	            if (thatChild != lastChild) that.topMost();

	            e.stopPropagation();
	        });
	    },

	    infoDiv: function () {
	        return this._infoDiv;
	    },

	    update: function () {
            var coordMapper = this.map().coordMapper();
            //var mapViewHeight = coordMapper.viewHeight();
            var vp = coordMapper.W2V(this._position);
            var infoDiv = this._infoDiv;
            var infoW = infoDiv.clientWidth;// + parseFloat(infoDiv.style.padding) * 2;
            var infoH = infoDiv.clientHeight;

            var bSkinReady = this._skinSvg.childNodes.length > 0;
            if (!bSkinReady) {
                this._bUpsideDown = (vp.y - infoH - 30) < 0;

                if (this._bUpsideDown) {
                    this._createUpsideDownSkin();
                } else {
                    this._createSkin();
                }
            }

	        var offsetW = infoW / 2;
	        var offsetH = infoH + 30;

            if (this._bUpsideDown) {
                offsetH = -30 - this._strokeWidth;
            }

	        var container = this.container();

	        container.style.left = (vp.x - offsetW) + "px";
            container.style.top = (vp.y - offsetH) + "px";

	        container.style.visibility = "visible";

            if (this._animationEnable == true) {
                if (this._opRepeat) {
                    container.style.animationDuration = "1.5s";
                    container.style.animationName = "kf_infoWindowShowingRepeat";
                    container.style.animationIterationCount = "infinite";
                    container.style.animationFillMode = "both";
                    container.style.animationDirection = "alternate";
                    //container.style.animationTimingFunction = "ease-in";
                } else {
                    container.style.animationDuration = "0.5s";
                    container.style.animationName = "kf_infoWindowShowing";
                }
            }

	        if (!container.style.height || container.style.height === "") {
	            container.style.width = infoDiv.clientWidth + "px";
	            container.style.height = (infoDiv.clientHeight + 30) + "px";
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
            var mouseState = this.map().coordMapper().mouseState;

            if (mouseState.bDown) {
	            //var offsetXY = Xr.OperationHelper.offsetXY(e);
                //var offsetX = offsetXY.x - mouseState.downAndMovePt.x;
                //var offsetY = offsetXY.y - mouseState.downAndMovePt.y;

                var screenXY = Xr.OperationHelper.screenXY(e);
                var deltaX = screenXY.x - mouseState.downAndMoveScreenPt.x;
                var deltaY = screenXY.y - mouseState.downAndMoveScreenPt.y;
                var container = this.container();

                container.style.left = (Xr.OperationHelper.valueFromPx(container.style.left) + deltaX) + "px";
                container.style.top = (Xr.OperationHelper.valueFromPx(container.style.top) + deltaY) + "px";
	        }
	    },

	    mouseUp: function (e) { },
	    click: function (e) { },
        dblClick: function (e) { },

        enableMouse: function (/* bool */ bEnable) { }
	}
});